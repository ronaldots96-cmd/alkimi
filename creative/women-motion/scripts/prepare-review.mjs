import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createRequire} from 'node:module';
import {execFileSync} from 'node:child_process';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const lp=path.resolve(root,'../..');
const kids=path.resolve(lp,'../Motion Kids/alkimi-motion');
const require=createRequire(path.join(kids,'package.json'));
const sharp=require('sharp');
for(const d of ['review/contact-sheets','review/reference','data','public/img','public/fonts']) fs.mkdirSync(path.join(root,d),{recursive:true});
const inventory=JSON.parse(fs.readFileSync(path.join(kids,'src/data/drive-photos-inventory.json')));
const esc=s=>String(s).replaceAll('&','&amp;').replaceAll('<','&lt;');
async function sheet(items,prefix,per=12){
 for(let p=0;p<items.length;p+=per){const chunk=items.slice(p,p+per);const c=[];const W=400,H=390,L=46,G=12,cols=3;
  for(let i=0;i<chunk.length;i++){const a=chunk[i];const x=G+(i%cols)*(W+G),y=G+Math.floor(i/cols)*(H+L+G);const b=await sharp(a.path).rotate().resize(W,H,{fit:'contain',background:'#17191e',withoutEnlargement:true}).jpeg().toBuffer();c.push({input:b,left:x,top:y});c.push({input:Buffer.from(`<svg width="${W}" height="${L}"><rect width="100%" height="100%" fill="#17191e"/><text x="8" y="20" fill="#f9e199" font-family="Arial" font-size="17">${esc(a.id)}  ${esc(a.label.slice(0,31))}</text><text x="8" y="39" fill="#f8faff" font-family="Arial" font-size="14">${esc(a.detail||'')}</text></svg>`),left:x,top:y+H});}
  await sharp({create:{width:cols*(W+G)+G,height:Math.ceil(chunk.length/cols)*(H+L+G)+G,channels:3,background:'#0d0f12'}}).composite(c).jpeg({quality:85}).toFile(path.join(root,`${prefix}-${Math.floor(p/per)+1}.jpg`));
 }
}
await sheet(inventory.map(a=>({id:a.id,label:a.original_filename,detail:`${a.width} x ${a.height}`,path:a.thumbnail})),'review/contact-sheets/drive');
const womenFiles=fs.readdirSync(path.join(lp,'assets/img')).filter(x=>/^women-.*-(1200|1000)\.webp$/.test(x));
await sheet(womenFiles.map((f,i)=>({id:`LP${i+1}`,label:f,detail:'Women LP',path:path.join(lp,'assets/img',f)})),'review/contact-sheets/lp',6);
const ff=path.join(kids,'node_modules/@remotion/compositor-win32-x64-msvc/ffmpeg.exe');
const fp=path.join(kids,'node_modules/@remotion/compositor-win32-x64-msvc/ffprobe.exe');
const refs=[];
for(const file of fs.readdirSync(path.join(kids,'out')).filter(x=>x.endsWith('.mp4'))){const full=path.join(kids,'out',file);const probe=JSON.parse(execFileSync(fp,['-v','error','-show_format','-show_streams','-of','json',full],{encoding:'utf8'}));refs.push({file,...probe});}
fs.writeFileSync(path.join(root,'data/reference-probes.json'),JSON.stringify(refs,null,2));
for(const type of ['9x16','type_9x16']){const frames=[];for(const t of [1,3.5,5.5,11.8,16.8,23,25,32]){const out=path.join(root,`review/reference/${type}-${t}.jpg`);execFileSync(ff,['-y','-loglevel','error','-ss',String(t),'-i',path.join(kids,`out/alkimi_kids_energy_motion_v2_${type}.mp4`),'-frames:v','1','-vf','scale=270:480',out]);frames.push({id:`${t}s`,label:type,detail:'Approved Kids reference',path:out});}await sheet(frames,`review/reference/sheet-${type}`,8);}
for(const file of fs.readdirSync(path.join(lp,'assets/fonts')).filter(x=>x.endsWith('.woff2')))fs.copyFileSync(path.join(lp,'assets/fonts',file),path.join(root,'public/fonts',file));
fs.copyFileSync(path.join(lp,'assets/alkimi-logo.svg'),path.join(root,'public/alkimi-logo.svg'));
fs.writeFileSync(path.join(root,'data/drive-local-inventory.json'),JSON.stringify(inventory,null,2));
console.log(JSON.stringify({root,uniqueDrivePhotos:inventory.length,lpPhotos:womenFiles,referenceVideos:refs.map(r=>({file:r.file,frames:r.streams.find(s=>s.codec_type==='video').nb_frames,duration:r.format.duration}))},null,2));
