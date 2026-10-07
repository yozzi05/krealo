/* Кампании заказчика: список и страница кампании с откликами и предложениями */
(function () {
  const I = U.icon, E = U.esc;
  const ST = { active: ['status-success', 'Идёт работа'], recruiting: ['status-info', 'Набор креаторов'], draft: ['', 'Черновик'], closed: ['', 'Завершена'] };
  const APP_ST = { new: ['status-info', 'Новый'], offered: ['status-warning', 'Предложение отправлено'], declined: ['', 'Отклонён'], offer_declined: ['', 'Креатор отказался'], chosen: ['status-success', 'Выбран'] };

  function campStats(c) {
    const s = U.store.s;
    const orders = s.orders.filter((o) => o.campaignId === c.id);
    const apps = s.applications.filter((a) => a.campaignId === c.id && a.status === 'new');
    const offers = s.offers.filter((o) => o.campaignId === c.id && o.status === 'pending');
    const done = orders.filter((o) => o.stage === 'accepted').length;
    return { orders, apps, offers, done };
  }

  U.pages.campaigns = {
    shell: 'app',
    title: 'Кампании',
    render() {
      const s = U.store.s;
      const list = s.campaigns.slice().sort((a, b) => (b.createdAt > a.createdAt ? 1 : -1));
      const reserved = s.orders.filter((o) => o.payment.status === 'held').reduce((a, o) => a + U.T.orderTotal(o), 0);
      const review = s.orders.filter((o) => o.stage === 'review' || (o.stage === 'publishing' && o.publication && o.publication.url)).length;
      const apps = s.applications.filter((a) => a.status === 'new').length;
      return '<div class="page"><div class="page-head"><div><h1>Кампании</h1><p class="sub">Северный уход · ' + list.length + ' ' + U.plural(list.length, ['кампания', 'кампании', 'кампаний']) + '</p></div>' +
        '<div class="page-head-actions"><a class="btn btn-primary" href="#/campaigns/new">' + I('plus') + 'Новая кампания</a></div></div>' +
        '<dl class="stats"><div class="stat"><dt>Ждут проверки</dt><dd>' + review + '</dd><span class="hint">материалов и публикаций</span></div>' +
        '<div class="stat"><dt>Новые отклики</dt><dd>' + apps + '</dd><span class="hint">на брифы в наборе</span></div>' +
        '<div class="stat"><dt>Активные заказы</dt><dd>' + s.orders.filter((o) => o.stage !== 'accepted').length + '</dd><span class="hint">по всем кампаниям</span></div>' +
        '<div class="stat is-dark"><dt>Зарезервировано</dt><dd>' + U.money(reserved) + '</dd><span class="hint">до приёмки работ · демо</span></div></dl>' +
        '<div class="camp-list">' + list.map((c) => {
          const st = campStats(c);
          const [cls, txt] = ST[c.status] || ST.draft;
          return '<a class="camp" href="#/campaigns/' + c.id + '">' + U.frame(c.product.media, { w: 144, ratio: 1, cls: 'frame-1x1', play: false, alt: '' }) +
            '<div style="min-width:0"><div class="row-wrap"><h2 class="wrap-any">' + E(c.title) + '</h2><span class="status ' + cls + '">' + txt + '</span>' + (c.format === 'publish' ? '<span class="tag">С публикацией</span>' : '') + '</div>' +
            '<div class="camp-meta"><span class="wrap-any">' + E(c.product.name) + '</span><span>Гонорар <b>' + U.moneyText(c.fee) + '</b></span><span>Съёмка ' + U.T.days(c.shootDays, 'calendar') + '</span>' + (st.apps.length ? '<span class="needs-me">' + st.apps.length + ' ' + U.plural(st.apps.length, ['новый отклик', 'новых отклика', 'новых откликов']) + '</span>' : '') + '</div></div>' +
            '<div class="camp-progress"><span class="row" style="justify-content:space-between"><span class="muted">Креаторы</span><b class="num">' + st.orders.length + ' из ' + c.creatorsNeeded + '</b></span>' +
            '<div class="progress" aria-hidden="true"><span style="width:' + Math.min(100, st.orders.length / c.creatorsNeeded * 100) + '%"></span></div>' +
            '<span class="muted">Принято работ: <b style="color:var(--c-text)">' + st.done + '</b>' + (st.offers.length ? ' · ждут ответа: ' + st.offers.length : '') + '</span></div></a>';
        }).join('') + '</div></div>';
    },
  };

  U.pages.campaign = {
    shell: 'app',
    title: (p) => { const c = U.q.campaign(p.id); return c ? c.title : 'Кампания'; },
    render(p) {
      const c = U.q.campaign(p.id);
      if (!c) return U.pages.notfound.render({}, {}, 'Кампания не найдена.');
      const s = U.store.s;
      const st = campStats(c);
      const terms = U.T.snapshot(c, U.config);
      const allApps = s.applications.filter((a) => a.campaignId === c.id);
      const offers = s.offers.filter((o) => o.campaignId === c.id && o.status !== 'accepted');
      const [cls, txt] = ST[c.status] || ST.draft;
      const b = U.T.budget({ fee: c.fee, n: c.creatorsNeeded, ship: terms.ship, returnProduct: terms.returnProduct }, U.config);
      const li = (arr, icon) => '<ul class="brief-list">' + arr.map((x) => '<li>' + I(icon) + '<span>' + E(x) + '</span></li>').join('') + '</ul>';
      return '<div class="page"><nav class="crumbs" aria-label="Навигация"><a href="#/campaigns">Кампании</a>' + I('chevron-right') + '<span aria-current="page" class="wrap-any">' + E(c.title) + '</span></nav>' +
        '<div class="page-head"><div class="row" style="gap:16px;align-items:center;min-width:0">' + '<span style="width:64px;flex:none">' + U.frame(c.product.media, { w: 128, ratio: 1, cls: 'frame-1x1', play: false, alt: '' }) + '</span><div style="min-width:0"><h1 class="wrap-any">' + E(c.title) + '</h1><p class="sub">' + E(c.product.name) + ' · <span class="status ' + cls + '">' + txt + '</span></p></div></div>' +
        '<div class="page-head-actions"><a class="btn" href="#/creators' + (c.format === 'publish' ? '?fmt=publish' : '') + '">' + I('users') + 'Пригласить из каталога</a></div></div>' +
        '<div class="two-col"><div style="display:grid;gap:20px;min-width:0">' +
        '<section class="panel" aria-labelledby="apps-h"><div class="panel-head"><h2 id="apps-h">Отклики</h2><span class="tag num">' + st.apps.length + ' новых</span></div>' +
        (allApps.length ? allApps.map((a) => {
          const cr = U.q.creator(a.creatorId);
          const over = a.price > c.fee;
          const block = U.rules.canOffer(cr.id, terms);
          const [acls, atxt] = APP_ST[a.status] || ['', a.status];
          return '<div class="app-row">' + U.avatar(cr, 48) + '<div style="min-width:0"><div class="row-wrap"><a class="link" href="#/creators/' + cr.id + '">' + E(cr.name) + '</a><span class="small muted">' + E(cr.city) + '</span>' + (cr.rating ? '<span class="rating small">' + I('star') + String(cr.rating).replace('.', ',') + '</span>' : '') + '<span class="status ' + acls + '">' + atxt + '</span></div>' +
            '<p class="wrap-any">' + E(a.message) + '</p><p class="small muted">' + U.dateTime(a.at) + ' · цена ' + U.moneyText(a.price) + (over ? ' — выше бюджета брифа на ' + U.moneyText(a.price - c.fee) : '') + '</p>' +
            (block && a.status === 'new' ? '<p class="notice notice-warning small" style="margin-top:8px">' + I('alert') + '<span>' + E(block) + '</span></p>' : '') +
            '<div class="row" style="gap:6px;margin-top:8px">' + cr.portfolio.slice(0, 3).map((w) => '<span style="width:56px">' + U.frame(w.media, { w: 112, cls: 'frame-sm', zoom: true, caption: w.title, creator: cr.id }) + '</span>').join('') + '</div></div>' +
            '<div class="actions">' + (a.status === 'new'
              ? '<button class="btn btn-sm" type="button" data-action="decline-app" data-app="' + a.id + '">Отклонить</button><button class="btn btn-primary btn-sm" type="button" data-action="choose-app" data-app="' + a.id + '"' + (block ? ' disabled aria-describedby="why-' + a.id + '"' : '') + '>Выбрать</button>' + (block ? '<span class="sr-only" id="why-' + a.id + '">' + E(block) + '</span>' : '')
              : a.offerId && U.q.offer(a.offerId) && U.q.offer(a.offerId).orderId ? '<a class="btn btn-sm" href="#/orders/' + U.q.offer(a.offerId).orderId + '">Заказ ' + U.q.offer(a.offerId).orderId + '</a>' : '') + '</div></div>';
        }).join('') : '<div class="panel-body"><div class="empty" style="border:0;padding:24px">' + I('inbox') + '<h3>Откликов пока нет</h3><p>Креаторы увидят бриф в своём кабинете. Можно пригласить человека из каталога.</p></div></div>') + '</section>' +
        (offers.length ? '<section class="panel" aria-labelledby="of-h"><div class="panel-head"><h2 id="of-h">Отправленные предложения</h2></div>' + offers.map((of) => {
          const cr = U.q.creator(of.creatorId);
          const stt = { pending: ['status-warning', 'Ждёт ответа креатора'], declined: ['', 'Отклонено: ' + (of.declineReason || '')], withdrawn: ['', 'Отозвано'] }[of.status];
          return '<div class="app-row">' + U.avatar(cr, 40) + '<div style="min-width:0"><b>' + E(cr.name) + '</b> · ' + U.moneyText(of.fee) + '<p class="small"><span class="status ' + stt[0] + '">' + E(stt[1]) + '</span></p></div><div class="actions">' + (of.status === 'pending' ? '<button class="btn btn-sm" type="button" data-action="withdraw-offer" data-offer="' + of.id + '">Отозвать</button>' : '') + '</div></div>';
        }).join('') + '</section>' : '') +
        '<section class="panel" aria-labelledby="co-h"><div class="panel-head"><h2 id="co-h">Заказы кампании</h2><span class="tag num">' + st.orders.length + ' из ' + c.creatorsNeeded + '</span></div>' +
        (st.orders.length ? '<div class="table-wrap"><table class="table"><thead><tr><th scope="col">Заказ</th><th scope="col">Креатор</th><th scope="col">Этап</th><th scope="col" class="col-num">Сумма</th></tr></thead><tbody>' +
          st.orders.map((o) => '<tr><td><a class="row-link num" href="#/orders/' + o.id + '">' + o.id + '</a></td><td><div class="cell-person">' + U.avatar(U.q.creator(o.creatorId), 28) + E(U.q.creator(o.creatorId).name) + '</div></td><td>' + U.stagePill(o) + '</td><td class="col-num">' + U.money(U.T.orderTotal(o)) + '</td></tr>').join('') + '</tbody></table></div>'
          : '<div class="panel-body"><p class="muted">Заказов пока нет — выберите креатора из откликов.</p></div>') + '</section></div>' +
        '<aside class="panel" aria-labelledby="br-h"><div class="panel-head"><h2 id="br-h">Бриф и условия</h2></div><div class="panel-body">' +
        '<div class="brief-block"><dl class="kv kv-left"><dt>Формат</dt><dd>' + (c.format === 'ugc' ? 'UGC без публикации' : 'С публикацией') + '</dd><dt>Гонорар</dt><dd>' + U.money(c.fee) + '</dd><dt>Креаторов</dt><dd class="num">' + c.creatorsNeeded + '</dd>' + U.T.rows(terms).map(([k, v]) => '<dt>' + E(k) + '</dt><dd>' + E(v) + '</dd>').join('') + '</dl></div>' +
        '<div class="brief-block"><h3>Бюджет кампании</h3><dl class="kv"><dt>За одного креатора</dt><dd>' + U.money(b.perCreator) + '</dd><dt class="total">Всего' + (b.estimated ? ' (оценка)' : '') + '</dt><dd class="total">' + U.money(b.total) + '</dd></dl></div>' +
        '<div class="brief-block"><h3>Что сдать</h3>' + li(c.deliverables, 'check') + '</div>' +
        '<div class="brief-block"><h3>Обязательно показать</h3>' + li(c.mustShow, 'eye') + '</div>' +
        (c.avoid.length ? '<div class="brief-block"><h3>Чего избегать</h3>' + li(c.avoid, 'x') + '</div>' : '') +
        '</div></aside></div></div>';
    },
  };

  U.actions['choose-app'] = async (el) => {
    const a = U.store.s.applications.find((x) => x.id === el.dataset.app);
    const cr = U.q.creator(a.creatorId);
    const auto = U.store.s.settings.autoAccept;
    const ok = await U.confirm({ title: 'Выбрать ' + E(cr.name) + '?', text: 'Креатор получит предложение с гонораром ' + U.moneyText(a.price) + ' и условиями брифа. Заказ появится, когда креатор примет предложение' + (auto ? ' (демо-режим автопринятия включён).' : '.'), ok: 'Отправить предложение' });
    if (!ok) return;
    try {
      const r = U.flow.chooseApplicant(a.id);
      if (r.orderId) { U.toast('Заказ создан', 'Демо-режим: креатор принял предложение'); U.go('orders/' + r.orderId); }
      else { U.rerender(); U.toast('Предложение отправлено', cr.name + ' увидит его в разделе «Приглашения»'); }
    } catch (e) { U.toast('Нельзя выбрать креатора', e.message, 'error'); }
  };
  U.actions['decline-app'] = (el) => {
    const a = U.store.s.applications.find((x) => x.id === el.dataset.app);
    const d = U.modal.open({
      title: 'Отклонить отклик',
      body: '<form id="da-form" novalidate>' + U.fieldHTML({ name: 'reason', label: 'Причина для креатора', required: true, options: [['', 'Выберите причину'], 'Выбрали другого креатора', 'Цена выше бюджета', 'Портфолио не подходит под задачу', 'Набрали нужное количество креаторов'] }) + '</form>',
      foot: '<button class="btn" type="button" data-close>Отмена</button><button class="btn btn-dark" type="button" data-ok>Отклонить</button>',
    });
    d.querySelector('[data-ok]').addEventListener('click', () => {
      const f = d.querySelector('#da-form');
      if (!U.validate(f, { reason: (v) => (v ? '' : 'Выберите причину — креатор её увидит') })) return;
      U.flow.declineApplicant(a.id, f.reason.value);
      d.close();
      U.rerender();
      U.toast('Отклик отклонён', 'Креатор увидит причину в своём кабинете');
    });
  };
  U.actions['withdraw-offer'] = async (el) => {
    const ok = await U.confirm({ title: 'Отозвать предложение?', text: 'Креатор больше не сможет его принять.', ok: 'Отозвать', danger: true });
    if (!ok) return;
    U.flow.withdrawOffer(el.dataset.offer);
    U.rerender();
    U.toast('Предложение отозвано');
  };
})();
