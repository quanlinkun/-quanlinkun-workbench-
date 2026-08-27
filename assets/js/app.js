// ====== 全麟坤的工作台 · 主逻辑 ======
const $ = (s) => document.querySelector(s);
const $$ = (s) => document.querySelectorAll(s);
const D = window.APP_DATA;

function esc(s){ return (s ?? "").toString().replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c])); }

/* ---------- 主题 ---------- */
function applyTheme(t){
  document.documentElement.setAttribute("data-theme", t);
  localStorage.setItem("wb_theme", t);
}
function initTheme(){
  const t = localStorage.getItem("wb_theme") || "light";
  applyTheme(t);
}

/* ---------- 侧边栏 ---------- */
function renderNav(){
  const nav = $("#nav");
  nav.innerHTML = "";
  D.sections.forEach(s => {
    const b = document.createElement("button");
    b.className = "nav-item";
    b.dataset.page = s.id;
    b.innerHTML = `${s.icon} ${esc(s.name)}`;
    b.onclick = () => { go(s.id); closeSidebar(); };
    nav.appendChild(b);
  });
}

function markActive(page){
  $$(".nav-item").forEach(b => b.classList.toggle("active", b.dataset.page === page));
}

/* ---------- 路由 ---------- */
const routes = {
  home: renderHome, news: renderNews, ielts: renderIelts, math: renderMath,
  music: renderMusic, novel: renderNovel, calendar: renderCalendar,
  bookmarks: renderBookmarks, search: renderSearch, settings: renderSettings,
};
const TITLES = {
  home: "🏠 首页", news: "📰 新闻大事", ielts: "🎓 英语雅思学习", math: "📐 数学学习",
  music: "🎵 音乐", novel: "✍️ 小说创作", calendar: "📅 日历", bookmarks: "🔖 收藏夹",
  search: "🔍 全局搜索", settings: "⚙️ 设置",
};
function go(page){
  if (!routes[page]) page = "home";
  $("#content").innerHTML = "";
  $("#pageTitle").textContent = "";
  $("#pageTitle").innerHTML = TITLES[page];
  $("#topActions").innerHTML = "";
  routes[page]();
  markActive(page);
  window.scrollTo(0,0);
}

/* ---------- 首页 ---------- */
function lunar(date){
  // 简易农历近似（仅显示文本，不做精确天文计算）
  const s = "甲乙丙丁戊己庚辛壬癸", e = "子丑寅卯辰巳午未申酉戌亥";
  const gan = s[(date.getFullYear()-4)%10], zhi = e[(date.getFullYear()-4)%12];
  return `${gan}${zhi}年`;
}
function renderHome(){
  const now = new Date();
  const week = ["星期日","星期一","星期二","星期三","星期四","星期五","星期六"][now.getDay()];
  const q = D.quotes[now.getDate() % D.quotes.length];
  const favs = (loadBookmarks()).slice(0,3);
  const c = document.createElement("div"); c.className = "page";
  let cards = "";
  [...D.quickLinks, ...D.quickLinks2].forEach(q2 => {
    cards += `<button class="card grid-card" style="text-align:left;cursor:pointer;border:none" onclick="go('${q2.page}')">
      <div style="font-size:30px">${q2.icon}</div>
      <h3>${q2.icon} ${esc(q2.name)}</h3>
      <p class="muted">${esc(q2.desc)}</p></button>`;
  });
  c.innerHTML = `
    <div class="card" style="margin-bottom:16px">
      <h2>📅 ${now.getFullYear()}年${now.getMonth()+1}月${now.getDate()}日 · ${week}</h2>
      <p style="font-size:18px;margin:6px 0">${lunar(now)} · ${q}</p>
    </div>
    <h3 style="margin:18px 0 10px">🔗 板块快捷入口</h3>
    <div class="grid grid-cols-4">${cards}</div>
    <div class="grid grid-cols-2" style="margin-top:18px">
      <div class="card">
        <h3>✅ 今日待办</h3>
        <ul class="clean" id="homeTodos"></ul>
        <div class="row" style="margin-top:8px">
          <input id="htInput" placeholder="➕ 添加待办…" />
          <button class="btn" onclick="addHomeTodo()">➕ 添加</button>
        </div>
      </div>
      <div class="card">
        <h3>⭐ 最近收藏</h3>
        ${favs.length ? favs.map(f => `<div style="margin:8px 0">${f.icon} <a href="${esc(f.url)}" target="_blank" style="color:var(--red-dark)">${esc(f.title)}</a> <span class="muted">· ${esc(f.note||'')}</span></div>`).join("") : '<p class="muted">暂无收藏</p>'}
      </div>
    </div>`;
  $("#content").appendChild(c);
  renderHomeTodos();
}

function addHomeTodo(){
  const v = $("#htInput").value.trim();
  if (!v) return;
  const t = loadJSON("wb_todos", []);
  t.push({ id: Date.now(), text: v, done: false });
  saveJSON("wb_todos", t);
  $("#htInput").value = ""; renderHomeTodos();
}
function renderHomeTodos(){
  const t = loadJSON("wb_todos", []);
  const ul = $("#homeTodos"); if (!ul) return;
  ul.innerHTML = t.length ? t.map(x => `<li><label style="display:flex;gap:8px;font-weight:400;margin:0"><input type="checkbox" ${x.done?'checked':''} onchange="toggleTodo(${x.id})"> ${esc(x.text)}</label></li>`).join("") : '<li class="muted">暂无待办，添加一个吧 ✍️</li>';
}
function toggleTodo(id){
  const t = loadJSON("wb_todos", []);
  const x = t.find(z=>z.id===id); if(x) x.done=!x.done;
  saveJSON("wb_todos", t); renderHomeTodos();
}

/* ---------- 新闻 ---------- */
function renderNews(){
  const c = document.createElement("div"); c.className = "page";
  const cats = Object.keys(RSS_FEEDS);
  const tabs = cats.map((k,i)=>`<button class="tab ${i===0?'active':''}" data-cat="${k}">${RSS_FEEDS[k].label}</button>`).join("");
  c.innerHTML = `
    <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:10px">
      <div class="tabs" id="newsTabs">${tabs}</div>
      <button class="btn" id="refreshNews">🔄 刷新</button>
    </div>
    <div id="newsList"><p class="muted">⏳ 正在加载新闻…</p></div>`;
  $("#content").appendChild(c);
  $$("#newsTabs .tab").forEach(t => t.onclick = () => {
    $$("#newsTabs .tab").forEach(x=>x.classList.remove("active"));
    t.classList.add("active"); loadNews(t.dataset.cat);
  });
  $("#refreshNews").onclick = () => loadNews($("#newsTabs .tab.active").dataset.cat, true);
  loadNews(cats[0]);
}
async function loadNews(cat, force){
  const box = $("#newsList");
  box.innerHTML = '<p class="muted">⏳ 加载中…</p>';
  try {
    const r = await getNews(cat, force);
    if (!r.items || !r.items.length) throw new Error("empty");
    const stamp = r.cached
      ? "📦 缓存于 " + new Date(r.fetchedAt).toLocaleString("zh-CN", {hour:"2-digit",minute:"2-digit"})
      : "🟢 实时更新";
    const head = `<div class="news-stamp">${RSS_FEEDS[cat].label} · ${stamp} · 共 ${r.items.length} 条<br><span class="muted">每日自动刷新，缓存 20 分钟</span></div>`;
    box.innerHTML = head + r.items.map(it => {
      const okLink = /^https?:\/\//.test(it.link || "");
      const href = okLink ? it.link : "https://www.baidu.com/s?wd=" + encodeURIComponent(it.title);
      const fix = okLink ? "" : ' <span class="news-fallback">🔍 原文链接已失效，已改为搜索</span>';
      return `
      <div class="news-item">
        <a href="${esc(href)}" target="_blank" rel="noopener">${esc(it.title)}</a>${fix}
        <div class="news-meta">🕒 ${esc(timeAgo(it.date))}${it.date? " · " + esc(String(it.date).slice(0,16)) : ""} · ${esc(it.desc.slice(0,80))}</div>
      </div>`;
    }).join("");
  } catch(e){
    box.innerHTML = `<p class="muted">⚠️ 新闻加载失败（可能网络受限或 RSS 源不可用）。已尝试代理仍失败，请点击🔄重试或检查网络。</p>`;
  }
}

/* ---------- 雅思 ---------- */
function collapsible(title, inner){ return `<details class="collapsible"><summary>${title}</summary>${inner}</details>`; }
function renderIelts(){
  const data = D.ielts;
  const tabs = [["listening","👂 听力"],["speaking","🗣️ 口语"],["reading","📖 阅读"],["writing","✍️ 写作"],["vocab","📚 单词背诵"]];
  const c = document.createElement("div"); c.className="page";
  c.innerHTML = `<div class="tabs" id="ieltsTabs">${tabs.map((t,i)=>`<button class="tab ${i===0?'active':''}" data-k="${t[0]}">${t[1]}</button>`).join("")}</div><div id="ieltsBody"></div>`;
  $("#content").appendChild(c);
  function body(k){
    let h = "";
    if(k==="listening"){
      h += `<div class="card"><h3>📊 评分标准</h3><ul class="clean">${data.listening.score.map(x=>`<li>${x}</li>`).join("")}</ul></div>`;
      h += `<div class="card"><h3>🔤 高频场景词汇（${data.listening.vocab.length}）</h3><p>${data.listening.vocab.map(v=>`<span class="chip">${esc(v)}</span>`).join("")}</p></div>`;
      h += `<div class="card"><h3>💡 听力技巧</h3><ul class="clean">${data.listening.tips.map(x=>`<li>${x}</li>`).join("")}</ul></div>`;
      h += `<div class="card"><h3>🌐 推荐练习网站</h3>${data.listening.sites.map(s=>`<div>🔗 <a href="${esc(s.url)}" target="_blank" style="color:var(--red-dark)">${esc(s.name)}</a></div>`).join("")}</div>`;
    }
    if(k==="speaking"){
      h += `<div class="card"><h3>📝 Part 1 高频话题</h3><ul class="clean">${data.speaking.part1.map(x=>`<li>❓${x}</li>`).join("")}</ul></div>`;
      h += `<div class="card"><h3>📝 Part 2 高频话题</h3><ul class="clean">${data.speaking.part2.map(x=>`<li>📌${x}</li>`).join("")}</ul></div>`;
      h += `<div class="card"><h3>📝 Part 3 高频话题</h3><ul class="clean">${data.speaking.part3.map(x=>`<li>💬${x}</li>`).join("")}</ul></div>`;
      h += collapsible("📋 答题模板", `<p>${data.speaking.template}</p>`);
      h += `<div class="card"><h3>🔗 高分连接词</h3><p>${data.speaking.connectors.map(v=>`<span class="chip">${esc(v)}</span>`).join("")}</p></div>`;
      h += `<div class="card"><h3>🎙️ 发音技巧</h3><ul class="clean">${data.speaking.pron.map(x=>`<,li>${x}</li>`).join("")}</ul></div>`;
    }
    if(k==="reading"){
      h += `<div class="card"><h3>📚 阅读题型（${data.reading.types.length}）</h3>${data.reading.types.map(t=>collapsible(t.t,`<p>${t.d}</p>`)).join("")}</div>`;
      h += `<div class="card"><h3>🔤 高频学术词汇（${data.reading.vocab.length}）</h3><p>${data.reading.vocab.map(v=>`<span class="chip">${esc(v)}</span>`).join("")}</p></div>`;
      h += collapsible("🌳 长难句分析示例", `<p>${data.reading.longsentence}</p>`);
    }
    if(k==="writing"){
      h += `<div class="card"><h3>📈 小作文图表类型（${data.writing.smallTypes.length}）</h3>${data.writing.smallTypes.map(t=>collapsible(t.t,`<p>${esc(t.s)}</p>`)).join("")}</div>`;
      h += `<div class="card"><h3>📝 大作文话题（${data.writing.bigTopics.length}）</h3>${data.writing.bigTopics.map(t=>collapsible(t.t,`<p>${esc(t.f)}</p>`)).join("")}</div>`;
      h += `<div class="card"><h3>🔗 连接词表</h3><p>${data.writing.connectors.map(v=>`<span class="chip">${esc(v)}</span>`).join("")}</p></div>`;
      h += collapsible("📋 评分标准解读", `<p>${data.writing.criteria}</p>`);
    }
    if(k!=="vocab" && data.practice[k]){
      h += `<div class="card"><h3>📝 配套练习题（真实雅思题型）</h3>${data.practice[k].map((p,i)=>collapsible(`练习 ${i+1}：${esc(p.q.split("\n")[0])}`, `<pre class="pre-wrap">${esc(p.q)}</pre><p class="ans">✅ 答案：${esc(p.a)}</p>`)).join("")}</div>`;
    }
    if(k==="vocab"){ h += renderVocab(); }
    $("#ieltsBody").innerHTML = h;
    if(k==="vocab") initVocab();
  }
  body("listening");
  $$("#ieltsTabs .tab").forEach(t=>t.onclick=()=>{
    $$("#ieltsTabs .tab").forEach(x=>x.classList.remove("active")); t.classList.add("active"); body(t.dataset.k);
  });
}

/* ---------- 雅思单词背诵 ---------- */
function renderVocab(){
  return `
  <div class="card">
    <h3>📚 我的单词本</h3>
    <p class="muted">上传 txt（每行「单词 释义」或「单词,释义」），或手动添加。数据仅存本地。</p>
    <div style="display:flex;flex-wrap:wrap;gap:8px;margin:8px 0">
      <input id="vbWord" placeholder="单词" style="padding:8px;border:1px solid var(--gold);border-radius:8px">
      <input id="vbMean" placeholder="释义" style="padding:8px;border:1px solid var(--gold);border-radius:8px;flex:1;min-width:120px">
      <button class="btn" onclick="vbAdd()">➕ 添加</button>
      <label class="btn ghost" style="cursor:pointer">📁 上传txt<input type="file" id="vbFile" accept=".txt" style="display:none" onchange="vbUpload(this)"></label>
      <button class="btn ghost" onclick="vbExport()">⬇️ 导出</button>
    </div>
    <div id="vbStats" class="muted"></div>
  </div>
  <div class="card">
    <div id="vbFlash" class="flashcard" onclick="vbFlip()"><div id="vbFront"></div></div>
    <div style="display:flex;gap:10px;margin-top:12px">
      <button class="btn" onclick="vbNext(false)">⬜ 不认识</button>
      <button class="btn" onclick="vbNext(true)">✅ 认识</button>
    </div>
    <div id="vbList" style="margin-top:12px"></div>
  </div>`;
}
function vbLoad(){ try { return JSON.parse(localStorage.getItem("wb_vocab")||"[]"); } catch(e){ return []; } }
function vbSave(a){ localStorage.setItem("wb_vocab", JSON.stringify(a)); }
function initVocab(){ window._vbIdx = 0; window._vbFlipped = false; vbRender(); }
function vbRender(){
  const a = vbLoad();
  $("#vbStats").textContent = "共 " + a.length + " 个单词";
  const front = $("#vbFront");
  if(!a.length){ front.innerHTML = '<span class="muted">暂无单词，先添加或上传吧～</span>'; $("#vbList").innerHTML=""; return; }
  const cur = a[window._vbIdx % a.length];
  front.innerHTML = window._vbFlipped ? '<b style="color:var(--red-dark)">'+esc(cur.mean)+'</b>' : '<b style="font-size:22px">'+esc(cur.word)+'</b>';
  let html = '<p class="muted" style="margin-top:8px">全部单词：</p>';
  html += a.map(w=>`<span class="chip">${esc(w.word)} · ${esc(w.mean)}</span>`).join("");
  $("#vbList").innerHTML = html;
}
function vbFlip(){ window._vbFlipped = !window._vbFlipped; vbRender(); }
function vbNext(known){
  const a = vbLoad(); if(!a.length) return;
  if(known){ const w=a.splice(window._vbIdx,1); a.push(w[0]); vbSave(a); }
  window._vbIdx = (window._vbIdx + 1) % a.length;
  window._vbFlipped = false; vbRender();
}
function vbAdd(){
  const w = $("#vbWord").value.trim(), m = $("#vbMean").value.trim();
  if(!w||!m) return;
  const a = vbLoad(); a.push({word:w, mean:m}); vbSave(a);
  $("#vbWord").value=""; $("#vbMean").value=""; initVocab();
}
function vbUpload(input){
  const f = input.files[0]; if(!f) return;
  const r = new FileReader();
  r.onload = e => {
    const a = vbLoad();
    e.target.result.split(/\r?\n/).forEach(line=>{
      const t = line.trim(); if(!t) return;
      let parts = t.split(/[,，\t]/);
      let w = parts[0], m = parts.slice(1).join(",").trim();
      if(!m){ const sp = t.indexOf(" "); if(sp>0){ w=t.slice(0,sp); m=t.slice(sp+1).trim(); } else { w=t; m=""; } }
      a.push({word:w.trim(), mean:m});
    });
    vbSave(a); initVocab();
  };
  r.readAsText(f);
}
function vbExport(){
  const a = vbLoad(); if(!a.length) return;
  const txt = a.map(w=>w.word+"\t"+w.mean).join("\n");
  const blob = new Blob([txt], {type:"text/plain;charset=utf-8"});
  const link = document.createElement("a"); link.href = URL.createObjectURL(blob); link.download="我的单词表.txt"; link.click();
}

/* ---------- 数学 ---------- */
function renderMath(){
  const data = D.math;
  const tabs = [["high","📚 高中数学"],["calculus","∫ 高等数学"],["linear","📊 线性代数"],["topology","🔄 拓扑学"],["qiangji","🏆 强基计划"]];
  const c = document.createElement("div"); c.className="page";
  c.innerHTML = `<div class="tabs" id="mathTabs">${tabs.map((t,i)=>`<button class="tab ${i===0?'active':''}" data-k="${t[0]}">${t[1]}</button>`).join("")}</div><div id="mathBody"></div>`;
  $("#content").appendChild(c);
  function body(k){
    let h = renderMathUser();
    h += `<div class="card"><h3>${data[k].title}</h3></div>`;
    const d = data[k];
    if(k==="high"){
      h += `<div class="card"><h3>📦 知识模块与公式</h3>${d.modules.map(m=>`<div style="margin:8px 0"><b>📘 ${m.name}</b><ul class="clean">${m.formulas.map(f=>`<li><code>${esc(f)}</code></li>`).join("")}</ul></div>`).join("")}</div>`;
      h += `<div class="card"><h3>📝 经典例题</h3>${d.examples.map((e,i)=>collapsible(`例题 ${i+1}：${esc(e.q)}`,`<p>✅ ${esc(e.a)}</p>`)).join("")}</div>`;
    }
    if(k==="calculus"){
      h += `<div class="card"><h3>📚 章节框架</h3><p>${d.chapters.map(c=>`<span class="chip">${esc(c)}</span>`).join("")}</p></div>`;
      h += `<div class="card"><h3>📜 核心定理</h3><ul class="clean">${d.theorems.map(t=>`<li>🔑 ${esc(t)}</li>`).join("")}</ul></div>`;
      h += `<div class="card"><h3>🧮 常用公式</h3><p>${d.formulas.map(f=>`<code style="display:inline-block;margin:4px">${esc(f)}</code>`).join(" ")}</p></div>`;
      h += `<div class="card"><h3>📝 典型例题</h3>${d.examples.map((e,i)=>collapsible(`例题 ${i+1}：${esc(e.q)}`,`<p>✅ ${esc(e.a)}</p>`)).join("")}</div>`;
    }
    if(k==="linear"){
      h += `<div class="card"><h3>🗂️ 知识框架</h3><p>${d.framework.map(f=>`<span class="chip">${esc(f)}</span>`).join("")}</p></div>`;
      h += `<div class="card"><h3>🧮 核心公式</h3><p>${d.formulas.map(f=>`<code style="display:inline-block;margin:4px">${esc(f)}</code>`).join(" ")}</p></div>`;
      h += `<div class="card"><h3>📜 重要定理</h3><ul class  ="clean">${d.theorems.map(t=>`<li>🔑 ${esc(t)}</li>`).join("")}</ul></div>`;
      h += `<div class="card"><h3>📝 典型例题</h3>${d.examples.map((e,i)=>collapsible(`例题 ${i+1}：${esc(e.q)}`,`<p>✅ ${esc(e.a)}</p>`)).join("")}</div>`;
    }
    if(k==="topology"){
      h += `<div class="card"><h3>📖 基础概念清单</h3><p>${d.concepts.map(c=>`<span class="chip">${esc(c)}</span>`).join("")}</p></div>`;
      h += `<div class="card"><h3>📐 核心定义</h3><ul class="clean">${d.definitions.map(x=>`<li>${x}</li>`).join("")}</ul></div>`;
      h += `<div class="card"><h3>🏆 经典结论</h3><ul class="clean">${d.conclusions.map(x=>`<li>${x}</li>`).join("")}</ul></div>`;
    }
    if(k==="qiangji"){
      h += `<div class="card"><h3>📋 强基计划介绍</h3><p>${d.intro}</p></div>`;
      h += `<div class="card"><h3>🏫 招生院校</h3><p>${d.schools.map(s=>`<span class="chip">${esc(s)}</span>`).join("")}</p></div>`;
      h += `<div class="card"><h3>🧩 竞赛知识点</h3><ul class="clean">${d.contest.map(x=>`<li>${x}</li>`).join("")}</ul></div>`;
      h += `<div class="card"><h3>📝 真题示例</h3>${d.examples.map((e,i)=>collapsible(`真题 ${i+1}`,`<p>❓ ${esc(e.q)}</p><p>✅ ${esc(e.a)}</p>`)).join("")}</div>`;
    }
    $("#mathBody").innerHTML = h;
  }
  body("high");
  $$("#mathTabs .tab").forEach(t=>t.onclick=()=>{
    $$("#mathTabs .tab").forEach(x=>x.classList.remove("active")); t.classList.add("active"); body(t.dataset.k);
  });
}

/* ---------- 数学·我的上传课程 ---------- */
function mcLoad(){ try { return JSON.parse(localStorage.getItem("wb_math_courses")||"[]"); } catch(e){ return []; } }
function mcSave(a){ localStorage.setItem("wb_math_courses", JSON.stringify(a)); }
function renderMathUser(){
  const a = mcLoad();
  let html = `<div class="card" style="border:2px dashed var(--gold)">
    <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:8px">
      <h3>📤 我的课程（可上传 txt/md）</h3>
      <button class="btn" onclick="mcToggleForm()">➕ 上传课程</button>
    </div>
    <div id="mcForm" style="display:none;margin-top:10px">
      <input id="mcTitle" placeholder="课程标题（如：三角函数专题）" style="width:100%;padding:8px;margin-bottom:8px;border:1px solid var(--gold);border-radius:8px">
      <textarea id="mcContent" placeholder="粘贴课程内容，或点击下方按钮上传文件…" style="width:100%;min-height:120px;padding:8px;border:1px solid var(--gold);border-radius:8px;font-family:inherit"></textarea>
      <div style="display:flex;gap:8px;margin-top:8px;flex-wrap:wrap">
        <label class="btn ghost" style="cursor:pointer">📁 选择文件<input type="file" id="mcFile" accept=".txt,.md" style="display:none" onchange="mcUpload(this)"></label>
        <button class="btn" onclick="mcSaveCourse()">💾 保存课程</button>
        <button class="btn ghost" onclick="mcToggleForm()">取消</button>
      </div>
    </div>
    ${(a.length?`<div style="margin-top:12px">`+a.map((c,i)=>`<div class="card" style="margin-top:8px"><div style="display:flex;justify-content:space-between"><b>📘 ${esc(c.title)}</b><button class="btn ghost" onclick="mcDelete(${i})">🗑️</button></div><p class="muted" style="font-size:12px">${c.date}</p><pre class="pre-wrap">${esc(c.content)}</pre></div>`).join("")+`</div>`:'<p class="muted" style="margin-top:10px">还没有上传的课程，点击「➕ 上传课程」添加你的笔记或讲义。</p>')}
  </div>`;
  return html;
}
function mcToggleForm(){ const f=$("#mcForm"); f.style.display = f.style.display==="none"?"block":"none"; }
function mcUpload(input){
  const f = input.files[0]; if(!f) return;
  const r = new FileReader();
  r.onload = e => { $("#mcContent").value = e.target.result; if(!$("#mcTitle").value) $("#mcTitle").value = f.name.replace(/\.[^.]+$/,""); };
  r.readAsText(f);
}
function mcSaveCourse(){
  const title = $("#mcTitle").value.trim(), content = $("#mcContent").value.trim();
  if(!title||!content){ alert("请填写标题和内容"); return; }
  const a = mcLoad(); a.push({title, content, date: new Date().toISOString().slice(0,10)}); mcSave(a);
  $("#mcTitle").value=""; $("#mcContent").value=""; mcToggleForm();
  go("math");
}
function mcDelete(i){ const a=mcLoad(); a.splice(i,1); mcSave(a); go("math"); }

/* ---------- 音乐 ---------- */
function renderMusic(){
  const data = D.music;
  const tabs = [["lyric","✍️ 作词"],["compose","🎼 作曲"],["arrange","🎹 编曲"],["hu","🎤 胡彦斌"]];
  const c = document.createElement("div"); c.className="page";
  c.innerHTML = `<div class="tabs" id="musicTabs">${tabs.map((t,i)=>`<button class="tab ${i===0?'active':''}" data-k="${t[0]}">${t[1]}</button>`).join("")}</div><div id="musicBody"></div>`;
  $("#content").appendChild(c);
  function body(k){
    let h = `<div class="card"><h3>${data[k].title}</h3></div>`;
    const d = data[k];
    if(k==="lyric"){
      h += `<div class="card"><h3>💡 作词技巧</h3><ul class="clean">${d.tips.map(x=>`<li>${x}</li>`).join("")}</ul></div>`;
      h += `<div class="card"><h3>🔤 常见韵脚表</h3><p>${d.rhymes.map(r=>`<span class="chip">${esc(r)}</span>`).join("")}</p></div>`;
      h += collapsible("📋 歌词结构模板", `<pre style="white-space:pre-wrap">${esc(d.templates)}</pre>`);
      h += `<div class="card"><h3>🌟 经典歌词赏析</h3><ul class="clean">${d.classics.map(x=>`<li>${x}</li>`).join("")}</ul></div>`;
    }
    if(k==="compose"){
      h += `<div class="card"><h3>🎼 作曲基础理论</h3><ul class="clean">${d.theory.map(x=>`<li>${x}</li>`).join("")}</ul></div>`;
      h += `<div class="card"><h3>🎹 常见和弦进行（${d.chords.length}）</h3><p>${d.chords.map(c=>`<code style="display:inline-block;margin:4px">${esc(c)}</code>`).join(" ")}</p></div>`;
      h += `<div class="card"><h3>🏗️ 曲式结构</h3><p>${d.forms.map(f=>`<span class="chip">${esc(f)}</span>`).join("")}</p></div>`;
      h += `<div class="card"><h3>💡 创作建议</h3><ul class="clean">${d.advice.map(x=>`<li>${x}</li>`).join("")}</ul></div>`;
    }
    if(k==="arrange"){
      h += `<div class="card"><h3>🎚️ 编曲入门</h3><ul class="clean">${d.intro.map(x=>`<li>${x}</li>`).join("")}</ul></div>`;
      h += `<div class="card"><h3>🎺 常见乐器音域</h3><p>${d.range.map(r=>`<span class="chip">${esc(r)}</span>`).join("")}</p></div>`;
      h += `<div class="card"><h3>🔧 编曲流程</h3><ol class="clean">${d.flow.map(f=>`<li>${f}</li>`).join("")}</ol></div>`;
      h += `<div class="card"><h3>🎨 风格特点</h3><p>${d.styles.map(s=>`<span class="chip">${esc(s)}</span>`).join("")}</p></div>`;
    }
    if(k==="hu"){
      h += `<div class="card"><h3>👤 个人简介</h3><p>${d.bio}</p></div>`;
      h += `<div class="card"><h3>🎵 代表作品（${d.works.length}）</h3><p>${d.works.map(w=>`<span class="chip">${esc(w)}</span>`).join("")}</p></div>`;
      h += `<div class="card"><h3>🎭 音乐风格分析</h3><ul class="clean">${d.style.map(x=>`<li>${x}</li>`).join("")}</ul></div>`;
      h += `<div class="card"><h3>📜 经典歌曲创作背景</h3><ul class="clean">${d.bg.map(x=>`<li>${x}</li>`).join("")}</ul></div>`;
    }
    $("#musicBody").innerHTML = h;
  }
  body("lyric");
  $$("#musicTabs .tab").forEach(t=>t.onclick=()=>{
    $$("#musicTabs .tab").forEach(x=>x.classList.remove("active")); t.classList.add("active"); body(t.dataset.k);
  });
}

/* ---------- 小说创作 ---------- */
function loadNovel(){ return loadJSON("wb_novel", { chapters:[{id:1,title:"第1章",content:""}], daily:{}, lastTotal:0, goal:50000 }); }
function saveNovel(n){ saveJSON("wb_novel", n); }
function renderNovel(){
  const c = document.createElement("div"); c.className="page";
  c.innerHTML = `
    <div class="tabs" id="novelTabs">
      <button class="tab active" data-k="write">📝 写作区</button>
      <button class="tab" data-k="idea">💡 灵感库</button>
      <button class="tab" data-k="outline">📋 大纲模板</button>
      <button class="tab" data-k="char">👤 人物设定</button>
      <button class="tab" data-k="progress">📊 进度追踪</button>
    </div>
    <div id="novelBody"></div>`;
  $("#content").appendChild(c);
  $$("#novelTabs .tab").forEach(t=>t.onclick=()=>{
    $$("#novelTabs .tab").forEach(x=>x.classList.remove("active")); t.classList.add("active"); novelBody(t.dataset.k);
  });
  novelBody("write");
}
function novelBody(k){
  const n = loadNovel();
  if(k==="write"){
    const chs = n.chapters.map(ch=>`<option value="${ch.id}">${esc(ch.title)}</option>`).join("");
    $("#novelBody").innerHTML = `
      <div class="row" style="margin-bottom:10px">
        <select id="chSelect" style="max-width:240px">${chs}</select>
        <button class="btn gold" onclick="addChapter()">➕ 新章节</button>
        <span class="wordcount" id="wc"></span>
      </div>
      <textarea class="editor" id="editor" placeholder="✍️ 在这里开始你的故事…"></textarea>
      <div class="row" style="margin-top:10px">
        <button class="btn" onclick="exportTxt()">📤 导出 TXT</button>
        <span class="muted">自动保存中…</span>
      </div>`;
    const sel = $("#chSelect");
    function loadCh(){ const ch = n.chapters.find(c=>c.id==sel.value)||n.chapters[0]; $("#editor").value = ch.content; updateWC(); }
    sel.onchange = loadCh;
    const ed = $("#editor");
    ed.oninput = ()=>{ const ch=n.chapters.find(c=>c.id==sel.value); if(ch){ ch.content=ed.value; saveNovel(n); updateWC(); trackDaily(n); } };
    loadCh();
  }
  if(k==="idea"){
    let insp = loadJSON("wb_inspiration", D.inspirationPresets);
    $("#novelBody").innerHTML = `
      <div class="card"><h3>💡 灵感库（${insp.length}）</h3>
        <div class="row" style="margin:10px 0">
          <input id="insTitle" placeholder="📌 标题" style="max-width:200px">
          <input id="insIcon" placeholder="😀 emoji" style="max-width:90px">
          <input id="insContent" placeholder="✍️ 内容">
          <button class="btn" onclick="addInspiration()">➕ 添加</button>
        </div>
        <div id="inspList"></div>
      </div>`;
    renderInspiration();
  }
  if(k==="outline"){
    $("#novelBody").innerHTML = `
      <div class="card">${collapsible("🎬 三幕式", `<pre style="white-space:pre-wrap">第一幕（建置）：主角日常→触发事件→跨越门槛
第二幕（对抗）：障碍升级→中点转折→低谷
第三幕（结局）：高潮→解决→新平衡</pre>`)}</div>
      <div class="card">${collapsible("🧭 英雄之旅", `<pre style="white-space:pre-wrap">平凡世界→冒险召唤→拒绝→导师→跨越→试炼→收获→归来</pre>`)}</div>
      <div class="card">${collapsible("🔁 起承转合", `<pre style="white-space:pre-wrap">起：引入背景与人物
承：矛盾浮现、情节推进
转：冲突爆发、转折
合：结局收束、点题</pre>`)}</div>`;
  }
  if(k==="char"){
    let chars = loadJSON("wb_chars", []);
    $("#novelBody").innerHTML = `
      <div class="card"><h3>👤 人物档案（${chars.length}）</h3>
        <div class="row" style="margin:10px  ​0">
          <input id="cName" placeholder="📛 姓名">
          <input id="cAge" placeholder="🔢 年龄">
          <input id="cTrait" placeholder="🎭 性格">
        </div>
        <div class="row" style="margin:10px 0">
          <input id="cLook" placeholder="👁️ 外貌">
          <input id="cBg" placeholder="📜 背景">
        </div>
        <div class="row" style="margin:10px 0">
          <input id="cGoal" placeholder="🎯 目标">
          <input id="cConflict" placeholder="⚡ 矛盾">
          <button class="btn" onclick="addChar()">➕ 添加</button>
        </div>
        <div id="charList"></div>
      </div>`;
    renderChars();
  }
  if(k==="progress"){
    const n2 = loadNovel();
    const total = n2.chapters.reduce((a,c)=>a+c.content.length,0);
    const today = Object.values(n2.daily).reduce((a,b)=>a+b,0);
    const days = Object.keys(n2.daily).length;
    const pct = Math.min(100, Math.round(total / (n2.goal||1) * 100));
    $("#novelBody").innerHTML = `
      <div class="card"><h3>📊 写作进度</h3>
        <p>📝 总字数：<b>${total}</b> 字</p>
        <p>📅 今日字数：<b>${today}</b> 字</p>
        <p>🗓️ 写作天数：<b>${days}</b> 天</p>
        <p>🎯 目标：<input id="goalInput" type="number" value="${n2.goal}" style="max-width:120px;display:inline"> 字
          <button class="btn ghost" onclick="setGoal()">保存</button></p>
        <div class="progress"><span style="width:${pct}%"></span></div>
        <p class="muted">已完成目标 ${pct}%</p>
      </div>`;
  }
}
function updateWC(){ const ed=$("#editor"); if(ed) $("#wc").textContent = `字数：${ed.value.length}`; }
function addChapter(){
  const n = loadNovel(); const id = Date.now();
  n.chapters.push({ id, title: "第"+(n.chapters.length+1)+"章", content:"" });
  saveNovel(n); renderNovel();
}
function trackDaily(n){
  const str = new Date().toISOString().slice(0,10);
  const total = n.chapters.reduce((a,c)=>a+c.content.length,0);
  const delta = total - n.lastTotal;
  if (delta>0) n.daily[str] = (n.daily[str]||0) + delta;
  n.lastTotal = total; saveNovel(n);
}
function addInspiration(){
  const t=$("#insTitle").value.trim(), i=$("#insIcon").value.trim()||"💡", c=$("#insContent").value.trim();
  if(!t||!c) return;
  const list = loadJSON("wb_inspiration", D.inspirationPresets);
  list.push({title:t,icon:i,content:c}); saveJSON("wb_inspiration",list);
  $("#insTitle").value=""; $("#insIcon").value=""; $("#insContent").value=""; renderInspiration();
}
function renderInspiration(){
  const list = loadJSON("wb_inspiration", D.inspirationPresets);
  $("#inspList").innerHTML = list.map((x,i)=>`<div class="card" style="margin:8px 0;display:flex;justify-content:space-between;align-items:flex-start">
    <div>${x.icon} <b>${esc(x.title)}</b><br><span class="muted">${esc(x.content)}</span></div>
    <button class="btn ghost" onclick="delInspiration(${i})">🗑️</button></div>`).join("");
}
function delInspiration(i){ const list=loadJSON("wb_inspiration",D.inspirationPresets); list.splice(i,1); saveJSON("wb_inspiration",list); renderInspiration(); }
function addChar(){
  const c={ name:$("#cName").value.trim(), age:$("#cAge").value.trim(), trait:$("#cTrait").value.trim(),
    look:$("#cLook").value.trim(), bg:$("#cBg").value.trim(), goal:$("#cGoal").value.trim(), conflict:$("#cConflict").value.trim() };
  if(!c.name) return;
  const list=loadJSON("wb_chars",[]); list.push(c); saveJSON("wb_chars",list);
  ["cName","cAge","cTrait","cLook","cBg","cGoal","cConflict"].forEach(id=>$("#"+id).value="");
  renderChars();
}
function renderChars(){
  const list=loadJSON("wb_chars",[]);
  $("#charList").innerHTML = list.map(c=>`<div class="card" style="margin:8px 0">
    <b>👤 ${esc(c.name)}</b> · ${esc(c.age)} · ${esc(c.trait)}<br>
    <span class="muted">👁️ ${esc(c.look)} | 📜 ${esc(c.bg)} | 🎯 ${esc(c.goal)} | ⚡ ${esc(c.conflict)}</span></div>`).join("");
}
function setGoal(){ const n=loadNovel(); n.goal=parseInt($("#goalInput").value)||50000; saveNovel(n); renderNovel(); }
function exportTxt(){
  const n=loadNovel();
  let text=n.chapters.map(c=>`\n===== ${c.title} =====\n\n${c.content}`).join("\n");
  const blob=new Blob([text],{type:"text/plain;charset=utf-8"});
  const a=document.createElement("a"); a.href=URL.createObjectURL(blob); a.download="我的小说.txt"; a.click();
}

/* ---------- 日历 ---------- */
function loadEvents(){ return loadJSON("wb_events", null) || (saveJSON("wb_events", D.calPresets.slice()), D.calPresets.slice()); }
function saveEvents(e){ saveJSON("wb_events", e); }
let calView = { y: new Date().getFullYear(), m: new Date().getMonth(), sel: null };
function renderCalendar(){
  const c = document.createElement("div"); c.className="page";
  $("#content").appendChild(c); calendarBody();
}
function calendarBody(){
  const events = loadEvents();
  const {y,m} = calView;
  const first = new Date(y, m, 1).getDay();
  const days = new Date(y, m+1, 0).getDate();
  const today = new Date();
  let cells = "";
  const wk = ["日","一","二","三","四","五","六"];
  let head = wk.map(w=>`<div class="cal-week">${w}</div>`).join("");
  for(let i=0;i<first;i++) cells += `<div class="cal-cell"></div>`;
  for(let d=1; d<=days; d++){
    const ds = `${y}-${String(m+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
    const has = events.some(e=>e.date===ds);
    const isToday = d===today.getDate() && m===today.getMonth() && y===today.getFullYear();
    cells += `<div class="cal-cell ${isToday?'today':''} ${has?'has':''}" data-d="${ds}">${d}${has?'<span class="dot"></span>':''}</div>`;
  }
  const sel = calView.sel;
  const selEvents = sel ? events.filter(e=>e.date===sel) : [];
  const upcoming = events.filter(e=>{ const t=new Date(e.date); const now=new Date(); const diff=(t-now)/86400000; return diff>=0 && diff<=7; }).sort((a,b)=>new Date(a.date)-new Date(b.date));
  const html = `
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">
      <button class="btn ghost" onclick="calShift(-1)">◀️ 上月</button>
      <h2 style="margin:0">📅 ${y}年${m+1}月</h2>
      <button class="btn ghost" onclick="calShift(1)">下月 ▶️</button>
    </div>
    <div class="grid responsive-split">
      <div class="card">
        <div class="cal-grid">${head}${cells}</div>
        <div id="dayPanel" class="card" style="margin-top:14px"></div>
      </div>
      <div>
        <div class="card" style="margin-bottom:14px"><h3>📌 今日日程</h3><div id="todayList"></div></div>
        <div class="card"><h3>🔔 未来7天</h3>${upcoming.length?upcoming.map(e=>`<div style="margin:6px 0">${e.emoji||'📌'} <b>${esc(e.title)}</b><br><span class="muted">${e.date} ${esc(e.time||'')}</span></div>`).join(""):'<p class="muted">暂无</p>'}</div>
      </div>
    </div>`;
  $("#content").innerHTML = html;
  // 今日列表
  const te = events.filter(e=>e.date===today.toISOString().slice(0,10));
  $("#todayList").innerHTML = te.length? te.map(e=>`<div style="margin:6px 0">${e.emoji||'📌'} <b>${esc(e.title)}</b> <span class="muted">${esc(e.time||'')}</span></div>`).join("") : '<p class="muted">今天暂无日程</p>';
  // day panel
  renderDayPanel(sel, selEvents);
  $$(".cal-cell[data-d]").forEach(cell=> cell.onclick=()=>{ calView.sel=cell.dataset.d; calendarBody(); });
}
function renderDayPanel(sel, selEvents){
  if(!sel){ $("#dayPanel").innerHTML = '<p class="muted">👆 点击日期添加日程</p>'; return; }
  $("#dayPanel").innerHTML = `
    <h3>🗓️ ${sel} 的日程</h3>
    ${selEvents.length? selEvents.map(e=>`<div class="card" style="margin:6px 0">
      <b>${e.emoji||'📌'} ${esc(e.title)}</b> · ${esc(e.time||'全天')}
      <p class="muted">${esc(e.note||'')}</p>
      <button class="btn ghost" onclick="delEvent('${e.id}')">🗑️ 删除</button></div>`).join("") : '<p class="muted">当天暂无日程</p>'}
    <details class="collapsible" style="margin-top:10px"><summary>➕ 添加日程</summary>
      <label>📝 标题</label><input id="evTitle">
      <label>⏰ 时间</label><input id="evTime" placeholder="如 14:00 或 全天">
      <label>📝 备注</label><input id="evNote">
      <label>😀 emoji</label><input id="evEmoji" value="📌">
      <button class="btn" style="margin-top:8px" onclick="addEvent('${sel}')">✅ 保存</button>
    </details>`;
}
function calShift(d){ calView.m+=d; if(calView.m<0){calView.m=11;calView.y--;} if(calView.m>11){calView.m=0;calView.y++;} calendarBody(); }
function addEvent(date){
  const title=$("#evTitle").value.trim(), time=$("#evTime").value.trim(), note=$("#evNote").value.trim(), emoji=$("#evEmoji").value.trim()||"📌";
  if(!title) return;
  const e=loadEvents(); e.push({id:Date.now(),date,title,time,note,emoji}); saveEvents(e); calendarBody();
}
function delEvent(id){ const e=loadEvents(); saveEvents(e.filter(x=>x.id!=id)); calendarBody(); }

/* ---------- 收藏夹 ---------- */
function loadBookmarks(){ return loadJSON("wb_bookmarks", D.bookmarkPresets); }
function saveBookmarks(b){ saveJSON("wb_bookmarks", b); }
function ytThumb(url){
  let m = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]{11})/);
  if(m) return `https://img.youtube.com/vi/${m[1]}/0.jpg`;
  return null;
}
function renderBookmarks(){
  const c=document.createElement("div"); c.className="page";
  $("#content").appendChild(c);
  bmBody("all");
}
function bmBody(filter){
  const list = loadBookmarks();
  const tabs = [["all","⭐ 全部"],["web","🌐 网页"],["video","🎬 视频"]];
  let shown = filter==="all"? list : list.filter(b=>b.cat===filter);
  const searchBox = `<div class="row" style="margin:12px 0"><input id="bmSearch" placeholder="🔍 搜索标题或备注…"><button class="btn ghost" onclick="bmSearch()">搜索</button></div>`;
  const form = `<div class="card" style="margin:12px 0">
    <h3>➕ 添加收藏</h3>
    <label>🔗 URL</label><input id="bmUrl" placeholder="https://…">
    <label>📝 标题</label><input id="bmTitle">
    <div class="row"><div style="flex:1"><label>📂 分类</label><select id="bmCat"><option value="web">🌐 网页</option><option value="video">🎬 视频</option></select></div>
    <div style="flex:1"><label>😀 emoji</label><input id="bmIcon" value="🌐"></div></div>
    <label>📝 备注</label><input id="bmNote">
    <button class="btn" style="margin-top:8px" onclick="addBookmark()">✅ 保存</button>
  </div>`;
  const cards = shown.length? shown.map((b,i)=>{
    const thumb = b.cat==="video" ? ytThumb(b.url) : null;
    const media = thumb ? `<img class="bm-thumb" src="${thumb}" alt="">` : `<div class="bm-thumb emoji">${b.icon}</div>`;
    const host = (()=>{ try{ return new URL(b.url).hostname; }catch(_){ return ''; } })();
    return `<div class="card bm-card">
      ${media}
      <div style="flex:1">
        <a href="${esc(b.url)}" target="_blank" rel="noopener" style="color:var(--red-dark);font-weight:700">${b.icon} ${esc(b.title)}</a>
        <div class="muted">${esc(host)} · 📅 ${esc(b.date||'')}</div>
        <div class="muted">${esc(b.note||'')}</div>
        <button class="btn ghost" onclick="delBookmark(${i})">🗑️ 删除</button>
      </div>
    </div>`;
  }).join("") : '<p class="muted">暂无收藏</p>';
  $("#content").innerHTML = `
    <div class="tabs" id="bmTabs">${tabs.map(t=>`<button class="tab ${t[0]===filter?'active':''}" data-f="${t[0]}">${t[1]}</button>`).join("")}</div>
    ${form}${searchBox}
    <div id="bmList">${cards}</div>`;
  $$("#bmTabs .tab").forEach(t=>t.onclick=()=>bmBody(t.dataset.f));
}
function addBookmark(){
  const url=$("#bmUrl").value.trim(), title=$("#bmTitle").value.trim()||$("#bmUrl").value.trim();
  const cat=$("#bmCat").value, icon=$("#bmIcon").value.trim()||"🌐", note=$("#bmNote").value.trim();
  if(!url) return;
  const b=loadBookmarks();
  b.unshift({title,url,cat,icon,note,date:new Date().toISOString().slice(0,10)});
  saveBookmarks(b); bmBody($("#bmTabs .tab.active").dataset.f);
}
function delBookmark(i){
  const f=$("#bmTabs .tab.active")?.dataset.f||"all";
  const b=loadBookmarks(); b.splice(i,1); saveBookmarks(b); bmBody(f);
}
function bmSearch(){
  const q=$("#bmSearch").value.trim().toLowerCase();
  const b=loadBookmarks();
  const r=b.filter(x=> x.title.toLowerCase().includes(q)|| (x.note||'').toLowerCase().includes(q));
  $("#bmList").innerHTML = r.length? r.map((x,i)=>`<div class="card bm-card"><div class="bm-thumb emoji">${x.icon}</div><div><a href="${esc(x.url)}" target="_blank" style="color:var(--red-dark);font-weight:700">${esc(x.title)}</a><div class="muted">${esc(x.note||'')}</div></div></div>`).join("") : '<p class="muted">未找到</p>';
}

/* ---------- 全局搜索 ---------- */
function renderSearch(){
  const c=document.createElement("div"); c.className="page";
  c.innerHTML = `
    <input id="gSearch" placeholder="🔍 输入关键词，实时搜索所有板块…" style="max-width:480px">
    <div id="gResults" style="margin-top:16px"></div>`;
  $("#content").appendChild(c);
  const idx = buildSearchIndex();
  $("#gSearch").oninput = (e)=>{
    const q=e.target.value.trim().toLowerCase();
    if(!q){ $("#gResults").innerHTML=""; return; }
    const res=[];
    idx.forEach(it=>{ if(it.text.toLowerCase().includes(q)) res.push(it); });
    if(!res.length){ $("#gResults").innerHTML='<p class="muted">未找到相关内容</p>'; return; }
    $("#gResults").innerHTML = res.map(r=>`<div class="card" style="margin:8px 0;cursor:pointer" onclick="go('${r.page}')">
      ${r.icon} <b>${esc(r.title)}</b> <span class="muted">· ${esc(r.cat)}</span><br><span class="muted">${esc(r.text.slice(0,80))}</span></div>`).join("");
  };
}
function buildSearchIndex(){
  const out=[];
  const add=(page,icon,cat,title,text)=> out.push({page,icon,cat,title,text:title+" "+text});
  // 静态内容
  const I=D.ielts; Object.entries(I).forEach(([k,v])=> add("ielts","🎓","雅思",v.title, JSON.stringify(v)));
  const M=D.math; Object.entries(M).forEach(([k,v])=> add("math","📐","数学",v.title, JSON.stringify(v)));
  const Mu=D.music; Object.entries(Mu).forEach(([k,v])=> add("music","🎵","音乐",v.title, JSON.stringify(v)));
  // 收藏
  loadBookmarks().forEach(b=> add("bookmarks","🔖","收藏",b.title, b.note||""));
  // 日历
  loadEvents().forEach(e=> add("calendar","📅","日历",e.title, e.note||""));
  // 灵感
  loadJSON("wb_inspiration",D.inspirationPresets).forEach(x=> add("novel","✍️","灵感",x.title, x.content));
  return out;
}

/* ---------- 设置 ---------- */
function renderSettings(){
  const c=document.createElement("div"); c.className="page";
  const theme = localStorage.getItem("wb_theme")||"light";
  c.innerHTML = `
    <div class="card" style="margin-bottom:14px"><h3>🌗 主题</h3>
      <div class="row">
        <button class="btn ${theme==='light'?'gold':'ghost'}" onclick="setTheme('light')">🌞 金黄（浅）</button>
        <button class="btn ${theme==='dark'?'gold':'ghost'}" onclick="setTheme('dark')">🌙 深色模式</button>
      </div>
    </div>
    <div class="card" style="margin-bottom:14px"><h3>💾 数据管理</h3>
      <div class="row">
        <button class="btn" onclick="exportData()">📤 导出 JSON</button>
        <button class="btn ghost" onclick="importData()">📥 导入 JSON</button>
        <button class="btn danger" onclick="clearData()">🗑️ 清空数据</button>
      </div>
      <input type="file" id="importFile" style="display:none" onchange="doImport(event)">
      <p class="muted" style="margin-top:8px">说明：本应用核心数据（收藏、日历、小说、灵感、待办）均保存在本机浏览器。云端同步可通过导出/导入实现；如需自动云同步，可在 GitHub Pages 之上接入后端服务。</p>
    </div>
    <div class="card"><h3>ℹ️ 关于</h3>
      <p>👑 <b>全麟坤的工作台</b></p>
      <p class="muted">版本 v1.0 · 个人综合工作台 · PWA 离线可用</p>
      <p class="muted">作者：全麟坤 · 集成新闻/学习/创作/日历/收藏</p>
    </div>`;
  $("#content").appendChild(c);
}
function setTheme(t){ applyTheme(t); renderSettings(); }
function exportData(){
  const data = {
    bookmarks: loadBookmarks(), events: loadEvents(),
    novel: loadNovel(), inspiration: loadJSON("wb_inspiration",D.inspirationPresets),
    chars: loadJSON("wb_chars",[]), todos: loadJSON("wb_todos",[]), theme: localStorage.getItem("wb_theme")
  };
  const blob=new Blob([JSON.stringify(data,null,2)],{type:"application/json"});
  const a=document.createElement("a"); a.href=URL.createObjectURL(blob); a.download="quanlinkun-backup.json"; a.click();
}
function importData(){ $("#importFile").click(); }
function doImport(e){
  const f=e.target.files[0]; if(!f) return;
  const r=new FileReader();
  r.onload=()=>{ try{
    const d=JSON.parse(r.result);
    if(d.bookmarks) saveBookmarks(d.bookmarks);
    if(d.events) saveEvents(d.events);
    if(d.novel) saveNovel(d.novel);
    if(d.inspiration) saveJSON("wb_inspiration",d.inspiration);
    if(d.chars) saveJSON("wb_chars",d.chars);
    if(d.todos) saveJSON("wb_todos",d.todos);
    if(d.theme) applyTheme(d.theme);
    alert("✅ 导入成功！"); renderSettings();
  }catch(_){ alert("❌ 文件格式错误"); } };
  r.readAsText(f);
}
function clearData(){
  if(!confirm("⚠️ 此操作非常危险，可能导致不可逆的数据丢失！确认清空所有本地数据？")) return;
  if(!confirm("⚠️ 再次确认：所有收藏、日程、小说、灵感将被永久删除，无法恢复！")) return;
  ["wb_bookmarks","wb_events","wb_novel","wb_inspiration","wb_chars","wb_todos","wb_todos"].forEach(k=>localStorage.removeItem(k));
  alert("已清空。"); go("home");
}

/* ---------- 本地存储助手 ---------- */
function loadJSON(k, def){ try{ const v=localStorage.getItem(k); return v?JSON.parse(v):def; }catch(_){ return def; } }
function saveJSON(k, v){ localStorage.setItem(k, JSON.stringify(v)); }

/* ---------- 侧边栏开合 ---------- */
function openSidebar(){ $("#sidebar").classList.add("open"); $("#overlay").classList.add("show"); }
function closeSidebar(){ $("#sidebar").classList.remove("open"); $("#overlay").classList.remove("show"); }

/* ---------- 初始化 ---------- */
function init(){
  initTheme();
  renderNav();
  $("#menuBtn").onclick = openSidebar;
  $("#closeSidebar").onclick = closeSidebar;
  $("#overlay").onclick = closeSidebar;
  go("home");
  // 注册 Service Worker（离线可用）
  if("serviceWorker" in navigator){
    navigator.serviceWorker.register("sw.js").catch(()=>{});
  }
}
init();
