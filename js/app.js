import { supabase } from './supabase-client.js';

document.getElementById('year').textContent = new Date().getFullYear();

/* ---------- Mobile nav toggle ---------- */
const navToggle = document.getElementById('navToggle');
const navLinks = document.getElementById('navLinks');

navToggle.addEventListener('click', () => {
  const isOpen = navLinks.classList.toggle('open');
  navToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
});

navLinks.querySelectorAll('a').forEach((link) => {
  link.addEventListener('click', () => {
    navLinks.classList.remove('open');
    navToggle.setAttribute('aria-expanded', 'false');
  });
});

/* ---------- Scroll reveal ---------- */
function initReveal() {
  const targets = document.querySelectorAll('.reveal:not(.is-visible)');
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15, rootMargin: '0px 0px -60px 0px' }
  );
  targets.forEach((t) => io.observe(t));
}

function makeReveal(el, delay = 0) {
  el.classList.add('reveal');
  el.style.transitionDelay = `${delay}ms`;
}

function escapeHTML(str) {
  const div = document.createElement('div');
  div.textContent = str ?? '';
  return div.innerHTML;
}

function emptyState(text) {
  const div = document.createElement('div');
  div.className = 'empty-state';
  div.textContent = `// ${text}`;
  return div;
}

/* ---------- Hero typewriter ---------- */
const CODE_LINES = [
  { html: '<span class="kw">const</span> <span class="fn">sho</span> <span class="punct">=</span> <span class="punct">{</span>' },
  { html: '&nbsp;&nbsp;name<span class="punct">:</span> <span class="str">"SHO."</span><span class="punct">,</span>' },
  { html: '&nbsp;&nbsp;focus<span class="punct">:</span> <span class="str">"Technology × Creating"</span><span class="punct">,</span>' },
  { html: '&nbsp;&nbsp;building<span class="punct">:</span> <span class="punct">true,</span> <span class="cm">// always</span>' },
  { html: '<span class="punct">};</span>' },
];

async function typeHero() {
  const codeEl = document.getElementById('editorCode');
  const linenosEl = document.getElementById('editorLinenos');
  const resultEl = document.getElementById('heroResult');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (reduceMotion) {
    codeEl.innerHTML = CODE_LINES.map((l) => l.html).join('\n');
    linenosEl.innerHTML = CODE_LINES.map((_, i) => i + 1).join('\n');
    resultEl.classList.add('show');
    return;
  }

  // Build plain-text version to type char by char, then swap to styled HTML per line.
  const plainLines = CODE_LINES.map((l) => {
    const tmp = document.createElement('div');
    tmp.innerHTML = l.html;
    return tmp.textContent.replace(/\u00A0/g, ' ');
  });

  linenosEl.innerHTML = '';
  codeEl.innerHTML = '';
  const cursor = document.createElement('span');
  cursor.className = 'type-cursor';
  codeEl.appendChild(cursor);

  let builtHTML = '';

  for (let i = 0; i < plainLines.length; i++) {
    linenosEl.innerHTML += `${i + 1}\n`;
    const line = plainLines[i];
    let typed = '';
    for (let c = 0; c < line.length; c++) {
      typed += line[c];
      codeEl.innerHTML = builtHTML + escapeHTML(typed);
      codeEl.appendChild(cursor);
      await sleep(8 + Math.random() * 14);
    }
    builtHTML += CODE_LINES[i].html + '\n';
    codeEl.innerHTML = builtHTML;
    codeEl.appendChild(cursor);
    await sleep(90);
  }

  await sleep(200);
  resultEl.classList.add('show');
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/* ---------- Tone helpers ---------- */
const GREEN_KEYWORDS = ['取得', 'acquired', 'passed', 'done', '合格'];

function toneForStatus(status) {
  const s = (status || '').toLowerCase();
  return GREEN_KEYWORDS.some((k) => s.includes(k)) ? 'green' : 'amber';
}

const TAG_COLORS = ['blue', 'green', 'amber', 'violet'];
const TAG_HEX = { blue: 'var(--blue)', green: 'var(--green)', amber: 'var(--amber)', violet: 'var(--violet)' };

function colorForIndex(i) {
  return TAG_COLORS[i % TAG_COLORS.length];
}

/* ---------- Qualifications ---------- */
async function loadQualifications() {
  const grid = document.getElementById('qualGrid');
  const { data, error } = await supabase
    .from('qualifications')
    .select('*')
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: true });

  grid.innerHTML = '';

  if (error) {
    console.error(error);
    grid.appendChild(emptyState('資格データを読み込めませんでした'));
    return;
  }
  if (!data || data.length === 0) {
    grid.appendChild(emptyState('まだ資格が登録されていません'));
    return;
  }

  data.forEach((q, i) => {
    const tone = toneForStatus(q.status);
    const card = document.createElement('div');
    card.className = 'qual-card';
    card.dataset.tone = tone;
    card.innerHTML = `
      <p class="qual-name">${escapeHTML(q.name)}</p>
      <span class="status-pill" data-tone="${tone}">${escapeHTML(q.status)}</span>
    `;
    makeReveal(card, (i % 3) * 70);
    grid.appendChild(card);
  });

  initReveal();
}

/* ---------- Projects ---------- */
async function loadProjects() {
  const grid = document.getElementById('projectGrid');
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: true });

  grid.innerHTML = '';

  if (error) {
    console.error(error);
    grid.appendChild(emptyState('プロジェクトを読み込めませんでした'));
    return;
  }
  if (!data || data.length === 0) {
    grid.appendChild(emptyState('まだプロジェクトが登録されていません'));
    return;
  }

  data.forEach((p, i) => {
    const techList = (p.tech || '').split(',').map((t) => t.trim()).filter(Boolean);

    const card = document.createElement('div');
    card.className = 'project-card';
    card.innerHTML = `
      <div class="project-top">
        <span class="project-icon">▸</span>
        <p class="project-name">${escapeHTML(p.name)}</p>
      </div>
      <p class="project-desc">${escapeHTML(p.description)}</p>
      <div class="tech-row">
        ${techList.map((t, ti) => `<span class="tech-tag"><span class="dot" style="background:${TAG_HEX[colorForIndex(ti)]}"></span>${escapeHTML(t)}</span>`).join('')}
      </div>
      <a class="project-link" href="${escapeHTML(p.url)}" target="_blank" rel="noopener noreferrer">${escapeHTML(p.url.replace(/^https?:\/\//, ''))}</a>
    `;
    makeReveal(card, (i % 2) * 90);
    grid.appendChild(card);
  });

  initReveal();
}

/* ---------- Skills ---------- */
async function loadSkills() {
  const cloud = document.getElementById('skillCloud');
  const { data, error } = await supabase
    .from('skills')
    .select('*')
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: true });

  cloud.innerHTML = '';

  if (error) {
    console.error(error);
    cloud.appendChild(emptyState('スキルを読み込めませんでした'));
    return;
  }
  if (!data || data.length === 0) {
    cloud.appendChild(emptyState('まだスキルが登録されていません'));
    return;
  }

  data.forEach((s, i) => {
    const tag = document.createElement('span');
    tag.className = 'skill-tag';
    tag.innerHTML = `<span class="dot" style="background:${TAG_HEX[colorForIndex(i)]}"></span>${escapeHTML(s.name)}`;
    cloud.appendChild(tag);
  });
}

/* ---------- Init ---------- */
document.querySelectorAll('.section-head').forEach((el) => makeReveal(el));
initReveal();

typeHero();
loadQualifications();
loadProjects();
loadSkills();
