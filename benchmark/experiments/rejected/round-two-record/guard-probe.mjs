import assert from 'node:assert/strict'
import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { spawnSync } from 'node:child_process'
import { createHash } from 'node:crypto'
const root='/tmp/gpt-tokenizer-warm-record-loop'
const frozen='/tmp/gpt-warm-baseline-9e1420c-esm'
const node='/Users/bbrzoska/.vite-plus/js_runtime/node/26.12.0/bin/node'
const worker='/tmp/gpt-warm-record-guard-worker.mjs'
const output='/tmp/gpt-warm-record-confirm-guards.json'
assert(!existsSync(output))
const hash=x=>createHash('sha256').update(x).digest('hex')
const {documents}=await import(root+'/benchmark/experiments/protocol.mjs');const datasets=Object.fromEntries(documents.filter(({id})=>['support','european','readme.md'].includes(id)).map(d=>[d.id,d]))
const result={kind:'unranked longer short-support and European/README guards; do not pool with primary realistic run',baselineCommit:'9e1420c',candidateCommit:'c95d3a7',runtime:{version:process.version,bun:process.versions.bun??null},configuration:{rounds:5,minMs:500,warmMs:500,warmCalls:20,operations:['encode','count'],modes:['repeated','stream']},corpus:Object.fromEntries(Object.entries(datasets).map(([id,v])=>[id,{sha256:hash(v.text),utf8Bytes:Buffer.byteLength(v.text)}])),sources:{driver:hash(readFileSync(import.meta.filename)),worker:hash(readFileSync(worker)),frozenCore:hash(readFileSync(frozen+'/BytePairEncodingCore.js')),candidateCore:hash(readFileSync(root+'/esm/BytePairEncodingCore.js'))},samples:[],complete:false}
assert.equal(process.version,'v26.12.0');assert.equal(process.versions.bun,undefined)
for(let round=0;round<5;round++)for(const variant of round%2?['candidate','frozen']:['frozen','candidate']){
 console.error('legacy',round,variant)
 const config={entry:'candidate',candidate:(variant==='frozen'?frozen:root+'/esm')+'/encoding/o200k_base.js',round,encoding:'o200k_base',legacy:false,...result.configuration}
 const p=spawnSync(node,['--expose-gc',worker,JSON.stringify(config)],{env:process.env,encoding:'utf8',timeout:180000,maxBuffer:32000000})
 if(p.error)throw p.error
 assert.equal(p.status,0,p.stderr||p.stdout)
 const sample=JSON.parse(p.stdout);assert.equal(sample.verification.documents,3)
 result.samples.push({...sample,variant});writeFileSync(output,JSON.stringify(result,null,2))
}
result.complete=true;writeFileSync(output,JSON.stringify(result,null,2));console.log(output)
