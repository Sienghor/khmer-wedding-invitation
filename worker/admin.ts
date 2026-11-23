/**
 * Private page for the couple: /admin. Asks for the admin key once (kept in
 * this browser), then lists the blessings and offers a CSV download.
 * Self-contained: no external scripts, styles or fonts.
 */
export const ADMIN_HTML = /* html */ `<!doctype html>
<html lang="km">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex">
<title>ពរជ័យ · Blessings</title>
<style>
  :root { --bg:#f4efe4; --ink:#2b2a22; --soft:#6b6a58; --accent:#4b5230; --gold:#a77b42; --card:#fffdf8; --line:#e2d8c3; }
  * { box-sizing: border-box; }
  body { margin:0; background:var(--bg); color:var(--ink); font:16px/1.6 system-ui, -apple-system, "Khmer OS", "Noto Sans Khmer", sans-serif; }
  main { max-width: 720px; margin: 0 auto; padding: 24px 16px 64px; }
  h1 { font-size: 1.5rem; color: var(--accent); margin: 0 0 4px; }
  .sub { color: var(--soft); margin: 0 0 20px; }
  form, .bar { display:flex; gap:8px; flex-wrap:wrap; margin-bottom:16px; }
  input { flex:1 1 220px; min-height:44px; padding:8px 12px; border:1px solid var(--line); border-radius:10px; font:inherit; background:#fff; }
  button { min-height:44px; padding:8px 16px; border:0; border-radius:999px; background:var(--accent); color:#fff; font:inherit; cursor:pointer; }
  button.ghost { background:transparent; color:var(--accent); border:1px solid var(--accent); }
  .card { background:var(--card); border:1px solid var(--line); border-radius:14px; padding:14px 16px; margin-bottom:12px; }
  .name { font-weight:600; }
  .meta { color:var(--soft); font-size:.85rem; }
  .msg { white-space:pre-wrap; margin-top:6px; }
  .err { color:#9b2c2c; }
  [hidden] { display:none !important; }
</style>
</head>
<body>
<main>
  <h1>ពរជ័យពីភ្ញៀវ · Blessings</h1>
  <p class="sub" id="count">Private page: only people with the key can read these.</p>
  <form id="login">
    <input id="key" type="password" autocomplete="current-password" placeholder="Admin key" required>
    <button>Open</button>
  </form>
  <div class="bar" id="bar" hidden>
    <button id="refresh" type="button">Refresh</button>
    <button id="csv" type="button" class="ghost">Download CSV</button>
    <button id="logout" type="button" class="ghost">Forget key</button>
  </div>
  <p class="err" id="err" role="alert"></p>
  <section id="list" aria-live="polite"></section>
</main>
<script>
  const $ = (id) => document.getElementById(id);
  let rows = [];
  const store = {
    get() { try { return localStorage.getItem('kwi.admin') || ''; } catch { return ''; } },
    set(v) { try { v ? localStorage.setItem('kwi.admin', v) : localStorage.removeItem('kwi.admin'); } catch {} },
  };
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c]));
  const when = (s) => new Date(s.replace(' ', 'T') + 'Z').toLocaleString('en-GB', { timeZone: 'Asia/Phnom_Penh', dateStyle: 'medium', timeStyle: 'short' });

  async function load() {
    const key = store.get();
    if (!key) return;
    $('err').textContent = '';
    const res = await fetch('/api/blessings', { headers: { authorization: 'Bearer ' + key } });
    if (res.status === 401) { store.set(''); $('err').textContent = 'Wrong key.'; show(false); return; }
    if (!res.ok) { $('err').textContent = 'Could not load (' + res.status + ').'; return; }
    rows = (await res.json()).blessings;
    show(true);
    $('count').textContent = rows.length + ' ពរជ័យ · ' + rows.length + ' blessing' + (rows.length === 1 ? '' : 's');
    $('list').innerHTML = rows.map((r) =>
      '<article class="card"><div class="name">' + esc(r.name) + '</div>' +
      '<div class="meta">' + esc(when(r.created_at)) + (r.country ? ' · ' + esc(r.country) : '') + '</div>' +
      '<div class="msg">' + esc(r.message) + '</div></article>').join('');
  }
  function show(on) { $('login').hidden = on; $('bar').hidden = !on; if (!on) $('list').innerHTML = ''; }

  $('login').addEventListener('submit', (e) => { e.preventDefault(); store.set($('key').value.trim()); load(); });
  $('refresh').addEventListener('click', load);
  $('logout').addEventListener('click', () => { store.set(''); show(false); $('count').textContent = ''; });
  $('csv').addEventListener('click', () => {
    const q = (s) => '"' + String(s ?? '').replace(/"/g, '""') + '"';
    const csv = '\\ufeff' + ['name,message,country,created_at (UTC)', ...rows.map((r) => [r.name, r.message, r.country, r.created_at].map(q).join(','))].join('\\n');
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    a.download = 'blessings.csv';
    a.click();
  });
  load();
</script>
</body>
</html>`;
