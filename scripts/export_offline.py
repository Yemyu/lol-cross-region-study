"""Bundle current report into one offline HTML file, with no external asset requests."""
from pathlib import Path
import base64,json,re
HERE=Path(__file__).resolve().parents[1]
SRC=HERE;OUT=HERE/'share';OUT.mkdir(exist_ok=True)
def script(text):return '<script>'+text.replace('</script','<\\/script')+'</script>'
page=(SRC/'index.html').read_text()
page=page.replace('<link rel="stylesheet" href="style.css">','<style>'+(SRC/'style.css').read_text()+'</style>')
page=re.sub(r'<script defer src="[^"]+"></script>','',page)
child=(SRC/'score-breakdown-preview.html').read_text().replace('<script src="data.js"></script>','<script>window.V6=parent.V6;</script>')
child=child.replace('new URLSearchParams(location.search)','new URLSearchParams(window.frameElement.dataset.query)')
app=(SRC/'app.js').read_text()
old="$('breakdown-frame').src=`score-breakdown-preview.html?embed=1&team=${encodeURIComponent(s.id)}&scope=${scope()}&inner=${seeded()?'seeded':'match'}`;"
new="$('breakdown-frame').dataset.query=`embed=1&team=${encodeURIComponent(s.id)}&scope=${scope()}&inner=${seeded()?'seeded':'match'}`; $('breakdown-frame').srcdoc=OFFLINE_BREAKDOWN;"
assert old in app;app=app.replace(old,new)
assets={}
for name in ['matches.csv','summary.csv','sensitivity.csv','international-audit.json','domestic-audit.json','pool-change-audit.json']:
 p=SRC/name
 if p.exists():
  mime='text/csv' if p.suffix=='.csv' else 'application/json'
  assets[name]='data:'+mime+';charset=utf-8;base64,'+base64.b64encode(p.read_bytes()).decode()
for name,url in assets.items():
 page=page.replace('href="'+name+'"', 'href="'+url+'" download="'+name+'"')
# Eliminate duplicate bare download attributes after embedding.
page=page.replace('" download>', '">') if False else page
code=script((SRC/'vendor/d3.min.js').read_text())+script((SRC/'data.js').read_text())+script('const OFFLINE_BREAKDOWN='+json.dumps(child,ensure_ascii=False)+';')+script((SRC/'logos.js').read_text())+script(app)+script((SRC/'guide.js').read_text())
page=page.replace('</body>',code+'</body>')
file=OUT/'英雄联盟国际赛表现.html';file.write_text(page)
print(file, file.stat().st_size)
