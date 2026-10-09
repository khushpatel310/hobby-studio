// ─── Resolve Dynamic API Host ───
const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' || window.location.protocol === 'file:';
const API_HOST = isLocal && window.location.port !== '5000' ? 'http://localhost:5000' : '';

// ─── Auth Check ───
const token = localStorage.getItem('token');
const currentPath = window.location.pathname.toLowerCase();
const isLoginPage = currentPath.endsWith('index.html') || currentPath.endsWith('/admin/') || currentPath.endsWith('/admin') || currentPath === '/admin';

if (!token && !isLoginPage) {
  // If not logged in and not on login page, redirect cleanly
  window.location.href = 'index.html';
}

// ─── API Helper ───
function apiOpts(extra = {}) {
  const currentToken = localStorage.getItem('token') || token;
  return {
    ...extra,
    headers: {
      'Content-Type': 'application/json',
      ...(currentToken ? { 'Authorization': `Bearer ${currentToken}` } : {}),
      ...(extra.headers || {}),
    },
  };
}

// ─── Authenticated Fetch Wrapper ───
async function fetchWithAuth(url, options = {}) {
  const fullUrl = url.startsWith('http') ? url : `${API_HOST}${url}`;
  try {
    const res = await fetch(fullUrl, apiOpts(options));
    if (res.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('admin');
      window.location.href = 'index.html';
      throw new Error('Session expired. Please log in again.');
    }
    return res;
  } catch (err) {
    if (err.message && err.message.includes('Failed to fetch') && isLocal) {
      throw new Error('Could not connect to backend server. Please verify "node server.js" is running at http://localhost:5000.');
    }
    throw err;
  }
}
window.fetchWithAuth = fetchWithAuth;

// ─── Escape HTML ───
function esc(str) {
  if (str === null || str === undefined) return '';
  const div = document.createElement('div');
  div.textContent = String(str);
  return div.innerHTML;
}
window.esc = esc;

// ─── Logout ───
function logout() {
  try {
    localStorage.removeItem('token');
    localStorage.removeItem('admin');
    sessionStorage.clear();
  } catch (e) {}
  window.location.href = 'index.html';
}
window.logout = logout;

// ─── Modal Helpers ───
function openModal(id) {
  const el = document.getElementById(id);
  if (el) {
    el.classList.add('open');
    el.style.display = 'flex';
  }
}
window.openModal = openModal;

function closeModal(id) {
  const el = document.getElementById(id);
  if (el) {
    el.classList.remove('open');
    el.style.display = 'none';
  }
}
window.closeModal = closeModal;

// ─── Admin Name ───
function initAdminName() {
  try {
    const adminData = JSON.parse(localStorage.getItem('admin') || '{}');
    const nameEl = document.getElementById('adminName');
    if (nameEl) nameEl.textContent = adminData.name || 'Admin';
  } catch (e) {}
}

// ─── Sidebar Toggle ───
function toggleSidebar() {
  const sb = document.getElementById('sidebar');
  if (sb) sb.classList.toggle('open');
}
window.toggleSidebar = toggleSidebar;

// ─── DOM Events & Global Listeners ───
document.addEventListener('DOMContentLoaded', () => {
  initAdminName();

  // Bind all logout buttons
  document.querySelectorAll('.logout-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      logout();
    });
  });

  // Modal backdrop click listener
  document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        overlay.classList.remove('open');
        overlay.style.display = 'none';
      }
    });
  });
});

// Click outside sidebar on mobile to close
document.addEventListener('click', (e) => {
  const sidebar = document.getElementById('sidebar');
  const toggle = document.querySelector('.menu-toggle');
  if (window.innerWidth <= 768 && sidebar && sidebar.classList.contains('open') && !sidebar.contains(e.target) && !toggle?.contains(e.target)) {
    sidebar.classList.remove('open');
  }
});