"""Local encoded-media verification. This is not a claim of human listening."""
import pathlib,sys,json,wave,hashlib
root=pathlib.Path(__file__).resolve().parents[1]
sys.path.insert(0,str(root/'_tools'/'alignment'))
import av
import numpy as np
import pyloudnorm as pyln
from scipy.signal import resample_poly
timing=json.loads((root/'data'/'voice-guide-v2.json').read_text(encoding='utf-8'))
directory=root/'review'/'v2'
results=[]
audio_only='--audio-only' in sys.argv
existing=json.loads((directory/'encoded-media-checks.json').read_text(encoding='utf-8')) if audio_only else []
for c in timing['concepts']:
    for fmt in ['9x16','4x5']:
        p=directory/f"alkimi_women_{c['id'].replace('-','_')}_v2_{fmt}_review.mp4"
        if not p.exists():continue
        if not audio_only:
            with av.open(str(p)) as container:
                stream=container.streams.video[0]
                n=0;last_pts=None;pts_regular=True;black=[];tail=[]
                for frame in container.decode(stream):
                    if last_pts is not None and abs(float((frame.pts-last_pts)*stream.time_base)-1/30)>.00001:pts_regular=False
                    last_pts=frame.pts
                    sample=frame.reformat(width=108,height=192 if fmt=='9x16' else 135,format='gray').to_ndarray()
                    if np.percentile(sample,99)<18:black.append(n)
                    if n>=c['durationFrames']-75:tail.append(sample.astype(float))
                    n+=1
        with av.open(str(p)) as container:
            stream=container.streams.audio[0]
            pcm=[frame.to_ndarray() for frame in container.decode(stream)]
            samples=np.concatenate(pcm,axis=1)
            rate=stream.codec_context.sample_rate
            # Measure the actual stereo signal, not a downmix whose level is 3 dB lower.
            loudness=pyln.Meter(rate).integrated_loudness(samples.T)
            peak=20*np.log10(np.max(np.abs(resample_poly(samples,4,1,axis=1))))
        if audio_only:
            result=next(x for x in existing if x['concept']==c['id'] and x['format']==fmt)
            result.pop('decodedMonoIntegratedLUFS',None)
        else:
            diff=float(max(np.mean(np.abs(x-tail[0])) for x in tail)) if tail else None
            result={'concept':c['id'],'format':fmt,'file':str(p),'frames':n,'expectedFrames':c['durationFrames'],'frameCountCorrect':n==c['durationFrames'],'constant30fpsPTS':pts_regular,'nearBlackFrames':black,'last75FramesMaxMeanPixelDifference':diff,'postVoiceHoldSeconds':c['hold'],'bytes':p.stat().st_size}
        result.update({'decodedIntegratedLUFS':float(loudness),'audioChannels':samples.shape[0],'encodedAudioTruePeak4xDBTP':float(peak)})
        results.append(result)
        print(json.dumps(results[-1]),flush=True)
(directory/'encoded-media-checks.json').write_text(json.dumps(results,indent=2),encoding='utf-8')
if len(results)!=6 or any(not r['frameCountCorrect'] or not r['constant30fpsPTS'] or r['nearBlackFrames'] for r in results):
    raise SystemExit('Encoded media verification found an incomplete or unexpected result.')
