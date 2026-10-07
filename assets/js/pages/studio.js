/* Кабинет креатора: приглашения, задачи, отклики, брифы; профиль; адрес и выплаты */
(function () {
  const I = U.icon, E = U.esc;
  const me = () => U.q.creator(U.store.s.creatorSelf);
  const needCreator = () => '<div class="page"><div class="empty">' + I('user') + '<h1 class="t-h3">Это кабинет креатора</h1><p>Переключите роль на «Креатор» в верхней полосе прототипа, чтобы увидеть его.</p><button class="btn btn-primary" type="button" data-action="set-role" data-role="creator">Смотреть как креатор</button></div></div>';
  const APP_ST = { new: ['status-info', 'На рассмотрении'], offered: ['status-warning', 'Вам отправлено предложение'], declined: ['', 'Отклонён'], offer_declined: ['', 'Вы отказались'], chosen: ['status-success', 'Выбран'] };

  /* Полный бриф кампании — до отклика или принятия предложения */
  function briefHTML(c, terms, fee) {
    const li = (arr, icon) => '<ul class="brief-list">' + arr.map((x) => '<li>' + I(icon) + '<span>' + E(x) + '</span></li>').join('') + '</ul>';
    return '<div class="brief-block"><div class="row"><span class="frame frame-1x1 frame-sm" style="width:56px;flex:none">' + U.img(c.product.media, 112, 112, '', '') + '</span><div style="min-width:0"><b class="wrap-any">' + E(c.product.name) + '</b><div class="small muted">' + E(c.product.category) + (c.product.price ? ' · ' + U.moneyText(c.product.price) : '') + '</div></div></div></div>' +
      '<div class="brief-block"><dl class="kv kv-left"><dt>Гонорар</dt><dd><b>' + U.money(fee) + '</b></dd>' + U.T.rows(terms).map(([k, v]) => '<dt>' + E(k) + '</dt><dd>' + E(v) + '</dd>').join('') + '</dl></div>' +
      '<div class="brief-block"><h3>Что сдать</h3>' + li(terms.deliverables, 'check') + '</div>' +
      (terms.publication ? '<div class="brief-block"><h3>Критерии приёмки публикации</h3>' + li(terms.publication.criteria, 'check') + '</div>' : '') +
      '<div class="brief-block"><h3>Ключевые тезисы</h3>' + li(c.keyPoints, 'message') + '</div>' +
      '<div class="brief-block"><h3>Обязательно показать</h3>' + li(c.mustShow, 'eye') + '</div>' +
      (c.avoid.length ? '<div class="brief-block"><h3>Чего избегать</h3>' + li(c.avoid, 'x') + '</div>' : '') +
      '<div class="brief-block"><h3>Тон</h3><p>' + E(c.tone) + '</p></div>';
  }

  U.pages.studio = {
    shell: 'app',
    title: 'Кабинет креатора',
    render() {
      const s = U.store.s;
      if (s.role !== 'creator') return needCreator();
      const c = me();
      const orders = U.q.ordersFor('creator');
      const todo = orders.filter((o) => U.T.actor(o) === 'creator');
      const sum = (f) => orders.filter(f).reduce((a, o) => a + o.fee, 0);
      const invites = s.offers.filter((x) => x.creatorId === c.id && x.status === 'pending');
      const apps = s.applications.filter((a) => a.creatorId === c.id).sort((a, b) => (b.at > a.at ? 1 : -1));
      const applied = new Set(apps.map((a) => a.campaignId));
      const busy = new Set(orders.map((o) => o.campaignId).concat(invites.map((x) => x.campaignId)));
      const briefs = s.campaigns.filter((x) => (x.status === 'recruiting' || x.status === 'active') && !busy.has(x.id) && !applied.has(x.id));
      const actText = { in_transit: 'Подтвердите получение товара', production: 'Сдайте материалы', revision: 'Внесите правки', publishing: 'Опубликуйте и добавьте ссылку' };
      return '<div class="page"><div class="page-head"><div class="row" style="gap:14px;min-width:0">' + U.avatar(c, 52) + '<div style="min-width:0"><h1>Здравствуйте, ' + E(c.name.split(' ')[0]) + '</h1><p class="sub">Кабинет креатора · <a class="link" href="#/creators/' + c.id + '">как видят заказчики</a></p></div></div></div>' +
        '<dl class="stats"><div class="stat"><dt>Нужно сделать</dt><dd>' + (todo.length + invites.length) + '</dd><span class="hint">задач и приглашений</span></div>' +
        '<div class="stat"><dt>В работе</dt><dd>' + U.money(sum((o) => o.payment.status === 'held')) + '</dd><span class="hint">зарезервировано заказчиками</span></div>' +
        '<div class="stat"><dt>Ожидает выплаты</dt><dd>' + U.money(sum((o) => o.payment.payoutStatus === 'processing')) + '</dd><span class="hint">работа принята</span></div>' +
        '<div class="stat is-dark"><dt>Выплачено</dt><dd>' + U.money(sum((o) => o.payment.payoutStatus === 'paid')) + '</dd><span class="hint">за всё время · демо</span></div></dl>' +
        '<div class="two-col"><div style="display:grid;gap:20px;min-width:0">' +
        '<section class="panel" aria-labelledby="inv-h"><div class="panel-head"><h2 id="inv-h">Приглашения</h2><span class="tag num">' + invites.length + '</span></div>' +
        (invites.length ? invites.map((of) => {
          const cmp = U.q.campaign(of.campaignId);
          return '<div class="app-row"><span style="width:48px">' + U.frame(cmp.product.media, { w: 96, ratio: 1, cls: 'frame-1x1 frame-sm', play: false, alt: '' }) + '</span>' +
            '<div style="min-width:0"><b class="wrap-any">' + E(cmp.title) + '</b><p class="small muted">Северный уход · ' + U.dateTime(of.at) + (of.source === 'repeat' ? ' · повторный заказ' : of.source === 'application' ? ' · по вашему отклику' : '') + '</p>' +
            '<p class="small">Гонорар <b>' + U.moneyText(of.fee) + '</b> · ' + E(U.T.shootRule(of.terms)) + '</p>' + (of.note ? '<p class="small wrap-any">«' + E(of.note) + '»</p>' : '') + '</div>' +
            '<div class="actions"><button class="btn btn-primary btn-sm" type="button" data-action="offer-open" data-offer="' + of.id + '">Посмотреть и ответить</button></div></div>';
        }).join('') : '<div class="panel-body"><p class="muted">Новых приглашений нет.</p></div>') + '</section>' +
        '<section class="panel" aria-labelledby="todo-h"><div class="panel-head"><h2 id="todo-h">Ваш ход</h2></div>' +
        (todo.length ? todo.map((o) => {
          const cmp = U.q.campaign(o.campaignId);
          return '<div class="app-row"><span style="width:48px">' + U.frame(cmp.product.media, { w: 96, ratio: 1, cls: 'frame-1x1 frame-sm', play: false, alt: '' }) + '</span>' +
            '<div style="min-width:0"><b>' + E(actText[o.stage]) + '</b><p class="small muted wrap-any">' + o.id + ' · ' + E(cmp.product.name) + '</p><p class="small"><span class="due ' + U.dueTone(o) + '">' + E(U.due(o).label) + '</span></p></div>' +
            '<div class="actions"><a class="btn btn-primary btn-sm" href="#/orders/' + o.id + '">Открыть заказ</a></div></div>';
        }).join('') : '<div class="panel-body"><p class="muted">Все задачи выполнены.</p></div>') + '</section>' +
        '<section class="panel" aria-labelledby="br-h"><div class="panel-head"><h2 id="br-h">Открытые брифы</h2><span class="tag num">' + briefs.length + '</span></div>' +
        (briefs.length ? briefs.map((x) => {
          const t = U.T.snapshot(x, U.config);
          const block = U.rules.canOffer(c.id, t);
          return '<div class="app-row"><span style="width:48px">' + U.frame(x.product.media, { w: 96, ratio: 1, cls: 'frame-1x1 frame-sm', play: false, alt: '' }) + '</span>' +
            '<div style="min-width:0"><b class="wrap-any">' + E(x.title) + '</b><p class="small muted">' + E(x.product.name) + (x.format === 'publish' ? ' · с публикацией' : '') + '</p><p class="small">Бюджет <b>' + U.moneyText(x.fee) + '</b> · ' + E(U.T.shootRule(t)) + '</p>' +
            (block ? '<p class="small" style="color:var(--c-warning)">' + E(block) + '</p>' : '') + '</div>' +
            '<div class="actions"><button class="btn btn-sm" type="button" data-action="brief-open" data-campaign="' + x.id + '">Бриф и отклик</button></div></div>';
        }).join('') : '<div class="panel-body"><p class="muted">Новых брифов пока нет.</p></div>') + '</section>' +
        '<section class="panel" aria-labelledby="ap-h"><div class="panel-head"><h2 id="ap-h">Мои отклики</h2></div>' +
        (apps.length ? '<div class="table-wrap"><table class="table"><thead><tr><th scope="col">Кампания</th><th scope="col">Цена</th><th scope="col">Статус</th></tr></thead><tbody>' + apps.map((a) => {
          const cmp = U.q.campaign(a.campaignId);
          const [cls, txt] = APP_ST[a.status] || ['', a.status];
          return '<tr><td><span class="wrap-any">' + E(cmp.title) + '</span><span class="cell-sub">' + U.date(a.at) + '</span></td><td class="col-num">' + U.money(a.price) + '</td><td><span class="status ' + cls + '">' + txt + '</span>' + (a.declineReason ? '<span class="cell-sub">' + E(a.declineReason) + '</span>' : '') + '</td></tr>';
        }).join('') + '</tbody></table></div>' : '<div class="panel-body"><p class="muted">Вы ещё не откликались на брифы.</p></div>') + '</section>' +
        '</div><aside style="display:grid;gap:16px;align-content:start">' +
        '<section class="panel" aria-labelledby="pr-h"><div class="panel-head"><h2 id="pr-h">Профиль</h2></div><div class="panel-body" style="display:grid;gap:12px">' +
        U.verifyLine(c) + '<div class="row-wrap">' + U.ratingLine(c) + '</div><div class="price-list">' + c.services.map((x) => '<div><span>' + E(x.title) + '</span>' + U.money(x.price) + '</div>').join('') + '</div>' +
        '<a class="btn btn-sm" href="#/studio/profile">' + I('edit', 'icon-sm') + 'Профиль, услуги и портфолио</a><a class="btn btn-sm" href="#/studio/settings">' + I('settings', 'icon-sm') + 'Адрес и реквизиты</a></div></section>' +
        '<section class="panel"><div class="panel-body" style="display:grid;gap:8px"><b>Как приходят деньги</b><p class="small muted">Заказчик резервирует оплату при заказе. После приёмки выплата уходит вам в течение ' + U.T.daysGen(U.config.payoutDays, 'business') + '. Налог самозанятого вы платите сами.</p><a class="link small" href="#/payments">История выплат</a></div></section></aside></div></div>';
    },
  };

  /* Бриф до отклика */
  U.actions['brief-open'] = (el) => {
    const c = U.q.campaign(el.dataset.campaign);
    const m = me();
    const t = U.T.snapshot(c, U.config);
    const block = U.rules.canOffer(m.id, t);
    const svc = c.format === 'publish' ? U.q.publishService(m, c.publication.service) : null;
    const noPub = c.format === 'publish' && !svc;
    const price = svc ? svc.price : Math.max(c.fee, U.q.minPrice(m, 'ugc'));
    const d = U.modal.open({
      title: E(c.title), cls: 'modal-wide',
      body: '<div class="form-cols"><div>' + briefHTML(c, t, c.fee) + '</div><form id="ap-form" novalidate style="display:grid;gap:16px;align-content:start">' +
        (block ? '<div class="notice notice-warning">' + I('alert') + '<div>' + E(block) + ' Откликнуться можно — заказчик сможет выбрать вас после проверки.</div></div>' : '') +
        (noPub ? '<div class="notice notice-warning">' + I('alert') + '<div>В вашем профиле нет услуги «' + E(U.PUB_SERVICES[c.publication.service]) + '» на площадке ' + E(c.publication.platform) + '. Услуги публикации подключаются после проверки аудитории площадки — в прототипе это недоступно.</div></div>' :
          U.fieldHTML({ name: 'price', label: 'Ваша цена, ₽', type: 'number', required: true, value: price, attrs: 'inputmode="numeric" min="1000" step="500"', hint: svc ? 'Цена услуги «' + svc.title + '» из профиля' : 'Бюджет брифа — ' + U.moneyText(c.fee) + '. Если цена выше — объясните почему' }) +
          U.fieldHTML({ name: 'msg', label: 'Сообщение заказчику', textarea: true, required: true, placeholder: 'Как снимете, какие работы похожи, когда сдадите' })) + '</form></div>',
      foot: '<button class="btn" type="button" data-close>Закрыть</button>' + (noPub ? '' : '<button class="btn btn-primary" type="button" data-ok>Отправить отклик</button>'),
    });
    const ok = d.querySelector('[data-ok]');
    if (ok) ok.addEventListener('click', async (e) => {
      const f = d.querySelector('#ap-form');
      if (!U.validate(f, { price: (v) => (!v || Number(v) < 1000 ? 'Минимум 1 000 ₽' : ''), msg: (v) => (v.length < 20 ? 'Напишите пару предложений — минимум 20 символов' : '') })) return;
      await U.busy(e.currentTarget);
      try {
        U.flow.apply(c.id, m.id, Number(f.price.value), f.msg.value.trim());
        d.close(); U.rerender();
        U.toast('Отклик отправлен', 'Статус — в разделе «Мои отклики»');
      } catch (err) { U.toast('Отклик не отправлен', err.message, 'error'); }
    });
  };

  /* Приглашение: полный бриф, условия и явный ответ */
  U.actions['offer-open'] = (el) => {
    const of = U.q.offer(el.dataset.offer);
    const c = U.q.campaign(of.campaignId);
    const d = U.modal.open({
      title: 'Предложение: ' + E(c.title), cls: 'modal-wide',
      body: (of.note ? '<p class="notice notice-plain">' + I('message') + '<span class="wrap-any">«' + E(of.note) + '» — Северный уход</span></p>' : '') + briefHTML(c, of.terms, of.fee) +
        '<form id="of-form" novalidate class="decline-box" hidden>' + U.fieldHTML({ name: 'reason', label: 'Причина отказа', required: true, options: [['', 'Выберите причину'], 'Не подходит срок', 'Не подходит гонорар', 'Не снимаю такую категорию', 'Нет возможности получить товар'] }) + '</form>',
      foot: '<button class="btn" type="button" data-decline>Отклонить</button><button class="btn btn-primary" type="button" data-accept>Принять предложение</button>',
    });
    const box = d.querySelector('#of-form');
    d.querySelector('[data-decline]').addEventListener('click', () => {
      if (box.hidden) { box.hidden = false; box.querySelector('select').focus(); d.querySelector('[data-decline]').textContent = 'Подтвердить отказ'; return; }
      if (!U.validate(box, { reason: (v) => (v ? '' : 'Выберите причину — заказчик её увидит') })) return;
      try { U.flow.declineOffer(of.id, box.reason.value); d.close(); U.rerender(); U.toast('Предложение отклонено', 'Заказчик увидит причину'); }
      catch (err) { U.toast('Не удалось', err.message, 'error'); }
    });
    d.querySelector('[data-accept]').addEventListener('click', async (e) => {
      await U.busy(e.currentTarget);
      try {
        const id = U.flow.acceptOffer(of.id);
        d.close();
        U.toast('Предложение принято', 'Создан заказ ' + id + '. Ждём оплату заказчика.');
        U.go('orders/' + id);
      } catch (err) { U.toast('Нельзя принять предложение', err.message, 'error'); }
    });
  };

  /* ---------- Профиль, услуги и портфолио ---------- */
  U.pages.studioProfile = {
    shell: 'app',
    title: 'Профиль и услуги',
    render() {
      if (U.store.s.role !== 'creator') return needCreator();
      const c = me();
      const svcRow = (x, i) => '<div class="svc-edit" data-i="' + i + '"><div class="field"><label for="sv-t' + i + '">Услуга</label><input class="input" id="sv-t' + i + '" name="sv-t' + i + '" value="' + E(x.title) + '"></div>' +
        '<div class="field"><label for="sv-p' + i + '">Цена, ₽</label><input class="input num" id="sv-p' + i + '" name="sv-p' + i + '" type="number" min="500" step="500" value="' + x.price + '" aria-describedby="sv-p' + i + '-e"><span class="error-text" id="sv-p' + i + '-e" data-error-for="sv-p' + i + '"></span></div>' +
        '<span class="tag">' + (x.kind === 'publish' ? E(x.platform) + ' · ' + (x.service === 'publish_ready' ? 'готовый материал' : 'создание и публикация') : 'без публикации') + '</span></div>';
      return '<div class="page"><nav class="crumbs" aria-label="Навигация"><a href="#/studio">Мой кабинет</a>' + I('chevron-right') + '<span aria-current="page">Профиль и услуги</span></nav>' +
        '<div class="page-head"><div><h1>Профиль и услуги</h1><p class="sub">Изменения сохраняются в прототипе и сразу видны в каталоге</p></div><div class="page-head-actions"><a class="btn" href="#/creators/' + c.id + '">' + I('eye') + 'Как видят заказчики</a></div></div>' +
        '<form id="pf-form" novalidate class="stack-lg">' +
        '<section class="panel"><div class="panel-head"><h2>О себе</h2></div><div class="panel-body form-grid">' +
        U.fieldHTML({ name: 'city', label: 'Город', required: true, value: c.city }) +
        U.fieldHTML({ name: 'langs', label: 'Языки', value: c.langs.join(', '), hint: 'Через запятую' }) +
        '<div class="full">' + U.fieldHTML({ name: 'bio', label: 'Описание', textarea: true, required: true, value: c.bio }) + '</div>' +
        '<div class="full">' + U.fieldHTML({ name: 'equipment', label: 'Оборудование', value: c.equipment }) + '</div>' +
        '<fieldset class="full" style="border:0;padding:0;margin:0"><legend class="field-label" style="margin-bottom:8px">Тематики</legend><div class="row-wrap">' + U.TOPICS.map((t) => '<label class="chip"><input type="checkbox" class="sr-only" name="topics" value="' + E(t) + '"' + (c.topics.includes(t) ? ' checked' : '') + '>' + E(t) + '</label>').join('') + '</div><span class="error-text" data-error-for="topics"></span></fieldset>' +
        '<fieldset class="full" style="border:0;padding:0;margin:0"><legend class="field-label" style="margin-bottom:6px">Подача в кадре</legend>' + Object.entries(U.PRESENCE).map(([k, v]) => '<label class="check"><input type="checkbox" name="presence" value="' + k + '"' + (c.presence.includes(k) ? ' checked' : '') + '>' + v + '</label>').join('') + '</fieldset>' +
        '</div></section>' +
        '<section class="panel"><div class="panel-head"><h2>Услуги и цены</h2></div><div class="panel-body" style="display:grid;gap:12px">' + c.services.map(svcRow).join('') +
        '<p class="hint">Цены публикации показываются заказчику в режиме «С публикацией». Добавление новой площадки — в рабочей версии после проверки аудитории.</p></div></section>' +
        '<section class="panel"><div class="panel-head"><h2>Портфолио</h2><span class="tag num">' + c.portfolio.length + '</span></div><div class="panel-body" style="display:grid;gap:16px">' +
        c.portfolio.map((w, i) => '<div class="pf-edit"><span class="pf-thumb">' + U.frame(w.media, { w: 120, zoom: true, creator: c.id, caption: w.title }) + '</span><div class="form-grid" style="flex:1;min-width:0">' +
          U.fieldHTML({ name: 'w-t' + i, label: 'Название работы', value: w.title }) +
          U.fieldHTML({ name: 'w-f' + i, label: 'Формат', value: w.format, options: U.WORK_FORMATS }) +
          '<div class="full">' + U.fieldHTML({ name: 'w-k' + i, label: 'Задача', value: w.task }) + '</div></div>' +
          '<div class="pf-tools"><button type="button" class="btn btn-ghost btn-icon btn-sm" data-move="' + i + '" data-dir="-1" aria-label="Поднять работу ' + (i + 1) + '"' + (i === 0 ? ' disabled' : '') + '>' + I('chevron-left', 'rot90') + '</button><button type="button" class="btn btn-ghost btn-icon btn-sm" data-move="' + i + '" data-dir="1" aria-label="Опустить работу ' + (i + 1) + '"' + (i === c.portfolio.length - 1 ? ' disabled' : '') + '>' + I('chevron-right', 'rot90') + '</button><button type="button" class="btn btn-ghost btn-icon btn-sm" data-remove-work="' + i + '" aria-label="Убрать работу ' + (i + 1) + ' из портфолио"' + (c.portfolio.length <= 1 ? ' disabled' : '') + '>' + I('trash') + '</button></div></div>').join('') +
        '<p class="hint">Загрузка новых работ в прототипе недоступна — можно менять описания, порядок и скрывать работы.</p></div></section>' +
        '<div class="row" style="justify-content:flex-end"><button class="btn btn-primary" type="submit">Сохранить профиль</button></div></form></div>';
    },
    mount(root) {
      const f = root.querySelector('#pf-form');
      if (!f) return;
      const c = me();
      const collect = () => ({
        city: f.elements.city.value.trim(), langs: f.elements.langs.value.split(',').map((x) => x.trim()).filter(Boolean),
        bio: f.elements.bio.value.trim(), equipment: f.elements.equipment.value.trim(),
        topics: [...f.querySelectorAll('[name=topics]:checked')].map((x) => x.value),
        presence: [...f.querySelectorAll('[name=presence]:checked')].map((x) => x.value),
        services: c.services.map((x, i) => Object.assign({}, x, { title: f.elements['sv-t' + i].value.trim() || x.title, price: Number(f.elements['sv-p' + i].value) })),
        portfolio: c.portfolio.map((w, i) => Object.assign({}, w, { title: f.elements['w-t' + i].value.trim() || w.title, format: f.elements['w-f' + i].value, task: f.elements['w-k' + i].value.trim() })),
      });
      root.querySelectorAll('[data-move]').forEach((b) => b.addEventListener('click', () => {
        const i = Number(b.dataset.move), j = i + Number(b.dataset.dir);
        const patch = collect(); const p = patch.portfolio; [p[i], p[j]] = [p[j], p[i]];
        U.flow.updateCreator(c.id, { portfolio: p });
        U.rerender(); U.toast('Порядок изменён', 'Первая работа — обложка в каталоге');
      }));
      root.querySelectorAll('[data-remove-work]').forEach((b) => b.addEventListener('click', async () => {
        const ok = await U.confirm({ title: 'Убрать работу из портфолио?', text: 'Работа перестанет показываться заказчикам.', ok: 'Убрать', danger: true });
        if (!ok) return;
        const patch = collect(); patch.portfolio.splice(Number(b.dataset.removeWork), 1);
        U.flow.updateCreator(c.id, { portfolio: patch.portfolio });
        U.rerender(); U.toast('Работа скрыта');
      }));
      f.addEventListener('submit', (e) => {
        e.preventDefault();
        const rules = { city: (v) => (v.length < 2 ? 'Укажите город' : ''), bio: (v) => (v.length < 30 ? 'Расскажите о себе подробнее — минимум 30 символов' : ''), topics: () => (f.querySelectorAll('[name=topics]:checked').length ? '' : 'Выберите хотя бы одну тематику') };
        c.services.forEach((x, i) => { rules['sv-p' + i] = (v) => (!v || Number(v) < 500 ? 'Цена — не меньше 500 ₽' : ''); });
        if (!U.validate(f, rules)) return;
        U.flow.updateCreator(c.id, collect());
        U.rerender();
        U.toast('Профиль сохранён', 'Изменения уже видны в каталоге и профиле');
      });
    },
  };

  /* ---------- Адрес ПВЗ и реквизиты ---------- */
  U.pages.studioSettings = {
    shell: 'app',
    title: 'Адрес и выплаты',
    render() {
      if (U.store.s.role !== 'creator') return needCreator();
      const c = me();
      const a = c.address || {}, p = c.payout || {};
      const pst = { verified: ['status-success', 'Реквизиты подтверждены'], pending: ['status-warning', 'Реквизиты на проверке'] }[p.status] || ['', 'Не заполнены'];
      return '<div class="page"><nav class="crumbs" aria-label="Навигация"><a href="#/studio">Мой кабинет</a>' + I('chevron-right') + '<span aria-current="page">Адрес и выплаты</span></nav>' +
        '<div class="page-head"><div><h1>Адрес и выплаты</h1><p class="sub">Данные видит только платформа; заказчик получает адрес пункта выдачи после оплаты заказа</p></div></div>' +
        '<div class="notice notice-warning" style="margin-bottom:20px">' + I('alert') + '<div><b>Демо-режим.</b> Не вводите настоящие паспортные и банковские данные — прототип хранит их только в этом браузере и ничего не проверяет.</div></div>' +
        '<div class="settings-grid">' +
        '<form class="panel" id="addr-form" novalidate><div class="panel-head">' + I('package') + '<h2>Пункт выдачи для товаров</h2></div><div class="panel-body" style="display:grid;gap:16px">' +
        U.fieldHTML({ name: 'recipient', label: 'Получатель', required: true, value: a.recipient, attrs: 'autocomplete="name"' }) +
        U.fieldHTML({ name: 'city', label: 'Город', required: true, value: a.city, attrs: 'autocomplete="address-level2"' }) +
        U.fieldHTML({ name: 'pvz', label: 'Пункт выдачи', required: true, value: a.pvz, hint: 'Адрес или код пункта выдачи' }) +
        U.fieldHTML({ name: 'phone', label: 'Телефон для уведомлений', type: 'tel', required: true, value: '', placeholder: '+7 900 000-00-00', hint: 'Сейчас сохранён: ' + (a.phone || '—') + '. Заказчику показывается частично.', attrs: 'autocomplete="tel" inputmode="tel"' }) +
        '<button class="btn btn-primary" type="submit" style="justify-self:start">Сохранить адрес</button></div></form>' +
        '<form class="panel" id="pay-form" novalidate><div class="panel-head">' + I('wallet') + '<h2>Реквизиты для выплат</h2><span class="spacer"></span><span class="status ' + pst[0] + '">' + pst[1] + '</span></div><div class="panel-body" style="display:grid;gap:16px">' +
        U.fieldHTML({ name: 'type', label: 'Статус', value: p.type || 'Самозанятый', options: ['Самозанятый', 'ИП'] }) +
        U.fieldHTML({ name: 'inn', label: 'ИНН', required: true, value: '', placeholder: '12 цифр', hint: 'Сейчас сохранён: ' + (p.inn || '—'), attrs: 'inputmode="numeric" maxlength="12" autocomplete="off"' }) +
        U.fieldHTML({ name: 'account', label: 'Карта для выплат — последние 4 цифры', required: true, value: '', placeholder: '0000', hint: 'Сейчас: ' + (p.account || '—') + '. Полный номер в прототипе не запрашивается.', attrs: 'inputmode="numeric" maxlength="4" autocomplete="off"' }) +
        '<button class="btn btn-primary" type="submit" style="justify-self:start">Отправить на проверку</button></div></form>' +
        '<section class="panel"><div class="panel-head">' + I('shield') + '<h2>Проверка профиля</h2></div><div class="panel-body" style="display:grid;gap:10px">' + U.verifyLine(c) +
        ((c.verifyLog || []).length ? '<ol class="history">' + c.verifyLog.map((x) => '<li><time>' + U.dateTime(x.at) + '</time><div>' + E(x.text) + '</div></li>').join('') + '</ol>' : '<p class="small muted">Документы проверены при регистрации.</p>') +
        '<p class="hint">Пока проверка не завершена, заказчики не могут отправить вам товар.</p></div></section></div></div>';
    },
    mount(root) {
      const c = me();
      const af = root.querySelector('#addr-form'), pf = root.querySelector('#pay-form');
      if (!af) return;
      af.addEventListener('submit', (e) => {
        e.preventDefault();
        const ok = U.validate(af, {
          recipient: (v) => (v.length < 3 ? 'Укажите имя и фамилию получателя' : ''),
          city: (v) => (v.length < 2 ? 'Укажите город' : ''),
          pvz: (v) => (v.length < 5 ? 'Укажите адрес или код пункта выдачи' : ''),
          phone: (v) => (!/^\+?[0-9 ()-]{10,18}$/.test(v) ? 'Телефон в формате +7 900 000-00-00' : ''),
        });
        if (!ok) return;
        const digits = af.elements.phone.value.replace(/\D/g, '');
        U.flow.updateCreator(c.id, { address: { recipient: af.elements.recipient.value.trim(), city: af.elements.city.value.trim(), pvz: af.elements.pvz.value.trim(), phone: '+7 9•• •••-' + digits.slice(-4, -2) + '-' + digits.slice(-2) } });
        U.rerender();
        U.toast('Адрес сохранён', 'Используется для новых отправлений');
      });
      pf.addEventListener('submit', async (e) => {
        e.preventDefault();
        const ok = U.validate(pf, {
          inn: (v) => (!/^\d{12}$/.test(v) ? 'ИНН физлица или ИП — 12 цифр' : ''),
          account: (v) => (!/^\d{4}$/.test(v) ? 'Последние 4 цифры карты' : ''),
        });
        if (!ok) return;
        await U.busy(pf.querySelector('[type=submit]'));
        const inn = pf.elements.inn.value;
        U.flow.updateCreator(c.id, { payout: { type: pf.elements.type.value, inn: inn.slice(0, 2) + '•• •••• ••' + inn.slice(-2), account: 'Карта •• ' + pf.elements.account.value, status: 'pending' } });
        U.rerender();
        U.toast('Реквизиты отправлены на проверку', 'Демо: проверка не проводится, статус остаётся «на проверке»');
      });
    },
  };
})();
