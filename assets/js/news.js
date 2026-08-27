// ====== 新闻 RSS 加载（带 CORS 代理、按时间排序、缓存过期） ======
// 说明：许多传统中文 RSS（新华网/人民网）已停更或返回陈旧内容，
// 目前稳定且实时的源为中国新闻网「滚动新闻」与 36氪。
// 缓存版本控制：升级后自动清理旧版（旧源失效链接）缓存
const NEWS_CACHE_VER = "v2";
(function clearOldNewsCache(){
  try{
    for(let i = localStorage.length - 1; i >= 0; i--){
      const k = localStorage.key(i);
      if(k && k.indexOf("wb_news_") === 0 && k.indexOf("wb_news_" + NEWS_CACHE_VER + "_") !== 0){
        localStorage.removeItem(k);
      }
    }
  }catch(_){}
})();
window.RSS_FEEDS = {
  politics: { label: "🏛️ 政治", feeds: [
    "http://www.chinanews.com.cn/rss/scroll-news.xml",
  ]},
  economy: { label: "💰 经济", feeds: [
    "https://www.36kr.com/feed",
    "http://www.chinanews.com.cn/rss/scroll-news.xml",
  ]},
  culture: { label: "🎭 文化", feeds: [
    "http://www.chinanews.com.cn/rss/scroll-news.xml",
  ]},
  ent: { label: "🎬 娱乐圈", feeds: [
    "http://www.chinanews.com.cn/rss/scroll-news.xml",
  ]},
  tech: { label: "🤖 科技AI", feeds: [
    "https://www.36kr.com/feed",
    "http://www.chinanews.com.cn/rss/scroll-news.xml",
  ]},
};

const RSS2JSON = "https://api.rss2json.com/v1/api.json?rss_url=";
const ALLORIGINS = "https://api.allorigins.win/raw?url=";
const NEWS_TTL = 20 * 60 * 1000; // 缓存 20 分钟，过期即刷新，保证每天拿到新内容

function stripHtml(s){ return (s||"").replace(/<[^>]+>/g,"").replace(/&[a-z]+;/g," ").replace(/\s+/g," ").trim(); }

function parseDate(s){
  if(!s) return 0;
  let d = new Date(String(s).replace(" ","T"));
  if(isNaN(d.getTime())) d = new Date(s);
  return isNaN(d.getTime()) ? 0 : d.getTime();
}

// 相对时间：刚刚 / X分钟前 / X小时前 / X天前 / 年月日
function timeAgo(s){
  const t = parseDate(s);
  if(!t) return s ? String(s).slice(0,16) : "";
  const diff = Date.now() - t;
  if(diff < 60000) return "刚刚";
  const m = Math.floor(diff/60000), h = Math.floor(diff/3600000), d = Math.floor(diff/86400000);
  if(m < 60) return m + " 分钟前";
  if(h < 24) return h + " 小时前";
  if(d < 30) return d + " 天前";
  return new Date(t).toLocaleDateString("zh-CN");
}

async function tryRss2Json(url){
  const res = await fetch(RSS2JSON + encodeURIComponent(url));
  const j = await res.json();
  if (j.status !== "ok" || !j.items) throw new Error("rss2json failed");
  return (j.items || []).map(it => ({
    title: it.title, link: it.link,
    date: it.pubDate || (it.timestamp ? new Date(it.timestamp*1000).toISOString() : ""),
    desc: stripHtml(it.description || it.content || "")
  }));
}
async function tryAllOrigins(url){
  const res = await fetch(ALLORIGINS + encodeURIComponent(url));
  const text = await res.text();
  const doc = new DOMParser().parseFromString(text, "text/xml");
  const items = [...doc.querySelectorAll("item")];
  return items.slice(0,15).map(it => ({
    title: it.querySelector("title")?.textContent || "",
    link: it.querySelector("link")?.textContent || "",
    date: it.querySelector("pubDate")?.textContent || "",
    desc: stripHtml(it.querySelector("description")?.textContent || "")
  }));
}

async function loadFeed(feeds){
  let lastErr;
  for (const f of feeds){
    try { const r = await tryRss2Json(f); if(r.length) return { items: r, source: f }; }
    catch(e){ lastErr = e; }
  }
  for (const f of feeds){
    try { const r = await tryAllOrigins(f); if(r.length) return { items: r, source: f }; }
    catch(e){ lastErr = e; }
  }
  throw lastErr || new Error("all feeds failed");
}

// 返回 { items(按发布时间倒序), source, cached, fetchedAt }
async function getNews(c, force){
  const cacheKey = "wb_news_" + NEWS_CACHE_VER + "_" + c;
  try {
    let cachedObj = null;
    const cached = localStorage.getItem(cacheKey);
    if (cached){ try { cachedObj = JSON.parse(cached); } catch(_){} }
    const fresh = cachedObj && (Date.now() - cachedObj.t < NEWS_TTL);
    if (!force && fresh && cachedObj.items && cachedObj.items.length){
      return { items: cachedObj.items, source: cachedObj.source, cached: true, fetchedAt: cachedObj.t };
    }
    const { items, source } = await loadFeed(RSS_FEEDS[c].feeds);
    items.sort((a,b) => parseDate(b.date) - parseDate(a.date));
    const out = { t: Date.now(), source, items };
    try { localStorage.setItem(cacheKey, JSON.stringify(out)); } catch(_){}
    return { items, source, cached: false, fetchedAt: out.t };
  } catch(e){
    const cached = localStorage.getItem(cacheKey);
    if (cached){ try { const o = JSON.parse(cached); return { items: o.items, source: o.source, cached: true, fetchedAt: o.t }; } catch(_){} }
    throw e;
  }
}
