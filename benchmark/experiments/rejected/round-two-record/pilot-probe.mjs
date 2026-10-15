import assert from 'node:assert/strict'
import {readFileSync,writeFileSync,existsSync} from 'node:fs'
import {spawnSync} from 'node:child_process'
import {createHash} from 'node:crypto'
const root='/tmp/gpt-tokenizer-warm-record-loop',baseline='/tmp/gpt-warm-baseline-9e1420c-esm';
const node='/Users/bbrzoska/.vite-plus/js_runtime/node/26.12.0/bin/node',bun='/Users/bbrzoska/.bun/bin/bun';
const out='/tmp/gpt-warm-record-paired.json';assert(!existsSync(out));
const hash=v=>createHash('sha256').update(v).digest('hex');
const {documents}=await import(root+'/benchmark/experiments/protocol.mjs');
const result={kind:'exploratory unified null-prototype record paired trial',baselineCommit:'9e1420c',corpus:'old pre-sanitization pinned corpus; diagnostic only',corpusSHA256:hash(JSON.stringify(documents)),sourceSHA256:hash(readFileSync(root+'/src/BytePairEncodingCore.ts')),baselineCompiledSHA256:hash(readFileSync(baseline+'/BytePairEncodingCore.js')),candidateCompiledSHA256:hash(readFileSync(root+'/esm/BytePairEncodingCore.js')),scriptSHA256:hash(readFileSync(import.meta.filename)),complete:false,gates:[],samples:[]};
const save=()=>writeFileSync(out,JSON.stringify(result,null,2));
function run(e,args){const p=spawnSync(e,args,{encoding:'utf8',timeout:180000,maxBuffer:32000000,env:process.env});if(p.error)throw p.error;if(p.status!==0)throw Error(p.stderr||p.stdout);return p.stdout;}
for(const engine of [node,bun]){console.error('gate',engine);result.gates.push({engine,output:run(engine,['--expose-gc',root+'/benchmark/experiments/correctness.mjs',root+'/esm/encoding'])});save();}
for(const [engine,encoding,rounds] of [[node,'o200k_base',2],[bun,'o200k_base',2],[node,'cl100k_base',2],[bun,'cl100k_base',2]])for(let round=0;round<rounds;round++)for(const variant of round%2?['candidate','root']:['root','candidate']){
 console.error('measure',engine,encoding,round,variant);
 const config={entry:'candidate',candidate:(variant==='root'?baseline:root+'/esm')+'/encoding/'+encoding+'.js',round,encoding,minMs:encoding==='o200k_base' && engine===node ? 200:100,warmMs:encoding==='o200k_base' && engine===node ? 200:100,warmCalls:20,operations:['encode','count'],modes:['repeated']};
 const sample=JSON.parse(run(engine,['--expose-gc',root+'/benchmark/experiments/worker.mjs',JSON.stringify(config)]));result.samples.push({variant,engine,encoding,...sample});save();
}
result.complete=true;save();console.log(out);
