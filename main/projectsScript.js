// STARFIELD
const canvas = document.getElementById('starfield');
const ctx = canvas.getContext('2d');
let stars = [], W, H;
function resize() { W = canvas.width = window.innerWidth; H = canvas.height = window.innerHeight; }
function createStars() {
  stars = [];
  const count = Math.floor((W * H) / 3200);
  for (let i = 0; i < count; i++) {
    stars.push({
      x: Math.random()*W, y: Math.random()*H,
      r: Math.random()*1.3+0.2, a: Math.random()*0.6+0.1,
      speed: Math.random()*0.0003+0.0001, phase: Math.random()*Math.PI*2,
      color: Math.random()>0.85?'#a8c8ff':Math.random()>0.92?'#ffd87a':'#e8f4ff'
    });
  }
}
function drawStars(t) {
  ctx.clearRect(0,0,W,H);
  stars.forEach(s => {
    const tw = Math.sin(t*s.speed*1000+s.phase)*0.3+0.7;
    ctx.beginPath(); ctx.arc(s.x,s.y,s.r,0,Math.PI*2);
    ctx.fillStyle=s.color; ctx.globalAlpha=s.a*tw; ctx.fill();
  });
  ctx.globalAlpha=1;
}
function drawMilkyWay() {
  const g = ctx.createLinearGradient(0,H*0.1,W,H*0.9);
  g.addColorStop(0,'transparent'); g.addColorStop(0.35,'rgba(10,26,74,0.04)');
  g.addColorStop(0.5,'rgba(26,63,160,0.05)'); g.addColorStop(0.65,'rgba(10,26,74,0.04)'); g.addColorStop(1,'transparent');
  ctx.fillStyle=g; ctx.fillRect(0,0,W,H);
}
function animate(t) { drawStars(t); drawMilkyWay(); requestAnimationFrame(animate); }
resize(); createStars(); requestAnimationFrame(animate);
window.addEventListener('resize', () => { resize(); createStars(); });

// CURSOR STYLE
const cursor = document.getElementById('cursor');
const ring = document.getElementById('cursor-ring');
let mx=-100,my=-100,rx=-100,ry=-100;
document.addEventListener('mousemove', e => {
  mx=e.clientX; my=e.clientY;
  cursor.style.left=mx+'px'; cursor.style.top=my+'px';
});
function animCursor() {
  rx+=(mx-rx)*0.12; ry+=(my-ry)*0.12;
  ring.style.left=rx+'px'; ring.style.top=ry+'px';
  requestAnimationFrame(animCursor);
}
animCursor();
document.querySelectorAll('a,button,.project-card').forEach(el => {
  el.addEventListener('mouseenter', () => { ring.style.width='50px'; ring.style.height='50px'; ring.style.borderColor='rgba(255,216,122,0.5)'; });
  el.addEventListener('mouseleave', () => { ring.style.width='32px'; ring.style.height='32px'; ring.style.borderColor='rgba(168,200,255,0.4)'; });
});

// SCROLL REVEAL
const observer = new IntersectionObserver(entries => {
  entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
}, { threshold: 0.1 });
document.querySelectorAll('.reveal').forEach(r => observer.observe(r));

// NAV SCROLL
const nav = document.getElementById('nav');
window.addEventListener('scroll', () => {
  nav.style.background = window.scrollY > 60 ? 'rgba(0,2,5,0.9)' : 'rgba(0,2,5,0.5)';
});

// MOUSE PARALLAX
document.addEventListener('mousemove', e => {
  const dx=(e.clientX/window.innerWidth-0.5)*2;
  const dy=(e.clientY/window.innerHeight-0.5)*2;
  document.querySelectorAll('.nebula').forEach((n,i)=>{
    const f=(i+1)*7; n.style.transform=`translate(${dx*f}px,${dy*f}px)`;
  });
});

// SHOOTING STARS
function shootingStar() {
  const el = document.createElement('div');
  el.className = 'shooting-star';
  const sx = Math.random()*window.innerWidth*0.7+window.innerWidth*0.1;
  const sy = Math.random()*window.innerHeight*0.35;
  el.style.cssText=`left:${sx}px;top:${sy}px;position:fixed;z-index:0;pointer-events:none;`;
  document.body.appendChild(el);
  const angle=28+Math.random()*22, dist=180+Math.random()*220, dur=550+Math.random()*450;
  el.animate([
    {transform:`rotate(${angle}deg) translate(0,0)`,opacity:0},
    {opacity:1,offset:0.1},
    {transform:`rotate(${angle}deg) translate(${dist}px,0)`,opacity:0}
  ],{duration:dur,easing:'ease-in'}).onfinish=()=>el.remove();
}
setInterval(shootingStar, 4000+Math.random()*3000);
setTimeout(shootingStar, 800);

// FILTER
function filterCards(btn, type) {
  document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  const groups = document.querySelectorAll('.project-group');
  const cards = document.querySelectorAll('.project-card');
  if (type === 'all') {
    groups.forEach(g => { g.style.display=''; });
    cards.forEach(c => { c.style.display=''; });
  } else {
    groups.forEach(g => {
      g.style.display = g.dataset.group === type ? '' : 'none';
    });
  }
}