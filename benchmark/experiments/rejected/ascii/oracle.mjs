import assert from 'node:assert/strict';import{createHash}from'node:crypto';
const root='/tmp/gpt-tokenizer-encode-o200k';
const api=await import(root+'/esm/encoding/o200k_base.js');
const{get_encoding}=await import(root+'/benchmark/node_modules/tiktoken/tiktoken.cjs');const reference=get_encoding('o200k_base');
let seed=0x6f948d;const random=()=>seed=(Math.imul(seed,1664525)+1013904223)>>>0;
const inputs=["I'm HE'S we'd we've CAN'T they're ABCdef ABCDEF abc1234567",'!\r\n///abc\n\v\f  next','a\u0085b\ufeffc\u00a0d','abcé e\u0301 a中文 😀 abc\ud800x'];
for(let sample=0;sample<1500;sample++){let s='';for(let i=0;i<sample%257;i++)s+=String.fromCharCode(random()>>>25);inputs.push(s);}
const expected=inputs.map(s=>Array.from(reference.encode(s)));
for(const capacity of [0,1,64,100000]){api.setMergeCacheSize(capacity);api.clearMergeCache();for(let i=0;i<inputs.length;i++){assert.deepEqual(api.encode(inputs[i]),expected[i],`IDs cap${capacity} sample${i}`);assert.equal(api.countTokens(inputs[i]),expected[i].length,`count cap${capacity} sample${i}`);assert.deepEqual([...api.encodeGenerator(inputs[i])].flat(),expected[i],`generator cap${capacity} sample${i}`);}}
reference.free();console.log(JSON.stringify({passed:true,engine:process.version,bun:process.versions.bun,encoding:'o200k_base',inputs:inputs.length,capacities:[0,1,64,100000],oracle:'tiktoken1.0.22',sha256:createHash('sha256').update(JSON.stringify(inputs)).digest('hex')}));
