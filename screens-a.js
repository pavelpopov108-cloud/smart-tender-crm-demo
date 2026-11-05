/* Экраны 1–4: Планёрка, Мой день, Пирожки, Обзвон */
(function () {
  const A = window.App, { D, $, $$, esc, ic, av, dm, money, person, pie, pieName, co, stageBadge } = A;

  /* ---------- 1. Планёрка ---------- */
  let tableMode = 'yesterday';
  A.screens.planerka = function () {
    const S = A.S, c = A.counts(), hot = A.hotItems();
    const y = D.YESTERDAY, t = A.todayStats();
    const src = tableMode === 'yesterday' ? y : t;
    const sum = i => D.MANAGERS.reduce((a, m) => a + src[m.id][i], 0);
    const ySum = i => D.MANAGERS.reduce((a, m) => a + y[m.id][i], 0);
    const maxCalls = Math.max(...D.MANAGERS.map(m => src[m.id][0]), 1);
    const funnel = [
      ['interest', 'Интерес', c.interest, 2], ['wait_pod', 'Ждут подборку', c.wait, 4], ['pod_sent', 'Подборка отправлена', c.podSent, 5],
      ['contract_sent', 'Договор отправлен', c.contract, 6], ['signed', 'Подписан и дальше', c.signed, 7],
    ];
    const fmax = Math.max(...funnel.map(f => f[2]), 1);
    const waiting = S.pods.filter(p => p.status !== 'sent').sort((a, b) => a.at.localeCompare(b.at));
    const d = A.now();
    const html = `
    <div class="page-head">
      <div><h1>Планёрка 10:00</h1><div class="sub">${A.WD[d.getDay()][0].toUpperCase() + A.WD[d.getDay()].slice(1)}, ${d.getDate()} ${A.MON[d.getMonth()]}. Цифры собраны из исходов звонков, отчёт никто не заполнял.</div></div>
      <div class="actions"><a class="btn" href="#klienty">${ic('square-kanban')}Все клиенты</a><a class="btn primary" href="#moy-den">${ic('sun')}Мой день</a></div>
    </div>
    <div class="panel kpis">
      <div class="kpi"><div class="lbl">${ic('phone')}Звонков вчера</div><div class="val">${ySum(0)}</div><div class="delta">дозвон ${Math.round(ySum(1) / ySum(0) * 100)} %, интересных ${ySum(2)}</div></div>
      <div class="kpi"><div class="lbl">${ic('users')}Клиентов в работе</div><div class="val" id="kpi-active">${c.active}</div><div class="delta">от интереса до итога</div></div>
      <div class="kpi" id="kpi-wait"><div class="lbl">${ic('hourglass')}Ждут подборку</div><div class="val">${c.wait}</div><div class="delta">в очереди у Павла: ${c.podQueue}</div></div>
      <div class="kpi"><div class="lbl">${ic('file-signature')}Договор отправлен</div><div class="val">${c.contract}</div><div class="delta" style="${hot.contracts.length ? 'color:var(--hot-text)' : ''}">без ответа больше 2 дней: ${hot.contracts.length}</div></div>
      <div class="kpi"><div class="lbl">${ic('badge-check')}Подписано</div><div class="val">${c.signed}</div><div class="delta">включая аккредитацию и участие</div></div>
    </div>
    <div class="grid g-main">
      <div class="stack" style="gap:16px">
        <section class="panel" id="funnel-panel">
          <div class="panel-h"><h2>${ic('filter')}Воронка</h2><span class="meta">клиентов на этапе сейчас</span></div>
          <div class="panel-b funnel">${funnel.map(f => `
            <a class="fn-row" id="fn-${f[0]}" href="#klienty" style="--sc:var(--st-${f[3]})"><span class="nm"><span class="badge stage" style="--sc:var(--st-${f[3]});height:auto;padding:0;border:0;background:none"><span class="dot"></span></span>${f[1]}</span>
            <span class="fn-bar"><i style="width:${Math.max(4, f[2] / fmax * 100)}%"></i></span><span class="v">${f[2]}</span></a>`).join('')}
          </div>
        </section>
        <section class="panel" id="team-table">
          <div class="panel-h"><h2>${ic('users')}Менеджеры</h2>
            <span class="meta"><span class="seg" role="tablist"><button class="${tableMode === 'yesterday' ? 'on' : ''}" data-tm="yesterday">Вчера, 04.11</button><button class="${tableMode === 'today' ? 'on' : ''}" data-tm="today">Сегодня</button></span></span></div>
          <div class="table-wrap"><table class="t">
            <thead><tr><th>Менеджер</th><th class="r">Звонков</th><th class="r">Дозвонов</th><th class="r">Интересных</th><th class="r">Договоров</th><th class="hide-mob" style="width:22%">Нагрузка</th></tr></thead>
            <tbody>${D.MANAGERS.map(m => { const r = src[m.id]; return `<tr id="tr-${m.id}">
              <td><span class="row">${av(m.id)}<b>${m.name}</b>${m.id === S.me ? '<span class="badge acc" style="height:18px;font-size:10.5px">вы</span>' : ''}</span></td>
              <td class="r num">${r[0]}</td><td class="r num">${r[1]}</td><td class="r num">${r[2]}</td><td class="r num">${r[3] || '<span class="faint">0</span>'}</td>
              <td class="hide-mob"><span class="bar-mini" style="width:${Math.max(2, r[0] / maxCalls * 100)}%"></span></td></tr>`; }).join('')}</tbody>
            <tfoot><tr><td>Всего</td><td class="r num">${sum(0)}</td><td class="r num">${sum(1)}</td><td class="r num">${sum(2)}</td><td class="r num">${sum(3)}</td><td class="hide-mob"></td></tr></tfoot>
          </table></div>
        </section>
      </div>
      <div class="stack" style="gap:16px">
        <section class="panel" id="hot-panel">
          <div class="panel-h"><h2><span class="hot-dot"></span>Горит</h2><span class="meta num">${hot.total}</span></div>
          ${hot.total ? `
          ${hot.pies.length ? `<div class="hot-group"><h4>Пирожки: срок меньше 3 дней</h4><div class="list">${hot.pies.map(p => { const cd = A.countdown(p); return `<a class="li" href="#pirozhki"><div class="stack" style="gap:1px"><span class="title">${pieName(p)}</span><span class="sub">${p.takenBy ? 'Владелец: ' + person(p.takenBy).name : 'Никто не взял'} · подача до ${dm(p.deadline)}</span></div><span class="end"><span class="countdown hot">${ic('timer')}${cd.txt}</span></span></a>`; }).join('')}</div></div>` : ''}
          ${hot.contracts.length ? `<div class="hot-group"><h4>Договор без ответа больше 2 дней</h4><div class="list">${hot.contracts.map(({ c, days }) => `<a class="li" href="#kompaniya-${c.id}">${av(c.owner)}<div class="stack" style="gap:1px;min-width:0"><span class="title ell">${esc(c.name)}</span><span class="sub">${c.city} · отправлен ${dm(c.since)}</span></div><span class="end"><span class="badge hot">${A.days(days)}</span></span></a>`).join('')}</div></div>` : ''}
          ${hot.noStep.length ? `<div class="hot-group"><h4>Нет следующего шага</h4><div class="list">${hot.noStep.map(({ c, days }) => `<a class="li" href="#kompaniya-${c.id}">${av(c.owner)}<div class="stack" style="gap:1px;min-width:0"><span class="title ell">${esc(c.name)}</span><span class="sub">${A.stage(c.stage).name} · ${c.city}</span></div><span class="end"><span class="badge hot">${A.days(days)} тишины</span></span></a>`).join('')}</div></div>` : ''}`
          : `<div class="empty"><div class="ico">${ic('check')}</div><b>Ничего не горит</b><span>У всех сделок есть следующий шаг.</span></div>`}
        </section>
        <section class="panel" id="wait-panel">
          <div class="panel-h"><h2>${ic('hourglass')}Ждут подборку у Павла</h2><span class="meta"><a class="btn sm ghost" href="#podborki">Очередь ${ic('arrow-right')}</a></span></div>
          ${waiting.length ? `<div class="list">${waiting.map(p => { const c = co(p.co); const ag = ageOf(p.at); return `<a class="li" href="#kompaniya-${c.id}" data-wait="${c.id}">${av(p.by)}<div class="stack" style="gap:1px;min-width:0"><span class="title ell">${esc(c.name)}</span><span class="sub">${p.status === 'collecting' ? 'В сборке у Павла' : 'Новая'} · ${c.city}</span></div><span class="end"><span class="age ${ag.hot ? 'hot' : ''}">${ag.txt}</span></span></a>`; }).join('')}</div>`
          : `<div class="empty"><div class="ico">${ic('inbox')}</div><b>Очередь пуста</b><span>Все подборки отправлены.</span></div>`}
        </section>
      </div>
    </div>`;
    return { html, mount: v => $$('[data-tm]', v).forEach(b => b.onclick = () => { tableMode = b.dataset.tm; A.render(); }) };
  };
  A.setTableMode = m => { tableMode = m; };

  function ageOf(at) {
    const ms = A.now() - new Date(at); const h = Math.floor(ms / 36e5);
    const txt = h < 24 ? `${h} ч` : `${Math.floor(h / 24)} д ${h % 24} ч`;
    return { txt, hot: h >= 48, h };
  }
  A.ageOf = ageOf;

  /* ---------- 2. Мой день ---------- */
  A.screens['moy-den'] = function () {
    const S = A.S, me = S.me, p = person(me);
    if (me === 'pavel') {
      const q = S.pods.filter(x => x.status !== 'sent');
      return { html: `<div class="page-head"><div><h1>Мой день</h1><div class="sub">${p.name}, ${p.role}</div></div></div>
        <div class="hero-call"><div style="flex:1;min-width:220px"><div class="eyebrow">Ваша очередь</div><div class="big">${q.length} ${A.plural(q.length, 'подборка ждёт', 'подборки ждут', 'подборок ждут')} сборки</div><div class="muted">Самая старая: ${q.length ? ageOf(q.sort((a, b) => a.at.localeCompare(b.at))[0].at).txt : '—'}</div></div><a class="btn primary lg" href="#podborki">${ic('list-checks')}Открыть подборки</a></div>` };
    }
    const mine = S.cos.filter(c => c.owner === me);
    const todayList = mine.filter(c => c.next && c.next.d <= A.TODAY).sort((a, b) => (a.next.d + a.next.t).localeCompare(b.next.d + b.next.t));
    const nowT = A.hhmm();
    let nowShown = false;
    const agenda = todayList.map(c => {
      const overdue = c.next.d < A.TODAY;
      let line = '';
      if (!nowShown && !overdue && c.next.t > nowT) { nowShown = true; line = `<div class="now-line">Сейчас ${nowT}</div>`; }
      const past = !overdue && c.next.t < nowT;
      return line + `<a class="li" href="#kompaniya-${c.id}"><span class="time ${past ? '' : ''}">${overdue ? '<span style="color:var(--hot)">' + dm(c.next.d) + '</span>' : c.next.t}</span>
        <div class="stack" style="gap:2px;min-width:0;flex:1"><span class="title ell">${esc(c.next.text)}</span><span class="sub ell">${esc(c.name)} · ${c.city}</span></div>
        <span class="end">${c.dnc ? '<span class="badge dnc hide-mob">Не звонить с чужих</span>' : ''}${stageBadge(c.stage).replace('class="badge stage"', 'class="badge stage hide-mob"')}<span class="btn sm icon" data-tip="Позвонить">${ic('phone')}</span></span></a>`;
    }).join('') + (!nowShown && todayList.length ? `<div class="now-line">Сейчас ${nowT}</div>` : '');
    const myPies = S.pies.filter(x => x.takenBy === me);
    const noStep = mine.filter(A.noNext);
    const stagesShown = ['interest', 'pie_sent', 'profile', 'wait_pod', 'pod_sent', 'contract_sent', 'signed', 'accred', 'participation', 'result'];
    const myByStage = stagesShown.map(s => [s, mine.filter(c => c.stage === s).length]).filter(x => x[1]);
    const firstPie = myPies[0];
    const qLeft = firstPie ? S.cos.filter(c => c.pie === firstPie.id && c.stage !== 'refused' && !(S.dial[firstPie.id]?.done || {})[c.id]).length : 0;
    const html = `
    <div class="page-head"><div><h1>Мой день</h1><div class="sub">${p.name}: ${todayList.length} ${A.plural(todayList.length, 'дело', 'дела', 'дел')} на сегодня, ${mine.filter(c => A.ACTIVE.includes(c.stage)).length} клиентов в работе</div></div></div>
    <div class="hero-call" id="start-call">
      <div style="flex:1;min-width:220px">${firstPie ? `<div class="eyebrow">Ваш пирожок</div><div class="big">${pieName(firstPie)}: ${qLeft} ${A.plural(qLeft, 'компания', 'компании', 'компаний')} в очереди</div><div class="muted">Подача до ${dm(firstPie.deadline)}, осталось ${A.countdown(firstPie).txt}</div>`
        : `<div class="eyebrow">Пирожок не выбран</div><div class="big">Возьмите пирожок, и его компании закрепятся за вами на 7 дней</div><div class="muted">Свободных сейчас: ${A.counts().freePies}</div>`}</div>
      ${firstPie ? `<a class="btn primary lg" href="#obzvon-${firstPie.id}">${ic('phone-call')}Начать обзвон</a>` : `<a class="btn primary lg" href="#pirozhki">${ic('croissant')}Выбрать пирожок</a>`}
    </div>
    <div class="grid g-main">
      <section class="panel agenda">
        <div class="panel-h"><h2>${ic('calendar-check')}Перезвоны и дела на сегодня</h2><span class="meta num">${todayList.length}</span></div>
        ${todayList.length ? `<div class="list">${agenda}</div>` : `<div class="empty"><div class="ico">${ic('calendar')}</div><b>На сегодня дел нет</b><span>Перезвоны появятся здесь сами, когда вы отметите «Перезвонить» в обзвоне.</span></div>`}
        ${noStep.length ? `<div class="hot-group" style="border-top:1px solid var(--border)"><h4>Без следующего шага</h4><div class="list">${noStep.map(c => `<a class="li" href="#kompaniya-${c.id}"><span class="hot-dot"></span><div class="stack" style="gap:1px;min-width:0"><span class="title ell">${esc(c.name)}</span><span class="sub">${A.stage(c.stage).name} с ${dm(c.since)}</span></div><span class="end"><span class="btn sm">Назначить</span></span></a>`).join('')}</div></div>` : ''}
      </section>
      <div class="stack" style="gap:16px">
        <section class="panel"><div class="panel-h"><h2>${ic('users')}Мои клиенты по этапам</h2><span class="meta"><a class="btn sm ghost" href="#klienty">Канбан ${ic('arrow-right')}</a></span></div>
          <div class="panel-b">${myByStage.length ? `<div class="stage-strip">${myByStage.map(([s, n]) => `<a class="stage-cell" href="#klienty"><div class="n">${n}</div><div class="l"><span class="badge stage" style="--sc:var(--st-${A.stage(s).c});padding:0;border:0;background:none;height:auto"><span class="dot"></span></span>${A.stage(s).name}</div></a>`).join('')}</div>`
            : `<div class="empty" style="padding:16px"><b>Пока нет клиентов</b><span>Отметьте «Интересно» в обзвоне, и клиент появится здесь.</span></div>`}</div></section>
        <section class="panel"><div class="panel-h"><h2>${ic('croissant')}Мои пирожки</h2><span class="meta"><a class="btn sm ghost" href="#pirozhki">Все ${ic('arrow-right')}</a></span></div>
          ${myPies.length ? `<div class="list">${myPies.map(x => { const cd = A.countdown(x); return `<a class="li" href="#obzvon-${x.id}"><div class="stack" style="gap:1px"><span class="title">${pieName(x)}</span><span class="sub">${money(x.amount, true)}${x.advance ? ', аванс ' + x.advance + ' %' : ''} · закреплён до ${dm(x.takenUntil)}</span></div><span class="end"><span class="countdown ${cd.hot ? 'hot' : ''}">${ic('timer')}${cd.txt}</span></span></a>`; }).join('')}</div>`
            : `<div class="empty" style="padding:22px"><div class="ico">${ic('croissant')}</div><b>Нет пирожков</b><span>Возьмите свободный на доске «Пирожки».</span><a class="btn sm" href="#pirozhki">Открыть доску</a></div>`}</section>
      </div>
    </div>`;
    return { html };
  };

  /* ---------- 3. Пирожки ---------- */
  let pieFilter = 'all';
  function pieStats(p) {
    const list = A.S.cos.filter(c => c.pie === p.id);
    const called = list.filter(c => c.history.some(h => h.type === 'call') || c.stage !== 'base').length;
    return { total: list.length, called };
  }
  A.takePie = function (id) {
    const S = A.S, p = pie(id);
    p.takenBy = S.me; p.takenUntil = A.addDays(A.TODAY, 7);
    let n = 0;
    S.cos.filter(c => c.pie === id && !c.owner && c.stage === 'base').forEach(c => { c.owner = S.me; c.lockUntil = p.takenUntil; n++; });
    A.save();
    return n;
  };
  A.screens.pirozhki = function () {
    const S = A.S;
    let list = S.pies.slice().sort((a, b) => A.untilDeadline(a) - A.untilDeadline(b));
    if (pieFilter === 'free') list = list.filter(p => !p.takenBy);
    if (pieFilter === 'mine') list = list.filter(p => p.takenBy === S.me);
    if (pieFilter === 'hot') list = list.filter(p => A.countdown(p).hot);
    const free = S.pies.filter(p => !p.takenBy).sort((a, b) => A.untilDeadline(a) - A.untilDeadline(b));
    const card = p => {
      const cd = A.countdown(p), st = pieStats(p), mine = p.takenBy === S.me;
      return `<article class="pie ${cd.hot ? 'hot' : ''} ${mine ? 'mine' : ''}" data-pie="${p.id}">
        <div class="pie-top"><div style="flex:1;min-width:0"><div class="pie-city">${p.city}</div><div class="pie-work">${p.work} · ${p.law}</div></div>
          ${p.takenBy ? `<span class="row" style="gap:6px">${av(p.takenBy)}<span class="faint" style="font-size:12px">до ${dm(p.takenUntil)}</span></span>` : '<span class="badge acc">Свободен</span>'}</div>
        <p class="pie-title">${esc(p.title)}</p>
        <div class="pie-money"><div><div class="l">Сумма</div><div class="v">${money(p.amount, true)}</div></div><div><div class="l">Аванс</div><div class="v">${p.advance ? p.advance + ' %' : '<span class="faint">нет</span>'}</div></div>
          <div><div class="l">Подача</div><div class="v ${cd.hot ? 'hot' : ''}" data-tip="до ${dm(p.deadline)} ${p.deadline.slice(11)}">${cd.txt}</div></div></div>
        <div class="stack" style="gap:6px"><div class="row" style="justify-content:space-between;font-size:12.5px"><span class="muted">Обзвонено</span><span class="num">${st.called} из ${st.total}</span></div><div class="prog"><i style="width:${st.called / st.total * 100}%"></i></div></div>
        <div class="pie-foot">${mine ? `<a class="btn primary" href="#obzvon-${p.id}" style="flex:1">${ic('phone-call')}В обзвон</a>`
          : p.takenBy ? `<span class="muted" style="flex:1;font-size:12.5px">Владелец: ${person(p.takenBy).name}. Компании пирожка закреплены.</span><button class="btn sm" data-ask="${p.id}">Попросить</button>`
            : `<button class="btn primary" data-take="${p.id}" style="flex:1">${ic('hand')}Беру</button><span class="faint" style="font-size:12px">${st.total} компаний</span>`}</div>
      </article>`;
    };
    const html = `
    <div class="page-head"><div><h1>Пирожки</h1><div class="sub">Кто что взял и сколько осталось до подачи. Взятый пирожок закрепляет свои компании за вами на 7 дней.</div></div>
      <div class="actions"><span class="seg">${[['all', 'Все'], ['free', 'Свободные'], ['mine', 'Мои'], ['hot', 'Горят']].map(([k, n]) => `<button class="${pieFilter === k ? 'on' : ''}" data-pf="${k}">${n}</button>`).join('')}</span></div></div>
    ${free.length ? `<div class="warn-line" style="margin-bottom:16px">${ic('corner-down-right')}<span><b>Если ваш пирожок отвалится, следующий свободный:</b> ${free.slice(0, 3).map(p => `${pieName(p)} (до ${dm(p.deadline)}, ${p.advance ? 'аванс ' + p.advance + ' %' : 'без аванса'})`).join('; ')}.</span></div>` : ''}
    ${list.length ? `<div class="pie-grid">${list.map(card).join('')}</div>`
      : `<div class="panel"><div class="empty"><div class="ico">${ic('croissant')}</div><b>${pieFilter === 'mine' ? 'Вы пока не взяли пирожок' : pieFilter === 'free' ? 'Свободных пирожков нет' : 'Горящих пирожков нет'}</b><span>${pieFilter === 'free' ? 'Павел добавит новые после разбора закупок.' : 'Посмотрите все пирожки.'}</span><button class="btn sm" data-pf="all">Показать все</button></div></div>`}`;
    return {
      html, mount: v => {
        $$('[data-pf]', v).forEach(b => b.onclick = () => { pieFilter = b.dataset.pf; A.render(); });
        $$('[data-take]', v).forEach(b => b.onclick = () => {
          const n = A.takePie(b.dataset.take); A.render();
          A.toast(`Пирожок ваш до ${dm(pie(b.dataset.take).takenUntil)}. За вами закреплено ${n} ${A.plural(n, 'компания', 'компании', 'компаний')}`, 'hand');
        });
        $$('[data-ask]', v).forEach(b => b.onclick = () => { const p = pie(b.dataset.ask); A.toast(`${person(p.takenBy).name} получит просьбу передать «${pieName(p)}»`, 'send'); });
      },
    };
  };
  A.setPieFilter = f => { pieFilter = f; };

  /* ---------- 4. Обзвон ---------- */
  const OUT = [
    { k: 'no_answer', n: 'Не дозвонился', i: 'phone-missed' },
    { k: 'dropped', n: 'Сбросил', i: 'phone-off' },
    { k: 'secretary', n: 'Секретарь', i: 'user-round' },
    { k: 'not_interested', n: 'Неинтересно', i: 'thumbs-down' },
    { k: 'callback', n: 'Перезвонить', i: 'calendar-clock' },
    { k: 'interest', n: 'Интересно', i: 'sparkles', good: true },
  ];
  const REASONS = ['Нет допуска СРО', 'Нет лицензии МЧС', 'Не работают с госзаказом', 'Загружены', 'Не их профиль', 'Уже работают с кем-то', 'Другое'];
  A.OUT = OUT;
  const outName = k => (OUT.find(o => o.k === k) || {}).n;

  function queueOf(pid) {
    return A.S.cos.filter(c => c.pie === pid && c.stage !== 'refused');
  }
  function dialState(pid) { const S = A.S; if (!S.dial[pid]) S.dial[pid] = { idx: 0, done: {} }; return S.dial[pid]; }
  let pendingOut = null, pendingReason = null, pendingWhen = null;

  A.recordOutcome = function (pid, cid, out, extra = {}) {
    const S = A.S, c = co(cid), ds = dialState(pid);
    const texts = { no_answer: 'Не дозвонился', dropped: 'Сбросил', secretary: 'Секретарь: ' + (extra.note || 'попросили отправить на почту'), not_interested: 'Неинтересно. Причина: ' + (extra.reason || 'не указана'), callback: 'Перезвонить ' + A.relDay(extra.d || A.addDays(A.TODAY, 1)) + ' в ' + (extra.t || '10:00'), interest: 'Интересно' + (extra.note ? ': ' + extra.note : '') };
    A.addHist(c, { type: 'call', out, text: texts[out] + (extra.note && out !== 'secretary' && out !== 'interest' ? '. ' + extra.note : ''), pie: pid });
    if (!c.owner) c.owner = S.me;
    if (out === 'not_interested') { c.stage = 'refused'; c.refusal = extra.reason; c.since = A.TODAY; c.next = null; }
    else if (out === 'interest') { c.stage = 'interest'; c.since = A.TODAY; c.next = { d: extra.d || A.addDays(A.TODAY, 1), t: extra.t || '10:00', text: extra.nextText || 'Отправить пирожок и уточнить профиль' }; }
    else if (out === 'callback') { if (c.stage === 'base') c.stage = 'calling'; c.since = c.since || A.TODAY; c.next = { d: extra.d || A.addDays(A.TODAY, 1), t: extra.t || '10:00', text: 'Перезвонить' + (extra.note ? ': ' + extra.note : '') }; }
    else if (c.stage === 'base') { c.stage = 'calling'; c.since = A.TODAY; }
    ds.done[cid] = out; ds.idx++;
    A.save();
  };
  A.skipCompany = function (pid, cid) { const ds = dialState(pid); ds.done[cid] = 'skip'; ds.idx++; A.save(); };

  A.screens.obzvon = function (arg) {
    const S = A.S;
    const pid = arg || (S.pies.find(p => p.takenBy === S.me) || {}).id;
    if (!pid || !pie(pid)) {
      return { html: `<div class="page-head"><div><h1>Обзвон</h1><div class="sub">Очередь компаний по пирожку: одна на экране, исход в один клик</div></div></div>
        <div class="panel"><div class="empty" style="padding:56px 20px"><div class="ico">${ic('phone-call')}</div><b>Сначала возьмите пирожок</b><span style="max-width:46ch">Без владельца компанию нельзя поставить в обзвон. Возьмите пирожок, и его компании закрепятся за вами на 7 дней.</span><a class="btn primary" href="#pirozhki">${ic('croissant')}Выбрать пирожок</a></div></div>`, crumbs: ['Обзвон'] };
    }
    const p = pie(pid), q = queueOf(pid), ds = dialState(pid);
    const refusedN = S.cos.filter(c => c.pie === pid && c.stage === 'refused' && !ds.done[c.id]).length;
    const doneN = Object.keys(ds.done).length;
    const total = q.length + Object.keys(ds.done).filter(id => !q.some(c => c.id === id)).length;
    const list = S.cos.filter(c => c.pie === pid && (c.stage !== 'refused' || ds.done[c.id]));
    const cur = list.find(c => !ds.done[c.id]);
    const pos = cur ? list.indexOf(cur) + 1 : list.length;
    const cd = A.countdown(p);
    const top = `<div class="dial-top">
      <div><div class="eyebrow">Обзвон по пирожку</div><div class="row" style="gap:10px;margin-top:2px"><h1 style="font-size:20px;font-weight:800;letter-spacing:-.02em">${pieName(p)}</h1><span class="countdown ${cd.hot ? 'hot' : ''}" data-tip="Подача до ${dm(p.deadline)}">${ic('timer')}${cd.txt}</span></div></div>
      <div class="dial-prog" id="dial-prog"><div class="row"><span>${cur ? `${pos} из ${list.length}` : `Все ${list.length} обработаны`}</span><span class="faint">${doneN} с исходом · ${refusedN} в отказе не звоним</span></div><div class="prog"><i style="width:${doneN / list.length * 100}%"></i></div></div>
      <div class="row hide-mob"><a class="btn" href="#pirozhki">${ic('repeat')}Другой пирожок</a></div></div>`;
    if (!cur) {
      const res = {}; list.forEach(c => { const o = ds.done[c.id]; res[o] = (res[o] || 0) + 1; });
      return { crumbs: ['Обзвон', pieName(p)], html: top + `<div class="panel"><div class="empty" style="padding:48px 20px"><div class="ico" style="background:var(--accent-soft);color:var(--accent-text);border:0">${ic('check-check')}</div><b>Очередь пройдена</b>
        <span>${Object.entries(res).map(([k, n]) => `${k === 'skip' ? 'Пропущено' : outName(k)}: ${n}`).join(' · ')}</span>
        <div class="row" style="margin-top:6px"><a class="btn" href="#moy-den">Мой день</a><a class="btn primary" href="#planerka">Посмотреть планёрку</a></div>
        <button class="btn sm ghost" id="dial-restart">${ic('rotate-ccw')}Пройти заново</button></div></div>`, mount: v => { $('#dial-restart', v).onclick = () => { delete S.dial[pid]; A.save(); A.render(); }; } };
    }
    const c = cur;
    const blockedOwner = A.isLocked(c) && !c.dnc;
    const calls30 = c.history.filter(h => h.type === 'call' && A.dayDiff(h.d) <= 30);
    const callers = [...new Set(calls30.map(h => h.who))];
    const pieSent = c.history.find(h => h.out === 'pie' && h.pie === pid);
    const notMine = p.takenBy !== S.me;
    const blocked = !!c.dnc || blockedOwner || notMine;
    const banners = [];
    if (notMine) banners.push(p.takenBy ? `<div class="warn-line">${ic('lock')}<span><b>Пирожок закреплён: ${person(p.takenBy).name} до ${dm(p.takenUntil)}.</b> Его компании в обзвоне у владельца. Можно попросить передать пирожок.</span></div>`
      : `<div class="warn-line" style="background:var(--accent-soft);border-color:color-mix(in srgb,var(--accent) 30%,transparent)">${ic('hand')}<span style="flex:1"><b>Пирожок свободен.</b> Возьмите его, и свободные компании закрепятся за вами на 7 дней. Без владельца звонить нельзя.</span><button class="btn sm primary" id="take-here">Беру</button></div>`);
    if (c.dnc) banners.push(`<div class="dnc-banner" id="dnc-banner">${ic('hand')}<div><b>Не звонить: клиент в переговорах. Владелец: ${person(c.owner).name}</b><span>${esc(c.dnc)}</span><div class="row" style="margin-top:10px;flex-wrap:wrap"><button class="btn sm warn" data-skip style="background:var(--surface)">${ic('skip-forward')}Пропустить</button><button class="btn sm ghost" data-msg="${c.owner}" style="color:var(--dnc-text)">${ic('message-square')}Написать владельцу</button></div></div></div>`);
    if (blockedOwner) banners.push(`<div class="warn-line">${ic('lock')}<span><b>Занято: ${person(c.owner).name}${c.lockUntil ? ' до ' + dm(c.lockUntil) : ''}.</b> ${A.stage(c.stage).name}, ${c.next ? 'следующий шаг ' + A.relDay(c.next.d) : 'шаг не назначен'}. <button class="btn sm" data-msg="${c.owner}" style="margin-left:6px">Попросить передать</button></span></div>`);
    if (calls30.length >= 5) banners.push(`<div class="warn-line hot">${ic('triangle-alert')}<span><b>Звонили ${calls30.length} раз за 30 дней, ${callers.length} ${A.plural(callers.length, 'менеджер', 'менеджера', 'менеджеров')}.</b> Последний исход: «${esc(calls30[0].text)}». Лучше пропустить или звонить с новым поводом.</span></div>`);
    if (pieSent && !c.dnc) banners.push(`<div class="warn-line">${ic('info')}<span>Этот пирожок уже отправлен ${dm(pieSent.d)}, отправитель: ${person(pieSent.who).name}.</span></div>`);
    const ext = pendingOut && !blocked ? extraForm(pendingOut) : '';
    const html = top + `
    <div class="dial">
      <div class="stack" style="gap:16px">
        <section class="panel" id="dial-company"><div class="panel-b" style="padding:18px 20px">
          ${banners.join('')}
          <div class="row" style="align-items:flex-start;gap:12px"><div style="flex:1;min-width:0"><a class="co-name" href="#kompaniya-${c.id}">${esc(c.name)}</a>
            <div class="co-meta"><span>${ic('hash')}ИНН <span class="mono">${c.inn}</span></span><span>${ic('map-pin')}${c.city}</span><span>${ic('wrench')}${c.works.join(', ')}</span>${c.licenses.length ? `<span>${ic('shield-check')}${c.licenses.join(', ')}</span>` : ''}</div></div>
            <div class="row" style="gap:6px">${c.dnc ? '<span class="badge dnc">Не звонить</span>' : ''}${c.owner ? av(c.owner) : '<span class="badge">Свободна</span>'}</div></div>
          <div class="phone-row"><span class="phone-num">${c.phone}</span>
            ${blocked ? `<button class="btn call" disabled>${ic('phone')}Позвонить</button>` : `<a class="btn primary call" href="tel:${c.phone.replace(/[^\d+]/g, '')}">${ic('phone')}Позвонить</a>`}
            <button class="btn icon" data-copy="${c.phone}" data-tip="Скопировать номер">${ic('copy')}</button></div>
          <div class="muted" style="font-size:12.5px">${ic('user')} ${esc(c.contact.name)}, ${c.contact.role}</div>
        </div></section>
        <section class="panel hist"><div class="panel-h"><h3>${ic('history')}История касаний</h3><span class="meta">все менеджеры · ${c.history.length}</span></div>
          <div class="panel-b">${c.history.length ? feed(c.history.slice(0, 8)) : `<div class="empty" style="padding:18px"><div class="ico">${ic('phone')}</div><b>Звонков ещё не было</b><span>Вы первый. Исход появится здесь и у всех коллег.</span></div>`}</div></section>
      </div>
      <div class="stack" style="gap:16px">
        <section class="panel" id="outcomes-panel"><div class="panel-h"><h3>${ic('mouse-pointer-click')}Исход звонка</h3><span class="meta hide-mob">клавиши 1–6</span></div>
          <div class="panel-b">
            ${blocked ? `<div class="empty" style="padding:18px 8px"><div class="ico">${ic('lock')}</div><b>${notMine && !c.dnc ? (p.takenBy ? 'Пирожок у коллеги' : 'Сначала возьмите пирожок') : c.dnc ? 'Звонить нельзя' : 'Компания закреплена за коллегой'}</b><span>${notMine && !c.dnc ? 'Исходы откроются, когда пирожок будет вашим.' : 'Исходы недоступны. Пропустите компанию.'}</span><button class="btn primary" data-skip id="skip-btn">${ic('skip-forward')}Пропустить</button></div>`
              : `<div class="outcomes" id="outcomes">${OUT.map((o, i) => `<button class="oc ${o.good ? 'good' : ''} ${pendingOut === o.k ? 'sel' : ''}" data-out="${o.k}">${ic(o.i)}${o.n}<span class="k">${i + 1}</span></button>`).join('')}</div>
              ${ext}
              <div class="field" style="margin-top:12px"><label for="dial-note">Заметка (необязательно)</label><input class="input" id="dial-note" placeholder="Например: директор Тимур, просил на почту" value="${esc(S._note || '')}"></div>
              <div class="row" style="margin-top:12px;justify-content:space-between"><button class="btn ghost" data-skip>${ic('skip-forward')}Пропустить</button>${pendingOut ? `<button class="btn primary" id="save-out">Записать и дальше ${ic('arrow-right')}</button>` : '<span class="faint" style="font-size:12px">Простые исходы записываются сразу</span>'}</div>`}
          </div></section>
        <section class="panel queue-list hide-mob"><div class="panel-h"><h3>${ic('list-ordered')}Очередь</h3><span class="meta num">${list.length}</span></div>
          <div class="list">${list.map((x, i) => `<div class="li ${x === c ? 'cur' : ''} ${ds.done[x.id] ? 'done' : ''}"><span class="qn">${i + 1}</span><span class="ell" style="flex:1;font-weight:${x === c ? 750 : 600}">${esc(x.name)}</span>${x.dnc ? '<span class="badge dnc">Не звонить</span>' : ''}${ds.done[x.id] ? `<span class="faint" style="font-size:12px">${ds.done[x.id] === 'skip' ? 'пропущена' : outName(ds.done[x.id]).toLowerCase()}</span>` : (x.owner && x.owner !== S.me && !x.dnc ? av(x.owner, 'xs') : '')}</div>`).join('')}</div></section>
      </div>
    </div>`;
    return {
      crumbs: ['Обзвон', pieName(p)], html, mount: v => {
        const note = () => ($('#dial-note', v) || {}).value || '';
        const th = $('#take-here', v); if (th) th.onclick = () => { const n = A.takePie(pid); A.render(); A.toast(`Пирожок ваш до ${dm(pie(pid).takenUntil)}. Закреплено ${n} ${A.plural(n, 'компания', 'компании', 'компаний')}`, 'hand'); };
        $$('[data-skip]', v).forEach(b => b.onclick = () => { A.skipCompany(pid, c.id); pendingOut = null; S._note = ''; A.toast('Пропустили. Следующая компания', 'skip-forward'); A.render(); });
        $$('[data-msg]', v).forEach(b => b.onclick = () => A.toast(`${person(b.dataset.msg).name} получит сообщение со ссылкой на компанию`, 'send'));
        $$('[data-copy]', v).forEach(b => b.onclick = () => { try { navigator.clipboard.writeText(b.dataset.copy).catch(() => { }); } catch (e) { } A.toast('Номер скопирован', 'copy'); });
        const pick = k => {
          if (['no_answer', 'dropped', 'secretary'].includes(k)) {
            A.recordOutcome(pid, c.id, k, { note: note() }); pendingOut = null; S._note = '';
            A.toast(`Записано: ${outName(k)}. Следующая компания`); A.render();
          } else { S._note = note(); pendingOut = k; pendingReason = null; pendingWhen = null; A.render(); }
        };
        $$('[data-out]', v).forEach(b => b.onclick = () => pick(b.dataset.out));
        $$('[data-reason]', v).forEach(b => b.onclick = () => { pendingReason = b.dataset.reason; $$('[data-reason]', v).forEach(x => x.classList.toggle('on', x === b)); });
        $$('[data-when]', v).forEach(b => b.onclick = () => { pendingWhen = b.dataset.when.split('|'); $$('[data-when]', v).forEach(x => x.classList.toggle('on', x === b)); const [d, t] = pendingWhen; const di = $('#cb-date', v), ti = $('#cb-time', v); if (di) di.value = d; if (ti) ti.value = t; });
        const sv = $('#save-out', v);
        if (sv) sv.onclick = () => {
          const ex = { note: note() };
          if (pendingOut === 'not_interested') { if (!pendingReason) { A.toast('Выберите причину отказа', 'info'); return; } ex.reason = pendingReason; }
          if (pendingOut === 'callback' || pendingOut === 'interest') { ex.d = ($('#cb-date', v) || {}).value || A.addDays(A.TODAY, 1); ex.t = ($('#cb-time', v) || {}).value || '10:00'; ex.nextText = ($('#cb-text', v) || {}).value; }
          const k = pendingOut;
          A.recordOutcome(pid, c.id, k, ex); pendingOut = null; S._note = '';
          A.toast(k === 'interest' ? `Клиент «${c.name}» ваш. Следующий шаг: ${A.relDay(ex.d)} в ${ex.t}` : `Записано: ${outName(k)}. Следующая компания`, k === 'interest' ? 'sparkles' : 'check');
          A.render();
        };
        A._dialKeys = e => {
          if (location.hash.indexOf('#obzvon') !== 0 || blocked || /input|textarea|select/i.test(document.activeElement.tagName) || document.getElementById('modal')) return;
          const n = +e.key; if (n >= 1 && n <= 6) pick(OUT[n - 1].k);
        };
      },
    };
  };
  document.addEventListener('keydown', e => A._dialKeys && A._dialKeys(e));
  A.resetDialUi = () => { pendingOut = null; pendingReason = null; pendingWhen = null; };
  A.setPendingOut = k => { pendingOut = k; };

  function extraForm(k) {
    const tmr = A.addDays(A.TODAY, 1);
    const whenChips = [[A.TODAY + '|16:00', 'Сегодня 16:00'], [tmr + '|10:00', 'Завтра 10:00'], [tmr + '|14:00', 'Завтра 14:00'], [A.addDays(A.TODAY, 4) + '|10:00', 'Пн 10:00']];
    if (k === 'not_interested') return `<div class="oc-extra"><div class="eyebrow">Причина отказа</div><div class="chips">${REASONS.map(r => `<button class="chip ${pendingReason === r ? 'on' : ''}" data-reason="${r}">${r}</button>`).join('')}</div><span class="faint" style="font-size:12px">Компания уйдёт в отказ. Коллеги увидят причину при импорте и поиске.</span></div>`;
    const dflt = (pendingWhen || [tmr, '10:00']);
    return `<div class="oc-extra"><div class="eyebrow">${k === 'interest' ? 'Следующий шаг: без него сделка покраснеет' : 'Когда перезвонить'}</div>
      <div class="chips">${whenChips.map(([v, n]) => `<button class="chip ${pendingWhen && pendingWhen.join('|') === v ? 'on' : ''}" data-when="${v}">${n}</button>`).join('')}</div>
      <div class="row" style="gap:8px"><input type="date" class="input" id="cb-date" value="${dflt[0]}" style="flex:1"><input type="time" class="input" id="cb-time" value="${dflt[1]}" style="width:110px"></div>
      ${k === 'interest' ? `<input class="input" id="cb-text" value="Отправить пирожок и уточнить профиль">` : ''}</div>`;
  }

  /* лента касаний — общая для обзвона и карточки */
  const EV = {
    no_answer: ['phone-missed', ''], dropped: ['phone-off', 'bad'], secretary: ['user-round', ''], not_interested: ['thumbs-down', 'bad'], callback: ['calendar-clock', ''],
    interest: ['sparkles', 'send'], pie: ['croissant', 'send'], pod: ['list-checks', 'send'], request: ['send', 'q'], contract: ['file-signature', 'send'], profile: ['clipboard-list', ''],
    signed: ['badge-check', 'send'], accred: ['key-round', ''], part: ['gavel', ''], result: ['trophy', 'send'], note: ['sticky-note', ''], question: ['circle-help', 'q'], answer: ['message-square-reply', 'q'], stage: ['move-right', ''],
  };
  function feed(items) {
    return `<div class="feed">${items.map(h => {
      const [i, cls] = EV[h.out] || ['dot', ''];
      const kind = h.type === 'call' ? 'звонок' : h.type === 'send' ? 'отправлено' : h.type === 'pod' ? 'запрос подборки' : h.type === 'note' ? 'заметка' : h.type === 'question' ? 'вопрос специалисту' : '';
      return `<div class="ev"><span class="ev-ico ${cls}">${ic(i)}</span><div style="min-width:0"><div class="ev-h">${av(h.who, 'xs')}<b>${person(h.who).name}</b><span class="faint">${kind}</span>${h.pie && h.out === 'pie' ? `<span class="tag">${pieName(pie(h.pie))}</span>` : ''}<span class="when">${A.relDay(h.d)} ${h.t}</span></div>
        <div class="ev-t">${esc(h.text)}</div></div></div>`;
    }).join('')}</div>`;
  }
  A.feed = feed;
})();
