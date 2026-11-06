/* Выбор дизайна: страница #vybor-dizaina, пункт в меню, плашка на главной, таймер звонка (вариант 3), свайп (вариант 4).
   Только вид: логику и данные не трогает, свайп и клавиши вызывают уже существующие действия. */
(function () {
  const A = window.App, { $, $$, ic } = A;
  const N = window.DIZAIN || 1;
  const VARIANTS = [
    { n: 1, name: 'Тихий рабочий', who: 'Для тех, кто весь день за компьютером: светло-серый фон, один бирюзовый акцент, плотные таблицы. Как Linear и Attio.', key: 'бирюзовый · светлый · плотный', c: '#0e7569' },
    { n: 2, name: 'Тёплая бумага', who: 'Для долгого дня без усталости глаз: кремовый фон, терракотовый акцент, засечки в заголовках, больше воздуха.', key: 'терракотовый · кремовый · мягкий', c: '#a8452a' },
    { n: 3, name: 'Пульт обзвона', who: 'Для максимума звонков в час: тёмная тема, узкое меню, крупная зона звонка, цветные исходы с цифрами клавиш. Как Close и Aircall.', key: 'зелёный на тёмном · клавиши 1–7', c: '#059669' },
    { n: 4, name: 'Телефон в руке', who: 'Для работы с телефона: крупные карточки, нижняя панель, исходы под большим пальцем, свайп по карточке.', key: 'индиго · один столбец · свайп', c: '#4f46e5' },
  ];

  /* ---------- меню и маршрут ---------- */
  A.ROUTES.push({ id: 'vybor-dizaina', name: 'Выбрать дизайн', icon: 'palette', group: 'О макете', hidden: true });
  A.setDizain = function (n) {
    try { localStorage.setItem('st-dizain', String(n)); } catch (e) { }
    const u = new URL(location.href); u.searchParams.set('dizain', n); u.searchParams.delete('tur');
    const same = u.pathname + u.search === location.pathname + location.search;
    location.href = u.pathname + u.search + location.hash;
    if (same) location.reload();
  };

  A.screens['vybor-dizaina'] = function () {
    const card = v => `<article class="dz-card ${v.n === N ? 'cur' : ''}" data-dz="${v.n}" style="--dzc:${v.c}">
      <div class="dz-h"><span class="dz-n">${v.n}</span><div><h2>${v.name}</h2><div class="dz-key">${v.key}</div></div>${v.n === N ? '<span class="badge acc">Сейчас открыт</span>' : ''}</div>
      <p class="dz-who">${v.who}</p>
      <div class="dz-shots">
        <button class="dz-shot wide" data-shot="dizain/d${v.n}-moy-den.webp" aria-label="Вариант ${v.n}: Мой день, крупно"><img src="dizain/d${v.n}-moy-den.webp" alt="Вариант ${v.n}, «Мой день», компьютер" loading="lazy"><span>Мой день</span></button>
        <button class="dz-shot wide" data-shot="dizain/d${v.n}-obzvon.webp" aria-label="Вариант ${v.n}: Обзвон, крупно"><img src="dizain/d${v.n}-obzvon.webp" alt="Вариант ${v.n}, обзвон, компьютер" loading="lazy"><span>Обзвон</span></button>
        <button class="dz-shot tall" data-shot="dizain/d${v.n}-obzvon-375.webp" aria-label="Вариант ${v.n}: Обзвон на телефоне, крупно"><img src="dizain/d${v.n}-obzvon-375.webp" alt="Вариант ${v.n}, обзвон, телефон 375 px" loading="lazy"><span>Телефон</span></button>
      </div>
      <div class="dz-act"><a class="btn primary" href="?dizain=${v.n}#moy-den" data-open="${v.n}">${ic('arrow-up-right')}Открыть этот вариант</a><a class="btn" href="?dizain=${v.n}&tur=1#moy-den" data-tourv="${v.n}">${ic('play')}Тур в этом варианте</a></div>
    </article>`;
    const html = `<div class="page-head"><div><h1>Выбрать дизайн</h1><div class="sub">Четыре варианта на одних и тех же данных. Сравнивайте три экрана: «Мой день», «Обзвон», «Карточка компании».</div></div></div>
      <div class="dz-grid" id="dz-grid">${VARIANTS.map(card).join('')}</div>
      <div class="dz-foot" id="dz-foot">${ic('message-square-text')}<b>Напишите номер варианта и что взять из других.</b></div>`;
    return {
      html, crumbs: ['Выбрать дизайн'], mount: v => {
        $$('[data-shot]', v).forEach(b => b.onclick = () => {
          const ov = document.createElement('div'); ov.className = 'overlay dz-zoom'; ov.id = 'modal';
          ov.innerHTML = `<button class="btn icon dz-close" aria-label="Закрыть">${ic('x')}</button><img src="${b.dataset.shot}" alt="">`;
          document.body.appendChild(ov); A.icons();
          ov.onclick = () => A.closeModal();
        });
      },
    };
  };

  /* плашку «Выбрать дизайн» на главной убрали 06.11 (упрощение): выбор в меню пользователя */

  /* ---------- вариант 3: таймер звонка (только вид) ---------- */
  if (N === 3) {
    const starts = {};
    const sync = () => {
      const top = $('.dial-top'); if (!top) return;
      const name = ($('#dial-company .co-name') || {}).textContent || '';
      if (!name) return;
      if (!starts[name]) { Object.keys(starts).forEach(k => delete starts[k]); starts[name] = Date.now(); }
      const s = Math.floor((Date.now() - starts[name]) / 1000);
      const txt = String(Math.floor(s / 60)).padStart(2, '0') + ':' + String(s % 60).padStart(2, '0');
      let t = $('#call-timer');
      if (!t) {
        t = document.createElement('div'); t.id = 'call-timer'; t.className = 'call-timer';
        t.innerHTML = `${ic('timer')}<span id="call-timer-v"></span><small>на линии</small>`;
        top.appendChild(t); A.icons();
      }
      const v = $('#call-timer-v'); if (v) v.textContent = txt;
    };
    new MutationObserver(() => { if (!$('#call-timer')) sync(); }).observe(document.documentElement, { childList: true, subtree: true });
    setInterval(sync, 1000);
  }

  /* ---------- вариант 4: свайп влево = «Пропустить» (то же, что кнопка) ---------- */
  if (N === 4) {
    let sx = 0, sy = 0, el = null, id = null;
    document.addEventListener('pointerdown', e => {
      const c = e.target.closest && e.target.closest('#dial-company');
      if (!c || /input|textarea|select/i.test(e.target.tagName)) { el = null; return; }
      el = c; sx = e.clientX; sy = e.clientY; id = e.pointerId;
    });
    document.addEventListener('pointermove', e => {
      if (!el || e.pointerId !== id) return;
      const dx = e.clientX - sx, dy = e.clientY - sy;
      if (Math.abs(dx) > 12 && Math.abs(dx) > Math.abs(dy)) { el.style.transition = 'none'; el.style.transform = `translateX(${Math.max(-140, Math.min(40, dx))}px)`; el.style.opacity = String(1 - Math.min(.5, Math.abs(dx) / 300)); }
    });
    const end = e => {
      if (!el || e.pointerId !== id) return;
      const dx = e.clientX - sx, dy = e.clientY - sy, c = el; el = null;
      c.style.transition = ''; c.style.transform = ''; c.style.opacity = '';
      if (dx < -70 && Math.abs(dy) < 60) { const b = $('#view [data-skip]'); if (b) b.click(); }
    };
    document.addEventListener('pointerup', end);
    document.addEventListener('pointercancel', end);
  }

  /* ---------- тур в выбранном варианте: ?dizain=N&tur=1 ---------- */
  try {
    if (/[?&]tur=1\b/.test(location.search)) {
      const u = new URL(location.href); u.searchParams.delete('tur'); history.replaceState(null, '', u.pathname + u.search + u.hash);
      document.addEventListener('DOMContentLoaded', () => setTimeout(() => A.startTour && A.startTour(), 700));
    }
  } catch (e) { }
})();
