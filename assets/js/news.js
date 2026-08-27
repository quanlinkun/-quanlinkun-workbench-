// ====== 新闻 RSS 加载（带 CORS 代理与离线缓存） ======
window.RSS_FEEDS = {
  politics: { label: "🏛️ 政治", feeds: [
    "https://www.chinanews.com.cn/rss/News.xml",
    "https://www.xinhuanet.com/politics/news_politics.xml",
    "https://www.people.com.cn/rss/politics.xml",
  ]},
  economy: { label: "💰 经济", feeds: [
    "https://www.36kr.com/feed",
    "https://www.cls.cn/rss",
    "https://www.caixin.com/",
  ]},
  culture: { label: "🎭 文化", feeds: [
    "http://www.people.com.cn/rss/wh.xml",
    "https://www.chinanews.com.cn/rss/News.xml",
  ]},
  ent: { label: "🎬 娱乐圈", feeds: [
    "http://ent.sina.com.cn/rss/ent.xml",
    "https://www.chinanews.com.cn/rss/News.xml",
  ]},
  tech: { label: "🤖 科技AI", feeds: [
    "https://www.jiqizhixin.com/rss",
    "https://36kr.com/feed",
    "https://www.zhihu.com/rss",
  ]},
};

const RSS2JSON = "https://api.rss2json.com/v1/api.json?count=12&rss_url=";
const ALLORIGINS = "https://api.allorigins.win/raw?url=";

function stripHtml(s){ return (s||"").replace(/<[^>]+>/g,"").replace(/&[a-z]+;/g," ").replace(/\s+/g," ").trim(); }

async function tryRss2Json(url){
  const res = await fetch(RSS2JSON + encodeURIComponent(url));
  const j = await res.json();
  if (j.status !== "ok" || !j.items) throw new Error("rss2json failed");
  return j.items.map(it => ({
    title: it.title, link: it.link,
    date: it.pubDate, desc: stripHtml(it.description || it.content || "")
  }));
}
async function tryAllOrigins(url){
  const res = await fetch(ALLORIGINS + encodeURIComponent(url));
  const text = await res.text();
  const doc = new DOMParser().parseFromString(text, "text/xml");
  const items = [...doc.querySelectorAll("item")];
  return items.slice(0,12).map(it => ({
    title: it.querySelector("title")?.textContent || "",
    link: it.querySelector("link")?.textContent || "",
    date: it.querySelector("pubDate")?.textContent || "",
    desc: stripHtml(it.querySelector("description")?.textContent || "")
  }));
}

async function loadFeed(feeds){
  let lastErr;
  for (const f of feeds){
    try { return await tryRss2Json(f); }
    catch(e){ lastErr = e; }
  }
  for (const f of feeds){
    try { return await tryAllOrigins(f); }
    catch(e){ lastErr = e; }
  }
  throw lastErr || new Error("all feeds failed");
}

// 返回新闻列表，优先缓存
async function getNews(cat){
  const cacheKey = "wb_news_" + cat;
  try {
    const items = await loadFeed(RSS_FEEDS[cat].feeds);
    localStorage.setItem(cacheKey, JSON.stringify({ t: Date.now(), items }));
    return items;
  } catch(e){
    const cached = localStorage.getItem(cacheKey);
    if (cached){ try { return JSON.parse(cached).items; } catch(_){} }
    throw e;
  }
}
