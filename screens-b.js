/* Экраны 5–10 и «Почему так» */
(function () {
  const A = window.App, { D, $, $$, esc, ic, av, dm, money, person, pie, pieName, co, stageBadge } = A;

  /* ---------- 5. Карточка компании ---------- */
  let feedSent = false;
  A.screens.kompaniya = function (id) {
    const S = A.S, c = co(id);
    if (!c) return { html: `<div class="panel"><div class="empty" style="padding:56px 20px"><div class="ico">${ic('building-2')}</div><b>Компания не найдена</b><span>Возможно, ссылка устарела. Найдите компанию через поиск.</span><button class="btn" onclick="App.openPalette()">${ic('search')}Поиск</button></div></div>`, crumbs: ['Клиенты', 'Не найдено'] };
    const p = pie(c.pie), lockedOther = A.isLocked(c);
    const sinceDays = c.since ? A.dayDiff(c.since) : null;
    const sent = c.history.filter(h => ['pie', 'pod', 'contract', 'material'].includes(h.out));
    const html = `
    ${c.dnc ? `<div class="dnc-banner">${ic('hand')}<div><b>Не звонить с чужих пирожков: клиент в переговорах. Владелец: ${person(c.owner).name}</b><span>${esc(c.dnc)}</span></div></div>` : ''}
    <section class="panel" style="margin-bottom:16px">
      <div class="card-head">
        <div class="ttl"><div class="row" style="gap:8px;flex-wrap:wrap;margin-bottom:6px">${stageBadge(c.stage)}${c.dnc ? '<span class="badge dnc">Не звонить</span>' : ''}${c.won ? '<span class="badge win">Победа</span>' : ''}${p ? `<span class="tag">${ic('croissant')}&nbsp;${pieName(p)}</span>` : ''}</div>
          <h1 style="font-size:22px;font-weight:800;letter-spacing:-.02em">${esc(c.name)}</h1>
          <div class="co-meta"><span>${ic('hash')}ИНН <span class="mono">${c.inn}</span></span><span>${ic('map-pin')}${c.city}</span><span>${ic('phone')}${A.phoneHtml(c, 'mono')}</span><span>${ic('user')}${esc(c.contact.name)}, ${c.contact.role}</span><span class="turn">${ic('banknote')}Оборот <input class="input inline" id="turnover" type="number" min="0" value="${c.turnover}" aria-label="Оборот, млн ₽"> млн ₽${c.turnover > 100 ? ' <span class="badge hot" id="big-badge">крупная, не наша ЦА</span>' : ''}</span></div>
          ${A.needPhone(c) || c.badPhone ? `<div class="row bad-phone-row" style="gap:8px;margin-top:8px;flex-wrap:wrap">${A.needPhone(c) ? `<input class="input" id="np-in" placeholder="Новый номер" style="width:180px"><button class="btn sm" id="np-save">Сохранить номер</button>` : ''}</div>` : ''}</div>
        <div class="row" style="gap:8px;flex-wrap:wrap">
          ${(c.dnc && c.owner !== S.me) || A.needPhone(c) ? `<button class="btn" disabled data-tip="${A.needPhone(c) ? 'Номер не тот: найдите новый' : 'Клиент в переговорах у коллеги'}">${ic('phone')}Позвонить</button>` : `<a class="btn" href="tel:${c.phone.replace(/[^\d+]/g, '')}">${ic('phone')}Позвонить</a>`}
          ${A.msgrBtns()}
          ${A.needPhone(c) || c.badPhone ? `<span class="rel"><button class="btn" id="find-phone">${ic('search')}Искать номер${ic('chevron-down')}</button></span>` : ''}
          <span class="rel"><button class="btn primary" id="btn-send" aria-haspopup="menu">${ic('send')}Отправить${ic('chevron-down')}</button>
            <div class="menu" id="send-menu" role="menu" hidden>
              <button class="mi" id="btn-presentation">${ic('presentation')}Презентацию</button>
              <button class="mi" id="btn-pie">${ic('croissant')}Пирожок</button>
              <button class="mi" id="btn-podborka">${ic('list-checks')}Запрос подборки Павлу</button>
              <button class="mi" id="btn-contract">${ic('file-signature')}Договор</button>
            </div></span>
        </div>
      </div>
      <div class="facts">
        <div class="fact"><div class="l">Этап</div><div class="v">${A.stage(c.stage).name}${sinceDays != null ? `<span class="faint" style="font-weight:600">${A.days(sinceDays)}</span>` : ''}</div></div>
        <div class="fact"><div class="l">Владелец</div><div class="v">${c.owner ? av(c.owner, 'xs') + person(c.owner).name + (c.lockUntil ? `<span class="faint" style="font-weight:600">до ${dm(c.lockUntil)}</span>` : '') : '<span class="faint">Свободна</span>'}${lockedOther && !c.dnc ? '<button class="btn sm" id="ask-transfer">Попросить передать</button>' : ''}</div></div>
        <div class="fact ${A.noNext(c) ? 'hot' : ''}" id="fact-next"><div class="l">Следующий шаг</div><div class="v">${c.next ? `<span class="ell">${A.relDay(c.next.d)} ${c.next.t} · ${esc(c.next.text)}</span>` : (A.noNext(c) ? `<span>Не назначен</span>` : '<span class="faint">Не нужен</span>')}<button class="btn sm" id="set-next" style="margin-left:auto">${c.next ? 'Изменить' : 'Назначить'}</button></div></div>
      </div>
    </section>
    <div class="grid g-main">
      <section class="panel" id="feed-panel"><div class="panel-h"><h2>${ic('history')}Лента касаний</h2><span class="meta"><span class="seg" role="tablist"><button class="${feedSent ? '' : 'on'}" data-fs="0">Все <span class="num">${c.history.length}</span></button><button class="${feedSent ? 'on' : ''}" data-fs="1" id="feed-sent">Что отправлено <span class="num">${sent.length}</span></button></span></span></div>
        <div class="panel-b"><div class="row" style="margin-bottom:6px;flex-wrap:wrap"><button class="btn" id="paste-chat" style="flex:none">${ic('clipboard-paste')}Вставить из переписки</button></div><div class="row" style="margin-bottom:6px"><input class="input" id="note-in" placeholder="Заметка: что сказал клиент, о чём договорились"><button class="btn" id="note-add">${ic('plus')}<span class="hide-mob">Добавить</span></button></div>
          ${(feedSent ? sent : c.history).length ? A.feed(feedSent ? sent : c.history) : feedSent ? `<div class="empty"><div class="ico">${ic('send')}</div><b>Ничего не отправляли</b><span>Пирожки, подборки, договоры и презентации появятся здесь с датой и автором.</span></div>` : `<div class="empty"><div class="ico">${ic('history')}</div><b>Касаний ещё не было</b><span>Звонки, письма и отправленные пирожки появятся здесь.</span></div>`}</div></section>
      <div class="stack" style="gap:16px">
        <section class="panel" id="q-panel"><div class="panel-h"><h2>${ic('circle-help')}Вопросы специалисту</h2><span class="meta">${av('pavel', 'xs')}Павел</span></div>
          <div class="panel-b stack" style="gap:10px">
            ${c.questions.map(q => `<div class="qa ${q.a ? '' : 'wait'}"><div class="who">${av(q.by, 'xs')}${person(q.by).name} · ${A.relDay(q.d)} ${q.t}</div><div class="q">${esc(q.q)}</div>
              ${q.a ? `<div class="a">${esc(q.a)}</div><div class="who">${av('pavel', 'xs')}Ответ Павла, ${A.relDay(q.aD)} ${q.aT}</div>` : `<div class="who" style="color:var(--accent-text)">${ic('loader')}Ответа пока нет. Он появится здесь и в ленте.</div>`}</div>`).join('')}
            ${c.questions.length ? '' : `<p class="muted" style="font-size:12.5px">Клиент спросил то, чего вы не знаете? Скажите «уточню и перезвоню» и задайте вопрос здесь. Ответ останется в карточке.</p>`}
            <textarea class="input" id="q-in" rows="2" placeholder="Например: нужен ли СРО на эту закупку?"></textarea>
            <div class="row" style="justify-content:flex-end"><button class="btn" id="q-ask">${ic('send')}Задать вопрос Павлу</button></div>
          </div></section>
        <section class="panel"><div class="panel-h"><h2>${ic('clipboard-list')}Профиль для подборки</h2><span class="meta"><button class="btn sm ghost" id="prof-edit">${ic('pencil')}Изменить</button></span></div>
          <div class="panel-b">${c.profile ? `<dl class="kv"><dt>Регионы</dt><dd>${c.profile.regions.map(r => `<span class="tag">${esc(r)}</span>`).join('')}</dd><dt>Виды работ</dt><dd>${c.profile.works.map(r => `<span class="tag">${esc(r)}</span>`).join('')}</dd><dt>Лицензии</dt><dd>${c.profile.licenses.map(r => `<span class="tag">${esc(r)}</span>`).join('')}</dd><dt>Сумма от</dt><dd>${c.profile.min}</dd><dt>Аванс</dt><dd>${c.profile.advance}</dd></dl>`
            : `<div class="empty" style="padding:14px"><b>Профиль не уточнён</b><span>Регионы, виды работ и допуски нужны Павлу для подборки.</span><button class="btn sm" id="prof-fill">Заполнить</button></div>`}</div></section>
      </div>
    </div>`;
    return {
      crumbs: ['<a href="#klienty">Клиенты</a>', esc(c.name)], html, mount: v => {
        const sm = $('#send-menu', v);
        $('#btn-send', v).onclick = e => {
          e.stopPropagation(); sm.hidden = !sm.hidden;
          if (!sm.hidden) setTimeout(() => document.addEventListener('click', function h() { sm.hidden = true; document.removeEventListener('click', h); }), 0);
        };
        $$('[data-fs]', v).forEach(b => b.onclick = () => { feedSent = b.dataset.fs === '1'; A.render({ keepScroll: true }); });
        $('#btn-pie', v).onclick = () => sendPieModal(c);
        $('#btn-podborka', v).onclick = () => podborkaModal(c);
        $('#btn-contract', v).onclick = () => A.contractModal(c);
        $('#btn-presentation', v).onclick = () => A.materialModal(c, 'presentation');
        $('#paste-chat', v).onclick = () => A.pasteModal(c);
        const fp = $('#find-phone', v); if (fp) fp.onclick = e => { e.stopPropagation(); A.searchMenu(c, e.currentTarget); };
        $('#turnover', v).onchange = e => { c.turnover = +e.target.value || 0; A.save(); A.render({ keepScroll: true }); };
        const nps = $('#np-save', v); if (nps) nps.onclick = () => { const x = $('#np-in', v).value.trim(); if (!x) { A.toast('Впишите новый номер', 'info'); return; } c.phone = x; A.addHist(c, { type: 'call', out: 'note', text: 'Найден новый номер: ' + x }); A.save(); A.render(); A.toast('Новый номер сохранён', 'phone'); };
        $('#set-next', v).onclick = () => nextStepModal(c);
        const at = $('#ask-transfer', v); if (at) at.onclick = () => A.toast(`${person(c.owner).name} получит просьбу передать компанию`, 'send');
        const pf = $('#prof-fill', v) || $('#prof-edit', v); if (pf) pf.onclick = () => profileModal(c);
        const pe = $('#prof-edit', v); if (pe) pe.onclick = () => profileModal(c);
        $('#note-add', v).onclick = () => { const t = $('#note-in', v).value.trim(); if (!t) return; A.addHist(c, { type: 'note', out: 'note', text: t }); A.save(); A.render(); A.toast('Заметка добавлена в ленту'); };
        $('#q-ask', v).onclick = () => {
          const t = $('#q-in', v).value.trim(); if (!t) { A.toast('Напишите вопрос', 'info'); return; }
          const q = { q: t, by: S.me, d: A.TODAY, t: A.hhmm(), a: null }; c.questions.push(q);
          A.addHist(c, { type: 'question', out: 'question', text: 'Вопрос Павлу: ' + t }); A.save(); A.render(); A.toast('Вопрос ушёл Павлу. Ответ появится в карточке', 'send');
          setTimeout(() => { q.a = 'Вопрос принят. Проверю извещение и требования, отвечу здесь до 14:00. Клиенту скажи: «уточню и перезвоню сегодня».'; q.aD = A.TODAY; q.aT = A.hhmm(); A.addHist(c, { who: 'pavel', type: 'question', out: 'answer', text: 'Павел: ' + q.a }); A.save(); if (location.hash === '#kompaniya-' + c.id) A.render(); A.toast('Ответ Павла по «' + c.name + '»', 'message-square-reply'); }, 6000);
        };
      },
    };
  };

  function stageAtLeast(c, s) { const o = D.STAGES.map(x => x.id); return o.indexOf(c.stage) >= o.indexOf(s) && c.stage !== 'refused'; }
  function moveStage(c, s) { if (!stageAtLeast(c, s)) { c.stage = s; c.since = A.TODAY; } }

  function sendPieModal(c) {
    const S = A.S;
    const sentMap = {}; c.history.filter(h => h.out === 'pie').forEach(h => { if (!sentMap[h.pie]) sentMap[h.pie] = h; });
    let chosen = null;
    A.modal({
      title: 'Отправить пирожок', sub: `${esc(c.name)} · ${c.city}`, ok: 'Отправить', wide: true,
      body: `<div class="stack">${S.pies.map(p => { const s = sentMap[p.id]; return `<label class="pick ${s ? 'warned' : ''}" data-p="${p.id}"><input type="radio" name="pp" value="${p.id}"><div style="flex:1;min-width:0"><div style="font-weight:750">${pieName(p)}</div><div class="faint" style="font-size:12px">${money(p.amount, true)}${p.advance ? ', аванс ' + p.advance + ' %' : ''} · до ${dm(p.deadline)}</div>${s ? `<div style="font-size:12px;color:var(--dnc-text);font-weight:700;margin-top:3px">Уже отправлено ${dm(s.d)}, отправитель: ${person(s.who).name}</div>` : ''}</div></label>`; }).join('')}</div><div id="pp-warn"></div>`,
      onMount: o => $$('input[name=pp]', o).forEach(r => r.onchange = () => {
        chosen = r.value; $$('.pick', o).forEach(x => x.classList.toggle('on', x.dataset.p === chosen));
        const s = sentMap[chosen]; $('#pp-warn', o).innerHTML = s ? `<div class="warn-line" style="margin:0;background:var(--dnc-bg);border-color:var(--dnc-border);color:var(--dnc-text)">${ic('triangle-alert')}<span>Этот пирожок клиент уже получал ${dm(s.d)} (отправитель: ${person(s.who).name}). Отправить повторно?</span></div>` : '';
        $('[data-ok]', o).textContent = s ? 'Отправить повторно' : 'Отправить'; A.icons();
      }),
      onOk: () => {
        if (!chosen) { A.toast('Выберите пирожок', 'info'); return false; }
        A.addHist(c, { type: 'send', out: 'pie', text: 'Отправлен пирожок', pie: chosen }); moveStage(c, 'pie_sent'); if (!c.owner) c.owner = S.me; A.save(); A.render(); A.toast(`Пирожок «${pieName(pie(chosen))}» отправлен. Записано в ленту`, 'send');
      },
    });
  }
  A.requestPodborka = function (c, note) {
    const S = A.S;
    if (!c.profile) { const p = pie(c.pie); c.profile = { regions: [p.city + ' и область'], works: c.works, licenses: c.licenses.length ? c.licenses : ['Нет'], min: '3 млн ₽', advance: 'Только с авансом' }; }
    S.pods.push({ id: 'pd' + Date.now(), co: c.id, by: S.me, at: new Date(A.now().getTime() - 60000).toISOString().slice(0, 19), status: 'new', note: note || (c.profile.works.join(', ') + ', ' + c.profile.regions.join(', ')), fresh: true });
    A.addHist(c, { type: 'pod', out: 'request', text: 'Запрошена подборка у Павла' + (note ? ': ' + note : '') });
    c.stage = 'wait_pod'; c.since = A.TODAY; c.next = { d: A.addDays(A.TODAY, 1), t: '12:00', text: 'Отправить подборку клиенту' };
    A.save();
  };
  function podborkaModal(c) {
    const S = A.S;
    const ex = S.pods.find(p => p.co === c.id && p.status !== 'sent');
    if (ex) { A.toast('Подборка уже в очереди у Павла: ' + (ex.status === 'new' ? 'новая' : 'собирает'), 'info'); return; }
    const pr = c.profile || { regions: [c.city + ' и область'], works: c.works, licenses: c.licenses.length ? c.licenses : ['Нет'] };
    A.modal({
      title: 'Запросить подборку у Павла', sub: esc(c.name), ok: 'Отправить запрос',
      body: `<dl class="kv"><dt>Регионы</dt><dd>${pr.regions.map(r => `<span class="tag">${esc(r)}</span>`).join('')}</dd><dt>Виды работ</dt><dd>${pr.works.map(r => `<span class="tag">${esc(r)}</span>`).join('')}</dd><dt>Лицензии</dt><dd>${pr.licenses.map(r => `<span class="tag">${esc(r)}</span>`).join('')}</dd></dl>
        <div class="field"><label for="pd-note">Что ещё важно Павлу</label><textarea class="input" id="pd-note" rows="2" placeholder="Например: только с авансом, до 15 млн"></textarea></div>
        <span class="faint" style="font-size:12px">Запрос встанет в очередь Павла с профилем. Клиент перейдёт на этап «Ждёт подборку».</span>`,
      onOk: o => { A.requestPodborka(c, $('#pd-note', o).value.trim()); A.render(); A.toast('Запрос ушёл Павлу. Клиент ждёт подборку', 'send'); },
    });
  }
  function nextStepModal(c) {
    const tmr = A.addDays(A.TODAY, 1);
    A.modal({
      title: 'Следующий шаг', sub: esc(c.name) + ': без шага карточка краснеет и попадает в «Горит»', ok: 'Сохранить',
      body: `<div class="field"><label for="ns-text">Что сделать</label><input class="input" id="ns-text" value="${esc(c.next ? c.next.text : 'Перезвонить и узнать решение')}"></div>
        <div class="chips">${[[A.TODAY, '16:00', 'Сегодня 16:00'], [tmr, '10:00', 'Завтра 10:00'], [tmr, '15:00', 'Завтра 15:00'], [A.addDays(A.TODAY, 4), '10:00', 'Пн 10:00']].map(x => `<button class="chip" data-ns="${x[0]}|${x[1]}">${x[2]}</button>`).join('')}</div>
        <div class="row"><input type="date" class="input" id="ns-d" value="${c.next ? c.next.d : tmr}"><input type="time" class="input" id="ns-t" value="${c.next ? c.next.t : '10:00'}" style="width:120px"></div>`,
      onMount: o => $$('[data-ns]', o).forEach(b => b.onclick = () => { const [d, t] = b.dataset.ns.split('|'); $('#ns-d', o).value = d; $('#ns-t', o).value = t; $$('[data-ns]', o).forEach(x => x.classList.toggle('on', x === b)); }),
      onOk: o => { c.next = { d: $('#ns-d', o).value, t: $('#ns-t', o).value, text: $('#ns-text', o).value || 'Связаться' }; A.save(); A.render(); A.toast('Следующий шаг назначен: ' + A.relDay(c.next.d) + ' ' + c.next.t, 'calendar-check'); },
    });
  }
  function profileModal(c) {
    const pr = c.profile || { regions: [c.city + ' и область'], works: c.works.slice(), licenses: c.licenses.length ? c.licenses.slice() : [], min: '3 млн ₽', advance: 'Только с авансом' };
    const W = ['Вентиляция', 'Кондиционирование', 'Кровля', 'Монтаж', 'Металлоконструкции', 'Пожарная безопасность', 'Электромонтаж', 'Слаботочка', 'Общестрой'];
    const L = ['СРО строителей', 'СРО проектировщиков', 'Лицензия МЧС'];
    A.modal({
      title: 'Профиль для подборки', sub: esc(c.name), ok: 'Сохранить',
      body: `<div class="field"><label for="pr-reg">Регионы</label><input class="input" id="pr-reg" value="${esc(pr.regions.join(', '))}"></div>
        <div class="field"><label>Виды работ</label><div class="chips">${W.map(w => `<button class="chip ${pr.works.includes(w) ? 'on' : ''}" data-w="${w}">${w}</button>`).join('')}</div></div>
        <div class="field"><label>Лицензии и допуски</label><div class="chips">${L.map(w => `<button class="chip ${pr.licenses.includes(w) ? 'on' : ''}" data-l="${w}">${w}</button>`).join('')}</div></div>
        <div class="row"><div class="field" style="flex:1"><label for="pr-min">Сумма от</label><input class="input" id="pr-min" value="${esc(pr.min)}"></div><div class="field" style="flex:1"><label for="pr-adv">Аванс</label><select class="input" id="pr-adv"><option>Только с авансом</option><option ${pr.advance !== 'Только с авансом' ? 'selected' : ''}>Не важно</option></select></div></div>`,
      onMount: o => $$('[data-w],[data-l]', o).forEach(b => b.onclick = () => b.classList.toggle('on')),
      onOk: o => {
        c.profile = { regions: $('#pr-reg', o).value.split(',').map(s => s.trim()).filter(Boolean), works: $$('[data-w].on', o).map(b => b.dataset.w), licenses: $$('[data-l].on', o).map(b => b.dataset.l), min: $('#pr-min', o).value, advance: $('#pr-adv', o).value };
        if (!c.profile.licenses.length) c.profile.licenses = ['Нет'];
        if (['interest', 'pie_sent'].includes(c.stage)) { c.stage = 'profile'; c.since = A.TODAY; }
        A.addHist(c, { type: 'call', out: 'profile', text: 'Уточнён профиль: ' + c.profile.works.join(', ') });
        A.save(); A.render(); A.toast('Профиль сохранён');
      },
    });
  }

  /* ---------- 6. Клиенты (канбан) ---------- */
  let kbOwner = 'all', kbNoStep = false, kbQ = '';
  const AFTER = ['signed', 'accred', 'participation', 'result'];
  const COLS = ['interest', 'pie_sent', 'profile', 'wait_pod', 'pod_sent', 'contract_sent', ...AFTER];
  const BOARD = ['interest', 'pie_sent', 'profile', 'wait_pod', 'pod_sent', 'contract_sent', 'after'];
  A.screens.klienty = function () {
    const S = A.S;
    let list = S.cos.filter(c => COLS.includes(c.stage));
    if (kbOwner !== 'all') list = list.filter(c => c.owner === kbOwner);
    if (kbNoStep) list = list.filter(A.noNext);
    if (kbQ) list = list.filter(c => (c.name + c.city + c.inn).toLowerCase().includes(kbQ.toLowerCase()));
    const card = c => {
      const d = A.dayDiff(c.since);
      return `<a class="kc ${c.dnc ? 'dnc' : ''}" draggable="true" data-id="${c.id}" href="#kompaniya-${c.id}">
        <div class="row" style="align-items:flex-start"><span class="nm" style="flex:1;min-width:0">${esc(c.name.replace(/^ООО /, ''))}</span>${av(c.owner, 'xs')}</div>
        <div class="ln">${ic('map-pin')}<span class="ell">${c.city}</span><span style="margin-left:auto" class="num ${d > 5 ? '' : 'faint'}" data-tip="Дней на этапе">${d} дн</span></div>
        ${AFTER.includes(c.stage) ? `<span class="faint" style="font-size:12px">${A.stage(c.stage).name}</span>` : ''}
        ${c.dnc ? '<span class="badge dnc" style="align-self:flex-start">Не звонить</span>' : ''}${c.won ? '<span class="badge win" style="align-self:flex-start">Победа</span>' : ''}
        <div class="next ${c.next ? '' : (A.noNext(c) ? 'none' : '')}">${c.next ? `${ic('calendar-check')}<span class="ell">${A.relDay(c.next.d)} ${c.next.t} · ${esc(c.next.text)}</span>` : (A.noNext(c) ? `${ic('triangle-alert')}Нет следующего шага` : `<span class="faint">Сделка закрыта</span>`)}</div></a>`;
    };
    const html = `
    <div class="page-head"><div><h1>Клиенты</h1><div class="sub">${list.length} в работе. Перетащите карточку, чтобы сменить этап. Без следующего шага карточка краснеет.</div></div>
      <div class="actions"><input class="input" id="kb-q" placeholder="Поиск по названию, городу, ИНН" value="${esc(kbQ)}" style="width:250px;max-width:100%"><select class="input" id="kb-ow" aria-label="Менеджер" style="width:auto"><option value="all">Все менеджеры</option>${D.MANAGERS.map(m => `<option value="${m.id}" ${kbOwner === m.id ? 'selected' : ''}>${m.name}</option>`).join('')}</select><button class="btn ${kbNoStep ? 'primary' : ''}" id="kb-ns">${ic('triangle-alert')}Без шага</button></div></div>
    <div class="board" id="board">${BOARD.map(s => { const items = list.filter(c => s === 'after' ? AFTER.includes(c.stage) : c.stage === s); const st = s === 'after' ? { name: 'После подписания', c: A.stage('signed').c } : A.stage(s); return `<div class="col" data-col="${s}"><div class="col-h"><span class="badge stage" style="--sc:var(--st-${st.c});padding:0;border:0;background:none;height:auto"><span class="dot"></span></span>${st.name}<span class="n">${items.length}</span></div><div class="col-b">${items.length ? items.map(card).join('') : '<div class="col-empty">Пусто. Перетащите сюда</div>'}</div></div>`; }).join('')}</div>`;
    return {
      html, mount: v => {
        $('#kb-ow', v).onchange = e => { kbOwner = e.target.value; A.render(); };
        $('#kb-ns', v).onclick = () => { kbNoStep = !kbNoStep; A.render(); };
        const q = $('#kb-q', v); q.oninput = () => { kbQ = q.value; clearTimeout(q._t); q._t = setTimeout(() => { A.render(); const n = $('#kb-q'); n.focus(); n.setSelectionRange(n.value.length, n.value.length); }, 250); };
        let dragId = null;
        $$('.kc', v).forEach(k => {
          k.addEventListener('dragstart', e => { dragId = k.dataset.id; k.classList.add('drag'); e.dataTransfer.effectAllowed = 'move'; e.dataTransfer.setData('text/plain', dragId); });
          k.addEventListener('dragend', () => k.classList.remove('drag'));
        });
        $$('.col', v).forEach(col => {
          col.addEventListener('dragover', e => { e.preventDefault(); col.classList.add('over'); });
          col.addEventListener('dragleave', e => { if (!col.contains(e.relatedTarget)) col.classList.remove('over'); });
          col.addEventListener('drop', e => {
            e.preventDefault(); col.classList.remove('over');
            const c = co(dragId || e.dataTransfer.getData('text/plain')); let s = col.dataset.col;
            if (s === 'after') { if (c && AFTER.includes(c.stage)) return; s = 'signed'; }
            if (!c || c.stage === s) return;
            c.stage = s; c.since = A.TODAY; A.addHist(c, { type: 'stage', out: 'stage', text: 'Этап: ' + A.stage(s).name });
            if (s === 'contract_sent' && !c.dnc) c.dnc = `Договор отправлен ${dm(A.TODAY)}, владелец: ${person(c.owner).name}. С других пирожков не звонить.`;
            A.save(); A.render({ keepScroll: true }); A.toast(`${c.name}: ${A.stage(s).name}`, 'move-right');
          });
        });
      },
    };
  };

  /* ---------- 7. Подборки ---------- */
  let podTab = 'queue';
  A.screens.podborki = function () {
    const S = A.S;
    const queue = S.pods.filter(p => p.status !== 'sent').sort((a, b) => a.at.localeCompare(b.at));
    const sent = S.pods.filter(p => p.status === 'sent').sort((a, b) => b.sentAt.localeCompare(a.sentAt));
    const list = podTab === 'queue' ? queue : podTab === 'new' ? queue.filter(p => p.status === 'new') : podTab === 'collecting' ? queue.filter(p => p.status === 'collecting') : sent;
    const avgH = queue.length ? Math.round(queue.reduce((a, p) => a + A.ageOf(p.at).h, 0) / queue.length) : 0;
    const oldest = queue[0];
    const row = p => {
      const c = co(p.co), ag = A.waitAge(p.at);
      const st = p.status === 'new' ? '<span class="badge acc">Новая</span>' : p.status === 'collecting' ? `<span class="badge stage" style="--sc:var(--st-4)"><span class="dot"></span>Собираю</span>` : '<span class="badge">Отправлена</span>';
      return `<div class="req" data-req-co="${c.id}" ${p.fresh ? 'style="background:var(--accent-soft)"' : ''}>
        <div style="min-width:0"><a href="#kompaniya-${c.id}" class="ell" style="font-weight:750;display:block">${esc(c.name)}</a><span class="faint" style="font-size:12px">${c.city} · ИНН <span class="mono">${c.inn}</span></span></div>
        <div class="prof-col" style="min-width:0;font-size:12.5px"><div class="ell">${esc(p.note)}</div><div class="faint ell">${(c.profile ? c.profile.licenses : c.licenses).join(', ') || 'Без лицензий'}</div></div>
        <div class="who-col row" style="gap:6px">${av(p.by, 'xs')}<span>${person(p.by).name}</span></div>
        <div class="age-col">${p.status === 'sent' ? `<span class="faint" style="font-size:12px">${dm(p.sentAt.slice(0, 10))}, ${p.count} закупок</span>` : `<span class="age pod-timer ${ag.hot ? 'hot' : ''}" data-m="${ag.m}" data-tip="Запрос от ${dm(p.at.slice(0, 10))} ${p.at.slice(11, 16)}">${ic('clock')} ждёт ${ag.txt}</span>`}</div>
        <div class="act-col row" style="justify-content:flex-end;gap:6px"><span class="st-col">${st}</span>${p.status === 'new' ? `<button class="btn sm" data-collect="${p.id}">Беру</button>` : p.status === 'collecting' ? `<button class="btn sm primary" data-send="${p.id}">Отправлена</button>` : ''}</div></div>`;
    };
    const html = `
    <div class="page-head"><div><h1>Подборки</h1><div class="sub">Очередь Павла: все запросы менеджеров в одном месте${queue.length ? ` · среднее ожидание ${avgH >= 24 ? Math.floor(avgH / 24) + ' д ' + avgH % 24 + ' ч' : avgH + ' ч'}, цель меньше 1 дня` : ''}</div></div></div>
    <section class="panel"><div class="panel-h" style="flex-wrap:wrap"><span class="seg">${[['queue', 'В очереди', queue.length], ['new', 'Новые', queue.filter(p => p.status === 'new').length], ['collecting', 'Собираю', queue.filter(p => p.status === 'collecting').length], ['sent', 'Отправленные', sent.length]].map(([k, n, x]) => `<button class="${podTab === k ? 'on' : ''}" data-pt="${k}">${n} <span class="faint num">${x}</span></button>`).join('')}</span></div>
      ${list.length ? `<div class="req req-h hide-mob"><span>Клиент</span><span>Профиль</span><span class="who-col">Кто просил</span><span>${podTab === 'sent' ? 'Отправлена' : 'Ждёт'}</span><span style="text-align:right">Статус</span></div>${list.map(row).join('')}`
        : `<div class="empty"><div class="ico">${ic('check-check')}</div><b>${podTab === 'sent' ? 'Пока ничего не отправлено' : 'Здесь пусто'}</b><span>${podTab === 'sent' ? 'Отправленные подборки появятся здесь.' : 'Все запросы разобраны.'}</span></div>`}
    </section>`;
    return {
      html, mount: v => {
        $$('[data-pt]', v).forEach(b => b.onclick = () => { podTab = b.dataset.pt; A.render(); });
        A.every(30000, () => A.render({ keepScroll: true }));
        $$('[data-collect]', v).forEach(b => b.onclick = () => { const p = S.pods.find(x => x.id === b.dataset.collect); p.status = 'collecting'; A.save(); A.render(); A.toast('Подборка в сборке. Менеджер видит статус', 'list-checks'); });
        $$('[data-send]', v).forEach(b => b.onclick = () => {
          const p = S.pods.find(x => x.id === b.dataset.send); p.status = 'sent'; p.sentAt = A.now().toISOString().slice(0, 19); p.count = 7; p.fresh = false;
          const c = co(p.co); c.stage = 'pod_sent'; c.since = A.TODAY; c.next = { d: A.addDays(A.TODAY, 1), t: '11:00', text: 'Обсудить подборку с клиентом' };
          A.addHist(c, { who: 'pavel', type: 'send', out: 'pod', text: 'Подборка отправлена: 7 закупок' }); A.save(); A.render();
          A.toast(`${person(p.by).name} получит уведомление: подборка для «${c.name}» готова`, 'send');
        });
      },
    };
  };

  /* ---------- 8. Входящие ---------- */
  const REGION = { 'Казань': 'anastasia', 'Рязань': 'maxim', 'Улан-Удэ': 'irina', 'Санкт-Петербург': 'nikolay', 'Новосибирск': 'vitaliy', 'Тюмень': 'elyana' };
  const t0 = Date.now();
  function leadAgo(l) { return l.ago * 60 + Math.floor((Date.now() - t0) / 1000); }
  function fmtAgo(s) { const m = Math.floor(s / 60), ss = s % 60; return m >= 60 ? `${Math.floor(m / 60)} ч ${m % 60} мин` : `${m} мин ${String(ss).padStart(2, '0')} с`; }
  A.screens.vhodyashchie = function () {
    const S = A.S;
    const waiting = S.leads.filter(l => !l.assigned).sort((a, b) => b.ago - a.ago);
    const done = S.leads.filter(l => l.assigned);
    let rr = S.rr || 0;
    const suggest = l => S.leadMode === 'region' ? (REGION[l.city] || D.MANAGERS[0].id) : D.MANAGERS[(rr++) % D.MANAGERS.length].id;
    const html = `
    <div class="page-head"><div><h1>Входящие</h1><div class="sub">Заявки с Авито, сайта и звонков. Ответить нужно в течение 15 минут.</div></div>
      <div class="actions"><span class="faint" style="font-size:12.5px;align-self:center">Распределение:</span><span class="seg">${[['round', 'По кругу'], ['region', 'По региону']].map(([k, n]) => `<button class="${S.leadMode === k ? 'on' : ''}" data-lm="${k}">${n}</button>`).join('')}</span></div></div>
    <section class="panel" style="margin-bottom:16px"><div class="panel-h"><h2>${ic('bell-ring')}Ждут ответа</h2><span class="meta num">${waiting.length}</span></div>
      ${waiting.length ? waiting.map(l => { const s = suggest(l), sec = leadAgo(l); return `<div class="lead" data-lead="${l.id}"><span class="src">${l.src === 'Авито' ? 'Ав' : l.src === 'Сайт' ? ic('globe') : ic('phone-incoming')}</span>
        <div style="min-width:0"><div class="row" style="flex-wrap:wrap;gap:6px 8px"><b style="font-size:14px">${esc(l.company)}</b><span class="tag">${l.src}</span><span class="tag">${l.city}</span><span class="tag">${l.work}</span></div>
          <p style="margin-top:5px">${esc(l.text)}</p><div class="faint" style="font-size:12px;margin-top:4px">${esc(l.name)} · ${S.leadMode === 'region' ? 'по региону' : 'по кругу'} предлагаем: <b style="color:var(--text)">${person(s).name}</b></div></div>
        <div class="lead-act"><span class="timer ${sec > 900 ? 'hot' : ''}" data-timer="${l.id}">${ic('timer')}ждёт <span>${fmtAgo(sec)}</span></span><div class="row" style="gap:6px"><button class="btn sm" data-give="${l.id}|${s}">Передать: ${person(s).name}</button><button class="btn sm primary" data-take="${l.id}">${ic('hand')}Взять себе</button></div></div></div>`; }).join('')
        : `<div class="empty"><div class="ico">${ic('inbox')}</div><b>Новых заявок нет</b><span>Как только придёт заявка с Авито, она появится здесь с таймером.</span></div>`}
    </section>
    <section class="panel"><div class="panel-h"><h2>${ic('check-check')}Разобраны</h2><span class="meta num">${done.length}</span></div>
      <div class="list">${done.map(l => `<div class="li">${av(l.assigned)}<div class="stack" style="gap:1px;min-width:0;flex:1"><span class="title ell">${esc(l.company)} · ${l.city}</span><span class="sub ell">${esc(l.reply)}</span></div><span class="end"><span class="tag">${l.src}</span></span></div>`).join('')}</div></section>`;
    return {
      html, mount: v => {
        $$('[data-lm]', v).forEach(b => b.onclick = () => { S.leadMode = b.dataset.lm; A.save(); A.render(); });
        const assign = (id, who) => { const l = S.leads.find(x => x.id === id); l.assigned = who; l.reply = who === S.me ? `Вы взяли в ${A.hhmm()}, ответить до ${A.hhmm(new Date(A.now().getTime() + 15 * 6e4))}` : `Передано ${person(who).name} в ${A.hhmm()}, ждём ответа`; S.rr = (S.rr || 0) + 1; A.save(); A.render(); A.toast(who === S.me ? `Заявка ваша: ${l.company}` : `Заявка передана: ${person(who).name}`, 'hand'); };
        $$('[data-take]', v).forEach(b => b.onclick = () => assign(b.dataset.take, S.me));
        $$('[data-give]', v).forEach(b => b.onclick = () => { const [id, w] = b.dataset.give.split('|'); assign(id, w); });
        A.every(1000, () => $$('[data-timer]').forEach(el => { const l = S.leads.find(x => x.id === el.dataset.timer); if (!l) return; const s = leadAgo(l); el.querySelector('span').textContent = fmtAgo(s); el.classList.toggle('hot', s > 900); }));
      },
    };
  };

  /* ---------- 9. Импорт базы ---------- */
  const COLS_IN = [['Наименование', 'ООО «Аэровент Поволжье»', 'name'], ['ИНН', '0068…', 'inn'], ['Телефон', '+7 (900) 000-…', 'phone'], ['Регион', 'Республика Татарстан', 'city'], ['ОКВЭД основной', '43.22 Монтаж систем вентиляции', 'works'], ['Электронная почта', 'info@…', 'email'], ['Выручка за 2025', '48 200 000', 'skip']];
  const FIELDS = [['name', 'Название'], ['inn', 'ИНН (ключ дублей)'], ['phone', 'Телефон (доп. ключ)'], ['city', 'Город'], ['works', 'Вид работ'], ['email', 'Почта'], ['skip', 'Не загружать']];
  const GEN = { sergey: 'Сергея', maxim: 'Максима', anastasia: 'Анастасии', irina: 'Ирины', nikolay: 'Николая', elyana: 'Эляны', vitaliy: 'Виталия', chulpan: 'Чулпан', zamit: 'Замита' };
  function dupes() {
    const S = A.S; const imp = D.IMPORT;
    const found = S.cos.filter(c => c.pie === imp.pie);
    const cat = c => c.stage === 'refused' ? 'refused' : c.dnc ? 'dnc' : c.owner ? 'owned' : 'free';
    const rows = found.map(c => ({ c, k: cat(c) }));
    const byOwner = {}; rows.filter(r => r.k === 'owned').forEach(r => byOwner[r.c.owner] = (byOwner[r.c.owner] || 0) + 1);
    return { rows, total: rows.length, newN: imp.rows - rows.length, refused: rows.filter(r => r.k === 'refused').length, dnc: rows.filter(r => r.k === 'dnc').length, free: rows.filter(r => r.k === 'free').length, byOwner };
  }
  A.screens.import = function () {
    const S = A.S, st = S.imp, imp = D.IMPORT;
    const steps = ['Загрузить файл', 'Сопоставить колонки', 'Проверить дубли', 'Привязать к пирожку'];
    let body = '';
    if (st.done) {
      body = `<div class="panel"><div class="empty" style="padding:52px 20px"><div class="ico" style="background:var(--accent-soft);color:var(--accent-text);border:0">${ic('check-check')}</div><b>Загружено новых компаний: ${st.done.n}</b><span>Привязаны к пирожку «${pieName(pie(st.done.pie))}». Дубли не тронуты: их владельцы и история остались как были.</span><div class="row"><button class="btn" id="imp-again">${ic('rotate-ccw')}Загрузить ещё файл</button><a class="btn primary" href="#pirozhki">К пирожкам</a></div></div></div>`;
    } else if (st.step === 1) {
      body = `<label class="drop" id="drop" for="imp-file"><span class="ico">${ic('file-spreadsheet')}</span><b style="font-size:15px">Перетащите файл Excel или CSV</b><span class="muted">Выгрузка из СБИС, Seldon или своя таблица. Дубли проверим по ИНН и телефону до загрузки.</span><input type="file" id="imp-file" accept=".xlsx,.xls,.csv" hidden><span class="row"><span class="btn">${ic('upload')}Выбрать файл</span><button class="btn primary" id="imp-sample" type="button">${ic('sparkles')}Взять пример из СБИС</button></span></label>
        <p class="faint" style="font-size:12px;margin-top:10px">В макете файл не читается: любой выбранный файл заменяется примером на 100 строк.</p>`;
    } else if (st.step === 2) {
      body = `<section class="panel"><div class="panel-h"><h2>${ic('file-spreadsheet')}${imp.file}</h2><span class="meta num">${imp.rows} строк</span></div>
        <div class="map-row req-h hide-mob" style="padding-top:9px;padding-bottom:9px"><span>Колонка в файле</span><span></span><span>Поле в CRM</span><span>Пример</span></div>
        ${COLS_IN.map(([n, ex, f], i) => `<div class="map-row"><b class="ell">${n}</b>${ic('arrow-right', 'faint')}<select class="input" id="map-${i}">${FIELDS.map(([k, t]) => `<option value="${k}" ${k === f ? 'selected' : ''}>${t}</option>`).join('')}</select><span class="ex faint ell" style="font-size:12.5px">${ex}</span></div>`).join('')}
      </section>`;
    } else if (st.step === 3) {
      const d = dupes();
      const owners = Object.entries(d.byOwner).map(([w, n]) => `${n} у ${GEN[w] || person(w).name}`);
      const head = `${d.newN} новых (из них ${imp.large} крупных, не наша ЦА), ${d.total} уже есть: ${[...owners, d.refused ? d.refused + ' в отказе' : '', d.dnc ? d.dnc + ' в переговорах' : '', d.free ? d.free + ' свободны в базе' : ''].filter(Boolean).join(', ')}`;
      const kind = { refused: ['badge', 'В отказе'], dnc: ['badge dnc', 'Не звонить'], owned: ['badge acc', 'Закреплена'], free: ['badge', 'Свободна'] };
      body = `<div class="warn-line" style="margin-bottom:16px;font-size:13.5px">${ic('scan-search')}<span><b>${head}.</b> Проверка по ИНН, потом по телефону.</span></div>
        <div class="warn-line" id="imp-large" style="margin-bottom:16px;background:var(--surface-2)">${ic('building')}<span style="flex:1"><b>крупные, с тендерным отделом: ${imp.large} — не наша ЦА.</b> Наша ЦА: малые и средние компании и ИП, оборот около 30–100 млн ₽. По умолчанию крупных не берём.</span><label class="row" style="gap:6px;white-space:nowrap"><input type="checkbox" id="imp-take-large" ${st.large ? 'checked' : ''}> всё равно взять</label></div>
        <div class="dupe-sum"><div class="box ok"><div class="v">${d.newN - (st.large ? 0 : imp.large)}</div><div class="l">новых, загрузим</div></div><div class="box mid"><div class="v">${Object.values(d.byOwner).reduce((a, b) => a + b, 0)}</div><div class="l">закреплены за менеджерами</div></div><div class="box mid"><div class="v">${d.refused}</div><div class="l">в отказе, не звоним</div></div><div class="box mid"><div class="v">${d.dnc + d.free}</div><div class="l">в переговорах или свободны</div></div></div>
        <section class="panel"><div class="panel-h"><h2>${ic('copy')}Уже есть в базе: ${d.total}</h2><span class="meta">не загружаем повторно, владелец не меняется</span></div>
          <div class="table-wrap"><table class="t"><thead><tr><th>Компания</th><th>ИНН</th><th>Статус</th><th>Что было</th></tr></thead><tbody>
          ${d.rows.map(({ c, k }) => { const last = c.history[0]; const [cls, nm] = kind[k]; return `<tr><td><a href="#kompaniya-${c.id}" style="font-weight:700">${esc(c.name)}</a></td><td class="mono">${c.inn}</td><td><span class="row" style="gap:6px"><span class="${cls}">${nm}</span>${c.owner ? av(c.owner, 'xs') : ''}</span></td>
            <td class="muted" style="min-width:260px">${k === 'refused' ? `Уже есть: звонок ${dm(c.since)} (${person(c.owner).name}), неинтересно, причина: ${esc(c.refusal).toLowerCase()}` : k === 'dnc' ? esc(c.dnc) : k === 'owned' ? `${person(c.owner).name}${c.lockUntil ? ' до ' + dm(c.lockUntil) : ''}: ${A.stage(c.stage).name.toLowerCase()}${last ? ', последнее касание ' + A.relDay(last.d) : ''}` : last ? 'Последнее касание ' + A.relDay(last.d) + ': ' + esc(last.text).toLowerCase() : 'В базе, звонков не было'}</td></tr>`; }).join('')}
          </tbody></table></div></section>`;
    } else if (st.step === 4) {
      const d = dupes();
      body = `<section class="panel"><div class="panel-b stack" style="gap:14px;max-width:560px">
        <div class="field"><label for="imp-pie">Пирожок</label><select class="input" id="imp-pie">${S.pies.map(p => `<option value="${p.id}" ${p.id === imp.pie ? 'selected' : ''}>${pieName(p)} · до ${dm(p.deadline)}</option>`).join('')}</select></div>
        <div class="field"><label for="imp-owner">Владелец новых компаний</label><select class="input" id="imp-owner"><option value="">Без владельца: закрепятся за тем, кто возьмёт пирожок</option>${D.MANAGERS.map(m => `<option value="${m.id}">${m.name} (закрепить на 7 дней)</option>`).join('')}</select></div>
        <div class="warn-line" style="margin:0">${ic('info')}<span>Загрузим ${d.newN - (st.large ? 0 : imp.large)} новых компаний.${st.large ? '' : ' Крупных (' + imp.large + ') пропускаем.'} ${d.total} дублей пропустим, их владельцы и история не изменятся.</span></div></div></section>`;
    }
    const html = `
    <div class="page-head"><div><h1>Импорт базы</h1><div class="sub">Excel или CSV из СБИС и Seldon. Дубли видны до загрузки, а не после звонка.</div></div></div>
    <div class="steps">${steps.map((n, i) => `<div class="step ${st.done || i + 1 < st.step ? 'done' : i + 1 === st.step ? 'on' : ''}"><span class="n">${st.done || i + 1 < st.step ? '✓' : i + 1}</span><span class="txt ell">${n}</span></div>`).join('')}</div>
    ${body}
    ${!st.done && st.step > 1 ? `<div class="row" style="justify-content:space-between;margin-top:16px"><button class="btn" id="imp-back">${ic('arrow-left')}Назад</button><button class="btn primary" id="imp-next">${st.step === 4 ? `${ic('download')}Загрузить ${dupes().newN - (st.large ? 0 : imp.large)} компаний` : `Дальше ${ic('arrow-right')}`}</button></div>` : ''}`;
    return {
      html, mount: v => {
        const nx = () => { st.step++; A.save(); A.render(); };
        const s1 = $('#imp-sample', v); if (s1) s1.onclick = e => { e.preventDefault(); nx(); A.toast('Файл загружен: 100 строк', 'file-spreadsheet'); };
        const f = $('#imp-file', v); if (f) f.onchange = () => { nx(); A.toast('Файл загружен. В макете показываем пример из СБИС', 'file-spreadsheet'); };
        const dr = $('#drop', v); if (dr) { dr.ondragover = e => { e.preventDefault(); dr.classList.add('over'); }; dr.ondragleave = () => dr.classList.remove('over'); dr.ondrop = e => { e.preventDefault(); nx(); }; }
        const tl = $('#imp-take-large', v); if (tl) tl.onchange = () => { st.large = tl.checked; A.save(); A.render({ keepScroll: true }); };
        const b = $('#imp-back', v); if (b) b.onclick = () => { st.step--; A.save(); A.render(); };
        const n = $('#imp-next', v); if (n) n.onclick = () => {
          if (st.step === 4) { const d = dupes(); st.done = { n: d.newN - (st.large ? 0 : imp.large), pie: $('#imp-pie', v).value }; A.save(); A.render(); A.toast(`Загружено ${st.done.n} компаний, ${d.total} дублей пропущено`, 'check-check'); }
          else nx();
        };
        const ag = $('#imp-again', v); if (ag) ag.onclick = () => { S.imp = { step: 1 }; A.save(); A.render(); };
      },
    };
  };

  /* ---------- 10. Шпаргалка ---------- */
  const FAQ = [
    ['Сколько стоит?', 'На первом звонке: <b>«2 % после победы»</b>. Подробно, если спросят: участие в одной закупке 16 000 ₽, оно засчитывается в вознаграждение при победе. Пакеты: 7 закупок за 84 000 ₽ или 15 за 105 000 ₽.'],
    ['«60 тысяч вперёд платить?»', '<b>Нет.</b> Вперёд клиент ничего не платит. Оплата за участие после итогового протокола, это не аванс.'],
    ['А если не выиграем?', 'Платите только за участие по тарифу и только после итогового протокола. 2 % берём лишь с победы.'],
    ['Нужен ли СРО?', 'Зависит от закупки. Для строительства и капремонта по контракту дороже 10 млн ₽ нужно членство в СРО. Требование всегда видно в извещении. Не уверены: «уточню и перезвоню», вопрос в карточку.'],
    ['Нужна лицензия МЧС?', 'Для монтажа и обслуживания пожарной сигнализации и пожаротушения да. Без неё такие закупки не подбираем.'],
    ['Сколько обеспечение заявки?', 'По 44-ФЗ обычно 0,5–1 % от начальной цены, на крупных закупках до 5 %. Точная сумма в извещении. Деньги блокируются на спецсчёте и возвращаются после торгов.'],
    ['Кто готовит заявку?', 'Мы: подборка, документы, подача. От клиента: документы компании и электронная подпись руководителя.'],
    ['Нужна электронная подпись?', 'Да, квалифицированная подпись руководителя. Поможем с аккредитацией на площадках, это 1–3 рабочих дня.'],
    ['Когда будет первая подборка?', 'Обычно 1–2 рабочих дня после того, как уточнили профиль: регионы, виды работ, допуски.'],
    ['Чем вы лучше бесплатного поиска закупок?', 'Мы не присылаем список. Отбираем закупки под ваш профиль, с авансом, и ведём участие до итога.'],
  ];
  const GLOSS = [
    ['Благоустройство', 'приведение территории в порядок: дорожки, площадки, озеленение, освещение двора.'],
    ['Уборка снега', 'сезонный контракт: очистка и вывоз снега с дворов, дорог и площадок.'],
    ['Чистка кровли', 'сброс снега и наледи с крыш, работа на высоте.'],
    ['СМР', 'строительно-монтажные работы: само строительство и монтаж.'],
    ['ПИР', 'проектно-изыскательские работы: проект и изыскания до начала стройки.'],
    ['Генподряд', 'одна компания отвечает за объект целиком и сама нанимает остальных.'],
    ['Субподряд', 'часть работ по договору с генподрядчиком, а не с заказчиком.'],
    ['СРО', 'саморегулируемая организация; членство даёт допуск к строительству или проектированию.'],
    ['НМЦК', 'начальная (максимальная) цена контракта: от неё идут торги.'],
    ['Обеспечение заявки', 'деньги, которые участник блокирует на время торгов; после торгов возвращаются.'],
  ];
  const CT = [['cond', 'Условия'], ['faq', 'Вопросы'], ['gloss', 'Словарь'], ['mat', 'Материалы']];
  A.cheatTab = function (b) {
    const root = b.closest('.drawer-b, #view') || document;
    root.querySelectorAll('[data-ct]').forEach(x => x.classList.toggle('on', x === b));
    root.querySelectorAll('[data-pane]').forEach(x => { x.hidden = x.dataset.pane !== b.dataset.ct; });
  };
  A.cheatBody = function (compact) {
    return `<div class="say"><div class="eyebrow" style="color:var(--accent-text)">Первый звонок: говорим только это</div><div class="q">«Работаем за 2 % после победы»</div><p class="muted" style="margin-top:6px;font-size:12.5px">Тарифы и пакеты обсуждаем, только когда клиент заинтересовался и спросил.</p></div>

      <span class="seg cheat-tabs" role="tablist">${CT.map(([k, n], i) => `<button class="${i ? '' : 'on'}" data-ct="${k}" onclick="App.cheatTab(this)">${n}</button>`).join('')}</span>
      <div class="ct-pane" data-pane="cond">
      <section class="panel"><div class="panel-h"><h3>${ic('receipt')}Условия</h3></div>
        <div class="price-row"><div><b>Участие в одной закупке</b><div class="d">засчитывается в вознаграждение при победе</div></div><span class="v">16 000 ₽</span></div>
        <div class="price-row"><div><b>Пакет 7 закупок</b><div class="d">по 12 000 ₽ за закупку</div></div><span class="v">84 000 ₽</span></div>
        <div class="price-row"><div><b>Пакет 15 закупок</b><div class="d">по 7 000 ₽ за закупку</div></div><span class="v">105 000 ₽</span></div>
        <div class="price-row"><div><b>При победе</b><div class="d">от суммы контракта</div></div><span class="v">2 %</span></div>
        <div class="price-row" style="background:var(--surface-2)"><div><b>Когда платят</b><div class="d">после итогового протокола. Это не аванс</div></div><span class="v">${ic('check')}</span></div></section>
      </div>
      <div class="ct-pane stack" data-pane="faq" style="gap:16px" hidden>
      <div class="warn-line" style="margin:0">${ic('circle-help')}<span><b>Не знаете ответа?</b> Скажите «уточню и перезвоню», откройте карточку клиента и задайте вопрос Павлу в блоке «Вопросы специалисту». Не пишите в общий чат: там вопрос потеряется.</span></div>
      <section class="panel"><div class="panel-h"><h3>${ic('messages-square')}Частые вопросы</h3><span class="meta num">${FAQ.length}</span></div>
        ${FAQ.map(([q, a], i) => `<details class="faq" ${!compact && i < 2 ? 'open' : ''}><summary>${esc(q)}${ic('chevron-down')}</summary><div class="ans">${a}</div></details>`).join('')}</section>
      </div>
      <div class="ct-pane" data-pane="gloss" hidden>
      <section class="panel" id="glossary"><div class="panel-h"><h3>${ic('book-a')}Словарь</h3><span class="meta num">${GLOSS.length}</span></div>
        ${GLOSS.map(([t, d]) => `<div class="price-row gl-row"><div><b>${t}</b><div class="d">${d}</div></div></div>`).join('')}</section>
      </div>
      <div class="ct-pane" data-pane="mat" hidden>
      <section class="panel" id="materials"><div class="panel-h"><h3>${ic('paperclip')}Материалы</h3></div>
        <div class="price-row"><div><b>Презентация</b><div class="d"><span class="badge acc">проверено на телефоне</span> открывается без приложений</div></div><button class="btn sm" data-mat="Презентация">${ic('eye')}Открыть</button></div>
        <div class="price-row"><div><b>Условия</b><div class="d">тарифы и порядок оплаты одной страницей</div></div><button class="btn sm" data-mat="Условия">${ic('eye')}Открыть</button></div>
        <div class="price-row"><div><b>Пример подборки</b><div class="d">как выглядит список закупок для клиента</div></div><button class="btn sm" data-mat="Пример подборки">${ic('eye')}Открыть</button></div></section>
      </div>`;
  };
  A.screens.shpargalka = function () {
    return {
      html: `<div class="page-head"><div><h1>Шпаргалка</h1><div class="sub">Условия простыми словами и ответы на частые вопросы. Открывается с любого экрана кнопкой «Шпаргалка» сверху.</div></div></div>
      <div class="cheat-one stack" style="gap:16px">${A.cheatBody(false)}</div>`,
    };
  };

  /* ---------- Почему так ---------- */
  const PAINS = [
    ['Никто не знает общих цифр', '«Кто следит за количеством подборок?», «Сколько у нас клиентов? Не могу сказать»', '3:04, 5:40', 'planerka', 'Планёрка 10:00', 'Воронка, звонки по менеджерам и блок «Горит» собираются из исходов звонков. Отчёт никто не заполняет.'],
    ['Контекст клиента теряется за ночь', '«Вчера всё помнил, сегодня как новый день». Не позвонили Вере', '7:00–8:44', 'kompaniya-k03', 'Карточка компании', 'Лента касаний всех менеджеров и следующий шаг с датой. Перезвоны сами встают в «Мой день».'],
    ['Учёт разбросан по Excel и Trello', 'Ирина записывает только отказы и интерес, замолчавших не пишет никто', '9:26–10:22', 'obzvon', 'Обзвон', 'Исход звонка в 1–2 клика прямо в очереди. Записывать отдельно не нужно, поэтому записывают все.'],
    ['Неясно, что кому уже отправили', 'Константину то ли скидывали пирожок, то ли нет', '13:10–13:53', 'kompaniya-k03', 'Карточка: «Что отправлено»', 'Пирожки, подборки и договоры с датой и автором. Повторная отправка того же пирожка предупреждает.'],
    ['Путают условия договора', 'Клиент спросил про «60 тысяч вперёд», а оплата после протокола', '15:47–16:09, 27:13', 'shpargalka', 'Шпаргалка', 'Тарифы и 10 частых вопросов с ответами. Открывается с любого экрана, в том числе во время звонка.'],
    ['«Уточню», и вопрос теряется в чате', 'Вопрос уходит в общий чат и теряется', '21:24–22:01, 26:00', 'kompaniya-r02', 'Карточка: «Вопросы специалисту»', 'Вопрос Павлу привязан к клиенту. Ответ остаётся в карточке и в ленте.'],
    ['Двойные звонки одним компаниям', 'Восемь менеджеров на одном пирожке, клиенту звонили уже 10 раз', 'ч. 2, 0:58–2:49', 'import', 'Импорт и Обзвон', 'Одна компания — одна запись по ИНН. Дубль видно при загрузке базы, в обзвоне видно «звонили 9 раз».'],
    ['Звонят тем, кто уже в переговорах', '«Главное, чтобы ты до него не дозвонился»: у клиента договор', 'ч. 2, 5:32–5:44', 'obzvon-kzn-vent', 'Обзвон: жёлтый «не звонить»', 'Клиент с договором помечен жёлтым на любом экране. Кнопка звонка выключена, остаётся «Пропустить».'],
    ['Кто какой пирожок берёт, решают устно', '«Если Рязань отвалится, что брать дальше?» Сроков никто не видит', 'ч. 2, 4:19–5:27', 'pirozhki', 'Пирожки', 'Доска с обратным отсчётом до подачи, «Беру» закрепляет компании на 7 дней, подсказка «что брать дальше».'],
    ['Входящие с Авито некому раздать', 'Нужно раздавать по менеджерам и знать, что ответили', 'ч. 2, 0:11–0:46', 'vhodyashchie', 'Входящие', 'Таймер «ждёт ответа», раздача по кругу или по региону, кнопка «Взять себе».'],
    ['Таблица с вкладками лечит дубли наполовину', 'Поиск через Ctrl+F, о дубле узнаёшь после звонка. «Была бы CRM-ка, было бы просто»', 'ч. 2, 6:08–7:39', 'klienty', 'Клиенты и поиск Ctrl+K', 'Статусы и этапы на одной доске. Поиск по ИНН и телефону показывает владельца и отказ до звонка.'],
  ];
  A.PAINS = PAINS;
  A.screens.pochemu = function () {
    const html = `
    <div class="why-hero"><div><div class="eyebrow">Созвон 05.11.2026, запись Rec 0053</div><h1>11 проблем из созвона и экран, который решает каждую</h1>
      <p>Макет собран из жалоб команды. Слева проблема и цитата с временем в записи, справа экран, где она решена. Ссылки ведут в живой макет.</p></div>
      <div class="why-stat"><div><div class="v">10</div><div class="l">экранов</div></div><div><div class="v">54</div><div class="l">выдуманные компании</div></div><div><div class="v">7</div><div class="l">пирожков</div></div><div><div class="v">8</div><div class="l">принципов из Pipedrive, Close, amoCRM</div></div></div></div>
    <section class="panel" style="margin-bottom:16px" id="pains">${PAINS.map((p, i) => `<div class="pain"><span class="no">${String(i + 1).padStart(2, '0')}</span><div><b style="font-size:14px">${p[0]}</b><p class="quote">${p[1]} <i>${p[2]}</i></p></div><span class="arrow">${ic('arrow-right')}</span>
      <div class="fix"><a class="lnk" href="#${p[3]}" data-pain="${i + 1}">${p[4]}${ic('arrow-up-right')}</a><p>${p[5]}</p></div></div>`).join('')}</section>
    <div class="page-head" style="margin-top:28px"><div><h1 style="font-size:19px">Как внедрять: три варианта</h1><div class="sub">Цены ориентировочные, на 8 пользователей. Перед решением уточнить у поставщиков.</div></div></div>
    <div class="grid g-3">
      <section class="panel opt"><h3><span class="lt">А</span>amoCRM или Битрикс24 с настройкой</h3>
        <dl><dt>Стоимость</dt><dd>подписка около 10–20 тыс ₽ в месяц, настройка интегратором 50–150 тыс ₽ разово</dd><dt>Срок</dt><dd>2–4 недели</dd></dl>
        <ul><li>Контроль дублей по ИНН, воронки, задачи и телефония уже есть</li><li>Пирожки, закрепление на 7 дней и режим очереди придётся собирать из полей и роботов</li><li>Команде привыкать к чужому интерфейсу</li></ul></section>
      <section class="panel opt"><h3><span class="lt">Б</span>Google-таблица с проверками</h3>
        <dl><dt>Стоимость</dt><dd>0 ₽</dd><dt>Срок</dt><dd>2–3 дня</dd></dl>
        <ul><li>Быстро и понятно всем</li><li>Дубль ловится формулой по ИНН, но только после того, как строку уже внесли</li><li>Нет закрепления, напоминаний и истории касаний. Цифры планёрки считаются формулами и ломаются</li></ul></section>
      <section class="panel opt"><h3><span class="lt">В</span>Своя система по этому макету</h3>
        <dl><dt>Стоимость</dt><dd>400 тыс – 1,2 млн ₽ разработки или свой программист</dd><dt>Срок</dt><dd>2–3 месяца до первой версии</dd></dl>
        <ul><li>Ровно эти 10 экранов и наши слова</li><li>Долго, а поддержка и ошибки на нас</li><li>Телефонию и почту подключать отдельно</li></ul></section>
    </div>`;
    return { html };
  };

  /* ---------- Тур (страница) ---------- */
  A.screens.tur = function () {
    const html = `
    <div class="page-head"><div><h1>Тур: день Сергея</h1><div class="sub">${A.TOUR.length} шагов, 1–2 минуты. Макет сам переходит по экранам и нажимает кнопки, вы жмёте «Дальше».</div></div>
      <div class="actions"><button class="btn primary lg" id="tour-start">${ic('play')}Показать тур</button></div></div>
    <section class="panel"><div class="list tour-steps">${A.TOUR.map((s, i) => `<div class="li"><span class="n">${i + 1}</span><div class="stack" style="gap:1px"><span class="title">${s.title}</span><span class="sub">${s.short}</span></div></div>`).join('')}</div></section>
    <p class="faint" style="margin-top:12px;font-size:12.5px">Перед туром демо-данные сбрасываются к утру 05.11, чтобы цифры совпали.</p>`;
    return { html, mount: v => { $('#tour-start', v).onclick = () => A.startTour(); } };
  };
})();
