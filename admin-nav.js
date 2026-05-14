import { initializeApp } from "https://www.gstatic.com/firebasejs/12.12.1/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/12.12.1/firebase-auth.js";

const firebaseConfig = { apiKey:"AIzaSyAaaABQB1T_SaZ6TARafIXjJ6Zk-upjLO0", authDomain:"prayer-projec.firebaseapp.com", projectId:"prayer-projec", storageBucket:"prayer-projec.firebasestorage.app", messagingSenderId:"47966669764", appId:"1:47966669764:web:b875d2ea5bf75e3b7b3291" };
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const path = window.location.pathname.split('/').pop() || 'admin.html';

onAuthStateChanged(auth, user => {
  if (!user) { window.location.href = 'login.html'; return; }
  document.querySelectorAll('[data-admin-email]').forEach(el => el.textContent = user.email || 'Admin');
});

document.addEventListener('DOMContentLoaded', () => {
  const host = document.querySelector('[data-admin-nav]');
  if (!host) return;
  const links = [
    ['admin.html','Overview'],
    ['admin-requests.html','Requests'],
    ['admin-reports.html','Reports'],
    ['admin-settings.html','Settings'],
    ['admin-audit.html','Audit Log'],
    ['status.html','Public Status'],
    ['index.html','View Site']
  ];
  host.innerHTML = `<div class="admin-sidebar-title">Admin</div><div class="admin-user" data-admin-email>Checking session...</div><nav class="admin-menu">${links.map(([href,label])=>`<a href="${href}" class="${path===href?'active':''}">${label}</a>`).join('')}<button type="button" id="adminLogoutBtn">Sign Out</button></nav>`;
  document.getElementById('adminLogoutBtn')?.addEventListener('click', async () => { await signOut(auth); window.location.href = 'login.html'; });
});