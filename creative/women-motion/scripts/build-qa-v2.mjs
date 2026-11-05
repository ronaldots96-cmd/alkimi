import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const dir=path.join(root,'review/v2');
const load=p=>JSON.parse(fs.readFileSync(path.join(root,p)));
const timing=load('data/voice-guide-v2.json'),probes=load('review/v2/probes.json'),media=load('review/v2/encoded-media-checks.json'),hold=load('review/v2/cta-hold-check.json');
const copy=timing.concepts.flatMap(c=>c.segments.map(s=>s.text)).join('\n');
if(/free (trial|class)|[—–]|--|Discipline Is The Gold Within|Nicholas/i.test(copy))throw new Error('Copy rule failure');
if(probes.length!==6||media.length!==6)throw new Error('Six complete previews required');
const publicFiles=new Set(['alkimi-logo.svg']);
const photoIds=new Set();
for(const c of timing.concepts){
 let end=0;
 publicFiles.add(c.audioFile);
 for(const s of c.segments){
  if(s.startFrame!==end)throw new Error(`Gap ${c.id}/${s.id}`);
  end=s.endFrame;
  for(const id of (s.photos||[s.photo]).filter(Boolean)){
   photoIds.add(id);
   for(const variant of ['portrait','feed','card'])publicFiles.add(`img/v2/${id}-${variant}.webp`);
  }
 }
 if(end!==c.durationFrames||c.hold<2.5)throw new Error('Timing issue');
}
for(const family of ['montserrat','fustat'])for(const weight of family==='montserrat'?[300,500]:[400,500,600])publicFiles.add(`fonts/${family}-latin-${weight}-normal.woff2`);
for(const p of publicFiles)if(!fs.existsSync(path.join(root,'public',p)))throw new Error(`Missing asset ${p}`);
function atoms(file){const fd=fs.openSync(file,'r'),size=fs.statSync(file).size,items=[];let pos=0;try{while(pos+8<=size){const b=Buffer.alloc(16);fs.readSync(fd,b,0,16,pos);let n=b.readUInt32BE(0);const type=b.toString('ascii',4,8);if(n===1)n=Number(b.readBigUInt64BE(8));if(n===0)n=size-pos;if(n<8)throw new Error('Bad atom');items.push({type,offset:pos});pos+=n;}}finally{fs.closeSync(fd);}return items;}
const results=probes.map(p=>{
 const v=p.streams.find(s=>s.codec_type==='video'),a=p.streams.find(s=>s.codec_type==='audio');
 if(v.codec_name!=='h264'||a.codec_name!=='aac'||v.pix_fmt!=='yuv420p'||v.r_frame_rate!=='30/1'||v.width!==1080)throw new Error('Stream format issue');
 const m=media.find(m=>m.file===p.file);
 if(!m?.frameCountCorrect||!m?.constant30fpsPTS||m.nearBlackFrames.length)throw new Error('Encoded frame verification failure');
 const box=atoms(p.file),moov=box.find(x=>x.type==='moov'),mdat=box.find(x=>x.type==='mdat');
 return {filename:path.basename(p.file),width:v.width,height:v.height,frames:m.frames,duration:Number(p.format.duration),video:v.codec_name,pixelFormat:v.pix_fmt,colorSpace:v.color_space,audio:a.codec_name,sampleRate:a.sample_rate,channels:a.channels,LUFS:m.decodedIntegratedLUFS,truePeak4xDBTP:m.encodedAudioTruePeak4xDBTP,MB:m.bytes/1e6,faststart:moov.offset<mdat.offset};
});
const page=fs.readFileSync(path.join(dir,'index.html'),'utf8');
const links=[...page.matchAll(/(?:src|href)="([^"]+)"/g)].map(m=>m[1]).filter(p=>!/^https?:|^#/.test(p));
const missing=links.filter(p=>p!=='qa-report.md'&&!fs.existsSync(path.resolve(dir,p)));
if(missing.length)throw new Error(`Broken review links: ${missing}`);
fs.writeFileSync(path.join(dir,'qa-checks.json'),JSON.stringify({date:'2026-10-15',renderedFiles:results,publicAssetCount:publicFiles.size,uniquePhotos:[...photoIds],copyRulesPassed:true,contiguousTimelines:true,reviewLinksValid:true,hold},null,2));
const table=results.map(r=>`| ${r.filename} | ${r.width} × ${r.height} | ${r.frames} | ${r.duration.toFixed(3)} s | ${r.LUFS.toFixed(2)} | ${r.MB.toFixed(2)} MB |`).join('\n');
const usage=timing.concepts.map(c=>`- ${c.id}: ${[...new Set(c.segments.flatMap(s=>s.photos||[s.photo]).filter(Boolean))].join(', ')}. ${c.segments.find(s=>s.kind==='carousel')?.photos.length} fotos no carrossel, ${(c.segments.find(s=>s.kind==='carousel').end-c.segments.find(s=>s.kind==='carousel').start).toFixed(2)} s.`).join('\n');
fs.writeFileSync(path.join(dir,'qa-report.md'),`# Alkimi Women. Revisão narrada v2\n\n15/10/2026. Arquivos para revisão, sem publicação e sem alegação de aprovação de campanha.\n\n## Diagnóstico e correção\n\nO estudo anterior era mudo e repetia fotografias em painéis de 850 × 520, com hierarquia menor que a do Kids. A correção tomou como referência o código das cenas, fontes, timing, PhotoMotion e TrainingCarousel do Kids aprovado, além de frames extraídos. Não foi uma reprodução auditiva integral da referência.\n\nRecompostos os seis layouts com fotografia dominante, headlines maiores, trocas de mensagem dentro das cenas, três fotos por carrossel, crossfades de seis frames e pausas tipográficas. Community continua prioritário; Self-defense foi mantido como segunda frente. A taxa é visível no CTA.\n\n## Vídeos efetivamente gerados e verificados\n\n| Arquivo | Resolução | Frames | Duração | AAC estéreo LUFS | Tamanho |\n| --- | --- | --- | --- | --- | --- |\n${table}\n\nH.264, yuv420p, BT.709, AAC estéreo a 48 kHz, 30 fps constantes. Preset de render CRF 19 e bitrate AAC solicitado de 192 kbps. Faststart, átomo moov antes de mdat: ${results.every(r=>r.faststart)?'confirmado nos seis arquivos':'ver qa-checks.json para exceções'}. Não foi feita recompressão posterior do vídeo.\n\n## QA executado\n\n- TypeScript: exit code 0. Fontes oficiais Montserrat 300/500 e Fustat 400/500/600 carregadas via FontFace e delayRender. Sem fallback silencioso. Peso 500 mantido da referência visual Kids/brandbook, não confundido com 600.\n- Seis storyboards inspecionados, com fotos, lettering, CTA e três estados do carrossel. As fotos e os recortes finais foram vistos em cada formato.\n- Todos os frames dos seis MP4s decodificados. Contagem exata, PTS com intervalo de 1/30 s e nenhuma tela quase preta detectada pelo teste automatizado. Esse teste não substitui avaliação humana de ritmo.\n- Timelines contíguas; assets, logo e fontes encontrados. Nenhum overlay de debug habilitado. Links da página de revisão conferidos.\n- Alinhamento local por palavra, com destaques vinculados aos inícios detectados. Transcrição local compatível com a copy. Não afirmamos tolerância de dois frames comprovada por escuta humana.\n- CTA com ${timing.concepts[0].hold.toFixed(3)} s após a voz. Endpoints lossless dos últimos 75 frames de Community idênticos. Nos seis encodes, diferenças médias entre frames finais inferiores a 0,12 nível em escala 0–255, compatíveis com compressão.\n- Headline e narração em inglês, oferta sem gratuidade, sem travessões na copy e sem promessas de proteção garantida. Revisão visual dos textos nos seis storyboards e verificação automatizada dos roteiros/SRTs.\n- IA visual: nenhuma imagem gerada nesta revisão. Fotografias reais, mesmas origens aprovadas. Nenhum material de aluno usado para representar ansiedade ou sofrimento.\n- Voz-guia sintetizada localmente, não Emma. Nenhum crédito de geração ou transformação pago. Sem música. WAV e AAC medidos; pico estimado do AAC abaixo de −3,9 dBTP, loudness estéreo aproximadamente −16,03 LUFS.\n- Versões anteriores, Kids e fotos originais preservados. Arquivos novos restritos à pasta creative/women-motion. Nenhuma alteração de LP, automação, formulário ou campanha.\n\n## Fotografias\n\n${photoIds.size} fotos únicas entre os três conceitos. Fonte detalhada em data/photos.json; crops desta revisão em data/photo-crops-v2.json. A revisão aproveitou a curadoria anterior: 59 imagens únicas analisadas, oito selecionadas, cinco tier A e três B. Não repetiu o download ou a classificação sem necessidade.\n\n${usage}\n\nNão são atribuídos nomes ou parentesco às pessoas retratadas. Materiais fornecidos/aprovados pelo usuário; não foi realizada auditoria documental independente de cessões de imagem adulta.\n\n## Pendências explícitas\n\n- Voz/atuação de campanha ainda não aprovada. A guia af_bella não reproduz a Emma do Kids. Integrar gravação final autorizada e repetir alinhamento/render quando definida.\n- Escuta integral humana em celular e avaliação em velocidade real pelo cliente. Esta execução teve inspeção de frames, código, transcrição e medições; não alegamos uma escuta que não ocorreu.\n- Prévia real do Meta e conferência da interface em cada posicionamento. Área segura conservadora é referência, não garantia de compatibilidade universal.\n- Cortes de 15 s e vídeo da alternativa de abertura tipográfica não entregues nesta rodada. A alternativa Community existe como still.\n\n## Evidências\n\n- probes.json: streams e metadados de ffprobe.\n- encoded-media-checks.json: todos os frames e medições do AAC.\n- qa-checks.json: caminhos, copy, streams, faststart e assets.\n- cta-hold-check.json: comparação lossless do hold.\n- ../voice-guide-v2-measurements.json: medições dos WAVs.\n- ../../data/voice-guide-v2.json: roteiro, segmentos e palavras alinhadas.\n- ../../README.md: comandos, fontes e limitações.\n`);
console.log(JSON.stringify({files:results,uniquePhotos:photoIds.size,linksChecked:links.length},null,2));
