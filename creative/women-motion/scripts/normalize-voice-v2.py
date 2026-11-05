import pathlib,sys,json,wave,math
root=pathlib.Path(__file__).resolve().parents[1]
sys.path.insert(0,str(root/'_tools'/'alignment'))
import numpy as np
import pyloudnorm as pyln
from scipy.signal import resample_poly
from scipy.ndimage import maximum_filter1d
data=json.loads((root/'data'/'voice-guide-v2.json').read_text(encoding='utf-8'))
report=[]
for c in data['concepts']:
    p=root/'public'/c['audioFile']
    with wave.open(str(p)) as wf:
        rate=wf.getframerate();audio=np.frombuffer(wf.readframes(wf.getnframes()),dtype=np.int16).astype(np.float64)/32768
    meter=pyln.Meter(rate);before=meter.integrated_loudness(audio)
    # Offline, transparent look-ahead peak control. Never change timing or pitch.
    ceiling=10**(-1.2/20)
    window=max(3,int(rate*.010)|1)
    peak=maximum_filter1d(np.abs(audio),size=window,mode='nearest')
    release=math.exp(-1/(rate*.080))
    def limited(gain_db):
        gain=10**(gain_db/20)
        target=np.minimum(1,ceiling/np.maximum(peak*gain,1e-12))
        envelope=np.empty_like(target);previous=1.
        for i,value in enumerate(target):
            previous=min(float(value),release*previous+(1-release))
            envelope[i]=previous
        result=audio*gain*envelope
        actual_peak=np.max(np.abs(resample_poly(result,4,1)))
        if actual_peak>10**(-1/20):result*=10**(-1/20)/actual_peak
        return result,envelope
    lo,hi=-16-before,-16-before+10
    for _ in range(10):
        mid=(lo+hi)/2
        candidate,envelope=limited(mid)
        if meter.integrated_loudness(candidate)<-16:lo=mid
        else:hi=mid
    normalized,envelope=limited((lo+hi)/2)
    pcm=np.clip(np.rint(normalized*32767),-32768,32767).astype(np.int16)
    with wave.open(str(p),'wb') as wf:
        wf.setnchannels(1);wf.setsampwidth(2);wf.setframerate(rate);wf.writeframes(pcm.tobytes())
    measured=pcm.astype(np.float64)/32768
    report.append({'concept':c['id'],'beforeLUFS':float(before),'afterLUFS':float(meter.integrated_loudness(measured)),'truePeak4x_dBTP':float(20*np.log10(np.max(np.abs(resample_poly(measured,4,1))))),'maxPeakReductionDB':float(-20*np.log10(envelope.min())),'method':'pyloudnorm BS.1770; 10 ms look-ahead peak envelope, 80 ms release; scipy 4x true-peak estimate; no speed or pitch change'})
(root/'review'/'voice-guide-v2-measurements.json').write_text(json.dumps(report,indent=2),encoding='utf-8')
print(json.dumps(report,indent=2))
