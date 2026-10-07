/* Условия заказа: сроки, этапы и расчёт стоимости.
   Чистые функции без доступа к DOM — их проверяет tests.html.
   Единая логика для карточки заказа, списков, кабинетов, истории и конструктора. */
(function () {
  const DAY = 86400000;
  const T = {};

  /* ---------- Даты ---------- */
  T.addDays = (iso, n) => {
    const d = new Date(iso);
    d.setDate(d.getDate() + n);
    d.setHours(20, 0, 0, 0);          // срок — до конца рабочего дня
    return d.toISOString();
  };
  T.addBusinessDays = (iso, n) => {
    const d = new Date(iso);
    let left = n;
    while (left > 0) {
      d.setDate(d.getDate() + 1);
      const wd = d.getDay();
      if (wd !== 0 && wd !== 6) left--;
    }
    d.setHours(20, 0, 0, 0);
    return d.toISOString();
  };
  const pl = (n, f) => {
    const a = Math.abs(n) % 100, b = a % 10;
    return f[a > 10 && a < 20 ? 2 : b > 1 && b < 5 ? 1 : b === 1 ? 0 : 2];
  };
  /* «10 календарных дней», «3 рабочих дня» */
  T.days = (n, type) => n + ' ' + (type === 'business' ? pl(n, ['рабочий день', 'рабочих дня', 'рабочих дней']) : pl(n, ['календарный день', 'календарных дня', 'календарных дней']));
  /* Родительный падеж: «до 2 рабочих дней», «в течение 1 рабочего дня» */
  T.daysGen = (n, type) => n + ' ' + (type === 'business' ? pl(n, ['рабочего дня', 'рабочих дней', 'рабочих дней']) : pl(n, ['календарного дня', 'календарных дней', 'календарных дней']));

  /* ---------- Снимок условий ----------
     Условия копируются из кампании в предложение и заказ. После этого
     изменение кампании или настроек не влияет на существующий заказ. */
  T.snapshot = function (cmp, cfg, over) {
    const t = {
      format: cmp.format,
      shootDays: cmp.shootDays,
      startEvent: cmp.shipProduct ? 'receipt' : 'payment',
      reviewDays: cfg.reviewDays,
      revisionDays: cfg.revisionDays,
      revisionsIncluded: cmp.revisionsIncluded != null ? cmp.revisionsIncluded : cfg.revisionsIncluded,
      ship: !!cmp.shipProduct,
      returnProduct: !!(cmp.shipProduct && cmp.returnProduct),
      deliveryCost: cmp.shipProduct ? cfg.deliveryEstimate : 0,
      returnCost: cmp.shipProduct && cmp.returnProduct ? cfg.returnEstimate : 0,
      rights: Object.assign({}, cmp.rights),
      deliverables: cmp.deliverables.slice(),
      publication: cmp.format === 'publish' && cmp.publication ? Object.assign({}, cmp.publication, { criteria: cmp.publication.criteria.slice() }) : null,
    };
    if (t.publication && t.publication.service === 'publish_ready') { t.ship = false; t.returnProduct = false; t.deliveryCost = 0; t.returnCost = 0; t.startEvent = 'payment'; }
    return Object.assign(t, over || {});
  };

  T.startEventText = (t) => (t.startEvent === 'receipt' ? 'после подтверждения получения товара' : 'после оплаты заказа');
  T.shootRule = (t) => T.days(t.shootDays, 'calendar') + ' ' + T.startEventText(t);

  /* ---------- Этапы ---------- */
  T.STAGE_LABEL = {
    agreement: 'Оплата', shipping: 'Отправка', in_transit: 'Доставка', production: 'Съёмка',
    review: 'Проверка', revision: 'Правки', publishing: 'Публикация', accepted: 'Приёмка',
  };
  T.stages = function (o) {
    const t = o.terms;
    const ready = t.publication && t.publication.service === 'publish_ready';
    return ['agreement', t.ship && 'shipping', t.ship && 'in_transit', !ready && 'production', !ready && 'review', t.format === 'publish' && 'publishing', 'accepted'].filter(Boolean);
  };
  /* Кто действует на этапе */
  T.actor = function (o) {
    switch (o.stage) {
      case 'agreement': case 'shipping': case 'review': return 'brand';
      case 'in_transit': case 'production': case 'revision': return 'creator';
      case 'publishing': return o.publication && o.publication.url ? 'brand' : 'creator';
      default: return null;
    }
  };

  /* ---------- Сроки ---------- */
  T.startAt = (o) => (o.terms.startEvent === 'receipt' ? o.delivery.receivedAt : o.payment.paidAt) || null;
  T.shootDue = (o) => { const s = T.startAt(o); return s ? T.addDays(s, o.terms.shootDays) : null; };
  T.reviewDue = (o) => { const v = o.versions[o.versions.length - 1]; return v ? T.addBusinessDays(v.at, o.terms.reviewDays) : null; };
  T.revisionDue = (o) => (o.changesAt ? T.addDays(o.changesAt, o.terms.revisionDays) : null);

  /* Срок текущего этапа: { kind, date, label, short } — одна формулировка везде */
  T.due = function (o, fmt) {
    const f = fmt || ((x) => new Date(x).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' }).replace('.', ''));
    const t = o.terms;
    switch (o.stage) {
      case 'agreement': case 'shipping': case 'in_transit':
        if (t.publication && t.publication.service === 'publish_ready') return { kind: 'publish', date: t.publication.windowTo, label: 'Публикация до ' + f(t.publication.windowTo), short: 'публикация до ' + f(t.publication.windowTo) };
        return { kind: 'pending', date: null, label: 'Срок съёмки: ' + T.shootRule(t), short: t.shootDays + ' дн. ' + (t.startEvent === 'receipt' ? 'после получения' : 'после оплаты') };
      case 'production': {
        const d = T.shootDue(o);
        return { kind: 'shoot', date: d, label: 'Сдача материалов до ' + f(d), short: 'сдача до ' + f(d) };
      }
      case 'review': {
        const d = T.reviewDue(o);
        return { kind: 'review', date: d, label: 'Проверка до ' + f(d) + ' (' + T.days(t.reviewDays, 'business') + ')', short: 'проверка до ' + f(d) };
      }
      case 'revision': {
        const d = T.revisionDue(o);
        return { kind: 'revision', date: d, label: 'Правки до ' + f(d) + ' (' + T.days(t.revisionDays, 'calendar') + ')', short: 'правки до ' + f(d) };
      }
      case 'publishing':
        return { kind: 'publish', date: t.publication.windowTo, label: 'Публикация до ' + f(t.publication.windowTo), short: 'публикация до ' + f(t.publication.windowTo) };
      case 'accepted':
        return { kind: 'done', date: o.acceptedAt, label: 'Завершён ' + f(o.acceptedAt), short: 'завершён ' + f(o.acceptedAt) };
      default:
        return { kind: 'none', date: null, label: '—', short: '—' };
    }
  };

  /* ---------- Деньги ---------- */
  T.budget = function ({ fee, n = 1, ship, returnProduct }, cfg) {
    fee = Math.max(0, Math.round(Number(fee) || 0));
    n = Math.max(1, Math.round(Number(n) || 1));
    const commission = Math.round(fee * cfg.serviceFeeRate);
    const delivery = ship ? cfg.deliveryEstimate : 0;
    const returnCost = ship && returnProduct ? cfg.returnEstimate : 0;
    const perCreator = fee + commission + delivery + returnCost;
    return { fee, n, commission, delivery, returnCost, perCreator, total: perCreator * n, estimated: delivery + returnCost > 0 };
  };
  T.orderTotal = (o) => o.fee + o.commission + (o.terms.ship ? o.terms.deliveryCost : 0) + (o.terms.returnProduct ? o.terms.returnCost : 0);

  /* ---------- Текст условий (бриф, заказ, предложение) ---------- */
  T.rows = function (t) {
    const rows = [
      ['Начало работы', t.ship ? 'После подтверждения получения товара' : 'После оплаты заказа'],
      ['Съёмка', T.days(t.shootDays, 'calendar')],
      ['Проверка заказчиком', T.days(t.reviewDays, 'business') + ' на каждую версию'],
      ['Правки', t.revisionsIncluded + ' включено, ' + T.days(t.revisionDays, 'calendar') + ' на каждую'],
      ['Доставка товара', t.ship ? 'Отправляет заказчик' : 'Не нужна'],
    ];
    if (t.ship) rows.push(['Товар после съёмки', t.returnProduct ? 'Вернуть заказчику' : 'Остаётся у креатора']);
    rows.push(['Права', (U.RIGHTS_SCOPE[t.rights.scope] || '—') + ', ' + (U.RIGHTS_TERM[t.rights.term] || '—').toLowerCase()]);
    if (t.publication) {
      const p = t.publication;
      rows.push(['Площадка', p.platform], ['Услуга', U.PUB_SERVICES[p.service]], ['Период размещения', fmtD(p.windowFrom) + ' — ' + fmtD(p.windowTo)], ['Хранение публикации', U.KEEP_DAYS[p.keepDays]]);
    }
    return rows;
  };
  const fmtD = (x) => (x ? new Date(x).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' }).replace('.', '') : '—');

  U.T = T;
})();
