import React, {useEffect, useState} from 'react';
import {AbsoluteFill, Composition, Img, Sequence, cancelRender, continueRender, delayRender, interpolate, registerRoot, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import plan from '../data/edit-plan.json';

type Scene = typeof plan.concepts[number]['scenes'][number];
type Props = {concept: string; opening: 'photo'|'type'; debugSafeArea: boolean};
const C={dark:'#0D0F12',white:'#F8FAFF',blush:'#F2E3E0',rose:'#D8B4B0',deep:'#5E3A44',gold:'#F9E199'};
const clamp={extrapolateLeft:'clamp',extrapolateRight:'clamp'} as const;
const useFonts=()=>{const [handle]=useState(()=>delayRender('Alkimi official fonts'));useEffect(()=>{Promise.all([['Montserrat',300],['Montserrat',500],['Fustat',400],['Fustat',500],['Fustat',600]].map(async([family,weight])=>{const f=await new FontFace(String(family),`url(${staticFile(`fonts/${String(family).toLowerCase()}-latin-${weight}-normal.woff2`)})`,{weight:String(weight)}).load();document.fonts.add(f);})).then(()=>continueRender(handle)).catch(cancelRender);},[handle]);};
const Logo=()=> <div style={{width:552,height:72,background:C.white,WebkitMaskImage:`url(${staticFile('alkimi-logo.svg')})`,WebkitMaskSize:'contain',WebkitMaskRepeat:'no-repeat',maskImage:`url(${staticFile('alkimi-logo.svg')})`,maskSize:'contain',maskRepeat:'no-repeat'}}/>;
const Label:React.FC<{children:React.ReactNode;light?:boolean}>=({children,light})=><div style={{fontFamily:'Fustat',fontSize:25,fontWeight:600,letterSpacing:3,color:light?C.deep:C.rose,marginBottom:28}}>{children}</div>;
const Heading:React.FC<{lines:string[];accent:number;light?:boolean;size?:number}>=({lines,accent,light,size=71})=><div style={{fontFamily:'Montserrat',fontSize:size,fontWeight:300,lineHeight:1.12,letterSpacing:-1.7}}>{lines.map((line,i)=><div key={line} style={{color:i===accent?(light?C.deep:C.gold):(light?C.dark:C.white),fontWeight:i===accent?500:300}}>{line}</div>)}</div>;
const PhotoPanel:React.FC<{id:string;format:string;w:number;h:number;frame:number;duration:number}>=({id,format,w,h,frame,duration})=> <div style={{width:w,height:h,overflow:'hidden',borderRadius:18,background:C.dark}}><Img src={staticFile(`img/${id}-${format}.webp`)} style={{width:'100%',height:'100%',objectFit:'cover',transform:`scale(${interpolate(frame,[0,duration],[1,1.025],clamp)})`}}/></div>;

const TrainingCarousel:React.FC<{ids:string[];format:string;w:number;h:number;duration:number;light:boolean}>=({ids,format,w,h,duration,light})=>{
 const frame=useCurrentFrame();const slot=duration/ids.length;const current=Math.min(ids.length-1,Math.floor(frame/slot));
 const fraction=interpolate(frame,[current*slot,current*slot+6],[0,1],clamp);
 const eased=fraction*fraction*(3-2*fraction);const position=current===0?0:current-1+eased;
 const step=w+28;
 return <div style={{position:'absolute',left:0,width:1080,height:h+55,overflow:'hidden'}}>
  {ids.map((id,i)=><div key={id} style={{position:'absolute',left:(1080-w)/2+i*step-position*step,top:0,opacity:i===current?1:.68}}><PhotoPanel id={id} format={format} w={w} h={h} frame={Math.max(0,frame-i*slot)} duration={slot}/></div>)}
  <div style={{position:'absolute',top:h+28,left:0,width:1080,display:'flex',justifyContent:'center',gap:12}}>{ids.map((id,i)=><div key={id} style={{height:4,width:i===current?56:20,borderRadius:8,background:i===current?(light?C.deep:C.gold):(light?'#b59999':'#645a56')}}/>)}</div>
 </div>;
};

const SceneView:React.FC<{scene:Scene;opening:Props['opening'];isFirst:boolean}>=({scene,opening,isFirst})=>{
 const f=useCurrentFrame(),{fps,height}=useVideoConfig();const feed=height===1350,format=feed?'4x5':'9x16';
 const isCta=scene.kind==='cta';const type=scene.kind==='type'||(isFirst&&opening==='type');
 const light=type||scene.kind==='carousel';
 const duration=Math.round((scene.to-scene.from)*fps);
 const entrance=spring({frame:f,fps,config:{damping:200},durationInFrames:16});
 const y=feed?140:326;const x=feed?90:94;const w=feed?900:825;
 return <AbsoluteFill style={{background:light?C.blush:C.dark,color:C.white,fontFamily:'Fustat'}}>
   <AbsoluteFill style={{background:light?'radial-gradient(ellipse at 92% 100%, #D8B4B050, transparent 65%)':'radial-gradient(ellipse at 10% 105%, #5E3A4455, transparent 65%)'}}/>
   <svg width="1080" height={height} style={{position:'absolute',left:0,top:0,opacity:light?.13:.08}}><circle cx="1110" cy={height-70} r="430" fill="none" stroke={light?C.deep:C.rose} strokeWidth="2"/><circle cx="1110" cy={height-70} r="540" fill="none" stroke={light?C.deep:C.rose} strokeWidth="2"/><path d={`M0 ${height-180} H1080`} stroke={light?C.deep:C.rose} strokeWidth="1"/></svg>
   {isCta?<>
     <div style={{position:'absolute',left:x,top:y+18,width:w}}><Logo/></div>
     <div style={{position:'absolute',left:x,top:y+178,width:w}}><Label>{scene.label}</Label><Heading lines={scene.lines} accent={1} size={85}/></div>
     <div style={{position:'absolute',left:x,top:y+490,width:w,background:'linear-gradient(115deg,#F9E199,#D9BC7A 85%,#b18c51)',borderRadius:12,height:104,display:'flex',justifyContent:'center',alignItems:'center',fontSize:40,fontWeight:600,color:C.dark}}>Book Now</div>
     <div style={{position:'absolute',left:x,top:y+636,width:w,fontSize:32,lineHeight:1.4,color:C.white}}>$20 commitment fee,<br/>credited toward your first month.</div>
   </>:type?<>
     <div style={{position:'absolute',left:x,top:feed?340:510,width:w,transform:`translateY(${(1-entrance)*22}px)`}}><Label light>{scene.label}</Label><Heading lines={scene.lines} accent={scene.accent} light size={isFirst?79:76}/><div style={{height:3,width:interpolate(f,[8,30],[60,260],clamp),background:C.deep,marginTop:48}}/></div>
   </>:scene.kind==='skills'?<>
     <div style={{position:'absolute',left:x,top:y+60,width:w}}><Label>{scene.label}</Label>{scene.lines.map((line,i)=><div key={line} style={{display:'flex',gap:30,alignItems:'center',borderBottom:'1px solid #40383b',height:155,opacity:interpolate(f,[i*23,i*23+10],[.35,1],clamp)}}><div style={{color:C.rose,fontSize:25}}>0{i+1}</div><div style={{fontFamily:'Montserrat',fontSize:68,fontWeight:i===2?500:300,color:i===2?C.gold:C.white}}>{line}</div></div>)}</div>
   </>:<>
     <div style={{position:'absolute',left:x,top:y,width:w,transform:`translateY(${(1-entrance)*18}px)`}}><Label light={light}>{scene.label}</Label><Heading lines={scene.lines} accent={scene.accent} light={light} size={scene.lines.length===3?65:71}/></div>
     <div style={{position:'absolute',left:0,top:feed?510:640,width:1080}}>{scene.kind==='carousel'?<TrainingCarousel ids={scene.photos!} format={format} w={feed?880:850} h={feed?600:520} duration={duration} light={light}/>:<div style={{marginLeft:feed?100:88}}><PhotoPanel id={scene.photo!} format={format} w={feed?880:850} h={feed?600:520} frame={f} duration={duration}/></div>}</div>
   </>}
   {!isFirst&&!isCta&&<AbsoluteFill style={{background:light?C.blush:C.dark,opacity:interpolate(f,[0,7],[1,0],clamp),pointerEvents:'none'}}/>}
 </AbsoluteFill>;
};

const Ad:React.FC<Props>=({concept,opening,debugSafeArea})=>{
 useFonts();const {height}=useVideoConfig();const data=plan.concepts.find(c=>c.id===concept)!;
 return <AbsoluteFill>{data.scenes.map((scene,i)=><Sequence key={scene.id} from={Math.round(scene.from*30)} durationInFrames={Math.round(scene.to*30)-Math.round(scene.from*30)}><SceneView scene={scene} opening={opening} isFirst={i===0}/></Sequence>)}{debugSafeArea&&<div style={{position:'absolute',left:height===1350?70:86,top:height===1350?80:307,width:height===1350?940:843,height:height===1350?1180:883,border:'3px solid #00d9a9',pointerEvents:'none'}}/>}</AbsoluteFill>;
};
const Root=()=> <>{plan.concepts.flatMap(c=>['9x16','4x5'].map(format=><Composition key={`${c.id}-${format}`} id={`women-${c.id}-${format}`} component={Ad} width={1080} height={format==='9x16'?1920:1350} fps={30} durationInFrames={Math.round(c.duration*30)} defaultProps={{concept:c.id,opening:'photo',debugSafeArea:false}}/>))}</>;
registerRoot(Root);
