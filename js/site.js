/* ===========================================================
   Osama Engineering — site behaviour
   - bilingual EN/AR with a full RTL flip
   - growth-capacity calculator (capacity, never wage savings)
   - scroll reveal, sticky nav, scrollspy
   - lazy mounting + offscreen render suspension for every canvas
   =========================================================== */
(function(){
  "use strict";

  var root  = document.documentElement;
  var body  = document.body;
  var REDUCE = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  var state = { lang:"en", work:"messages" };

  /* ---- storage ---- */
  try{
    var saved = localStorage.getItem("oe-site-lang");
    if(saved === "ar" || saved === "en"){ state.lang = saved; }
  }catch(e){}
  function saveLang(){
    try{ localStorage.setItem("oe-site-lang", state.lang); }catch(e){}
  }

  /* ===========================================================
     LANGUAGE
     =========================================================== */
  function renderLang(){
    var ar = state.lang === "ar";
    body.setAttribute("dir", ar ? "rtl" : "ltr");
    root.setAttribute("lang", ar ? "ar" : "en");

    var nodes = document.querySelectorAll("[data-en]");
    for(var i=0;i<nodes.length;i++){
      var n = nodes[i];
      var v = n.getAttribute(ar ? "data-ar" : "data-en");
      if(v === null) continue;
      if(v.indexOf("<") !== -1){ n.innerHTML = v; } else { n.textContent = v; }
    }

    document.getElementById("langBtn")
      .setAttribute("aria-label", ar ? "Switch to English" : "التبديل إلى العربية");

    syncVizLang();
  }

  document.getElementById("langBtn").addEventListener("click", function(){
    state.lang = state.lang === "ar" ? "en" : "ar";
    saveLang();
    renderLang();
    calc();
  });

  /* ===========================================================
     MOBILE NAV
     =========================================================== */
  var burger = document.getElementById("burger");
  var links  = document.getElementById("navLinks");
  burger.addEventListener("click", function(){
    var open = burger.getAttribute("aria-expanded") === "true";
    burger.setAttribute("aria-expanded", open ? "false" : "true");
    links.classList.toggle("is-open", !open);
  });
  links.addEventListener("click", function(ev){
    if(ev.target.closest("a")){
      burger.setAttribute("aria-expanded","false");
      links.classList.remove("is-open");
    }
  });

  /* ===========================================================
     STICKY NAV + SCROLLSPY
     =========================================================== */
  var navWrap = document.getElementById("navWrap");
  var sentinel = document.getElementById("topSentinel");
  if("IntersectionObserver" in window){
    new IntersectionObserver(function(entries){
      navWrap.classList.toggle("is-stuck", !entries[0].isIntersecting);
    }, { threshold: 0 }).observe(sentinel);
  }

  var spyLinks = Array.prototype.slice.call(links.querySelectorAll("a[href^='#']"));
  var spyTargets = spyLinks
    .map(function(a){ return document.getElementById(a.getAttribute("href").slice(1)); })
    .filter(Boolean);

  if(spyTargets.length && "IntersectionObserver" in window){
    var visible = {};
    var spy = new IntersectionObserver(function(entries){
      entries.forEach(function(e){ visible[e.target.id] = e.isIntersecting; });
      var current = null;
      for(var i=0;i<spyTargets.length;i++){
        if(visible[spyTargets[i].id]){ current = spyTargets[i].id; break; }
      }
      spyLinks.forEach(function(a){
        var on = a.getAttribute("href") === "#" + current;
        a.classList.toggle("is-active", on);
        if(on){ a.setAttribute("aria-current","true"); }
        else { a.removeAttribute("aria-current"); }
      });
    }, { rootMargin: "-72px 0px -55% 0px", threshold: 0 });
    spyTargets.forEach(function(t){ spy.observe(t); });
  }

  /* ===========================================================
     SCROLL REVEAL
     =========================================================== */
  function reveal(){
    var items = document.querySelectorAll("[data-reveal]");
    if(REDUCE || !("IntersectionObserver" in window)){
      for(var i=0;i<items.length;i++){ items[i].classList.add("is-in"); }
      return;
    }
    var io = new IntersectionObserver(function(entries){
      entries.forEach(function(e){
        if(e.isIntersecting){ e.target.classList.add("is-in"); io.unobserve(e.target); }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });
    for(var j=0;j<items.length;j++){ io.observe(items[j]); }
  }

  /* ===========================================================
     WORK EXAMPLES — centre-locked carousel
     The centred card is the one being read, and the pointer above the rail
     names its category. Centre is measured against the RAIL, not the viewport:
     the rail is not full-width, so a viewport-centre test drifts.
     =========================================================== */
  function svcCarousel(){
    var track = document.getElementById("svcTrack");
    var label = document.getElementById("svcCat");
    if(!track || !label) return;
    var cards = track.querySelectorAll(".d-svc");
    if(!cards.length) return;

    function setCentre(card){
      if(card.classList.contains("is-centre")) return;
      for(var i=0;i<cards.length;i++){ cards[i].classList.remove("is-centre"); }
      card.classList.add("is-centre");
      var en = card.getAttribute("data-cat-en") || "";
      var ar = card.getAttribute("data-cat-ar") || en;
      /* keep both so renderLang() can swap it on a language change */
      label.setAttribute("data-en", en);
      label.setAttribute("data-ar", ar);
      label.textContent = (body.getAttribute("dir") === "rtl") ? ar : en;
    }

    function pick(){
      var box = track.getBoundingClientRect();
      var mid = box.left + box.width / 2;
      var best = null, bestD = Infinity;
      for(var i=0;i<cards.length;i++){
        var r = cards[i].getBoundingClientRect();
        var d = Math.abs((r.left + r.width / 2) - mid);
        if(d < bestD){ bestD = d; best = cards[i]; }
      }
      if(best) setCentre(best);
    }

    /* rAF alone stalls in a background tab and the rail would latch on one
       card, so a timer races it — same guard the scrollytelling uses. */
    var pending = false;
    function onScroll(){
      if(pending) return;
      pending = true;
      var done = false;
      var run = function(){ if(done) return; done = true; pending = false; pick(); };
      requestAnimationFrame(run);
      setTimeout(run, 120);
    }

    track.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    pick();

    /* open on the lead card rather than at the rail's start edge */
    var lead = track.querySelector(".d-svc.lead") || cards[0];
    function centreOn(card, smooth){
      if(!card) return;
      var cr = card.getBoundingClientRect(), tr2 = track.getBoundingClientRect();
      var delta = (cr.left + cr.width / 2) - (tr2.left + tr2.width / 2);
      if(smooth && !REDUCE && track.scrollBy){
        track.scrollBy({ left: delta, behavior: "smooth" });
      } else {
        track.scrollLeft += delta;
      }
      pick();
    }
    centreOn(lead, false);

    /* ── arrows ──────────────────────────────────────────────────────────
       step() moves by one card in *reading* order. In RTL the rail's
       scrollLeft runs the other way, so "previous" and "next" are mapped
       through the document direction rather than hard-coded to left/right. */
    function step(dirSign){
      var rtl = body.getAttribute("dir") === "rtl";
      var order = Array.prototype.slice.call(cards);
      if(rtl) order.reverse();
      var idx = 0;
      for(var i=0;i<order.length;i++){ if(order[i].classList.contains("is-centre")){ idx = i; break; } }
      var next = Math.min(order.length - 1, Math.max(0, idx + dirSign));
      centreOn(order[next], true);
    }
    var prevBtn = document.getElementById("svcPrev");
    var nextBtn = document.getElementById("svcNext");
    if(prevBtn) prevBtn.addEventListener("click", function(){ step(-1); });
    if(nextBtn) nextBtn.addEventListener("click", function(){ step(1); });

    function syncArrows(){
      if(!prevBtn || !nextBtn) return;
      var order = Array.prototype.slice.call(cards);
      if(body.getAttribute("dir") === "rtl") order.reverse();
      var idx = 0;
      for(var i=0;i<order.length;i++){ if(order[i].classList.contains("is-centre")){ idx = i; break; } }
      prevBtn.disabled = idx === 0;
      nextBtn.disabled = idx === order.length - 1;
      var rtl = body.getAttribute("dir") === "rtl";
      prevBtn.setAttribute("aria-label", rtl ? "المثال السابق" : "Previous example");
      nextBtn.setAttribute("aria-label", rtl ? "المثال التالي" : "Next example");
    }
    track.addEventListener("scroll", syncArrows, { passive: true });
    document.getElementById("langBtn").addEventListener("click", function(){
      setTimeout(syncArrows, 0);
    });
    syncArrows();

    /* keyboard: the rail is focusable, so arrow keys should drive it */
    track.setAttribute("tabindex", "0");
    track.addEventListener("keydown", function(ev){
      if(ev.key === "ArrowRight"){ ev.preventDefault(); step(body.getAttribute("dir") === "rtl" ? -1 : 1); }
      else if(ev.key === "ArrowLeft"){ ev.preventDefault(); step(body.getAttribute("dir") === "rtl" ? 1 : -1); }
    });

    /* ── the one-time nudge ──────────────────────────────────────────────
       Fires once, the first time the rail is actually seen: drift one third
       of a card toward the next one and settle back. Enough to read as "this
       moves", short enough not to become ambient decoration. */
    if(!REDUCE && "IntersectionObserver" in window){
      var hinted = false;
      try{ hinted = sessionStorage.getItem("svc-hint") === "1"; }catch(e){}
      if(!hinted){
        var hio = new IntersectionObserver(function(entries){
          if(!entries[0].isIntersecting) return;
          hio.disconnect();
          try{ sessionStorage.setItem("svc-hint", "1"); }catch(e){}
          var rtl = body.getAttribute("dir") === "rtl";
          var amount = (cards[0].getBoundingClientRect().width || 296) * 0.34;
          var out = rtl ? -amount : amount;
          setTimeout(function(){
            if(!track.scrollBy){ return; }
            track.scrollBy({ left: out, behavior: "smooth" });
            setTimeout(function(){ track.scrollBy({ left: -out, behavior: "smooth" }); }, 620);
          }, 420);
        }, { threshold: 0.45 });
        hio.observe(track);
      }
    }
  }

  /* ===========================================================
     THE NIGHT SHIFT — driven by the scroll, forward only
     Progress is the feed's own travel up the viewport, so the story moves at
     exactly the speed the visitor scrolls: flick past it and it is finished
     by the time it is read, ease down it and each item arrives, types, works
     and resolves in turn.

     Progress only ever increases. Scrolling back up does not rewind and does
     not replay, and once the last row has resolved the listeners are removed
     for good — the section is then a finished, static piece of the page.

     Typing writes a growing slice of one contiguous string rather than
     wrapping characters in spans: Arabic is cursive, and per-character spans
     would break the joining. A prefix of an Arabic string shapes correctly,
     which is also how the script genuinely looks while being typed.
     =========================================================== */
  function nightShift(){
    var feed = document.getElementById("nightFeed");
    var turn = document.getElementById("nightTurn");
    var morning = document.getElementById("nightMorning");
    if(!feed || !turn || !morning) return;

    var items = [].slice.call(feed.querySelectorAll(".d-item"));
    if(!items.length) return;

    var ARRIVE = [], TYPED = [], WORK = [], DONE = [];
    for(var i=0;i<items.length;i++){
      ARRIVE[i] = 0.02 + i * 0.075;   /* the item lands, pending */
      TYPED[i]  = ARRIVE[i] + 0.055;  /* by here its text is fully typed */
      WORK[i]   = 0.50 + i * 0.075;   /* it starts being handled */
      DONE[i]   = WORK[i] + 0.06;     /* and is resolved */
    }
    var TURN_AT = 0.42, MORNING_AT = 0.90;

    function isAr(){ return document.body.getAttribute("dir") === "rtl"; }
    function srcOf(sp){ return sp.getAttribute(isAr() ? "data-ar" : "data-en") || ""; }

    /* ---- typing ---- */
    function fillType(it){
      if(it._t){ clearTimeout(it._t); it._t = 0; }
      it._typing = false;
      it._typed = true;
      var sp = it.querySelector(".d-task-text");
      if(sp) sp.textContent = srcOf(sp);
      it.classList.remove("is-typing");
    }
    function startType(it){
      if(it._typed || it._typing) return;
      var sp = it.querySelector(".d-task-text");
      if(!sp){ it._typed = true; return; }
      it._typing = true;
      it.classList.add("is-typing");
      sp.textContent = "";
      var n = 0;
      (function tick(){
        /* re-read every tick, so switching language mid-type self-corrects */
        var src = srcOf(sp);
        n += 2;
        if(n >= src.length){ fillType(it); return; }
        sp.textContent = src.slice(0, n);
        it._t = setTimeout(tick, 16);
      })();
    }

    /* ---- the finished state, with no sequence at all ---- */
    function settle(){
      for(var i=0;i<items.length;i++){
        var it = items[i];
        fillType(it);
        it.classList.add("is-in");
        it.classList.remove("is-working");
        it.classList.add(it.classList.contains("is-human") ? "is-ready" : "is-done");
        var st = it.querySelectorAll(".d-step");
        for(var j=0;j<st.length;j++){ st[j].classList.add("is-on"); }
      }
      turn.classList.add("is-in");
      morning.classList.add("is-in");
    }

    if(REDUCE){ settle(); return; }

    /* ---- progress: the feed's top travelling up the viewport ---- */
    var pMax = 0;
    function apply(){
      var vh = window.innerHeight || 800;
      var start = vh * 0.85, stop = vh * 0.06;
      var p = (start - feed.getBoundingClientRect().top) / (start - stop);
      if(p > pMax){ pMax = p > 1 ? 1 : p; }
      if(pMax <= 0) return;

      for(var i=0;i<items.length;i++){
        var it = items[i];

        if(pMax >= ARRIVE[i] && !it.classList.contains("is-in")){
          it.classList.add("is-in");
          startType(it);
        }
        /* scrolled past faster than the caret could run: just show the line */
        if(pMax >= TYPED[i] && !it._typed) fillType(it);

        if(pMax >= WORK[i] && !it._worked){
          it._worked = true;
          it.classList.add("is-working");
        }

        if(pMax >= WORK[i]){
          var steps = it.querySelectorAll(".d-step");
          var k = Math.ceil(((pMax - WORK[i]) / (DONE[i] - WORK[i])) * steps.length);
          if(k > steps.length){ k = steps.length; }
          for(var j=0;j<k;j++){ steps[j].classList.add("is-on"); }
        }

        if(pMax >= DONE[i] && !it._resolved){
          it._resolved = true;
          it.classList.remove("is-working");
          it.classList.add(it.classList.contains("is-human") ? "is-ready" : "is-done");
        }
      }

      /* both of these sit below the feed, so they also wait until they are
         actually on screen — otherwise a tall feed reveals them unseen */
      if(pMax >= TURN_AT && turn.getBoundingClientRect().top < vh * 0.96){
        turn.classList.add("is-in");
      }
      if(pMax >= MORNING_AT && morning.getBoundingClientRect().top < vh * 0.92){
        morning.classList.add("is-in");
      }

      if(finished()) detach();
    }

    function finished(){
      if(!morning.classList.contains("is-in")) return false;
      for(var i=0;i<items.length;i++){
        if(!items[i]._resolved || !items[i]._typed) return false;
      }
      return true;
    }

    var ticking = false;
    function onScroll(){
      if(ticking) return;
      ticking = true;
      requestAnimationFrame(function(){ ticking = false; apply(); });
    }
    function detach(){
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    }

    window.addEventListener("scroll", onScroll, { passive:true });
    window.addEventListener("resize", onScroll, { passive:true });
    apply();
  }

  function chartReveal(){
    var chart = document.getElementById("dChart");
    if(!chart) return;
    if(REDUCE || !("IntersectionObserver" in window)){ chart.classList.add("is-in"); return; }
    var io = new IntersectionObserver(function(entries){
      entries.forEach(function(e){
        if(e.isIntersecting){ chart.classList.add("is-in"); io.disconnect(); }
      });
    }, { threshold: 0.35 });
    io.observe(chart);
  }

  /* ===========================================================
     EMBEDDED DESIGN ASSETS
     Frames stay empty until they are close to the viewport, the
     language-paired ones reload when the language changes, and
     every frame's animation loop is suspended while it is
     scrolled away.
     =========================================================== */
  var vizList = Array.prototype.slice.call(document.querySelectorAll(".viz"));

  function vizSrc(viz){
    var ar = state.lang === "ar";
    return viz.getAttribute(ar && viz.hasAttribute("data-src-ar") ? "data-src-ar" : "data-src-en");
  }

  function mountViz(viz){
    var frame = viz.querySelector("iframe");
    var want = vizSrc(viz);
    if(frame.getAttribute("data-current") === want) return;
    viz.classList.remove("is-loaded");
    frame.setAttribute("data-current", want);
    frame.setAttribute("src", want);
  }

  function syncVizLang(){
    vizList.forEach(function(viz){
      if(!viz.hasAttribute("data-src-ar")) return;
      if(viz.getAttribute("data-mounted") !== "1") return;
      mountViz(viz);
    });
  }

  /* Each bundle ships as an authoring studio: the artwork sits on a dark
     #0a0a0a stage, under a drop shadow, above a transport bar, with the
     editor overlays on top. None of that belongs on the site. The asset
     files are left untouched — the studio chrome is stripped at runtime
     with a stylesheet injected into the frame once it has loaded. */
  var STUDIO_CSS = [
    "html,body{background:transparent !important;}",
    "[data-om-starter='animations-v3']{background:transparent !important;}",
    "[data-omelette-chrome]{display:none !important;}",
    "[data-om-starter='animations-v3'] svg{box-shadow:none !important;}",
    "#__bundler_loading,#__bundler_thumbnail{display:none !important;}",
    "[data-omelette-tweaks],[data-om-tweaks],[data-om-feedback],[data-om-grid]{display:none !important;}"
  ].join("");

  function stripStudio(frame){
    var doc;
    try{ doc = frame.contentDocument; }catch(e){ return; }
    if(!doc || !doc.head) return;
    if(doc.getElementById("oe-embed-css")) return;
    var st = doc.createElement("style");
    st.id = "oe-embed-css";
    st.textContent = STUDIO_CSS;
    doc.head.appendChild(st);
    /* the player sizes its canvas from the stage box, which just changed */
    try{ frame.contentWindow.dispatchEvent(new Event("resize")); }catch(e){}
  }

  /* Suspending an animation the browser cannot see.
     The players drive themselves off requestAnimationFrame inside their
     own document. Chrome keeps servicing rAF in a same-origin iframe that
     has scrolled out of view, so four React scenes would carry on
     rendering off-screen. Swapping the frame's own rAF for a queue stops
     the loop dead; restoring it flushes whatever was parked so the loop
     picks up on the next tick rather than stalling. */
  function setFramePaused(frame, paused){
    var win;
    try{ win = frame.contentWindow; }catch(e){ return; }
    if(!win || !win.requestAnimationFrame) return;

    if(paused){
      if(win.__oePaused) return;
      win.__oeRealRaf = win.__oeRealRaf || win.requestAnimationFrame.bind(win);
      win.__oeQueue = [];
      win.__oePaused = true;
      win.requestAnimationFrame = function(cb){ win.__oeQueue.push(cb); return 0; };
    }else{
      if(!win.__oePaused) return;
      win.__oePaused = false;
      win.requestAnimationFrame = win.__oeRealRaf;
      var parked = win.__oeQueue || [];
      win.__oeQueue = [];
      var now = (win.performance || performance).now();
      for(var i=0;i<parked.length;i++){
        try{ parked[i](now); }catch(e){}
      }
    }
  }

  vizList.forEach(function(viz){
    var frame = viz.querySelector("iframe");
    frame.addEventListener("load", function(){
      if(!frame.getAttribute("src")) return;
      /* The bundle unpacks React, ReactDOM and Babel and then replaces
         its own documentElement, which throws away anything injected
         before that point. How long that takes depends on the machine,
         so keep re-applying until the style survives a few checks. */
      var tries = 0, stable = 0;
      (function settle(){
        stripStudio(frame);
        var ok = false;
        try{ ok = !!(frame.contentDocument && frame.contentDocument.getElementById("oe-embed-css")); }catch(e){}
        stable = ok ? stable + 1 : 0;
        if(stable < 4 && ++tries < 80){ setTimeout(settle, 200); }
        else if(viz.getAttribute("data-onscreen") !== "1"){ setFramePaused(frame, true); }
      })();
      viz.classList.add("is-loaded");
    });
  });

  if("IntersectionObserver" in window){
    /* mount early — a frame needs a head start before it is looked at */
    var vizMount = new IntersectionObserver(function(entries){
      entries.forEach(function(e){
        if(!e.isIntersecting) return;
        e.target.setAttribute("data-mounted","1");
        mountViz(e.target);
        vizMount.unobserve(e.target);
      });
    }, { rootMargin: "300px 0px" });

    /* pause late — only once it is genuinely off-screen */
    var vizPlay = new IntersectionObserver(function(entries){
      entries.forEach(function(e){
        var frame = e.target.querySelector("iframe");
        e.target.setAttribute("data-onscreen", e.isIntersecting ? "1" : "0");
        if(!frame.getAttribute("src")) return;
        setFramePaused(frame, !e.isIntersecting);
      });
    }, { rootMargin: "120px 0px" });

    vizList.forEach(function(v){ vizMount.observe(v); vizPlay.observe(v); });
  }else{
    vizList.forEach(function(v){ v.setAttribute("data-mounted","1"); mountViz(v); });
  }

  /* ===========================================================
     SEEKING A BUNDLE TO A NAMED SCENE
     The runtime listens for 'data-om-seek-to-time-frame' on its own
     canvas and renders exactly that timestamp, pausing its clock.
     A seek marked {playing:true} latches "a host clock is driving
     me"; an unmarked seek parks it on a single frame. So a tween
     sends marked seeks while it is moving and one unmarked seek to
     settle — which is precisely the contract the runtime documents.
     =========================================================== */
  function seekTarget(viz){
    var f = viz.querySelector("iframe");
    try{
      var d = f.contentDocument;
      return d && d.querySelector("svg[data-om-exportable-video-with-duration-secs]");
    }catch(e){ return null; }
  }

  function seekTo(viz, time, moving){
    var svg = seekTarget(viz);
    if(!svg) return false;
    var win = viz.querySelector("iframe").contentWindow;
    try{
      svg.dispatchEvent(new win.CustomEvent("data-om-seek-to-time-frame", {
        detail: { time: time, playing: !!moving, sync: true }
      }));
      return true;
    }catch(e){ return false; }
  }

  /* Tween the playhead so the graphic morphs through the frames between
     two scenes instead of cutting. Reduced motion gets the cut. */
  function makeSeeker(viz){
    var raf = null, current = null, guard = null;
    function stop(){
      if(raf){ cancelAnimationFrame(raf); raf = null; }
      if(guard){ clearTimeout(guard); guard = null; }
    }
    return function(target, dur){
      if(current === null || REDUCE || !dur){
        stop();
        if(seekTo(viz, target, false)) current = target;
        return;
      }
      if(Math.abs(target - current) < 0.05) return;
      stop();
      var from = current, t0 = null;
      (function step(ts){
        if(t0 === null) t0 = ts;
        var k = Math.min(1, (ts - t0) / dur);
        var e = k < .5 ? 2*k*k : 1 - Math.pow(-2*k + 2, 2) / 2;
        current = from + (target - from) * e;
        /* Every frame of a scroll tween is a scrub, not host playback.
           Marking them {playing:true} latches the runtime's "a host clock
           is driving me" flag, which left the graphic a step behind the
           text. Unmarked seeks clear that latch in the same commit. */
        seekTo(viz, current, false);
        if(k < 1){ raf = requestAnimationFrame(step); }
        else {
          raf = null; current = target;
          seekTo(viz, target, false);
          /* re-assert once the runtime's own commit has settled */
          setTimeout(function(){ if(current === target) seekTo(viz, target, false); }, 120);
        }
      })(performance.now());

      /* Smoothness is a nicety; landing on the right frame is not. If rAF
         is starved the tween above never advances, so a watchdog snaps to
         the target once the tween has overrun its budget. */
      guard = setTimeout(function(){
        guard = null;
        if(current === target) return;
        stop();
        current = target;
        seekTo(viz, target, false);
      }, dur + 260);
    };
  }

  /* ===========================================================
     SCROLLYTELLING
     One pinned canvas, four scrolling steps. The active step is the
     one nearest the middle of the viewport; it drives both the
     highlight and the seek.
     =========================================================== */
  (function scrolly(){
    var host = document.getElementById("scrolly");
    if(!host) return;
    var viz = document.getElementById("scrollyViz");
    var steps = Array.prototype.slice.call(host.querySelectorAll(".step"));
    if(!viz || !steps.length) return;

    var seek = makeSeeker(viz);
    var active = -1;
    var primed = false;

    function setActive(i, animate){
      if(i === active) return;
      active = i;
      for(var n = 0; n < steps.length; n++){
        steps[n].classList.toggle("is-active", n === i);
      }
      var t = parseFloat(steps[i].getAttribute("data-seek"));
      if(!isNaN(t)) seek(t, animate ? 620 : 0);
    }

    /* prime once the bundle is actually running, otherwise the first
       seek lands before the runtime has attached its listener */
    function prime(){
      if(primed) return;
      if(!seekTarget(viz)) return;
      primed = true;
      var i = active < 0 ? 0 : active;
      active = -1;
      setActive(i, false);
    }
    var primeTimer = setInterval(function(){
      prime();
      if(primed) clearInterval(primeTimer);
    }, 300);
    setTimeout(function(){ clearInterval(primeTimer); }, 30000);

    /* Which step is active is decided by distance from a reading line,
       not by intersection ratio. A step is 62vh tall and the useful band
       is much shorter, so every step tops out at a similar low ratio and
       ties fall back to document order — which strands the last step.
       Nearest-to-the-line is unambiguous and handles the ends. */
    function pick(){
      var line = window.innerHeight * 0.42;
      var best = 0, bestD = Infinity;
      for(var i = 0; i < steps.length; i++){
        var r = steps[i].getBoundingClientRect();
        var d = Math.abs((r.top + r.bottom) / 2 - line);
        if(d < bestD){ bestD = d; best = i; }
      }
      prime();
      setActive(best, primed);
    }

    var pending = false, watching = false;
    /* rAF is the right clock for a scroll handler, but it is not
       guaranteed to fire — a backgrounded tab or a long task starves it.
       A plain `if(ticking) return` guard reset only inside the rAF
       callback would then latch closed and kill the section for good, so
       a timer races it and whichever arrives first does the work. */
    function onScroll(){
      if(pending) return;
      pending = true;
      var done = false;
      var run = function(){
        if(done) return;
        done = true; pending = false;
        pick();
      };
      requestAnimationFrame(run);
      setTimeout(run, 120);
    }

    /* Only listen while the section is actually on screen. */
    if("IntersectionObserver" in window){
      new IntersectionObserver(function(entries){
        var on = entries[0].isIntersecting;
        if(on === watching) return;
        watching = on;
        if(on){
          window.addEventListener("scroll", onScroll, { passive: true });
          pick();
        }else{
          window.removeEventListener("scroll", onScroll);
        }
      }, { rootMargin: "20% 0px" }).observe(host);
    }else{
      window.addEventListener("scroll", onScroll, { passive: true });
    }
    window.addEventListener("resize", onScroll, { passive: true });
    pick();
  })();

  /* ===========================================================
     HERO SCULPTURE
     The component owns its own render loop and already parks
     itself when scrolled out of view or the tab is hidden, so
     there is no turntable to start and stop from here. All this
     does is gate the reveal: the stage stays at opacity 0 until
     the first valid frame is on the canvas, so the visitor never
     sees the scene initialise or the camera settle.
     =========================================================== */
  (function heroSculpture(){
    var hero = document.getElementById("hero");
    var machine = document.getElementById("heroMachine");
    if(!hero) return;

    function ready(){ hero.classList.add("is-ready"); }
    function failed(){ hero.classList.add("is-ready","is-failed"); }

    /* No custom element at all (module blocked, or a browser without
       WebGL/customElements): fall through to the watermark rather than
       leaving an empty column. */
    if(!machine || !("customElements" in window)){ failed(); return; }

    /* One word per beat, beside the part doing the work. The component
       publishes the beat as an attribute too, so a beat that fired before
       this deferred script ran is not lost. */
    (function tags(){
      var box = document.getElementById("heroTags");
      if(!box) return;
      var all = box.querySelectorAll(".hero-tag");
      function show(beat, lead){
        var want = beat === "input" ? "in"
                 : beat === "core" ? "core"
                 : beat === "process" ? "do-" + lead
                 : beat === "outcome" ? "out-" + lead
                 : null;
        for(var i=0;i<all.length;i++){
          all[i].classList.toggle("is-on", all[i].getAttribute("data-tag") === want);
        }
      }
      var now = machine.getAttribute("data-beat");
      if(now){ var q = now.split(":"); show(q[0], q[1]); }
      machine.addEventListener("machine-beat", function(e){ show(e.detail.beat, e.detail.lead); });
    })();


    /* The element upgrades the moment its module evaluates, which can be
       before this deferred script runs — so it may already have drawn and
       announced. Read the sticky attribute first; only subscribe if the
       event is still ahead of us. */
    if(machine.hasAttribute("data-ready")){ ready(); return; }
    if(machine.hasAttribute("data-failed")){ failed(); return; }

    machine.addEventListener("machine-ready", ready, { once:true });
    machine.addEventListener("machine-error", failed, { once:true });

    /* Backstop, for a module that never arrives or a context that dies
       without throwing: show the watermark rather than a hole. */
    var t = setTimeout(function(){
      if(hero.classList.contains("is-ready")) return;
      if(machine.hasAttribute("data-ready")){ ready(); return; }
      failed();
    }, 6000);
    function stop(){ clearTimeout(t); }
    machine.addEventListener("machine-ready", stop, { once:true });
    machine.addEventListener("machine-error", stop, { once:true });
  })();

  /* ===========================================================
     CALCULATOR — growth capacity, never wage savings
     =========================================================== */
  var HOURS_PER_PERSON = 192;   /* 8h x 24 days — deliberately high, so "hires avoided" reads low */

  var WORK = {
    messages: {
      minutes:4, repeat:0.55, def:1800, step:50, max:500000,
      unit:{ en:"messages", ar:"رسالة" },
      label:{ en:"Customer messages per month", ar:"عدد رسايل العملاء في الشهر" },
      note:{
        en:"Assuming 4 minutes of handling per message and that 55% of them follow a predictable pattern.",
        ar:"بافتراض 4 دقايق للرسالة الواحدة، وإن 55% منها بتمشي على نمط متوقع."
      }
    },
    documents: {
      minutes:7, repeat:0.80, def:400, step:10, max:200000,
      unit:{ en:"documents", ar:"مستند" },
      label:{ en:"Invoices and documents per month", ar:"عدد الفواتير والمستندات في الشهر" },
      note:{
        en:"Assuming 7 minutes to read and enter each document and that 80% of them follow a consistent layout.",
        ar:"بافتراض 7 دقايق لقراءة وإدخال كل مستند، وإن 80% منهم ليهم نفس الشكل."
      }
    },
    reports: {
      minutes:90, repeat:0.85, def:12, step:1, max:2000,
      unit:{ en:"reports", ar:"تقرير" },
      label:{ en:"Reports produced per month", ar:"عدد التقارير اللي بتتعمل في الشهر" },
      note:{
        en:"Assuming 90 minutes to pull and check each report and that 85% of that is the same steps every time.",
        ar:"بافتراض 90 دقيقة لتجميع ومراجعة كل تقرير، وإن 85% من ده نفس الخطوات كل مرة."
      }
    }
  };

  var COPY = {
    outLab: { en:"Extra capacity at your current team size", ar:"طاقة إضافية بنفس حجم فريقك الحالي" },
    capSub: { en:"more %U a month, before anyone new is needed",
              ar:"%U زيادة في الشهر، قبل ما تحتاج حد جديد" },
    k1: { en:"Your growth plan needs", ar:"خطة النمو بتاعتك محتاجة" },
    k2: { en:"Staff hours you don't have to add", ar:"ساعات شغل مش هتضطر تضيفها" },
    k3: { en:"Cost of handling that growth manually", ar:"تكلفة استيعاب النمو ده يدويًا" },
    fits: { en:"%N — covered", ar:"%N — مغطاة" },
    over: { en:"%N — beyond this point you'd hire", ar:"%N — بعد كده هتحتاج توظّف" },
    hrs:  { en:"%N h / month", ar:"%N ساعة / شهر" },
    hrsP: { en:"%N h / month (≈ %P people)", ar:"%N ساعة / شهر (≈ %P أفراد)" },
    egp:  { en:"%N EGP / year", ar:"%N جنيه / سنة" },
    svc:  { en:"On top of that: customers get an answer outside working hours, and a first response in seconds at any volume.",
            ar:"وكمان: العملاء بياخدوا رد بره مواعيد الشغل، وأول رد في ثواني مهما كان الحجم." },
    badge: { en:"extra capacity", ar:"طاقة إضافية" },
    tail: { en:" Both figures sit at the cautious end on purpose, and both are editable on the full calculator.",
            ar:" الافتراضين دول عند أقل تقدير عن قصد، وتقدر تعدّلهم في الحاسبة الكاملة." }
  };

  var nf = new Intl.NumberFormat("en-US");
  var volEl = document.getElementById("calcVol");
  var growthEl = document.getElementById("calcGrowth");
  var costEl = document.getElementById("calcCost");
  var capEl = document.getElementById("calcCap");
  var lastWork = null;

  function t(key){ return COPY[key][state.lang === "ar" ? "ar" : "en"]; }
  function setTxt(id, v){ document.getElementById(id).textContent = v; }

  /* ---- reactive feedback on the paired capacity canvas ----
     Capacity Flow's own timeline ends on a scene the authors named
     "Capacity" (9.6-12s): "incoming volume doubles while the queue holds
     steady". That is the frame that answers the calculator, so a change
     to any input pulses the canvas and drives it there. */
  var capacityViz = document.getElementById("capacityViz");
  var badgeVal = document.getElementById("calcBadgeVal");
  var badgeLbl = document.getElementById("calcBadgeLbl");
  var pulseTimer = null;

  function reactToInput(extraCapacity, unit){
    if(!capacityViz) return;
    if(badgeVal) badgeVal.textContent = nf.format(Math.round(extraCapacity)) + " " + unit;
    if(badgeLbl) badgeLbl.textContent = t("badge");
    capacityViz.classList.add("is-live");

    if(REDUCE) return;
    capacityViz.classList.remove("is-recalc");
    void capacityViz.offsetWidth;           /* restart the pulse */
    capacityViz.classList.add("is-recalc");
    clearTimeout(pulseTimer);
    pulseTimer = setTimeout(function(){ capacityViz.classList.remove("is-recalc"); }, 950);

    /* Deliberately NOT seeking the canvas any more. Driving it to the
       "Capacity" frame (10.9s) answered the calculator, but a seek hands the
       clock to the host and the scene then holds that frame — so the canvas
       sat frozen from the first paint, because the initial recompute fired it
       too. The pulse above and the badge carry the recalc feedback; the scene
       keeps running its own 12s loop like every other canvas on the page. */
  }

  /* count-up for the headline figure; falls back to a plain write */
  var capAnim = null, capShown = 0;
  function setCap(target){
    if(REDUCE || Math.abs(target - capShown) < 2){
      capShown = target; capEl.textContent = nf.format(Math.round(target)); return;
    }
    if(capAnim) cancelAnimationFrame(capAnim);
    var from = capShown, delta = target - from, t0 = null, dur = 420;
    function step(ts){
      if(t0 === null) t0 = ts;
      var k = Math.min(1, (ts - t0) / dur);
      var e = 1 - Math.pow(1 - k, 3);
      capShown = from + delta * e;
      capEl.textContent = nf.format(Math.round(capShown));
      if(k < 1){ capAnim = requestAnimationFrame(step); }
      else { capShown = target; capAnim = null; }
    }
    capAnim = requestAnimationFrame(step);
  }

  function calc(){
    var w = WORK[state.work] || WORK.messages;
    var lang = state.lang === "ar" ? "ar" : "en";
    var vol = Math.max(0, parseFloat(volEl.value) || 0);
    var growth = Math.max(0, parseFloat(growthEl.value) || 0);
    var cost = Math.max(0, parseFloat(costEl.value) || 0);

    /* Same team hours, but each item now costs (1-repeat) of the manual time. */
    var extraCapacity = vol * w.repeat / (1 - w.repeat);
    var targetExtra = vol * growth / 100;
    var futureVolume = vol * (1 + growth / 100);
    var hoursNotAdded = futureVolume * w.minutes * w.repeat / 60;
    var costManual = (targetExtra * w.minutes / 60) * cost * 12;
    var people = hoursNotAdded / HOURS_PER_PERSON;

    setTxt("calcOutLab", t("outLab"));
    setCap(extraCapacity);
    setTxt("calcCapSub", t("capSub").replace("%U", w.unit[lang]));

    setTxt("calcK1", t("k1"));
    var v1 = document.getElementById("calcV1");
    var fits = extraCapacity >= targetExtra;
    v1.textContent = t(fits ? "fits" : "over").replace("%N", nf.format(Math.round(targetExtra)));
    v1.className = "v" + (fits ? " fits" : "");

    setTxt("calcK2", t("k2"));
    setTxt("calcV2", people >= 0.5
      ? t("hrsP").replace("%N", nf.format(Math.round(hoursNotAdded))).replace("%P", people.toFixed(1))
      : t("hrs").replace("%N", nf.format(Math.round(hoursNotAdded))));

    setTxt("calcK3", t("k3"));
    setTxt("calcV3", t("egp").replace("%N", nf.format(Math.round(costManual))));

    setTxt("calcService", t("svc"));
    setTxt("calcNote", w.note[lang] + t("tail"));

    reactToInput(extraCapacity, w.unit[lang]);
  }

  function syncWork(){
    var w = WORK[state.work] || WORK.messages;
    var btns = document.getElementById("calcWork").querySelectorAll("button[data-w]");
    for(var i=0;i<btns.length;i++){
      btns[i].setAttribute("aria-pressed", btns[i].getAttribute("data-w") === state.work ? "true" : "false");
    }
    if(lastWork !== state.work){
      volEl.value = w.def;
      volEl.step = w.step;
      volEl.max = w.max;
      lastWork = state.work;
    }
    var lab = document.getElementById("calcVolLabel");
    lab.setAttribute("data-en", w.label.en);
    lab.setAttribute("data-ar", w.label.ar);
    lab.textContent = w.label[state.lang === "ar" ? "ar" : "en"];
  }

  document.getElementById("calcWork").addEventListener("click", function(ev){
    var b = ev.target.closest("button[data-w]");
    if(!b) return;
    state.work = b.getAttribute("data-w");
    syncWork();
    calc();
  });
  volEl.addEventListener("input", calc);
  growthEl.addEventListener("input", calc);
  costEl.addEventListener("input", calc);

  /* ===========================================================
     BOOT
     =========================================================== */
  renderLang();
  syncWork();
  calc();
  reveal();
  nightShift();
  chartReveal();
  svcCarousel();

  /* rAF alone is not enough: it never fires while the tab is in the
     background, which would leave the hero permanently invisible for
     anyone who opens the site in a new tab. Belt and braces. */
  function showHero(){ document.getElementById("hero").classList.add("is-hero-in"); }
  requestAnimationFrame(showHero);
  setTimeout(showHero, 150);
})();

/* ══════════════ BRAND MARK ══════════════
   The mark assembles on the first paint of a session, then settles into the
   heartbeat. Returning to the page mid-session skips straight to the idle so
   the nav does not re-animate on every internal navigation. */
(function brandMark(){
  var played;
  try{ played = sessionStorage.getItem("mk") === "1"; }
  catch(e){ played = false; }          /* private mode / blocked storage */

  var marks = document.querySelectorAll(".mk[data-mk-entry]");
  for(var i = 0; i < marks.length; i++){
    (function(el){
      if(played){ el.classList.add("is-beat"); return; }
      el.classList.add("is-assemble");
      /* The node is the last thing to animate, so its animationend is the
         signal the whole assemble is done. A timer backs it up in case the
         animation never fires (reduced motion, or a backgrounded tab). */
      var done = false;
      var settle = function(){
        if(done) return;
        done = true;
        el.classList.remove("is-assemble");
        el.classList.add("is-beat");
      };
      el.addEventListener("animationend", function(ev){
        if(ev.target === el.querySelector(".mk-n")) settle();
      });
      setTimeout(settle, 1200);
    })(marks[i]);
  }
  try{ sessionStorage.setItem("mk", "1"); }catch(e){}
})();
