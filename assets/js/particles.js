/* ====== 深空粒子背景（金色星座连线） ======
   独立模块，不依赖其它脚本。通过 CSS 变量 --particle / --particle-rgb 取色，
   跟随主题自动换色；支持开关、移动端降配、后台暂停与系统「减弱动效」偏好。
========================================================= */
(function(){
  var canvas = document.getElementById("spaceCanvas");
  if (!canvas || !canvas.getContext) return;
  var ctx = canvas.getContext("2d");
  var KEY = "wb_particles";
  var REDUCED = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  var W = 0, H = 0, dpr = 1, ps = [], raf = null, tick = 0;
  var DOT = "#FFD700", RGB = "255,215,0";
  var mouse = { x: -9999, y: -9999, on: false };

  function readColors(){
    var s = getComputedStyle(document.documentElement);
    DOT = (s.getPropertyValue("--particle") || "").trim() || "#FFD700";
    RGB = (s.getPropertyValue("--particle-rgb") || "").trim() || "255,215,0";
  }

  function wanted(){
    var v = null;
    try { v = localStorage.getItem(KEY); } catch (e) { v = null; }
    if (v === "off") return false;
    if (v === "on") return true;
    return !REDUCED;
  }

  function seed(){
    var n = Math.round((W * H) / 26000);
    if (W < 760) n = Math.round(n * 0.5);
    n = Math.max(22, Math.min(n, 96));
    ps = [];
    for (var i = 0; i < n; i++){
      ps.push({
        x: Math.random() * W,
        y: Math.random() * H,
        vx: (Math.random() - 0.5) * 0.26,
        vy: (Math.random() - 0.5) * 0.26,
        r: 0.8 + Math.random() * 1.7
      });
    }
  }

  function resize(){
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = window.innerWidth;
    H = window.innerHeight;
    canvas.width = Math.floor(W * dpr);
    canvas.height = Math.floor(H * dpr);
    canvas.style.width = W + "px";
    canvas.style.height = H + "px";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    seed();
  }

  function draw(){
    ctx.clearRect(0, 0, W, H);
    var i, j, p, a, b, dx, dy, d2, d;
    for (i = 0; i < ps.length; i++){
      p = ps[i];
      p.x += p.vx;
      p.y += p.vy;
      if (p.x < -24) p.x = W + 24; else if (p.x > W + 24) p.x = -24;
      if (p.y < -24) p.y = H + 24; else if (p.y > H + 24) p.y = -24;
    }
    var LINK = W < 760 ? 88 : 116;
    ctx.lineWidth = 1;
    for (i = 0; i < ps.length; i++){
      a = ps[i];
      for (j = i + 1; j < ps.length; j++){
        b = ps[j];
        dx = a.x - b.x;
        dy = a.y - b.y;
        d2 = dx * dx + dy * dy;
        if (d2 < LINK * LINK){
          d = Math.sqrt(d2);
          ctx.strokeStyle = "rgba(" + RGB + "," + (0.20 * (1 - d / LINK)).toFixed(3) + ")";
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }
      if (mouse.on){
        dx = a.x - mouse.x;
        dy = a.y - mouse.y;
        d = Math.sqrt(dx * dx + dy * dy);
        if (d < 150){
          ctx.strokeStyle = "rgba(" + RGB + "," + (0.32 * (1 - d / 150)).toFixed(3) + ")";
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(mouse.x, mouse.y);
          ctx.stroke();
        }
      }
    }
    ctx.fillStyle = DOT;
    for (i = 0; i < ps.length; i++){
      p = ps[i];
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, 6.283);
      ctx.fill();
    }
  }

  function frame(){
    raf = requestAnimationFrame(frame);
    if (document.hidden) return;
    if (tick++ % 120 === 0) readColors();
    draw();
  }

  function start(){
    canvas.style.display = "block";
    if (raf) return;
    readColors();
    resize();
    raf = requestAnimationFrame(frame);
  }

  function stop(){
    if (raf){ cancelAnimationFrame(raf); raf = null; }
    ctx.clearRect(0, 0, W, H);
    canvas.style.display = "none";
  }

  function setOn(v){
    try { localStorage.setItem(KEY, v ? "on" : "off"); } catch (e) {}
    if (v) start(); else stop();
  }

  window.addEventListener("resize", function(){ if (raf) resize(); });
  window.addEventListener("mousemove", function(e){
    mouse.x = e.clientX; mouse.y = e.clientY; mouse.on = true;
  }, { passive: true });
  window.addEventListener("mouseleave", function(){ mouse.on = false; });
  window.addEventListener("blur", function(){ mouse.on = false; });

  if (window.MutationObserver){
    new MutationObserver(function(){
      readColors();
      if (raf) draw();
    }).observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
  }

  if (wanted()) start(); else canvas.style.display = "none";

  window.SpaceParticles = {
    start: start,
    stop: stop,
    setOn: setOn,
    isOn: function(){ return !!raf; }
  };
})();
