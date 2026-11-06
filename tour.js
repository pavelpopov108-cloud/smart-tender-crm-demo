/* Тур «День Сергея»: макет сам переходит по экранам и нажимает кнопки */
(function () {
  const A = window.App, { $, ic } = A;
  const TOUR = [
    { route: 'planerka', sel: '#fn-wait_pod', title: 'Планёрка в 10:00', short: 'Цифры команды собраны сами',
      text: 'Цифры собраны из исходов звонков, отчёт никто не заполнял. Сейчас подборку ждут 6 клиентов. Запомните это число.' },
    { route: 'pirozhki', sel: '[data-pie="kzn-vent"]', title: 'Сергей выбирает пирожок', short: '«Казань, вентиляция»: срок, аванс, кто взял',
      text: '«Казань, вентиляция»: 18,4 млн ₽, аванс 30 %, до подачи 5 дней, никто не взял. Сергей нажимает «Беру».',
      before: () => A.setPieFilter('all'), act: () => A.takePie('kzn-vent') },
    { route: 'pirozhki', sel: '[data-pie="kzn-vent"]', title: 'Пирожок закреплён', short: 'Компании пирожка закреплены на 7 дней',
      text: 'Пирожок и 27 свободных компаний закреплены за Сергеем до 12.11. Остальные увидят «Занято» и не позвонят им второй раз.' },
    { route: 'obzvon-kzn-vent', sel: '#dial-company', title: 'Обзвон по очереди', short: 'Одна компания на экране, исход в один клик',
      text: 'На экране одна компания, её телефон и история касаний всех менеджеров. Не дозвонился: один клик, и сразу следующая.',
      before: () => A.resetDialUi(), act: () => A.recordOutcome('kzn-vent', 'k04', 'no_answer') },
    { route: 'obzvon-kzn-vent', sel: '#dnc-banner', title: 'Клиент в переговорах', short: 'Жёлтый «не звонить»: пропускаем',
      text: '«ТатКлимат» жёлтый: договор у Максима, решает директор. Кнопка звонка выключена. Сергей пропускает компанию.',
      act: () => A.skipCompany('kzn-vent', 'k03') },
    { route: 'obzvon-kzn-vent', sel: '#outcomes-panel', title: 'Интересный клиент', short: 'Исход и следующий шаг за два клика',
      text: '«Аэровент Поволжье» заинтересовался. Сергей жмёт «Интересно» и ставит следующий шаг на завтра 10:00. Без шага сделка покраснела бы.',
      before: () => A.setPendingOut('interest'),
      act: () => { A.resetDialUi(); A.recordOutcome('kzn-vent', 'k01', 'interest', { d: A.addDays(A.TODAY, 1), t: '10:00', nextText: 'Отправить подборку и договор' }); } },
    { route: 'kompaniya-k01', sel: '#btn-send', title: 'Запрос подборки', short: 'Профиль клиента уходит Павлу',
      text: 'В карточке вся история и следующий шаг. Сергей запрашивает подборку: профиль клиента уходит Павлу, этап меняется сам.',
      act: () => A.requestPodborka(A.co('k01'), 'Вентиляция, Казань и Татарстан, только с авансом') },
    { route: 'podborki', sel: '[data-req-co="k01"]', title: 'Павел видит запрос', short: 'Очередь подборок в одном месте',
      text: 'Запрос встал в очередь Павла с профилем и временем ожидания. Искать его в общем чате не нужно.' },
    { route: 'planerka', sel: '#fn-wait_pod', title: 'Утром на планёрке', short: 'Цифра изменилась сама',
      text: '«Ждут подборку» теперь 7, а у Сергея в таблице «Сегодня» 2 новых звонка и 1 интересный. Никто ничего не считал руками.',
      before: () => A.setTableMode('today'), ring2: '#tr-sergey' },
  ];
  A.TOUR = TOUR;

  let idx = -1, ring, pop, ring2;
  function clear() { [ring, pop, ring2].forEach(e => e && e.remove()); ring = pop = ring2 = null; window.removeEventListener('resize', place); window.removeEventListener('scroll', place, true); }
  function end(done) { clear(); idx = -1; if (done) A.toast('Тур закончен. Данные сбросить: меню пользователя справа сверху', 'flag'); }
  function place() {
    const s = TOUR[idx]; if (!s || !ring) return;
    const el = document.querySelector(s.sel);
    if (!el) { ring.style.opacity = 0; return; }
    const r = el.getBoundingClientRect(), p = 6;
    Object.assign(ring.style, { opacity: 1, top: r.top - p + 'px', left: r.left - p + 'px', width: r.width + 2 * p + 'px', height: r.height + 2 * p + 'px' });
    if (ring2) { const e2 = document.querySelector(s.ring2); if (e2) { const q = e2.getBoundingClientRect(); Object.assign(ring2.style, { top: q.top - 3 + 'px', left: q.left - 3 + 'px', width: q.width + 6 + 'px', height: q.height + 6 + 'px' }); } }
    if (window.innerWidth <= 760) { const ph = pop.offsetHeight, vh = window.innerHeight; const atTop = r.bottom > vh - ph - 90 && r.top > ph + 70; pop.classList.toggle('at-top', atTop); return; }
    const pw = pop.offsetWidth, ph = pop.offsetHeight, vw = window.innerWidth, vh = window.innerHeight;
    let top = r.bottom + 14, left = Math.min(Math.max(12, r.left), vw - pw - 12);
    if (top + ph > vh - 12) top = r.top - ph - 14;
    if (top < 12) { top = Math.min(vh - ph - 12, Math.max(12, r.top + 12)); left = r.right + 14 + pw < vw ? r.right + 14 : Math.max(12, r.left - pw - 14); }
    pop.style.top = top + 'px'; pop.style.left = left + 'px';
  }
  function show(i) {
    idx = i; const s = TOUR[i];
    if (s.before) s.before();
    const h = '#' + s.route;
    if (location.hash !== h) location.hash = h; else A.render();
    if (!ring) { ring = document.createElement('div'); ring.className = 'tour-ring'; document.body.appendChild(ring); }
    if (!pop) { pop = document.createElement('div'); pop.className = 'tour-pop'; pop.setAttribute('role', 'dialog'); document.body.appendChild(pop); window.addEventListener('resize', place); window.addEventListener('scroll', place, true); }
    if (ring2) { ring2.remove(); ring2 = null; }
    if (s.ring2) { ring2 = document.createElement('div'); ring2.className = 'tour-ring'; ring2.style.boxShadow = '0 0 0 3px var(--accent)'; document.body.appendChild(ring2); }
    ring.style.opacity = 0;
    pop.innerHTML = `<div class="row" style="justify-content:space-between"><span class="stepn">Шаг ${i + 1} из ${TOUR.length}</span><button class="btn sm icon ghost" data-tq aria-label="Закрыть тур">${ic('x')}</button></div>
      <h4>${s.title}</h4><p>${s.text}</p>
      <div class="row"><span class="tour-dots">${TOUR.map((_, j) => `<i class="${j === i ? 'on' : ''}"></i>`).join('')}</span>
      <button class="btn primary sm" data-tn>${i === TOUR.length - 1 ? 'Закончить' : (s.act ? 'Нажать и дальше' : 'Дальше')} ${ic(i === TOUR.length - 1 ? 'check' : 'arrow-right')}</button></div>`;
    A.icons();
    pop.querySelector('[data-tq]').onclick = () => end(false);
    pop.querySelector('[data-tn]').onclick = () => { if (s.act) s.act(); if (i === TOUR.length - 1) end(true); else show(i + 1); };
    setTimeout(() => {
      const el = document.querySelector(s.sel);
      if (el) {
        const r = el.getBoundingClientRect(); const mob = window.innerWidth <= 760;
        const target = window.scrollY + r.top - (mob ? 72 : Math.max(80, (window.innerHeight - r.height) / 2 - 80));
        window.scrollTo({ top: Math.max(0, target), behavior: 'instant' in window ? 'instant' : 'auto' });
        if (i === TOUR.length - 1) el.classList.add('flash');
      }
      setTimeout(place, 60);
    }, 420);
  }
  A.startTour = function () {
    end(false);
    A.reset(); A.resetDialUi(); A.setTableMode('yesterday'); A.setPieFilter('all');
    A.shell();
    show(0);
  };
  document.addEventListener('keydown', e => { if (idx >= 0 && e.key === 'Escape') end(false); });
})();
