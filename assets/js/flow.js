/* Рабочий процесс: предложения, заказы, модерация.
   Каждое действие проверяет допустимость перехода, меняет этап, пишет историю
   и системное сообщение. Оплата, выплата и проверка документов — только симуляция. */
(function () {
  const nowISO = () => new Date().toISOString();
  const S = () => U.store.s;
  const fmt = (iso) => U.date(iso);

  class RuleError extends Error {}
  U.RuleError = RuleError;
  const fail = (msg) => { throw new RuleError(msg); };

  function log(o, actor, text, sys) {
    o.history.push({ at: nowISO(), actor, text });
    if (sys) o.messages.push({ from: 'system', at: nowISO(), text: sys });
  }
  function mutate(id, fn) {
    let out;
    const o = S().orders.find((x) => x.id === id);
    if (!o) fail('Заказ не найден');
    U.store.update((s) => { out = fn(s.orders.find((x) => x.id === id), s); });
    return out;
  }
  function guard(o, stages) {
    if (!stages.includes(o.stage)) fail('Действие недоступно на этапе «' + (U.T.STAGE_LABEL[o.stage] || o.stage) + '»');
  }
  /* Правило: физическая отправка товара — только проверенному креатору.
     Проверяется во всех точках: предложение, принятие, оплата, отправка. */
  function shipRule(creatorId, terms) {
    const c = S().creators.find((x) => x.id === creatorId);
    if (!c) fail('Креатор не найден');
    if (terms.ship && c.verification !== 'verified') {
      fail('Креатор ещё не прошёл проверку документов. Заказ с отправкой товара станет доступен после проверки.');
    }
  }
  U.rules = { shipRule, canOffer(creatorId, terms) { try { shipRule(creatorId, terms); return ''; } catch (e) { return e.message; } } };

  U.flow = {
    /* ---------- Предложения ---------- */
    createOffer({ campaignId, creatorId, fee, note = '', source = 'invite', applicationId = null, baseOrderId = null, termsOver = null }) {
      const cmp = S().campaigns.find((x) => x.id === campaignId);
      if (!cmp) fail('Выберите кампанию');
      fee = Math.round(Number(fee));
      if (!fee || fee < 1000) fail('Гонорар — не меньше 1 000 ₽');
      const terms = U.T.snapshot(cmp, U.config, termsOver);
      shipRule(creatorId, terms);
      if (S().offers.some((x) => x.campaignId === campaignId && x.creatorId === creatorId && x.status === 'pending')) fail('Этому креатору уже отправлено предложение по этой кампании');
      let id;
      U.store.update((s) => {
        id = 'of' + s.counters.offer++;
        s.offers.push({ id, campaignId, creatorId, fee, note, at: nowISO(), status: 'pending', source, applicationId, baseOrderId, terms });
        if (applicationId) { const a = s.applications.find((x) => x.id === applicationId); a.status = 'offered'; a.offerId = id; }
      });
      // Демо-режим: креатор принимает сам (переключатель явно помечен в интерфейсе)
      if (S().settings.autoAccept) return { offerId: id, orderId: this.acceptOffer(id, true) };
      return { offerId: id, orderId: null };
    },
    acceptOffer(offerId, auto) {
      const of = S().offers.find((x) => x.id === offerId);
      if (!of) fail('Предложение не найдено');
      if (of.status !== 'pending') fail('Предложение уже ' + (of.status === 'accepted' ? 'принято' : 'закрыто'));
      shipRule(of.creatorId, of.terms);
      let id;
      U.store.update((s) => {
        const x = s.offers.find((y) => y.id === offerId);
        const cmp = s.campaigns.find((c) => c.id === x.campaignId);
        id = 'o-' + s.counters.order++;
        const t = nowISO();
        x.status = 'accepted'; x.orderId = id; x.decidedAt = t; x.auto = !!auto;
        if (x.applicationId) { const a = s.applications.find((y) => y.id === x.applicationId); if (a) a.status = 'chosen'; }
        s.orders.push({
          id, offerId, campaignId: x.campaignId, creatorId: x.creatorId, brandId: cmp.brandId,
          fee: x.fee, commission: Math.round(x.fee * U.config.serviceFeeRate), terms: x.terms,
          stage: 'agreement', createdAt: x.at,
          brief: { agreedAt: t, keyPoints: cmp.keyPoints, mustShow: cmp.mustShow, avoid: cmp.avoid, tone: cmp.tone },
          payment: { status: 'unpaid', paidAt: null, payoutStatus: 'none', payoutAt: null },
          delivery: { carrier: null, track: null, sentAt: null, receivedAt: null },
          revisionsUsed: 0, changesAt: null, acceptedAt: null,
          publication: x.terms.publication ? { url: null, postedAt: null, confirmedAt: null } : null,
          versions: [], tickets: [],
          messages: x.note ? [{ from: 'brand', at: x.at, text: x.note }] : [],
          history: [
            { at: x.at, actor: 'brand', text: x.source === 'repeat' ? 'Повторный заказ на основе ' + x.baseOrderId : x.source === 'application' ? 'Креатор выбран по отклику — отправлено предложение' : 'Предложение отправлено креатору' },
            { at: t, actor: 'creator', text: auto ? 'Предложение принято автоматически (демо-режим)' : 'Креатор принял предложение — условия зафиксированы в заказе' },
          ],
        });
      });
      return id;
    },
    declineOffer(offerId, reason) {
      const of = S().offers.find((x) => x.id === offerId);
      if (!of || of.status !== 'pending') fail('Предложение уже закрыто');
      if (!reason || reason.trim().length < 3) fail('Укажите причину отказа');
      U.store.update((s) => {
        const x = s.offers.find((y) => y.id === offerId);
        x.status = 'declined'; x.declineReason = reason.trim(); x.decidedAt = nowISO();
        if (x.applicationId) { const a = s.applications.find((y) => y.id === x.applicationId); if (a) a.status = 'offer_declined'; }
      });
    },
    withdrawOffer(offerId) {
      U.store.update((s) => { const x = s.offers.find((y) => y.id === offerId); if (x && x.status === 'pending') { x.status = 'withdrawn'; x.decidedAt = nowISO(); } });
    },
    apply(campaignId, creatorId, price, message) {
      if (S().applications.some((a) => a.campaignId === campaignId && a.creatorId === creatorId && ['new', 'offered'].includes(a.status))) fail('Вы уже откликнулись на этот бриф');
      U.store.update((s) => { s.applications.push({ id: 'a' + Date.now(), campaignId, creatorId, price, message, at: nowISO(), status: 'new' }); });
    },
    chooseApplicant(appId) {
      const a = S().applications.find((x) => x.id === appId);
      if (!a || a.status !== 'new') fail('Отклик уже обработан');
      return this.createOffer({ campaignId: a.campaignId, creatorId: a.creatorId, fee: a.price, note: 'Выбрали вас по отклику. Проверьте условия и примите предложение.', source: 'application', applicationId: a.id });
    },
    declineApplicant(appId, reason) {
      U.store.update((s) => { const a = s.applications.find((y) => y.id === appId); a.status = 'declined'; a.declineReason = reason || 'Заказчик выбрал другого креатора'; });
    },
    repeatOrder(orderId, { fee, shootDays, ship, returnProduct, note }) {
      const o = S().orders.find((x) => x.id === orderId);
      if (!o) fail('Заказ не найден');
      const over = { shootDays: Number(shootDays), ship: !!ship, returnProduct: !!(ship && returnProduct), startEvent: ship ? 'receipt' : 'payment', deliveryCost: ship ? U.config.deliveryEstimate : 0, returnCost: ship && returnProduct ? U.config.returnEstimate : 0 };
      return this.createOffer({ campaignId: o.campaignId, creatorId: o.creatorId, fee, note, source: 'repeat', baseOrderId: o.id, termsOver: over });
    },

    /* ---------- Заказ ---------- */
    pay(id, method) {
      return mutate(id, (o) => {
        guard(o, ['agreement']);
        shipRule(o.creatorId, o.terms);
        const t = nowISO();
        o.payment.status = 'held'; o.payment.paidAt = t; o.payment.method = method;
        const st = U.T.stages(o);
        o.stage = st[st.indexOf('agreement') + 1];
        const extra = o.terms.startEvent === 'payment' && o.stage === 'production' ? ' Срок сдачи: до ' + fmt(U.T.shootDue(o)) + '.' : '';
        log(o, 'brand', 'Заказ оплачен (симуляция) — средства зарезервированы до приёмки', 'Заказ оплачен. Средства зарезервированы до приёмки работы.' + extra);
      });
    },
    ship(id, { carrier, track }) {
      return mutate(id, (o) => {
        guard(o, ['shipping']);
        shipRule(o.creatorId, o.terms);
        if (!carrier) fail('Выберите службу доставки');
        if (!/^[A-Za-z0-9]{8,20}$/.test(track || '')) fail('Трек-номер: латинские буквы и цифры, 8–20 символов');
        Object.assign(o.delivery, { carrier, track, sentAt: nowISO() });
        o.stage = 'in_transit';
        log(o, 'brand', 'Товар отправлен: ' + carrier + ', ' + track, 'Заказчик добавил отправление ' + track + '. Срок съёмки начнётся после подтверждения получения.');
      });
    },
    receive(id, note) {
      return mutate(id, (o) => {
        guard(o, ['in_transit']);
        o.delivery.receivedAt = nowISO();
        o.stage = 'production';
        const due = U.T.shootDue(o);
        log(o, 'creator', 'Креатор подтвердил получение' + (note ? ' — ' + note : '') + '. Срок сдачи рассчитан: ' + U.T.days(o.terms.shootDays, 'calendar') + ', до ' + fmt(due),
          'Креатор получил товар. Срок сдачи материалов: до ' + fmt(due) + ' (' + U.T.days(o.terms.shootDays, 'calendar') + ').');
      });
    },
    submit(id, { files, note }) {
      if (!files || !files.length) fail('Добавьте хотя бы один файл');
      return mutate(id, (o) => {
        guard(o, ['production', 'revision']);
        const n = o.versions.length + 1;
        o.versions.push({ n, at: nowISO(), status: 'pending', note, files, feedback: [] });
        o.stage = 'review';
        log(o, 'creator', 'Сдана версия ' + n + ' — ' + files.length + ' ' + U.plural(files.length, ['файл', 'файла', 'файлов']),
          'Креатор загрузил версию ' + n + '. Проверка — до ' + fmt(U.T.reviewDue(o)) + ' (' + U.T.days(o.terms.reviewDays, 'business') + ').');
      });
    },
    requestChanges(id, feedback) {
      if (!feedback || !feedback.length) fail('Добавьте хотя бы одно замечание');
      return mutate(id, (o) => {
        guard(o, ['review']);
        if (o.revisionsUsed >= o.terms.revisionsIncluded) fail('Включённые правки закончились');
        const v = o.versions[o.versions.length - 1];
        v.status = 'changes_requested'; v.feedback = feedback;
        o.revisionsUsed += 1; o.changesAt = nowISO();
        o.stage = 'revision';
        log(o, 'brand', 'Запрошены правки к версии ' + v.n + ' (правка ' + o.revisionsUsed + ' из ' + o.terms.revisionsIncluded + ')',
          'Заказчик запросил правки к версии ' + v.n + ': ' + feedback.length + ' ' + U.plural(feedback.length, ['замечание', 'замечания', 'замечаний']) + '. Срок правок — до ' + fmt(U.T.revisionDue(o)) + '.');
      });
    },
    accept(id) {
      return mutate(id, (o) => {
        guard(o, ['review']);
        const v = o.versions[o.versions.length - 1];
        v.status = 'accepted';
        if (o.terms.format === 'publish') {
          o.stage = 'publishing'; o.acceptedContentAt = nowISO();
          log(o, 'brand', 'Ролик принят (версия ' + v.n + '). Следующий шаг — публикация', 'Ролик принят. Опубликуйте его в период размещения и добавьте ссылку — выплата после подтверждения публикации.');
          return;
        }
        o.stage = 'accepted'; o.acceptedAt = nowISO();
        o.payment.status = 'released'; o.payment.payoutStatus = 'processing';
        log(o, 'brand', 'Работа принята (версия ' + v.n + '). Выплата креатору поставлена в очередь', 'Работа принята. Выплата креатору — в обработке, до ' + U.T.daysGen(U.config.payoutDays, 'business') + '.');
      });
    },
    submitPublication(id, { url, postedAt }) {
      if (!/^https?:\/\/\S+\.\S+/.test(url || '')) fail('Ссылка должна начинаться с http:// или https://');
      return mutate(id, (o) => {
        guard(o, ['publishing']);
        o.publication = Object.assign(o.publication || {}, { url, postedAt: postedAt || nowISO(), confirmedAt: null, rejected: null });
        log(o, 'creator', 'Добавлена ссылка на публикацию', 'Креатор опубликовал материал: ' + url + '. Заказчик проверяет размещение по критериям приёмки.');
      });
    },
    confirmPublication(id, checks) {
      return mutate(id, (o) => {
        guard(o, ['publishing']);
        if (!o.publication || !o.publication.url) fail('Креатор ещё не добавил ссылку на публикацию');
        if (checks && checks.some((x) => !x)) fail('Отметьте все критерии приёмки — или напишите креатору, что исправить');
        o.publication.confirmedAt = nowISO();
        o.stage = 'accepted'; o.acceptedAt = nowISO();
        o.payment.status = 'released'; o.payment.payoutStatus = 'processing';
        log(o, 'brand', 'Публикация подтверждена. Выплата креатору поставлена в очередь', 'Размещение подтверждено. Выплата креатору — в обработке, до ' + U.T.daysGen(U.config.payoutDays, 'business') + '.');
      });
    },
    rejectPublication(id, reason) {
      return mutate(id, (o) => {
        guard(o, ['publishing']);
        if (!reason || reason.length < 10) fail('Опишите, что не соответствует критериям');
        o.publication.rejected = reason; o.publication.url = null;
        log(o, 'brand', 'Публикация не принята: ' + reason, 'Заказчик попросил исправить публикацию: ' + reason);
      });
    },
    payout(id) {
      return mutate(id, (o) => {
        if (o.payment.payoutStatus !== 'processing') fail('Выплата не ожидается');
        o.payment.payoutStatus = 'paid'; o.payment.payoutAt = nowISO();
        log(o, 'system', 'Выплата креатору отмечена как проведённая (симуляция)', 'Выплата креатору отмечена как проведённая (симуляция).');
      });
    },
    message(id, from, text) {
      if (!text || !text.trim()) fail('Сообщение не может быть пустым');
      return mutate(id, (o) => { o.messages.push({ from, at: nowISO(), text: text.trim() }); });
    },

    /* ---------- Поддержка ---------- */
    ticket(id, role, topic, text) {
      let num;
      mutate(id, (o, s) => {
        num = s.counters.ticket++;
        o.tickets.push({ id: num, topic, text, role, at: nowISO(), status: 'open', log: [{ at: nowISO(), by: role, text: 'Обращение создано' }] });
        log(o, role, 'Обращение в поддержку №' + num + ': ' + topic, 'Создано обращение в поддержку №' + num + ' («' + topic + '»). Ответ придёт в эту переписку.');
      });
      return num;
    },
    ticketReply(orderId, ticketId, text) {
      if (!text || text.trim().length < 5) fail('Напишите ответ — минимум 5 символов');
      return mutate(orderId, (o) => {
        const t = o.tickets.find((x) => x.id === ticketId);
        if (!t) fail('Обращение не найдено');
        if (t.status === 'resolved') fail('Обращение закрыто — откройте его заново');
        if (t.status === 'open') { t.status = 'in_progress'; t.log.push({ at: nowISO(), by: 'support', text: 'Взято в работу' }); }
        t.log.push({ at: nowISO(), by: 'support', text: 'Ответ: ' + text.trim() });
        o.messages.push({ from: 'support', at: nowISO(), text: 'Поддержка (№' + ticketId + '): ' + text.trim() });
      });
    },
    ticketStatus(orderId, ticketId, status, note) {
      const labels = { open: 'Открыто', in_progress: 'В работе', resolved: 'Решено' };
      if (status === 'resolved' && (!note || note.trim().length < 5)) fail('Опишите решение — оно попадёт в историю обращения');
      return mutate(orderId, (o) => {
        const t = o.tickets.find((x) => x.id === ticketId);
        if (!t) fail('Обращение не найдено');
        t.status = status;
        t.log.push({ at: nowISO(), by: 'support', text: 'Статус: ' + labels[status] + (note ? ' — ' + note.trim() : '') });
        if (status === 'resolved') {
          t.resolution = note.trim();
          o.messages.push({ from: 'support', at: nowISO(), text: 'Поддержка: обращение №' + ticketId + ' решено. ' + note.trim() });
          log(o, 'support', 'Обращение №' + ticketId + ' решено: ' + note.trim());
        }
      });
    },

    /* ---------- Модерация (симуляция) ---------- */
    signupDecide(id, decision, reason) {
      if (decision !== 'approve' && (!reason || reason.trim().length < 5)) fail('Укажите причину — её увидит креатор');
      U.store.update((s) => {
        const x = s.signups.find((y) => y.id === id);
        x.status = { approve: 'approved', reject: 'rejected', more: 'needs_info' }[decision];
        x.log.push({ at: nowISO(), text: { approve: 'Заявка одобрена', reject: 'Заявка отклонена', more: 'Запрошены дополнения' }[decision] + (reason ? ': ' + reason.trim() : '') });
      });
    },
    docsDecide(creatorId, decision, reason) {
      if (decision !== 'approve' && (!reason || reason.trim().length < 5)) fail('Укажите, каких документов не хватает');
      U.store.update((s) => {
        const c = s.creators.find((y) => y.id === creatorId);
        c.verifyLog = c.verifyLog || [];
        if (decision === 'approve') {
          c.verification = 'verified';
          c.verifyNote = 'Документы подтверждены модератором (демо-проверка), пробная работа принята';
          (c.docs || []).forEach((d) => { d.status = 'approved'; });
        } else {
          c.verification = 'needs_info';
          c.verifyNote = 'Модератор запросил дополнения: ' + reason.trim();
        }
        c.verifyLog.push({ at: nowISO(), text: decision === 'approve' ? 'Документы подтверждены' : 'Запрошены дополнения: ' + reason.trim() });
      });
    },
    updateCreator(id, patch) {
      U.store.update((s) => { Object.assign(s.creators.find((c) => c.id === id), patch); });
    },
  };
})();
