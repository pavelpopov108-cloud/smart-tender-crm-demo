/* Ядро: состояние, помощники, каркас, маршруты, модалки, поиск Ctrl+K */
(function () {
  const D = window.DEMO;
  const KEY = 'st-crm-demo-v4';
  const TODAY = '2026-11-05';
  const NOW0 = new Date(D.NOW).getTime(), T0 = Date.now();

  function fresh() {
    return {
      me: 'sergey',
      pies: JSON.parse(JSON.stringify(D.PIES)),
      cos: JSON.parse(JSON.stringify(D.COMPANIES)),
      pods: JSON.parse(JSON.stringify(D.PODBORKI)),
      leads: JSON.parse(JSON.stringify(D.LEADS)),
      dial: {}, imp: { step: 1 }, leadMode: 'round', rr: 0,
    };
  }
  let S;
  try { S = JSON.parse(localStorage.getItem(KEY) || 'null'); } catch (e) { S = null; }
  if (!S || !S.cos) S = fresh();
  function save() { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { } }
  function reset() { S = fresh(); App.S = S; save(); }

  /* ---------- помощники ---------- */
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const ic = (n, cls = '') => `<i data-lucide="${n}" class="${cls}"></i>`;
  const now = () => new Date(NOW0 + (Date.now() - T0));
  const pad = n => String(n).padStart(2, '0');
  const hhmm = (d = now()) => pad(d.getHours()) + ':' + pad(d.getMinutes());
  const dm = s => s ? s.slice(8, 10) + '.' + s.slice(5, 7) : '';
  const dayDiff = (a, b = TODAY) => Math.round((new Date(b + 'T12:00') - new Date(a + 'T12:00')) / 864e5);
  function addDays(d, n) { const x = new Date(d + 'T12:00'); x.setDate(x.getDate() + n); return x.getFullYear() + '-' + pad(x.getMonth() + 1) + '-' + pad(x.getDate()); }
  function relDay(s) { const k = dayDiff(s); if (k === 0) return 'сегодня'; if (k === 1) return 'вчера'; if (k === -1) return 'завтра'; return dm(s); }
  function plural(n, a, b, c) { n = Math.abs(n); const m10 = n % 10, m100 = n % 100; if (m10 === 1 && m100 !== 11) return a; if (m10 >= 2 && m10 <= 4 && (m100 < 12 || m100 > 14)) return b; return c; }
  const days = n => n + ' ' + plural(n, 'день', 'дня', 'дней');
  function money(n, short) {
    if (short && n >= 1e6) return (n / 1e6).toFixed(n % 1e6 === 0 ? 0 : 1).replace('.', ',') + ' млн ₽';
    return n.toLocaleString('ru-RU').replace(/,/g, ' ') + ' ₽';
  }
  const WD = ['воскресенье', 'понедельник', 'вторник', 'среда', 'четверг', 'пятница', 'суббота'];
  const MON = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'];

  const people = [...D.MANAGERS, D.SPECIALIST];
  const person = id => people.find(p => p.id === id) || { name: '—', ini: '?', color: '#888' };
  const av = (id, cls = '') => { const p = person(id); return `<span class="av ${cls}" style="--c:${p.color}" data-tip="${esc(p.name)}">${esc(p.ini)}</span>`; };
  const stage = id => D.STAGES.find(s => s.id === id) || D.STAGES[0];
  const stageBadge = id => { const s = stage(id); return `<span class="badge stage" style="--sc:var(--st-${s.c})"><span class="dot"></span>${esc(s.name)}</span>`; };
  const ACTIVE = ['interest', 'pie_sent', 'profile', 'wait_pod', 'pod_sent', 'contract_sent', 'signed', 'accred', 'participation', 'result'];
  const NEEDS_NEXT = ['interest', 'pie_sent', 'profile', 'wait_pod', 'pod_sent', 'contract_sent', 'signed', 'accred', 'participation'];
  const co = id => S.cos.find(c => c.id === id);
  const pie = id => S.pies.find(p => p.id === id);
  const pieName = p => p ? p.city + ', ' + p.work.toLowerCase() : '';

  function untilDeadline(p) { return new Date(p.deadline).getTime() - now().getTime(); }
  function countdown(p) {
    const ms = untilDeadline(p);
    if (ms <= 0) return { txt: 'срок прошёл', hot: true };
    const d = Math.floor(ms / 864e5), h = Math.floor(ms % 864e5 / 36e5), m = Math.floor(ms % 36e5 / 6e4);
    return { txt: d > 0 ? `${d} д ${h} ч` : `${h} ч ${pad(m)} мин`, hot: ms < 3 * 864e5 };
  }
  const isLocked = c => c.owner && c.owner !== S.me && c.stage !== 'refused';
  const noNext = c => NEEDS_NEXT.includes(c.stage) && !c.next;

  function addHist(c, e) {
    c.history.unshift(Object.assign({ d: TODAY, t: hhmm(), who: S.me, live: true }, e));
  }

  /* ---------- метрики (из исходов звонков, руками никто не считает) ---------- */
  function todayStats() {
    const r = {}; D.MANAGERS.forEach(m => r[m.id] = D.TODAY_BASE[m.id].slice());
    S.cos.forEach(c => c.history.forEach(h => {
      if (h.d !== TODAY || !h.live || !r[h.who]) return;
      if (h.type === 'call') { r[h.who][0]++; if (!['no_answer', 'dropped', 'wrong_number'].includes(h.out)) r[h.who][1]++; if (h.out === 'interest') r[h.who][2]++; }
      if (h.out === 'contract') r[h.who][3]++;
    }));
    return r;
  }
  function counts() {
    const n = st => S.cos.filter(c => st.includes(c.stage)).length;
    return {
      active: n(ACTIVE), interest: n(['interest', 'pie_sent', 'profile']), wait: n(['wait_pod']), podSent: n(['pod_sent']),
      contract: n(['contract_sent']), signed: n(['signed', 'accred', 'participation', 'result']),
      podQueue: S.pods.filter(p => p.status !== 'sent').length, leads: S.leads.filter(l => !l.assigned).length,
      freePies: S.pies.filter(p => !p.takenBy).length,
    };
  }
  function hotItems() {
    const noStep = S.cos.filter(noNext).map(c => ({ c, days: dayDiff(c.since) }));
    const contracts = S.cos.filter(c => c.stage === 'contract_sent' && dayDiff(c.since) > 2).map(c => ({ c, days: dayDiff(c.since) }));
    const pies = S.pies.filter(p => untilDeadline(p) < 3 * 864e5).sort((a, b) => untilDeadline(a) - untilDeadline(b));
    const silent = window.App.silentList();
    return { noStep, contracts, pies, silent, total: noStep.length + contracts.length + pies.length + silent.length };
  }

  /* ---------- уведомления ---------- */
  function toast(msg, icon = 'check') {
    let box = $('.toasts'); if (!box) { box = document.createElement('div'); box.className = 'toasts'; document.body.appendChild(box); }
    const t = document.createElement('div'); t.className = 'toast'; t.innerHTML = ic(icon) + `<span>${msg}</span>`;
    box.appendChild(t); icons();
    setTimeout(() => { t.style.transition = 'opacity .2s, transform .2s'; t.style.opacity = '0'; t.style.transform = 'translateY(6px)'; }, 2600);
    setTimeout(() => t.remove(), 2900);
  }
  function icons() { if (window.lucide) lucide.createIcons(); }

  /* ---------- модалка ---------- */
  function modal({ title, sub, body, ok = 'Готово', okCls = 'primary', cancel = 'Отмена', onOk, wide, onMount }) {
    closeModal();
    const o = document.createElement('div'); o.className = 'overlay'; o.id = 'modal';
    o.innerHTML = `<div class="modal" role="dialog" aria-modal="true" style="${wide ? 'max-width:640px' : ''}">
      <div class="modal-h"><h3>${title}</h3>${sub ? `<p class="muted" style="margin-top:4px">${sub}</p>` : ''}</div>
      <div class="modal-b">${body}</div>
      <div class="modal-f">${cancel ? `<button class="btn" data-x>${cancel}</button>` : ''}<button class="btn ${okCls}" data-ok>${ok}</button></div></div>`;
    document.body.appendChild(o); icons();
    o.addEventListener('mousedown', e => { if (e.target === o) closeModal(); });
    $$('[data-x]', o).forEach(b => b.onclick = closeModal);
    $('[data-ok]', o).onclick = () => { if (onOk && onOk(o) === false) return; closeModal(); };
    if (onMount) onMount(o);
    const f = $('input,textarea,select', o); if (f && !('ontouchstart' in window)) f.focus();
    return o;
  }
  function closeModal() { const m = $('#modal'); if (m) m.remove(); }

  /* ---------- маршруты ---------- */
  const ROUTES = [
    { id: 'planerka', name: 'Планёрка 10:00', icon: 'layout-dashboard', group: 'Команда' },
    { id: 'moy-den', name: 'Мой день', icon: 'sun', group: 'Команда' },
    { id: 'pirozhki', name: 'Пирожки', icon: 'croissant', group: 'Работа', cnt: () => counts().freePies, tip: 'свободных' },
    { id: 'obzvon', name: 'Обзвон', icon: 'phone-call', group: 'Работа' },
    { id: 'kompaniya', name: 'Карточка компании', icon: 'building-2', group: 'Работа', hidden: true },
    { id: 'klienty', name: 'Клиенты', icon: 'square-kanban', group: 'Работа', cnt: () => counts().active },
    { id: 'podborki', name: 'Подборки', icon: 'list-checks', group: 'Работа', cnt: () => counts().podQueue },
    { id: 'vhodyashchie', name: 'Входящие', icon: 'inbox', group: 'Работа', cnt: () => counts().leads, hot: true },
    { id: 'import', name: 'Импорт базы', icon: 'file-up', group: 'Сервис' },
    { id: 'shpargalka', name: 'Шпаргалка', icon: 'book-open', group: 'Сервис', hidden: true },
    { id: 'pochemu', name: 'Почему так', icon: 'lightbulb', group: 'О макете', hidden: true },
    { id: 'tur', name: 'Тур', icon: 'play', group: 'О макете', hidden: true },
  ];
  function parseHash() {
    const h = (location.hash || '').slice(1);
    if (!h) return { id: 'planerka' };
    if (h.startsWith('kompaniya-')) return { id: 'kompaniya', arg: h.slice(10) };
    if (h.startsWith('obzvon-')) return { id: 'obzvon', arg: h.slice(7) };
    if (ROUTES.some(r => r.id === h)) return { id: h };
    return { id: 'planerka' };
  }
  const go = h => { if (location.hash === '#' + h) render(); else location.hash = h; };

  /* ---------- каркас ---------- */
  function shell() {
    const groups = [...new Set(ROUTES.filter(r => !r.hidden).map(r => r.group))];
    document.getElementById('root').innerHTML = `
    <div class="app">
      <aside class="side">
        <a class="brand" href="#planerka"><span class="brand-mark"><img src="logo.png" alt="Смарт Тендер"></span><div><div class="brand-name">Смарт Тендер</div><div class="brand-sub">Отдел обзвона</div></div></a>
        <nav class="nav" id="nav">${groups.map(g => `<div class="nav-label">${g}</div>` + ROUTES.filter(r => r.group === g && !r.hidden).map(r => `<a href="#${r.id}" data-r="${r.id}" data-tip-pos="bottom">${ic(r.icon)}<span class="txt">${r.name}</span>${r.cnt ? `<span class="cnt${r.hot ? ' hot' : ''}" data-cnt="${r.id}"></span>` : ''}</a>`).join('')).join('')}</nav>
        <div class="side-foot"><div class="side-card">Макет для обсуждения. Данные выдуманные, звонки и письма не уходят. <b>Сегодня 05.11.2026.</b></div></div>
      </aside>
      <div class="main">
        <header class="top">
          <a class="top-mobile-brand" href="#planerka"><span class="brand-mark"><img src="logo.png" alt="Смарт Тендер"></span><span id="mob-title"></span></a>
          <div class="crumbs" id="crumbs"></div>
          <button class="search-btn" id="search-btn" aria-label="Поиск">${ic('search')}<span class="txt">Компания, ИНН, телефон…</span><span class="kbd">Ctrl K</span></button>
          <div class="top-actions">
            <button class="btn" id="cheat-btn" data-tip="Условия и ответы клиенту" data-tip-pos="bottom">${ic('book-open')}<span class="hide-mob">Шпаргалка</span></button>
            <div class="rel"><button class="user-btn" id="user-btn" aria-label="Пользователь">${av(S.me)}<span class="hide-mob" id="me-name">${person(S.me).name}</span>${ic('chevron-down')}</button></div>
          </div>
        </header>
        <main class="content" id="view"></main>
      </div>
    </div>
    <nav class="bottom-nav" id="bnav">
      ${[['planerka', 'layout-dashboard', 'Планёрка'], ['moy-den', 'sun', 'Мой день'], ['obzvon', 'phone-call', 'Обзвон'], ['klienty', 'square-kanban', 'Клиенты']].map(([id, i, n]) => `<a href="#${id}" data-r="${id}">${ic(i)}<span>${n}</span></a>`).join('')}
      <button id="more-btn">${ic('menu')}<span>Ещё</span><span class="pip" id="more-pip" hidden></span></button>
    </nav>`;
    $('#search-btn').onclick = openPalette;
    $('#cheat-btn').onclick = openCheat;
    $('#user-btn').onclick = e => { e.stopPropagation(); userMenu(); };
    $('#more-btn').onclick = moreSheet;
  }

  function userMenu() {
    const ex = $('#umenu'); if (ex) { ex.remove(); return; }
    const theme = (() => { try { return localStorage.getItem('st-theme') || 'system'; } catch (e) { return 'system'; } })();
    const m = document.createElement('div'); m.className = 'menu'; m.id = 'umenu';
    m.innerHTML = `<div class="eyebrow" style="padding:6px 9px">Смотреть как</div>
      ${people.map(p => `<button class="mi ${p.id === S.me ? 'on' : ''}" data-me="${p.id}">${av(p.id, 'xs')}${p.name}${p.role ? `<span class="faint" style="font-size:12px">· специалист</span>` : ''}${p.id === S.me ? ic('check', 'ml') : ''}</button>`).join('')}
      <hr><div class="eyebrow" style="padding:6px 9px">Тема</div>
      ${[['system', 'monitor', 'Как в системе'], ['light', 'sun', 'Светлая'], ['dark', 'moon', 'Тёмная']].map(([v, i, n]) => `<button class="mi ${theme === v ? 'on' : ''}" data-theme-set="${v}">${ic(i)}${n}</button>`).join('')}
      <hr><div class="eyebrow" style="padding:6px 9px">Дизайн</div>
      ${[[1, 'Тихий рабочий'], [2, 'Тёплая бумага'], [3, 'Пульт обзвона'], [4, 'Телефон в руке']].map(([v, n]) => `<button class="mi ${(window.DIZAIN || 1) === v ? 'on' : ''}" data-dz-set="${v}">${ic('palette')}${v}. ${n}${(window.DIZAIN || 1) === v ? ic('check', 'ml') : ''}</button>`).join('')}
      <a class="mi" href="#vybor-dizaina">${ic('layout-grid')}Сравнить все четыре</a>
      <hr><div class="eyebrow" style="padding:6px 9px">О макете</div>
      <button class="mi" id="tour-btn">${ic('play')}Показать тур</button>
      <a class="mi" href="#pochemu">${ic('lightbulb')}Почему так</a>
      <button class="mi" id="reset-demo">${ic('rotate-ccw')}Сбросить демо-данные</button>`;
    $('#user-btn').parentElement.appendChild(m); icons();
    $$('[data-me]', m).forEach(b => b.onclick = () => { S.me = b.dataset.me; save(); m.remove(); shell(); render(); toast('Вы смотрите как ' + person(S.me).name, 'user'); });
    $$('[data-theme-set]', m).forEach(b => b.onclick = () => { setTheme(b.dataset.themeSet); m.remove(); });
    $$('[data-dz-set]', m).forEach(b => b.onclick = () => App.setDizain(+b.dataset.dzSet));
    $('#tour-btn', m).onclick = () => { m.remove(); App.startTour(); };
    $$('a.mi', m).forEach(a => a.addEventListener('click', () => m.remove()));
    $('#reset-demo', m).onclick = () => { reset(); m.remove(); shell(); render(); toast('Демо-данные сброшены', 'rotate-ccw'); };
    setTimeout(() => document.addEventListener('click', function h(e) { if (!m.contains(e.target)) { m.remove(); document.removeEventListener('click', h); } }), 0);
  }
  function setTheme(v) {
    try { localStorage.setItem('st-theme', v); } catch (e) { }
    if (v === 'system') document.documentElement.removeAttribute('data-theme'); else document.documentElement.setAttribute('data-theme', v);
  }
  try { const t = localStorage.getItem('st-theme'); if (t && t !== 'system') document.documentElement.setAttribute('data-theme', t); } catch (e) { }

  function moreSheet() {
    const items = ROUTES.filter(r => !r.hidden && !['planerka', 'moy-den', 'obzvon', 'klienty'].includes(r.id));
    modal({
      title: 'Все экраны', cancel: null, ok: 'Закрыть', okCls: '',
      body: `<div class="list" style="margin:0 -18px">${items.map(r => `<a class="li" href="#${r.id}" data-close>${ic(r.icon)}<span class="title">${r.name}</span>${r.cnt && r.cnt() ? `<span class="end"><span class="badge ${r.hot ? 'hot' : ''}">${r.cnt()}</span></span>` : ''}</a>`).join('')}</div>`,
      onMount: o => $$('[data-close]', o).forEach(a => a.addEventListener('click', closeModal)),
    });
  }

  function updateNav(rid) {
    $$('[data-r]').forEach(a => a.classList.toggle('on', a.dataset.r === rid || (rid === 'kompaniya' && a.dataset.r === 'klienty')));
    ROUTES.forEach(r => { if (!r.cnt) return; const el = $(`[data-cnt="${r.id}"]`); if (el) { const v = r.cnt(); el.textContent = v || ''; } });
    const lp = $('#more-pip'); if (lp) { const n = counts().leads; lp.hidden = !n; lp.textContent = n; }
  }

  /* ---------- отрисовка ---------- */
  let timers = [];
  function clearTimers() { timers.forEach(clearInterval); timers = []; }
  function every(ms, fn) { timers.push(setInterval(fn, ms)); }
  let lastRoute = null;
  function render(opts = {}) {
    const r = parseHash();
    const def = ROUTES.find(x => x.id === r.id);
    clearTimers(); closeModal();
    const v = $('#view');
    const same = lastRoute === location.hash && !opts.skeleton;
    const draw = () => {
      const res = App.screens[r.id](r.arg) || {};
      v.innerHTML = res.html || '';
      v.classList.remove('view-in'); void v.offsetWidth; if (!same) v.classList.add('view-in');
      const crumbs = res.crumbs || [def.name];
      $('#crumbs').innerHTML = crumbs.map((c, i) => `<span class="${i < crumbs.length - 1 ? 'dim' : ''}">${c}</span>`).join('<span class="sep">/</span>');
      $('#mob-title').textContent = crumbs[crumbs.length - 1].replace(/<[^>]+>/g, '');
      document.title = crumbs[crumbs.length - 1].replace(/<[^>]+>/g, '') + ' · Смарт Тендер';
      updateNav(r.id);
      icons();
      if (res.mount) res.mount(v);
      lastRoute = location.hash;
    };
    if (!same) {
      v.innerHTML = skeleton();
      if (!opts.keepScroll) window.scrollTo(0, 0);
      setTimeout(draw, 170);
    } else draw();
  }
  function skeleton() {
    const line = (w, h = 12) => `<div class="sk" style="width:${w};height:${h}px"></div>`;
    return `<div class="page-head"><div class="stack">${line('220px', 22)}${line('320px')}</div></div>
      <div class="grid g-main"><div class="panel"><div class="panel-b stack" style="gap:14px">${[90, 70, 84, 60, 76, 66].map(w => line(w + '%')).join('')}</div></div>
      <div class="panel"><div class="panel-b stack" style="gap:14px">${[80, 60, 72, 50].map(w => line(w + '%')).join('')}</div></div></div>`;
  }

  /* ---------- поиск Ctrl+K ---------- */
  function openPalette() {
    closeModal();
    const o = document.createElement('div'); o.className = 'overlay'; o.id = 'modal';
    o.innerHTML = `<div class="modal palette" role="dialog" aria-label="Поиск"><div class="pi">${ic('search')}<input id="pal-q" placeholder="Название, ИНН, телефон или экран" autocomplete="off"><span class="kbd">Esc</span></div><div class="res" id="pal-res"></div>
      <div class="modal-f" style="justify-content:space-between;font-size:12px;color:var(--faint)"><span>Ищем по ИНН, названию и телефону: дубль видно до звонка</span><span class="hide-mob">↑ ↓ выбрать · Enter открыть</span></div></div>`;
    document.body.appendChild(o);
    o.addEventListener('mousedown', e => { if (e.target === o) closeModal(); });
    const inp = $('#pal-q', o); let sel = 0, items = [];
    const draw = () => {
      const q = inp.value.trim().toLowerCase(); const qd = q.replace(/\D/g, '');
      const screens = ROUTES.filter(r => !r.hidden && (!q || r.name.toLowerCase().includes(q))).map(r => ({ kind: 'Экраны', href: '#' + r.id, html: `${ic(r.icon)}<span>${r.name}</span>` }));
      const cs = S.cos.filter(c => !q || c.name.toLowerCase().includes(q) || (qd.length >= 3 && (c.inn.includes(qd) || c.phone.replace(/\D/g, '').includes(qd)))).slice(0, q ? 8 : 5).map(c => ({
        kind: 'Компании', href: '#kompaniya-' + c.id,
        html: `${ic('building-2')}<span class="stack" style="gap:0;min-width:0"><span class="ell" style="font-weight:700">${esc(c.name)}</span><span class="faint ell" style="font-size:12px">ИНН ${c.inn} · ${c.city}${c.refusal ? ' · отказ ' + dm(c.since) + ': ' + esc(c.refusal) : ''}</span></span><span class="r">${c.dnc ? '<span class="badge dnc">Не звонить</span>' : ''}${c.stage === 'refused' ? '<span class="badge">Отказ</span>' : ''}${c.owner ? av(c.owner, 'xs') : '<span class="badge plain">Свободна</span>'}</span>`,
      }));
      const ps = S.pies.filter(p => !q || pieName(p).toLowerCase().includes(q)).slice(0, q ? 5 : 3).map(p => ({ kind: 'Пирожки', href: '#pirozhki', html: `${ic('croissant')}<span>${pieName(p)}</span><span class="r faint mono" style="font-size:12px">до ${dm(p.deadline)}</span>` }));
      items = [...cs, ...ps, ...screens];
      sel = Math.min(sel, Math.max(0, items.length - 1));
      let last = '';
      $('#pal-res', o).innerHTML = items.length ? items.map((it, i) => { const g = it.kind !== last ? `<div class="grp">${it.kind}</div>` : ''; last = it.kind; return g + `<div class="it ${i === sel ? 'on' : ''}" data-i="${i}">${it.html}</div>`; }).join('')
        : `<div class="empty"><div class="ico">${ic('search-x')}</div><b>Ничего не нашли</b><span>Компании с таким ИНН или телефоном в базе нет. Можно звонить.</span></div>`;
      icons();
      $$('.it', o).forEach(el => { el.onclick = () => { closeModal(); location.hash = items[+el.dataset.i].href; }; el.onmousemove = () => { if (sel !== +el.dataset.i) { sel = +el.dataset.i; $$('.it', o).forEach(x => x.classList.toggle('on', +x.dataset.i === sel)); } }; });
    };
    inp.oninput = () => { sel = 0; draw(); };
    inp.onkeydown = e => {
      if (e.key === 'ArrowDown') { sel = Math.min(items.length - 1, sel + 1); draw(); e.preventDefault(); $('.it.on', o)?.scrollIntoView({ block: 'nearest' }); }
      if (e.key === 'ArrowUp') { sel = Math.max(0, sel - 1); draw(); e.preventDefault(); $('.it.on', o)?.scrollIntoView({ block: 'nearest' }); }
      if (e.key === 'Enter' && items[sel]) { closeModal(); location.hash = items[sel].href; }
    };
    draw(); inp.focus();
  }

  /* ---------- шпаргалка сбоку ---------- */
  function openCheat() {
    if ($('#drawer')) { $('#drawer').remove(); $('#drawer-ov')?.remove(); return; }
    const ov = document.createElement('div'); ov.className = 'overlay'; ov.id = 'drawer-ov'; ov.style.background = 'var(--overlay)'; ov.style.zIndex = 94;
    const d = document.createElement('aside'); d.className = 'drawer'; d.id = 'drawer';
    d.innerHTML = `<div class="drawer-h">${ic('book-open')}<h3>Шпаргалка</h3><a class="btn sm ghost" href="#shpargalka" style="margin-left:auto" id="cheat-full">Открыть целиком</a><button class="btn sm icon ghost" id="cheat-x" aria-label="Закрыть">${ic('x')}</button></div><div class="drawer-b">${App.cheatBody(true)}</div>`;
    document.body.append(ov, d); icons();
    const close = () => { d.remove(); ov.remove(); };
    ov.onclick = close; $('#cheat-x').onclick = close; $('#cheat-full').onclick = close;
  }

  /* ---------- клавиатура ---------- */
  document.addEventListener('keydown', e => {
    if ((e.ctrlKey || e.metaKey) && (e.key === 'k' || e.key === 'л' || e.code === 'KeyK')) { e.preventDefault(); openPalette(); return; }
    if (e.key === 'Escape') { closeModal(); $('#drawer')?.remove(); $('#drawer-ov')?.remove(); $('#umenu')?.remove(); }
  });

  window.App = {
    D, get S() { return S; }, set S(v) { S = v; }, save, reset, fresh, TODAY, $, $$, esc, ic, now, hhmm, dm, dayDiff, addDays, relDay, plural, days, money, WD, MON,
    person, av, stage, stageBadge, ACTIVE, NEEDS_NEXT, co, pie, pieName, countdown, untilDeadline, isLocked, noNext, addHist,
    todayStats, counts, hotItems, toast, icons, modal, closeModal, ROUTES, go, render, every, shell, openPalette, openCheat, screens: {},
  };
  window.addEventListener('hashchange', () => render());
  document.addEventListener('DOMContentLoaded', () => { shell(); render(); });
})();
