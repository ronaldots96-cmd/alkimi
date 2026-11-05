import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {createRequire} from 'node:module';
import {execFileSync} from 'node:child_process';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const kids=path.resolve(root,'../../../Motion Kids/alkimi-motion'),modules=path.join(kids,'node_modules');
const require=createRequire(path.join(kids,'package.json'));
const {bundle}=require('@remotion/bundler');const {getCompositions,renderStill,renderMedia,openBrowser}=require('@remotion/renderer');const sharp=require('sharp');
const timing=JSON.parse(fs.readFileSync(path.join(root,'data/voice-guide-v2.json')));
const directory=path.join(root,'review/v2');fs.mkdirSync(directory,{recursive:true});fs.mkdirSync(path.join(directory,'stills'),{recursive:true});
const browserExecutable=path.join(modules,'.remotion/chrome-headless-shell/win64/chrome-headless-shell-win64/chrome-headless-shell.exe');
const ffprobe=path.join(modules,'@remotion/compositor-win32-x64-msvc/ffprobe.exe');
const serveUrl=await bundle({entryPoint:path.join(root,'src/v2/index.tsx'),rootDir:root,publicDir:path.join(root,'public'),outDir:path.join(root,'_cache/bundle-v2'),enableCaching:false,webpackOverride:cfg=>({...cfg,resolve:{...cfg.resolve,modules:[modules,'node_modules'],alias:{...cfg.resolve?.alias,react:path.join(modules,'react'),'react-dom':path.join(modules,'react-dom'),remotion:path.join(modules,'remotion')}}})});
const browser=await openBrowser('chrome',{browserExecutable});
const only=process.argv.find(x=>x.startsWith('--only='))?.split('=')[1];
const esc=t=>t.replaceAll('&','&amp;').replaceAll('<','&lt;');
try{
 const comps=await getCompositions(serveUrl,{puppeteerInstance:browser,browserExecutable});
 const completed=[];
 for(const c of timing.concepts.filter(c=>!only||c.id===only)){
  for(const format of ['9x16','4x5']){
   const composition=comps.find(v=>v.id===`women-${c.id}-v2-${format}`);
   if(process.argv.includes('--stills')){
    const samples=c.segments.flatMap(s=>s.kind==='carousel'?[.15,.49,.84].map(a=>({s,frame:Math.round(s.startFrame+(s.endFrame-s.startFrame)*a)})):s.kind==='coach'||s.kind==='begin'?[.25,.76].map(a=>({s,frame:Math.round(s.startFrame+(s.endFrame-s.startFrame)*a)})):[{s,frame:s.kind==='cta'?c.durationFrames-1:Math.round(s.startFrame+(s.endFrame-s.startFrame)*.65)}]);
    const parts=[],W=270,H=format==='9x16'?480:338,G=14,cols=4;
    for(let i=0;i<samples.length;i++){
     const a=samples[i],filename=`${c.id}-${format}-${i}.jpg`,file=path.join(directory,'stills',filename);
     await renderStill({serveUrl,composition,frame:a.frame,output:file,scale:.5,imageFormat:'jpeg',jpegQuality:95,puppeteerInstance:browser,browserExecutable});
     const x=G+(i%cols)*(W+G),y=64+Math.floor(i/cols)*(H+44+G);
     parts.push({input:await sharp(file).resize(W,H).toBuffer(),left:x,top:y});
     parts.push({input:Buffer.from(`<svg width="270" height="40"><text x="3" y="25" font-family="Arial" font-size="16" fill="#D9BC7A">${esc(a.s.id)} · ${(a.frame/30).toFixed(1)}s</text></svg>`),left:x,top:y+H});
    }
    parts.push({input:Buffer.from(`<svg width="1150" height="60"><text x="15" y="39" fill="#F9E199" font-family="Arial" font-size="25">${c.id.toUpperCase()} V2 · ${format} · NARRATED REVIEW</text></svg>`),left:0,top:0});
    await sharp({create:{width:cols*(W+G)+G,height:64+Math.ceil(samples.length/cols)*(H+44+G),channels:3,background:'#17191e'}}).composite(parts).jpeg({quality:93}).toFile(path.join(directory,`${c.id}-${format}-storyboard.jpg`));
    console.log(`Stills complete: ${c.id} ${format}`);
   }
   if(process.argv.includes('--videos')){
    const file=path.join(directory,`alkimi_women_${c.id.replaceAll('-','_')}_v2_${format}_review.mp4`);console.log(`Rendering ${file}`);
    let last=-1;await renderMedia({serveUrl,composition,outputLocation:file,codec:'h264',crf:19,pixelFormat:'yuv420p',colorSpace:'bt709',audioCodec:'aac',audioBitrate:'192k',sampleRate:48000,concurrency:3,puppeteerInstance:browser,browserExecutable,onProgress:({progress})=>{const step=Math.floor(progress*4);if(step>last){console.log(`${c.id} ${format}: ${Math.round(progress*100)}%`);last=step;}}});
    const probe=JSON.parse(execFileSync(ffprobe,['-v','error','-show_streams','-show_format','-of','json',file],{encoding:'utf8'}));completed.push({file,...probe});console.log(`Complete ${c.id} ${format}`);
   }
  }
  // Accurate continuous track captions, with source text instead of ASR spelling artifacts.
  const stamp=t=>{const ms=Math.round(t*1000);return `${String(Math.floor(ms/3600000)).padStart(2,'0')}:${String(Math.floor(ms/60000)%60).padStart(2,'0')}:${String(Math.floor(ms/1000)%60).padStart(2,'0')},${String(ms%1000).padStart(3,'0')}`;};
  const wrap=t=>{let lines=[''];for(const word of t.split(' ')){const i=lines.length-1;if((lines[i]+' '+word).trim().length>42)lines.push(word);else lines[i]=(lines[i]+' '+word).trim();}return lines.join('\n');};
  fs.writeFileSync(path.join(directory,`alkimi_women_${c.id.replaceAll('-','_')}_v2_en.srt`),c.segments.map((s,i)=>`${i+1}\n${stamp(s.words[0]?.start||s.start)} --> ${stamp(s.words.at(-1)?.end||s.voiceEnd)}\n${wrap(s.text)}\n`).join('\n'));
 }
 if(completed.length)fs.writeFileSync(path.join(directory,`probes${only?'-'+only:''}.json`),JSON.stringify(completed,null,2));
 if(process.argv.includes('--stills')&&(!only||only==='community')){
  const composition=comps.find(v=>v.id==='women-community-v2-9x16');
  await renderStill({serveUrl,composition:{...composition,props:{...composition.props,opening:'type'}},inputProps:{concept:'community',opening:'type',debugSafeArea:false},frame:45,output:path.join(directory,'community-type-hook.jpg'),scale:.5,imageFormat:'jpeg',puppeteerInstance:browser,browserExecutable});
  const hashes=[];for(const frame of [composition.durationInFrames-75,composition.durationInFrames-1]){const result=await renderStill({serveUrl,composition,frame,imageFormat:'png',scale:.5,puppeteerInstance:browser,browserExecutable});hashes.push({frame,hash:crypto.createHash('sha256').update(result.buffer).digest('hex')});}
  fs.writeFileSync(path.join(directory,'cta-hold-check.json'),JSON.stringify({endpointIdentical:hashes[0].hash===hashes[1].hash,hashes,voiceEnd:timing.concepts[0].voiceEnd,postVoiceHold:timing.concepts[0].hold,method:'Compare lossless rendered endpoints of final 75 frames. CTA/background implementation static throughout this interval.'},null,2));
 }
}finally{await browser.close({silent:true});}
