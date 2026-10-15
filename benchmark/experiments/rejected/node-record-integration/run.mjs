import assert from 'node:assert/strict'
import { spawnSync, execFileSync } from 'node:child_process'
import { readFileSync, writeFileSync, readdirSync, existsSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { parseArgs } from 'node:util'
import os from 'node:os'
import { fileURLToPath } from 'node:url'
import { documents, corpus, snapshots, sha256 } from '../protocol.mjs'
import { requirePerfLease } from '../../dist/perfLease.js'
import { tokenizers } from '../../dist/tokenizers.js'
requirePerfLease()
const root = resolve(dirname(fileURLToPath(import.meta.url)), '../../..')
const {values} = parseArgs({options:{output:{type:'string'},encoding:{type:'string',default:'o200k_base'},rounds:{type:'string',default:'5'},warm:{type:'string',default:'100'},min:{type:'string',default:'300'},entries:{type:'string',default:'frozen,candidate'},documents:{type:'string'},legacy:{type:'boolean',default:false},label:{type:'string',default:'paired exploratory engine-selected storage comparison'},frozen:{type:'string',default:'/tmp/gpt-warm-baseline-9e1420c-esm'}}})
assert(values.output && !existsSync(values.output), 'new --output required')
assert.equal(corpus.version,3,'Only sanitized corpus v3 is allowed')
assert(['o200k_base','cl100k_base'].includes(values.encoding))
assert(process.versions.bun ? process.versions.bun==='1.4.3' : process.version==='v26.12.0')
const rounds=Number(values.rounds),warmMs=Number(values.warm),minMs=Number(values.min),entries=values.entries.split(',')
assert(Number.isInteger(rounds)&&rounds>=2&&Number.isFinite(warmMs)&&warmMs>=50&&Number.isFinite(minMs)&&minMs>=100)
assert.equal(new Set(entries).size,entries.length);assert(entries.includes('frozen')&&entries.includes('candidate'))
const adapters=entries.filter(e=>!['candidate','frozen'].includes(e)).map(id=>{const adapter=tokenizers.find(t=>t.id===(id==='baseline'?'gpt-tokenizer:npm':id));assert(adapter&&adapter.encodings.includes(values.encoding),`unsupported adapter ${id}`);return {id,packageName:adapter.packageName,version:adapter.version}})
const documentIds=values.documents?.split(',')
const measured=values.legacy?Object.entries((await import('../../dist/datasets.js')).datasets).map(([id,{text}])=>({id:`legacy:${id}`,category:'legacy',text,stream:[text]})):documents.filter(({id})=>!documentIds||documentIds.includes(id))
if(documentIds)assert.equal(measured.length,documentIds.length)
const files=base=>Object.fromEntries(readdirSync(base,{recursive:true}).filter(p=>p.endsWith('.js')).sort().map(p=>[p,sha256(readFileSync(resolve(base,p)))]))
const candidateFiles=files(root+'/esm'),frozenFiles=files(values.frozen)
assert.equal(frozenFiles['BytePairEncodingCore.js'],'cc7036d186ecc6eda5df557fdd2ae62bb0f96150081e7044169a52b66ed16f7f')
const git=(...args)=>execFileSync('git',['-C',root,...args],{encoding:'utf8'}).trim()
const worker=fileURLToPath(new URL('./worker.mjs',import.meta.url))
const result={schema:'node-record-integration-v1',label:values.label,startedAt:new Date().toISOString(),complete:false,runtime:{node:process.version,bun:process.versions.bun??null,executable:process.execPath},adapters,configuration:{encoding:values.encoding,rounds,warmMs,minMs,warmCalls:20,operations:['encode','count'],modes:values.legacy?['repeated']:['repeated','stream'],entries,consume:'length',legacy:values.legacy},corpus:{version:corpus.version,sha256:sha256(readFileSync(new URL('../corpus.json',import.meta.url))),snapshots,documents:measured.map(({id,category,text,stream})=>({id,category,sha256:sha256(text),utf8Bytes:Buffer.byteLength(text),streamSha256:stream.map(sha256)}))},hardware:{cpus:os.cpus().map(({model,speed})=>({model,speed})),memoryBytes:os.totalmem(),release:os.release(),platform:process.platform,arch:process.arch},sources:{candidateCommit:git('rev-parse','HEAD'),candidateDirty:git('status','--porcelain'),candidateCoreSourceSHA256:sha256(readFileSync(root+'/src/BytePairEncodingCore.ts')),candidateFiles,frozenPublicSourceCommit:git('rev-parse','7cd2bed'),frozenFiles,driverSHA256:sha256(readFileSync(import.meta.filename)),workerSHA256:sha256(readFileSync(worker))},samples:[]}
for(let round=0;round<rounds;round++){
 const pair=round%2?['candidate','frozen']:['frozen','candidate'],others=entries.filter(e=>!pair.includes(e)),offset=round%(others.length+1)
 for(const entry of [...others.slice(0,offset),...pair,...others.slice(offset)]){
  console.error(values.label,round+1,rounds,entry)
  const config={entry,candidate:root+`/esm/encoding/${values.encoding}.js`,frozen:values.frozen+`/encoding/${values.encoding}.js`,round,encoding:values.encoding,minMs,warmMs,warmCalls:20,operations:['encode','count'],modes:result.configuration.modes,consume:'length',legacy:values.legacy,legacyOnly:values.legacy,documentIds}
  const child=spawnSync(process.execPath,['--expose-gc',worker,JSON.stringify(config)],{encoding:'utf8',env:process.env,timeout:600000,maxBuffer:32000000})
  if(child.error)throw child.error;assert.equal(child.status,0,child.stderr||child.stdout)
  const sample=JSON.parse(child.stdout);assert.equal(sample.verification.documents,measured.length)
  result.samples.push(sample);writeFileSync(values.output,JSON.stringify(result,null,2))
 }
}
result.complete=true;result.completedAt=new Date().toISOString();writeFileSync(values.output,JSON.stringify(result,null,2));console.log(values.output)
