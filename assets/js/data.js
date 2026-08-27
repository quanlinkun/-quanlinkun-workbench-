// ====== 全麟坤的工作台 · 静态内容数据 ======
window.APP_DATA = {

  // 侧边栏板块定义
  sections: [
    { id: "home", icon: "🏠", name: "首页" },
    { id: "news", icon: "📰", name: "新闻大事" },
    { id: "ielts", icon: "🎓", name: "英语雅思学习" },
    { id: "math", icon: "📐", name: "数学学习" },
    { id: "music", icon: "🎵", name: "音乐" },
    { id: "novel", icon: "✍️", name: "小说创作" },
    { id: "calendar", icon: "📅", name: "日历" },
    { id: "bookmarks", icon: "🔖", name: "收藏夹" },
  ],

  // 首页快捷入口说明
  quickLinks: [
    { page: "news", icon: "📰", name: "新闻大事", desc: "实时追踪政经文化科技资讯" },
    { page: "ielts", icon: "🎓", name: "雅思学习", desc: "听说读写系统备考" },
    { page: "math", icon: "📐", name: "数学学习", desc: "高中到拓扑全涵盖" },
    { page: "music", icon: "🎵", name: "音乐创作", desc: "词曲编与胡彦斌" },
    { page: "novel", icon: "✍️", name: "小说创作", desc: "写作·灵感·大纲" },
  ],
  quickLinks2: [
    { page: "calendar", icon: "📅", name: "日历", desc: "日程与小红点提醒" },
    { page: "bookmarks", icon: "🔖", name: "收藏夹", desc: "网页视频随手存" },
    { page: "search", icon: "🔍", name: "全局搜索", desc: "跨板块一键查找" },
  ],

  quotes: [
    "📜 不积跬步，无以至千里；不积小流，无以成江海。",
    "🌟 今天的努力，是幸运的伏笔。",
    "🔥 星光不问赶路人，时光不负有心人。",
    "🌱 自律给我自由。",
    "💡 学如逆水行舟，不进则退。",
  ],

  // ===== 雅思 =====
  ielts: {
    listening: {
      title: "👂 听力 Listening",
      score: [
        "🎯 雅思听力满分 9 分，按答对题数换算；6.0≈23-25 题，7.0≈30-32 题，8.0≈35-36 题。",
        "⏱️ 共 4 个 section，40 题，约 30 分钟，另有 10 分钟誊写答案。",
        "📝 题型含填空、选择、配对、地图、流程图等；Section 1/2 为生活场景，3/4 为学术场景。",
      ],
      vocab: [
        "accommodation 住宿","registration 登记","deposit 押金","refund 退款","timetable 时间表",
        "facility 设施","booking 预订","confirmation 确认","destination 目的地","luggage 行李",
        "procedure 流程","requirement 要求","survey 调查","lecture 讲座","seminar 研讨",
        "assignment 作业","deadline 截止","feedback 反馈","budget 预算","recommendation 推荐",
        "estimate 估计","schedule 计划","available 可用的","complaint 投诉","discount 折扣",
        "insurance 保险","voltage 电压","plug 插头","renew 续借","orientation 迎新",
      ],
      tips: [
        "👂 读题时圈出关键词与限定词（数字、专有名词）。",
        "🔢 注意同义替换，答案常是原文替换而非原词。",
        "✍️ 一边听一边预判词性（名词/数字/形容词）。",
        "🔁 地图题先找起点与方位词（north/east/opposite）。",
        "⏳ 没听到不要慌，立刻看下一题，避免连锁丢失。",
      ],
      sites: [
        { name: "IELTS Official (British Council)", url: "https://www.ielts.org" },
        { name: "BBC Learning English", url: "https://www.bbc.co.uk/learningenglish" },
        { name: "TED Talks", url: "https://www.ted.com" },
      ],
    },
    speaking: {
      title: "🗣️ 口语 Speaking",
      part1: [" hometown 家乡"," work/study 工作学习"," hobbies 爱好"," food 食物"," weather 天气"," travel 旅行"],
      part2: [" 描述一个人（敬佩的人）"," 难忘的旅行"," 喜欢的电影"," 一次成功经历"," 童年记忆"],
      part3: [" 科技对教育的影响"," 环保与生活方式"," 城市化利弊"," 艺术的价值"," 代际差异"],
      template: "🗣️ Part 2 答题结构：开头一句点题 → 分两点展开（with examples）→ 一句总结感受。保持 1.5-2 分钟。",
      connectors: ["Furthermore 而且","However 然而","In contrast 相反","For instance 例如","As a result 结果","On the other hand 另一方面","Personally 就我个人","To be honest 老实说","What I mean is 我的意思是","In my view 在我看来"],
      pron: [
        "🗣️ 连读：相邻词尾辅音+词首元音连成一体（如 turn on → tur-non）。",
        "🔊 重音落在实词（名词/动词/形容词），虚词弱读。",
        "😶 元音饱满，避免中式吞音；th/θ/ð 用舌尖咬唇。",
        "⏱️ 语调自然起伏，陈述句句末降调、疑问句升调。",
      ],
    },
    reading: {
      title: "📖 阅读 Reading",
      types: [
        { t: "1️⃣ 判断题 (T/F/NG)", d: "注意 NOT GIVEN 指文中无依据，而非与原文矛盾。" },
        { t: "2️⃣ 选择题", d: "先读题干定位，排除绝对化选项，警惕同义替换。" },
        { t: "3️⃣ 段落匹配", d: "读首尾句抓段落主旨，匹配 heading。" },
        { t: "4️⃣ 填空/摘要", d: "限定词性，按空格前后词定位原文。" },
        { t: "5️⃣ 人名观点配对", d: "快速扫描大写专有名词，画表归类。" },
        { t: "6️⃣ 句子填空", d: "注意语法结构与单复数一致性。" },
        { t: "7️⃣ 图表/流程图", d: "按步骤顺序在文中寻找对应描述。" },
      ],
      vocab: [
        "analyze 分析","significant 显著的","controversial 有争议的","approximately 大约","demonstrate 证明",
        "consequently 因此","adequate 充足的","subsequent 随后的","fundamental 基本的","phenomenon 现象",
        "consequence 后果","interpretation 解释","accumulate 积累","distinct 明显的","reluctant 不情愿的",
        "vulnerable 脆弱的","inevitable 不可避免的","substitute 替代","sustainable 可持续的","tobacco 烟草",
        "hypothesis 假设","parameter 参数","consensus 共识","implement 实施","contradict 反驳",
        "attribute 归因于","fluctuate 波动","approximately 近似","restrict 限制","obtain 获得",
        "emerge 出现","allocate 分配","comprehensive 全面的","renowned 著名的","scrutinize 仔细审查",
      ],
      longsentence: "🌳 示例：Although the new policy was designed to reduce emissions, critics argue that it fails to address the root cause of the problem, which lies in industrial structure. → 抓主干：critics argue that...；让步状语从句修饰主句，核心为「政策未能解决根源」。",
    },
    writing: {
      title: "✍️ 写作 Writing",
      smallTypes: [
        { t: "📈 线形图", s: "The line chart illustrates... / Overall, it is clear that..." },
        { t: "📊 柱状图", s: "The bar chart compares... / The highest was..., while the lowest..." },
        { t: "🥧 饼图", s: "The pie chart shows the proportion of... / Accounting for X%..." },
        { t: "🗺️ 地图", s: "The map depicts changes in... between X and Y." },
        { t: "⚙️ 流程图", s: "The process begins with... and ends with..." },
        { t: "📋 表格", s: "The table provides data on... across..." },
      ],
      bigTopics: [
        { t: "🌍 环境", f: "引入话题→分析成因→举例→提出对策→总结。" },
        { t: "🏙️ 社会", f: "立场明确→两点论证→让步反驳→结论。" },
        { t: "🎓 教育", f: "现象描述→利弊分析→个人观点→建议。" },
        { t: "🔬 科技", f: "背景→影响两面→你的立场→展望。" },
        { t: "💰 经济", f: "问题提出→原因分析→政府/个人角色→总结。" },
      ],
      connectors: ["Moreover 此外","Nevertheless 尽管如此","Therefore 因此","In conclusion 总之","On the contrary 相反","Firstly/Secondly 首先/其次","Whereas 然而","Consequently 结果","In addition 另外","Particularly 尤其"],
      criteria: "📝 评分四维度：Task Response（任务回应）、Coherence & Cohesion（连贯衔接）、Lexical Resource（词汇）、Grammatical Range（语法）。小作文 150 词，大作文  `250 词。",
    },
    // ===== 配套练习题（真实雅思题型，答案见“查看答案”）=====
    practice: {
      listening: [
        { q: "🎧 听后填空（材料：学生预订暑期宿舍）\n“The single room is £120 per week, and you need to pay a deposit of two weeks’ rent, so that’s £240. Check-in is on the 5th of July.”\n① 周租金 £____ ② 押金 £____ ③ 入住日期 ____", a: "① 120　② 240　③ 5th of July（7月5日）" },
        { q: "🎧 选择题：Section 2 介绍博物馆。 speaker 说 the museum is closed on ____.\nA. Monday　B. Tuesday　C. Wednesday", a: "B. Tuesday（常见陷阱：原文说 open daily except Tuesday）" },
        { q: "🎧 地图题：入口在 north gate，咖啡厅在入口的 ____ 方向。", a: "opposite / 正对面（方位词 opposite / next to / behind 为高频考点）" },
      ],
      speaking: [
        { q: "🗣️ Part 1：Do you prefer to study in the morning or evening? 请给出 30 秒回答要点。", a: "要点：明确偏好 + 理由（精力/安静）+ 例子。示例：I prefer mornings because my mind is freshest then; I can focus better and avoid distractions in the evening." },
        { q: "🗣️ Part 2 卡片：Describe a book that influenced you. 列出 4 个展开点。", a: "1) 书名与类型 2) 何时读到 3) 内容大意 4) 为何影响你（观点/行为改变）。保持 1.5–2 分钟。" },
        { q: "🗣️ Part 3：Why do some people dislike reading? 请给出讨论式回答框架。", a: "框架：承认现象 → 原因（时间/屏幕替代/教育）→ 反面价值 → 个人看法。可用连接词 Furthermore / However / In my view。" },
      ],
      reading: [
        { q: "📖 判断题：原文“Most students preferred online learning.”，题目“All students preferred online learning.” 答案？", a: "FALSE（most ≠ all，属于偷换数量）" },
        { q: "📖 填空题：The research was conducted in ____ countries across three continents. （空格限一词）", a: "答案需回原文定位名词/数字，注意词性；常见填法如 “five / several / 12”。" },
        { q: "📖 段落匹配：如何快速锁定 heading？", a: "读段落首句+尾句抓主旨；注意转折词（but/however）后的核心句；排除过于细节或重复的选项。" },
      ],
      writing: [
        { q: "✍️ 大作文真题风格：Some people think governments should invest more in public transport than in roads. To what extent do you agree? 给出四段式提纲。", a: "Intro：改写题目+立场（同意为主）。Body1：公共交通减缓拥堵与污染。Body2：道路投资边际效益低+让步（必要维护）。Conclusion：重申优先公共交通。" },
        { q: "✍️ 小作文：柱状体显示 2010–2020 三国可再生能源占比。首句如何写？", a: "The bar chart compares the proportion of renewable energy in Country A, B and C from C 2010 to 2020. Overall, ...（先总括最大/最小/趋势）。" },
        { q: "✍️ 评分自查：你的作文是否满足 Task Response？", a: "检查：是否回答全部问题、立场清晰、有理由与例子、不偏题。缺例子是大忌。" },
      ],
    },
  },

  // ===== 数学 =====
  math: {
    high: {
      title: "📚 高中数学",
      modules: [
        { name: "函数", formulas: ["f(x)=ax²+bx+c（二次函数）","指数：a^(m+n)=a^m·a^n","对数：log_a(MN)=log_aM+log_aN","三角函数：sin²x+cos²x=1"] },
        { name: "几何", formulas: ["三角形面积 S=½ab·sinC","余弦定理：c²=a²+b²-2ab·cosC","圆：S=πr², C=2πr"] },
        { name: "数列", formulas: ["等差：a_n=a_1+(n-1)d","等比：a_n=a_1·q^(n-1)","求和：S_n=n(a1+an)/2"] },
        { name: "概率", formulas: ["P(A∪B)=P(A)+P(B)-P(AB)","期望 E=X·p 之和","排列 A_n^m=n!/(n-m)!"] },
      ],
      examples: [
        { q: "已知 f(x)=x²-2x+3，求最小值。", a: "配方得 f(x)=(x-1)²+2，故最小值为 2（x=1 时）。" },
        { q: "等比数列前 3 项和为 14，公比 2，求首项。", a: "a1(1+2+4)=14 → 7a1=14 → a1=2。" },
        { q: "在△ABC 中，a=3,b=4,C=60°，求 c。", a: "由余弦定理 c²=9+16-24×½=13，c=√13。" },
      ],
    },
    calculus: {
      title: "∫ 高等数学",
      chapters: ["极限与连续","导数与微分","定积分与不定积分","级数","多元函数","微分方程"],
      theorems: ["夹逼定理","洛必达法则","中值定理（拉格朗日）","牛顿-莱布尼茨公式","泰勒展开"],
      formulas: ["d/dx(sin x)=cos x","∫x^n dx = x^(n+1)/(n+1)","∫e^x dx = e^x","lim(1+1/n)^n=e","∫₁/x dx = ln|x|"],
      examples: [
        { q: "求 lim(x→0) (sin x)/x。", a: "由重要极限或洛必达：= cos0 / 1 = 1。" },
        { q: "求 ∫₀¹ (2x+1)dx。", a: "原函数为 x²+x，代入上下限得 (1+1)-(0)=2。" },
      ],
    },
    linear: {
      title: "📊 线性代数",
      framework: ["行列式","矩阵运算","向量空间","线性方程组","特征值与特征向量","二次型"],
      formulas: ["det(AB)=detA·detB","A⁻¹ = adj(A)/det(A)","特征值：|A-λI|=0","秩 rank(A)≤min(m,n)","(AB)ᵀ=BᵀAᵀ"],
      theorems: ["秩-零度定理","克莱姆法则","相似矩阵同特征值","正交矩阵行列式为 ±1"],
      examples: [
        { q: "求 2×2 矩阵 [[2,1],[1,2]] 的特征值。", a: "解 |2-λ,1;1,2-λ|=0 → (2-λ)²-1=0 → λ=1,3。" },
        { q: "若 A 可逆，证 (AB)⁻¹=B⁻¹A⁻¹。", a: "(AB)(B⁻¹A⁻¹)=A(BB⁻¹)A⁻¹=I，故成立。" },
      ],
    },
    topology: {
      title: "🔄 拓扑学",
      concepts: ["拓扑空间 (X,τ)","连续映射","紧致性 Compact","连通性 Connected","同胚 Homeomorphism","商拓扑","度量空间"],
      definitions: [
        "📐 拓扑空间：集合 X 与其子集族 τ（开集），满足包含空集/全集、任意并、有限交。",
        "🔗 连续映射：f 连续 ⇔ 开集原像为开集。",
        "🔒 紧致：任意开覆盖有有限子覆盖。",
        "🔗 连通：不能划分为两个非空不交开集的并。",
      ],
      conclusions: [
        "🏆 Heine-Borel：Rⁿ 中紧致 ⇔ 闭且有界。",
        "🌐 紧致空间上的连续像仍紧致。",
        "🔄 连通空间的连续像仍连通。",
      ],
    },
    qiangji: {
      title: "🏆 强基计划",
      intro: "强基计划是 2020 年起在部分高校实施的招生改革，聚焦基础学科（数、理、化、生、史、哲、古文字等），高考成绩占 85%，校测占 15%，本硕博衔接培养。",
      schools: ["北京大学","清华大学","复旦大学","上海交通大学","浙江大学","中国科学技术大学","南京大学","西安交通大学","哈尔滨工业大学","北京航空航天大学"],
      contest: [
        "🔢 数论：同余、费马小定理、不定方程。",
        "🧩 组合：计数、图论、抽屉原理。",
        "⚖️ 不等式：均值不等式、柯西不等式、排序不等式。",
      ],
      examples: [
        { q: "证：对任意整数 n>1，n⁴+4 为合数（当 n>1）。", a: "n⁴+4=n⁴+4n²+4-4n²=(n²+2)²-(2n)²=(n²-2n+2)(n²+2n+2)，两因子均>1，故为合数。" },
        { q: "解不等式 a²+b²+c² ≥ ab+bc+ca。", a: "由 (a-b)²+(b-c)²+(c-a)²≥0 展开并除以2 即得。" },
      ],
    },
  },

  // ===== 音乐 =====
  music: {
    lyric: {
      title: "✍️ 作词",
      tips: ["🎯 押韵：尾字同韵母（如 ang/ing）形成韵律。","🌿 意象：用具象画面承载情绪，少用抽象词。","🏗️ 结构：主歌叙事、副歌升华、桥段转折。"],
      rhymes: ["ang: 光/伤/唱/巷/忘","ing: 心/听/停/影/星","ou: 愁/走/秋/后/酒","an: 晚/散/淡/盼/岸","i: 你/蜜/忆/离/季"],
      templates: ["【主歌】场景+细节\n【预副歌】情绪递进\n【副歌】核心句重复+升华\n【桥段】视角转换\n【副歌】收束"],
      classics: [
        "🎤 《青花瓷》：「天青色等烟雨，而我在等你」——以物喻情，意象极简。",
        "🎤 《红豆》：「还没好好地感受，雪花绽放的气候」——通感写法。",
        "🎤 《平凡之路》：「我曾经跨过山和大海，也穿过人山人海」——排比铺陈。",
      ],
    },
    compose: {
      title: "🎼 作曲",
      theory: ["🎵 音阶：大调明亮、小调忧伤；五声音阶（宫商角徵羽）。","🎹 和弦：三度叠置，三和弦/七和弦。","📈 旋律走向：级进平稳、跳进制造张力。"],
      chords: ["C–G–Am–F（万能进行）","I–V–vi–IV","C–Am–F–G","ii–V–I（ jazz）","I–vi–IV–V","vi–IV–I–V","C–G–Am–Em–F–C","I–IV–V（布鲁斯）","Am–F–C–G","I–V–vi–iii–IV"],
      forms: ["🎼 单三部：A–B–A","🎼 奏鸣曲式：呈示–发展–再现","🎼 变奏曲：主题+多次变奏","🎼 回旋：A–B–A–C–A"],
      advice: ["🎯 先写旋律再配和弦，或先定和弦走向再填旋律。","🔁 重复是记忆点，副歌动机要易记。","🎚️ 留白比堆砌更高级。"],
    },
    arrange: {
      title: "🎹 编曲",
      intro: ["🎚️ 配器：主旋律、铺底、节奏、贝斯分层。","🥁 层次：Intro→Verse→Chorus→Bridge→Outro。","⏱️ 节奏：鼓组驱动，注意切分与留白。"],
      range: ["🔊 人声：C3–C5","🎹 钢琴：A0–C8","🎸 吉他：E2–E6","🎻 小提琴：G3–E7","🎺 小号：F#3–C6"],
      flow: ["📝 定调与和弦骨架","🥁 编写鼓与节奏","🎹 铺底 pad/钢琴","🎸 加入主奏乐器","🎚️ 混音与母带"],
      styles: ["🎵 流行：简洁、旋律导向","🎸 摇滚：失真吉他、强节奏","🎧 电子：合成器、Loop","🎷 R&B：切分、平滑和声"],
    },
    hu: {
      title: "🎤 胡彦斌",
      bio: "胡彦斌，1983 年生，上海人，中国内地流行歌手、音乐制作人。以多元曲风、强大现场与改编能力著称，被称为「音乐魔法师」。",
      works: ["红颜","月光","诀别诗","为你而来","你的背包(翻)","音乐让我说","男人KTV","潇湘雨","勇敢的心","一万光年","life","anywhere","三生石","黑白画映","空位","爱情不是_","心目","不用管","生命里的必做","stay","来不及"],
      style: ["🎭 曲风横跨流行、R&B、摇滚、中国风、电子。","🎚️ 擅长编曲与 vocal 改编，现场即兴强。","🏆 2004 年获最受欢迎男歌手，制作多张专辑。"],
      bg: [
        "🎤 《红颜》：中国风代表作，古典意象与现代编曲结合。",
        "🎤 《月光》：动画《秦时明月》主题曲，大气磅礴。",
        "🎤 《男人KTV》：以男性视角写情感，传唱度极高。",
      ],
    },
  },

  // 收藏夹预置
  bookmarkPresets: [
    { title: "MDN Web Docs", url: "https://developer.mozilla.org", cat: "web", icon: "🌐", note: "前端开发权威文档", date: "2026-08-10" },
    { title: "Bilibili 学习区", url: "https://www.bilibili.com", cat: "web", icon: "📺", note: "视频学习平台", date: "2026-08-12" },
    { title: "雅思官方", url: "https://www.ielts.org", cat: "web", icon: "🎓", note: "考试信息", date: "2026-08-15" },
    { title: "3Blue1Brown 微积分", url: "https://www.youtube.com/watch?v=WUvTyaaNkzM", cat: "video", icon: "🎬", note: "本质理解系列", date: "2026-08-16" },
    { title: "李永乐老师 物理", url: "https (invalid placeholder)", cat: "video", icon: "🎬", note: "科普视频", date: " 2026-08-18" },
  ],

  // 日历预置
  calPresets: [
    { date: "2026-09-10", title: "🎂 生日", time: "全天", note: "重要纪念日", emoji: "🎂" },
    { date: "2026-09-20", title: "📝 雅思考试", time: "09:00", note: "口语+笔试", emoji: "📝" },
    { date: "2026-10-01", title: "🇨🇳 国庆节", time: "全天", note: "假期开始", emoji: "🏮" },
    { date: "2026-11-15", title: "📚 期中考试", time: "08:30", note: "数学+英语", emoji: "📚" },
  ],

  // 灵感库预置
  inspirationPresets: [
    { title: "雨夜旧书店", icon: "📚", content: "主角在二手书店发现一本会记录读者秘密的笔记本。" },
    { title: "时间倒流的钟表匠", icon: "⏰", content: "一个能修时间却修不了自己遗憾的老人。" },
    { title: "海底城市", icon: "🌊", content: "沉入海中的古城，居民靠发光鱼照明。" },
    { title: "会说话的猫", icon: "🐱", content: "猫咪其实一直在替离家多年的主人传递消息。" },
    { title: "末班地铁", icon: "🚇", content: "末班车只载「迷路的人」去平行世界。" },
    { title: "种子图书馆", icon: "🌱", content: "借一粒种子，归还一段故事。" },
    { title: "镜中逃亡", icon: "🪞", content: "镜子里的人想取代现实中的你。" },
    { title: "陨石来信", icon: "☄️", content: "陨石落地后播放了一段来自未来的警告。" },
    { title: "无声小镇", icon: "🏘️", content: "全镇人约定不再说话，却靠眼神传递秘密。" },
    { title: "机械鸟", icon: "🐦", content: "送信的机械鸟，只飞向最想念的人。" },
  ],
};
