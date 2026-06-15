(() => {
gsap.registerPlugin(ScrollTrigger, CustomEase, ScrollToPlugin);
CustomEase.create("expo","M0,0 C0.16,1 0.3,1 1,1");

/* ── LOADER ── */
let pct = 0;
const lc = document.getElementById('lcount');
const lf = document.getElementById('lfill');
const li = setInterval(() => {
  pct += Math.floor(Math.random() * 14) + 3;
  if (pct >= 100) { pct = 100; clearInterval(li); setTimeout(launchSite, 300); }
  lc.textContent = pct;
  lf.style.width = pct + '%';
}, 55);

function launchSite() {
  gsap.to('#loader', { opacity: 0, duration: 0.5, onComplete: () => {
    document.getElementById('loader').style.display = 'none';
    initHero();
    ScrollTrigger.refresh();
  }});
}

/* ── CURSOR ── */
const cdot = document.getElementById('cdot');
const cring = document.getElementById('cring');
let mx = 0, my = 0, rx = 0, ry = 0;
document.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; });
(function loop() {
  cdot.style.left = mx + 'px'; cdot.style.top = my + 'px';
  rx += (mx - rx) * 0.1; ry += (my - ry) * 0.1;
  cring.style.left = rx + 'px'; cring.style.top = ry + 'px';
  requestAnimationFrame(loop);
})();
document.querySelectorAll('a, button, .acc-head').forEach(el => {
  el.addEventListener('mouseenter', () => document.body.classList.add('ch'));
  el.addEventListener('mouseleave', () => document.body.classList.remove('ch'));
});

/* ── PROGRESS + SIDE ── */
window.addEventListener('scroll', () => {
  const p = window.scrollY / (document.body.scrollHeight - innerHeight);
  document.getElementById('prog').style.transform = 'scaleX(' + p + ')';
  const ssfill = document.getElementById('ssfill');
  if(ssfill) ssfill.style.height = (p * 100) + '%';
  document.getElementById('mainnav').classList.toggle('scrolled', window.scrollY > 50);
}, { passive: true });

/* ── PARTICLES ── */
(function initPart() {
  const cv = document.getElementById('pcanvas');
  const hero = document.getElementById('hero');
  if(!cv || !hero) return;
  cv.width = hero.offsetWidth; cv.height = hero.offsetHeight;
  const ctx = cv.getContext('2d');
  const PAL = [[200,241,53],[255,77,46],[184,164,255]];
  const pts = Array.from({length: 50}, () => ({
    x: Math.random() * cv.width, y: Math.random() * cv.height,
    vx: (Math.random() - 0.5) * 0.35, vy: (Math.random() - 0.5) * 0.35,
    r: Math.random() * 1.6 + 0.4, col: PAL[Math.floor(Math.random() * 3)], t: Math.random() * Math.PI * 2
  }));
  let frameCount = 0;
  function draw() {
    ctx.clearRect(0, 0, cv.width, cv.height);
    pts.forEach(p => {
      p.x += p.vx; p.y += p.vy; p.t += 0.012;
      if (p.x < 0 || p.x > cv.width) p.vx *= -1;
      if (p.y < 0 || p.y > cv.height) p.vy *= -1;
      const a = 0.25 + Math.sin(p.t) * 0.15;
      ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${p.col},${a})`; ctx.fill();
    });
    // Only draw connections every other frame to reduce O(n²) cost
    if (frameCount++ % 2 === 0) {
      for (let i = 0; i < pts.length; i++) {
        for (let j = i + 1; j < pts.length; j++) {
          const dx = pts[i].x - pts[j].x, dy = pts[i].y - pts[j].y;
          if (dx > 100 || dy > 100) continue;
          const d = Math.sqrt(dx*dx + dy*dy);
          if (d < 100) {
            ctx.beginPath(); ctx.moveTo(pts[i].x, pts[i].y); ctx.lineTo(pts[j].x, pts[j].y);
            ctx.strokeStyle = `rgba(200,241,53,${(1 - d/100) * 0.07})`; ctx.lineWidth = 0.5; ctx.stroke();
          }
        }
      }
    }
    requestAnimationFrame(draw);
  }
  draw();
  window.addEventListener('resize', () => {
    cv.width = hero.offsetWidth;
    cv.height = hero.offsetHeight;
    pts.forEach(p => {
      p.x = Math.min(p.x, cv.width);
      p.y = Math.min(p.y, cv.height);
    });
  });
})();

/* ── BLOB MOUSE ── */
document.addEventListener('mousemove', e => {
  const x = (e.clientX / innerWidth - 0.5) * 40, y = (e.clientY / innerHeight - 0.5) * 30;
  gsap.to('#bl1', { x: x * 1.5, y: y * 1.3, duration: 1.5, ease: 'power2.out' });
  gsap.to('#bl2', { x: -x * 0.9, y: -y, duration: 1.8, ease: 'power2.out' });
  gsap.to('#bl3', { x: x * 0.6, y: y * 0.6, duration: 2.1, ease: 'power2.out' });
});

/* ── HERO INIT ── */
function initHero() {
  gsap.set('#eyebrow', { opacity: 0, y: 20 });
  gsap.set('#w1,#w2', { y: '115%' });
  gsap.set('#hbottom', { opacity: 0, y: 20 });

  const tl = gsap.timeline({ defaults: { ease: 'expo' } });
  tl.to('#eyebrow', { opacity: 1, y: 0, duration: 0.9 })
    .to(['#w1','#w2'], { y: '0%', duration: 1.2, stagger: 0.13 }, '-=0.55')
    .to('#hbottom', { opacity: 1, y: 0, duration: 0.9 }, '-=0.5');

  /* outline color cycle */
  gsap.to('#w2', {
    duration: 4, repeat: -1, ease: 'none',
    onUpdate: function() {
      const t = this.progress();
      const colors = ['#c8f135','#ff4d2e','#b8a4ff','#c8f135'];
      const idx = Math.floor(t * 3);
      const f = (t * 3) % 1;
      const c1 = hexToRgb(colors[idx]), c2 = hexToRgb(colors[Math.min(idx+1,3)]);
      if (!c1 || !c2) return;
      const r = Math.round(c1.r + (c2.r-c1.r)*f);
      const g = Math.round(c1.g + (c2.g-c1.g)*f);
      const b = Math.round(c1.b + (c2.b-c1.b)*f);
      document.getElementById('w2').style.webkitTextStrokeColor = `rgb(${r},${g},${b})`;
    }
  });
}
function hexToRgb(hex) {
  const r = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return r ? { r: parseInt(r[1],16), g: parseInt(r[2],16), b: parseInt(r[3],16) } : null;
}

/* ── SCROLL ANIMATIONS ── */

// About tag
gsap.fromTo('#atag', { x: -60, opacity: 0 },
  { x: 0, opacity: 1, duration: 1, ease: 'expo',
    scrollTrigger: { trigger: '#about', start: 'top 78%' } });

// About heading words
gsap.fromTo('#ahead .wi', { y: '100%' }, {
  y: '0%', duration: 1.1, stagger: 0.09, ease: 'expo',
  scrollTrigger: { trigger: '#ahead', start: 'top 80%' }
});

// About right block
gsap.fromTo('#aright', { x: 70, opacity: 0 },
  { x: 0, opacity: 1, duration: 1.1, ease: 'expo',
    scrollTrigger: { trigger: '#aright', start: 'top 80%' } });

// Stat cards
gsap.fromTo('.asc', { y: 50, opacity: 0 },
  { y: 0, opacity: 1, stagger: 0.12, duration: 0.9, ease: 'expo',
    scrollTrigger: { trigger: '.astats', start: 'top 85%' } });

/* ── HANDWRITING REVEAL ── */
ScrollTrigger.create({
  trigger: '.hw-wrap',
  start: 'top 88%',
  once: true,
  onEnter: () => {
    const lines = ['#hwl1','#hwl2','#hwl3'];

    lines.forEach((sel, i) => {
      const el = document.querySelector(sel);
      const text = el.querySelector('.hw-text');
      const underline = el.querySelector('.hw-underline');

      const delay = i * 0.55;

      // Text reveal — clip-path sweeps left to right
      gsap.to(text, {
        clipPath: 'inset(0 0% 0 0)',
        duration: 0.9,
        ease: 'power2.inOut',
        delay: delay
      });

      // Underline draws after text
      gsap.to(underline, {
        width: '100%',
        duration: 0.6,
        ease: 'power2.out',
        delay: delay + 0.7
      });
    });

    // Cursor appears after last line
    gsap.to('.hw-cursor', {
      opacity: 1,
      duration: 0.1,
      delay: 1.8
    });
  }
});

/* ── PINNED HORIZONTAL SCROLL FOR CASE STUDY ── */
const container = document.getElementById('cs-container');
let csScrollTrigger;

function initHorizontalScroll() {
  if (window.innerWidth > 900) {
    gsap.set(container, { x: 0 });
    
    csScrollTrigger = gsap.to(container, {
      x: () => -(container.scrollWidth - window.innerWidth),
      ease: 'none',
      scrollTrigger: {
        trigger: '#case-study-showcase',
        pin: true,
        anticipatePin: 1,
        scrub: 1.5,
        start: 'top top',
        end: () => '+=' + (container.scrollWidth - window.innerWidth),
        invalidateOnRefresh: true,
        pinSpacing: true,
        onRefresh: self => self.animation.progress(0),
      }
    });
  } else {
    if (csScrollTrigger) {
      csScrollTrigger.scrollTrigger.kill();
      csScrollTrigger = null;
      gsap.set(container, { clearProps: 'all' });
    }
  }
}

initHorizontalScroll();
window.addEventListener('resize', () => {
  initHorizontalScroll();
  ScrollTrigger.refresh();
});

/* ── PROBLEM ACCORDION ANIMATION ── */
document.querySelectorAll('.acc-head').forEach(head => {
  head.addEventListener('click', () => {
    const parent = head.parentElement;
    const body = parent.querySelector('.acc-body');
    const isActive = parent.classList.contains('active');
    
    // Collapse all other items
    document.querySelectorAll('.acc-item').forEach(item => {
      item.classList.remove('active');
      gsap.to(item.querySelector('.acc-body'), { height: 0, duration: 0.4, ease: 'power2.out' });
    });
    
    // Expand current item if it wasn't active
    if (!isActive) {
      parent.classList.add('active');
      gsap.to(body, { height: body.scrollHeight, duration: 0.4, ease: 'power2.out' });
    }
  });
});

/* ── ROADMAP ANIMS ── */
gsap.fromTo('.rm-card', { y: 60, opacity: 0 }, {
  y: 0, opacity: 1, stagger: 0.15, duration: 1, ease: 'expo',
  scrollTrigger: { trigger: '.rm-cards', start: 'top 85%', once: true }
});

/* ── SKILLS MARQUEE ANIM ── */
gsap.fromTo('#skills', { opacity: 0 },
  { opacity: 1, duration: 1,
    scrollTrigger: { trigger: '#skills', start: 'top 88%' } });

document.querySelectorAll('.skrow').forEach(r => {
  r.addEventListener('mouseenter', () => r.style.animationPlayState = 'paused');
  r.addEventListener('mouseleave', () => r.style.animationPlayState = 'running');
});

/* ── CONTACT ANIMS ── */
gsap.fromTo('#ctlabel', { y: 30, opacity: 0 },
  { y: 0, opacity: 1, duration: 0.9, ease: 'expo',
    scrollTrigger: { trigger: '#contact', start: 'top 75%', once: true } });

gsap.fromTo('#cthead .wi', { y: '100%' }, {
  y: '0%', duration: 1.1, stagger: 0.1, ease: 'expo',
  scrollTrigger: { trigger: '#cthead', start: 'top 78%', once: true }
});

gsap.fromTo('#ctsub', { y: 40, opacity: 0 },
  { y: 0, opacity: 1, duration: 0.9, ease: 'expo',
    scrollTrigger: { trigger: '#ctsub', start: 'top 85%', once: true } });

gsap.fromTo('#magwrap', { y: 40, opacity: 0 },
  { y: 0, opacity: 1, duration: 0.9, ease: 'expo', delay: 0.15,
    scrollTrigger: { trigger: '#magwrap', start: 'top 88%', once: true } });

/* ── BLOB SCROLL PARALLAX ── */
gsap.to('#bl1', { scrollTrigger: { scrub: 2 }, y: -160, x: 60 });
gsap.to('#bl2', { scrollTrigger: { scrub: 2.5 }, y: -100, x: -40 });

/* ── MAGNETIC BUTTON ── */
const magwrap = document.getElementById('magwrap');
const ctbtn = document.getElementById('ctbtn');
if (magwrap && ctbtn) {
  magwrap.addEventListener('mousemove', e => {
    const r = magwrap.getBoundingClientRect();
    const x = (e.clientX - r.left - r.width / 2) * 0.38;
    const y = (e.clientY - r.top - r.height / 2) * 0.38;
    gsap.to(ctbtn, { x, y, duration: 0.5, ease: 'power3.out' });
  });
  magwrap.addEventListener('mouseleave', () => {
    gsap.to(ctbtn, { x: 0, y: 0, duration: 0.8, ease: 'elastic.out(1,0.4)' });
  });
}

/* ── GSAP SCROLLTO LINK INTERCEPT ── */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', e => {
    e.preventDefault();
    const targetId = anchor.getAttribute('href');
    if (targetId === '#') {
      gsap.to(window, { scrollTo: 0, duration: 1.2, ease: 'expo' });
      return;
    }
    const targetEl = document.querySelector(targetId);
    if (targetEl) {
      gsap.to(window, {
        scrollTo: { y: targetEl, autoKill: false },
        duration: 1.2,
        ease: 'expo'
      });
    }
  });
});

/* ── INTERACTIVE CANVAS ARCHITECTURE VISUALIZER ── */
(function initArchVisualizer() {
  const cv = document.getElementById('arch-canvas');
  if (!cv) return;
  const ctx = cv.getContext('2d');
  
  const nodes = [
    { id: 'user', label: 'Farmer Mobile', x: 80, y: 160, col: '#ff4d2e', r: 30 },
    { id: 'db', label: 'Firestore DB', x: 280, y: 160, col: '#b8a4ff', r: 30 },
    { id: 'wa', label: 'WhatsApp Gateway', x: 480, y: 160, col: '#c8f135', r: 30 }
  ];
  
  const packets = [];
  let spawnTimer = 0;
  
  function addPacket(from, to, speed, col) {
    packets.push({ from, to, t: 0, speed, col });
  }
  
  function drawArch() {
    ctx.clearRect(0, 0, cv.width, cv.height);
    
    // Draw background dot grid pattern
    ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
    for (let x = 20; x < cv.width; x += 30) {
      for (let y = 20; y < cv.height; y += 30) {
        ctx.beginPath();
        ctx.arc(x, y, 1, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    
    // Draw connection lines
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
    
    // User to DB (Linear)
    ctx.beginPath();
    ctx.moveTo(nodes[0].x, nodes[0].y);
    ctx.lineTo(nodes[1].x, nodes[1].y);
    ctx.stroke();
    
    // DB to WA (Linear)
    ctx.beginPath();
    ctx.moveTo(nodes[1].x, nodes[1].y);
    ctx.lineTo(nodes[2].x, nodes[2].y);
    ctx.stroke();
    
    // User to WA Direct (Curved Synchronous Bypass)
    ctx.beginPath();
    ctx.strokeStyle = 'rgba(200, 241, 53, 0.18)';
    ctx.moveTo(nodes[0].x, nodes[0].y);
    ctx.quadraticCurveTo(280, 50, nodes[2].x, nodes[2].y);
    ctx.stroke();
    
    // Draw path description texts
    ctx.fillStyle = 'rgba(255,255,255,0.3)';
    ctx.font = '9px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Async order write', 180, 190);
    ctx.fillText('Sync WhatsApp bypass (under 1s)', 280, 75);
    ctx.fillText('Receipt confirm', 380, 190);
    
    // Spawn packets
    spawnTimer++;
    if (spawnTimer % 90 === 0) {
      addPacket(0, 1, 0.008, '#b8a4ff'); // user to DB
      addPacket(1, 2, 0.012, '#c8f135'); // DB to WA
    }
    if (spawnTimer % 130 === 0) {
      addPacket(0, 2, 0.016, '#ff4d2e'); // user to WA direct (curve)
    }
    
    // Draw and update packets
    for (let i = packets.length - 1; i >= 0; i--) {
      const p = packets[i];
      p.t += p.speed;
      if (p.t >= 1) {
        packets.splice(i, 1);
        continue;
      }
      
      let px, py;
      if (p.from === 0 && p.to === 2) {
        // Quadratic Bezier curve coordinates
        const t = p.t;
        const x0 = nodes[0].x, y0 = nodes[0].y;
        const x1 = 280, y1 = 50;
        const x2 = nodes[2].x, y2 = nodes[2].y;
        px = (1 - t) * (1 - t) * x0 + 2 * (1 - t) * t * x1 + t * t * x2;
        py = (1 - t) * (1 - t) * y0 + 2 * (1 - t) * t * y1 + t * t * y2;
      } else {
        // Linear interpolation coordinates
        const fromNode = nodes[p.from];
        const toNode = nodes[p.to];
        px = fromNode.x + (toNode.x - fromNode.x) * p.t;
        py = fromNode.y + (toNode.y - fromNode.y) * p.t;
      }
      
      ctx.beginPath();
      ctx.arc(px, py, 4, 0, Math.PI * 2);
      ctx.fillStyle = p.col;
      ctx.shadowBlur = 8;
      ctx.shadowColor = p.col;
      ctx.fill();
      ctx.shadowBlur = 0; // reset
    }
    
    // Draw Nodes
    nodes.forEach(n => {
      // Outer ring
      ctx.beginPath();
      ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
      ctx.strokeStyle = n.col;
      ctx.lineWidth = 1.5;
      ctx.fillStyle = '#0e0e12';
      ctx.fill();
      ctx.stroke();
      
      // Inner glowing core
      ctx.beginPath();
      ctx.arc(n.x, n.y, 6, 0, Math.PI * 2);
      ctx.fillStyle = n.col;
      ctx.fill();
      
      // Node Label text
      ctx.fillStyle = '#f0ebe0';
      ctx.font = 'bold 10.5px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(n.label, n.x, n.y + n.r + 16);
    });
    
  }
  
  function tick() {
    drawArch();
    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
})();

/* ── MOBILE SCROLL REVEAL ── */
/* ── MOBILE SCROLL REVEAL ── */
if (window.innerWidth <= 900) {
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.08,
    rootMargin: '0px 0px -20px 0px'
  });

  // Observe all reveal elements
  document.querySelectorAll('.reveal').forEach(el => {
    revealObserver.observe(el);
  });

}

})();
