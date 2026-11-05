import sys, json, pathlib, os, wave
root=pathlib.Path(__file__).resolve().parents[1]
sys.path.insert(0,str(root/'_tools'/'alignment'))
from faster_whisper import WhisperModel
import numpy as np
data=json.loads((root/'data'/'voice-guide-v2.json').read_text(encoding='utf-8'))
# Reuse the exact cached small.en model from the approved Kids workflow.
cache=pathlib.Path('C:/Users/Ronaldo/.cache/huggingface/hub/models--Systran--faster-whisper-small.en/snapshots')
modeldir=next(p for p in cache.iterdir() if (p/'model.bin').exists())
model=WhisperModel(str(modeldir),device='cpu',compute_type='int8',cpu_threads=4,local_files_only=True)
for concept in data['concepts']:
    with wave.open(str(root/'public'/concept['audioFile'])) as wf:
        rate=wf.getframerate()
        pcm=np.frombuffer(wf.readframes(wf.getnframes()),dtype=np.int16).astype(np.float32)/32768
    pcm=np.interp(np.arange(round(len(pcm)*16000/rate))*rate/16000,np.arange(len(pcm)),pcm).astype(np.float32)
    pieces,info=model.transcribe(pcm,word_timestamps=True,beam_size=5,vad_filter=False,language='en',initial_prompt="Women's jiu-jitsu at Alkimi, South Austin. Find women who have your back. A women-only class. Led by a female coach.")
    words=[{'word':w.word.strip(),'start':round(w.start,3),'end':round(w.end,3),'probability':round(w.probability,3)} for seg in pieces for w in seg.words]
    for s in concept['segments']:
        s['words']=[w for w in words if w['start']>=s['start']-.05 and w['start']<s['end']-.02]
    concept['alignmentText']=' '.join(w['word'] for w in words)
    print(concept['id'],concept['alignmentText'],flush=True)
data['alignment']='faster-whisper small.en int8, local cached model. Word timestamps machine-aligned; user listening review required for final.'
(root/'data'/'voice-guide-v2.json').write_text(json.dumps(data,indent=2),encoding='utf-8')
