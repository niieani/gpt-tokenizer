#!/usr/bin/env python3
"""Machine-wide FIFO lease for benchmarks and CPU-heavy validation.

All worktrees share the same per-user queue under /tmp. The run lock is passed
to the child, so killing the wrapper cannot release it while the command lives.
"""
import argparse
import contextlib
import ctypes
import fcntl
import json
import os
from pathlib import Path
import signal
import subprocess
import sys
import time
import uuid

ROOT = Path('/tmp') / f'gpt-tokenizer-perf-queue-{os.getuid()}'
CANCEL_GRACE_SECONDS = 10


def adopt_orphans():
    # Linux otherwise reparents launcher grandchildren to PID 1. Becoming a
    # subreaper lets this wrapper reap them before releasing the machine lease.
    if sys.platform == 'linux':
        libc = ctypes.CDLL(None, use_errno=True)
        if libc.prctl(36, 1, 0, 0, 0) != 0:  # PR_SET_CHILD_SUBREAPER
            raise OSError(ctypes.get_errno(), 'Cannot enable child subreaping')


def group_exists(pgid):
    try:
        os.killpg(pgid, 0)
        return True
    except ProcessLookupError:
        return False


def reap_group(pgid):
    while True:
        try:
            pid, _ = os.waitpid(-pgid, os.WNOHANG)
            if pid == 0:
                return
        except ChildProcessError:
            return


@contextlib.contextmanager
def state_lock():
    with (ROOT / 'state.lock').open('a+') as guard:
        fcntl.flock(guard, fcntl.LOCK_EX)
        yield


def alive(pid):
    try:
        os.kill(pid, 0)
        return True
    except ProcessLookupError:
        return False


def clean_waiters():
    for path in ROOT.glob('ticket-*.json'):
        if not alive(json.loads(path.read_text())['pid']):
            path.unlink(missing_ok=True)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--label', default='benchmark')
    parser.add_argument('--status', action='store_true')
    parser.add_argument('command', nargs=argparse.REMAINDER)
    args = parser.parse_args()
    ROOT.mkdir(mode=0o700, exist_ok=True)
    if args.status:
        with state_lock():
            clean_waiters()
            for path in [ROOT / 'active.json', *sorted(ROOT.glob('ticket-*.json'))]:
                if path.exists():
                    print(path.name, path.read_text().strip())
        return 0
    command = args.command
    if command[:1] == ['--']:
        command = command[1:]
    if not command:
        parser.error('provide a command after --')
    adopt_orphans()
    # Nested builds/tests under a lease belong to the same scheduled job.
    inherited = os.environ.get('GPT_TOKENIZER_PERF_TOKEN')
    active = ROOT / 'active.json'
    if inherited and active.exists() and json.loads(active.read_text()).get('token') == inherited:
        return subprocess.call(command)
    ticket = None
    child = None
    acquired = False
    interrupted = None
    interrupted_at = None
    token = uuid.uuid4().hex
    metadata = dict(pid=os.getpid(), token=token, label=args.label, cwd=os.getcwd(), command=command)
    with state_lock():
        clean_waiters()
        counter = ROOT / 'counter'
        number = int(counter.read_text()) + 1 if counter.exists() else 1
        counter.write_text(str(number))
        ticket = ROOT / f'ticket-{number:012d}-{os.getpid()}.json'
        ticket.write_text(json.dumps(metadata))
    print(f'[perf queue] ticket {number}: {args.label}', file=sys.stderr, flush=True)

    def stop(signum, _frame):
        # Never call Popen.wait/poll from a signal handler: it can interrupt a
        # wait holding Popen's non-reentrant waitpid lock and deadlock itself.
        nonlocal interrupted, interrupted_at
        interrupted = signum
        interrupted_at = time.monotonic()
        if child is not None:
            try:
                os.killpg(child.pid, signal.SIGTERM)
            except ProcessLookupError:
                pass

    for sig in (signal.SIGTERM, signal.SIGINT):
        signal.signal(sig, stop)
    try:
        with (ROOT / 'run.lock').open('a+') as lease:
            while not acquired:
                if interrupted:
                    raise KeyboardInterrupt
                with state_lock():
                    clean_waiters()
                    if sorted(ROOT.glob('ticket-*.json'))[:1] == [ticket]:
                        try:
                            fcntl.flock(lease, fcntl.LOCK_EX | fcntl.LOCK_NB)
                            acquired = True
                        except BlockingIOError:
                            pass
                        if acquired:
                            active.write_text(json.dumps(metadata))
                            ticket.unlink()
                if not acquired:
                    time.sleep(0.2)
            print(f'[perf queue] acquired {number}: {args.label}', file=sys.stderr, flush=True)
            env = {**os.environ, 'GPT_TOKENIZER_PERF_TOKEN': token,
                   'GPT_TOKENIZER_PERF_LEASE': str(active)}
            if interrupted:
                raise KeyboardInterrupt
            child = subprocess.Popen(command, env=env, start_new_session=True,
                                     pass_fds=(lease.fileno(),))
            if interrupted:
                stop(interrupted, None)
            while True:
                try:
                    code = child.wait(timeout=0.2)
                    break
                except subprocess.TimeoutExpired:
                    if interrupted_at and time.monotonic() - interrupted_at > CANCEL_GRACE_SECONDS:
                        try:
                            os.killpg(child.pid, signal.SIGKILL)
                        except ProcessLookupError:
                            pass
            # A launcher can exit before its workers. Keep the lease until its
            # whole group is gone, escalating cancellation for stubborn workers.
            while True:
                reap_group(child.pid)
                if not group_exists(child.pid):
                    break
                if interrupted_at and time.monotonic() - interrupted_at > CANCEL_GRACE_SECONDS:
                    try:
                        os.killpg(child.pid, signal.SIGKILL)
                    except ProcessLookupError:
                        pass
                time.sleep(0.05)
            if interrupted:
                return 128 + interrupted
            return code if code >= 0 else 128 - code
    except KeyboardInterrupt:
        return 130
    finally:
        with state_lock():
            ticket.unlink(missing_ok=True)
            if acquired and active.exists() and json.loads(active.read_text()).get('token') == token:
                active.unlink()
        print(f'[perf queue] released {number}: {args.label}', file=sys.stderr, flush=True)


if __name__ == '__main__':
    sys.exit(main())
