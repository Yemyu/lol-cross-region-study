const D = window.V6;
const $ = id => document.getElementById(id);
const scopeSection = $('scope'), methodSection = $('method');
if(scopeSection && methodSection) {
  methodSection.before(scopeSection);
  scopeSection.querySelector('.eyebrow').textContent='01 / DATA & SCOPE';
  methodSection.querySelector('.eyebrow').textContent='02 / SCORING';
}
const fmt = v => v == null ? '0 · 无交手' : v.toFixed(2);
const pct = v => v == null ? '—' : `${(v * 100).toFixed(1)}%`;
const record = c => c.n ? `${c.w}–${c.l}` : '无交手';
const html = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function brandIcon(name,event=false) {
  const src=(window.REPORT_LOGOS||{})[name];
  if(src)return `<img class="brand-logo${event?' event-logo':(window.REPORT_LOGO_DARK||[]).includes(name)?' dark-logo':''}" src="${src}" alt="" width="25" height="25" loading="lazy">`;
  const short=D.samples.find(s=>s.team===name)?.short||name.split(/\s+/).map(w=>w[0]).join('').slice(0,3);
  return `<span class="brand-fallback" aria-label="${html(name)}，暂无队标" title="${html(name)} · 暂无队标">${html(short)}</span>`;
}
const status = s => s.status === 'complete' ? '完整计分口径' : s.status === 'partial_year' ? `未完年度 · 截至 ${s.cutoff}` : '缺国内资料';
const colors = {LPL:'#3468de', LCK:'#ce672d'};
let selected = '2023-LCK-GEN', page = 0, nearbyIds = [], matchView = 'external';
const clubGroups = {
  LPL: [
    {id:'all',label:'全部 LPL 队伍',teams:[]},
    {id:'AL',label:"Anyone's Legend",teams:["Anyone's Legend"]},
    {id:'BLG',label:'Bilibili Gaming',teams:['Bilibili Gaming']},
    {id:'EDG',label:'Edward Gaming',teams:['Edward Gaming']},
    {id:'FPX',label:'FunPlus Phoenix',teams:['Funplus Phoenix']},
    {id:'IG',label:'Invictus Gaming',teams:['Invictus Gaming']},
    {id:'JDG',label:'JD Gaming',teams:['JD Gaming']},
    {id:'LGD',label:'LGD Gaming',teams:['LGD Gaming']},
    {id:'LNG',label:'LNG Esports',teams:['LNG Esports']},
    {id:'OMG',label:'OMG',teams:['OMG']},
    {id:'RNG',label:'Royal Club / RNG',teams:['Royal Club','Star Horn Royal Club','Royal Never Give Up']},
    {id:'SN',label:'Suning',teams:['Suning']},
    {id:'WE',label:'Team WE',teams:['Team WE']},
    {id:'TES',label:'Top Esports',teams:['Top Esports']},
    {id:'WBG',label:'Weibo Gaming',teams:['Weibo Gaming']},
    {id:'IM',label:'I MAY',teams:['I MAY']}
  ],
  LCK: [
    {id:'all',label:'全部 LCK 队伍',teams:[]},
    {id:'AF',label:'Afreeca Freecs',teams:['Afreeca Freecs']},
    {id:'AZF',label:'Azubu Frost',teams:['Azubu Frost']},
    {id:'DWG',label:'DAMWON / Dplus KIA',teams:['DAMWON Gaming','DWG KIA','Dplus KIA']},
    {id:'DRX',label:'DRX / DragonX',teams:['DRX','DragonX']},
    {id:'GEN',label:'Gen.G',teams:['Gen.G','Gen.G eSports']},
    {id:'GRF',label:'Griffin',teams:['Griffin']},
    {id:'HLE',label:'Hanwha Life Esports',teams:['Hanwha Life Esports','Hanwha Life eSports']},
    {id:'KT',label:'KT Rolster',teams:['KT Rolster']},
    {id:'KOO',label:'KOO / ROX Tigers',teams:['KOO Tigers','ROX Tigers']},
    {id:'LZ',label:'Longzhu Gaming',teams:['Longzhu Gaming']},
    {id:'NAJIN',label:'Najin',teams:['NaJin Sword','NaJin White Shield','Najin Black Sword']},
    {id:'SSG',label:'Samsung Galaxy',teams:['Samsung Galaxy','Samsung Galaxy Blue','Samsung Galaxy White','Samsung Ozone']},
    {id:'SKT',label:'SKT / T1',teams:['SK Telecom T1','SKTelecom T1','T1']}
  ]
};
const clubFilters = {lpl:'all',lck:'all',combined:{LPL:'all',LCK:'all'}};
const viewModes = {lpl:'filter',lck:'filter',combined:'filter'};
// Achievement categories are assigned to the team-year sample from recorded main-event brackets.
// The 2013–14 Worlds source rows omit semifinal stage labels; those semifinalists are identified
// by their dated semifinal records in the same match dataset.
const achievementSets = Object.fromEntries(['international_champion','msi_champion','worlds_champion','worlds_finalist','worlds_semifinalist'].map(k=>[k,new Set()]));
const sampleByYearTeam = new Map(D.samples.map(s=>[`${s.year}|${s.team}`,s.id]));
function addAchievement(kind,year,team) {
  const id=sampleByYearTeam.get(`${year}|${team}`);
  if(id) achievementSets[kind].add(id);
}
for(const r of Object.values(D.matches)) {
  if(!['worlds','msi'].includes(r.international_event) || /play[ -]?in/i.test(r.event)) continue;
  const stage=r.stage.toUpperCase();
  if(stage==='FINALS') {
    const winner=r.games_a>r.games_b?r.a:r.b;
    addAchievement(`${r.international_event}_champion`,r.year,winner);
    addAchievement('international_champion',r.year,winner);
    if(r.international_event==='worlds') {
      for(const team of [r.a,r.b]) {
        addAchievement('worlds_finalist',r.year,team);
        addAchievement('worlds_semifinalist',r.year,team);
      }
    }
  }
  if(r.international_event==='worlds' && ['SEMIFINALS','SF','SF1','SF2'].includes(stage)) {
    addAchievement('worlds_semifinalist',r.year,r.a);
    addAchievement('worlds_semifinalist',r.year,r.b);
  }
}
for(const [year,teams] of [[2013,['Najin Black Sword']],[2014,['Samsung Galaxy Blue','OMG']]]) {
  for(const team of teams) addAchievement('worlds_semifinalist',year,team);
}

const clubFor = s => (clubGroups[s.region]||[]).find(g=>g.id!=='all'&&g.teams.includes(s.team))?.id || s.team;
const categoryMatch = (s,category) => category==='all'||(category.startsWith('achievement:')?achievementSets[category.slice(12)]?.has(s.id):clubFor(s)===category);
const clubRows = (rows,region,filter='all') => rows.filter(s=>s.region===region && categoryMatch(s,filter));
const years = [...new Set(D.samples.map(s => s.year))].sort((a,b) => a-b);
for (const year of years) {$('year').add(new Option(year,year)); $('pool-year').add(new Option(year,year));}
$('pool-year').value = '2023';
$('hero-count').textContent = D.samples.length;
$('hero-breakdown').textContent = `LPL ${D.samples.filter(s=>s.region==='LPL').length} / LCK ${D.samples.filter(s=>s.region==='LCK').length}`;
const scope = () => $('scope-filter').value;
const seeded = () => $('inner-mode').value === 'seeded';
const innerValue = s => seeded() ? s.seeded_inner_score : s.inner_score;
const innerLabel = () => seeded() ? '内战＋种子分' : '国际赛内战分';
function scoreValue(s, kind) {
  const external = s[scope()].n ? s[scope()].score : null;
  const internal = seeded() ? s.seeded_inner_score : (s.internal.n ? s.inner_score : null);
  if(kind === 'external') return external;
  if(kind === 'internal') return internal;
  return external == null || internal == null ? null : external + internal;
}
function scoreFilteredRows(rows, chartId) {
  const bounds = ['external','internal','total'].map(kind => {
    const minText = $(`${chartId}-${kind}-min`).value.trim();
    return {kind, min:minText === '' ? null : Number(minText)};
  });
  return rows.filter(s => bounds.every(({kind,min}) => {
    if(min == null) return true;
    const value = scoreValue(s, kind);
    const shown = value == null ? null : Number(value.toFixed(2));
    return shown != null && Number.isFinite(shown) && (min == null || shown >= min);
  }));
}
const bonusFor = (r,team) => r.format==='BO1'?0:D.rules.event_points[r.international_event][r.format]/6*(r.a===team?r.games_a:r.games_b)/(r.games_a+r.games_b);
const matchPoints = (r,team) => {const won=(r.games_a>r.games_b)===(r.a===team);const raw=D.rules.event_points[r.international_event][r.format]*(won?1:-.5);return `大场 ${raw>0?'+':''}${fmt(raw)} · 小局 +${fmt(bonusFor(r,team))}`;};
const subset = () => {
  const choice = $('year').value;
  if (choice === 'all') return D.samples;
  if (choice === 'since-2015') return D.samples.filter(s => s.year >= 2015);
  if (choice === 'before-2015') return D.samples.filter(s => s.year < 2015);
  return D.samples.filter(s => s.year === Number(choice));
};
const sample = () => D.samples.find(s => s.id === selected);
const limits = vals => {
  const v = vals.filter(x => x != null);
  return [Math.min(-5, Math.floor(Math.min(...v)/5)*5-5), Math.max(5, Math.ceil(Math.max(...v)/5)*5+5)];
};
const xDomain = limits(D.samples.flatMap(s => [s.inner_score,s.seeded_inner_score]));
const yDomain = () => limits(D.samples.map(s => s[scope()].score));
const maxArea = Math.max(...D.samples.map(s => s.all_external.n+s.internal.n));
const radius = d3.scaleSqrt().domain([0,maxArea]).range([0,13]);

function tip(event,s,nearbyCount=1) {
  const t=$('tooltip'), e=s[scope()];
  t.innerHTML=`<b>${s.year} ${html(s.short)} · ${s.region}</b><br>${html(status(s))}<br>外战大场 ${record(e)} / ${pct(e.rate)} · ${fmt(e.score)} 分<br>内战大场 ${record(s.internal)} / ${pct(s.internal.rate)} · ${fmt(innerValue(s))} 分<br><span>点击查看各赛制与逐场外战${nearbyCount>1?`；附近有 ${nearbyCount} 个点`:''}</span>`;
  t.hidden=false;
  t.style.left=Math.max(8,Math.min(event.clientX+14,innerWidth-290))+'px';
  t.style.top=Math.max(8,Math.min(event.clientY+14,innerHeight-155))+'px';
}
function choose(id,neighbors=[]) {selected=id;nearbyIds=neighbors;$('team').value=id;renderDetails();renderTable();drawAll(false);}
function chart(id, rows, replay, highlightFn=()=>false, highlightMode=false) {
  const el=$(id), W=Math.max(300,Math.min(900,el.clientWidth)), H=W<500?340:(id==='combined'?455:405);
  const m={l:46,r:92,t:38,b:103};
  const right=W-m.r, bottom=H-m.b, bandX=right+47, bandY=bottom+60;
  const x=d3.scaleLinear().domain(xDomain).range([m.l,W-m.r]);
  const y=d3.scaleLinear().domain(yDomain()).range([H-m.b,m.t]);
  const svg=d3.select(el).selectAll('svg').data([0]).join('svg').attr('viewBox',`0 0 ${W} ${H}`)
    .attr('role','img').attr('aria-label',`${id==='combined'?'两赛区':id.toUpperCase()}内外战积分散点图`);
  svg.selectAll('.grid').data([0]).join('g').attr('class','grid').selectAll('line').data(y.ticks(6)).join('line')
    .attr('x1',m.l).attr('x2',W-m.r).attr('y1',y).attr('y2',y).attr('stroke','#e7ecf2');
  svg.selectAll('.zero-line').data([
    {x1:x(0),x2:x(0),y1:m.t,y2:H-m.b},
    {x1:m.l,x2:W-m.r,y1:y(0),y2:y(0)}
  ]).join('line').attr('class','zero-line').attr('x1',d=>d.x1).attr('x2',d=>d.x2)
    .attr('y1',d=>d.y1).attr('y2',d=>d.y2);
  svg.selectAll('.x').data([0]).join('g').attr('class','x').attr('transform',`translate(0,${H-m.b})`)
    .call(d3.axisBottom(x).ticks(6).tickSize(0).tickPadding(10)).call(g=>g.select('.domain').attr('stroke','#cbd5e1'));
  svg.selectAll('.y').data([0]).join('g').attr('class','y').attr('transform',`translate(${m.l},0)`)
    .call(d3.axisLeft(y).ticks(6).tickSize(0).tickPadding(10)).call(g=>g.select('.domain').remove());
  svg.selectAll('.axis-label').data([{x:m.l,y:16,t:'外战积分',anchor:'start'},{x:right+47,y:bottom+34,t:'内战积分',anchor:'middle'}]).join('text')
    .attr('class','axis-label').attr('x',d=>d.x).attr('y',d=>d.y).attr('text-anchor',d=>d.anchor).text(d=>d.t);
  const bands=[{x:right+16,y:m.t,w:62,h:bottom-m.t,label:'无内战',tx:bandX,ty:25},{x:m.l,y:bottom+39,w:right-m.l,h:39,label:scope()==='external'?'无重要外战':'无外战',tx:m.l+48,ty:bottom+34}];
  if(seeded())bands.shift();
  svg.selectAll('.absence-band').data(bands).join('rect').attr('class','absence-band').attr('x',d=>d.x).attr('y',d=>d.y).attr('width',d=>d.w).attr('height',d=>d.h).attr('rx',7).attr('fill','#f0f4fa').attr('stroke','#c5d1e3').attr('stroke-dasharray','3 4').lower();
  svg.selectAll('.band-label').data(bands).join('text').attr('class','band-label').attr('x',d=>d.tx).attr('y',d=>d.ty).attr('text-anchor','middle').attr('font-size',10).attr('fill','#61738c').text(d=>d.label);
  const points=rows.filter(s=>s.internal.n||s[scope()].n);
  const positions=new Map(), placed=[];
  for(const s of [...points].sort((a,b)=>a.id.localeCompare(b.id))){
    const noX=!s.internal.n&&!seeded(),noY=!s[scope()].n;
    let px=noX?bandX:x(innerValue(s)),py=noY?bandY:y(s[scope()].score);
    if(noX||noY){
      const offsets=[0,-12,12,-22,22];let best=-1,bestXY=[px,py];
      for(const dx of noX?offsets:[0])for(const dy of noY?[-8,0,8]:[0]){
        const xx=px+dx,yy=py+dy,dist=Math.min(999,...placed.filter(p=>p.noX===noX&&p.noY===noY).map(p=>Math.hypot(p.x-xx,p.y-yy)));
        if(dist>best){best=dist;bestXY=[xx,yy];}
      }
      [px,py]=bestXY;
    }
    positions.set(s.id,[px,py]);placed.push({x:px,y:py,noX,noY});
  }
  const px=s=>positions.get(s.id)[0],py=s=>positions.get(s.id)[1];
  const nearby=s=>[s,...points.filter(t=>t.id!==s.id&&Math.hypot(px(t)-px(s),py(t)-py(s))<=28)].map(t=>t.id);
  const circles=svg.selectAll('.point').data(points,s=>s.id)
    .join(enter=>enter.append('circle').attr('cx',s=>px(s)).attr('cy',y(0)).attr('r',0),update=>update,exit=>exit.remove())
    .attr('class',s=>`point${s.id===selected?' selected':''}${s.status==='partial_year'?' partial':''}${highlightMode&&highlightFn(s)?` highlighted highlight-${s.region.toLowerCase()}`:''}${highlightMode&&!highlightFn(s)?' dimmed':''}`)
    .attr('data-id',s=>s.id).attr('data-highlight',s=>highlightMode&&highlightFn(s)?'true':'false').attr('data-band',s=>!s.internal.n&&!seeded()?'internal':!s[scope()].n?'external':'main').attr('fill',s=>!s.internal.n||!s[scope()].n?'#fff':colors[s.region]).style('opacity',s=>highlightMode?(highlightFn(s)?1:.18):.7).style('stroke',s=>s.id===selected?'#192c44':highlightMode&&highlightFn(s)?(s.region==='LPL'?'#1d5bd7':'#b84d25'):colors[s.region]).style('stroke-width',s=>s.id===selected?2.5:highlightMode&&highlightFn(s)?3:1.5).attr('tabindex',0).attr('role','button')
    .attr('aria-label',s=>`${s.year} ${s.short}，外战 ${fmt(s[scope()].score)} 分，内战 ${fmt(innerValue(s))} 分`)
    .on('click',(event,s)=>choose(s.id,nearby(s))).on('keydown',(event,s)=>{if(event.key==='Enter'||event.key===' '){event.preventDefault();choose(s.id,nearby(s));}})
    .on('pointermove',(event,s)=>tip(event,s,nearby(s).length)).on('pointerleave',()=>{$('tooltip').hidden=true;});
  if(replay)circles.attr('r',0).attr('cy',y(0));
  circles.interrupt().transition().duration(matchMedia('(prefers-reduced-motion: reduce)').matches?0:650)
    .attr('cx',s=>px(s)).attr('cy',s=>py(s))
    .attr('r',s=>Math.max(4,radius(s[scope()].n+s.internal.n)));
  circles.raise();
  circles.filter(s=>s.id===selected).raise();
  svg.selectAll('.annotation').data(points.filter(s=>s.id===selected)).join('text').attr('class','annotation')
    .attr('text-anchor',s=>px(s)>W-145?'end':'start')
    .attr('x',s=>px(s)+(px(s)>W-145?-16:16))
    .attr('y',s=>Math.max(35,py(s)-15)).text(s=>`${s.year} ${s.short}`);
  return points.length;
}
function drawAll(replay=false) {
  const rows=subset();
  const lplAll=rows.filter(s=>s.region==='LPL'), lckAll=rows.filter(s=>s.region==='LCK');
  const lplHighlight=s=>categoryMatch(s,clubFilters.lpl);
  const lckHighlight=s=>categoryMatch(s,clubFilters.lck);
  const combinedHighlight=s=>categoryMatch(s,clubFilters.combined[s.region]);
  const lplRows=scoreFilteredRows(viewModes.lpl==='highlight'?lplAll:clubRows(rows,'LPL',clubFilters.lpl),'lpl');
  const lckRows=scoreFilteredRows(viewModes.lck==='highlight'?lckAll:clubRows(rows,'LCK',clubFilters.lck),'lck');
  const combinedAll=[...lplAll,...lckAll];
  const combinedRows=scoreFilteredRows(viewModes.combined==='highlight'?combinedAll:[...clubRows(rows,'LPL',clubFilters.combined.LPL),...clubRows(rows,'LCK',clubFilters.combined.LCK)],'combined');
  const n=chart('combined',combinedRows,replay,combinedHighlight,viewModes.combined==='highlight');
  const lplN=chart('lpl',lplRows,replay,lplHighlight,viewModes.lpl==='highlight');
  const lckN=chart('lck',lckRows,replay,lckHighlight,viewModes.lck==='highlight');
  $('lpl-count').textContent=`${lplN} 个点 · 与另两图同一尺度`;
  $('lck-count').textContent=`${lckN} 个点 · 与另两图同一尺度`;
  $('plot-count').textContent=`${n} 个可绘图样本 / ${combinedRows.length} 个筛选样本`;
  const missing=combinedRows.filter(s=>(s.internal.n||s[scope()].n)&&(!s[scope()].n||(!s.internal.n&&!seeded())));
  const omitted=combinedRows.length-n;
  $('missing').textContent=`${missing.length} 个样本放在无交手带；带内位置不代表缺少的那一项分数。空心点表示缺少一侧交手。${seeded()?'无内战但有外战的空心点横坐标仅来自种子基础分。':''}${omitted} 个两项均无交手的样本不绘图，仍可在队伍列表与战绩表查看。`;
}
function formatText(c) {return ['BO5','BO3','BO1'].map(f=>`${f} ${c.formats[f].w}–${c.formats[f].l}`).join(' · ');}
function formatBranches(c) {
  return ['BO5','BO3','BO1'].map(f=>{const v=c.formats[f];return `<div class="format-row"><span>${f}</span><b>${v.n?`${v.w}胜 ${v.l}负 <small>${pct(v.w/v.n)}</small>`:'无交手'}</b></div>`;}).join('');
}
function externalMatches(s) {
  const important=new Set(s.external.ids), all=s.all_external.ids.map(id=>D.matches[id]);
  if(!all.length)return '<p class="muted">这一年没有 MSI 或世界赛的跨赛区交手。</p>';
  return ['BO5','BO3','BO1'].map(f=>{
    const rows=all.filter(r=>r.format===f).sort((a,b)=>a.date.localeCompare(b.date));
    if(!rows.length)return `<div class="match-group"><h5>${f} <small>无交手</small></h5></div>`;
    return `<div class="match-group"><h5>${f} <small>${rows.length} 场</small></h5>${rows.map(r=>{
      const own=r.a===s.team, won=(r.games_a>r.games_b)===own, opponent=own?r.b:r.a;
      const score=`${own?r.games_a:r.games_b}∶${own?r.games_b:r.games_a}`;
      return `<div class="match-item"><div><b>${brandIcon(opponent)}${html(opponent)}</b><span class="match-result ${won?'won':'lost'}">${score} · ${won?'胜':'负'}</span></div><small>${matchPoints(r,s.team)}</small><small>${r.date} · ${r.international_event==='msi'?'MSI':'世界赛'} ${important.has(r.id)?'<em>重要外战</em>':'<em class="secondary">其余外战</em>'} <a href="${html(r.source)}" target="_blank" rel="noopener" aria-label="${html(opponent)}赛果来源">来源 ↗</a></small></div>`;
    }).join('')}</div>`;
  }).join('');
}
function internalMatches(s) {
  const all=s.internal.ids.map(id=>D.matches[id]);
  if(!all.length)return '<p class="muted">这一年没有符合当前计分范围的内战交手；累计贡献为 0，但不代表零分表现。</p>';
  return ['BO5','BO3','BO1'].map(f=>{
    const rows=all.filter(r=>r.format===f).sort((a,b)=>a.date.localeCompare(b.date));
    if(!rows.length)return `<div class="match-group"><h5>${f} <small>无交手</small></h5></div>`;
    return `<div class="match-group"><h5>${f} <small>${rows.length} 场</small></h5>${rows.map(r=>{
      const own=r.a===s.team, won=(r.games_a>r.games_b)===own, opponent=own?r.b:r.a;
      const score=`${own?r.games_a:r.games_b}∶${own?r.games_b:r.games_a}`;
      const international=r.kind==='international';
      const label='国际赛内战';
      return `<div class="match-item"><div><b>${brandIcon(opponent)}${html(opponent)}</b><span class="match-result ${won?'won':'lost'}">${score} · ${won?'胜':'负'}</span></div><small>${matchPoints(r,s.team)}</small><small>${html(r.date)} · ${html(r.event)} <em class="${international?'':'secondary'}">${label}</em> <a href="${html(r.source)}" target="_blank" rel="noopener" aria-label="${html(opponent)}赛果来源">来源 ↗</a></small></div>`;
    }).join('')}</div>`;
  }).join('');
}
function renderMatchDetail(s) {
  const external=matchView==='external';
  const intro=external?`${s.all_external.n} 场，含重要与其余外战`:`${s.internal.n} 场，只有 MSI 与世界赛同赛区交手`;
  $('selected-more').innerHTML=`<div class="match-detail"><h4>逐场战绩</h4><div class="match-switch" role="group" aria-label="逐场战绩类别">
    <button type="button" data-match-view="external" aria-pressed="${external}">全年外战逐场</button>
    <button type="button" data-match-view="internal" aria-pressed="${!external}">全年内战逐场</button>
    </div><p class="match-intro">${intro}</p><div id="match-list">${external?externalMatches(s):internalMatches(s)}</div></div>
    ${external?`<p>欧洲指定对手：${html(s.europe_seed)}。分数还受交手机会影响；需与胜负和场数一起阅读。</p>`:'<p>这里仅展示进入内战积分的交手：MSI 与世界赛同赛区交手；无交手放在独立带中，不放到数值零线上。</p>'}`;
}
function formula(c) {
  if(!c.n)return '<p>无交手，累计贡献为 0；图中放入无交手带，不解释为表现分。</p>';
  const terms=won=>c.ids.map(id=>D.matches[id]).filter(r=>((r.games_a>r.games_b)===(r.a===sample().team))===won).map(r=>`${r.international_event==='worlds'?'世界赛':'MSI'} ${r.format} ${D.rules.event_points[r.international_event][r.format]}${won?'':'×50%'}`).join('＋')||'0';
  const win=terms(true),loss=terms(false);
  const bonuses=c.ids.map(id=>D.matches[id]).filter(r=>r.format!=='BO1').map(r=>`${r.international_event==='worlds'?'世界赛':'MSI'} ${r.format}：${D.rules.event_points[r.international_event][r.format]}÷6×${r.a===sample().team?r.games_a:r.games_b}/${r.games_a+r.games_b}`).join('＋')||'0（BO1 不另补分）';
  return `<p>${formatText(c)}；合计 ${record(c)} / ${c.n} 场</p><p>小局 ${c.gw}–${c.gl}（${pct(c.map_rate)}）</p>
    <p>胜场加分 B＝${win}＝${fmt(c.base)}</p><p>败场扣分 D＝${loss}＝${fmt(c.deduction)}</p>
    <p>大场净分 C＝${fmt(c.base)}−${fmt(c.deduction)}＝${fmt(c.net)}</p>
    <p>小局补充分 M＝${bonuses}＝${fmt(c.bonus)}</p>
    <strong>S＝${fmt(c.net)}＋${fmt(c.bonus)}＝${fmt(c.score)}</strong>`;
}
function seedDescription(s) {
  const msi=s.msi_seed?`MSI ${s.msi_seed} 号种子：${fmt(s.msi_seed_base)} 分`:(s.msi_seed_status==='not_held'?(s.year===2020?'当年 MSI 取消：0 分':'当年尚无 MSI：0 分'):'未参加 MSI：0 分');
  return `${msi}；世界赛 ${s.worlds_seed} 号种子：${fmt(s.worlds_seed_base)} 分。种子基础分合计 ${fmt(s.seed_base)}。`;
}
function renderDetails() {
  const s=sample(), e=s[scope()];
  const totalScore=scoreValue(s,'total');
  const nearby=nearbyIds.length>1?`<div class="nearby"><h4>附近的点 · ${nearbyIds.length} 支队伍</h4><p>这些点在图中相互遮挡，可在这里切换。</p><div>${nearbyIds.map(id=>{const t=D.samples.find(s=>s.id===id);return `<button type="button" data-nearby="${html(id)}" class="${id===selected?'active':''}">${t.year} ${html(t.short)}</button>`;}).join('')}</div></div>`:'';
  $('selected-highlight').innerHTML=`<div class="team-identity">${brandIcon(s.team)}${html(s.team)}</div><p class="status-line">${html(status(s))}</p>${nearby}<div class="score-pair"><div><span>${scope()==='external'?'重要':'全部'}外战分</span><strong>${fmt(e.score)}</strong></div><div><span>${innerLabel()}</span><strong>${fmt(innerValue(s))}</strong></div><div><span>总得分</span><strong>${totalScore==null?'—':fmt(totalScore)}</strong>${totalScore==null?'<small class="score-missing">缺一侧分数</small>':''}</div></div>`;
  $('selected-highlight').insertAdjacentHTML('beforeend','<button type="button" class="breakdown-open" data-breakdown-open>查看积分构成 <span>展开 ↗</span></button><button type="button" class="timeline-open" data-timeline-open>全年比赛时间线 <span>查看 ↗</span></button>');
  $('selected-summary').innerHTML=`<div class="record-block"><h4>${scope()==='external'?'重要':'全部'}外战 · 大场合计</h4><p>${record(e)} / ${e.n} 场 · ${pct(e.rate)}；小局 ${e.n?`${e.gw}–${e.gl} / ${pct(e.map_rate)}`:'无交手'}</p>${formatBranches(e)}</div>
    <div class="record-block"><h4>国际赛内战 · 大场合计</h4><p>${record(s.internal)} / ${s.internal.n} 场 · ${pct(s.internal.rate)} <small>实际大场胜率</small></p>${formatBranches(s.internal)}<p class="inner-parts">只统计 MSI 与世界赛同赛区交手；国内联赛不计入。</p><p class="seed-summary">${seedDescription(s)}<br>比赛积分 ${fmt(s.inner_score||0)} ＋ MSI ${fmt(s.msi_seed_base)} ＋ 世界赛 ${fmt(s.worlds_seed_base)} ＝ ${fmt(s.seeded_inner_score)}${s.internal.n?'':'（内战 0 场，仅种子分）'}。<br>${s.msi_seed?`<a href="${html(s.msi_seed_source)}" target="_blank" rel="noopener">MSI 种子依据 ↗</a> · `:''}<a href="${html(s.seed_source)}" target="_blank" rel="noopener">世界赛种子依据 ↗</a></p></div>`;
  renderMatchDetail(s);
  $('calc-title').innerHTML=`${brandIcon(s.team)}${s.year} ${html(s.short)} · 计算明细`;
  const total=`当前横轴：${innerLabel()}。${seeded()?`比赛积分 ${fmt(s.inner_score||0)} ＋ MSI 种子 ${fmt(s.msi_seed_base)} ＋ 世界赛种子 ${fmt(s.worlds_seed_base)} ＝ ${fmt(s.seeded_inner_score)}。${seedDescription(s)}`:'此视图只显示国际赛内战的比赛积分，不加种子基础分。'}国内比赛不计分，败场统一扣同赛事、同赛制胜利基础分的 50%。`;
  $('calc-body').innerHTML=`<div class="calc-grid"><div class="calc-item"><b>${scope()==='external'?'重要':'全部'}外战</b>${formula(e)}</div><div class="calc-item"><b>国际赛内战</b>${formula(s.international)}</div></div><div class="calc-total">${total}</div>`;
  $('match-title').textContent=`${s.year} ${s.short} · 所选外战与国际赛内战逐场记录`;
  const ids=[...new Set([...e.ids,...s.internal.ids])];
  $('matches').innerHTML=ids.map(id=>D.matches[id]).sort((a,b)=>a.date.localeCompare(b.date)).map(r=>{
    const own=r.a===s.team, win=(r.games_a>r.games_b)===own, dom=r.kind==='domestic', inside=r.ra===r.rb;
    const raw=(win?1:-D.rules.loss_fraction)*D.rules.event_points[r.international_event][r.format];
    return `<tr><td>${r.date}</td><td>${brandIcon(r.international_event,true)}${html(r.event)}<br><small>${html(r.stage)}</small></td><td>${dom?'国内内战':inside?'国际内战':'外战'}</td><td>${brandIcon(own?r.b:r.a)}${html(own?r.b:r.a)}</td><td>${own?r.games_a:r.games_b}∶${own?r.games_b:r.games_a} / ${r.format}</td><td>${raw>0?'+':''}${fmt(raw)}<br>小局 +${fmt(bonusFor(r,s.team))}</td><td><a href="${html(r.source)}" target="_blank" rel="noopener">赛果 ↗</a></td></tr>`;
  }).join('')||'<tr><td colspan="7">当前范围无比赛。</td></tr>';
}
function renderTable() {
  $('inner-column').textContent=innerLabel();
  $('score-column').textContent=scope()==='external'?'重要外战分':'全部外战分';
  const query=$('search').value.toLowerCase();
  const rows=subset().filter(s=>($('region').value==='all'||s.region===$('region').value)&&`${s.year} ${s.short} ${s.team}`.toLowerCase().includes(query))
    .sort((a,b)=>b.year-a.year||a.region.localeCompare(b.region)||a.short.localeCompare(b.short));
  const pages=Math.max(1,Math.ceil(rows.length/10));page=Math.min(page,pages-1);
  $('table-count').textContent=`${rows.length} 个年度样本`;
  $('stats').innerHTML=rows.slice(page*10,page*10+10).map(s=>`<tr data-team="${html(s.id)}" class="${s.id===selected?'active':''}"><td><button class="table-team" data-team="${html(s.id)}">${brandIcon(s.team)}${s.year} ${html(s.short)}</button> <small>${s.region}</small></td><td>${html(status(s))}</td>
    ${['total','all_external','external'].map(k=>`<td>${record(s[k])} / ${pct(s[k].rate)} · ${s[k].n} 场</td>`).join('')}
    <td>${formatText(s.external)}</td><td>${s.external.n?`${s.external.gw}–${s.external.gl} / ${pct(s.external.map_rate)}`:'无交手'}</td>
    <td>${record(s.internal)} / ${pct(s.internal.rate)} · ${s.internal.n} 场</td><td>${fmt(s[scope()].score)}</td><td>${fmt(innerValue(s))}</td></tr>`).join('')||'<tr><td colspan="10">没有符合条件的样本。</td></tr>';
  $('page').textContent=`${page+1} / ${pages}`;$('prev').disabled=page===0;$('next').disabled=page===pages-1;
}
function pools() {
  const year=+$('pool-year').value;
  $('pools').innerHTML=D.pools.filter(p=>p.year===year).map(p=>`<div class="pool-row"><b>${p.region}</b>${p.members.map(t=>`<span class="chip ${p.worlds.includes(t)?'':'extra'}">${brandIcon(t)}${html(D.samples.find(s=>s.year===year&&s.team===t)?.short||t)} · ${D.samples.find(s=>s.year===year&&s.team===t)?.worlds_seed}号</span>`).join('')}<p>${p.members.length} 支队伍。${html(p.note)} ${p.sources.map((url,i)=>`<a href="${html(url)}" target="_blank" rel="noopener">资格赛事来源 ${i+1} ↗</a>`).join(' ')} ${p.rule_source?`<a href="${html(p.rule_source)}" target="_blank" rel="noopener">世界赛名单 ↗</a>`:''}</p></div>`).join('');
}
function coverage() {
  const label={no_sample:'无中韩样本',partial_year:'未完年度 · 9月27日',complete:'完整计分口径'};
  $('coverage').innerHTML=D.coverage.map(c=>`<span class="coverage-pill ${c.status}"><b>${c.year}</b> ${label[c.status]}</span>`).join('');
}
function europeList() {
  $('europe-list').innerHTML=D.europe.map(r=>`<span class="coverage-pill ${r.selection==='user_override'?'mixed_coverage':''}"><b>${r.year}</b> ${brandIcon(r.team)}${html(r.team)}${r.selection==='user_override'?' · 特例':''}</span>`).join('');
}
function populateClubControls() {
  for(const region of ['LPL','LCK']) {
    const teams=document.createElement('optgroup');teams.label='俱乐部';
    teams.append(...clubGroups[region].filter(g=>g.id!=='all').map(g=>new Option(g.label,g.id)));
    const achievements=document.createElement('optgroup');achievements.label='赛事成绩';
    achievements.append(...[['international_champion','国际赛冠军'],['msi_champion','MSI 冠军'],['worlds_champion','世界赛冠军'],['worlds_finalist','世界赛进决赛'],['worlds_semifinalist','世界赛四强及以上']].map(([id,label])=>new Option(label,`achievement:${id}`)));
    const options=[new Option(`全部 ${region} 队伍`,'all'),teams,achievements];
    const pairs=region==='LPL'?[['lpl-club',clubFilters.lpl],['combined-lpl-club',clubFilters.combined.LPL]]:[['lck-club',clubFilters.lck],['combined-lck-club',clubFilters.combined.LCK]];
    for(const [id,value] of pairs) {$(id).replaceChildren(...options.map(o=>o.cloneNode(true)));$(id).value=value;}
  }
}
function refresh() {
  const rows=subset(), visible=[...clubRows(rows,'LPL'),...clubRows(rows,'LCK')];
  if(!visible.some(s=>s.id===selected))selected=(visible[0]||rows[0]).id;
  const options=rows.slice().sort((a,b)=>b.year-a.year||a.region.localeCompare(b.region)||a.short.localeCompare(b.short))
    .map(s=>new Option(`${s.year} ${s.short} · ${s.region}${s.status==='partial_year'?' · 未完':''}`,s.id));
  $('team').replaceChildren(...options.map(o=>o.cloneNode(true)));
  $('team').value=selected;populateClubControls();['lpl','lck','combined'].forEach(syncViewControls);renderDetails();renderTable();drawAll(false);
}
$('inner-mode').onchange=()=>{nearbyIds=[];refresh();};
$('year').onchange=()=>{page=0;nearbyIds=[];refresh();};$('scope-filter').onchange=()=>{nearbyIds=[];refresh();};
$('team').onchange=e=>choose(e.target.value);
$('lpl-club').onchange=e=>{clubFilters.lpl=e.target.value;drawAll(false);};$('combined-lpl-club').onchange=e=>{clubFilters.combined.LPL=e.target.value;drawAll(false);};
$('lck-club').onchange=e=>{clubFilters.lck=e.target.value;drawAll(false);};$('combined-lck-club').onchange=e=>{clubFilters.combined.LCK=e.target.value;drawAll(false);};$('region').onchange=()=>{page=0;renderTable();};
function syncViewControls(id) {
  document.querySelectorAll(`[data-view-chart="${id}"]`).forEach(button=>{
    const active=button.dataset.viewMode===viewModes[id];
    button.setAttribute('aria-pressed',active?'true':'false');
    button.classList.toggle('active',active);
  });
}
document.querySelectorAll('[data-view-chart]').forEach(button=>button.onclick=()=>{viewModes[button.dataset.viewChart]=button.dataset.viewMode;syncViewControls(button.dataset.viewChart);drawAll(false);});
$('search').oninput=()=>{page=0;renderTable();};$('prev').onclick=()=>{page--;renderTable();};
$('next').onclick=()=>{page++;renderTable();};$('stats').onclick=e=>{const row=e.target.closest('[data-team]');if(row)choose(row.dataset.team);};
$('selected').onclick=e=>{
  if(e.target.closest('[data-timeline-open]')){openTimeline();return;}
  if(e.target.closest('[data-breakdown-open]')){openBreakdown();return;}
  const viewButton=e.target.closest('[data-match-view]');
  if(viewButton){matchView=viewButton.dataset.matchView;renderMatchDetail(sample());$('selected-more').querySelector(`[data-match-view="${matchView}"]`).focus({preventScroll:true});return;}
  const nearbyButton=e.target.closest('[data-nearby]');if(nearbyButton)choose(nearbyButton.dataset.nearby,nearbyIds);
};
$('replay').onclick=()=>drawAll(true);$('pool-year').onchange=pools;
for(const id of ['lpl','lck','combined']) {
  for(const kind of ['external','internal','total']) {
    $(`${id}-${kind}-min`).addEventListener('input',()=>{nearbyIds=[];drawAll(false);});
  }
  document.querySelector(`[data-score-reset="${id}"]`).onclick=()=>{
    for(const kind of ['external','internal','total']) $(`${id}-${kind}-min`).value='';
    nearbyIds=[];drawAll(false);
  };
}
refresh();pools();coverage();europeList();
window.STUDY_V6={data:D,choose,xDomain,yDomain};
let resizeFrame;window.addEventListener('resize',()=>{cancelAnimationFrame(resizeFrame);resizeFrame=requestAnimationFrame(()=>drawAll(false));});

function openBreakdown() {
  let dialog=$('breakdown-dialog');
  if(!dialog) {
    dialog=document.createElement('dialog');dialog.id='breakdown-dialog';dialog.setAttribute('aria-labelledby','breakdown-heading');
    dialog.innerHTML='<div class="breakdown-top"><div><small>年度样本 · 积分构成</small><h2 id="breakdown-heading"></h2></div><button type="button" id="breakdown-close">返回散点图 ×</button></div><iframe title="所选年度队伍的积分构成" id="breakdown-frame"></iframe>';
    document.body.append(dialog);
    $('breakdown-close').onclick=()=>dialog.close();
    dialog.addEventListener('close',()=>{document.body.style.overflow='';});
  }
  const s=sample();$('breakdown-heading').textContent=`${s.year} ${s.short} · ${s.region}`;
  $('breakdown-frame').src=`score-breakdown-preview.html?embed=1&team=${encodeURIComponent(s.id)}&scope=${scope()}&inner=${seeded()?'seeded':'match'}`;
  document.body.style.overflow='hidden';dialog.showModal();
}

function timelineMatches(s,kind='all') {
  const ids=kind==='internal'?s.internal.ids:kind==='external'?s.external.ids:kind==='all_external'?s.all_external.ids:[...s.all_external.ids,...s.internal.ids];
  return [...new Set(ids)].map(id=>D.matches[id]).sort((a,b)=>a.date.localeCompare(b.date)||String(a.id).localeCompare(String(b.id)));
}
function openTimeline() {
  let dialog=$('timeline-dialog');
  if(!dialog){dialog=document.createElement('dialog');dialog.id='timeline-dialog';dialog.setAttribute('aria-labelledby','timeline-title');dialog.innerHTML='<div class="timeline-top"><div><small>年度样本 · 比赛历程</small><h2 id="timeline-title"></h2></div><button type="button" id="timeline-close">返回散点图 ×</button></div><div class="timeline-body"><div class="timeline-controls"><label>交手范围<select id="timeline-kind"><option value="all">全部国际赛交手</option><option value="external">重要外战</option><option value="all_external">全部外战</option><option value="internal">国际赛内战</option></select></label><p>按日期排列；卡片间距不代表时间间隔。比分以所选队伍为前。</p></div><div id="timeline-content" aria-live="polite"></div></div>';document.body.append(dialog);$('timeline-close').onclick=()=>dialog.close();dialog.addEventListener('close',()=>{document.body.style.overflow='';});$('timeline-kind').onchange=renderTimeline;}
  dialog.dataset.sample=selected;$('timeline-kind').value='all';renderTimeline();document.body.style.overflow='hidden';dialog.showModal();dialog.querySelector('.timeline-body').scrollTop=0;
}
function renderTimeline(){
  const s=D.samples.find(s=>s.id===$('timeline-dialog').dataset.sample),rows=timelineMatches(s,$('timeline-kind').value);
  $('timeline-title').innerHTML=`${brandIcon(s.team)}${s.year} ${html(s.short)} · ${s.region}${s.status==='partial_year'?' · 未完年度':''}`;
  $('timeline-content').innerHTML=['msi','worlds'].map(event=>{
    const matches=rows.filter(r=>r.international_event===event);if(!matches.length)return '';
    const wins=matches.filter(r=>(r.a===s.team?r.games_a:r.games_b)>(r.a===s.team?r.games_b:r.games_a)).length;
    return `<section class="timeline-event"><div class="timeline-event-head"><h3>${brandIcon(event,true)}${event==='msi'?'MSI':'世界赛'}</h3><span>${matches.length} 场 · ${wins} 胜 ${matches.length-wins} 负</span></div><ol class="timeline-list">${matches.map(r=>{
      const a=r.a===s.team,gw=a?r.games_a:r.games_b,gl=a?r.games_b:r.games_a,won=gw>gl,opponent=a?r.b:r.a;
      const category=s.internal.ids.includes(r.id)?'国际赛内战':s.external.ids.includes(r.id)?'重要外战':'其他外战';
      return `<li class="${won?'timeline-win':'timeline-loss'}" data-timeline-match="${html(r.id)}"><time datetime="${html(r.date)}">${html(r.date.slice(5))}</time><div class="timeline-match"><div class="timeline-match-top"><span class="timeline-type">${category}</span><span>${html(r.format)}</span><a href="${html(r.source)}" target="_blank" rel="noopener">来源 ↗</a></div><div class="timeline-result"><span>${brandIcon(opponent)}${html(opponent)}</span><strong>${gw}:${gl}<small>${won?'胜':'负'}</small></strong></div></div></li>`;
    }).join('')}</ol></section>`;
  }).join('')||'<p class="timeline-empty">该年度在当前范围内没有已记录的交手。</p>';
}
