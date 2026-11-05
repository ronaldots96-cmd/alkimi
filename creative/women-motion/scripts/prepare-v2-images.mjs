import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createRequire} from 'node:module';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const kids=path.resolve(root,'../../../Motion Kids/alkimi-motion');
const require=createRequire(path.join(kids,'package.json'));const sharp=require('sharp');
const inventory=JSON.parse(fs.readFileSync(path.join(root,'data/drive-local-inventory.json')));
const dir=path.join(root,'public/img/v2');fs.mkdirSync(dir,{recursive:true});
// Normalize x,y,width,height; all coordinates refer to corrected, original decodes.
// Portrait backgrounds protect faces above the headline zone, not just at center.
const specs={
 D051:{portrait:[.25,0,.75,1],feed:[.14,.16,.84,.79],card:[.26,.17,.74,.69]},
 D016:{portrait:[.05,0,.75,1],feed:[.02,.10,.96,.90],card:[.02,.18,.88,.83]},
 D002:{portrait:[0,0,.75,1],feed:[0,.12,1,.88],card:[0,.15,.85,.80]},
 D011:{portrait:[.18,.20,.60,.80],feed:[.14,.18,.77,.72],card:[.17,.24,.65,.61]},
 D005:{portrait:[.10,.12,.83,.83],feed:[.10,.16,.83,.58],card:[.10,.22,.85,.60]},
 D049:{portrait:[.25,.25,.75,.70],feed:[.25,.25,.75,.70],card:[.25,.27,.75,.70]},
 D054:{portrait:[.15,.32,.75,.68],feed:[.10,.33,.85,.64],card:[.10,.33,.85,.64]},
 D055:{portrait:[.10,.22,.75,.70],feed:[.02,.20,.96,.69],card:[.02,.23,.96,.69]}
};
const manifest=[];
for(const [id,variants] of Object.entries(specs)){
 const src=inventory.find(p=>p.id===id),m=await sharp(src.decoded_path).metadata();
 for(const [variant,box] of Object.entries(variants)){
  const extract={left:Math.round(box[0]*m.width),top:Math.round(box[1]*m.height),width:Math.floor(box[2]*m.width),height:Math.floor(box[3]*m.height)};
  extract.width=Math.min(extract.width,m.width-extract.left);extract.height=Math.min(extract.height,m.height-extract.top);
  const output=`${id}-${variant}.webp`;const dest=path.join(dir,output);
  await sharp(src.decoded_path).extract(extract).resize({height:variant==='portrait'?2200:variant==='feed'?1700:1400,withoutEnlargement:true}).toColourspace('srgb').webp({quality:90}).toFile(dest);
  const final=await sharp(dest).metadata();manifest.push({id,variant,source:src.decoded_path,extract,file:`img/v2/${output}`,width:final.width,height:final.height,bytes:fs.statSync(dest).size});
 }
}
fs.writeFileSync(path.join(root,'data/photo-crops-v2.json'),JSON.stringify(manifest,null,2));
console.log(`Prepared ${manifest.length} v2 image derivatives, original decodes untouched.`);
