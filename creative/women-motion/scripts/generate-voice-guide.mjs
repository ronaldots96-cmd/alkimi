import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {createRequire} from 'node:module';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const require=createRequire(path.join(root,'_tools/tts/package.json'));
const {env}=await import(pathToFileURL(path.join(root,'_tools/tts/node_modules/@huggingface/transformers/dist/transformers.node.mjs')).href);
env.cacheDir=path.join(root,'_tools/tts/models');
const {KokoroTTS}=await import(pathToFileURL(path.join(root,'_tools/tts/node_modules/kokoro-js/dist/kokoro.js')).href);
const plan=JSON.parse(fs.readFileSync(path.join(root,'data/revision-v2.json')));
const dir=path.join(root,'public/vo/guide-v2');fs.mkdirSync(dir,{recursive:true});
const model='onnx-community/Kokoro-82M-v1.0-ONNX',voice='af_bella',sr=24000;
const tts=await KokoroTTS.from_pretrained(model,{dtype:'fp32',device:'cpu',progress_callback:p=>{if(p.status==='done')console.log('Cached model resource',p.file);}});
function wav(samples,file){const buffer=Buffer.alloc(44+samples.length*2);buffer.write('RIFF');buffer.writeUInt32LE(buffer.length-8,4);buffer.write('WAVE',8);buffer.write('fmt ',12);buffer.writeUInt32LE(16,16);buffer.writeUInt16LE(1,20);buffer.writeUInt16LE(1,22);buffer.writeUInt32LE(sr,24);buffer.writeUInt32LE(sr*2,28);buffer.writeUInt16LE(2,32);buffer.writeUInt16LE(16,34);buffer.write('data',36);buffer.writeUInt32LE(samples.length*2,40);for(let i=0;i<samples.length;i++)buffer.writeInt16LE(Math.round(Math.max(-1,Math.min(1,samples[i]))*32767),44+i*2);fs.writeFileSync(file,buffer);}
const output={version:2,guideOnly:true,model,voice,sampleRate:sr,speed:1,generationCredits:0,source:'https://github.com/hexgrad/kokoro/tree/main/kokoro.js',concepts:[]};
const memory=new Map();
for(const c of plan.concepts){
 let cursor=0;const chunks=[],segments=[];
 for(const s of c.segments){
  const key=crypto.createHash('sha256').update(model+voice+s.text).digest('hex').slice(0,16);
  let samples=memory.get(key);const cached=path.join(dir,`${key}.f32`);
  if(!samples){if(fs.existsSync(cached)){const b=fs.readFileSync(cached);samples=new Float32Array(b.buffer.slice(b.byteOffset,b.byteOffset+b.byteLength));}else{const audio=await tts.generate(s.text,{voice,speed:1});samples=audio.audio;fs.writeFileSync(cached,Buffer.from(samples.buffer,samples.byteOffset,samples.byteLength));}memory.set(key,samples);}
  // Trim only near-silent padding, never alter pitch or speaking rate.
  let first=0,last=samples.length-1;while(first<last&&Math.abs(samples[first])<.0015)first++;while(last>first&&Math.abs(samples[last])<.0015)last--;
  const lead=Math.max(0,first-Math.round(.07*sr)),end=Math.min(samples.length,last+Math.round(.12*sr));const trimmed=samples.slice(lead,end);
  const speaking=trimmed.length/sr;
  // Voice sets the pace. Preserve only a short breath, except carousel dwell.
  const minimum=s.kind==='carousel'?s.minSeconds:s.id==='hook'?2.3:0;
  const slot=Math.ceil(Math.max(minimum,speaking+.25)*30)/30;
  const count=Math.round(slot*sr);const padded=new Float32Array(count);padded.set(trimmed);
  chunks.push(padded);const startFrame=Math.round(cursor*30),endFrame=startFrame+Math.round(slot*30);
  segments.push({...s,start:cursor,end:cursor+slot,startFrame,endFrame,voiceEnd:cursor+(last-lead)/sr,voiceEndFrame:Math.ceil((cursor+(last-lead)/sr)*30),words:[]});
  cursor=endFrame/30;console.log(`${c.id}/${s.id}: ${speaking.toFixed(2)}s speech, ${slot.toFixed(2)}s slot`);
 }
 const final=segments.at(-1);const totalFrames=Math.max(Math.ceil((final.voiceEnd+plan.holdSeconds)*30),final.endFrame);const total=totalFrames/30;final.end=total;final.endFrame=totalFrames;
 const master=new Float32Array(Math.round(total*sr));let offset=0;for(const a of chunks){master.set(a,offset);offset+=a.length;}
 // Only prevent overload here; final loudness is measured/normalized separately.
 let peak=0;for(const v of master)peak=Math.max(peak,Math.abs(v));const gain=peak>.84?.84/peak:1;for(let i=0;i<master.length;i++)master[i]*=gain;
 const file=`vo/guide-v2/${c.id}-guide.wav`;wav(master,path.join(root,'public',file));
 output.concepts.push({id:c.id,audioFile:file,durationFrames:totalFrames,duration:total,voiceEnd:final.voiceEnd,hold:total-final.voiceEnd,segments});
}
fs.writeFileSync(path.join(root,'data/voice-guide-v2.json'),JSON.stringify(output,null,2));
console.log('All three narrated guides created locally. No paid API used.');
