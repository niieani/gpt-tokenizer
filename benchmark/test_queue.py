import os
from pathlib import Path
import signal
import subprocess
import sys
import tempfile
import time
import unittest

QUEUE = Path(__file__).with_name('queue.py')
ENTRY = """import importlib.util, pathlib, sys
spec=importlib.util.spec_from_file_location('perf_queue',sys.argv.pop(1))
module=importlib.util.module_from_spec(spec);spec.loader.exec_module(module)
module.ROOT=pathlib.Path(sys.argv.pop(1));module.CANCEL_GRACE_SECONDS=.3;sys.exit(module.main())
"""


class QueueTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.root = Path(self.temp.name)
        self.jobs = []

    def tearDown(self):
        for job in self.jobs:
            if job.poll() is None:
                job.terminate()
                job.wait(timeout=5)
            for pipe in (job.stdout, job.stderr):
                if pipe:
                    pipe.close()
        self.temp.cleanup()

    def job(self, label, code):
        env = {k: v for k, v in os.environ.items() if not k.startswith('GPT_TOKENIZER_PERF_')}
        proc = subprocess.Popen([sys.executable, '-c', ENTRY, str(QUEUE), str(self.root),
                                 '--label', label, '--', sys.executable, '-c', code],
                                env=env, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
        self.jobs.append(proc)
        return proc

    def wait_for(self, predicate):
        until = time.monotonic() + 5
        while not predicate():
            if time.monotonic() > until:
                self.fail('queue state did not settle')
            time.sleep(0.01)

    def test_fifo_and_exclusion(self):
        events = self.root / 'events'
        busy = self.root / 'busy'
        def code(label):
            return (f"import pathlib,time; p=pathlib.Path({str(busy)!r}); p.mkdir(); "
                    f"f=open({str(events)!r},'a'); f.write({label!r}+'\\n'); f.flush(); "
                    "time.sleep(.15); p.rmdir()")
        first = self.job('first', code('first'))
        self.wait_for(lambda: busy.exists())
        second = self.job('second', code('second'))
        self.wait_for(lambda: len(list(self.root.glob('ticket-*.json'))) == 1)
        third = self.job('third', code('third'))
        for job in [first, second, third]:
            _, error = job.communicate(timeout=10)
            self.assertEqual(job.returncode, 0, error)
        self.assertEqual(events.read_text().splitlines(), ['first', 'second', 'third'])

    def test_failure_does_not_block_next_job(self):
        bad = self.job('failure', 'raise SystemExit(7)')
        bad.communicate(timeout=5)
        self.assertEqual(bad.returncode, 7)
        good = self.job('next', 'print("ok")')
        output, _ = good.communicate(timeout=5)
        self.assertEqual(good.returncode, 0)
        self.assertEqual(output.strip(), 'ok')

    def test_child_keeps_lock_if_wrapper_is_killed(self):
        marker = self.root / 'child-started'
        done = self.root / 'child-done'
        first = self.job('killed-wrapper',
                         f"import pathlib,time; pathlib.Path({str(marker)!r}).touch(); "
                         f"time.sleep(.5); pathlib.Path({str(done)!r}).touch()")
        self.wait_for(marker.exists)
        os.kill(first.pid, signal.SIGKILL)
        first.wait(timeout=5)
        second = self.job('after-orphan',
                          f"import pathlib; assert pathlib.Path({str(done)!r}).exists()")
        _, error = second.communicate(timeout=5)
        self.assertEqual(second.returncode, 0, error)

    def test_nested_job_reuses_lease(self):
        nested = [sys.executable, '-c', ENTRY, str(QUEUE), str(self.root),
                  '--label', 'nested', '--', sys.executable, '-c', 'print("nested-ok")']
        outer = self.job('outer', f'import subprocess; raise SystemExit(subprocess.call({nested!r}))')
        output, error = outer.communicate(timeout=5)
        self.assertEqual(outer.returncode, 0, error)
        self.assertIn('nested-ok', output)

    def test_cancel_reaps_child_before_releasing_lease(self):
        marker = self.root / 'running'
        first = self.job('cancel',
                         f"import pathlib,time; pathlib.Path({str(marker)!r}).touch(); time.sleep(30)")
        self.wait_for(marker.exists)
        first.terminate()
        _, error = first.communicate(timeout=5)
        self.assertEqual(first.returncode, 128 + signal.SIGTERM, error)
        second = self.job('after-cancel', 'print("resumed")')
        output, error = second.communicate(timeout=5)
        self.assertEqual(second.returncode, 0, error)
        self.assertIn('resumed', output)

    @unittest.skipUnless(sys.platform == 'linux', 'Linux subreaper semantics')
    def test_cancel_waits_for_term_ignoring_grandchild(self):
        marker = self.root / 'grandchild'
        grandchild = ("import os,pathlib,signal,time; signal.signal(signal.SIGTERM,signal.SIG_IGN); "
                      f"pathlib.Path({str(marker)!r}).write_text(str(os.getpid())); time.sleep(30)")
        first = self.job('launcher',
                         f'import subprocess,sys,time; subprocess.Popen([sys.executable,"-c",{grandchild!r}]); time.sleep(30)')
        self.wait_for(marker.exists)
        pid = int(marker.read_text())
        second = self.job('after-grandchild',
                          f'import os\ntry: os.kill({pid},0)\nexcept ProcessLookupError: pass\nelse: raise SystemExit("worker still alive")')
        self.wait_for(lambda: len(list(self.root.glob('ticket-*.json'))) == 1)
        first.terminate()
        _, error = first.communicate(timeout=5)
        self.assertEqual(first.returncode, 128 + signal.SIGTERM, error)
        _, error = second.communicate(timeout=5)
        # The queued command may acquire only after the grandchild is reaped.
        self.assertEqual(second.returncode, 0, error)


if __name__ == '__main__':
    unittest.main()
