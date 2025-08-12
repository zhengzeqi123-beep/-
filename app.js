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
    
    // 控制顶部导航栏的显示/隐藏
    const appHeader = document.querySelector('.app-header');
    if (view === Views.Check) {
      // 查个究竟页面隐藏顶部导航栏
      appHeader.style.display = 'none';
    } else {
      // 其他页面显示顶部导航栏
      appHeader.style.display = 'block';
    }
    
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
    
    // 添加全屏模态框类名
    modalEl.classList.add('detail-modal');
    
    modalTitleEl.textContent = item.title;
    
    // 添加返回按钮
    const backBtn = document.createElement('button');
    backBtn.className = 'back-btn';
    backBtn.innerHTML = '← 返回';
    backBtn.onclick = closeModal;
    
    // 清空并重新构建模态框头部
    modalEl.querySelector('.modal-header').innerHTML = '';
    modalEl.querySelector('.modal-header').appendChild(backBtn);
    modalEl.querySelector('.modal-header').appendChild(modalTitleEl);
    
    // 生成与观点一致的图片（使用多模态大模型）
    const imageHtml = generateOpinionImage(item);
    
    // 生成详细的核查结论
    const conclusionHtml = generateDetailedConclusion(item);
    
    // 生成关键证据
    const keyEvidenceHtml = generateKeyEvidence(item);
    
    // 生成附录证据列表
    const appendixHtml = generateEvidenceAppendix(item);
    
    modalBodyEl.innerHTML = `
      <div class="detail-content">
        <!-- 1. 核查结论先行 -->
        <div class="conclusion-section">
          <h4>🔍 核查结论</h4>
          ${conclusionHtml}
        </div>
        
        <!-- 2. 观点相关图片 -->
        <div class="image-section">
          <h4>📸 观点相关图片</h4>
          ${imageHtml}
        </div>
        
        <!-- 3. 核查关键证据 -->
        <div class="evidence-section">
          <h4>🔬 核查关键证据</h4>
          ${keyEvidenceHtml}
        </div>
        
        <!-- 4. 附录-证据列表 -->
        <div class="appendix-section">
          <h4>📚 附录-证据列表</h4>
          ${appendixHtml}
        </div>
      </div>
    `;
    modalSubscribeBtn.onclick = ()=> subscribeTopic({ id: item.id, title: item.title, verdict: item.verdict });
    modalEl.classList.add('show');
    modalEl.classList.remove('hidden');
  }
  
  // 生成与观点一致的图片（使用多模态大模型）
  function generateOpinionImage(item) {
    // 构建图片生成提示词
    const prompt = buildImagePrompt(item);
    
    return `
      <div class="opinion-image-container" style="margin: 12px 0;">
        <div class="image-loading" style="
          width: 100%; 
          height: 200px; 
          background: linear-gradient(135deg, #f3f4f6, #e5e7eb);
          border-radius: 12px; 
          display: flex; 
          flex-direction: column;
          align-items: center; 
          justify-content: center;
          color: var(--text-dim);
          font-size: 14px;
          gap: 12px;
        ">
          <div style="width: 40px; height: 40px; border: 3px solid var(--primary); border-top: 3px solid transparent; border-radius: 50%; animation: spin 1s linear infinite;"></div>
          <div>AI 正在生成图片...</div>
          <div style="font-size: 12px; text-align: center; max-width: 300px; line-height: 1.4;">
            ${prompt}
          </div>
        </div>
        <div class="image-actions" style="margin-top: 12px; text-align: center;">
          <button class="btn btn-secondary" onclick="regenerateImage('${item.id}')" style="font-size: 12px; padding: 8px 16px;">
            🔄 重新生成
          </button>
        </div>
      </div>
    `;
  }
  
  // 构建图片生成提示词
  function buildImagePrompt(item) {
    const categoryPrompts = {
      '健康': '医疗健康场景，专业医学环境',
      '科技': '现代科技设备，数字化界面',
      '社会': '社会事件场景，人群活动',
      '娱乐': '娱乐活动场景，舞台表演',
      '财经': '金融商务场景，数据图表',
      '教育': '教育学习场景，校园环境',
      '公共政策': '政府机构场景，政策文件'
    };
    
    const verdictPrompts = {
      [Verdict.TRUE]: '真实可信，正面积极',
      [Verdict.PARTIAL]: '部分真实，需要谨慎',
      [Verdict.FALSE]: '虚假误导，需要警惕',
      [Verdict.UNCERTAIN]: '无法确定，需要关注'
    };
    
    const category = categoryPrompts[item.category] || '相关场景';
    const verdict = verdictPrompts[item.verdict] || '需要关注';
    
    return `生成一张关于"${item.title}"的图片，场景：${category}，结论：${verdict}，风格：现代简洁，专业可信`;
  }
  
  // 重新生成图片
  function regenerateImage(itemId) {
    const item = archiveItems.find(x => x.id === itemId);
    if (!item) return;
    
    // 这里可以调用实际的AI图片生成API
    // 目前使用模拟的图片生成
    simulateImageGeneration(item);
  }
  
  // 模拟图片生成（实际项目中替换为真实的AI API调用）
  function simulateImageGeneration(item) {
    const imageContainer = document.querySelector('.opinion-image-container');
    if (!imageContainer) return;
    
    // 模拟加载状态
    const loadingEl = imageContainer.querySelector('.image-loading');
    if (loadingEl) {
      loadingEl.innerHTML = `
        <div style="width: 40px; height: 40px; border: 3px solid var(--primary); border-top: 3px solid transparent; border-radius: 50%; animation: spin 1s linear infinite;"></div>
        <div>AI 正在重新生成图片...</div>
      `;
    }
    
    // 模拟生成完成
    setTimeout(() => {
      if (imageContainer) {
        imageContainer.innerHTML = `
          <div class="generated-image" style="
            width: 100%; 
            height: 200px; 
            background: linear-gradient(135deg, var(--primary), #FF9A3D);
            border-radius: 12px; 
            display: flex; 
            align-items: center; 
            justify-content: center;
            color: white;
            font-size: 18px;
            font-weight: bold;
            position: relative;
            overflow: hidden;
          ">
            <div style="
              position: absolute;
              top: 0;
              left: 0;
              right: 0;
              bottom: 0;
              background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 200"><defs><linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="%23FE6A02" stop-opacity="0.8"/><stop offset="100%" stop-color="%23FF9A3D" stop-opacity="0.6"/></defs><rect width="400" height="200" fill="url(%23g)"/><circle cx="100" cy="100" r="30" fill="white" opacity="0.3"/><circle cx="300" cy="80" r="20" fill="white" opacity="0.2"/><circle cx="250" cy="150" r="25" fill="white" opacity="0.25"/></svg>') center/cover;
            "></div>
            <div style="
              position: relative;
              z-index: 2;
              text-align: center;
              text-shadow: 0 2px 4px rgba(0,0,0,0.3);
            ">
              <div style="font-size: 24px; margin-bottom: 8px;">${getOpinionIcon(item.category, item.verdict)}</div>
              <div style="font-size: 14px; opacity: 0.9;">AI 生成图片</div>
            </div>
          </div>
          <div class="image-actions" style="margin-top: 12px; text-align: center;">
            <button class="btn btn-secondary" onclick="regenerateImage('${item.id}')" style="font-size: 12px; padding: 8px 16px;">
              🔄 重新生成
            </button>
          </div>
        `;
      }
    }, 2000);
  }
  
  // 获取观点图标
  function getOpinionIcon(category, verdict) {
    const icons = {
      '健康': '🏥',
      '科技': '💻',
      '社会': '🏛️',
      '娱乐': '🎭',
      '财经': '💰',
      '教育': '📚',
      '公共政策': '⚖️'
    };
    
    const verdictIcons = {
      [Verdict.TRUE]: '✅',
      [Verdict.PARTIAL]: '⚠️',
      [Verdict.FALSE]: '❌',
      [Verdict.UNCERTAIN]: '❓'
    };
    
    return `${icons[category] || '📋'} ${verdictIcons[verdict] || '❓'}`;
  }
  
  // 生成详细的核查结论
  function generateDetailedConclusion(item) {
    const conclusions = {
      [Verdict.TRUE]: {
        title: '✅ 观点属实',
        description: '经过多方权威渠道核查，该观点与事实相符，信息准确可靠。',
        confidence: '可信度：95%'
      },
      [Verdict.PARTIAL]: {
        title: '⚠️ 部分属实',
        description: '该观点在特定条件下成立，但存在限定因素，需要结合具体语境判断。',
        confidence: '可信度：65%'
      },
      [Verdict.FALSE]: {
        title: '❌ 观点不实',
        description: '经过核查发现该观点存在事实错误或误导性表述，与实际情况不符。',
        confidence: '可信度：15%'
      },
      [Verdict.UNCERTAIN]: {
        title: '❓ 无法证伪',
        description: '目前缺乏足够的权威证据来证实或证伪该观点，建议持续关注。',
        confidence: '可信度：40%'
      }
    };
    
    const conclusion = conclusions[item.verdict] || conclusions[Verdict.UNCERTAIN];
    
    return `
      <div class="conclusion-card" style="
        background: #f8fafc; 
        border: 1px solid var(--border); 
        border-radius: 12px; 
        padding: 16px; 
        margin: 12px 0;
      ">
        <div style="font-size: 18px; font-weight: bold; margin-bottom: 8px; color: var(--text);">
          ${conclusion.title}
        </div>
        <div style="color: var(--text-dim); margin-bottom: 8px; line-height: 1.5;">
          ${conclusion.description}
        </div>
        <div style="font-size: 14px; color: var(--primary); font-weight: 600;">
          ${conclusion.confidence}
        </div>
      </div>
    `;
  }
  
  // 生成关键证据
  function generateKeyEvidence(item) {
    const evidenceCount = getEvidenceCount(item.category);
    const evidence = generateDetailedEvidence(item, evidenceCount);
    
    return `
      <div class="key-evidence">
        ${evidence.map((e, index) => `
          <div class="evidence-item" style="
            background: white; 
            border: 1px solid var(--border); 
            border-radius: 10px; 
            padding: 12px; 
            margin: 8px 0;
          ">
            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
              <span style="
                background: var(--primary); 
                color: white; 
                width: 20px; 
                height: 20px; 
                border-radius: 50%; 
                display: flex; 
                align-items: center; 
                justify-content: center; 
                font-size: 12px; 
                font-weight: bold;
              ">${index + 1}</span>
              <span style="font-weight: 600; color: var(--text);">${e.title}</span>
            </div>
            <div style="color: var(--text-dim); font-size: 14px; line-height: 1.5; margin-bottom: 8px;">
              ${e.description}
            </div>
            <div style="font-size: 12px; color: var(--primary);">
              来源：<a href="${e.url}" target="_blank" class="link">${e.source}</a>
            </div>
          </div>
        `).join('')}
      </div>
    `;
  }
  
  // 获取证据数量
  function getEvidenceCount(category) {
    const specialCategories = ['人物言论核查', '学术引用核查', '新闻热点核查'];
    return specialCategories.includes(category) ? 1 : 3;
  }
  
  // 生成详细证据
  function generateDetailedEvidence(item, count) {
    const evidenceTemplates = {
      '健康': [
        { title: '医学研究证据', description: '基于临床研究数据和医学指南的权威结论', source: '医学数据库', url: '#' },
        { title: '专家共识意见', description: '相关领域专家达成的专业共识和推荐意见', source: '医学会', url: '#' },
        { title: '国际标准参考', description: 'WHO、CDC等国际权威机构的官方建议', source: '国际组织', url: '#' }
      ],
      '科技': [
        { title: '学术论文验证', description: '经过同行评议的学术研究成果和实验数据', source: '学术期刊', url: '#' },
        { title: '技术评测报告', description: '第三方机构的技术评测和性能分析报告', source: '评测机构', url: '#' },
        { title: '行业标准规范', description: '相关技术领域的行业标准和规范要求', source: '标准组织', url: '#' }
      ],
      '社会': [
        { title: '官方数据统计', description: '政府部门发布的权威统计数据和分析报告', source: '政府机构', url: '#' },
        { title: '权威媒体报道', description: '主流媒体的深度调查和事实核查报道', source: '新闻媒体', url: '#' },
        { title: '专家分析解读', description: '相关领域专家的专业分析和权威解读', source: '专家观点', url: '#' }
      ],
      '娱乐': [
        { title: '官方声明确认', description: '相关方发布的官方声明和确认信息', source: '官方渠道', url: '#' },
        { title: '权威媒体报道', description: '主流娱乐媒体的核实报道和追踪', source: '娱乐媒体', url: '#' },
        { title: '法律文件记录', description: '相关的法律文件和官方记录信息', source: '法律记录', url: '#' }
      ],
      '财经': [
        { title: '财务数据披露', description: '上市公司或机构的财务数据公开披露', source: '财务报告', url: '#' },
        { title: '监管机构信息', description: '证监会、银保监会等监管机构的信息', source: '监管机构', url: '#' },
        { title: '专业机构分析', description: '专业金融机构的研究报告和分析', source: '金融机构', url: '#' }
      ],
      '教育': [
        { title: '教育政策文件', description: '教育部等机构发布的政策文件', source: '教育部门', url: '#' },
        { title: '学术研究成果', description: '教育领域的学术研究和实证数据', source: '学术研究', url: '#' },
        { title: '专家评估报告', description: '教育专家的评估报告和建议', source: '专家评估', url: '#' }
      ],
      '公共政策': [
        { title: '政策文件原文', description: '相关政策的正式文件和法律条文', source: '政策文件', url: '#' },
        { title: '官方解读说明', description: '政府部门对政策的官方解读和说明', source: '官方解读', url: '#' },
        { title: '专家分析意见', description: '政策研究专家的分析和建议', source: '专家分析', url: '#' }
      ]
    };
    
    const template = evidenceTemplates[item.category] || evidenceTemplates['社会'];
    return template.slice(0, count);
  }
  
  // 生成附录证据列表
  function generateEvidenceAppendix(item) {
    return `
      <div class="evidence-appendix">
        ${item.sources.map((source, index) => `
          <div class="appendix-item" style="
            background: #f8fafc; 
            border: 1px solid var(--border); 
            border-radius: 8px; 
            padding: 12px; 
            margin: 8px 0;
          ">
            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 6px;">
              <span style="
                background: var(--primary); 
                color: white; 
                width: 16px; 
                height: 16px; 
                border-radius: 50%; 
                display: flex; 
                align-items: center; 
                justify-content: center; 
                font-size: 10px; 
                font-weight: bold;
              ">${index + 1}</span>
              <span style="font-weight: 600; color: var(--text);">${source.title}</span>
            </div>
            <div style="margin-bottom: 8px;">
              <a href="${source.url}" target="_blank" class="link" style="color: var(--primary); text-decoration: none;">
                🔗 查看原文链接
              </a>
            </div>
            <div style="font-size: 12px; color: var(--text-dim); font-style: italic;">
              "相关权威信息请参考官方发布内容"
            </div>
          </div>
        `).join('')}
      </div>
    `;
  }
  function closeModal(){ 
    modalEl.classList.remove('show'); 
    // 移除全屏类名
    modalEl.classList.remove('detail-modal');
    // 重置模态框头部
    setTimeout(()=>{
      modalEl.classList.add('hidden');
      // 恢复原始模态框头部结构
      const header = modalEl.querySelector('.modal-header');
      header.innerHTML = `
        <div class="modal-title" id="detailTitle">观点详情</div>
        <button id="closeModalBtn" class="icon-btn" aria-label="关闭">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          </svg>
        </button>
      `;
      // 重新绑定关闭按钮事件
      document.getElementById('closeModalBtn').addEventListener('click', closeModal);
      
      // 确保底部导航栏图标正常显示
      ensureBottomNavIcons();
    }, 150); 
  }
  
  // 确保底部导航栏图标正常显示
  function ensureBottomNavIcons() {
    const navItems = document.querySelectorAll('.bottom-nav .nav-item');
    navItems.forEach((item, index) => {
      const iconSpan = item.querySelector('.icon');
      if (iconSpan && !iconSpan.querySelector('svg')) {
        // 只有当没有内联SVG时才设置CSS掩膜类名
        if (index === 0) {
          iconSpan.className = 'icon icon-mask';
        } else if (index === 1) {
          iconSpan.className = 'icon icon-mask-hecha';
        } else if (index === 2) {
          iconSpan.className = 'icon icon-mask-dingyue';
        }
      }
    });
  }

  // ----- 查个究竟：表单与结果 -----
  const checkInput = document.getElementById('checkInput');
  const uploadFileBtn = document.getElementById('uploadFileBtn');
  const sendCheckBtn = document.getElementById('sendCheckBtn');
  const fileInput = document.getElementById('fileInput');

  // 文件上传功能
  uploadFileBtn.addEventListener('click', () => {
    fileInput.click();
  });

  fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
      // 显示文件名在输入框中
      checkInput.value = `已选择文件: ${file.name}`;
      checkInput.disabled = true;
      
      // 可以在这里添加文件预览或其他处理逻辑
      console.log('选择的文件:', file);
    }
  });

  // 发送核查请求
  sendCheckBtn.addEventListener('click', async () => {
    const inputText = checkInput.value.trim();
    if (!inputText) {
      showToast('请输入要核查的内容');
      return;
    }

    // 禁用输入和按钮
    checkInput.disabled = true;
    sendCheckBtn.disabled = true;
    
    // 显示加载状态
    sendCheckBtn.innerHTML = `
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" style="animation: spin 1s linear infinite;">
        <path d="M12 2a10 10 0 0 0-10 10c0 5.5 4.5 10 10 10s10-4.5 10-10S17.5 2 12 2zm0 18a8 8 0 1 1 8-8 8 8 0 0 1-8 8z"/>
        <path d="M12 6v6l4 2" stroke="currentColor" stroke-width="2" fill="none"/>
      </svg>
    `;

    try {
      // 模拟AI核查过程
      const verdict = await simulateAiVerdict(inputText);
      const summary = makeSummaryByVerdict(verdict, inputText, '全部');
      const evidence = makeEvidenceByVerdict(verdict, '全部');

      // 显示核查结果
      showCheckResult({
        title: inputText.slice(0, 60),
        verdict,
        summary,
        evidence
      });

      // 重置输入框
      checkInput.value = '';
      checkInput.disabled = false;
      
    } catch (error) {
      showToast('核查过程中出现错误，请重试');
      console.error('核查错误:', error);
    } finally {
      // 恢复按钮状态
      sendCheckBtn.disabled = false;
      sendCheckBtn.innerHTML = `
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <path d="M22 2L11 13"/>
          <path d="M22 2l-7 20-4-9-9-4 20-7z"/>
        </svg>
      `;
    }
  });

  // 回车键发送
  checkInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendCheckBtn.click();
    }
  });

  // 显示核查结果
  function showCheckResult({ title, verdict, summary, evidence }) {
    // 创建结果模态框
    const resultModal = document.createElement('div');
    resultModal.className = 'modal show';
    resultModal.innerHTML = `
      <div class="modal-backdrop"></div>
      <div class="modal-content detail-modal">
        <div class="modal-header">
          <button class="back-btn" onclick="this.closest('.modal').remove()">← 返回</button>
          <div class="modal-title">核查结果</div>
        </div>
        <div class="modal-body">
          <div class="detail-content">
            <!-- 核查结论 -->
            <div class="conclusion-section">
              <h4>🔍 核查结论</h4>
              <div class="conclusion-card" style="
                background: #f8fafc; 
                border: 1px solid var(--border); 
                border-radius: 12px; 
                padding: 16px; 
                margin: 12px 0;
              ">
                <div style="font-size: 18px; font-weight: bold; margin-bottom: 8px; color: var(--text);">
                  ${getVerdictTitle(verdict)}
                </div>
                <div style="color: var(--text-dim); margin-bottom: 8px; line-height: 1.5;">
                  ${summary}
                </div>
                <div style="font-size: 14px; color: var(--primary); font-weight: 600;">
                  ${getVerdictConfidence(verdict)}
                </div>
              </div>
            </div>
            
            <!-- 关键证据 -->
            <div class="evidence-section">
              <h4>🔬 核查关键证据</h4>
              <div class="key-evidence">
                ${evidence.map((e, index) => `
                  <div class="evidence-item" style="
                    background: white; 
                    border: 1px solid var(--border); 
                    border-radius: 10px; 
                    padding: 12px; 
                    margin: 8px 0;
                  ">
                    <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
                      <span style="
                        background: var(--primary); 
                        color: white; 
                        width: 20px; 
                        height: 20px; 
                        border-radius: 50%; 
                        display: flex; 
                        align-items: center; 
                        justify-content: center; 
                        font-size: 12px; 
                        font-weight: bold;
                      ">${index + 1}</span>
                      <span style="font-weight: 600; color: var(--text);">${e.text}</span>
                    </div>
                    <div style="color: var(--text-dim); font-size: 14px; line-height: 1.5;">
                      ${e.description || '相关权威信息'}
                    </div>
                    <div style="font-size: 12px; color: var(--primary);">
                      来源：${e.source}
                    </div>
                  </div>
                `).join('')}
              </div>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-primary" onclick="this.closest('.modal').remove()">完成</button>
        </div>
      </div>
    `;
    
    document.body.appendChild(resultModal);
  }

  // 获取核查结论标题
  function getVerdictTitle(verdict) {
    const titles = {
      [Verdict.TRUE]: '✅ 观点属实',
      [Verdict.PARTIAL]: '⚠️ 部分属实',
      [Verdict.FALSE]: '❌ 观点不实',
      [Verdict.UNCERTAIN]: '❓ 无法证伪'
    };
    return titles[verdict] || titles[Verdict.UNCERTAIN];
  }

  // 获取可信度
  function getVerdictConfidence(verdict) {
    const confidence = {
      [Verdict.TRUE]: '可信度：95%',
      [Verdict.PARTIAL]: '可信度：65%',
      [Verdict.FALSE]: '可信度：15%',
      [Verdict.UNCERTAIN]: '可信度：40%'
    };
    return confidence[verdict] || confidence[Verdict.UNCERTAIN];
  }

  // 显示提示信息
  function showToast(text) {
    const el = document.createElement('div');
    el.textContent = text;
    el.style.cssText = 'position:fixed;left:50%;bottom:80px;transform:translateX(-50%);background:#101828;color:#e7ecf3;border:1px solid #243044;padding:10px 12px;border-radius:10px;box-shadow:0 8px 24px rgba(0,0,0,0.35);z-index:9999;font-size:13px';
    document.body.appendChild(el);
    setTimeout(()=>{ el.style.opacity='0'; el.style.transition='opacity .3s'; }, 1400);
    setTimeout(()=> el.remove(), 1800);
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
  
  // 确保底部导航栏图标正确显示
  ensureBottomNavIcons();
  
  // 设置初始页面状态（查个究竟页面不显示顶部导航栏）
  const appHeader = document.querySelector('.app-header');
  if (state.view === Views.Check) {
    appHeader.style.display = 'none';
  }

  // 顶部"去档案馆"链接
  document.querySelectorAll('[data-nav="archive"]').forEach(el=>{
    el.addEventListener('click', ()=> switchView(Views.Archive));
  });

})(); 