/* Профиль креатора: портфолио — главное содержание */
(function () {
  const I = U.icon, E = U.esc;
  let kind = 'all';
  let lastId = null;

  function workCard(c, w) {
    const m = U.media[w.media];
    return '<article class="work">' +
      U.frame(w.media, { w: 360, zoom: true, creator: c.id, caption: w.title, label: m.kind === 'video' ? I('video', 'icon-sm') + '<span class="num">' + m.dur + '</span>' : I('image', 'icon-sm') + 'Фото' }) +
      '<div class="work-info"><h3>' + E(w.title) + '</h3><p class="work-meta">' + E(w.format) + ' · ' + E(w.category) + '</p><p class="work-task">' + E(w.task) + '</p></div></article>';
  }

  U.pages.creator = {
    shell: 'app',
    title: (p) => { const c = U.q.creator(p.id); return c ? c.name : 'Креатор'; },
    render(p) {
      const c = U.q.creator(p.id);
      if (!c) return U.pages.notfound.render({}, {}, 'Креатор не найден.');
      if (lastId !== c.id) { kind = 'all'; lastId = c.id; }
      const s = U.store.s;
      const role = s.role;
      const orders = s.orders.filter((o) => o.creatorId === c.id);
      const offers = s.offers.filter((o) => o.creatorId === c.id && o.status === 'pending');
      const vids = c.portfolio.filter((w) => U.media[w.media].kind === 'video').length;
      const pics = c.portfolio.length - vids;
      const list = c.portfolio.filter((w) => kind === 'all' || U.media[w.media].kind === kind);
      const ugcMin = U.q.ugcPrice(c);
      const svc = (k, t) => { const l = U.q.services(c, k); return l.length ? '<h3 class="svc-h">' + t + '</h3><div class="price-list">' + l.map((x) => '<div><span>' + E(x.title) + '</span>' + U.money(x.price) + '</div>').join('') + '</div>' : ''; };
      const canOrder = role === 'brand';
      const restricted = !U.q.canShipTo(c);
      return '<div class="page profile-page' + (canOrder ? ' has-bottom-bar' : '') + '">' +
        '<nav class="crumbs" aria-label="Навигация"><a href="#/creators">Креаторы</a>' + I('chevron-right') + '<span aria-current="page">' + E(c.name) + '</span></nav>' +
        '<header class="profile-top">' + U.avatar(c, 72, 'avatar-lg') +
        '<div style="min-width:0"><h1>' + E(c.name) + '</h1>' +
        '<div class="row-wrap profile-meta"><span class="row" style="gap:6px">' + I('pin', 'icon-sm') + E(c.city) + '</span><span class="row" style="gap:6px">' + I('lang', 'icon-sm') + E(c.langs.join(', ')) + '</span><span class="row" style="gap:6px">' + I('clock', 'icon-sm') + 'Отвечает за ~' + c.responseHours + ' ч</span></div>' +
        '<div class="row-wrap" style="margin-top:6px">' + U.ratingLine(c) + '</div></div></header>' +
        '<div class="profile">' +
        '<div style="min-width:0">' +
        '<section aria-labelledby="pf-h"><div class="section-bar"><h2 id="pf-h" class="t-h3">Портфолио <span class="muted num">' + c.portfolio.length + '</span></h2>' +
        (vids && pics ? '<div class="segmented" role="group" aria-label="Тип материала">' +
          [['all', 'Все', c.portfolio.length], ['video', 'Видео', vids], ['image', 'Фото', pics]].map(([k, t, n]) => '<button type="button" data-kind="' + k + '" aria-pressed="' + (kind === k) + '">' + t + ' <span class="num muted">' + n + '</span></button>').join('') + '</div>'
          : '<span class="small muted">' + (vids ? 'Только видео' : 'Пока только фото — видео в портфолио нет') + '</span>') + '</div>' +
        '<div class="works">' + list.map((w) => workCard(c, w)).join('') + '</div>' +
        '<p class="hint" style="margin-top:12px">' + I('info', 'icon-sm') + ' Работы — демо-материалы со стоков; названия и задачи вымышлены.</p></section>' +
        '<section class="profile-about" aria-labelledby="ab-h"><h2 id="ab-h" class="t-h3">О креаторе</h2><p>' + E(c.bio) + '</p>' +
        '<div class="row-wrap" style="margin-top:12px">' + c.topics.map((t) => '<span class="tag">' + E(t) + '</span>').join('') + c.presence.map((x) => '<span class="tag">' + U.PRESENCE[x] + '</span>').join('') + '</div>' +
        '<dl class="kv profile-kv"><dt>Оборудование</dt><dd>' + E(c.equipment) + '</dd>' +
        (c.audience ? '<dt>' + E(c.audience.platform) + '</dt><dd>' + U.num(c.audience.followers) + ' подписчиков, охват ~' + U.num(c.audience.reach) + '</dd><dt>География</dt><dd>' + E(c.audience.geo) + '</dd>' : '') +
        '</dl>' + (c.audience ? '<p class="hint">Показатели аудитории демонстрационные; в рабочей версии — из статистики площадки.</p>' : '') + '</section>' +
        '</div>' +
        '<aside class="profile-side" aria-label="Услуги и условия">' +
        '<div class="panel"><div class="panel-body" style="display:grid;gap:14px">' +
        svc('ugc', 'Видео и фото без публикации') + svc('publish', 'С публикацией у креатора') +
        U.verifyLine(c) +
        (restricted ? '<div class="notice notice-warning">' + I('alert') + '<div><b>Ограничения до проверки.</b> Заказы с отправкой товара недоступны: адрес креатора не передаётся, пока документы не подтверждены. Можно заказать работу без физического товара.</div></div>' : '') +
        (canOrder ? '<button class="btn btn-primary btn-block" type="button" data-action="propose" data-creator="' + c.id + '" id="propose-main">Предложить заказ</button>' : '') +
        (role === 'creator' && s.creatorSelf === c.id ? '<a class="btn btn-block" href="#/studio/profile">' + I('edit') + 'Редактировать профиль</a>' : '') +
        '<p class="hint">Сервисный сбор ' + Math.round(U.config.serviceFeeRate * 100) + '% и доставка (оценка) добавляются к гонорару при оплате.</p></div></div>' +
        ((orders.length || offers.length) && role !== 'creator' ? '<div class="panel"><div class="panel-head"><h2>История с креатором</h2></div><div class="panel-body" style="display:grid;gap:10px">' +
          offers.map((of) => '<div class="row" style="justify-content:space-between;gap:8px"><span class="small"><b>Предложение</b><span class="cell-sub">' + E(U.q.campaign(of.campaignId).title) + '</span></span><span class="status status-warning">Ждёт ответа</span></div>').join('') +
          orders.map((o) => '<a class="row" style="text-decoration:none;justify-content:space-between;gap:8px" href="#/orders/' + o.id + '"><span style="min-width:0"><b class="num">' + o.id + '</b><span class="cell-sub">' + E(U.q.campaign(o.campaignId).product.name) + '</span></span>' + U.stagePill(o) + '</a>').join('') + '</div></div>' : '') +
        '</aside></div>' +
        (canOrder ? '<div class="bottom-bar" role="region" aria-label="Заказ у креатора"><div><span class="small muted">' + ugcMin.label + '</span><b>от ' + U.money(ugcMin.price) + '</b></div><button class="btn btn-primary" type="button" data-action="propose" data-creator="' + c.id + '">Предложить заказ</button></div>' : '') +
        '</div>';
    },
    mount(root) {
      root.querySelectorAll('[data-kind]').forEach((b) => b.addEventListener('click', () => { kind = b.dataset.kind; U.rerender(); document.querySelector('[data-kind="' + kind + '"]').focus(); }));
    },
  };

  /* ---------- Предложение заказа ---------- */
  U.actions.propose = function (el) {
    const c = U.q.creator(el.dataset.creator);
    const s = U.store.s;
    const camps = s.campaigns.filter((x) => x.status === 'active' || x.status === 'recruiting');
    const opt = (x) => {
      const reason = U.rules.canOffer(c.id, U.T.snapshot(x, U.config));
      const noPub = x.format === 'publish' && !U.q.publishService(c, x.publication && x.publication.service);
      return '<option value="' + x.id + '"' + (reason || noPub ? ' disabled' : '') + '>' + E(x.title) + (reason ? ' — нужна проверка креатора' : noPub ? ' — креатор не публикует' : '') + '</option>';
    };
    const d = U.modal.open({
      title: 'Предложить заказ: ' + E(c.name), cls: 'modal-wide',
      body: '<form id="prop-form" novalidate class="form-cols">' +
        '<div style="display:grid;gap:16px;align-content:start">' +
        (!U.q.canShipTo(c) ? '<div class="notice notice-warning">' + I('alert') + '<div>Креатор ещё не прошёл проверку документов. Кампании с отправкой товара недоступны — это ограничение действует и при выборе по отклику, и при повторном заказе.</div></div>' : '') +
        '<div class="field"><label for="f-campaign">Кампания <span class="req" aria-hidden="true">*</span></label><select class="select" id="f-campaign" name="campaign" aria-describedby="f-campaign-e"><option value="">Выберите кампанию</option>' + camps.map(opt).join('') + '</select><span class="error-text" id="f-campaign-e" data-error-for="campaign"></span></div>' +
        U.fieldHTML({ name: 'fee', label: 'Гонорар креатору, ₽', type: 'number', value: U.q.minPrice(c, 'ugc'), required: true, attrs: 'inputmode="numeric" min="1000" step="500"', hint: 'Цена креатора подставляется по выбранной услуге' }) +
        U.fieldHTML({ name: 'note', label: 'Сообщение креатору', textarea: true, placeholder: 'Например: нужен спокойный тон и крупные планы текстуры' }) +
        '<label class="check"><input type="checkbox" name="auto"' + (s.settings.autoAccept ? ' checked' : '') + '><span>Демо-режим: креатор принимает предложение автоматически <span class="proto-flag">прототип</span></span></label>' +
        '</div><div id="prop-sum" class="prop-sum" aria-live="polite"></div></form>',
      foot: '<button class="btn" type="button" data-close>Отмена</button><button class="btn btn-primary" type="button" data-ok>Отправить предложение</button>',
    });
    const f = d.querySelector('#prop-form');
    const sum = d.querySelector('#prop-sum');
    const priceFor = (cmp) => (cmp && cmp.format === 'publish' ? (U.q.publishService(c, cmp.publication.service) || {}).price : U.q.minPrice(c, 'ugc'));
    const draw = (setFee) => {
      const cmp = U.q.campaign(f.campaign.value);
      if (!cmp) { sum.innerHTML = '<div class="empty" style="padding:24px">' + I('file') + '<p>Выберите кампанию — здесь появятся условия и расчёт.</p></div>'; return; }
      if (setFee) f.fee.value = priceFor(cmp);
      const t = U.T.snapshot(cmp, U.config);
      const b = U.T.budget({ fee: f.fee.value, ship: t.ship, returnProduct: t.returnProduct }, U.config);
      sum.innerHTML = '<h3 class="t-h3" style="font-size:16px">Условия, которые зафиксируются в заказе</h3><dl class="kv kv-left">' + U.T.rows(t).map(([k, v]) => '<dt>' + E(k) + '</dt><dd>' + E(v) + '</dd>').join('') + '</dl>' +
        '<hr class="divider"><dl class="kv"><dt>Гонорар</dt><dd>' + U.money(b.fee) + '</dd><dt>Сбор ' + Math.round(U.config.serviceFeeRate * 100) + '%</dt><dd>' + U.money(b.commission) + '</dd>' +
        (t.ship ? '<dt>Доставка, оценка</dt><dd>' + U.money(b.delivery) + '</dd>' : '') + (t.returnProduct ? '<dt>Возврат товара, оценка</dt><dd>' + U.money(b.returnCost) + '</dd>' : '') +
        '<dt class="total">Итого' + (b.estimated ? ' ≈' : '') + '</dt><dd class="total">' + U.money(b.perCreator) + '</dd></dl>';
    };
    f.campaign.addEventListener('change', () => draw(true));
    f.fee.addEventListener('input', () => draw(false));
    draw(false);
    d.querySelector('[data-ok]').addEventListener('click', async (e) => {
      const cmp = U.q.campaign(f.campaign.value);
      const min = priceFor(cmp);
      const ok = U.validate(f, {
        campaign: (v) => (v ? '' : 'Выберите кампанию, к которой относится заказ'),
        fee: (v) => (!v ? 'Укажите гонорар' : Number(v) < 1000 ? 'Минимальный гонорар — 1 000 ₽' : min && Number(v) < min ? 'Это ниже цены креатора (' + U.moneyText(min) + ') — укажите не меньше' : ''),
      });
      if (!ok) return;
      await U.busy(e.currentTarget);
      U.store.update((st) => { st.settings.autoAccept = f.auto.checked; });
      try {
        const r = U.flow.createOffer({ campaignId: cmp.id, creatorId: c.id, fee: f.fee.value, note: f.note.value.trim() });
        d.close();
        if (r.orderId) { U.toast('Заказ создан', 'Демо-режим: креатор принял предложение. Следующий шаг — оплата.'); U.go('orders/' + r.orderId); }
        else { U.toast('Предложение отправлено', 'Креатор увидит его в разделе «Приглашения» и примет или отклонит'); U.rerender(); }
      } catch (err) { U.toast('Предложение не отправлено', err.message, 'error'); }
    });
  };
})();
