/* Админ-панель: модерация креаторов, очередь выплат, обращения. Решения — симуляция. */
(function () {
  const I = U.icon, E = U.esc;
  const TK = { open: ['status-info', 'Открыто'], in_progress: ['status-warning', 'В работе'], resolved: ['status-success', 'Решено'] };
  const needAdmin = () => '<div class="page"><div class="empty">' + I('lock') + '<h1 class="t-h3">Доступ только для модераторов</h1><p>Переключите роль на «Админ» в верхней полосе прототипа.</p><button class="btn btn-primary" type="button" data-action="set-role" data-role="admin">Смотреть как админ</button></div></div>';
  const allTickets = () => { const out = []; U.store.s.orders.forEach((o) => (o.tickets || []).forEach((t) => out.push({ o, t }))); return out.sort((a, b) => (b.t.at > a.t.at ? 1 : -1)); };

  U.pages.admin = {
    shell: 'app',
    title: 'Модерация',
    render() {
      const s = U.store.s;
      if (s.role !== 'admin') return needAdmin();
      const pendingC = s.creators.filter((c) => c.verification !== 'verified');
      const signups = s.signups;
      const payouts = s.orders.filter((o) => o.payment.payoutStatus === 'processing');
      const tickets = allTickets();
      const SG = { pending: ['status-info', 'Ждёт решения'], approved: ['status-success', 'Одобрена'], rejected: ['', 'Отклонена'], needs_info: ['status-warning', 'Запрошены дополнения'] };
      return '<div class="page"><div class="page-head"><div><h1>Модерация</h1><p class="sub">Решения в прототипе не отправляются участникам по почте — только меняют статусы</p></div></div>' +
        '<dl class="stats"><div class="stat"><dt>Заявки креаторов</dt><dd>' + signups.filter((x) => x.status === 'pending').length + '</dd></div><div class="stat"><dt>Проверка документов</dt><dd>' + pendingC.length + '</dd></div><div class="stat"><dt>Выплаты в очереди</dt><dd>' + payouts.length + '</dd></div><div class="stat"><dt>Открытые обращения</dt><dd>' + tickets.filter((x) => x.t.status !== 'resolved').length + '</dd></div></dl>' +
        '<div style="display:grid;gap:20px">' +
        '<section class="panel" aria-labelledby="tk-h"><div class="panel-head"><h2 id="tk-h">Обращения</h2></div>' +
        (tickets.length ? tickets.map(({ o, t }) => '<div class="app-row"><span class="avatar avatar-initials" aria-hidden="true">' + I('support', 'icon-sm') + '</span><div style="min-width:0"><div class="row-wrap"><b>№' + t.id + ' · ' + E(t.topic) + '</b><span class="status ' + TK[t.status][0] + '">' + TK[t.status][1] + '</span></div><p class="small wrap-any">' + E(t.text) + '</p><p class="small muted">Заказ ' + o.id + ' · ' + (t.role === 'creator' ? 'от креатора' : t.role === 'brand' ? 'от заказчика' : 'поддержка') + ' · ' + U.dateTime(t.at) + '</p></div>' +
          '<div class="actions"><a class="btn btn-primary btn-sm" href="#/admin/ticket/' + o.id + '/' + t.id + '">Открыть</a></div></div>').join('')
          : '<div class="panel-body"><p class="muted">Обращений нет.</p></div>') + '</section>' +
        '<section class="panel" aria-labelledby="po-h"><div class="panel-head"><h2 id="po-h">Выплаты креаторам</h2><span class="proto-flag">симуляция</span></div>' +
        (payouts.length ? payouts.map((o) => '<div class="app-row">' + U.avatar(U.q.creator(o.creatorId), 40) + '<div><b>' + E(U.q.creator(o.creatorId).name) + '</b> · ' + U.money(o.fee) + '<p class="small muted">Заказ <a class="link" href="#/orders/' + o.id + '">' + o.id + '</a> · работа: <span class="status status-success">принята ' + U.date(o.acceptedAt) + '</span> · деньги: <span class="status status-warning">выплата в обработке</span></p></div><div class="actions"><button class="btn btn-primary btn-sm" type="button" data-action="payout" data-order="' + o.id + '">Провести выплату</button></div></div>').join('')
          : '<div class="panel-body"><p class="muted">Очередь пуста. Выплата появится здесь после приёмки работы заказчиком.</p></div>') + '</section>' +
        '<section class="panel" aria-labelledby="su-h"><div class="panel-head"><h2 id="su-h">Заявки новых креаторов</h2></div>' +
        (signups.length ? signups.map((x) => '<div class="app-row"><span class="avatar avatar-initials" aria-hidden="true">' + E(U.initials(x.name)) + '</span><div style="min-width:0"><div class="row-wrap"><b>' + E(x.name) + '</b><span class="small muted">' + E(x.city) + '</span><span class="status ' + SG[x.status][0] + '">' + SG[x.status][1] + '</span></div><p class="small muted">' + E(x.topics.join(', ')) + ' · ' + U.dateTime(x.at) + '</p>' +
          (x.log.length ? '<p class="small">' + E(x.log[x.log.length - 1].text) + '</p>' : '') + '</div>' +
          '<div class="actions"><button class="btn btn-sm' + (x.status === 'pending' ? ' btn-primary' : '') + '" type="button" data-action="signup-review" data-id="' + x.id + '">' + (x.status === 'pending' ? 'Рассмотреть' : 'Подробнее') + '</button></div></div>').join('')
          : '<div class="panel-body"><p class="muted">Новых заявок нет.</p></div>') + '</section>' +
        '<section class="panel" aria-labelledby="vc-h"><div class="panel-head"><h2 id="vc-h">Проверка документов</h2></div>' +
        (pendingC.length ? pendingC.map((c) => '<div class="app-row">' + U.avatar(c, 40) + '<div style="min-width:0"><a class="link" href="#/creators/' + c.id + '">' + E(c.name) + '</a> · ' + E(c.city) + '<p class="small muted">' + E(c.verifyNote) + '</p><p class="small">Пока проверка не завершена, заказы с отправкой товара этому креатору заблокированы.</p></div><div class="actions"><button class="btn btn-primary btn-sm" type="button" data-action="docs-review" data-id="' + c.id + '">Проверить документы</button></div></div>').join('')
          : '<div class="panel-body"><p class="muted">Все креаторы проверены.</p></div>') + '</section></div></div>';
    },
  };

  /* Заявка: анкета, примеры работ и решение с причиной */
  U.actions['signup-review'] = (el) => {
    const x = U.store.s.signups.find((y) => y.id === el.dataset.id);
    const pending = x.status === 'pending';
    const d = U.modal.open({
      title: 'Заявка: ' + E(x.name), cls: 'modal-wide',
      body: '<div class="form-cols"><div style="display:grid;gap:12px;align-content:start"><dl class="kv kv-left"><dt>Город</dt><dd>' + E(x.city) + '</dd><dt>Почта</dt><dd>' + E(x.email) + '</dd><dt>Тематики</dt><dd>' + E(x.topics.join(', ')) + '</dd><dt>Портфолио</dt><dd class="wrap-any">' + E(x.portfolio) + ' <span class="muted">(внешняя ссылка не открывается в прототипе)</span></dd></dl>' +
        (x.about ? '<p class="wrap-any">' + E(x.about) + '</p>' : '') +
        (x.samples && x.samples.length ? '<div><div class="small muted" style="margin-bottom:6px">Примеры, приложенные к заявке</div><div class="row" style="gap:8px">' + x.samples.map((m) => '<span style="width:96px">' + U.frame(m, { w: 192, zoom: true, caption: 'Пример из заявки' }) + '</span>').join('') + '</div></div>' : '') +
        (x.log.length ? '<div><div class="small muted" style="margin-bottom:6px">История решений</div><ol class="history">' + x.log.map((l) => '<li><time>' + U.dateTime(l.at) + '</time><div>' + E(l.text) + '</div></li>').join('') + '</ol></div>' : '') + '</div>' +
        (pending ? '<form id="sg-form" novalidate style="display:grid;gap:14px;align-content:start"><fieldset style="border:0;padding:0;margin:0;display:grid;gap:4px"><legend class="field-label" style="margin-bottom:6px">Решение</legend>' +
          '<label class="check"><input type="radio" name="decision" value="approve" checked>Одобрить заявку</label><label class="check"><input type="radio" name="decision" value="more">Запросить дополнения</label><label class="check"><input type="radio" name="decision" value="reject">Отклонить</label></fieldset>' +
          U.fieldHTML({ name: 'reason', label: 'Причина / что дополнить', textarea: true, placeholder: 'Обязательно для отказа и запроса дополнений. Креатор увидит этот текст.' }) + '</form>' : '<div class="notice notice-plain">' + I('info') + '<span>Решение уже принято.</span></div>') + '</div>',
      foot: '<button class="btn" type="button" data-close>Закрыть</button>' + (pending ? '<button class="btn btn-primary" type="button" data-ok>Сохранить решение</button>' : ''),
    });
    const ok = d.querySelector('[data-ok]');
    if (ok) ok.addEventListener('click', () => {
      const f = d.querySelector('#sg-form');
      const dec = f.decision.value;
      if (!U.validate(f, { reason: (v) => (dec !== 'approve' && v.length < 5 ? 'Укажите причину — минимум 5 символов' : '') })) return;
      try {
        U.flow.signupDecide(x.id, dec, f.reason.value);
        d.close(); U.rerender();
        U.toast({ approve: 'Заявка одобрена', more: 'Запрошены дополнения', reject: 'Заявка отклонена' }[dec], 'Решение записано в историю заявки');
      } catch (err) { U.toast('Не сохранено', err.message, 'error'); }
    });
  };

  /* Документы: демо-превью, подтверждение или запрос дополнений */
  U.actions['docs-review'] = (el) => {
    const c = U.q.creator(el.dataset.id);
    const docs = c.docs || [];
    const d = U.modal.open({
      title: 'Документы: ' + E(c.name), cls: 'modal-wide',
      body: '<div class="notice notice-warning">' + I('alert') + '<div><b>Демо-документы.</b> Настоящих сканов в прототипе нет; подтверждение не означает реальной проверки личности.</div></div>' +
        '<div class="doc-grid">' + docs.map((x) => '<figure class="doc"><div class="doc-preview" aria-hidden="true">' + I('file') + '<span>Скан скрыт в прототипе</span></div><figcaption><b>' + E(x.name) + '</b><span class="status ' + (x.status === 'approved' ? 'status-success' : 'status-info') + '">' + (x.status === 'approved' ? 'Подтверждён' : 'Загружен') + '</span></figcaption></figure>').join('') + '</div>' +
        '<p class="small">Пробная работа: <a class="link" href="#/creators/' + c.id + '" data-close>портфолио креатора</a> (' + c.portfolio.length + ' работ)</p>' +
        ((c.verifyLog || []).length ? '<ol class="history">' + c.verifyLog.map((l) => '<li><time>' + U.dateTime(l.at) + '</time><div>' + E(l.text) + '</div></li>').join('') + '</ol>' : '') +
        '<form id="dc-form" novalidate style="display:grid;gap:12px"><fieldset style="border:0;padding:0;margin:0;display:grid;gap:4px"><legend class="field-label" style="margin-bottom:6px">Решение</legend>' +
        '<label class="check"><input type="radio" name="decision" value="approve" checked>Подтвердить документы</label><label class="check"><input type="radio" name="decision" value="more">Запросить дополнения</label></fieldset>' +
        U.fieldHTML({ name: 'reason', label: 'Что дополнить', textarea: true, placeholder: 'Например: справка о постановке на учёт нечитаема — загрузите заново' }) + '</form>',
      foot: '<button class="btn" type="button" data-close>Отмена</button><button class="btn btn-primary" type="button" data-ok>Сохранить решение</button>',
    });
    d.querySelector('[data-ok]').addEventListener('click', () => {
      const f = d.querySelector('#dc-form');
      const dec = f.decision.value;
      if (!U.validate(f, { reason: (v) => (dec !== 'approve' && v.length < 5 ? 'Укажите, что дополнить' : '') })) return;
      try {
        U.flow.docsDecide(c.id, dec, f.reason.value);
        d.close(); U.rerender();
        U.toast(dec === 'approve' ? 'Документы подтверждены (демо)' : 'Запрошены дополнения', dec === 'approve' ? 'Заказы с отправкой товара теперь доступны' : 'Ограничения на отправку товара сохраняются');
      } catch (err) { U.toast('Не сохранено', err.message, 'error'); }
    });
  };

  /* ---------- Экран обращения ---------- */
  U.pages.ticket = {
    shell: 'app',
    title: (p) => {
      const o = U.q.order(p.order);
      return o && o.tickets.some((x) => String(x.id) === String(p.id)) ? 'Обращение №' + p.id : 'Страница не найдена';
    },
    render(p) {
      if (U.store.s.role !== 'admin') return needAdmin();
      const o = U.q.order(p.order);
      const t = o && o.tickets.find((x) => String(x.id) === String(p.id));
      if (!t) return U.pages.notfound.render({}, {}, 'Обращение не найдено.');
      const c = U.q.creator(o.creatorId), cmp = U.q.campaign(o.campaignId);
      const work = o.stage === 'accepted' ? '<span class="status status-success">Принята</span>' : U.stagePill(o);
      return '<div class="page"><nav class="crumbs" aria-label="Навигация"><a href="#/admin">Модерация</a>' + I('chevron-right') + '<span aria-current="page">Обращение №' + t.id + '</span></nav>' +
        '<div class="page-head"><div style="min-width:0"><h1 class="wrap-any">№' + t.id + ' · ' + E(t.topic) + '</h1><p class="sub">' + (t.role === 'creator' ? 'От креатора ' + E(c.name) : t.role === 'brand' ? 'От заказчика «Северный уход»' : 'Создано поддержкой') + ' · ' + U.dateTime(t.at) + ' · <span class="status ' + TK[t.status][0] + '">' + TK[t.status][1] + '</span></p></div></div>' +
        '<div class="two-col"><div style="display:grid;gap:20px;min-width:0">' +
        '<section class="panel"><div class="panel-head"><h2>Суть обращения</h2></div><div class="panel-body"><p class="wrap-any">' + E(t.text) + '</p></div></section>' +
        '<section class="panel"><div class="panel-head"><h2>Ответ и решение</h2></div><div class="panel-body" style="display:grid;gap:16px">' +
        (t.status === 'resolved' ? '<div class="notice notice-success">' + I('check-circle') + '<div><b>Решено.</b> ' + E(t.resolution || '') + '</div></div><button class="btn btn-sm" type="button" data-tk-status="open" style="justify-self:start">Открыть заново</button>' :
          '<form id="tk-reply" novalidate style="display:grid;gap:10px">' + U.fieldHTML({ name: 'reply', label: 'Ответ участникам', textarea: true, required: true, placeholder: 'Ответ появится в переписке заказа' }) + '<button class="btn btn-primary" type="submit" style="justify-self:start">' + I('send', 'icon-sm') + 'Отправить ответ</button></form>' +
          '<form id="tk-resolve" novalidate style="display:grid;gap:10px">' + U.fieldHTML({ name: 'note', label: 'Решение', textarea: true, required: true, placeholder: 'Например: перевозчик подтвердил задержку, срок съёмки не сдвигается' }) + '<button class="btn" type="submit" style="justify-self:start">' + I('check', 'icon-sm') + 'Закрыть как решённое</button></form>') +
        '</div></section>' +
        '<section class="panel"><div class="panel-head"><h2>История обращения</h2></div><div class="panel-body"><ol class="history">' + t.log.slice().reverse().map((l) => '<li><time>' + U.dateTime(l.at) + '</time><div class="wrap-any">' + E(l.text) + '<div class="actor">' + ({ creator: 'Креатор', brand: 'Заказчик', support: 'Поддержка' }[l.by] || '') + '</div></div></li>').join('') + '</ol></div></section>' +
        '<section class="panel"><div class="panel-head"><h2>Переписка по заказу</h2></div><div class="ticket-chat">' + U.chatHTML(o) + '</div></section>' +
        '</div><aside style="display:grid;gap:16px;align-content:start">' +
        '<section class="panel"><div class="panel-head"><h2>Связанный заказ</h2></div><div class="panel-body" style="display:grid;gap:12px">' +
        '<a class="link" href="#/orders/' + o.id + '">' + o.id + ' · ' + E(cmp.title) + '</a>' +
        '<div class="row" style="gap:10px">' + U.avatar(c, 32) + '<span>' + E(c.name) + '</span></div>' +
        '<div class="pay-states"><div class="pay-state"><span class="lbl">Работа</span>' + work + '</div><div class="pay-state"><span class="lbl">Деньги</span>' + U.payPill(o) + '<span class="hint">' + U.paymentInfo(o).hint + '</span></div></div>' +
        '<p class="small"><span class="due ' + U.dueTone(o) + '">' + E(U.due(o).label) + '</span></p>' +
        (o.delivery.track ? '<p class="small muted">Доставка: ' + E(o.delivery.carrier) + ', <span class="num">' + E(o.delivery.track) + '</span>' + (o.delivery.receivedAt ? ', получено ' + U.date(o.delivery.receivedAt) : ', не получено') + '</p>' : '') + '</div></section>' +
        '<section class="panel"><div class="panel-head"><h2>История заказа</h2></div><div class="panel-body"><ol class="history compact">' + o.history.slice(-6).reverse().map((h) => '<li><time>' + U.date(h.at) + '</time><div class="wrap-any small">' + E(h.text) + '</div></li>').join('') + '</ol></div></section>' +
        '</aside></div></div>';
    },
    mount(root, p) {
      const o = U.q.order(p.order);
      if (!o) return;
      const id = Number(p.id);
      const log = root.querySelector('#chat-log');
      if (log) log.scrollTop = log.scrollHeight;
      const chatForm = root.querySelector('[data-chat]');
      if (chatForm) U.wireChat(root.querySelector('.ticket-chat'), o.id, () => {});
      const rf = root.querySelector('#tk-reply');
      if (rf) rf.addEventListener('submit', (e) => {
        e.preventDefault();
        if (!U.validate(rf, { reply: (v) => (v.length < 5 ? 'Напишите ответ — минимум 5 символов' : '') })) return;
        U.flow.ticketReply(o.id, id, rf.reply.value);
        U.rerender(); U.toast('Ответ отправлен', 'Он появился в переписке заказа, статус — «В работе»');
      });
      const sf = root.querySelector('#tk-resolve');
      if (sf) sf.addEventListener('submit', (e) => {
        e.preventDefault();
        if (!U.validate(sf, { note: (v) => (v.length < 5 ? 'Опишите решение — оно попадёт в историю' : '') })) return;
        U.flow.ticketStatus(o.id, id, 'resolved', sf.note.value);
        U.rerender(); U.toast('Обращение решено', 'Решение записано в историю обращения и заказа');
      });
      const ro = root.querySelector('[data-tk-status]');
      if (ro) ro.addEventListener('click', () => { U.flow.ticketStatus(o.id, id, 'open', 'Открыто повторно'); U.rerender(); U.toast('Обращение открыто заново'); });
    },
  };
})();
