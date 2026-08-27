// ====== 新闻 RSS 加载（带 CORS 代理与离线缓存） ======
window.RSS_FEEDS = {
  politics: { label: "🏛️ 政治", feeds: [
    "http://www.xinhuanet.com/politics/news_politics.xml",
    "https://www.people.com.cn/rss/politics.xml",
  ]},
  economy: { label: "💰 经济", feeds: [
    "http://www.xinhuanet.com/fortune/news_finance.xml",
    "https://www.36kr.com/feed",
  ]},
  culture: { label: "🎭 文化", feeds: [
    "http://www.chinanews.com.cn/rss/culture.xml",
    "http://www.xinhuanet.com/politics/news_politics.xml",
  ]},
  ent: { label: "🎬 娱乐圈", feeds: [
    "http://www.chinanews.com.cn/rss/ent.xml",
  ]},
  tech: { label: "🤖 科技AI", feeds: [
    "http://www.xinhuanet.com/tech/news_tech.xml",
    "https://www.36kr.com/feed",
  ]},
};

const RSS2JSON = "https://api.rss2json.com/v1/api.json?rss_url=";
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
