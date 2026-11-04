// ==========================================================================
// Portfolio data (static)
//
// Supabaseプロジェクトが停止しても内容が必ず表示されるように、
// データを定数として直接持たせている。Supabase運用に戻す場合は
// loadQualifications / loadProjects / loadSkills 内を書き換えればOK。
// ==========================================================================

const QUALIFICATIONS = [
  { name: '生成AIパスポート', status: '取得済み' },
  { name: 'G検定（ジェネラリスト検定）', status: '学習中' },
  { name: '基本情報技術者試験', status: '挑戦中' },
];

const PROJECTS = [
  {
    name: 'StudyClock',
    description: '机の上に置いて使える、オフライン対応の学習タイマー＆PWA時計。フレームワークなしのVanilla JSで軽量実装。',
    tech: 'JavaScript, HTML5, CSS3, PWA, LocalStorage',
    url: 'https://sk00015116.github.io/studyclock/public/',
  },
  {
    name: 'LOCAL-AI-1',
    description: 'WebLLMを活用し、ブラウザ上で完全オフライン稼働するローカルAIチャット。Qwen2.5やSmolLM2を端末GPUで直接実行。',
    tech: 'WebGPU, WebLLM, Qwen2.5, JavaScript',
    url: 'https://sk00015116.github.io/LOCAL-AI-1/',
  },
  {
    name: 'FilePort',
    description: 'Supabase Storageを活用し、学校のタブレットとPC間で教材や単語帳をURL1つで安全に送受信できるファイル転送アプリ。',
    tech: 'JavaScript, Supabase, Storage, HTML5',
    url: 'https://sk00015116.github.io/FilePort11/docs/',
  },
  {
    name: 'price-app',
    description: 'CoinGecko APIを活用し、ビットコインやイーサリアムの日本円価格を10秒ごとに自動更新・チャート描画するリアルタイム相場アプリ。',
    tech: 'JavaScript, CoinGecko API, Canvas, CSS3',
    url: 'https://sk00015116.github.io/price-app/',
  },
  {
    name: 'VoxNote',
    description: 'Web Speech APIによる音声認識とIndexedDBを活用し、音声を録音・文字起こししてブラウザ内に保存するボイスメモアプリ。',
    tech: 'Web Speech API, MediaRecorder, IndexedDB, JavaScript',
    url: 'https://sk00015116.github.io/VoxNote/',
  },
];

const SKILLS = [
  'HTML5',
  'CSS3',
  'JavaScript',
  'Claude / 生成AI',
  'WebGPU',
  'WebLLM',
  'Supabase',
  'Git / GitHub',
  'Leaflet',
  'REST API',
  'PWA',
];

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
function loadQualifications() {
  const grid = document.getElementById('qualGrid');
  grid.innerHTML = '';

  QUALIFICATIONS.forEach((q, i) => {
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
function loadProjects() {
  const grid = document.getElementById('projectGrid');
  grid.innerHTML = '';

  PROJECTS.forEach((p, i) => {
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
function loadSkills() {
  const cloud = document.getElementById('skillCloud');
  cloud.innerHTML = '';

  SKILLS.forEach((name, i) => {
    const tag = document.createElement('span');
    tag.className = 'skill-tag';
    tag.innerHTML = `<span class="dot" style="background:${TAG_HEX[colorForIndex(i)]}"></span>${escapeHTML(name)}`;
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
