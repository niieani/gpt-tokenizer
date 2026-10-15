import {readFileSync,writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
const root=process.env.BENCH_REPO_ROOT||process.cwd(),oracle=JSON.parse(readFileSync('/tmp/gpt-regex-semantic-oracle.json','utf8')),out={officialVersion:oracle.officialVersion,engine:process.versions.bun||process.versions.node,inputCount:oracle.inputs.length,variants:{}};
for(const[name,path]of Object.entries({root:root+'/esm',casefold:'/tmp/gpt-tokenizer-gates-o200k/esm'})){
 const variant={patternHash:createHash('sha256').update(readFileSync(path+'/encodingParams/constants.js')).digest('hex'),encodings:{}};
 for(const encoding of Object.keys(oracle.expected)){
  const {default:api}=await import(path+'/encoding/'+encoding+'.js'),failures=[];let totalFailures=0,knownLongS=0;
  for(let i=0;i<oracle.inputs.length;i++){
   const text=oracle.inputs[i],expected=oracle.expected[encoding][i],actual=api.encode(text);
   const ids=JSON.stringify(actual)===JSON.stringify(expected),count=api.countTokens(text)===expected.length;
   if(!ids||!count){totalFailures++;if(text.includes("'ſ"))knownLongS++;if(failures.length<30)failures.push({text,expected,actual,count});}
  }
  variant.encodings[encoding]={totalFailures,knownLongS,failures};
 }
 out.variants[name]=variant;
}
const file='/tmp/gpt-regex-semantic-'+(process.versions.bun?'bun':'node')+'.json';writeFileSync(file,JSON.stringify(out,null,2));console.log(JSON.stringify(out,null,2));
