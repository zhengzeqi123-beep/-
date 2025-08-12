(function(){
  const Views = { Archive: 'archive', Check: 'check', Subs: 'subs' };
  const Verdict = {
    TRUE: '真实', PARTIAL: '部分真实', FALSE: '虚假', UNCERTAIN: '无法证伪'
  };
  const VerdictClass = {
    [Verdict.TRUE]: 'true',
    [Verdict.PARTIAL]: 'partial',
    [Verdict.FALSE]: 'false',
    [Verdict.UNCERTAIN]: 'uncertain',
  };

  const categories = ['全部','健康','科技','社会','娱乐','财经','教育','公共政策'];

  // 示例数据：观点库
  const archiveItems = [
    {
      id: 'a1',
      title: '喝盐水能快速退烧？',
      summary: '医学研究与指南不支持此说法。补水可以，但不推荐高浓度盐水。',
      verdict: Verdict.FALSE,
      category: '健康',
      heat: 98,
      publishedAt: '2025-06-15',
      sources: [
        { title:'WHO 退烧建议', url:'https://www.who.int/' },
        { title:'中华医学会 感冒发热共识', url:'https://www.cma.org.cn/' }
      ]
    },
    {
      id: 'a2',
      title: '某品牌手机信号差是基带问题？',
      summary: '不同地区与运营商表现差异较大，部分场景确有影响，但非单一“基带问题”。',
      verdict: Verdict.PARTIAL,
      category: '科技',
      heat: 86,
      publishedAt: '2025-06-12',
      sources: [
        { title:'工信部用户满意度报告', url:'https://www.miit.gov.cn/' }
      ]
    },
    {
      id: 'a3',
      title: '“甲醛浑身都是坏处”，新家具一定要晾半年？',
      summary: '甲醛长期超标有害，规范通风有用，但无需“一刀切”半年，视检测值而定。',
      verdict: Verdict.PARTIAL,
      category: '健康',
      heat: 74,
      publishedAt: '2025-06-10',
      sources: [
        { title:'GB/T 18883 室内空气质量标准', url:'https://www.sac.gov.cn/' }
      ]
    },
    {
      id: 'a4',
      title: '吃糖会“喂养”癌细胞？',
      summary: '夸大。糖类为人体能量来源，关键在总能量与代谢健康，非直接“喂养”。',
      verdict: Verdict.FALSE,
      category: '健康',
      heat: 92,
      publishedAt: '2025-06-09',
      sources: [
        { title:'NCI 常见误区答疑', url:'https://www.cancer.gov/' }
      ]
    },
    {
      id: 'a5',
      title: '某地将全面禁止燃油车上牌？',
      summary: '未见正式政策文本，仅为讨论或征求意见阶段。',
      verdict: Verdict.UNCERTAIN,
      category: '公共政策',
      heat: 71,
      publishedAt: '2025-06-07',
      sources: [
        { title:'地方发改委公开信息', url:'#' }
      ]
    },
    {
      id: 'a6',
      title: '喝咖啡会导致骨质疏松？',
      summary: '一般人适量饮用对骨密度影响有限，注意钙摄入与生活方式。',
      verdict: Verdict.PARTIAL,
      category: '健康',
      heat: 65,
      publishedAt: '2025-06-06',
      sources: [
        { title:'Cochrane 系统综述', url:'#' }
      ]
    },
    {
      id: 'a7',
      title: '“一天八杯水”是硬性标准？',
      summary: '并非必须，需求因人而异，口渴即饮、参考尿色。',
      verdict: Verdict.UNCERTAIN,
      category: '健康',
      heat: 59,
      publishedAt: '2025-06-05',
      sources: [ { title:'CDC 补水建议', url:'https://www.cdc.gov/' } ]
    },
    {
      id: 'a8',
      title: '“股票只涨不跌”的新周期？',
      summary: '明显不实，市场有波动与风险，不存在只涨不跌。',
      verdict: Verdict.FALSE,
      category: '财经',
      heat: 83,
      publishedAt: '2025-06-04',
      sources: [ { title:'交易所风险提示', url:'#' } ]
    },
    {
      id: 'a9',
      title: 'AI 模型已完全可靠？',
      summary: '夸张。大模型在特定任务上表现优异，但存在偏差与幻觉风险。',
      verdict: Verdict.PARTIAL,
      category: '科技',
      heat: 77,
      publishedAt: '2025-06-03',
      sources: [ { title:'ACL 论文/评测', url:'#' } ]
    },
    {
      id: 'a10',
      title: '某明星与某企业存在资本关系？',
      summary: '暂无权威工商或公告披露，需进一步核查。',
      verdict: Verdict.UNCERTAIN,
      category: '娱乐',
      heat: 61,
      publishedAt: '2025-06-01',
      sources: [ { title:'企业信息公示系统', url:'#' } ]
    },
  ];

  let state = {
    view: Views.Archive,
    activeTab: 'tab-reco',
    category: '全部',
    search: '',
    subs: loadSubs(), // { id, title, verdict, lastUpdateAt }
  };

  // ----- 工具与存储 -----
  function loadSubs(){
    try{ return JSON.parse(localStorage.getItem('subs')||'[]'); }catch(e){ return []; }
  }
  function saveSubs(){ localStorage.setItem('subs', JSON.stringify(state.subs)); }
  function formatTime(ts){
    const d = new Date(ts);
    return d.toLocaleString('zh-CN', { hour12:false });
  }
  function pickVerdictByHeuristic(text){
    const t = (text||'').toLowerCase();
    if(/只涨不跌|一招|包治|百分之百/.test(text||'')) return Verdict.FALSE;
    if(/研究|数据|报告|或许|部分|取决/.test(text||'')) return Verdict.PARTIAL;
    if(/未经证实|暂无|传闻|待核实/.test(text||'')) return Verdict.UNCERTAIN;
    // 简单随机兜底
    const arr = [Verdict.TRUE, Verdict.PARTIAL, Verdict.FALSE, Verdict.UNCERTAIN];
    return arr[Math.floor(Math.random()*arr.length)];
  }
  function verdictBadge(verdict){
    const cls = VerdictClass[verdict] || 'uncertain';
    return `<span class="badge ${cls}">${verdict}</span>`;
  }

  // ----- 视图/导航 -----
  const navItems = document.querySelectorAll('.bottom-nav .nav-item');
  const views = {
    [Views.Archive]: document.getElementById('view-archive'),
    [Views.Check]: document.getElementById('view-check'),
    [Views.Subs]: document.getElementById('view-subs'),
  };
  navItems.forEach(btn=>{
    btn.addEventListener('click', ()=>{
      const target = btn.dataset.nav;
      switchView(target);
    });
  });
  function switchView(view){
    state.view = view;
    Object.values(views).forEach(v=>v.classList.remove('active'));
    views[view].classList.add('active');
    navItems.forEach(b=>b.classList.toggle('active', b.dataset.nav===view));
    if(view===Views.Archive){
      renderArchive();
    } else if(view===Views.Subs){
      renderSubs();
    }
  }

  // 顶部搜索
  const searchInput = document.getElementById('globalSearchInput');
  const searchBtn = document.getElementById('globalSearchBtn');
  searchInput.addEventListener('input', (e)=>{
    state.search = e.target.value.trim();
    if(state.view===Views.Archive) renderArchive();
  });
  searchBtn.addEventListener('click', ()=>{
    state.search = searchInput.value.trim();
    if(state.view!==Views.Archive) switchView(Views.Archive);
    renderArchive();
  });

  // ----- 档案馆：标签与渲染 -----
  const tabButtons = document.querySelectorAll('#view-archive .tab');
  tabButtons.forEach(b=>{
    b.addEventListener('click', ()=>{
      tabButtons.forEach(x=>x.classList.remove('active'));
      b.classList.add('active');
      state.activeTab = b.dataset.tab;
      document.querySelectorAll('#view-archive .tab-content').forEach(c=>c.classList.remove('active'));
      document.getElementById(state.activeTab).classList.add('active');
      renderArchive();
    });
  });

  const hotListEl = document.getElementById('hotList');
  const discoverGridEl = document.getElementById('discoverGrid');
  const categoryChipsEl = document.getElementById('categoryChips');
  document.getElementById('refreshHotBtn').addEventListener('click', ()=>renderHot(getFilteredItems(), true));

  function getFilteredItems(){
    return archiveItems
      .filter(it=> state.category==='全部' || it.category===state.category)
      .filter(it=> {
        if(!state.search) return true;
        const q = state.search.toLowerCase();
        return it.title.toLowerCase().includes(q) || it.summary.toLowerCase().includes(q);
      });
  }

  function renderArchive(){
    renderChips();
    const filtered = getFilteredItems();
    if(state.activeTab==='tab-discover'){
      renderGrid(discoverGridEl, filtered.sort((a,b)=> b.heat - a.heat));
    }
    renderHot(filtered);
  }

  function renderHot(items, shuffle=false){
    const pool = items && items.length ? items : archiveItems;
    let top = [...pool].sort((a,b)=>b.heat-a.heat).slice(0,6);
    if(shuffle) top.sort(()=>Math.random()-0.5);
    hotListEl.innerHTML = top.map(item=>{
      return `<div class="hot-item" data-id="${item.id}">
        <div class="row space-between">
          <div class="hot-title">${item.title}</div>
          ${verdictBadge(item.verdict)}
        </div>
        <div class="muted" style="margin-top:6px">${item.summary}</div>
        <div class="hot-meta" style="margin-top:8px">
          <span class="chip sm">${item.category}</span>
          <span>热度 ${item.heat}</span>
          <span class="muted">${item.publishedAt || ''}</span>
        </div>
      </div>`;
    }).join('');
    hotListEl.querySelectorAll('.hot-item').forEach(el=>{
      el.addEventListener('click', ()=>openDetail(el.dataset.id));
    });
  }

  function renderChips(){
    categoryChipsEl.innerHTML = categories.map(cat=>{
      const active = state.category===cat ? 'active' : '';
      return `<button class="chip ${active}" data-cat="${cat}">${cat}</button>`;
    }).join('');
    categoryChipsEl.querySelectorAll('.chip').forEach(ch=>{
      ch.addEventListener('click', ()=>{
        state.category = ch.dataset.cat;
        renderArchive();
      });
    });
  }

  function renderGrid(container, items){
    container.innerHTML = items.map(item=>{
      return `<article class="card" data-id="${item.id}">
        <div class="content">
          <div class="row space-between">
            <div class="title">${item.title}</div>
            ${verdictBadge(item.verdict)}
          </div>
          <div class="desc">${item.summary}</div>
          <div class="meta">
            <span class="chip sm">${item.category}</span>
            <span class="muted">${item.publishedAt || ''}</span>
          </div>
        </div>
      </article>`;
    }).join('');
    container.querySelectorAll('.card').forEach(card=>{
      card.addEventListener('click', ()=>openDetail(card.dataset.id));
    });
  }

  // ----- 详情模态 -----
  const modalEl = document.getElementById('detailModal');
  const modalTitleEl = document.getElementById('detailTitle');
  const modalBodyEl = document.getElementById('detailBody');
  const modalSubscribeBtn = document.getElementById('modalSubscribeBtn');
  document.getElementById('closeModalBtn').addEventListener('click', closeModal);
  modalEl.querySelector('.modal-backdrop').addEventListener('click', closeModal);

  let currentDetailId = null;
  function openDetail(id){
    const item = archiveItems.find(x=>x.id===id);
    if(!item) return;
    currentDetailId = id;
    modalTitleEl.textContent = item.title;
    modalBodyEl.innerHTML = `
      <div style="display:flex; align-items:center; gap:8px; margin-bottom:8px">${verdictBadge(item.verdict)}<span class="muted">${item.category}</span></div>
      <div class="muted" style="margin-bottom:8px">${item.summary}</div>
      <div class="evidence-list">
        ${item.sources.map(s=>`<div class="evidence"><div>${s.title}</div><div class="src"><a class="link" href="${s.url}" target="_blank" rel="noopener">来源链接</a></div></div>`).join('')}
      </div>
    `;
    modalSubscribeBtn.onclick = ()=> subscribeTopic({ id: item.id, title: item.title, verdict: item.verdict });
    modalEl.classList.add('show');
    modalEl.classList.remove('hidden');
  }
  function closeModal(){ modalEl.classList.remove('show'); setTimeout(()=>modalEl.classList.add('hidden'), 150); }

  // ----- 查个究竟：表单与结果 -----
  const formEl = document.getElementById('checkForm');
  const submitBtn = document.getElementById('submitCheckBtn');
  const hintEl = document.getElementById('checkHint');
  const resultBox = document.getElementById('checkResult');
  const resultBadgeEl = document.getElementById('resultBadge');
  const resultTitleEl = document.getElementById('resultTitle');
  const resultSummaryEl = document.getElementById('resultSummary');
  const evidenceListEl = document.getElementById('evidenceList');
  const subscribeResultBtn = document.getElementById('subscribeResultBtn');
  const newCheckBtn = document.getElementById('newCheckBtn');

  formEl.addEventListener('submit', async (e)=>{
    e.preventDefault();
    const text = document.getElementById('inputText').value.trim();
    const link = document.getElementById('inputLink').value.trim();
    const video = document.getElementById('inputVideoTitle').value.trim();
    const category = document.getElementById('inputCategory').value;
    const isAnonymous = document.getElementById('isAnonymous').checked;
    const followUpdates = document.getElementById('followUpdates').checked;

    const payloadText = [text, video, link].filter(Boolean).join(' | ');
    if(!payloadText){
      hintEl.textContent = '请至少填写 文本/链接/视频标题 中的一项';
      return;
    }

    submitBtn.disabled = true; submitBtn.textContent = '分析中…'; hintEl.textContent = '正在调用大模型与可信数据源…';

    const verdict = await simulateAiVerdict(payloadText);
    const summary = makeSummaryByVerdict(verdict, payloadText, category);
    const evidence = makeEvidenceByVerdict(verdict, category);

    // 10% 进入核查队列
    const enterQueue = Math.random() < 0.1 || /待核实|暂无/.test(summary);

    renderCheckResult({ title: payloadText.slice(0, 60), verdict, summary, evidence, queue: enterQueue });

    if(followUpdates){
      subscribeTopic({ id: hashId(payloadText), title: payloadText.slice(0, 30) + (payloadText.length>30?'…':''), verdict });
    }

    submitBtn.disabled = false; submitBtn.textContent = '提交核查';
  });

  function renderCheckResult({ title, verdict, summary, evidence, queue }){
    resultBox.classList.remove('hidden');
    resultBadgeEl.className = `badge ${VerdictClass[verdict]}`;
    resultBadgeEl.textContent = verdict + (queue ? ' · 已进入核查队列' : '');
    resultTitleEl.textContent = title;
    resultSummaryEl.textContent = summary;
    evidenceListEl.innerHTML = evidence.map(e=>
      `<div class="evidence"><div>${e.text}</div><div class="src"><a class="link" target="_blank" rel="noopener" href="${e.url}">${e.source}</a></div></div>`
    ).join('');

    subscribeResultBtn.onclick = ()=> subscribeTopic({ id: hashId(title), title, verdict });
    newCheckBtn.onclick = ()=>{ resultBox.classList.add('hidden'); formEl.reset(); };
  }

  function simulateAiVerdict(text){
    return new Promise(resolve=>{
      setTimeout(()=> resolve(pickVerdictByHeuristic(text)), 700 + Math.random()*600);
    });
  }
  function makeSummaryByVerdict(verdict, text, category){
    const base = `针对“${text.slice(0,40)}${text.length>40?'…':''}”，结合公开资料、权威报告与多源信号进行快速核查：`;
    switch(verdict){
      case Verdict.TRUE: return base + '总体属实，信息与多方可信来源一致。';
      case Verdict.PARTIAL: return base + '部分属实，结论依赖前提/语境，需关注限定条件。';
      case Verdict.FALSE: return base + '不实/误导，存在关键事实错误或推断不当。';
      default: return base + '暂无充分证据证实或证伪，建议持续关注权威通告。';
    }
  }
  function makeEvidenceByVerdict(verdict, category){
    const fallback = [
      { text:'主流媒体与事实核查机构报道', url:'#', source:'综合来源' },
      { text:'相关行业/政府公开数据', url:'#', source:'权威数据' },
    ];
    if(category==='健康'){
      return [
        { text:'临床指南/共识与系统综述', url:'#', source:'医学数据库' },
        { text:'国家/国际卫生组织公开指南', url:'#', source:'WHO/CDC 等' },
      ];
    }
    if(category==='科技'){
      return [
        { text:'学术论文与评测基准', url:'#', source:'ACL/NeurIPS 等' },
        { text:'厂商与第三方实验报告', url:'#', source:'白皮书/测试报告' },
      ];
    }
    return fallback;
  }
  function hashId(str){
    let h = 0; for(let i=0;i<str.length;i++){ h = (h<<5)-h + str.charCodeAt(i); h|=0; }
    return 'u'+Math.abs(h);
  }

  function subscribeTopic({ id, title, verdict }){
    if(!state.subs.find(s=>s.id===id)){
      state.subs.unshift({ id, title, verdict, lastUpdateAt: Date.now() });
      saveSubs();
      toast('已关注：'+title);
      renderSubs();
    } else {
      toast('已在订阅列表中');
    }
  }

  // ----- 我的订阅 -----
  const subsListEl = document.getElementById('subsList');
  const subsEmptyEl = document.getElementById('subsEmpty');
  document.getElementById('mockUpdateBtn').addEventListener('click', ()=>{
    if(state.subs.length===0){ toast('暂无订阅可更新'); return; }
    // 随机把一个条目“更新”
    const idx = Math.floor(Math.random()*state.subs.length);
    const s = state.subs[idx];
    const rotate = [Verdict.TRUE, Verdict.PARTIAL, Verdict.FALSE, Verdict.UNCERTAIN];
    s.verdict = rotate[Math.floor(Math.random()*rotate.length)];
    s.lastUpdateAt = Date.now();
    saveSubs();
    renderSubs();
    toast(`话题已更新：${s.title} → ${s.verdict}`);
  });

  function renderSubs(){
    if(state.subs.length===0){
      subsListEl.innerHTML = '';
      subsEmptyEl.classList.remove('hidden');
      return;
    }
    subsEmptyEl.classList.add('hidden');
    subsListEl.innerHTML = state.subs.map(s=>{
      return `<div class="sub-item">
        <div class="row">
          <div style="display:flex; align-items:center; gap:8px">
            ${verdictBadge(s.verdict)}
            <div>${s.title}</div>
          </div>
          <div class="muted">${formatTime(s.lastUpdateAt)}</div>
        </div>
      </div>`;
    }).join('');
  }

  // ----- 轻提示 -----
  function toast(text){
    const el = document.createElement('div');
    el.textContent = text;
    el.style.cssText = 'position:fixed;left:50%;bottom:80px;transform:translateX(-50%);background:#101828;color:#e7ecf3;border:1px solid #243044;padding:10px 12px;border-radius:10px;box-shadow:0 8px 24px rgba(0,0,0,0.35);z-index:9999;font-size:13px';
    document.body.appendChild(el);
    setTimeout(()=>{ el.style.opacity='0'; el.style.transition='opacity .3s'; }, 1400);
    setTimeout(()=> el.remove(), 1800);
  }

  // 初次渲染
  renderArchive();
  renderSubs();

  // 顶部“去档案馆”链接
  document.querySelectorAll('[data-nav="archive"]').forEach(el=>{
    el.addEventListener('click', ()=> switchView(Views.Archive));
  });

})(); 