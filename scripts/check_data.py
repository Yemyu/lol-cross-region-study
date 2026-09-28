"""Check the published snapshot against its match-level records (stdlib only)."""
from pathlib import Path
import json,math
root=Path(__file__).resolve().parents[1]
d=json.loads((root/'data.js').read_text().removeprefix('window.V6=').rstrip(';\n'))
msi={r['id']:r for r in json.loads((root/'msi-seeds.json').read_text())['rows']}
checks=0
for s in d['samples']:
 for key in ['total','external','all_external','internal','international']:
  bucket=s[key];ids=bucket['ids'];assert len(ids)==len(set(ids)),(s['id'],key,'duplicate match')
  wins=losses=gw=gl=0;score=0.
  for mid in ids:
   r=d['matches'][mid];assert r['year']==s['year'] and s['team'] in (r['a'],r['b'])
   assert r['international_event'] in ('msi','worlds')
   own=r['a']==s['team'];a,b=(r['games_a'],r['games_b']) if own else (r['games_b'],r['games_a'])
   same=r['ra']==r['rb'];assert a!=b
   if key in ('internal','international'):assert same
   if key in ('external','all_external'):assert not same
   if key=='external':assert {r['ra'],r['rb']}=={'LPL','LCK'} or (r['b'] if own else r['a'])==s['europe_seed']
   wins+=a>b;losses+=a<b;gw+=a;gl+=b
   points=d['rules']['event_points'][r['international_event']][r['format']]
   score+=points if a>b else -points*d['rules']['loss_fraction']
   if r['format']!='BO1':score+=points*d['rules']['map_ratio']*a/(a+b)
  assert (len(ids),wins,losses,gw,gl)==tuple(bucket[k] for k in ['n','w','l','gw','gl']),(s['id'],key,'counts')
  if ids:assert math.isclose(score,bucket['score'],abs_tol=1e-8),(s['id'],key,score,bucket['score'])
  for fmt in ['BO1','BO3','BO5']:
   rr=[d['matches'][i] for i in ids if d['matches'][i]['format']==fmt]
   w=sum((r['games_a']>r['games_b'])==(r['a']==s['team']) for r in rr)
   assert bucket['formats'][fmt]=={'w':w,'l':len(rr)-w,'n':len(rr)}
  checks+=1
 assert math.isclose(s['worlds_seed_base'],max(0,4-s['worlds_seed'])*1.5,abs_tol=1e-8)
 assert s['msi_seed']==msi[s['id']]['seed'] and s['msi_seed_base']==msi[s['id']]['base']
 assert s['msi_seed_base']=={1:3.0,2:1.5,None:0}[s['msi_seed']]
 assert any(d['matches'][i]['international_event']=='msi' for i in s['total']['ids'])==(s['msi_seed'] is not None)
 assert math.isclose(s['seed_base'],s['worlds_seed_base']+s['msi_seed_base'],abs_tol=1e-8)
 assert math.isclose(s['seeded_inner_score'],(s['inner_score'] or 0)+s['seed_base'],abs_tol=1e-8)
print(f"PASS: {len(d['samples'])} annual samples, {checks} aggregates; match counts, formats, scores and seed points agree.")
print('This checks internal consistency, not the factual accuracy of source match results.')
