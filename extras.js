/* Доработки 06.11: мессенджеры, «номер не тот», договор, материалы, переписка, тишина клиента */
(function () {
  const A = window.App, { $, $$, esc, ic, dm, person } = A;

  /* ---------- пороги (одно место, записано в РЕШЕНИЯ.md) ---------- */
  A.SILENCE_H = 4;          // «Интересно» и тишина столько рабочих часов → «Напомнить о себе»
  A.WORK_FROM = 9;          // рабочий день, часы
  A.WORK_TO = 18;
  A.URGENT_DAYS = 3;        // до подачи меньше стольких дней → «Срок близко»
  A.PODBORKA_RED_MIN = 60;  // подборка ждёт дольше → красный таймер

  const stamp = () => A.TODAY + 'T' + A.hhmm();
  A.stamp = stamp;

  /* ---------- рабочие часы между двумя моментами (пн–пт) ---------- */
  A.workHours = function (from, to) {
    const f = new Date(from), t = new Date(to); let h = 0;
    const d = new Date(f); d.setHours(0, 0, 0, 0);
    while (d <= t) {
      const wd = d.getDay();
      if (wd > 0 && wd < 6) {
        const a = new Date(d); a.setHours(A.WORK_FROM, 0, 0, 0);
        const b = new Date(d); b.setHours(A.WORK_TO, 0, 0, 0);
        const s = Math.max(a, f), e = Math.min(b, t);
        if (e > s) h += (e - s) / 36e5;
      }
      d.setDate(d.getDate() + 1);
    }
    return h;
  };
  A.silentList = function (owner) {
    return A.S.cos.filter(c => c.waitReply && c.stage !== 'refused' && (!owner || c.owner === owner))
      .map(c => ({ c, h: A.workHours(c.waitReply, A.now()) })).filter(x => x.h >= A.SILENCE_H)
      .sort((a, b) => b.h - a.h);
  };
  A.silentTxt = h => h < 24 ? Math.floor(h) + ' раб. ч' : Math.floor(h / 9) + ' раб. дн';

  /* ---------- возраст запроса подборки: минуты, красный после часа ---------- */
  A.waitAge = function (at) {
    const m = Math.max(0, Math.floor((A.now() - new Date(at)) / 6e4));
    const txt = m < 60 ? m + ' мин' : m < 1440 ? Math.floor(m / 60) + ' ч ' + (m % 60) + ' мин' : Math.floor(m / 1440) + ' д ' + Math.floor(m % 1440 / 60) + ' ч';
    return { txt, hot: m > A.PODBORKA_RED_MIN, m };
  };

  /* ---------- мессенджеры ---------- */
  A.WA = 'https://wa.me/79000000000';
  A.TG = 'https://t.me/+79000000000';
  A.msgrBtns = () => `<a class="btn msgr" data-msgr="wa" href="${A.WA}" target="_blank" rel="noopener">${ic('message-circle')}<span>WhatsApp</span></a><a class="btn msgr" data-msgr="tg" href="${A.TG}" target="_blank" rel="noopener">${ic('send')}<span>Telegram</span></a>`;

  /* ---------- «номер не тот» ---------- */
  A.needPhone = c => !!c.badPhone && c.phone === c.badPhone;
  A.phoneHtml = (c, cls = 'phone-num') => c.badPhone
    ? `<span class="phone-bad"><span class="${cls} struck">${c.badPhone}</span><span class="badge hot">не их номер</span></span>${A.needPhone(c) ? '' : `<span class="${cls}">${c.phone}</span>`}`
    : `<span class="${cls}">${c.phone}</span>`;
  A.setWrongPhone = function (c, newPhone) {
    c.badPhone = c.badPhone || c.phone;
    if (newPhone) c.phone = newPhone;
  };
  A.searchMenu = function (c, anchor) {
    const ex = $('#find-menu'); if (ex) { ex.remove(); return; }
    const q = encodeURIComponent, n = q(c.name.replace(/[«»]/g, '')), inn = q(c.inn);
    const items = [
      ['Rusprofile (по ИНН)', 'https://www.rusprofile.ru/search?query=' + inn, 'building'],
      ['2ГИС (по названию)', 'https://2gis.ru/search/' + n, 'map'],
      ['Яндекс (название и ИНН)', 'https://yandex.ru/search/?text=' + n + '+' + inn + '+телефон', 'search'],
      ['Сайт компании', 'https://yandex.ru/search/?text=' + n + '+официальный+сайт', 'globe'],
    ];
    const m = document.createElement('div'); m.className = 'menu'; m.id = 'find-menu';
    m.innerHTML = `<div class="eyebrow" style="padding:6px 9px">Искать номер: ${esc(c.inn)}</div>` + items.map(([t, u, i]) => `<a class="mi" href="${u}" target="_blank" rel="noopener" data-find>${ic(i)}${t}</a>`).join('');
    anchor.parentElement.style.position = 'relative'; anchor.parentElement.appendChild(m); A.icons();
    setTimeout(() => document.addEventListener('click', function h(e) { if (!m.contains(e.target)) { m.remove(); document.removeEventListener('click', h); } }), 0);
  };

  /* ---------- договор одной кнопкой ---------- */
  const T = [['Разовое участие', '16 000 ₽ за закупку, засчитывается в вознаграждение при победе'], ['Пакет 7 закупок', '84 000 ₽ (по 12 000 ₽)'], ['Пакет 15 закупок', '105 000 ₽ (по 7 000 ₽)']];
  A.TARIFFS = T;
  const REQ = [['inn', 'ИНН', 1], ['ogrn', 'ОГРН', 0], ['address', 'Юридический адрес', 0], ['director', 'ФИО директора', 0], ['email', 'Почта для договора', 0]];
  A.contractModal = function (c) {
    const S = A.S; let tariff = c.tariff == null ? 1 : c.tariff;
    const field = ([k, n, ro]) => `<div class="field req-f ${c[k] ? '' : 'miss'}" data-fk="${k}"><label for="rq-${k}">${n}${c[k] ? '' : ' <span class="miss-t">заполните</span>'}</label><input class="input" id="rq-${k}" value="${esc(c[k] || '')}" ${ro ? 'readonly' : ''}></div>`;
    const o = A.modal({
      title: 'Отправить договор', sub: esc(c.name) + ' · превью', ok: 'Отправить на почту', wide: true,
      body: `<div class="contract-prev"><div class="eyebrow">Реквизиты и тариф из карточки</div><div class="cp-grid">${REQ.map(field).join('')}</div>
        <div class="field"><label>Тариф</label><div class="stack">${T.map((t, i) => `<label class="pick ${i === tariff ? 'on' : ''}" data-t="${i}"><input type="radio" name="tt" ${i === tariff ? 'checked' : ''} value="${i}"><div><div style="font-weight:750">${t[0]}</div><div class="faint" style="font-size:12px">${t[1]}</div></div></label>`).join('')}</div></div></div>
        <div class="warn-line" style="margin:12px 0 0">${ic('info')}<span>Во всех тарифах 2 % от суммы контракта при победе. Оплата за участие после итогового протокола, это не аванс.</span></div>
        <span class="faint" style="font-size:12px;display:block;margin-top:8px">После отправки клиент станет жёлтым «не звонить» для всех, кроме вас.</span>`,
      onMount: o => {
        $$('input[name=tt]', o).forEach(r => r.onchange = () => { tariff = +r.value; $$('.pick', o).forEach(x => x.classList.toggle('on', +x.dataset.t === tariff)); });
        $$('.req-f input', o).forEach(i => i.oninput = () => { const w = i.closest('.req-f'); w.classList.toggle('miss', !i.value.trim()); const t = $('.miss-t', w); if (t) t.hidden = !!i.value.trim(); });
        const wa = document.createElement('button'); wa.className = 'btn'; wa.id = 'send-wa'; wa.innerHTML = ic('message-circle') + 'Отправить в WhatsApp';
        $('.modal-f', o).insertBefore(wa, $('[data-ok]', o)); A.icons();
        wa.onclick = () => { if (doSend(o, 'wa')) A.closeModal(); };
      },
      onOk: o => doSend(o, 'mail') ? undefined : false,
    });
    function doSend(o, ch) {
      const val = k => ($('#rq-' + k, o).value || '').trim();
      const need = ['director', 'ogrn', 'address'].concat(ch === 'mail' ? ['email'] : []);
      const bad = need.filter(k => !val(k));
      $$('.req-f', o).forEach(w => w.classList.toggle('miss', !val(w.dataset.fk)));
      if (bad.length) { A.toast('Заполните подсвеченные поля, потом отправляйте', 'info'); return false; }
      ['director', 'ogrn', 'address', 'email'].forEach(k => c[k] = val(k)); c.tariff = tariff;
      A.addHist(c, { type: 'send', out: 'contract', text: 'Отправлен договор (' + (ch === 'mail' ? 'почта' : 'WhatsApp') + '): ' + T[tariff][0].toLowerCase() });
      c.stage = 'contract_sent'; c.since = A.TODAY; if (!c.owner) c.owner = S.me;
      c.dnc = `Договор отправлен ${dm(A.TODAY)}, владелец: ${person(c.owner).name}. Ждём подписи, с других пирожков не звонить.`;
      c.next = { d: A.addDays(A.TODAY, 2), t: '11:00', text: 'Узнать, подписан ли договор' };
      c.waitReply = stamp();
      A.save(); A.render(); A.toast('Договор ушёл. Клиент жёлтый «не звонить» для коллег', 'file-signature');
      return true;
    }
    return o;
  };

  /* ---------- материалы ---------- */
  A.MATERIALS = [['presentation', 'Презентация', 'presentation'], ['terms', 'Условия', 'file-text'], ['sample', 'Пример подборки', 'list-checks']];
  A.sendMaterial = function (c, key, ch) {
    const m = A.MATERIALS.find(x => x[0] === key);
    A.addHist(c, { type: 'send', out: 'material', text: 'Отправлено: ' + m[1].toLowerCase() + ' (' + (ch === 'mail' ? 'почта' : 'WhatsApp') + ')' });
    c.waitReply = stamp(); A.save();
  };
  A.materialModal = function (c, key = 'presentation') {
    let cur = key;
    const o = A.modal({
      title: key === 'presentation' ? 'Отправить презентацию' : 'Отправить материалы', sub: esc(c.name), ok: 'На почту',
      body: `<div class="stack">${A.MATERIALS.map(m => `<label class="pick ${m[0] === cur ? 'on' : ''}" data-m="${m[0]}"><input type="radio" name="mm" value="${m[0]}" ${m[0] === cur ? 'checked' : ''}>${ic(m[2])}<div style="font-weight:750">${m[1]}</div></label>`).join('')}</div>
        <span class="faint" style="font-size:12px">Отправка запишется в ленту касаний с датой. Если клиент молчит ${A.SILENCE_H} рабочих часа, карточка попадёт в «Напомнить о себе».</span>`,
      onMount: o => {
        $$('input[name=mm]', o).forEach(r => r.onchange = () => { cur = r.value; $$('.pick', o).forEach(x => x.classList.toggle('on', x.dataset.m === cur)); });
        const wa = document.createElement('button'); wa.className = 'btn'; wa.innerHTML = ic('message-circle') + 'В WhatsApp';
        $('.modal-f', o).insertBefore(wa, $('[data-ok]', o)); A.icons();
        wa.onclick = () => { A.sendMaterial(c, cur, 'wa'); A.closeModal(); A.render(); A.toast('Отправлено в WhatsApp. Записано в ленту', 'send'); };
      },
      onOk: () => {
        if (!c.email) { A.toast('В карточке нет почты: отправьте в WhatsApp или впишите почту в договоре', 'info'); return false; }
        A.sendMaterial(c, cur, 'mail'); A.render(); A.toast('Отправлено на почту. Записано в ленту', 'send');
      },
    });
    return o;
  };

  /* ---------- вставка из переписки ---------- */
  A.pasteModal = function (c) {
    let ch = 'WhatsApp', dir = 'in';
    A.modal({
      title: 'Вставить из переписки', sub: esc(c.name), ok: 'Добавить в ленту',
      body: `<div class="field"><label for="ps-text">Текст переписки</label><textarea class="input" id="ps-text" rows="4" placeholder="Скопируйте сюда сообщения клиента или наши"></textarea></div>
        <div class="field"><label for="ps-img">Или скриншот</label><input class="input" type="file" id="ps-img" accept="image/*"></div>
        <div class="row" style="gap:10px;flex-wrap:wrap"><div class="field" style="flex:1;min-width:140px"><label for="ps-date">Дата</label><input class="input" type="date" id="ps-date" value="${A.TODAY}"></div>
          <div class="field" style="flex:1;min-width:140px"><label>Кто написал</label><div class="chips"><button class="chip on" data-dir="in">Клиент</button><button class="chip" data-dir="out">Мы</button></div></div></div>
        <div class="field"><label>Канал</label><div class="chips">${['WhatsApp', 'Telegram', 'Почта'].map((x, i) => `<button class="chip ${i === 0 ? 'on' : ''}" data-ch="${x}">${x}</button>`).join('')}</div></div>
        <div class="warn-line" style="margin:0">${ic('info')}<span>Почему вручную: мессенджеры банят за массовые автосообщения, поэтому переписку вставляем сами.</span></div>`,
      onMount: o => {
        $$('[data-ch]', o).forEach(b => b.onclick = () => { ch = b.dataset.ch; $$('[data-ch]', o).forEach(x => x.classList.toggle('on', x === b)); });
        $$('[data-dir]', o).forEach(b => b.onclick = () => { dir = b.dataset.dir; $$('[data-dir]', o).forEach(x => x.classList.toggle('on', x === b)); });
      },
      onOk: o => {
        const text = $('#ps-text', o).value.trim(), f = $('#ps-img', o).files[0];
        if (!text && !f) { A.toast('Вставьте текст или выберите скриншот', 'info'); return false; }
        const d = $('#ps-date', o).value || A.TODAY;
        A.addHist(c, { d, type: 'chat', out: 'chat', text: `[${ch}, ${dir === 'in' ? 'клиент' : 'мы'}] ` + (text || '') + (f ? (text ? ' ' : '') + 'Скриншот: ' + f.name : '') });
        if (dir === 'in') c.waitReply = null; else c.waitReply = stamp();
        A.save(); A.render(); A.toast('Переписка добавлена в ленту', 'message-square-text');
      },
    });
  };

  document.addEventListener('click', e => {
    const b = e.target.closest('[data-mat]'); if (b) A.toast(b.dataset.mat + ': файл-заглушка, в макете не открывается', 'file-text');
  });
})();
