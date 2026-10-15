import assert from 'node:assert/strict';import{readFileSync,writeFileSync,existsSync}from'node:fs';import{createHash}from'node:crypto';import{spawnSync}from'node:child_process';
const root='/tmp/gpt-tokenizer-encode-o200k', before='/tmp/gpt-ascii-root-bb5ec5a-esm';
const node=process.env.NODE_BINARY||process.execPath,bun=process.env.BUN_BINARY||'bun';
const output='/tmp/gpt-ascii-scanner-paired.json';assert.ok(!existsSync(output),'Never overwrite previous data');
const hash=s=>createHash('sha256').update(s).digest('hex');
const{documents}=await import(root+'/benchmark/experiments/protocol.mjs');
const result={kind:'finite paired scanner experiment; no headline rank claim',baselineCommit:'bb5ec5a',rootSnapshot:before,corpusSHA256:hash(JSON.stringify(documents)),source:{core:hash(readFileSync(root+'/src/BytePairEncodingCore.ts')),scanner:hash(readFileSync(root+'/src/asciiO200k.ts')),compiledCore:hash(readFileSync(root+'/esm/BytePairEncodingCore.js')),compiledScanner:hash(readFileSync(root+'/esm/asciiO200k.js')),rootCore:hash(readFileSync(before+'/BytePairEncodingCore.js')),script:hash(readFileSync(import.meta.filename))},gates:[],samples:[],complete:false};
const save=()=>writeFileSync(output,JSON.stringify(result,null,2));
function run(executable,args,timeout=600000){const p=spawnSync(executable,args,{encoding:'utf8',timeout,maxBuffer:32*1024*1024,env:process.env});if(p.error)throw p.error;if(p.status!==0)throw Error(p.stderr||p.stdout);return p.stdout;}
for(const engine of [node,bun]){
 console.error('[gate]',engine);
 result.gates.push({engine,kind:'full',output:run(engine,['--expose-gc',root+'/benchmark/experiments/correctness.mjs',root+'/esm/encoding'])});
 result.gates.push({engine,kind:'ASCII-cache-oracle',output:run(engine,['--expose-gc','/tmp/gpt-ascii-scanner-oracle.mjs'])});
}
const groups=[{engine:node,encoding:'o200k_base',rounds:3,minMs:200,warmMs:200,modes:['repeated','stream'],legacy:true},{engine:bun,encoding:'o200k_base',rounds:2,minMs:100,warmMs:100,modes:['repeated','stream'],legacy:true},{engine:node,encoding:'cl100k_base',rounds:1,minMs:100,warmMs:100,modes:['repeated'],legacy:true},{engine:bun,encoding:'cl100k_base',rounds:1,minMs:100,warmMs:100,modes:['repeated'],legacy:true}];
result.groups=groups;save();
for(const group of groups)for(let round=0;round<group.rounds;round++){
 const pair=round%2?['scanner','root']:['root','scanner'];const order=round%2?[...pair,'npm']:['npm',...pair];
 for(const variant of order){console.error('[measure]',group.engine,group.encoding,round,variant);const config={entry:variant==='npm'?'baseline':'candidate',candidate:(variant==='root'?before:root+'/esm')+'/encoding/'+group.encoding+'.js',round,encoding:group.encoding,minMs:group.minMs,warmMs:group.warmMs,warmCalls:20,operations:['encode','count'],modes:group.modes,legacy:group.legacy};const sample=JSON.parse(run(group.engine,['--expose-gc',root+'/benchmark/experiments/worker.mjs',JSON.stringify(config)]));result.samples.push({variant,engine:group.engine,encoding:group.encoding,...sample});save();}
}
result.complete=true;save();console.log(output);
