import { supabase } from './supabase-client.js';

/* ---------- Elements ---------- */
const loginScreen = document.getElementById('loginScreen');
const adminShell = document.getElementById('adminShell');
const loginForm = document.getElementById('loginForm');
const loginBtn = document.getElementById('loginBtn');
const loginBtnText = document.getElementById('loginBtnText');
const loginError = document.getElementById('loginError');
const logoutBtn = document.getElementById('logoutBtn');
const sidebar = document.getElementById('sidebar');
const sidebarToggle = document.getElementById('sidebarToggle');
const toastEl = document.getElementById('toast');
const editModal = document.getElementById('editModal');
const editForm = document.getElementById('editForm');
const editModalTitle = document.getElementById('editModalTitle');

let currentSession = null;

/* ---------- Toast ---------- */
let toastTimer = null;
function showToast(message, isError = false) {
  clearTimeout(toastTimer);
  toastEl.textContent = message;
  toastEl.classList.toggle('error', isError);
  toastEl.classList.add('show');
  toastTimer = setTimeout(() => toastEl.classList.remove('show'), 2600);
}

function escapeHTML(str) {
  const div = document.createElement('div');
  div.textContent = str ?? '';
  return div.innerHTML;
}

/* ---------- Auth ---------- */
async function checkSession() {
  const { data } = await supabase.auth.getSession();
  currentSession = data.session;
  if (currentSession) {
    showDashboard();
  } else {
    showLogin();
  }
}

function showLogin() {
  loginScreen.style.display = 'flex';
  adminShell.style.display = 'none';
}

function showDashboard() {
  loginScreen.style.display = 'none';
  adminShell.style.display = 'flex';
  loadAll();
}

loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  loginError.classList.remove('show');
  loginBtn.disabled = true;
  loginBtnText.innerHTML = '<span class="spinner"></span>';

  const email = document.getElementById('loginEmail').value.trim();
  const password = document.getElementById('loginPassword').value;

  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  loginBtn.disabled = false;
  loginBtnText.textContent = '$ sign in';

  if (error) {
    loginError.textContent = '// ログインできませんでした。メールアドレスとパスワードを確認してください。';
    loginError.classList.add('show');
    return;
  }

  currentSession = data.session;
  showDashboard();
});

logoutBtn.addEventListener('click', async () => {
  await supabase.auth.signOut();
  currentSession = null;
  showLogin();
});

supabase.auth.onAuthStateChange((_event, session) => {
  currentSession = session;
});

/* ---------- Sidebar navigation ---------- */
document.querySelectorAll('.sidebar-nav button').forEach((btn) => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.sidebar-nav button').forEach((b) => b.classList.remove('active'));
    document.querySelectorAll('.panel').forEach((p) => p.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById(`panel-${btn.dataset.panel}`).classList.add('active');
    sidebar.classList.remove('open');
  });
});

sidebarToggle?.addEventListener('click', () => sidebar.classList.toggle('open'));

/* ---------- Modal helpers ---------- */
function openModal(title, fieldsHTML, onSubmit) {
  editModalTitle.textContent = title;
  editForm.innerHTML = `
    ${fieldsHTML}
    <div class="modal-actions">
      <button type="button" class="btn btn-ghost" id="modalCancel">Cancel</button>
      <button type="submit" class="btn btn-primary">Save changes</button>
    </div>
  `;
  editModal.classList.add('show');
  editForm.onsubmit = async (e) => {
    e.preventDefault();
    await onSubmit();
  };
  document.getElementById('modalCancel').onclick = closeModal;
}

function closeModal() {
  editModal.classList.remove('show');
  editForm.innerHTML = '';
}

editModal.addEventListener('click', (e) => {
  if (e.target === editModal) closeModal();
});

/* ==========================================================================
   Qualifications
   ========================================================================== */

async function loadQualifications() {
  const list = document.getElementById('qualList');
  const { data, error } = await supabase
    .from('qualifications')
    .select('*')
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: true });

  document.getElementById('qualCount').textContent = `${data ? data.length : 0} items`;
  list.innerHTML = '';

  if (error) {
    showToast('資格の読み込みに失敗しました', true);
    return;
  }

  if (data.length === 0) {
    list.innerHTML = '<div class="empty-state">// まだ資格がありません。下のフォームから追加してください。</div>';
    return;
  }

  data.forEach((q) => {
    const row = document.createElement('div');
    row.className = 'admin-row';
    row.innerHTML = `
      <div class="admin-row-main">
        <p class="admin-row-title">${escapeHTML(q.name)}</p>
        <p class="admin-row-sub">${escapeHTML(q.status)}</p>
      </div>
      <div class="admin-row-actions">
        <button class="icon-btn" data-action="edit" title="編集">✎</button>
        <button class="icon-btn danger" data-action="delete" title="削除">✕</button>
      </div>
    `;
    row.querySelector('[data-action="edit"]').addEventListener('click', () => editQualification(q));
    row.querySelector('[data-action="delete"]').addEventListener('click', () => deleteQualification(q));
    list.appendChild(row);
  });
}

document.getElementById('qualForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const name = document.getElementById('qualName').value.trim();
  const status = document.getElementById('qualStatus').value.trim();
  if (!name || !status) return;

  const { error } = await supabase.from('qualifications').insert({ name, status });
  if (error) {
    showToast('追加に失敗しました', true);
    return;
  }
  e.target.reset();
  showToast('保存しました');
  loadQualifications();
});

function editQualification(q) {
  openModal('資格を編集', `
    <div class="field">
      <label for="editQualName">資格名</label>
      <input type="text" id="editQualName" value="${escapeHTML(q.name)}" required>
    </div>
    <div class="field">
      <label for="editQualStatus">ステータス</label>
      <input type="text" id="editQualStatus" value="${escapeHTML(q.status)}" required>
    </div>
  `, async () => {
    const name = document.getElementById('editQualName').value.trim();
    const status = document.getElementById('editQualStatus').value.trim();
    const { error } = await supabase.from('qualifications').update({ name, status }).eq('id', q.id);
    if (error) { showToast('更新に失敗しました', true); return; }
    closeModal();
    showToast('保存しました');
    loadQualifications();
  });
}

async function deleteQualification(q) {
  if (!confirm(`「${q.name}」を削除しますか？`)) return;
  const { error } = await supabase.from('qualifications').delete().eq('id', q.id);
  if (error) { showToast('削除に失敗しました', true); return; }
  showToast('削除しました');
  loadQualifications();
}

/* ==========================================================================
   Projects
   ========================================================================== */

async function loadProjects() {
  const list = document.getElementById('projectList');
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: true });

  document.getElementById('projectCount').textContent = `${data ? data.length : 0} items`;
  list.innerHTML = '';

  if (error) {
    showToast('プロジェクトの読み込みに失敗しました', true);
    return;
  }

  if (data.length === 0) {
    list.innerHTML = '<div class="empty-state">// まだプロジェクトがありません。下のフォームから追加してください。</div>';
    return;
  }

  data.forEach((p) => {
    const row = document.createElement('div');
    row.className = 'admin-row';
    row.innerHTML = `
      <div class="admin-row-main">
        <p class="admin-row-title">${escapeHTML(p.name)}</p>
        <p class="admin-row-sub">${escapeHTML(p.tech)} · ${escapeHTML(p.url)}</p>
      </div>
      <div class="admin-row-actions">
        <button class="icon-btn" data-action="edit" title="編集">✎</button>
        <button class="icon-btn danger" data-action="delete" title="削除">✕</button>
      </div>
    `;
    row.querySelector('[data-action="edit"]').addEventListener('click', () => editProject(p));
    row.querySelector('[data-action="delete"]').addEventListener('click', () => deleteProject(p));
    list.appendChild(row);
  });
}

document.getElementById('projectForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const name = document.getElementById('projName').value.trim();
  const description = document.getElementById('projDesc').value.trim();
  const tech = document.getElementById('projTech').value.trim();
  const url = document.getElementById('projUrl').value.trim();
  if (!name || !description || !tech || !url) return;

  const { error } = await supabase.from('projects').insert({ name, description, tech, url });
  if (error) {
    showToast('追加に失敗しました', true);
    return;
  }
  e.target.reset();
  showToast('保存しました');
  loadProjects();
});

function editProject(p) {
  openModal('プロジェクトを編集', `
    <div class="field">
      <label for="editProjName">プロジェクト名</label>
      <input type="text" id="editProjName" value="${escapeHTML(p.name)}" required>
    </div>
    <div class="field">
      <label for="editProjDesc">説明</label>
      <textarea id="editProjDesc" required>${escapeHTML(p.description)}</textarea>
    </div>
    <div class="field">
      <label for="editProjTech">使用技術（カンマ区切り）</label>
      <input type="text" id="editProjTech" value="${escapeHTML(p.tech)}" required>
    </div>
    <div class="field">
      <label for="editProjUrl">URL</label>
      <input type="url" id="editProjUrl" value="${escapeHTML(p.url)}" required>
    </div>
  `, async () => {
    const name = document.getElementById('editProjName').value.trim();
    const description = document.getElementById('editProjDesc').value.trim();
    const tech = document.getElementById('editProjTech').value.trim();
    const url = document.getElementById('editProjUrl').value.trim();
    const { error } = await supabase.from('projects').update({ name, description, tech, url }).eq('id', p.id);
    if (error) { showToast('更新に失敗しました', true); return; }
    closeModal();
    showToast('保存しました');
    loadProjects();
  });
}

async function deleteProject(p) {
  if (!confirm(`「${p.name}」を削除しますか？`)) return;
  const { error } = await supabase.from('projects').delete().eq('id', p.id);
  if (error) { showToast('削除に失敗しました', true); return; }
  showToast('削除しました');
  loadProjects();
}

/* ==========================================================================
   Skills
   ========================================================================== */

async function loadSkills() {
  const cloud = document.getElementById('skillAdminCloud');
  const { data, error } = await supabase
    .from('skills')
    .select('*')
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: true });

  document.getElementById('skillCount').textContent = `${data ? data.length : 0} items`;
  cloud.innerHTML = '';

  if (error) {
    showToast('スキルの読み込みに失敗しました', true);
    return;
  }

  if (data.length === 0) {
    cloud.innerHTML = '<div class="empty-state">// まだスキルがありません。下のフォームから追加してください。</div>';
    return;
  }

  data.forEach((s) => {
    const chip = document.createElement('div');
    chip.className = 'skill-admin-chip';
    chip.innerHTML = `
      <span class="skill-chip-name">${escapeHTML(s.name)}</span>
      <button title="編集" data-action="edit">✎</button>
      <button title="削除" data-action="delete">✕</button>
    `;
    chip.querySelector('[data-action="edit"]').addEventListener('click', () => editSkill(s));
    chip.querySelector('[data-action="delete"]').addEventListener('click', () => deleteSkill(s));
    cloud.appendChild(chip);
  });
}

document.getElementById('skillForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const name = document.getElementById('skillName').value.trim();
  if (!name) return;

  const { error } = await supabase.from('skills').insert({ name });
  if (error) {
    showToast('追加に失敗しました', true);
    return;
  }
  e.target.reset();
  showToast('保存しました');
  loadSkills();
});

function editSkill(s) {
  openModal('スキルを編集', `
    <div class="field">
      <label for="editSkillName">スキル名</label>
      <input type="text" id="editSkillName" value="${escapeHTML(s.name)}" required>
    </div>
  `, async () => {
    const name = document.getElementById('editSkillName').value.trim();
    const { error } = await supabase.from('skills').update({ name }).eq('id', s.id);
    if (error) { showToast('更新に失敗しました', true); return; }
    closeModal();
    showToast('保存しました');
    loadSkills();
  });
}

async function deleteSkill(s) {
  if (!confirm(`「${s.name}」を削除しますか？`)) return;
  const { error } = await supabase.from('skills').delete().eq('id', s.id);
  if (error) { showToast('削除に失敗しました', true); return; }
  showToast('削除しました');
  loadSkills();
}

/* ---------- Load everything ---------- */
function loadAll() {
  loadQualifications();
  loadProjects();
  loadSkills();
}

checkSession();
