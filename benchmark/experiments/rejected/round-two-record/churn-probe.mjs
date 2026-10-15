import assert from 'node:assert/strict'
import {createHash} from 'node:crypto'
import {readFileSync,writeFileSync,existsSync} from 'node:fs'
import {spawnSync} from 'node:child_process'
const root='/tmp/gpt-tokenizer-warm-record-loop',frozen='/tmp/gpt-warm-baseline-9e1420c-esm'
const node='/Users/bbrzoska/.vite-plus/js_runtime/node/26.12.0/bin/node',bun='/Users/bbrzoska/.bun/bin/bun'
const snapshot='/tmp/gpt-warm-record-churn-words.json',oracleFile='/tmp/gpt-warm-record-churn-oracle.bin',metaFile='/tmp/gpt-warm-record-churn-oracle.json',out='/tmp/gpt-warm-record-churn.json'
const hash=x=>createHash('sha256').update(x).digest('hex')
const [mode,variant,roundArg]=process.argv.slice(2)
const capacity=100000,total=500000,blockSize=500
function blocksFor(words){const blocks=[];for(let i=0;i<words.length;i+=blockSize)blocks.push({phase:Math.floor(i/capacity),text:words.slice(i,i+blockSize).join(' ')});return blocks}
function run(engine,args){const p=spawnSync(engine,args,{encoding:'utf8',timeout:120000,maxBuffer:32000000,env:process.env});if(p.error)throw p.error;assert.equal(p.status,0,p.stderr||p.stdout);return p.stdout}
if(mode==='driver'){
 assert(!existsSync(out))
 const words=[];for(let i=0;i<total;i++){let n=(i*100003)%308915776,s='';for(let j=0;j<6;j++){s=String.fromCharCode(97+n%26)+s;n=Math.floor(n/26)}words.push('qz'+s)}
 assert.equal(new Set(words).size,total);writeFileSync(snapshot,JSON.stringify(words))
 run(node,[import.meta.filename,'oracle'])
 const result={diagnostic:'unranked sustained unique-piece cache churn, not representative workload or headline rank',capacity,words:total,wordLength:8,blockSize,rounds:2,phases:'100k fill + four100k unique churn cycles; count after each encode is warm',corpusSHA256:hash(readFileSync(snapshot)),scriptSHA256:hash(readFileSync(import.meta.filename)),oracleSHA256:hash(readFileSync(oracleFile)),sourceCommits:{frozen:'9e1420c',candidate:'c95d3a7'},rows:[],complete:false}
 for(const engine of [node,bun])for(let round=0;round<2;round++)for(const variant of round%2?['candidate','frozen']:['frozen','candidate']){
  console.error('churn',engine,round,variant)
  result.rows.push(JSON.parse(run(engine,['--expose-gc',import.meta.filename,'worker',variant,''+round])))
  writeFileSync(out,JSON.stringify(result,null,2))
 }
 result.complete=true;writeFileSync(out,JSON.stringify(result,null,2));console.log(out);process.exit()
}
const words=JSON.parse(readFileSync(snapshot)),blocks=blocksFor(words)
if(mode==='oracle'){
 const {get_encoding}=await import(root+'/benchmark/node_modules/tiktoken/tiktoken.cjs');const api=get_encoding('o200k_base')
 const chunks=[],meta=[];let offset=0
 for(const block of blocks){const ids=api.encode(block.text);chunks.push(Buffer.from(ids.buffer,ids.byteOffset,ids.byteLength));meta.push({offset,count:ids.length});offset+=ids.length}
 const binary=Buffer.concat(chunks);writeFileSync(oracleFile,binary);writeFileSync(metaFile,JSON.stringify({sha256:hash(binary),blocks:meta}));api.free();process.exit()
}
const metadata=JSON.parse(readFileSync(metaFile)),binary=readFileSync(oracleFile);assert.equal(hash(binary),metadata.sha256)
const expected=new Uint32Array(binary.buffer,binary.byteOffset,binary.length/4)
const settle=async()=>{await new Promise(setImmediate);await new Promise(setImmediate);globalThis.gc?.()}
await settle();const before=process.memoryUsage(),base=variant==='candidate'?root+'/esm':frozen
const api=await import(base+'/encoding/o200k_base.js');api.setMergeCacheSize(capacity);await settle();const initialized=process.memoryUsage()
const core=api.default.bytePairEncodingCoreProcessor,lookup=core.bytePairStringRankEncoder
const lookupSize=()=>lookup instanceof Map?lookup.size:Object.keys(lookup).length
const vocabularySize=lookupSize(),phases=[];let at=0,peakSampledRSS=0,checksum=0
for(let phase=0;phase<5;phase++){
 let encodeMs=0,countMs=0,tokens=0
 for(let i=0;i<capacity/blockSize;i++,at++){
  const block=blocks[at],want=metadata.blocks[at]
  let t=performance.now();const ids=api.encode(block.text);encodeMs+=performance.now()-t
  t=performance.now();const count=api.countTokens(block.text);countMs+=performance.now()-t
  assert.equal(ids.length,want.count);assert.equal(count,want.count)
  for(let j=0;j<ids.length;j++)assert.equal(ids[j],expected[want.offset+j])
  assert(core.mergeCache.size<=capacity);assert.equal(core.mergeCacheKeys.length,core.mergeCache.size)
  checksum+=count;tokens+=count;peakSampledRSS=Math.max(peakSampledRSS,process.memoryUsage().rss)
 }
 assert.equal(core.mergeCache.size,capacity);assert.equal(lookupSize(),vocabularySize+capacity)
 await settle();phases.push({phase,encodeMs,countMs,tokens,cacheSize:core.mergeCache.size,memory:process.memoryUsage()})
}
console.log(JSON.stringify({variant,round:+roundArg,runtime:{node:process.version,bun:process.versions.bun??null},coreSHA256:hash(readFileSync(base+'/BytePairEncodingCore.js')),before,initialized,phases,peakSampledRSS,maxRSSKiB:process.resourceUsage().maxRSS,exactTokens:true,bounded:true,checksum}))
