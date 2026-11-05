import React,{useEffect,useState} from 'react';
import {AbsoluteFill,Audio,Composition,Easing,Img,Sequence,cancelRender,continueRender,delayRender,interpolate,registerRoot,spring,staticFile,useCurrentFrame,useVideoConfig} from 'remotion';
import timing from '../../data/voice-guide-v2.json';
type Segment=typeof timing.concepts[number]['segments'][number];
type Props={concept:string;opening:'photo'|'type';debugSafeArea:boolean};
const C={ink:'#0D0F12',white:'#F8FAFF',gold:'#F9E199',goldMid:'#D9BC7A',rose:'#D8B4B0',deep:'#5E3A44',blush:'#F2E3E0'};
const clamp={extrapolateLeft:'clamp',extrapolateRight:'clamp'} as const;
const head=(size:number,weight=500):React.CSSProperties=>({fontFamily:'Montserrat',fontSize:size,fontWeight:weight,lineHeight:1.06,letterSpacing:-1.5});
const Gold:React.FC<{children:React.ReactNode}>=({children})=><span style={{color:C.gold}}>{children}</span>;
const useFonts=()=>{const [handle]=useState(()=>delayRender('Official Montserrat / Fustat'));useEffect(()=>{Promise.all([['Montserrat',300],['Montserrat',500],['Fustat',400],['Fustat',500],['Fustat',600]].map(async([family,weight])=>{const f=await new FontFace(String(family),`url(${staticFile(`fonts/${String(family).toLowerCase()}-latin-${weight}-normal.woff2`)})`,{weight:String(weight)}).load();document.fonts.add(f);})).then(()=>continueRender(handle)).catch(cancelRender);},[handle]);};
const Rise:React.FC<{at?:number;out?:number;children:React.ReactNode;style?:React.CSSProperties;first?:boolean}>=({at=0,out,children,style,first})=>{const f=useCurrentFrame();const p=first?1:spring({frame:f-at,fps:30,durationInFrames:14,config:{damping:200}});const a=out===undefined?1:interpolate(f,[out-5,out],[1,0],clamp);return <div style={{...style,opacity:p*a,transform:`translateY(${(1-p)*36}px)`}}>{children}</div>};
const Kicker:React.FC<{children:React.ReactNode}>=({children})=><div style={{fontFamily:'Fustat',fontWeight:600,fontSize:30,letterSpacing:4,color:C.gold,marginBottom:28}}>{children}</div>;
const Logo=()=> <div style={{width:560,height:73,background:C.white,WebkitMaskImage:`url(${staticFile('alkimi-logo.svg')})`,WebkitMaskSize:'contain',WebkitMaskRepeat:'no-repeat'}}/>;

function cue(s:Segment,text:string,fallback:number){
 const wanted=text.toLowerCase().replace(/[^a-z ]/g,'').trim().split(/\s+/);const ws=s.words as {word:string;start:number;end:number}[];
 for(let i=0;i<ws.length;i++){if(wanted.every((w,k)=>ws[i+k]?.word.toLowerCase().replace(/[^a-z]/g,'')===w))return Math.max(0,Math.round((ws[i].start-s.start)*30)-2);}
 return Math.round(fallback*30);
}
const Photo:React.FC<{s:Segment;feed:boolean;frame:number;h?:number}>=({s,feed,frame,h})=>{
 const duration=s.endFrame-s.startFrame;const zoom=interpolate(frame,[0,duration],[1.015,1.075],clamp);
 const defense=s.photo==='D049',height=h||(defense?(feed?1040:1320):(feed?1350:1920));
 return <><div style={{position:'absolute',inset:0,height,overflow:'hidden'}}><Img src={staticFile(`img/v2/${s.photo}-${feed?'feed':'portrait'}.webp`)} style={{width:'100%',height:'100%',objectFit:'cover',objectPosition:'center',transform:`scale(${zoom})`}}/></div><AbsoluteFill style={{background:`linear-gradient(180deg,rgba(13,15,18,.20) 0%,rgba(13,15,18,0) 30%,rgba(13,15,18,.08) 45%,rgba(13,15,18,.85) ${feed?'78%':'65%'},#0D0F12 100%)`}}/><AbsoluteFill style={{background:`linear-gradient(180deg,transparent ${feed?'47%':'41%'},rgba(13,15,18,.16) ${feed?'64%':'49%'},rgba(13,15,18,.75) ${feed?'82%':'61%'},rgba(13,15,18,.92) 100%)`}}/></>;
};
const Carousel:React.FC<{s:Segment;feed:boolean}>=({s,feed})=>{
 const f=useCurrentFrame(),ids=s.photos||[];const w=feed?630:640,h=feed?790:800;
 const duration=s.endFrame-s.startFrame,slot=duration/ids.length;const i=Math.min(ids.length-1,Math.floor(f/slot));
 const slide=i===ids.length-1?0:interpolate(f,[(i+1)*slot-8,(i+1)*slot],[0,1],{...clamp,easing:Easing.inOut(Easing.cubic)});
  const pos=i+slide;const entry=spring({frame:f,fps:30,durationInFrames:16,config:{damping:200}});return <div style={{position:'absolute',left:0,top:(feed?352:535)+(1-entry)*45,width:1080,height:h,opacity:entry}}>{ids.map((id,k)=>{const d=k-pos;if(Math.abs(d)>1.6)return null;const active=Math.max(0,1-Math.abs(d));return <div key={id} style={{position:'absolute',left:(1080-w)/2+d*(w+26),width:w,height:h,borderRadius:20,overflow:'hidden',filter:`brightness(${.40+active*.60})`,transform:`scale(${.93+active*.07})`,boxShadow:'0 30px 60px rgba(0,0,0,.45)'}}><Img src={staticFile(`img/v2/${id}-card.webp`)} style={{width:'100%',height:'100%',objectFit:'cover',transform:`scale(${interpolate(f,[k*slot,(k+1)*slot],[1,1.035],clamp)})`}}/></div>})}</div>;
};
const Block:React.FC<{s:Segment;feed:boolean;opening:Props['opening'];first:boolean;concept:string}>=({s,feed,opening,first,concept})=>{
 const f=useCurrentFrame(),x=feed?70:86,w=feed?940:843,top=feed?100:318,bottom=feed?1180:1186;
 const isType=s.kind==='begin'||s.kind==='confidenceHook'||(s.kind==='hero'&&opening==='type');
 const gradient=`radial-gradient(ellipse at 50% 38%,${C.deep} 0%,#241a20 45%,${C.ink} 80%)`;
 const second=cue(s,s.kind==='coach'?'Led':s.kind==='begin'?'Start':s.kind==='confidenceHook'?'One':'Learn',s.kind==='begin'?1.55:1.8);
 const textBase:React.CSSProperties={position:'absolute',left:x,width:w};
 const center:React.CSSProperties={...textBase,top:feed?360:520};
 return <AbsoluteFill style={{background:C.ink,color:C.white,fontFamily:'Fustat',overflow:'hidden'}}>
  {(s.kind==='cta'||isType||s.kind==='carousel')&&<AbsoluteFill style={{background:gradient}}/>}
  {s.photo&&!(s.kind==='hero'&&opening==='type')&&<Photo s={s} feed={feed} frame={f}/>}
  {s.kind==='hero'&&opening==='photo'&&<>
    <div style={{...textBase,top}}><Kicker>WOMEN'S JIU-JITSU · SOUTH AUSTIN</Kicker></div>
    <div style={{...textBase,top:bottom-219}}><Rise first><div style={head(76,300)}>Find women who</div></Rise><Rise at={cue(s,'have your back',.95)}><div style={{...head(102),marginTop:12}}><Gold>have your back.</Gold></div></Rise></div>
  </>}
  {s.kind==='hero'&&opening==='type'&&<div style={center}><Kicker>WOMEN'S JIU-JITSU · SOUTH AUSTIN</Kicker><Rise first><div style={head(92,300)}>Find women who</div></Rise><Rise at={cue(s,'have your back',.95)}><div style={head(112)}><Gold>have your<br/>back.</Gold></div></Rise></div>}
  {s.kind==='women'&&<div style={{...textBase,top:bottom-285}}><Rise at={0}><div style={head(86,300)}>Women's</div><div style={head(112)}><Gold>Jiu-Jitsu.</Gold></div></Rise><Rise at={cue(s,'Alkimi',1.6)}><div style={{fontSize:38,letterSpacing:3,marginTop:22}}>ALKIMI · SOUTH AUSTIN</div></Rise></div>}
  {s.kind==='coach'&&<div style={{...textBase,top:bottom-252,display:'grid'}}><Rise at={0} out={second} style={{gridArea:'1/1'}}><div style={head(96,300)}>A class<br/><Gold>just for women.</Gold></div></Rise><Rise at={second} style={{gridArea:'1/1'}}><div style={head(96,300)}>Led by a<br/><Gold>female coach.</Gold></div></Rise></div>}
  {s.kind==='carousel'&&<>
    <div style={{...textBase,top}}><Rise at={0}><div style={head(feed?80:86)}>{concept==='self-defense'?'Learn together.':'Train together.'}</div></Rise><Rise at={cue(s,concept==='self-defense'?'Support':'Cheer',1.1)}><div style={{...head(58,300),marginTop:16}}><Gold>{concept==='self-defense'?'Support each other.':'Cheer each other on.'}</Gold></div></Rise></div>
    <Carousel s={s} feed={feed}/>
  </>}
  {s.kind==='confidence'&&<div style={{...textBase,top:bottom-277}}><Rise at={0}><div style={head(90,300)}>Build</div><div style={head(112)}><Gold>confidence.</Gold></div></Rise><Rise at={cue(s,'one class',1.1)}><div style={{fontSize:48,marginTop:24}}>One class at a time.</div></Rise></div>}
  {s.kind==='confidenceHook'&&<div style={center}><Kicker>WOMEN'S JIU-JITSU</Kicker><Rise first><div style={head(96,300)}>Build</div></Rise><Rise at={cue(s,'confidence',.3)}><div style={head(112)}><Gold>confidence.</Gold></div></Rise><Rise at={second}><div style={{...head(66,300),marginTop:36}}>One class at a time.</div></Rise></div>}
  {s.kind==='begin'&&<div style={{...center,display:'grid'}}><Rise at={0} out={second} style={{gridArea:'1/1'}}><Kicker>START FROM ZERO</Kicker><div style={head(104,300)}>No experience<br/><Gold>needed.</Gold></div></Rise><Rise at={second} style={{gridArea:'1/1'}}><Kicker>YOUR FIRST STEP</Kicker><div style={head(104,300)}>Start at<br/><Gold>your own pace.</Gold></div></Rise></div>}
  {s.kind==='defenseHook'&&<div style={{...textBase,top:bottom-260,display:'grid'}}><Rise first out={second} style={{gridArea:'1/1'}}><div style={head(88,300)}>You don't need<br/>to be <Gold>stronger.</Gold></div></Rise><Rise at={second} style={{gridArea:'1/1'}}><div style={head(104,300)}>Learn<br/><Gold>what to do.</Gold></div></Rise></div>}
  {s.kind==='skills'&&<><AbsoluteFill style={{background:C.deep}}/><div style={{...textBase,top:feed?285:475}}><Kicker>PRACTICAL SELF-DEFENSE</Kicker>{['Break a grip.','Get back up.','Get away.'].map((v,i)=><Rise key={v} at={cue(s,v,i*1.15)}><div style={{display:'flex',alignItems:'center',gap:28,marginBottom:34}}><div style={{width:72,height:72,borderRadius:36,background:C.gold,color:C.ink,fontSize:33,display:'flex',alignItems:'center',justifyContent:'center',fontWeight:600}}>0{i+1}</div><div style={head(84,i===2?500:300)}>{i===2?<Gold>{v}</Gold>:v}</div></div></Rise>)}</div></>}
  {s.kind==='defensePractice'&&<div style={{...textBase,top:bottom-240}}><Rise at={0}><div style={head(96,300)}>{concept==='confidence'?'Practical skills.':'Technique.'}</div></Rise><Rise at={cue(s,concept==='confidence'?'Real':'guidance',1.4)}><div style={{...head(96),marginTop:12}}><Gold>{concept==='confidence'?'Real support.':'Guided practice.'}</Gold></div></Rise></div>}
  {s.kind==='cta'&&<div style={{...textBase,top:feed?205:348,textAlign:'center',display:'flex',flexDirection:'column',alignItems:'center'}}>
    <div style={head(96)}>BOOK YOUR<br/><Gold>TRIAL CLASS</Gold></div>
    <div style={{fontFamily:'Fustat',fontSize:32,letterSpacing:3,marginTop:28}}>WOMEN'S JIU-JITSU · SOUTH AUSTIN</div>
    <Rise at={8}><div style={{marginTop:44,padding:'27px 100px',borderRadius:999,background:'linear-gradient(120deg,#F9E199,#D9BC7A 75%,#ad8a50)',color:C.ink,fontFamily:'Montserrat',fontWeight:500,fontSize:52,transform:`scale(${f<s.voiceEndFrame-s.startFrame-8?1+.018*Math.max(0,Math.sin((f-20)/14)):1})`}}>Book Now</div></Rise>
    <div style={{fontSize:36,lineHeight:1.3,marginTop:38}}>$20 commitment fee,<br/>credited toward your first month.</div>
    <Rise at={18}><div style={{marginTop:64,padding:18}}><Logo/></div></Rise>
  </div>}
  {!first&&s.kind!=='cta'&&<AbsoluteFill style={{background:s.kind==='skills'?C.deep:C.ink,opacity:interpolate(f,[0,5],[.4,0],clamp),pointerEvents:'none'}}/>}
 </AbsoluteFill>;
};
const Transition:React.FC<{first:boolean;children:React.ReactNode}>=({first,children})=>{const f=useCurrentFrame();return <AbsoluteFill style={{opacity:first?1:interpolate(f,[0,6],[0,1],clamp)}}>{children}</AbsoluteFill>};
const Ad:React.FC<Props>=({concept,opening,debugSafeArea})=>{
 useFonts();const data=timing.concepts.find(c=>c.id===concept)!;const {height}=useVideoConfig();const feed=height===1350;
 return <AbsoluteFill><Audio src={staticFile(data.audioFile)}/>{data.segments.map((s,i)=><Sequence key={s.id} from={s.startFrame} durationInFrames={Math.min(s.endFrame+6,data.durationFrames)-s.startFrame}><Transition first={i===0}><Block s={s} feed={feed} opening={opening} first={i===0} concept={concept}/></Transition></Sequence>)}{debugSafeArea&&<div style={{position:'absolute',left:feed?70:86,top:feed?80:307,width:feed?940:843,height:feed?1180:883,border:'3px solid #00d9a9'}}/>}</AbsoluteFill>;
};
registerRoot(()=> <>{timing.concepts.flatMap(c=>['9x16','4x5'].map(format=><Composition key={`${c.id}-${format}`} id={`women-${c.id}-v2-${format}`} component={Ad} width={1080} height={format==='9x16'?1920:1350} fps={30} durationInFrames={c.durationFrames} defaultProps={{concept:c.id,opening:'photo',debugSafeArea:false}}/>))}</>);
