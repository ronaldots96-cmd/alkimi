import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createRequire} from 'node:module';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const kids=path.resolve(root,'../../../Motion Kids/alkimi-motion');
const require=createRequire(path.join(kids,'package.json'));
const sharp=require('sharp');
const inv=JSON.parse(fs.readFileSync(path.join(root,'data/drive-local-inventory.json')));
const selection=JSON.parse(fs.readFileSync(path.join(root,'data/photo-selection.json')));
const current=JSON.parse(fs.readFileSync(path.join(root,'data/drive-current.json')));
const remote=Object.values(current).flat().filter(v=>v&&typeof v==='object'&&v.mime_type?.startsWith('image/'));
const known=new Set(inv.flatMap(p=>[p.source_file_id,...p.duplicate_sources.map(d=>d.source_file_id)]));
const delta={checked:current.checked,remotePhotoPlacements:remote.length,uniqueLocalPhotos:inv.length,localPlacements:known.size,missingLocally:remote.filter(f=>!known.has(f.id)).map(f=>({id:f.id,name:f.title}))};
fs.writeFileSync(path.join(root,'data/inventory-delta.json'),JSON.stringify(delta,null,2));
fs.mkdirSync(path.join(root,'review/selected-crops'),{recursive:true});
const manifest=[];
// Reviewed headroom corrections after inspecting the first crop sheets.
const reviewedBoxes={D051:[0.26,0.14,0.74,0.52],D002:[0.04,0.20,0.94,0.51],D016:[0.07,0.21,0.89,0.49],D005:[0.14,0.20,0.81,0.46],D049:[0.38,0.30,0.62,0.54]};
function fitBox(box,width,height,ratio){
 let [x,y,w,h]=box.map((v,i)=>v*(i%2===0?width:height));
 const cx=x+w/2,cy=y+h/2;
 if(w/h<ratio) w=h*ratio; else h=w/ratio;
 if(w>width){w=width;h=w/ratio;}
 if(h>height){h=height;w=h*ratio;}
 x=Math.max(0,Math.min(width-w,cx-w/2));y=Math.max(0,Math.min(height-h,cy-h/2));
 return {left:Math.round(x),top:Math.round(y),width:Math.floor(w),height:Math.floor(h)};
}
for(const p of selection.photos){
 const src=inv.find(a=>a.id===p.id);const meta=await sharp(src.decoded_path).metadata();const crops={};
 for(const [format,ratio] of [['9x16',850/520],['4x5',880/600]]){
  const box=fitBox(reviewedBoxes[p.id]||p.crop,meta.width,meta.height,ratio);const name=`${p.id}-${format}.webp`;
  await sharp(src.decoded_path).extract(box).resize({width:1300,withoutEnlargement:true}).toColourspace('srgb').webp({quality:88}).toFile(path.join(root,'public/img',name));
  crops[format]={box,file:`img/${name}`,width:1300,bytes:fs.statSync(path.join(root,'public/img',name)).size};
 }
 const weighted_score=p.scores.reduce((s,n,i)=>s+n*[15,10,20,20,25,10][i]/5,0);
 manifest.push({...p,crop:reviewedBoxes[p.id]||p.crop,weighted_score,source_file_id:src.source_file_id,source_path:src.source_path,original_filename:src.original_filename,decoded_source:src.decoded_path,source_hash:src.hash,derivatives:crops});
}
fs.writeFileSync(path.join(root,'data/photos.json'),JSON.stringify(manifest,null,2));
for(let page=0;page<2;page++){
 const rows=manifest.slice(page*4,page*4+4),parts=[];
 for(let r=0;r<rows.length;r++){const p=rows[r];
  for(let col=0;col<2;col++){const format=['9x16','4x5'][col];const buf=await sharp(path.join(root,'public',p.derivatives[format].file)).resize(550,340,{fit:'contain',background:'#0d0f12'}).jpeg().toBuffer();parts.push({input:buf,left:20+col*570,top:55+r*400});}
  const label=`${p.id} · ${p.original_filename} · Tier ${p.tier} · ${p.weighted_score}/100`;
  parts.push({input:Buffer.from(`<svg width="1120" height="45"><text x="0" y="30" fill="#F9E199" font-family="Arial" font-size="22">${label}</text></svg>`),left:20,top:10+r*400});
 }
 await sharp({create:{width:1160,height:1620,channels:3,background:'#0d0f12'}}).composite(parts).jpeg({quality:90}).toFile(path.join(root,`review/selected-crops/selected-${page+1}.jpg`));
}
console.log(JSON.stringify({delta,selected:manifest.map(p=>({id:p.id,tier:p.tier,score:p.weighted_score})),derivatives:manifest.length*2},null,2));
