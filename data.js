/* Все данные выдуманные. ИНН начинаются с кода региона 00 (такого региона нет),
   телефоны в диапазоне +7 (900) 000-…, совпадения с реальными компаниями случайны. */
(function () {
  const MANAGERS = [
    { id: 'maxim', name: 'Максим', ini: 'Ма', color: '#4f7cac' },
    { id: 'irina', name: 'Ирина', ini: 'Ир', color: '#a0617a' },
    { id: 'elya', name: 'Эля', ini: 'Эл', color: '#7a6bb8' },
    { id: 'sergey', name: 'Сергей', ini: 'Се', color: '#2f8a7e' },
    { id: 'ilyana', name: 'Ильяна', ini: 'Ил', color: '#b0703f' },
    { id: 'anastasia', name: 'Анастасия', ini: 'Ан', color: '#5b8f4e' },
    { id: 'vitaliy', name: 'Виталий', ini: 'Ви', color: '#6b7f95' },
  ];
  const SPECIALIST = { id: 'pavel', name: 'Павел', ini: 'Па', color: '#3d4a55', role: 'тендерный специалист' };

  const STAGES = [
    { id: 'base', name: 'В базе', c: 1 },
    { id: 'calling', name: 'В обзвоне', c: 1 },
    { id: 'interest', name: 'Интерес', c: 2 },
    { id: 'pie_sent', name: 'Пирожок отправлен', c: 2 },
    { id: 'profile', name: 'Профиль уточнён', c: 3 },
    { id: 'wait_pod', name: 'Ждёт подборку', c: 4 },
    { id: 'pod_sent', name: 'Подборка отправлена', c: 5 },
    { id: 'contract_sent', name: 'Договор отправлен', c: 6 },
    { id: 'signed', name: 'Договор подписан', c: 7 },
    { id: 'accred', name: 'Аккредитация', c: 7 },
    { id: 'participation', name: 'Участие', c: 7 },
    { id: 'result', name: 'Итог', c: 8 },
    { id: 'refused', name: 'Отказ', c: 1 },
  ];

  const PIES = [
    { id: 'kzn-vent', city: 'Казань', work: 'Вентиляция', title: 'Капремонт систем вентиляции и кондиционирования в городской поликлинике', amount: 18400000, advance: 30, deadline: '2026-11-10T09:00', law: '44-ФЗ', takenBy: null, takenUntil: null },
    { id: 'rzn-roof', city: 'Рязань', work: 'Кровля', title: 'Ремонт мягкой кровли двух учебных корпусов колледжа', amount: 7200000, advance: 20, deadline: '2026-11-07T10:00', law: '44-ФЗ', takenBy: 'maxim', takenUntil: '2026-11-12' },
    { id: 'uu-fire', city: 'Улан-Удэ', work: 'Пожарная безопасность', title: 'Монтаж пожарной сигнализации и системы оповещения в здании районной администрации', amount: 4900000, advance: 0, deadline: '2026-11-14T09:00', law: '44-ФЗ', takenBy: 'irina', takenUntil: '2026-11-11' },
    { id: 'spb-mont', city: 'Санкт-Петербург', work: 'Монтаж', title: 'Монтаж металлоконструкций навеса и входной группы спорткомплекса', amount: 26000000, advance: 15, deadline: '2026-11-10T12:00', law: '223-ФЗ', takenBy: 'elya', takenUntil: '2026-11-12' },
    { id: 'nsk-el', city: 'Новосибирск', work: 'Электрика', title: 'Замена внутренних электросетей и щитового оборудования в студенческом общежитии', amount: 11300000, advance: 30, deadline: '2026-11-19T10:00', law: '44-ФЗ', takenBy: null, takenUntil: null },
    { id: 'tmn-vent', city: 'Тюмень', work: 'Вентиляция', title: 'Реконструкция приточно-вытяжной вентиляции плавательного бассейна', amount: 9800000, advance: 25, deadline: '2026-11-21T10:00', law: '44-ФЗ', takenBy: null, takenUntil: null },
    { id: 'kzn-roof', city: 'Казань', work: 'Кровля', title: 'Капитальный ремонт кровли спортивного комплекса', amount: 5600000, advance: 30, deadline: '2026-11-07T18:00', law: '44-ФЗ', takenBy: 'anastasia', takenUntil: '2026-11-10' },
  ];

  const FIRST = ['Тимур', 'Олег', 'Наиль', 'Андрей', 'Рустем', 'Дмитрий', 'Алексей', 'Ринат', 'Игорь', 'Сергей', 'Евгений', 'Марат', 'Павел', 'Роман', 'Виктор', 'Денис', 'Артём', 'Илья', 'Светлана', 'Галина', 'Ольга', 'Наталья'];
  const PATR = ['Ринатович', 'Викторович', 'Ильдарович', 'Сергеевич', 'Петрович', 'Александрович', 'Олегович', 'Маратович', 'Юрьевич', 'Николаевич'];
  const ROLES = ['директор', 'главный инженер', 'коммерческий директор', 'руководитель тендерного отдела', 'заместитель директора', 'офис-менеджер'];

  // id, название, пирожок, этап, владелец, этап с даты, следующий шаг [дата, время, текст] | null, доп.
  const RAW = [
    // Казань, вентиляция (очередь обзвона для тура: k04, k03, k01 идут первыми)
    ['k04', 'ООО «Климат-Монтаж КЗН»', 'kzn-vent', 'base', null, null, null, { works: ['Вентиляция', 'Кондиционирование'] }],
    ['k03', 'ООО «ТатКлимат»', 'kzn-vent', 'contract_sent', 'maxim', '2026-11-02', ['2026-11-06', '11:00', 'Созвон с директором по договору'], { dnc: 'Договор у Максима, решает директор. С чужих пирожков не звонить.', works: ['Вентиляция', 'Отопление'], licenses: ['СРО строителей'] }],
    ['k01', 'ООО «Аэровент Поволжье»', 'kzn-vent', 'base', null, null, null, { works: ['Вентиляция', 'Дымоудаление'], licenses: ['СРО строителей', 'Лицензия МЧС'], contact: ['Тимур Ринатович', 'главный инженер'] }],
    ['k05', 'ООО «ВолгаВентСервис»', 'kzn-vent', 'base', null, null, null, { manyCalls: true, works: ['Вентиляция'] }],
    ['k06', 'ООО «Инженерные системы Камы»', 'kzn-vent', 'base', null, null, null, { works: ['Вентиляция', 'Водоснабжение'] }],
    ['k07', 'ООО «ТехноВоздух»', 'kzn-vent', 'base', null, null, null, { prevNoAnswer: 'elya', works: ['Вентиляция'] }],
    ['k08', 'ООО «Казанская вентиляционная компания»', 'kzn-vent', 'base', null, null, null, { works: ['Вентиляция', 'Кондиционирование'] }],
    ['k09', 'ООО «ЭкоКлимат Групп»', 'kzn-vent', 'base', null, null, null, { works: ['Кондиционирование'] }],
    ['k10', 'ООО «Микроклимат-Строй»', 'kzn-vent', 'calling', 'sergey', '2026-11-04', ['2026-11-05', '13:00', 'Перезвонить: директор будет после обеда'], { works: ['Вентиляция'] }],
    ['k11', 'ООО «АэроТехМонтаж»', 'kzn-vent', 'base', null, null, null, { works: ['Вентиляция', 'Монтаж'] }],
    ['k12', 'ООО «Альфа Вент»', 'kzn-vent', 'interest', 'anastasia', '2026-11-02', ['2026-11-06', '10:30', 'Отправить пирожок по Казани'], { lockUntil: '2026-11-09', works: ['Вентиляция'] }],
    ['k02', 'ООО «Вентстрой-Казань»', 'kzn-vent', 'refused', 'sergey', '2026-11-03', null, { refusal: 'Нет допуска СРО', works: ['Вентиляция'] }],
    ['k13', 'ООО «ВентЛайн Татарстан»', 'kzn-vent', 'refused', 'maxim', '2026-10-21', null, { refusal: 'Нет свободных бригад до весны', works: ['Вентиляция'] }],
    ['k14', 'ООО «Свежий воздух КЗН»', 'kzn-vent', 'refused', 'elya', '2026-10-24', null, { refusal: 'Не работают с госзаказом', works: ['Вентиляция'] }],
    ['k15', 'ООО «Термовент»', 'kzn-vent', 'refused', 'irina', '2026-10-29', null, { refusal: 'Малый объём, неинтересно', works: ['Вентиляция', 'Отопление'] }],
    ['k16', 'ООО «Климатика Плюс»', 'kzn-vent', 'refused', 'anastasia', '2026-11-02', null, { refusal: 'Только частные объекты', works: ['Кондиционирование'] }],

    // Рязань, кровля (пирожок горит)
    ['r01', 'ООО «Окский кровельный центр»', 'rzn-roof', 'interest', 'irina', '2026-10-30', null, { works: ['Кровля', 'Фасады'] }],
    ['r02', 'ООО «РязаньКровСтрой»', 'rzn-roof', 'wait_pod', 'maxim', '2026-11-03', ['2026-11-06', '12:00', 'Отправить подборку, когда будет готова'], { works: ['Кровля'], licenses: ['СРО строителей'] }],
    ['r03', 'ООО «Мещёра-Строй»', 'rzn-roof', 'pie_sent', 'maxim', '2026-11-04', ['2026-11-05', '14:00', 'Узнать решение по пирожку'], { works: ['Кровля', 'Общестрой'] }],
    ['r04', 'ООО «Кровля-62»', 'rzn-roof', 'calling', 'maxim', '2026-11-04', ['2026-11-05', '10:40', 'Перезвонить, не дозвонился'], { lockUntil: '2026-11-12', works: ['Кровля'] }],
    ['r05', 'ООО «ПромКровля Рязань»', 'rzn-roof', 'refused', 'irina', '2026-10-28', null, { refusal: 'Работают только с частными заказчиками', works: ['Кровля'] }],
    ['r06', 'ООО «СтройМастер Ока»', 'rzn-roof', 'profile', 'maxim', '2026-11-02', ['2026-11-05', '16:00', 'Собрать запрос на подборку'], { works: ['Кровля', 'Ремонт'] }],
    ['r07', 'ООО «Рязанский кровельщик»', 'rzn-roof', 'base', null, null, null, { works: ['Кровля'] }],
    ['r08', 'ООО «Универсал-Ремонт»', 'rzn-roof', 'signed', 'maxim', '2026-10-21', ['2026-11-09', '10:00', 'Подать заявку на 2 закупки'], { works: ['Кровля', 'Общестрой'], licenses: ['СРО строителей'] }],

    // Улан-Удэ, пожарная безопасность
    ['u01', 'ООО «Байкал-Пожсервис»', 'uu-fire', 'pod_sent', 'irina', '2026-10-29', null, { works: ['Пожарная безопасность'], licenses: ['Лицензия МЧС'] }],
    ['u02', 'ООО «Бурят-Пожзащита»', 'uu-fire', 'wait_pod', 'irina', '2026-11-02', ['2026-11-06', '09:30', 'Отправить подборку'], { works: ['Пожарная безопасность', 'Слаботочка'], licenses: ['Лицензия МЧС'] }],
    ['u03', 'ООО «Селенга Безопасность»', 'uu-fire', 'interest', 'irina', '2026-11-03', ['2026-11-06', '10:00', 'Отправить документы и пирожок'], { works: ['Пожарная безопасность'] }],
    ['u04', 'ООО «Огнезащита-Байкал»', 'uu-fire', 'base', null, null, null, { works: ['Огнезащита'] }],
    ['u05', 'ООО «Сибирь-Сигнал»', 'uu-fire', 'refused', 'irina', '2026-10-31', null, { refusal: 'Нет лицензии МЧС', works: ['Слаботочка'] }],
    ['u06', 'ООО «Восток-Пожмонтаж»', 'uu-fire', 'accred', 'irina', '2026-10-27', ['2026-11-05', '15:00', 'Проверить аккредитацию на площадке'], { works: ['Пожарная безопасность'], licenses: ['Лицензия МЧС', 'СРО строителей'] }],

    // Санкт-Петербург, монтаж
    ['s01', 'ООО «Невский монтаж»', 'spb-mont', 'contract_sent', 'elya', '2026-10-31', ['2026-11-05', '11:00', 'Напомнить про договор'], { dnc: 'Договор у Эли с 31.10, ждём подписи. Не звонить с других пирожков.', works: ['Металлоконструкции', 'Монтаж'], licenses: ['СРО строителей'] }],
    ['s02', 'ООО «Балтстальмонтаж»', 'spb-mont', 'wait_pod', 'elya', '2026-11-04', ['2026-11-06', '11:00', 'Отправить подборку'], { works: ['Металлоконструкции'] }],
    ['s03', 'ООО «ПитерМонтажГрупп»', 'spb-mont', 'interest', 'elya', '2026-11-04', ['2026-11-05', '11:30', 'Уточнить профиль: регионы и допуски'], { works: ['Монтаж', 'Общестрой'] }],
    ['s04', 'ООО «Охта-Конструкция»', 'spb-mont', 'base', null, null, null, { works: ['Металлоконструкции'] }],
    ['s05', 'ООО «СК Ладога»', 'spb-mont', 'participation', 'elya', '2026-10-25', ['2026-11-12', '10:00', 'Итоговый протокол по закупке'], { works: ['Общестрой', 'Монтаж'], licenses: ['СРО строителей'] }],
    ['s06', 'ООО «Металл-Север»', 'spb-mont', 'pie_sent', 'sergey', '2026-11-04', ['2026-11-05', '16:30', 'Узнать, смотрели ли пирожок по Питеру'], { works: ['Металлоконструкции'] }],
    ['s07', 'ООО «Кронверк Инжиниринг»', 'spb-mont', 'pie_sent', 'elya', '2026-11-03', ['2026-11-06', '14:00', 'Узнать решение'], { works: ['Монтаж'] }],
    ['s08', 'ООО «Финский залив Строй»', 'spb-mont', 'refused', 'elya', '2026-11-01', null, { refusal: 'Загружены до весны', works: ['Общестрой'] }],

    // Новосибирск, электрика
    ['n01', 'ООО «СибЭлектроМонтаж»', 'nsk-el', 'result', 'vitaliy', '2026-10-30', ['2026-11-10', '10:00', 'Выставить счёт: победа'], { won: true, works: ['Электромонтаж'], licenses: ['СРО строителей'] }],
    ['n02', 'ООО «Обь-Энерго Сервис»', 'nsk-el', 'contract_sent', 'vitaliy', '2026-11-04', ['2026-11-06', '12:00', 'Получить подписанный договор'], { dnc: 'Договор у Виталия, отправлен 04.11.', works: ['Электромонтаж'] }],
    ['n03', 'ООО «ЭлектроПрофи НСК»', 'nsk-el', 'wait_pod', 'sergey', '2026-11-03', ['2026-11-06', '10:00', 'Отправить подборку'], { works: ['Электромонтаж', 'Слаботочка'] }],
    ['n04', 'ООО «Академ-Электро»', 'nsk-el', 'base', null, null, null, { works: ['Электромонтаж'] }],
    ['n05', 'ООО «Сибирский провод»', 'nsk-el', 'base', null, null, null, { works: ['Электромонтаж'] }],
    ['n06', 'ООО «Вольт-Строй»', 'nsk-el', 'wait_pod', 'vitaliy', '2026-11-01', ['2026-11-05', '12:00', 'Узнать у Павла про подборку'], { works: ['Электромонтаж'] }],

    // Тюмень, вентиляция
    ['t01', 'ООО «Тура-Вент»', 'tmn-vent', 'interest', 'ilyana', '2026-11-04', ['2026-11-05', '15:00', 'Отправить пирожок по Тюмени'], { works: ['Вентиляция'] }],
    ['t02', 'ООО «ТюменьКлимат»', 'tmn-vent', 'signed', 'ilyana', '2026-10-28', ['2026-11-06', '10:00', 'Помочь с аккредитацией'], { works: ['Вентиляция', 'Кондиционирование'], licenses: ['СРО строителей'] }],
    ['t03', 'ООО «Западно-Сибирская вентиляция»', 'tmn-vent', 'interest', 'sergey', '2026-11-04', ['2026-11-05', '11:00', 'Перезвонить: обещали решить до обеда'], { works: ['Вентиляция'] }],
    ['t04', 'ООО «Вент-Альянс 72»', 'tmn-vent', 'base', null, null, null, { works: ['Вентиляция'] }],
    ['t05', 'ООО «Северный воздух»', 'tmn-vent', 'profile', 'ilyana', '2026-10-31', null, { works: ['Вентиляция', 'Отопление'] }],

    // Казань, кровля
    ['q01', 'ООО «Казань-Кровля»', 'kzn-roof', 'wait_pod', 'anastasia', '2026-11-04', ['2026-11-06', '15:00', 'Отправить подборку'], { works: ['Кровля'] }],
    ['q02', 'ООО «ТатКровСтрой»', 'kzn-roof', 'pod_sent', 'anastasia', '2026-11-03', ['2026-11-06', '11:00', 'Обсудить подборку и договор'], { works: ['Кровля', 'Фасады'] }],
    ['q03', 'ООО «Кровельный союз Татарстана»', 'kzn-roof', 'base', null, null, null, { works: ['Кровля'] }],
    ['q04', 'ООО «Изокров»', 'kzn-roof', 'interest', 'anastasia', '2026-11-04', ['2026-11-05', '12:00', 'Отправить пирожок'], { works: ['Кровля', 'Изоляция'] }],
    ['q05', 'ООО «Ремкровля КЗН»', 'kzn-roof', 'base', null, null, null, { works: ['Кровля'] }],
  ];

  const ORDER = STAGES.map(s => s.id);
  function addDays(d, n) { const x = new Date(d + 'T12:00'); x.setDate(x.getDate() + n); return x.toISOString().slice(0, 10); }

  function hist(id, stage, owner, since, pieId) {
    const h = [];
    if (!owner || stage === 'base') return h;
    const idx = ORDER.indexOf(stage);
    const steps = ['interest', 'pie_sent', 'profile', 'wait_pod', 'pod_sent', 'contract_sent', 'signed', 'accred', 'participation', 'result'];
    const reached = steps.filter(s => ORDER.indexOf(s) <= idx && stage !== 'refused' && stage !== 'calling');
    let d = addDays(since, -(reached.length * 2 + 1));
    h.push({ d, t: '10:' + (12 + (id.charCodeAt(1) % 40)), who: owner, type: 'call', out: 'no_answer', text: 'Не дозвонился' });
    d = addDays(d, 1);
    if (stage === 'calling') { h.push({ d: since, t: '15:20', who: owner, type: 'call', out: 'callback', text: 'Секретарь: директор будет позже, просили перезвонить' }); return h; }
    if (stage === 'refused') return h;
    const texts = {
      interest: ['call', 'interest', 'Интересно. Работают по госзаказу, хотят смотреть закупки с авансом'],
      pie_sent: ['send', 'pie', 'Отправлен пирожок'],
      profile: ['call', 'profile', 'Уточнили профиль: регионы, виды работ, допуски'],
      wait_pod: ['pod', 'request', 'Запрошена подборка у Павла'],
      pod_sent: ['send', 'pod', 'Подборка отправлена: 6 закупок'],
      contract_sent: ['send', 'contract', 'Отправлен договор на 7 закупок'],
      signed: ['stage', 'signed', 'Договор подписан'],
      accred: ['stage', 'accred', 'Начата аккредитация на площадке'],
      participation: ['stage', 'part', 'Подана заявка на закупку'],
      result: ['stage', 'result', 'Итоговый протокол: победа'],
    };
    reached.forEach((s, i) => {
      const day = i === reached.length - 1 ? since : d;
      const [type, out, text] = texts[s];
      h.push({ d: day, t: ['11:05', '12:40', '14:15', '16:30', '10:50'][i % 5], who: s === 'pod_sent' ? owner : owner, type, out, text, pie: s === 'pie_sent' ? pieId : undefined });
      d = addDays(d, 2);
    });
    return h;
  }

  function hash(s) { let h = 7; for (const ch of s) h = (h * 31 + ch.charCodeAt(0)) % 100000000; return h; }

  const COMPANIES = RAW.map(([id, name, pie, stage, owner, since, next, x]) => {
    const p = PIES.find(p => p.id === pie);
    const h = hash(id + name);
    const fn = FIRST[h % FIRST.length], pt = PATR[(h >> 3) % PATR.length];
    const contact = x.contact ? { name: x.contact[0], role: x.contact[1] } : { name: fn + ' ' + (/(а|я)$/.test(fn) ? pt.replace('ович', 'овна').replace('евич', 'евна') : pt), role: ROLES[h % ROLES.length] };
    const c = {
      id, name, pie, city: p.city, stage, owner, since: since || null,
      next: next ? { d: next[0], t: next[1], text: next[2] } : null,
      inn: '00' + String(10000000 + (h % 89999999)).slice(0, 8),
      phone: '+7 (900) 000-' + String(10 + (h % 89)) + '-' + String(10 + ((h >> 4) % 89)),
      contact, works: x.works || [p.work], licenses: x.licenses || [],
      dnc: x.dnc || null, refusal: x.refusal || null, lockUntil: x.lockUntil || null, won: !!x.won,
      profile: null, history: hist(id, stage, owner, since, pie), questions: [],
    };
    if (['profile', 'wait_pod', 'pod_sent', 'contract_sent', 'signed', 'accred', 'participation', 'result'].includes(stage)) {
      c.profile = { regions: [p.city === 'Санкт-Петербург' ? 'Санкт-Петербург и Ленобласть' : p.city + ' и область'], works: c.works, licenses: c.licenses.length ? c.licenses : ['Нет'], min: '3 млн ₽', advance: 'Только с авансом' };
    }
    if (stage === 'refused') c.history.push({ d: since, t: '11:20', who: owner, type: 'call', out: 'not_interested', text: 'Неинтересно. Причина: ' + x.refusal });
    if (x.prevNoAnswer) c.history.push({ d: '2026-11-01', t: '15:42', who: x.prevNoAnswer, type: 'call', out: 'no_answer', text: 'Не дозвонился (с пирожка «Тюмень, вентиляция»)' });
    if (x.manyCalls) {
      const who = ['maxim', 'irina', 'elya', 'maxim', 'vitaliy', 'irina', 'anastasia', 'elya', 'maxim'];
      const outs = [['no_answer', 'Не дозвонился'], ['secretary', 'Секретарь: «пришлите на почту»'], ['dropped', 'Сбросил'], ['no_answer', 'Не дозвонился'], ['secretary', 'Секретарь: «директор в отъезде»'], ['dropped', 'Сбросил'], ['not_interested', 'Неинтересно: «вы уже десятый звоните»'], ['no_answer', 'Не дозвонился'], ['dropped', 'Сбросил']];
      const days = ['2026-10-08', '2026-10-09', '2026-10-13', '2026-10-15', '2026-10-20', '2026-10-22', '2026-10-27', '2026-10-30', '2026-11-03'];
      who.forEach((w, i) => c.history.push({ d: days[i], t: ['10:15', '11:40', '12:05', '14:30', '15:10', '16:45', '10:55', '13:20', '17:05'][i], who: w, type: 'call', out: outs[i][0], text: outs[i][1] }));
    }
    c.history.sort((a, b) => (b.d + b.t).localeCompare(a.d + a.t));
    return c;
  });

  // точечные истории для сценариев
  const by = id => COMPANIES.find(c => c.id === id);
  by('k03').history.unshift({ d: '2026-11-04', t: '17:10', who: 'maxim', type: 'note', out: 'note', text: 'Директор читает договор, просил не дёргать до пятницы. Решение за ним.' });
  by('k03').contact = { name: 'Рамиль Фаридович', role: 'директор' };
  by('r02').questions.push({ q: 'Нужен ли клиенту СРО на ремонт кровли за 7,2 млн?', by: 'maxim', d: '2026-11-03', t: '12:10', a: 'В этой закупке требования о членстве в СРО нет. СРО обязательно, если контракт на строительство или капремонт дороже 10 млн ₽. Смотри раздел «Требования к участникам» в извещении.', aD: '2026-11-03', aT: '13:02' });
  by('s01').questions.push({ q: 'Клиент спрашивает: «60 тысяч вперёд платить?»', by: 'elya', d: '2026-10-31', t: '15:30', a: 'Нет. Вперёд ничего не платят. Участие оплачивается после итогового протокола. На первом звонке говорим только про 2 % после победы.', aD: '2026-10-31', aT: '15:51' });
  by('u02').questions.push({ q: 'Можно участвовать без лицензии МЧС, если монтаж сделает субподрядчик с лицензией?', by: 'irina', d: '2026-11-04', t: '16:20', a: null });
  by('s01').history.unshift({ d: '2026-11-03', t: '12:00', who: 'elya', type: 'call', out: 'no_answer', text: 'Не дозвонились, договор пока не подписан' });
  by('u01').history.unshift({ d: '2026-10-30', t: '10:20', who: 'irina', type: 'call', out: 'secretary', text: 'Секретарь: директор посмотрит подборку и сам позвонит' });
  by('r01').history.unshift({ d: '2026-10-30', t: '14:45', who: 'irina', type: 'call', out: 'interest', text: 'Интересно, но «позвоните после праздников». Следующий шаг не поставлен' });
  by('k10').history.unshift({ d: '2026-11-04', t: '16:05', who: 'sergey', type: 'call', out: 'callback', text: 'Секретарь: директор будет завтра после обеда' });

  // отправленные пирожки
  COMPANIES.forEach(c => {
    if (['pie_sent', 'profile', 'wait_pod', 'pod_sent', 'contract_sent', 'signed', 'accred', 'participation', 'result'].includes(c.stage)) {
      if (!c.history.some(h => h.out === 'pie')) c.history.push({ d: addDays(c.since, -3), t: '13:30', who: c.owner, type: 'send', out: 'pie', text: 'Отправлен пирожок', pie: c.pie });
    }
  });
  by('k12').history.unshift({ d: '2026-11-02', t: '12:30', who: 'anastasia', type: 'call', out: 'interest', text: 'Интересно, просили прислать пирожок по Казани' });
  // Пирожок «Казань, вентиляция» уже отправляли «ТатКлимату» — сценарий предупреждения
  by('k03').history.push({ d: '2026-10-27', t: '11:30', who: 'maxim', type: 'send', out: 'pie', text: 'Отправлен пирожок', pie: 'kzn-vent' });
  COMPANIES.forEach(c => c.history.sort((a, b) => (b.d + b.t).localeCompare(a.d + a.t)));

  const PODBORKI = [
    { id: 'pd1', co: 'r02', by: 'maxim', at: '2026-11-03T11:20', status: 'collecting', note: 'Только Рязанская обл., кровля, с авансом от 20 %' },
    { id: 'pd2', co: 'u02', by: 'irina', at: '2026-11-02T15:40', status: 'new', note: 'Бурятия и Иркутская обл., пожарка и слаботочка' },
    { id: 'pd3', co: 's02', by: 'elya', at: '2026-11-04T17:05', status: 'new', note: 'Металлоконструкции, СПб и Ленобласть, от 5 млн' },
    { id: 'pd4', co: 'n06', by: 'vitaliy', at: '2026-11-01T12:10', status: 'collecting', note: 'Электромонтаж, Новосибирск, без СРО' },
    { id: 'pd5', co: 'n03', by: 'sergey', at: '2026-11-03T10:30', status: 'new', note: 'Электрика и слаботочка, НСО, до 15 млн' },
    { id: 'pd6', co: 'q01', by: 'anastasia', at: '2026-11-04T09:50', status: 'new', note: 'Кровля, Татарстан, с авансом' },
    { id: 'pd7', co: 'u01', by: 'irina', at: '2026-10-27T10:00', status: 'sent', sentAt: '2026-10-29T16:00', count: 6, note: 'Пожарная безопасность, Бурятия' },
    { id: 'pd8', co: 'q02', by: 'anastasia', at: '2026-11-01T11:00', status: 'sent', sentAt: '2026-11-03T12:30', count: 8, note: 'Кровля и фасады, Казань' },
  ];

  const LEADS = [
    { id: 'l1', src: 'Авито', name: 'Ренат', company: 'ООО «ВентМастер»', city: 'Казань', work: 'Вентиляция', text: 'Монтируем вентиляцию, хотим заходить в госзакупки. Как с вами работать?', ago: 14, assigned: null },
    { id: 'l2', src: 'Авито', name: 'Елена', company: 'ИП Соколова', city: 'Рязань', work: 'Кровля', text: 'Нужны тендеры на кровлю по области, есть бригада 12 человек.', ago: 6, assigned: null },
    { id: 'l3', src: 'Сайт', name: 'Константин В.', company: 'ООО «ЭнергоЛайн»', city: 'Новосибирск', work: 'Электрика', text: 'Электромонтаж, есть СРО. Интересуют закупки с авансом.', ago: 42, assigned: null },
    { id: 'l4', src: 'Авито', name: 'Аюр', company: 'ООО «Байкал-Безопасность»', city: 'Улан-Удэ', work: 'Пожарная безопасность', text: 'Пожарная сигнализация, ищем работу на зиму.', ago: 95, assigned: 'irina', reply: 'Ирина: ответ в 09:12, созвон завтра в 11:00' },
    { id: 'l5', src: 'Звонок', name: 'Андрей', company: 'ООО «СтальКонструкт»', city: 'Санкт-Петербург', work: 'Монтаж', text: 'Металлоконструкции, спрашивал про участие в 223-ФЗ.', ago: 130, assigned: 'elya', reply: 'Эля: перезвон в 08:40, пирожок отправлен' },
  ];

  const YESTERDAY = {
    maxim: [48, 19, 4, 1], irina: [41, 17, 3, 0], elya: [52, 22, 5, 1], sergey: [37, 14, 2, 0],
    ilyana: [29, 11, 2, 1], anastasia: [44, 16, 3, 0], vitaliy: [33, 12, 1, 1],
  };
  // утренние звонки (05.11 до 10:00) — база для колонки «сегодня»
  const TODAY_BASE = { maxim: [3, 1, 0, 0], irina: [2, 1, 0, 0], elya: [4, 2, 1, 0], sergey: [0, 0, 0, 0], ilyana: [1, 0, 0, 0], anastasia: [2, 1, 0, 0], vitaliy: [1, 1, 0, 0] };

  const IMPORT = { file: 'СБИС_Казань_вентиляция_ноябрь.xlsx', rows: 100, pie: 'kzn-vent' };

  window.DEMO = { MANAGERS, SPECIALIST, STAGES, PIES, COMPANIES, PODBORKI, LEADS, YESTERDAY, TODAY_BASE, IMPORT, NOW: '2026-11-05T10:05' };
})();
