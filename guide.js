/* Compact, independently navigable guides. Original content remains in the DOM. */
(() => {
  function deck(section, entries) {
    const box=document.createElement('div');box.className='guide-deck';
    const tabs=document.createElement('div');tabs.className='guide-tabs';tabs.setAttribute('role','tablist');tabs.setAttribute('aria-label',section.querySelector('h2').textContent);
    const body=document.createElement('div');body.className='guide-panels';
    entries.forEach(([title,nodes],i)=>{
      const id=`${section.id}-guide-${i}`,button=document.createElement('button'),panel=document.createElement('div');
      button.type='button';button.id=id+'-tab';button.setAttribute('role','tab');button.setAttribute('aria-controls',id);button.innerHTML=`<span class="guide-number">0${i+1}</span>${title}`;
      panel.id=id;panel.className='guide-panel';panel.setAttribute('role','tabpanel');panel.setAttribute('aria-labelledby',button.id);panel.tabIndex=0;
      nodes.forEach(n=>panel.append(n));tabs.append(button);body.append(panel);
      button.onclick=()=>activate(i);
      button.onkeydown=e=>{let next;if(e.key==='ArrowRight')next=(i+1)%entries.length;else if(e.key==='ArrowLeft')next=(i+entries.length-1)%entries.length;else if(e.key==='Home')next=0;else if(e.key==='End')next=entries.length-1;if(next!==undefined){e.preventDefault();activate(next);tabs.children[next].focus();}};
    });
    const footer=document.createElement('div');footer.className='guide-footer';footer.innerHTML='<span class="guide-position"></span><div><button type="button" aria-label="上一张说明">←</button><button type="button" aria-label="下一张说明">→</button><a href="#charts">查看图表 ↗</a></div>';
    let active=0;
    function activate(i){active=i;[...tabs.children].forEach((b,j)=>{b.setAttribute('aria-selected',j===i?'true':'false');b.tabIndex=j===i?0:-1;body.children[j].hidden=j!==i;});footer.querySelector('span').textContent=`${i+1} / ${entries.length} · ${entries[i][0]}`;}
    footer.querySelectorAll('button')[0].onclick=()=>activate((active+entries.length-1)%entries.length);
    footer.querySelectorAll('button')[1].onclick=()=>activate((active+1)%entries.length);
    box.append(tabs,body,footer);section.append(box);activate(0);
    return {activate,entries};
  }
  document.querySelector('.site-mark').innerHTML=brandIcon('worlds',true);
  const scope=document.getElementById('scope'),method=document.getElementById('method');
  const scopeDeck=deck(scope,[['统计口径',[scope.querySelector('.scope-grid')]],['年度队伍与欧洲对手',[scope.querySelector('.pool-box'),scope.querySelector('.seed-box')]],['数据覆盖与来源',[scope.querySelector('.limitations')]]]);
  const articles=[...method.querySelectorAll('.method-grid > article')],grid=method.querySelector('.method-grid');
  articles.forEach(article=>{
    const content=document.createElement('div');content.className='guide-columns';
    const figures=document.createElement('div'),notes=document.createElement('div');
    [...article.children].filter(n=>!n.matches('h3,.step')).forEach(n=>(n.tagName==='P'?notes:figures).append(n));
    content.append(figures,notes);article.append(content);
  });
  const methodDeck=deck(method,[['大场加扣分',[articles[0]]],['小局补分',[articles[1]]],['内外战与种子分',[articles[2]]],['队伍计算示例',[document.getElementById('calculation')]]]);grid.remove();
  const openHash=()=>{if(location.hash==='#calculation'){methodDeck.activate(3);requestAnimationFrame(()=>document.getElementById('calculation').scrollIntoView({block:'start'}));}};
  window.addEventListener('hashchange',openHash);document.addEventListener('click',e=>{if(e.target.closest('a[href="#calculation"]'))methodDeck.activate(3);});openHash();
  document.querySelectorAll('#method th').forEach(th=>{if(th.textContent.includes('MSI'))th.insertAdjacentHTML('afterbegin',brandIcon('msi',true));else if(th.textContent.includes('世界赛'))th.insertAdjacentHTML('afterbegin',brandIcon('worlds',true));});
  const note=document.createElement('p');note.className='muted';note.textContent='队标用于识别俱乐部，不逐年复原历史版本；少数早期队伍缺少图标时显示缩写。赛事标识来自 LoL Esports，队标来源记录随网页保留，商标权归各权利人所有。';scope.querySelector('.limitations').append(note);
  const nav=document.querySelector('header nav');nav.querySelector('a[href="#method"]').before(nav.querySelector('a[href="#scope"]'));
})();
