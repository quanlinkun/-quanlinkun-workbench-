// ====== 全麟坤的工作台 · 雅思学习模块（重写）======
// 仅重写「英语雅思学习」板块，其余页面不动。
// 提供：总览仪表盘 + 9 大板块 + 图表 + 本地数据持久化 + 应试/日常模式切换。

/* ============ 数据层（localStorage） ============ */
const IE_PK = {
  profile: "wb_ielts_profile", daily: "wb_ielts_daily", plan: "wb_ielts_plan",
  checkin: "wb_ielts_checkin", mock: "wb_ielts_mock", errors: "wb_ielts_errors",
  words: "wb_ielts_words",
};
const ieToday = () => new Date().toISOString().slice(0, 10);
const ieUid = () => Math.random().toString(36).slice(2, 9);
function ieLoad(k, def){ try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : def; } catch(_){ return def; } }
function ieSave(k, v){ localStorage.setItem(k, JSON.stringify(v)); }

function ieProfile(){ return Object.assign({ target: 6.5, mode: "exam", difficulty: "6.5" }, ieLoad(IE_PK.profile, {})); }
function ieSetProfile(p){ ieSave(IE_PK.profile, p); }

function ieGetDaily(date){
  const all = ieLoad(IE_PK.daily, {});
  return all[date] || { reading:0, readingCorrect:0, readingTotal:0, readingRefined:0,
    listenSections:0, listenCorrect:0, listenTotal:0, listenWeak:[],
    speakTopics:0, speakMocks:0, dailySessions:0, duration:0,
    timeReading:0, timeListening:0, timeSpeaking:0, timeDaily:0 };
}
function ieSetDaily(date, o){ const all = ieLoad(IE_PK.daily, {}); all[date] = o; ieSave(IE_PK.daily, all); }
function ieUpdDaily(fn){ const d = ieToday(); const o = ieGetDaily(d); fn(o); ieSetDaily(d, o); }

function ieDefaultPlan(){
  return [
    { id: ieUid(), text: "精读 1 篇阅读", type: "reading", done: false },
    { id: ieUid(), text: "听力精听 1 Section", type: "listening", done: false },
    { id: ieUid(), text: "口语练习 2 个话题", type: "speaking", done: false },
    { id: ieUid(), text: "词句自测 10 词", type: "words", done: false },
  ];
}
function ieGetPlan(){
  let p = ieLoad(IE_PK.plan, {});
  if (p.date !== ieToday()){ p = { date: ieToday(), tasks: ieDefaultPlan() }; ieSave(IE_PK.plan, p); }
  return p;
}

function ieGetCheckin(){ return ieLoad(IE_PK.checkin, {}); }
function ieStreak(){
  const c = ieGetCheckin(); let s = 0; const d = new Date();
  for (;;){
    const key = d.toISOString().slice(0, 10);
    if (c[key] && c[key].checked) { s++; d.setDate(d.getDate() - 1); }
    else break;
  }
  return s;
}
function ieMonthCheckins(){
  const c = ieGetCheckin(); const now = new Date(); let n = 0;
  for (const k in c){ if (c[k].checked && k.slice(0,7) === now.toISOString().slice(0,7)) n++; }
  return n;
}
function ieWeekTime(){
  const c = ieGetCheckin(); const d = new Date(); let t = 0;
  for (let i = 0; i < 7; i++){ const k = d.toISOString().slice(0,10); if (c[k]) t += (c[k].duration||0); d.setDate(d.getDate()-1); }
  return t;
}
function ieLastNDurations(n){
  const c = ieGetCheckin(); const d = new Date(); const arr = []; const labs = [];
  for (let i = n-1; i >= 0; i--){ const dd = new Date(); dd.setDate(dd.getDate()-i); const k = dd.toISOString().slice(0,10); arr.push(c[k] ? (c[k].duration||0) : 0); labs.push((dd.getMonth()+1)+"/"+dd.getDate()); }
  return { arr, labs };
}
function ieTotalCheckins(){ const c = ieGetCheckin(); let n=0; for (const k in c) if (c[k].checked) n++; return n; }

function ieGetErrors(){ return ieLoad(IE_PK.errors, []); }
function ieAddError(e){ const a = ieGetErrors(); a.unshift(Object.assign({ id: ieUid(), date: ieToday() }, e)); ieSave(IE_PK.errors, a); }

function ieGetWords(){
  let w = ieLoad(IE_PK.words, null);
  if (!w){ w = IE_SEED_WORDS(); ieSave(IE_PK.words, w); }
  return w;
}

/* ============ 图表（SVG） ============ */
function ieLineChart(data, labels, color){
  color = color || "#E63946";
  const W = 660, H = 230, pad = 40;
  const max = Math.max(1, ...data);
  const n = data.length;
  const x = i => pad + (W - 2*pad) * (n <= 1 ? 0.5 : i/(n-1));
  const y = v => H - pad - (H - 2*pad) * (v / max);
  const pts = data.map((v,i)=> x(i).toFixed(1) + "," + y(v).toFixed(1)).join(" ");
  const area = (pad) + "," + (H-pad) + " " + pts + " " + x(n-1).toFixed(1) + "," + (H-pad);
  let dots = "", labs = "";
  data.forEach((v,i)=>{
    dots += '<circle cx="'+x(i).toFixed(1)+'" cy="'+y(v).toFixed(1)+'" r="4.5" fill="'+color+'" stroke="#fff" stroke-width="1.5"/>';
    labs += '<text x="'+x(i).toFixed(1)+'" y="'+(H-pad+18)+'" font-size="11" text-anchor="middle" fill="#8a7a5c">'+labels[i]+'</text>';
    if (v > 0) labs += '<text x="'+x(i).toFixed(1)+'" y="'+(y(v)-9).toFixed(1)+'" font-size="11" text-anchor="middle" fill="#3D2914" font-weight="700">'+v+'</text>';
  });
  return '<svg viewBox="0 0 '+W+' '+H+'" width="100%" style="max-width:660px;display:block;margin:auto">'+
    '<line x1="'+pad+'" y1="'+(H-pad)+'" x2="'+(W-pad)+'" y2="'+(H-pad)+'" stroke="#e6c200" stroke-width="1"/>'+
    '<polygon points="'+area+'" fill="'+color+'" opacity="0.12"/>'+
    '<polyline points="'+pts+'" fill="none" stroke="'+color+'" stroke-width="2.5" stroke-linejoin="round"/>'+
    dots + labs + '</svg>';
}
function ieBarChart(items){
  const W = 660, rowH = 42, pad = 10, labelW = 110;
  const H = items.length * rowH + 20;
  const max = Math.max(1, ...items.map(i=>i.value));
  let bars = "";
  items.forEach((it, i)=>{
    const w = (W - labelW - pad) * (it.value / max);
    const yy = i * rowH + 10;
    bars += '<text x="0" y="'+(yy+16)+'" font-size="13" fill="#3D2914">'+it.label+'</text>'+
      '<rect x="'+labelW+'" y="'+yy+'" width="'+(W-labelW-pad)+'" height="22" rx="6" fill="#f0e2b8"/>'+
      '<rect x="'+labelW+'" y="'+yy+'" width="'+Math.max(2,w).toFixed(1)+'" height="22" rx="6" fill="'+(it.color||"#E63946")+'"/>'+
      '<text x="'+(labelW + Math.max(2,w) + 6).toFixed(1)+'" y="'+(yy+16)+'" font-size="12" fill="#3D2914" font-weight="700">'+it.value+(it.unit||"")+'</text>';
  });
  return '<svg viewBox="0 0 '+W+' '+H+'" width="100%" style="max-width:660px;display:block;margin:auto">'+bars+'</svg>';
}

/* ============ 通用：题目集交互 ============ */
let IE_QSET = null;
function ieCheckAnswer(btn, i){
  const set = IE_QSET, q = set.qs[i];
  const box = btn.closest(".qbox");
  let user = "";
  if (q.options){ const sel = box.querySelector('input[name="q'+i+'"]:checked'); user = sel ? sel.value : ""; }
  else { user = (box.querySelector(".qinput").value || "").trim(); }
  const ok = ieJudge(q, user);
  const ex = box.querySelector(".explain");
  ex.style.display = "block";
  if (ok){ box.classList.add("correct"); btn.textContent = "✅ 回答正确"; }
  else {
    box.classList.add("wrong");
    ieAddError({ module: set.module, q: q.q, myAnswer: user || "(未答)", correct: q.answer, reason: q.para || "", knowledge: q.type, advice: q.trap || "" });
    btn.textContent = "❌ 已记录到错题本";
  }
}
function ieJudge(q, user){
  if (!user) return false;
  const a = String(q.answer).trim().toLowerCase();
  const u = String(user).trim().toLowerCase();
  if (q.type === "判断") return a === u || a.replace(/\s/g,"") === u.replace(/\s/g,"");
  if (q.options) return a === u || a === u.replace(/[.)\s]/g,"");
  return a === u || (u.length && a.indexOf(u) >= 0) || (a.length && u.indexOf(a) >= 0);
}
function ieRenderQSet(set){
  IE_QSET = set;
  let h = '<p class="muted">📌 难度 ' + ieProfile().difficulty + ' 分 · 作答后点击「提交」查看逐题精讲（定位句 / 同义替换 / 出题陷阱），答错自动收纳到错题本。</p>';
  set.qs.forEach((q, i)=>{
    let input = "";
    if (q.options){
      input = q.options.map(o=>'<label class="qopt"><input type="radio" name="q'+i+'" value="'+o.v+'"> '+o.v+'. '+esc(o.t)+'</label>').join("");
    } else {
      input = '<input class="qinput" placeholder="输入你的答案（英文）">';
    }
    h += '<div class="qbox">'+
      '<div class="qhead"><span class="qtag">'+q.type+'</span> '+esc(q.q)+'</div>'+
      '<div class="qbody">'+input+'</div>'+
      '<button class="btn small" onclick="ieCheckAnswer(this,'+i+')">提交本题</button>'+
      '<div class="explain" style="display:none">'+
        (q.loc ? '<p><b>📍 定位句：</b>'+esc(q.loc)+'</p>' : '')+
        (q.para ? '<p><b>🔁 同义替换：</b>'+esc(q.para)+'</p>' : '')+
        (q.trap ? '<p><b>🕳️ 出题陷阱：</b>'+esc(q.trap)+'</p>' : '')+
        '<p class="ans">✅ 正确答案：'+esc(q.answer)+'</p>'+
        (q.explain ? '<p><b>💡 精讲：</b>'+esc(q.explain)+'</p>' : '')+
      '</div></div>';
  });
  return h;
}

/* ============ 雅思静态内容（真实题型） ============ */
function IE_SEED_WORDS(){
  // 优先复用原 data.js 中的词汇，并区分类型
  const D = window.APP_DATA || {};
  const rvocab = (D.ielts && D.ielts.reading && D.ielts.reading.vocab) || [];
  const lvocab = (D.ielts && D.ielts.listening && D.ielts.listening.vocab) || [];
  const words = [];
  rvocab.slice(0, 18).forEach(w=> words.push({ id: ieUid(), word: w, meaning: "", type: "academic", mastered: false }));
  lvocab.slice(0, 12).forEach(w=> words.push({ id: ieUid(), word: w, meaning: "", type: "spoken", mastered: false }));
  [["ubiquitous","adj. 无处不在的","academic"],["mitigate","v. 缓解","academic"],["paradigm","n. 范式","academic"],
   ["commensurate","adj. 相称的","academic"],["hitherto","adv. 迄今","academic"],["a plethora of","大量","replace"],
   ["crucial","关键的","replace"],["endeavour","努力","replace"]].forEach(x=> words.push({ id: ieUid(), word: x[0], meaning: x[1], type: x[2], mastered: false }));
  return words;
}

const IE_CONTENT = {
  readingPassage: {
    title: "Urban Green Spaces and Mental Wellbeing",
    text: "City planners have long recognised that parks and gardens are more than decorative. A growing body of research now suggests that regular exposure to urban green spaces can significantly reduce stress and improve mental health. In a 2019 study conducted across ten European cities, participants who lived within 300 metres of a park reported 15% lower levels of cortisol, a hormone associated with stress, than those who did not.\n\nHowever, the benefit is not merely about proximity. The quality and biodiversity of the space matter. Researchers found that individuals walking through areas with diverse plant life showed greater improvements in mood than those in neatly trimmed but monocultural lawns.\n\nCritics argue that such findings overlook socioeconomic factors: wealthier neighbourhoods tend to have better-maintained parks, and their residents may already enjoy better health. Nonetheless, the correlation remains strong enough that many municipalities now prioritise 'green prescriptions' — where doctors encourage patients to spend time outdoors.",
    qs: [
      { type:"判断", q:"Participants living near a park had HIGHER cortisol levels than those who did not.", answer:"FALSE",
        loc:"participants who lived within 300 metres of a park reported 15% lower levels of cortisol... than those who did not.",
        para:"higher ↔ 原文 15% lower（反义替换，注意比较方向）。",
        trap:"题干把 lower 偷换成 higher，属于典型'反向陷阱'。",
        explain:"原文明确说'低 15%'，题干说'更高'，故为 FALSE。" },
      { type:"填空", q:"The 2019 study covered ______ European cities.", answer:"ten",
        loc:"In a 2019 study conducted across ten European cities",
        para:"covered ↔ conducted across；European cities 原词复现。",
        trap:"空后 European cities 为原词，定位后数词 ten 即答案。",
        explain:"填 ten（注意拼写，雅思填空常考数词）。" },
      { type:"选择", q:"According to researchers, which most improves mood?", options:[{v:"A",t:"Proximity to a park"},{v:"B",t:"Diverse plant life"},{v:"C",t:"Neatly trimmed lawns"}], answer:"B",
        loc:"individuals walking through areas with diverse plant life showed greater improvements in mood",
        para:"most improves mood ↔ greater improvements in mood；diverse plant life 原词。",
        trap:"A 是'接近公园'（proximity），原文说不只是 proximity，B 才是真正提升情绪的因素。",
        explain:"选 B。" },
      { type:"匹配", q:"Which heading best fits Paragraph 2?", options:[{v:"A",t:"Quality matters more than proximity"},{v:"B",t:"Wealthier people are healthier"},{v:"C",t:"Doctors prescribe parks"}], answer:"A",
        loc:"Paragraph 2: The quality and biodiversity of the space matter.",
        para:"matter ↔ 对应 heading 中 matters；quality ↔ quality。",
        trap:"第二段核心是'质量比 proximity 更重要'，C 是第三段内容，易混淆。",
        explain:"选 A。" },
      { type:"选择", q:"What do critics point out?", options:[{v:"A",t:"Parks cause stress"},{v:"B",t:"Socioeconomic factors are overlooked"},{v:"C",t:"Doctors oppose green prescriptions"}], answer:"B",
        loc:"Critics argue that such findings overlook socioeconomic factors",
        para:"point out ↔ argue；socioeconomic factors ↔ socioeconomic factors（原词）。",
        trap:"critics 出现在第三段，定位'overlook'，对应 B。",
        explain:"选 B。" },
    ],
  },
  listeningSets: [
    { module:"listening", title:"Section 1 · 生活场景（租房预订）",
      transcript:"Agent: Good morning, Lakeside Accommodation. How can I help?\nStudent: Hi, I'd like to book a room for the summer term.\nAgent: Sure. We have single rooms at £120 per week, or shared rooms at £85.\nStudent: I'll take a shared room. Is the deposit refundable?\nAgent: Yes, a £50 deposit is returned at the end of your stay if there's no damage.\nStudent: Great. My number is 0774 123 8890, and I'd like to move in on the 14th of July.",
      qs:[
        { type:"填空", q:"Weekly price of a shared room: £______", answer:"85",
          loc:"shared rooms at £85", para:"price ↔ at £85；shared room 原词。", trap:"注意区分 single £120 与 shared £85。", explain:"填 85。" },
        { type:"填空", q:"Deposit amount: £______", answer:"50",
          loc:"a £50 deposit", para:"deposit ↔ deposit。", trap:"数字考点，连读 £50 易误听为 fifteen。", explain:"填 50。" },
        { type:"填空", q:"Move-in date: the ______ of July", answer:"14th",
          loc:"move in on the 14th of July", para:"date ↔ 14th of July。", trap:"序数词 14th 拼写易错。", explain:"填 14th。" },
        { type:"填空", q:"Contact number: ______", answer:"07741238890",
          loc:"My number is 0774 123 8890", para:"number ↔ number。", trap:"长串数字需分段记忆，注意 0774 不是 0771。", explain:"填 0774 123 8890。" },
      ] },
    { module:"listening", title:"Section 3 · 学术讨论（小组作业）",
      transcript:"Tutor: So, how is the group project going?\nMaria: We've divided the work. I'm doing the literature review, and Tom handles the data analysis.\nTutor: And the survey?\nTom: We'll distribute it next Monday to about 200 students.",
      qs:[
        { type:"填空", q:"Maria is responsible for the ______ review.", answer:"literature",
          loc:"I'm doing the literature review", para:"responsible for ↔ doing。", trap:"literature 拼写较长，注意 -ature 结尾。", explain:"填 literature。" },
        { type:"选择", q:"How many students will receive the survey?", options:[{v:"A",t:"About 20"},{v:"B",t:"About 200"},{v:"C",t:"About 2000"}], answer:"B",
          loc:"distribute it next Monday to about 200 students", para:"how many ↔ about 200。", trap:"数字 200 与 2000 仅差一个零，注意重音。", explain:"选 B。" },
      ] },
  ],
  speaking: {
    part1: [
      { topic:"Hometown", q:"Where is your hometown? / Do you like living there? Why or why not?",
        tip:"用 2-3 句回答，先直接回答再给原因。例：I'm from Chengdu, a city in southwest China. I love it because the food is amazing and people are friendly." },
      { topic:"Reading", q:"Do you enjoy reading? What kind of books do you usually read?",
        tip:"可谈习惯+偏好：I read mostly non-fiction, especially books about psychology." },
      { topic:"Technology", q:"What technology do you use most in daily life?",
        tip:"避免只说名词，补充用途：I rely on my phone not just for communication but for navigation and learning." },
    ],
    part2: [
      { topic:"Describe a book that influenced you", bullets:["what the book is","when you read it","what it is about","why it influenced you"],
        tip:"按 bullet 顺序展开约 2 分钟；开头：I'd like to talk about a book called..." },
      { topic:"Describe a person who helped you", bullets:["who the person is","how you met","what they helped with","why it mattered"],
        tip:"用具体事例支撑，避免空泛形容词。" },
    ],
    part3: [
      { topic:"Reading habits", q:"Why do people in your country enjoy reading less nowadays?",
        tip:"宏观回答：With the rise of short-video platforms, people's attention spans have shortened." },
      { topic:"Education", q:"Should schools encourage more reading?",
        tip:"辩证：Absolutely, because reading builds critical thinking, yet it should not be forced." },
    ],
  },
  dailyDialogue: [
    { q:"Hey! How was your weekend? Did you do anything fun?", tip:"用过去时回答，给一个具体活动。" },
    { q:"If you could travel anywhere right now, where would you go and why?", tip:"用虚拟语气：I would go to... because..." },
    { q:"What's your favorite way to relax after a long day?", tip:"自然口语：To be honest, I usually just..." },
  ],
  replacements: [
    ["good","excellent / decent / worthwhile"],["bad","problematic / unsatisfactory"],["important","crucial / vital / of great significance"],
    ["think","argue / maintain / hold the view that"],["show","demonstrate / illustrate / reveal"],["a lot of","a substantial amount of / numerous"],
    ["more and more","an increasing number of"],["because","owing to / due to / on account of"],["use","utilise / make use of"],["help","facilitate / contribute to"],
  ],
  sentences: {
    writing: [
      "It is widely acknowledged that...（众所周知……）",
      "A possible solution to this issue is to...（一个可行的解决方案是……）",
      "From my perspective, the advantages outweigh the disadvantages.（在我看来，利大于弊。）",
      "This phenomenon can be attributed to several factors.（这一现象可归因于若干因素。）",
    ],
    speaking: [
      "To be honest, I'd say...（说实话，我会说……）",
      "Well, that's an interesting question.（嗯，这是个有趣的问题。）",
      "What I mean is...（我的意思是……）",
      "I'm not entirely sure, but...（我不完全确定，但是……）",
    ],
  },
  dailySentence: [
    "The municipality's new policy prioritises renewable energy, yet critics argue it overlooks short-term costs.",
    "While the experiment yielded promising results, the sample size remains a limiting factor.",
    "Not only did the reform improve efficiency, but it also enhanced employee satisfaction.",
  ],
};

/* ============ 每日真题 feed（网络近期考题，每日自动化刷新） ============ */
let IE_FEED = null;
let IE_FEED_DATE = null;
const IE_FEED_KEYS = ["readingPassage","listeningSets","speaking","dailyDialogue","dailySentence","writing"];
async function ieLoadFeed(){
  try {
    const r = await fetch("assets/data/ielts-feed.json?t=" + Date.now(), { cache: "no-store" });
    if (r.ok){
      const f = await r.json();
      if (f && f.meta && f.meta.date){
        IE_FEED_DATE = f.meta.date;
        IE_FEED_KEYS.forEach(k=>{ if (f[k] !== undefined) IE_CONTENT[k] = f[k]; });
        IE_FEED = f;
      }
    }
  } catch(_){ /* 离线 / 本地 file:// 打开：自动回退到内置静态题 */ }
}

/* ============ 主渲染：重写 renderIelts ============ */
async function renderIelts(){
  await ieLoadFeed();
  const c = document.createElement("div");
  c.className = "page";
  c.innerHTML =
    '<div class="ielts-bar" id="ieTopBar"></div>'+
    '<div class="tabs" id="ieSubNav"></div>'+
    '<div id="ieView"></div>';
  $("#content").appendChild(c);
  ieTopBar();
  ieSubNav();
  ieGo("dash");
}
// 更新路由表，确保 go('ielts') 指向新函数
if (typeof routes !== "undefined") routes.ielts = renderIelts;

function ieTopBar(){
  const p = ieProfile();
  const streak = ieStreak();
  const progress = Math.min(100, Math.round(ieTotalCheckins() / 30 * 100));
  $("#ieTopBar").innerHTML =
    '<div class="bar-name">🎓 全麟坤的雅思工作台</div>'+
    '<div class="bar-stats">'+
      '<div class="bstat"><span class="bs-num">'+p.target.toFixed(1)+'</span><span class="bs-lab">🎯 目标分数</span></div>'+
      '<div class="bstat"><span class="bs-num">'+progress+'%</span><span class="bs-lab">📈 学习进度</span></div>'+
      '<div class="bstat"><span class="bs-num">'+streak+'天</span><span class="bs-lab">🔥 连续学习</span></div>'+
      '<button class="btn ghost small" onclick="ieToggleMode()">'+(p.mode==="exam"?"🎯 应试模式":"💬 日常对话模式")+'</button>'+
      '<button class="btn ghost small" onclick="ieToggleDiff()">难度 '+p.difficulty+'</button>'+
    '</div>';
}
function ieToggleMode(){ const p = ieProfile(); p.mode = p.mode === "exam" ? "daily" : "exam"; ieSetProfile(p); ieTopBar(); ieGo("dash"); }
function ieToggleDiff(){ const p = ieProfile(); p.difficulty = p.difficulty === "6.5" ? "7.0" : "6.5"; ieSetProfile(p); ieTopBar(); }

const IE_TABS = [
  ["dash","📊 总览"],["reading","📖 阅读"],["listening","👂 听力"],["speaking","🗣️ 口语"],
  ["words","📚 词句"],["plan","📅 计划"],["checkin","📆 打卡"],["time","⏱️ 时长"],
  ["mock","📝 模考"],["errors","📒 错题"],
];
function ieSubNav(){
  $("#ieSubNav").innerHTML = IE_TABS.map(t=>'<button class="tab" data-k="'+t[0]+'">'+t[1]+'</button>').join("");
  $$("#ieSubNav .tab").forEach(b=> b.onclick = ()=> ieGo(b.dataset.k));
}
function ieGo(k){
  $$("#ieSubNav .tab").forEach(b=> b.classList.toggle("active", b.dataset.k === k));
  const v = $("#ieView");
  if (k === "dash") v.innerHTML = ieDash();
  else if (k === "reading") v.innerHTML = ieReading();
  else if (k === "listening") v.innerHTML = ieListening();
  else if (k === "speaking") v.innerHTML = ieSpeaking();
  else if (k === "words") v.innerHTML = ieWords();
  else if (k === "plan") v.innerHTML = iePlan();
  else if (k === "checkin") v.innerHTML = ieCheckin();
  else if (k === "time") v.innerHTML = ieTime();
  else if (k === "mock") v.innerHTML = ieMock();
  else if (k === "errors") v.innerHTML = ieErrors();
  if (window.ieAfter) window.ieAfter(k);
  window.scrollTo(0,0);
}

/* ---- 总览仪表盘 ---- */
function ieDash(){
  const d = ieGetDaily(ieToday());
  const p = ieProfile();
  // 4 大模块总览
  function ovCard(icon, name, today, rate, mastery){
    return '<div class="ov-card"><div class="ov-ico">'+icon+'</div><div class="ov-name">'+name+'</div>'+
      '<div class="ov-row"><span>今日练习</span><b>'+today+'</b></div>'+
      '<div class="ov-row"><span>正确率</span><b>'+rate+'</b></div>'+
      '<div class="ov-mastery">'+mastery+'</div></div>';
  }
  const rRate = d.readingTotal ? Math.round(d.readingCorrect/d.readingTotal*100)+"%" : "—";
  const lRate = d.listenTotal ? Math.round(d.listenCorrect/d.listenTotal*100)+"%" : "—";
  const ov =
    ovCard("📖","雅思阅读", d.reading+" 篇", rRate, d.readingRefined? "🌟 已精读 "+d.readingRefined+" 篇" : "📝 待精读")+
    ovCard("👂","雅思听力", d.listenSections+" Section", lRate, d.listenWeak.length? "⚠️ 易错："+d.listenWeak.slice(0,2).join("、") : "✅ 暂无易错题型")+
    ovCard("🗣️","雅思口语", d.speakTopics+" 话题", d.speakMocks? d.speakMocks+" 次模考" : "—", d.speakMocks? "🎤 已模考" : "🗣️ 待练习")+
    ovCard("💬","日常对话", d.dailySessions+" 轮", "—", p.mode==="daily"? "💬 当前模式" : "🎯 应试模式");
  // 今日计划
  const plan = ieGetPlan();
  const done = plan.tasks.filter(t=>t.done).length;
  const total = plan.tasks.length;
  const planPct = total ? Math.round(done/total*100) : 0;
  const planBar =
    '<div class="card" style="margin-top:16px"><h3>📅 今日计划完成情况</h3>'+
    '<div class="progress"><span style="width:'+planPct+'%"></span></div>'+
    '<p class="muted" style="margin-top:8px">已完成 '+done+' / '+total+' 项（'+planPct+'%）· <a style="color:var(--red-dark)" href="javascript:ieGo(\'plan\')">去管理计划 →</a></p></div>';
  // 7 日时长
  const wk = ieLastNDurations(7);
  const chart = '<div class="card" style="margin-top:16px"><h3>📈 近 7 日学习时长趋势（小时）</h3>'+ieLineChart(wk.arr, wk.labs, "#E63946")+
    '<p class="muted">本周累计 '+ieWeekTime()+' 小时 · 本月打卡 '+ieMonthCheckins()+' 天</p></div>';
  const feedBadge = IE_FEED_DATE
    ? '<div class="card" style="margin-top:16px;background:#f3f7e8;border-left:3px solid #2e7d32"><h3>🌐 今日真题已联网更新</h3><p class="muted">题库日期：'+IE_FEED_DATE+' · 来源：网络近期雅思考题（阅读/听力/口语/写作）。每日自动化刷新；若离线或加载失败，自动回退到内置静态题库。</p></div>'
    : '';
  return '<div class="grid grid-cols-4" style="margin-bottom:4px">'+ov+'</div>'+planBar+chart+feedBadge+
    '<div class="card" style="margin-top:16px"><h3>🧭 模式与难度</h3>'+
    '<p class="muted">当前：'+(p.mode==="exam"?"🎯 雅思应试备考模式":"💬 日常英文对话模式")+' · 难度 '+p.difficulty+' 分。'+
    '可点击右上角按钮切换，或输入指令【切换应试模式】【切换日常对话模式】【难度调到 7 分】。</p>'+
    '<button class="btn ghost small" onclick="ieGenReview()">🌙 生成今日学习复盘</button> <span id="ieReview"></span></div>';
}
function ieGenReview(){
  const d = ieGetDaily(ieToday());
  const errs = ieGetErrors().filter(e=>e.date===ieToday());
  const weak = {};
  errs.forEach(e=> weak[e.module] = (weak[e.module]||0)+1);
  let txt = "今日复盘：";
  if (!errs.length) txt += "🎉 暂无错题，保持节奏！";
  else {
    const wm = Object.keys(weak).sort((a,b)=>weak[b]-weak[a])[0];
    const map = { reading:"阅读", listening:"听力", speaking:"口语" };
    txt += "共 "+errs.length+" 道错题，薄弱板块为【"+(map[wm]||wm)+"】。建议加练："+
      (wm==="reading"?"判断题定位与同义替换":wm==="listening"?"数字拼写与干扰信息":wm==="speaking"?"Part3 思辨表达":"对应模块")+"。";
  }
  $("#ieReview").innerHTML = '<span class="chip" style="background:var(--red);color:#fff">'+esc(txt)+'</span>';
}

/* ---- 板块1：阅读专项 ---- */
function ieReading(){
  const p = IE_CONTENT.readingPassage;
  const passage = '<div class="card"><h3>📄 '+esc(p.title)+'（A 类学术·难度 '+ieProfile().difficulty+'）</h3>'+
    '<div class="pre-wrap">'+esc(p.text)+'</div></div>';
  const drill = '<div class="card"><h3>📝 阅读专项题库（判断题 / 填空 / 选择 / 匹配 / 小标题）</h3>'+ieRenderQSet({ module:"reading", qs:p.qs })+'</div>';
  const refinedIdx = (new Date().getDate()) % IE_CONTENT.dailySentence.length;
  const refine = '<div class="card"><h3>🌿 每日精读 · 长难句拆解（Day '+(new Date().getDate())+'）</h3>'+
    '<div class="pre-wrap">'+esc(IE_CONTENT.dailySentence[refinedIdx])+'</div>'+
    '<details class="collapsible"><summary>📖 拆解示范</summary>'+
    '<p>① 找主干：提取主谓宾，忽略插入语与修饰。</p>'+
    '<p>② 析从句：识别 that / which / while 引导的从句功能。</p>'+
    '<p>③ 提同义替换：标记题干与原文对应词，积累替换表达。</p>'+
    '<p>④ 翻中文：先直译再润色，确保逻辑通顺。</p></details>'+
    '<button class="btn small" onclick="ieUpdDaily(o=>o.readingRefined++)">✅ 标记今日已精读</button></div>';
  return passage + drill + refine;
}

/* ---- 板块2：听力专项 ---- */
function ieListening(){
  let h = "";
  IE_CONTENT.listeningSets.forEach((s, si)=>{
    h += '<div class="card"><h3>🎧 '+esc(s.title)+'</h3>'+
      '<details class="collapsible"><summary>📜 听力原文（无音频，按文本模考）</summary><div class="pre-wrap">'+esc(s.transcript)+'</div></details>'+
      ieRenderQSet({ module:"listening", qs:s.qs })+
      '<button class="btn small" onclick="ieListenDone('+si+')">✅ 完成本 Section</button></div>';
  });
  h += '<div class="card"><h3>🔍 精听训练专区</h3>'+
    '<p class="muted">针对关键词抓取、数字考点、拼写专项。建议：单句听写→对照原文→标记漏听词。</p>'+
    '<ul class="clean"><li>🔢 数字考点：电话/价格/日期，注意 -teen 与 -ty、序数词拼写。</li>'+
    '<li>🔤 拼写专项：易错词 accommodation, questionnaire, Wednesday。</li>'+
    '<li>🎯 关键词抓取：先读题圈限定词（数字、专有名词、否定词）。</li></ul>'+
    '<button class="btn ghost small" onclick="ieGo(\'errors\')">📒 查看听力错题本</button></div>';
  return h;
}
function ieListenDone(si){
  const weak = [];
  IE_CONTENT.listeningSets[si].qs.forEach(q=> weak.push(q.type));
  ieUpdDaily(o=>{ o.listenSections++; o.listenWeak = Array.from(new Set([...o.listenWeak, ...weak])); });
  alert("已记录：完成 " + IE_CONTENT.listeningSets[si].title);
  ieGo("listening");
}

/* ---- 板块3：口语专项 ---- */
function ieSpeaking(){
  const p = ieProfile();
  const modeDaily = p.mode === "daily";
  let h = '<div class="card"><h3>🗣️ 口语训练</h3>'+
    '<p class="muted">当前模式：'+(modeDaily?"💬 日常对话（引导你主动开口，温和纠错）":"🎯 应试模考（Part1/2/3 标准流程）")+
    ' · 难度 '+p.difficulty+'。请尽量用完整英文回答，作答后点「提交分析」。</p></div>';
  if (modeDaily){
    h += '<div class="card"><h3>💬 日常对话训练</h3>';
    IE_CONTENT.dailyDialogue.forEach((d, i)=>{
      h += '<div class="qbox"><div class="qhead"><span class="qtag">对话</span> '+esc(d.q)+'</div>'+
        '<textarea class="qinput" rows="2" placeholder="用英语回答…"></textarea>'+
        '<button class="btn small" onclick="ieSpeakReview(this,\'daily\')">提交分析</button>'+
        '<div class="explain" style="display:none"><p class="ans">💡 参考答案思路：'+esc(d.tip)+'</p>'+
        '<p class="muted">温和纠错：先肯定再点拨，不打断表达流畅度。例：Your idea is clear! A small tip — try "I would" instead of "I will" for hypotheticals.</p></div></div>';
    });
    h += '</div>';
  } else {
    h += '<div class="card"><h3>📋 Part 1 · 日常问答</h3>';
    IE_CONTENT.speaking.part1.forEach(t=>{
      h += '<div class="qbox"><div class="qhead"><span class="qtag">Part1</span> '+esc(t.topic)+'</div>'+
        '<p>❓ '+esc(t.q)+'</p><textarea class="qinput" rows="2" placeholder="回答…"></textarea>'+
        '<button class="btn small" onclick="ieSpeakReview(this,\'p1\')">提交分析</button>'+
        '<div class="explain" style="display:none"><p class="ans">💡 思路：'+esc(t.tip)+'</p></div></div>';
    });
    h += '</div>';
    h += '<div class="card"><h3>🎤 Part 2 · 个人陈述（2 分钟）</h3>';
    IE_CONTENT.speaking.part2.forEach(t=>{
      h += '<div class="qbox"><div class="qhead"><span class="qtag">Part2</span> '+esc(t.topic)+'</div>'+
        '<p>📌 '+esc(t.bullets.join(" / "))+'</p><textarea class="qinput" rows="3" placeholder="按要点展开…"></textarea>'+
        '<button class="btn small" onclick="ieSpeakReview(this,\'p2\')">提交分析</button>'+
        '<div class="explain" style="display:none"><p class="ans">💡 思路：'+esc(t.tip)+'</p></div></div>';
    });
    h += '</div>';
    h += '<div class="card"><h3>🧠 Part 3 · 深度思辨</h3>';
    IE_CONTENT.speaking.part3.forEach(t=>{
      h += '<div class="qbox"><div class="qhead"><span class="qtag">Part3</span> '+esc(t.topic)+'</div>'+
        '<p>❓ '+esc(t.q)+'</p><textarea class="qinput" rows="2" placeholder="思辨回答…"></textarea>'+
        '<button class="btn small" onclick="ieSpeakReview(this,\'p3\')">提交分析</button>'+
        '<div class="explain" style="display:none"><p class="ans">💡 思路：'+esc(t.tip)+'</p></div></div>';
    });
    h += '</div>';
  }
  h += '<div class="card"><h3>🎯 完整口语模考</h3><p class="muted">按顺序完成：Part1×3 → Part2（2min）→ Part3×3。点击下方开始记录模考次数。</p>'+
    '<button class="btn" onclick="ieMockSpeak()">🚀 开始一场口语模考</button></div>';
  return h;
}
function ieSpeakReview(btn, kind){
  const box = btn.closest(".qbox");
  const ta = box.querySelector(".qinput");
  const ans = (ta.value || "").trim();
  box.querySelector(".explain").style.display = "block";
  if (ans){
    ieUpdDaily(o=>{ o.speakTopics++; });
    if (kind === "daily") ieUpdDaily(o=> o.dailySessions++);
    btn.textContent = "✅ 已记录";
  } else {
    btn.textContent = "请先输入回答";
    box.querySelector(".explain").style.display = "none";
  }
}
function ieMockSpeak(){
  ieUpdDaily(o=> o.speakMocks++);
  alert("已记录 1 次口语模考（含 Part1/2/3）。");
  ieGo("speaking");
}

/* ---- 板块4：词句积累库 ---- */
function ieWords(){
  const words = ieGetWords();
  const byType = t => words.filter(w=>w.type===t);
  let h = '<div class="card"><h3>📚 雅思高频学术词汇</h3><p>';
  h += byType("academic").map(w=>'<span class="chip">'+esc(w.word)+(w.meaning?' · '+esc(w.meaning):'')+'</span>').join("") + '</p></div>';
  h += '<div class="card"><h3>🔁 同义替换词库（写作/口语提分核心）</h3><p>';
  h += IE_CONTENT.replacements.map(r=>'<span class="chip">'+esc(r[0])+' → '+esc(r[1])+'</span>').join("") + '</p></div>';
  h += '<div class="card"><h3>✍️ 高分句型存档</h3>'+
    '<details class="collapsible"><summary>📝 写作句型</summary>'+IE_CONTENT.sentences.writing.map(s=>'<p>• '+esc(s)+'</p>').join("")+'</details>'+
    '<details class="collapsible"><summary>🗣️ 口语句型</summary>'+IE_CONTENT.sentences.speaking.map(s=>'<p>• '+esc(s)+'</p>').join("")+'</details></div>';
  h += '<div class="card"><h3>📝 单词自测 · 随机抽查默写</h3>'+
    '<p class="muted">点击下方抽取一个单词，输入其中文释义；答错自动复习。</p>'+
    '<div id="ieQuiz"></div>'+
    '<button class="btn small" onclick="ieQuiz()">🎲 抽一题</button> '+
    '<button class="btn ghost small" onclick="ieGo(\'words\')">🔄 刷新</button></div>';
  h += '<div class="card"><h3>🆚 书面学术英语 vs 日常地道口语</h3>'+
    '<div class="row"><div class="card" style="flex:1"><h4>📘 书面学术</h4><p class="muted">utilise, demonstrate, nevertheless, a substantial amount of</p></div>'+
    '<div class="card" style="flex:1"><h4>💬 日常口语</h4><p class="muted">use, show, but, a lot of, kinda, wanna</p></div></div>'+
    '<p class="muted">区分要点：学术写作重精确与正式；口语重自然流畅，可用缩略与口语化表达。</p></div>';
  if (IE_CONTENT.writing){
    const w = IE_CONTENT.writing;
    let wc = '<div class="card"><h3>📝 今日写作真题（网络近期考题）</h3>';
    if (w.task2 && w.task2.length){
      wc += '<p class="muted">Task 2 议论文</p>';
      w.task2.forEach(t=>{
        wc += '<div class="qbox"><div class="qhead"><span class="qtag">真题</span> '+esc(t.prompt)+'</div>'+
          '<details class="collapsible"><summary>📐 四段式提纲</summary><p class="pre-wrap">'+esc(t.outline)+'</p>'+
          (t.source?'<p class="muted">来源：'+esc(t.source)+'</p>':'')+'</details></div>';
      });
    }
    if (w.task1 && w.task1.length){
      wc += '<p class="muted" style="margin-top:8px">Task 1 图表</p>';
      w.task1.forEach(t=>{
        wc += '<div class="qbox"><div class="qhead"><span class="qtag">真题</span> '+esc(t.prompt)+'</div>'+
          '<details class="collapsible"><summary>📐 写作要点</summary><p class="pre-wrap">'+esc(t.outline)+'</p>'+
          (t.source?'<p class="muted">来源：'+esc(t.source)+'</p>':'')+'</details></div>';
      });
    }
    wc += '<p class="muted">提示：限时 40 分钟（Task2）/ 20 分钟（Task1）完成，写完用「逐题精讲」思路自检。</p></div>';
    h += wc;
  }
  return h;
}
function ieQuiz(){
  const words = ieGetWords().filter(w=>w.meaning);
  if (!words.length){ $("#ieQuiz").innerHTML = '<p class="muted">暂无带释义的词，可先去「设置→数据」或手动添加。</p>'; return; }
  const w = words[Math.floor(Math.random()*words.length)];
  $("#ieQuiz").innerHTML =
    '<div class="qbox"><div class="qhead"><span class="qtag">默写</span> '+esc(w.word)+' （'+ (w.type==="academic"?"学术":w.type==="spoken"?"口语":"替换") +'）</div>'+
    '<input class="qinput" id="ieQuizAns" placeholder="输入中文释义"><button class="btn small" onclick="ieQuizCheck(\''+w.id+'\')">提交</button>'+
    '<div class="explain" id="ieQuizEx" style="display:none"></div></div>';
  setTimeout(()=>{ const e=$("#ieQuizAns"); if(e) e.focus(); }, 50);
}
function ieQuizCheck(id){
  const words = ieGetWords(); const w = words.find(x=>x.id===id);
  const ans = ($("#ieQuizAns").value||"").trim();
  const ok = w && w.meaning && (w.meaning.indexOf(ans)>=0 || ans.indexOf(w.meaning.replace(/（.*）/,'').trim())>=0);
  const ex = $("#ieQuizEx"); ex.style.display = "block";
  if (ok){ w.mastered = true; ieSave(IE_PK.words, words); ex.innerHTML = '<p class="ans">✅ 正确！已标记为掌握。</p>'; }
  else { ex.innerHTML = '<p class="ans">❌ 正确答案：'+esc(w.meaning||w.word)+'</p><p class="muted">已加入复习。</p>'; }
}

/* ---- 板块5：每日学习计划 ---- */
function iePlan(){
  const plan = ieGetPlan();
  let rows = plan.tasks.map(t=>
    '<tr><td><input type="checkbox" '+(t.done?"checked":"")+' onchange="iePlanToggle(\''+t.id+'\')"></td>'+
    '<td>'+esc(t.text)+'</td><td><span class="chip">'+esc(t.type)+'</span></td>'+
    '<td><button class="btn danger small" onclick="iePlanDel(\''+t.id+'\')">🗑️</button></td></tr>'
  ).join("");
  const done = plan.tasks.filter(t=>t.done).length;
  const total = plan.tasks.length;
  const pct = total? Math.round(done/total*100):0;
  const d = ieGetDaily(ieToday());
  const rate = (d.readingTotal+d.listenTotal)? Math.round((d.readingCorrect+d.listenCorrect)/(d.readingTotal+d.listenTotal)*100)+"%" : "—";
  return '<div class="card"><h3>➕ 添加学习计划</h3>'+
    '<div class="row"><select id="iePlanType"><option value="reading">📖 阅读</option><option value="listening">👂 听力</option><option value="speaking">🗣️ 口语</option><option value="words">📚 词句</option></select>'+
    '<input id="iePlanText" placeholder="例如：精读 1 篇阅读 / 听力精听 1 Section"></div>'+
    '<button class="btn small" style="margin-top:8px" onclick="iePlanAdd()">➕ 添加任务</button></div>'+
    '<div class="card"><h3>📋 今日计划表</h3>'+
    '<table class="ie-table"><tr><th>完成</th><th>任务</th><th>类型</th><th></th></tr>'+rows+'</table>'+
    '<div class="progress" style="margin-top:10px"><span style="width:'+pct+'%"></span></div>'+
    '<p class="muted">完成 '+done+' / '+total+' · '+pct+'%</p></div>'+
    '<div class="card"><h3>📊 今日数据统计</h3>'+
    '<div class="grid grid-cols-4">'+
      '<div class="ov-card"><div class="ov-name">完成任务</div><b>'+done+'</b></div>'+
      '<div class="ov-card"><div class="ov-name">完成进度</div><b>'+pct+'%</b></div>'+
      '<div class="ov-card"><div class="ov-name">练习正确率</div><b>'+rate+'</b></div>'+
      '<div class="ov-card"><div class="ov-name">学习时长</div><b>'+(d.duration||0)+'h</b></div>'+
    '</div>'+
    '<div style="margin-top:12px">'+ieLineChart(ieLastNDurations(7).arr, ieLastNDurations(7).labs, "#F5C518")+'<p class="muted">近 7 日时长趋势</p></div></div>';
}
function iePlanAdd(){
  const text = $("#iePlanText").value.trim(); const type = $("#iePlanType").value;
  if (!text) return;
  const plan = ieGetPlan(); plan.tasks.push({ id: ieUid(), text, type, done:false }); ieSave(IE_PK.plan, plan);
  ieGo("plan");
}
function iePlanToggle(id){ const plan=ieGetPlan(); const t=plan.tasks.find(x=>x.id===id); if(t){ t.done=!t.done; ieSave(IE_PK.plan,plan);} ieGo("plan"); }
function iePlanDel(id){ const plan=ieGetPlan(); plan.tasks=plan.tasks.filter(x=>x.id!==id); ieSave(IE_PK.plan,plan); ieGo("plan"); }

/* ---- 板块6：打卡日历 ---- */
function ieCheckin(){
  const c = ieGetCheckin();
  const now = new Date(); const y = now.getFullYear(), m = now.getMonth();
  const first = new Date(y, m, 1).getDay(); const days = new Date(y, m+1, 0).getDate();
  let cells = "";
  for (let i=0;i<first;i++) cells += '<div class="cal-cell" style="visibility:hidden"></div>';
  for (let dnum=1; dnum<=days; dnum++){
    const key = y+"-"+String(m+1).padStart(2,"0")+"-"+String(dnum).padStart(2,"0");
    const rec = c[key];
    const isToday = key === ieToday();
    cells += '<div class="cal-cell '+(isToday?"today":"")+(rec&&rec.checked?"has":"")+'" onclick="ieCheckDate(\''+key+'\')">'+
      dnum + (rec&&rec.checked?'<span class="dot"></span><span class="cal-dur">'+rec.duration+'h</span>':'') + '</div>';
  }
  const streak = ieStreak();
  return '<div class="card"><h3>📆 打卡日历 · '+ (m+1) +' 月</h3>'+
    '<div class="cal-grid"><div class="cal-week">日</div><div class="cal-week">一</div><div class="cal-week">二</div><div class="cal-week">三</div><div class="cal-week">四</div><div class="cal-week">五</div><div class="cal-week">六</div>'+cells+'</div>'+
    '<p class="muted">点击日期打卡 / 录入当日学习时长（0.5h~4h 档位）。</p></div>'+
    '<div class="card"><h3>📊 核心数据</h3>'+
    '<div class="grid grid-cols-4">'+
      '<div class="ov-card"><div class="ov-name">本月打卡</div><b>'+ieMonthCheckins()+' 天</b></div>'+
      '<div class="ov-card"><div class="ov-name">本周总时长</div><b>'+ieWeekTime()+' h</b></div>'+
      '<div class="ov-card"><div class="ov-name">连续打卡</div><b>'+streak+' 天</b></div>'+
      '<div class="ov-card"><div class="ov-name">累计打卡</div><b>'+ieTotalCheckins()+' 天</b></div>'+
    '</div></div>'+
    '<div id="ieCheckPanel"></div>';
}
function ieCheckDate(key){
  const c = ieGetCheckin();
  const rec = c[key] || { checked:false, duration:1 };
  const dur = prompt("录入 "+key+" 的学习时长（0.5 / 1 / 1.5 / 2 / 3 / 4 小时）：", String(rec.duration||1));
  if (dur === null) return;
  let v = parseFloat(dur); if (isNaN(v)) v = 1; v = Math.min(4, Math.max(0.5, v));
  c[key] = { checked:true, duration: v };
  ieSave(IE_PK.checkin, c);
  ieUpdDaily(o=>{ o.duration = Math.max(o.duration, v); });
  ieGo("checkin");
}

/* ---- 板块7：时长统计 ---- */
function ieTime(){
  const c = ieGetCheckin(); const daily = ieLoad(IE_PK.daily, {});
  let total=0, byMod={reading:0,listening:0,speaking:0,daily:0};
  for (const k in c) total += (c[k].duration||0);
  for (const k in daily){ const o=daily[k]; byMod.reading+=o.timeReading||0; byMod.listening+=o.timeListening||0; byMod.speaking+=o.timeSpeaking||0; byMod.daily+=o.timeDaily||0; }
  const wk = ieLastNDurations(7);
  return '<div class="card"><h3>⏱️ 学习时长统计</h3>'+
    '<div class="grid grid-cols-4">'+
      '<div class="ov-card"><div class="ov-name">累计总时长</div><b>'+total+' h</b></div>'+
      '<div class="ov-card"><div class="ov-name">本周时长</div><b>'+ieWeekTime()+' h</b></div>'+
      '<div class="ov-card"><div class="ov-name">本月打卡</div><b>'+ieMonthCheckins()+' 天</b></div>'+
      '<div class="ov-card"><div class="ov-name">连续打卡</div><b>'+ieStreak()+' 天</b></div>'+
    '</div></div>'+
    '<div class="card"><h3>📅 每日时长（近 7 日）</h3>'+ieLineChart(wk.arr, wk.labs, "#F5C518")+'</div>'+
    '<div class="card"><h3>🧩 分模块时长分布</h3>'+ieBarChart([
      { label:"📖 阅读", value: byMod.reading, color:"#E63946", unit:"h" },
      { label:"👂 听力", value: byMod.listening, color:"#F5C518", unit:"h" },
      { label:"🗣️ 口语", value: byMod.speaking, color:"#8B6914", unit:"h" },
      { label:"💬 日常", value: byMod.daily, color:"#C1121F", unit:"h" },
    ])+'<p class="muted">提示：做完阅读/听力/口语练习时，系统会自动累计对应模块时长（演示版以打卡时长为主）。</p></div>';
}

/* ---- 板块8：模考分析 ---- */
function ieMock(){
  let h = '<div class="card"><h3>➕ 添加模考记录</h3>'+
    '<div class="row"><input id="mkName" placeholder="模考名称（如：剑18 Test1）"></div>'+
    '<div class="row" style="margin-top:8px"><select id="mkType"><option value="A类">A 类学术</option><option value="G类">G 类培训</option></select>'+
    '<input id="mkDate" type="date" value="'+ieToday()+'"></div>'+
    '<div class="row" style="margin-top:8px"><input id="mkTotal" type="number" step="0.5" placeholder="总分（如 6.5）">'+
    '<input id="mkR" type="number" step="0.5" placeholder="阅读">'+
    '<input id="mkL" type="number" step="0.5" placeholder="听力">'+
    '<input id="mkS" type="number" step="0.5" placeholder="口语"></div>'+
    '<div class="row" style="margin-top:8px"><input id="mkCost" placeholder="耗时（如 2h45m）"><input id="mkNote" placeholder="错题备注"></div>'+
    '<button class="btn small" style="margin-top:8px" onclick="ieMockAdd()">💾 保存模考</button></div>';
  const mocks = ieLoad(IE_PK.mock, []);
  if (mocks.length){
    const totals = mocks.map(m=>m.total||0);
    h += '<div class="card"><h3>📈 成绩趋势分析</h3>'+ieLineChart(totals, mocks.map(m=>m.date.slice(5)), "#E63946")+
      '<p class="muted">总分变化（共 '+mocks.length+' 场）</p></div>';
    h += '<div class="card"><h3>📋 全部模考记录</h3><table class="ie-table"><tr><th>名称</th><th>类型</th><th>日期</th><th>总分</th><th>阅读</th><th>听力</th><th>口语</th><th></th></tr>'+
      mocks.map(m=>'<tr><td>'+esc(m.name)+'</td><td>'+esc(m.type)+'</td><td>'+m.date+'</td><td><b>'+m.total+'</b></td><td>'+m.reading+'</td><td>'+m.listening+'</td><td>'+m.speaking+'</td><td><button class="btn danger small" onclick="ieMockDel(\''+m.id+'\')">🗑️</button></td></tr>').join("")+
      '</table></div>';
  } else {
    h += '<div class="card"><p class="muted">暂无模考记录，添加后自动生成趋势曲线。</p></div>';
  }
  return h;
}
function ieMockAdd(){
  const name=$("#mkName").value.trim(); if(!name) return;
  const m={ id:ieUid(), name, type:$("#mkType").value, date:$("#mkDate").value||ieToday(),
    total:parseFloat($("#mkTotal").value)||0, reading:parseFloat($("#mkR").value)||0,
    listening:parseFloat($("#mkL").value)||0, speaking:parseFloat($("#mkS").value)||0,
    cost:$("#mkCost").value, note:$("#mkNote").value };
  const a=ieLoad(IE_PK.mock,[]); a.unshift(m); ieSave(IE_PK.mock,a);
  ieGo("mock");
}
function ieMockDel(id){ const a=ieLoad(IE_PK.mock,[]).filter(m=>m.id!==id); ieSave(IE_PK.mock,a); ieGo("mock"); }

/* ---- 板块9：错题 & 薄弱知识点 ---- */
function ieErrors(){
  const errs = ieGetErrors();
  const map = { reading:"📖 阅读", listening:"👂 听力", speaking:"🗣️ 口语" };
  let filterBar = '<div class="tabs" id="ieErrFilter"><button class="tab active" data-f="all">⭐ 全部</button>'+
    '<button class="tab" data-f="reading">📖 阅读</button><button class="tab" data-f="listening">👂 听力</button>'+
    '<button class="tab" data-f="speaking">🗣️ 口语</button></div><div id="ieErrList"></div>';
  function list(f){
    const items = errs.filter(e=> f==="all"||e.module===f);
    if (!items.length) return '<p class="muted">🎉 该模块暂无错题，继续保持！</p>';
    return items.map(e=>'<div class="card" style="margin:8px 0"><div class="row" style="justify-content:space-between"><b>'+(map[e.module]||e.module)+' · '+esc(e.knowledge)+'</b><span class="muted">'+e.date+'</span></div>'+
      '<p>❓ '+esc(e.q)+'</p>'+
      '<p>✍️ 你的作答：'+esc(e.myAnswer)+' ｜ ✅ 正确：'+esc(e.correct)+'</p>'+
      (e.reason?'<p>🔁 同义替换：'+esc(e.reason)+'</p>':'')+
      (e.advice?'<p>🕳️ 出题陷阱：'+esc(e.advice)+'</p>':'')+
      '<p class="ans">📌 复习建议：定位原文句、积累对应替换、重做同类题。</p></div>').join("");
  }
  const h = '<div class="card"><h3>📒 错题 & 薄弱知识点记录</h3>'+
    '<p class="muted">统一收纳阅读/听力/口语训练中的错题，标注错误原因与对应知识点，支持随时调取复盘。</p></div>'+
    '<div id="ieErrWrap">'+filterBar+'</div>';
  // 渲染后绑定
  setTimeout(()=>{
    const wrap = $("#ieErrWrap"); if(!wrap) return;
    wrap.innerHTML = filterBar;
    const render = (f)=>{ $("#ieErrList").innerHTML = list(f); };
    render("all");
    $$("#ieErrFilter .tab").forEach(b=> b.onclick = ()=>{ $$("#ieErrFilter .tab").forEach(x=>x.classList.remove("active")); b.classList.add("active"); render(b.dataset.f); });
  }, 30);
  return h;
}
