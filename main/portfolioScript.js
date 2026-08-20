
// ─── STARFIELD ───────────────────────────────────────────────
const canvas = document.getElementById('starfield');
const ctx = canvas.getContext('2d');
let stars = [], W, H;

function resize() {
  W = canvas.width = window.innerWidth;
  H = canvas.height = window.innerHeight;
}

function createStars() {
  stars = [];
  const count = Math.floor((W * H) / 3500);
  for (let i = 0; i < count; i++) {
    stars.push({
      x: Math.random() * W,
      y: Math.random() * H,
      r: Math.random() * 1.4 + 0.2,
      a: Math.random() * 0.7 + 0.1,
      speed: Math.random() * 0.0003 + 0.0001,
      phase: Math.random() * Math.PI * 2,
      color: Math.random() > 0.85 ? '#a8c8ff' : Math.random() > 0.92 ? '#ffd87a' : '#e8f4ff'
    });
  }
}

function drawStars(t) {
  ctx.clearRect(0, 0, W, H);
  stars.forEach(s => {
    const twinkle = Math.sin(t * s.speed * 1000 + s.phase) * 0.3 + 0.7;
    ctx.beginPath();
    ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
    ctx.fillStyle = s.color;
    ctx.globalAlpha = s.a * twinkle;
    ctx.fill();
  });
  ctx.globalAlpha = 1;
}

// Milky Way band
function drawMilkyWay() {
  const gradient = ctx.createLinearGradient(0, H * 0.1, W, H * 0.9);
  gradient.addColorStop(0, 'transparent');
  gradient.addColorStop(0.3, 'rgba(10,26,74,0.04)');
  gradient.addColorStop(0.5, 'rgba(26,63,160,0.06)');
  gradient.addColorStop(0.7, 'rgba(10,26,74,0.04)');
  gradient.addColorStop(1, 'transparent');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, W, H);
}

let animFrame;
function animate(t) {
  drawStars(t);
  drawMilkyWay();
  animFrame = requestAnimationFrame(animate);
}

resize();
createStars();
requestAnimationFrame(animate);
window.addEventListener('resize', () => { resize(); createStars(); });

// ─── CUSTOM CURSOR ────────────────────────────────────────────
const cursor = document.getElementById('cursor');
const ring = document.getElementById('cursor-ring');
let mx = -100, my = -100, rx = -100, ry = -100;

document.addEventListener('mousemove', e => {
  mx = e.clientX; my = e.clientY;
  cursor.style.left = mx + 'px';
  cursor.style.top = my + 'px';
});

function animCursor() {
  rx += (mx - rx) * 0.12;
  ry += (my - ry) * 0.12;
  ring.style.left = rx + 'px';
  ring.style.top = ry + 'px';
  requestAnimationFrame(animCursor);
}
animCursor();

document.querySelectorAll('a, button, .project-card, .skill-node').forEach(el => {
  el.addEventListener('mouseenter', () => {
    ring.style.width = '52px';
    ring.style.height = '52px';
    ring.style.borderColor = 'rgba(255,216,122,0.5)';
    cursor.style.background = 'rgba(255,216,122,0.5)';
  });
  el.addEventListener('mouseleave', () => {
    ring.style.width = '32px';
    ring.style.height = '32px';
    ring.style.borderColor = 'rgba(168,200,255,0.4)';
    cursor.style.background = 'var(--star-gold)';
  });
});

// ─── SCROLL REVEAL ────────────────────────────────────────────
const reveals = document.querySelectorAll('.reveal');
const observer = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('visible');
      // trigger skill bars
      const bars = e.target.querySelectorAll('.skill-bar-fill');
      bars.forEach(b => b.parentElement.parentElement.classList.add('visible'));
    }
  });
}, { threshold: 0.12 });
reveals.forEach(r => observer.observe(r));

// ─── SHOOTING STARS ───────────────────────────────────────────
function shootingStar() {
  const el = document.createElement('div');
  el.className = 'shooting-star';
  const startX = Math.random() * window.innerWidth * 0.6 + window.innerWidth * 0.2;
  const startY = Math.random() * window.innerHeight * 0.4;
  el.style.cssText = `left:${startX}px; top:${startY}px; position:fixed; z-index:0; pointer-events:none;`;
  document.body.appendChild(el);

  const angle = 30 + Math.random() * 20;
  const dist = 200 + Math.random() * 200;
  const duration = 600 + Math.random() * 400;

  el.animate([
    { transform: `rotate(${angle}deg) translate(0, 0)`, opacity: 0 },
    { opacity: 1, offset: 0.1 },
    { transform: `rotate(${angle}deg) translate(${dist}px, 0)`, opacity: 0 }
  ], { duration, easing: 'ease-in' }).onfinish = () => el.remove();
}

setInterval(shootingStar, 3500 + Math.random() * 3000);
setTimeout(shootingStar, 1000);

// ─── NAV SCROLL EFFECT ────────────────────────────────────────
const nav = document.getElementById('nav');
window.addEventListener('scroll', () => {
  nav.style.background = window.scrollY > 60
    ? 'rgba(0,2,5,0.85)'
    : 'rgba(0,2,5,0.4)';
});

// ─── PARALLAX STARS MOUSE ─────────────────────────────────────
let lastMX = 0, lastMY = 0;
document.addEventListener('mousemove', e => {
  const dx = (e.clientX / window.innerWidth - 0.5) * 2;
  const dy = (e.clientY / window.innerHeight - 0.5) * 2;
  document.querySelectorAll('.nebula').forEach((n, i) => {
    const f = (i + 1) * 8;
    n.style.transform = `translate(${dx * f}px, ${dy * f}px)`;
  });
});