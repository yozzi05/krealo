/* Карточка заказа — главный рабочий экран. */
(function () {
  const I = U.icon, E = U.esc;
  const view = { orderId: null, tab: 'materials', ver: null, file: 0 };
  const roleIn = () => U.store.s.role;

  function stepsHTML(o) {
    const shown = U.T.stages(o);
    const cur = o.stage === 'revision' ? 'review' : o.stage;
    const ci = shown.indexOf(cur);
    return '<ol class="steps" aria-label="Этапы заказа">' + shown.map((id, i) => {
      const label = id === 'review' && o.stage === 'revision' ? 'Правки' : U.T.STAGE_LABEL[id];
      const done = i < ci || o.stage === 'accepted';
      return '<li class="' + (done ? 'is-done' : i === ci ? 'is-current' : '') + '"' + (i === ci ? ' aria-current="step"' : '') + '><span>' + label + '</span><span class="sr-only">' + (done ? ' — пройден' : i === ci ? ' — текущий' : '') + '</span></li>';
    }).join('') + '</ol><p class="steps-short">Этап ' + (ci + 1) + ' из ' + shown.length + ': <b>' + (o.stage === 'revision' ? 'Правки' : U.T.STAGE_LABEL[cur]) + '</b></p>';
  }

  /* Описание этапа и действия для роли */
  function stageCard(o) {
    const role = roleIn();
    const actor = U.T.actor(o);
    const total = U.T.orderTotal(o);
    const mine = actor && actor === role;
    const t = o.terms;
    const btn = (action, text, cls = 'btn-primary', extra = '') => '<button class="btn ' + cls + ' btn-block" type="button" data-action="' + action + '" data-order="' + o.id + '"' + extra + '>' + text + '</button>';
    const chatBtn = btn('open-chat', I('message') + (role === 'creator' ? 'Написать заказчику' : role === 'brand' ? 'Написать креатору' : 'Открыть переписку'), '');
    let title = '', text = '', actions = '';
    const revLeft = t.revisionsIncluded - o.revisionsUsed;
    const due = U.due(o);
    const pub = t.publication;

    switch (o.stage) {
      case 'agreement':
        title = 'Ожидает оплаты';
        text = role === 'creator' ? 'Заказчик ещё не оплатил заказ. Не начинайте работу до оплаты — мы сообщим, когда деньги будут зарезервированы.' : 'Креатор принял условия. Оплата резервируется и уходит креатору только после ' + (t.format === 'publish' ? 'подтверждения публикации.' : 'приёмки работы.');
        if (role === 'brand') actions = btn('pay', I('card') + 'Оплатить ' + U.moneyText(total)) + chatBtn;
        break;
      case 'shipping':
        title = 'Ожидает отправки товара';
        text = role === 'creator' ? 'Заказ оплачен. Заказчик готовит отправку на ваш пункт выдачи — трек появится здесь.' : 'Отправьте товар на пункт выдачи креатора (данные получателя — ниже) и добавьте трек-номер. Срок съёмки начнётся после получения.';
        if (role === 'brand') actions = btn('ship', I('truck') + 'Добавить отправление') + chatBtn;
        break;
      case 'in_transit':
        title = 'Товар в пути';
        text = role === 'creator' ? 'Когда заберёте посылку, подтвердите получение — после этого рассчитается дата сдачи (' + U.T.days(t.shootDays, 'calendar') + ').' : 'Ждём, когда креатор подтвердит получение. Тогда начнётся отсчёт ' + U.T.days(t.shootDays, 'calendar') + ' на съёмку.';
        if (role === 'creator') actions = btn('receive', I('package') + 'Подтвердить получение') + btn('support', I('alert') + 'Проблема с доставкой', '', ' data-topic="Проблема с доставкой"');
        break;
      case 'production':
        title = role === 'creator' ? 'Съёмка' : 'Креатор снимает';
        text = role === 'creator' ? 'Загрузите материалы по брифу. Заказчик проверит каждую версию за ' + U.T.days(t.reviewDays, 'business') + '.' : 'Товар у креатора. Материалы появятся во вкладке «Материалы».';
        if (role === 'creator') actions = btn('submit', I('upload') + 'Сдать работу') + btn('tab-brief', I('file') + 'Открыть бриф и условия', '');
        break;
      case 'review':
        title = 'Материалы на проверке';
        text = role === 'brand' ? 'Посмотрите версию ' + U.q.lastVersion(o).n + '. Примите работу или запросите правки по брифу — осталось ' + revLeft + ' из ' + t.revisionsIncluded + '.' : 'Заказчик проверяет версию ' + U.q.lastVersion(o).n + '.';
        if (role === 'brand') {
          actions = btn('accept', I('check') + (t.format === 'publish' ? 'Принять ролик' : 'Принять работу')) +
            (revLeft > 0 ? btn('changes', I('refresh') + 'Запросить правки', '') : '<button class="btn btn-block" type="button" disabled aria-describedby="rev-out">' + I('refresh') + 'Запросить правки</button><p class="hint" id="rev-out">Включённые правки закончились. Дополнительные изменения — по договорённости в переписке.</p>');
        }
        break;
      case 'revision':
        title = 'Креатор вносит правки';
        text = role === 'creator' ? 'Заказчик оставил замечания к версии ' + U.q.lastVersion(o).n + '. Исправьте их и загрузите новую версию.' : 'Замечания отправлены. На правки — ' + U.T.days(t.revisionDays, 'calendar') + '.';
        if (role === 'creator') actions = btn('submit', I('upload') + 'Сдать новую версию') + btn('tab-materials', I('list-check') + 'Посмотреть замечания', '');
        break;
      case 'publishing':
        title = o.publication && o.publication.url ? 'Публикация на проверке' : 'Публикация';
        if (o.publication && o.publication.url) {
          text = role === 'brand' ? 'Креатор опубликовал материал. Проверьте пост по критериям приёмки — после подтверждения выплата уйдёт креатору.' : 'Заказчик проверяет публикацию по критериям приёмки.';
          if (role === 'brand') actions = btn('pub-confirm', I('check') + 'Подтвердить размещение') + btn('pub-reject', I('refresh') + 'Попросить исправить', '');
        } else {
          text = role === 'creator' ? 'Опубликуйте ' + (pub.service === 'publish_ready' ? 'готовый материал' : 'принятый ролик') + ' в ' + E(pub.platform) + ' в период размещения и добавьте ссылку.' + (o.publication && o.publication.rejected ? ' Заказчик просил исправить: «' + E(o.publication.rejected) + '».' : '') : 'Ждём публикацию в ' + E(pub.platform) + '. Выплата — после вашего подтверждения размещения.';
          if (role === 'creator') actions = btn('pub-submit', I('external') + 'Добавить ссылку на публикацию');
        }
        break;
      case 'accepted': {
        const p = o.payment;
        title = t.format === 'publish' ? 'Размещение подтверждено' : 'Работа принята';
        text = p.payoutStatus === 'paid'
          ? 'Выплата креатору отмечена как проведённая ' + U.date(p.payoutAt) + '. Заказ завершён.'
          : 'Работа принята ' + U.date(o.acceptedAt) + '. Выплата креатору — в обработке, до ' + U.T.daysGen(U.config.payoutDays, 'business') + '. Это отдельный от приёмки шаг.';
        if (role === 'admin' && p.payoutStatus === 'processing') actions = btn('payout', I('wallet') + 'Провести выплату (симуляция)');
        if (role === 'brand') actions = btn('repeat', I('refresh') + 'Повторить заказ') + btn('download', I('download') + 'Скачать материалы', '');
        break;
      }
    }
    if (!actions && role !== 'admin' && o.stage !== 'accepted') actions = chatBtn;
    const who = !actor ? '' : mine ? '<span class="who-acts mine">Ваш ход</span>' : '<span class="who-acts other">' + I('clock', 'icon-sm') + (actor === 'brand' ? 'Ждём заказчика' : 'Ждём креатора') + '</span>';
    const dl = o.stage === 'accepted' ? '' :
      '<div class="deadline-row ' + U.dueTone(o) + '">' + I('calendar') + '<span>' + E(due.label) + (due.date ? ' · ' + U.deadlineText(due.date) : '') + '</span></div>';
    return '<section class="stage-card' + (mine ? ' is-mine' : '') + '" aria-labelledby="stage-h"><div class="stage-card-top">' + who +
      '<h2 id="stage-h" tabindex="-1">' + title + '</h2><p>' + text + '</p>' + (actions ? '<div class="stage-actions">' + actions + '</div>' : '') + '</div>' + dl + '</section>';
  }

  function moneyPanel(o) {
    const role = roleIn();
    const pi = U.paymentInfo(o);
    const t = o.terms;
    const done = o.stage === 'accepted';
    const rows = role === 'creator'
      ? '<dt>Ваш гонорар</dt><dd>' + U.money(o.fee) + '</dd><dt>Сбор и доставка</dt><dd class="muted" style="font-weight:400">платит заказчик</dd>'
      : '<dt>Гонорар креатора</dt><dd>' + U.money(o.fee) + '</dd><dt>Сервисный сбор ' + Math.round(o.commission / o.fee * 100) + '%</dt><dd>' + U.money(o.commission) + '</dd>' +
        (t.ship ? '<dt>Доставка, оценка</dt><dd>' + U.money(t.deliveryCost) + '</dd>' : '') + (t.returnProduct ? '<dt>Возврат товара, оценка</dt><dd>' + U.money(t.returnCost) + '</dd>' : '') +
        '<dt class="total">Итого</dt><dd class="total">' + U.money(U.T.orderTotal(o)) + '</dd>';
    return '<section class="panel" aria-labelledby="money-h"><div class="panel-head"><h2 id="money-h">Условия и оплата</h2></div><div class="panel-body" style="display:grid;gap:16px">' +
      '<dl class="kv">' + rows + '</dl><hr class="divider" style="margin:0">' +
      '<div class="pay-states">' +
      '<div class="pay-state"><span class="lbl">Работа</span>' + (done ? '<span class="status status-success">Принята</span>' : o.stage === 'publishing' ? '<span class="status status-info">Ролик принят, ждём публикацию</span>' : '<span class="status">Не принята</span>') + '</div>' +
      '<div class="pay-state"><span class="lbl">' + (role === 'creator' ? 'Выплата вам' : 'Деньги') + '</span><span class="status ' + pi.cls + '">' + pi.text + '</span><span class="hint">' + pi.hint + (o.payment.status !== 'unpaid' ? ' · симуляция' : '') + '</span></div>' +
      '</div></div></section>';
  }

  /* Доставка: данные получателя видит заказчик только после оплаты и только проверенного креатора */
  function deliveryPanel(o) {
    const t = o.terms;
    if (!t.ship) return '<section class="panel"><div class="panel-head">' + I('truck') + '<h2>Доставка</h2></div><div class="panel-body"><p class="small muted">Товар не отправляется. Работа начинается ' + U.T.startEventText(t) + '.</p></div></section>';
    const d = o.delivery;
    const role = roleIn();
    const c = U.q.creator(o.creatorId);
    let recipient = '';
    if (role !== 'creator' && ['shipping', 'in_transit'].includes(o.stage)) {
      recipient = o.payment.status !== 'unpaid' && U.q.canShipTo(c)
        ? '<div class="recipient"><span class="small muted">Получатель</span><b>' + E(c.address.recipient) + '</b><span>' + E(c.address.city) + ', ' + E(c.address.pvz) + '</span><span class="num">' + E(c.address.phone) + '</span><span class="hint">Телефон скрыт частично — полный номер передаётся службе доставки. Демо-адрес.</span></div>'
        : '<p class="small muted">Адрес пункта выдачи откроется после оплаты заказа.</p>';
    }
    let body;
    if (!d.track) body = recipient + '<p class="small muted">Трек-номер ещё не добавлен.</p>';
    else body = recipient + '<div class="ship-box"><span class="muted small">' + E(d.carrier) + '</span><span class="track">' + E(d.track) + '</span></div>' +
      '<ol class="timeline" style="margin-top:6px">' +
      '<li class="is-done"><span class="dot">' + I('check') + '</span><div><div class="t">Отправлено</div></div><span class="r num">' + U.date(d.sentAt) + '</span></li>' +
      '<li class="' + (d.receivedAt ? 'is-done' : 'is-now') + '"><span class="dot">' + (d.receivedAt ? I('check') : '') + '</span><div><div class="t">' + (d.receivedAt ? 'Получено креатором' : 'Ждём получения') + '</div>' + (d.receivedAt ? '<div class="d">Срок сдачи рассчитан: до ' + U.date(U.T.shootDue(o)) + '</div>' : '') + '</div><span class="r num">' + (d.receivedAt ? U.date(d.receivedAt) : '—') + '</span></li></ol>' +
      (t.returnProduct ? '<p class="hint">После съёмки товар нужно вернуть заказчику — обратная доставка за счёт заказчика (оценка ' + U.moneyText(t.returnCost) + ').</p>' : '');
    return '<section class="panel" aria-labelledby="ship-h"><div class="panel-head">' + I('truck') + '<h2 id="ship-h">Доставка товара</h2></div><div class="panel-body" style="display:grid;gap:10px">' + body + '</div></section>';
  }

  function publicationPanel(o) {
    const p = o.terms.publication;
    if (!p) return '';
    const st = o.publication || {};
    return '<section class="panel" aria-labelledby="pub-h"><div class="panel-head">' + I('external') + '<h2 id="pub-h">Публикация</h2></div><div class="panel-body" style="display:grid;gap:12px">' +
      '<dl class="kv kv-left"><dt>Площадка</dt><dd>' + E(p.platform) + '</dd><dt>Услуга</dt><dd>' + E(U.PUB_SERVICES[p.service]) + '</dd><dt>Период</dt><dd>' + U.date(p.windowFrom) + ' — ' + U.date(p.windowTo) + '</dd><dt>Хранение</dt><dd>' + E(U.KEEP_DAYS[p.keepDays]) + '</dd></dl>' +
      '<div><div class="small muted" style="margin-bottom:6px">Критерии приёмки</div><ul class="brief-list">' + p.criteria.map((x) => '<li>' + I('check') + '<span>' + E(x) + '</span></li>').join('') + '</ul></div>' +
      (st.url ? '<p class="small">Ссылка: <a class="link" href="' + E(st.url) + '" target="_blank" rel="noopener noreferrer">' + E(st.url) + '</a><br><span class="muted">Опубликовано ' + U.date(st.postedAt) + (st.confirmedAt ? ' · подтверждено ' + U.date(st.confirmedAt) : '') + '</span></p>' : '<p class="small muted">Ссылки на публикацию пока нет.</p>') +
      '</div></section>';
  }

  function supportPanel(o) {
    const role = roleIn();
    const tk = o.tickets || [];
    const lbl = { open: ['status-info', 'Открыто'], in_progress: ['status-warning', 'В работе'], resolved: ['status-success', 'Решено'] };
    return '<section class="panel" aria-labelledby="sup-h"><div class="panel-head">' + I('support') + '<h2 id="sup-h">Поддержка</h2></div><div class="panel-body" style="display:grid;gap:10px">' +
      (tk.length ? tk.map((t) => '<div class="row" style="justify-content:space-between;font-size:15px;gap:8px;flex-wrap:wrap"><span style="min-width:0">№' + t.id + ' · ' + E(t.topic) + '</span><span class="status ' + lbl[t.status][0] + '">' + lbl[t.status][1] + '</span></div>' +
        (role === 'admin' ? '<a class="btn btn-sm" href="#/admin/ticket/' + o.id + '/' + t.id + '">Открыть обращение №' + t.id + '</a>' : '')).join('') : '<p class="small muted">Спор, задержка или вопрос по оплате — поддержка видит весь заказ и переписку.</p>') +
      '<button class="btn btn-sm" type="button" data-action="support" data-order="' + o.id + '">' + I('support', 'icon-sm') + 'Обратиться в поддержку</button></div></section>';
  }

  /* -------- Материалы -------- */
  function materials(o) {
    const role = roleIn();
    if (!o.versions.length) {
      const txt = {
        agreement: 'Материалы появятся после оплаты' + (o.terms.ship ? ', получения товара' : '') + ' и съёмки.',
        shipping: 'Материалы появятся после того, как креатор получит товар и снимет видео.',
        in_transit: 'Креатор начнёт съёмку после получения товара.',
        production: role === 'creator' ? 'Загрузите первую версию — заказчик получит уведомление.' : 'Креатор снимает. ' + U.due(o).label + '.',
        publishing: 'Материал предоставляет заказчик — креатор публикует его у себя.',
      }[o.stage] || 'Материалов пока нет.';
      return '<div class="empty">' + I('film') + '<h3>Материалов пока нет</h3><p>' + txt + '</p>' +
        (role === 'creator' && o.stage === 'production' ? '<button class="btn btn-primary" type="button" data-action="submit" data-order="' + o.id + '">' + I('upload') + 'Сдать работу</button>' : '') + '</div>';
    }
    const vn = view.ver && o.versions.find((v) => v.n === view.ver) ? view.ver : o.versions[o.versions.length - 1].n;
    const v = o.versions.find((x) => x.n === vn);
    const fi = Math.min(view.file, v.files.length - 1);
    const f = v.files[fi];
    const m = U.media[f.media];
    const isVid = m && m.kind === 'video';
    const vStatus = { pending: '<span class="status status-accent">На проверке</span>', changes_requested: '<span class="status status-warning">Запрошены правки</span>', accepted: '<span class="status status-success">Принята</span>' };
    const player = isVid
      ? '<figure class="frame"><video controls playsinline preload="none" poster="' + U.mediaUrl(f.media, 540) + '" aria-label="' + E(f.name) + '" style="object-position:' + m.pos + '"><source src="' + m.src + '" type="video/mp4">Видео не поддерживается браузером.</video></figure>'
      : U.frame(f.media, { w: 320, play: false }) + (f.kind === 'video' ? '<p class="hint">' + I('info', 'icon-sm') + ' Для этого файла есть только постер — видеофайл в прототипе не загружен.</p>' : '');
    return '<div style="display:grid;gap:20px">' +
      '<div class="ver-bar"><div class="row-wrap" role="group" aria-label="Версии">' +
      o.versions.map((x) => '<button type="button" class="chip" data-ver="' + x.n + '" aria-pressed="' + (x.n === vn) + '">Версия ' + x.n + ' ' + (x.status === 'accepted' ? I('check', 'icon-sm') : '') + '</button>').join('') + '</div>' +
      '<span class="small muted num">Правки: ' + o.revisionsUsed + ' из ' + o.terms.revisionsIncluded + ' использовано</span></div>' +
      '<div class="panel"><div class="panel-head" style="flex-wrap:wrap"><h2>Версия ' + v.n + '</h2>' + vStatus[v.status] + '<span class="spacer"></span><span class="small muted">' + U.dateTime(v.at) + '</span></div>' +
      '<div class="panel-body ver-wrap"><div class="ver-current"><div class="ver-player">' + player + '<p class="small muted ver-caption">' + E(f.name) + (isVid ? ' · <span class="num">' + m.dur + '</span>' : '') + '</p></div>' +
      '<div class="ver-info">' +
      (v.note ? '<div><div class="small muted" style="margin-bottom:4px">Комментарий креатора</div><p class="wrap-any">' + E(v.note) + '</p></div>' : '') +
      '<div class="ver-files" role="list" aria-label="Файлы версии">' + v.files.map((x, i) => {
        const mm = U.media[x.media];
        return '<button type="button" role="listitem" class="file-row" data-file="' + i + '" aria-current="' + (i === fi) + '" title="' + E(x.name) + '">' + U.frame(x.media, { w: 72, play: false, alt: '' }) +
          '<span class="grow"><span class="name">' + E(x.name) + '</span><span class="small muted">' + (x.kind === 'video' ? 'Видео' + (mm && mm.kind === 'video' ? ' · ' + mm.dur : '') : 'Фото') + ' · ' + E(x.size) + (x.demo ? ' · превью из демо-набора' : '') + '</span></span>' +
          (mm && mm.kind === 'video' ? I('play', 'icon-sm') : I('eye', 'icon-sm')) + '</button>';
      }).join('') + '</div>' +
      (v.feedback.length ? '<div><div class="small muted" style="margin-bottom:8px">Замечания заказчика</div><div class="feedback-list">' + v.feedback.map((x) => '<div class="comment">' + (x.time ? '<span class="timecode">' + E(x.time) + '</span>' : '<span class="timecode">общее</span>') + '<span>' + E(x.text) + '</span></div>').join('') + '</div></div>' : '') +
      '</div></div></div></div></div>';
  }

  function briefTab(o) {
    const cmp = U.q.campaign(o.campaignId);
    const b = o.brief;
    const li = (arr, icon) => '<ul class="brief-list">' + arr.map((x) => '<li>' + I(icon) + '<span>' + E(x) + '</span></li>').join('') + '</ul>';
    return '<div class="panel"><div class="panel-head" style="flex-wrap:wrap"><h2>Бриф и условия заказа</h2><span class="status status-success">Согласовано ' + U.date(b.agreedAt) + '</span></div><div class="panel-body">' +
      '<div class="brief-block"><div class="row">' + '<span class="frame frame-1x1 frame-sm" style="width:64px;flex:none">' + U.img(cmp.product.media, 128, 128, '', '') + '</span><div style="min-width:0"><b class="wrap-any">' + E(cmp.product.name) + '</b><div class="small muted">' + E(cmp.product.category) + ' · розничная цена ' + U.money(cmp.product.price) + '</div></div></div></div>' +
      '<div class="brief-block"><h3>Что сдать</h3>' + li(o.terms.deliverables, 'check') + '</div>' +
      '<div class="brief-block"><h3>Ключевые тезисы</h3>' + li(b.keyPoints, 'message') + '</div>' +
      '<div class="brief-block"><h3>Обязательно показать</h3>' + li(b.mustShow, 'eye') + '</div>' +
      (b.avoid.length ? '<div class="brief-block"><h3>Чего избегать</h3>' + li(b.avoid, 'x') + '</div>' : '') +
      '<div class="brief-block"><h3>Тон</h3><p>' + E(b.tone) + '</p></div>' +
      '<div class="brief-block"><h3>Условия</h3><dl class="kv kv-left">' + U.T.rows(o.terms).map(([k, v]) => '<dt>' + E(k) + '</dt><dd>' + E(v) + '</dd>').join('') + '</dl>' +
      '<p class="hint" style="margin-top:8px">Условия зафиксированы при принятии предложения и не меняются при правке кампании.</p></div>' +
      '</div></div>';
  }

  function historyTab(o) {
    const who = { brand: 'Заказчик', creator: 'Креатор', system: 'Платформа', support: 'Поддержка' };
    return '<div class="panel"><div class="panel-head"><h2>История изменений</h2></div><div class="panel-body"><ol class="history">' +
      o.history.slice().reverse().map((h) => '<li><time datetime="' + h.at + '">' + U.dateTime(h.at) + '</time><div class="wrap-any">' + E(h.text) + '<div class="actor">' + (who[h.actor] || '') + '</div></div></li>').join('') + '</ol></div></div>';
  }

  function chatHTML(o) {
    const role = roleIn();
    const me = role === 'admin' ? 'support' : role;
    const c = U.q.creator(o.creatorId);
    const name = { brand: 'Северный уход', creator: c.name, support: 'Поддержка' };
    return '<div class="chat"><div class="chat-log" id="chat-log" role="log" aria-live="polite" aria-label="Переписка по заказу" tabindex="0">' +
      o.messages.map((m) => {
        if (m.from === 'system') return '<div class="msg is-system"><div class="msg-body">' + E(m.text) + '</div><div class="msg-meta">' + U.dateTime(m.at) + '</div></div>';
        const isMe = m.from === me;
        return '<div class="msg ' + (isMe ? 'is-me' : 'is-other') + (m.from === 'support' ? ' is-support' : '') + '"><div class="msg-meta">' + (isMe ? 'Вы' : E(name[m.from])) + ' · ' + U.dateTime(m.at) + '</div><div class="msg-body">' + E(m.text) + '</div></div>';
      }).join('') + '</div>' +
      '<form class="chat-form" data-chat="' + o.id + '" novalidate><label class="sr-only" for="chat-in">Сообщение</label><textarea class="textarea" id="chat-in" name="text" placeholder="Сообщение… (Enter — отправить)" rows="1" maxlength="2000" aria-describedby="chat-err"></textarea>' +
      '<button class="btn btn-primary btn-icon" type="submit" aria-label="Отправить">' + I('send') + '</button><span class="sr-only" id="chat-err" aria-live="polite"></span></form></div>';
  }

  U.pages.order = {
    shell: 'app',
    title: (p) => 'Заказ ' + p.id,
    render(p) {
      const o = U.q.order(p.id);
      if (!o) return U.pages.notfound.render({}, {}, 'Заказ ' + E(p.id) + ' не найден. Возможно, демо-данные были сброшены.');
      if (view.orderId !== o.id) Object.assign(view, { orderId: o.id, tab: 'materials', ver: null, file: 0 });
      const cmp = U.q.campaign(o.campaignId), c = U.q.creator(o.creatorId), b = U.q.brand(o.brandId);
      const role = roleIn();
      const lastMsg = o.messages[o.messages.length - 1];
      const tabs = [['materials', 'Материалы', o.versions.length], ['brief', 'Бриф и условия', 0], ['history', 'История', o.history.length]];
      const proto = role === 'creator' && o.creatorId !== U.store.s.creatorSelf
        ? '<div class="notice notice-plain" style="margin-bottom:16px">' + I('info') + '<span>Прототип: вы смотрите как креатор этого заказа — ' + E(c.name) + '.</span></div>' : '';
      return '<div class="page">' +
        '<nav class="crumbs" aria-label="Навигация"><a href="#/orders">Заказы</a>' + I('chevron-right') + (role !== 'creator' ? '<span class="crumb-mid row" style="gap:6px"><a href="#/campaigns/' + cmp.id + '">' + E(cmp.title) + '</a>' + I('chevron-right') + '</span>' : '') + '<span aria-current="page" class="num">' + o.id + '</span></nav>' + proto +
        '<header class="order-head"><div class="order-title"><span class="thumb">' + U.img(cmp.product.media, 112, 112, '', '') + '</span>' +
        '<div class="order-title-text"><h1>' + E(cmp.title) + '</h1><p class="sub">Заказ <span class="num">' + o.id + '</span> · ' + E(cmp.product.name) + (o.terms.format === 'publish' ? ' · с публикацией' : '') + '</p></div>' +
        '<div class="row order-title-actions"><button class="btn btn-sm" type="button" data-action="open-chat" data-order="' + o.id + '">' + I('message', 'icon-sm') + 'Сообщения <span class="num muted">' + o.messages.length + '</span></button></div></div>' +
        '<div class="order-people"><div class="person">' + U.brandAvatar(b, 36) + '<div><small>Заказчик</small><b>' + E(b.name) + '</b></div></div>' + I('arrow-right', 'icon-sm') +
        '<a class="person" style="text-decoration:none" href="#/creators/' + c.id + '">' + U.avatar(c, 36) + '<div><small>Креатор</small><b>' + E(c.name) + '</b></div></a>' +
        '<div class="person order-pills"><span class="small muted">Работа</span>' + U.stagePill(o) + '<span class="small muted">Деньги</span>' + U.payPill(o) + '</div></div>' +
        '<div class="order-steps">' + stepsHTML(o) + '</div></header>' +
        '<div class="order-grid">' +
        '<aside class="order-stage" aria-label="Текущий этап">' + stageCard(o) + '</aside>' +
        '<div class="order-main">' +
        '<div class="tabs" role="tablist" aria-label="Разделы заказа">' + tabs.map(([id, t, n]) => '<button class="tab" role="tab" id="tab-' + id + '" aria-controls="tp" aria-selected="' + (view.tab === id) + '" tabindex="' + (view.tab === id ? 0 : -1) + '" data-tab="' + id + '">' + t + (n ? ' <span class="count">' + n + '</span>' : '') + '</button>').join('') + '</div>' +
        '<div id="tp" role="tabpanel" aria-labelledby="tab-' + view.tab + '" style="padding-top:20px">' +
        (view.tab === 'materials' ? materials(o) : view.tab === 'brief' ? briefTab(o) : historyTab(o)) + '</div>' +
        '<section class="panel" style="margin-top:24px" aria-labelledby="last-msg-h"><div class="panel-head" style="flex-wrap:wrap">' + I('message') + '<h2 id="last-msg-h">Последнее сообщение</h2><span class="spacer"></span><button class="btn btn-ghost btn-sm" type="button" data-action="open-chat" data-order="' + o.id + '">Вся переписка</button></div>' +
        '<div class="panel-body">' + (lastMsg ? '<p class="small muted">' + U.dateTime(lastMsg.at) + '</p><p class="wrap-any">' + E(lastMsg.text) + '</p>' : '<p class="muted">Сообщений пока нет.</p>') + '</div></section>' +
        '</div><aside class="order-side" aria-label="Условия, доставка и поддержка">' + moneyPanel(o) + publicationPanel(o) + deliveryPanel(o) + supportPanel(o) + '</aside></div></div>';
    },
    mount(root, p) {
      const o = U.q.order(p.id);
      if (!o) return;
      root.querySelectorAll('[data-tab]').forEach((t, i, all) => {
        t.addEventListener('click', () => { view.tab = t.dataset.tab; U.rerender(); document.getElementById('tab-' + view.tab).focus(); });
        t.addEventListener('keydown', (e) => {
          let n = null;
          if (e.key === 'ArrowRight') n = (i + 1) % all.length;
          if (e.key === 'ArrowLeft') n = (i - 1 + all.length) % all.length;
          if (n !== null) { e.preventDefault(); view.tab = all[n].dataset.tab; U.rerender(); document.getElementById('tab-' + view.tab).focus(); }
        });
      });
      root.querySelectorAll('[data-ver]').forEach((b) => b.addEventListener('click', () => { view.ver = Number(b.dataset.ver); view.file = 0; U.rerender(); document.querySelector('[data-ver="' + view.ver + '"]').focus(); }));
      root.querySelectorAll('[data-file]').forEach((b) => b.addEventListener('click', () => { view.file = Number(b.dataset.file); U.rerender(); document.querySelector('[data-file="' + view.file + '"]').focus(); }));
      if (U.focusAfter) { const el = document.querySelector(U.focusAfter); U.focusAfter = null; if (el) { el.focus({ preventScroll: true }); el.scrollIntoView({ block: 'nearest' }); } }
    },
  };

  /* ================= Действия ================= */
  const done = (title, text, tab) => {
    if (tab) view.tab = tab;
    view.ver = null; view.file = 0;
    U.focusAfter = '#stage-h';
    U.rerender();
    U.toast(title, text);
  };
  const safe = (fn) => { try { fn(); return true; } catch (e) { U.toast('Действие не выполнено', e.message, 'error'); U.rerender(); return false; } };

  U.actions['tab-brief'] = () => { view.tab = 'brief'; U.rerender(); document.getElementById('tab-brief').focus(); };
  U.actions['tab-materials'] = () => { view.tab = 'materials'; U.rerender(); document.getElementById('tab-materials').focus(); };

  U.actions.pay = (el) => {
    const o = U.q.order(el.dataset.order);
    const t = o.terms;
    const total = U.T.orderTotal(o);
    const d = U.modal.open({
      title: 'Оплата заказа',
      body: '<div class="notice notice-warning">' + I('alert') + '<div><b>Симуляция оплаты.</b> Реальные деньги не списываются — платёжная система не подключена.</div></div>' +
        '<dl class="kv"><dt>Гонорар креатора</dt><dd>' + U.money(o.fee) + '</dd><dt>Сервисный сбор</dt><dd>' + U.money(o.commission) + '</dd>' + (t.ship ? '<dt>Доставка, оценка</dt><dd>' + U.money(t.deliveryCost) + '</dd>' : '') + (t.returnProduct ? '<dt>Возврат товара, оценка</dt><dd>' + U.money(t.returnCost) + '</dd>' : '') + '<dt class="total">К оплате</dt><dd class="total">' + U.money(total) + '</dd></dl>' +
        '<form id="pay-form" novalidate style="display:grid;gap:12px"><fieldset style="border:0;padding:0;margin:0;display:grid;gap:4px"><legend class="field-label" style="margin-bottom:6px">Способ оплаты</legend>' +
        '<label class="check"><input type="radio" name="method" value="card" checked>Банковская карта</label>' +
        '<label class="check"><input type="radio" name="method" value="invoice">Счёт для юрлица или ИП</label></fieldset>' +
        '<label class="check"><input type="checkbox" name="terms" aria-describedby="f-terms-e">Понимаю, что сумма резервируется и уходит креатору только после ' + (t.format === 'publish' ? 'подтверждения публикации' : 'приёмки работы') + '</label><span class="error-text" id="f-terms-e" data-error-for="terms"></span></form>',
      foot: '<button class="btn" type="button" data-close>Отмена</button><button class="btn btn-primary" type="button" data-ok>Оплатить ' + U.moneyText(total) + '</button>',
    });
    d.querySelector('[data-ok]').addEventListener('click', async (e) => {
      const f = d.querySelector('#pay-form');
      if (!U.validate(f, { terms: (v) => (v ? '' : 'Подтвердите условия резервирования') })) return;
      await U.busy(e.currentTarget, 1000);
      const method = f.method.value;
      d.close();
      if (safe(() => U.flow.pay(o.id, method))) done('Оплата прошла (симуляция)', U.moneyText(total) + ' зарезервировано');
    });
  };

  U.actions.ship = (el) => {
    const o = U.q.order(el.dataset.order);
    const c = U.q.creator(o.creatorId);
    if (!U.q.canShipTo(c)) { U.toast('Отправка недоступна', 'Креатор ещё не прошёл проверку документов', 'error'); return; }
    const d = U.modal.open({
      title: 'Отправка товара',
      body: '<ol class="ship-steps"><li><b>Упакуйте товар</b><span>Положите в посылку то, что указано в брифе: ' + E(U.q.campaign(o.campaignId).product.name) + '.</span></li>' +
        '<li><b>Отправьте на пункт выдачи</b><span class="recipient-inline">' + E(c.address.recipient) + ' · ' + E(c.address.city) + ', ' + E(c.address.pvz) + ' · <span class="num">' + E(c.address.phone) + '</span></span></li>' +
        '<li><b>Добавьте трек-номер</b><span>Креатор увидит его в заказе. Срок съёмки начнётся после подтверждения получения.</span></li></ol>' +
        '<form id="ship-form" novalidate style="display:grid;gap:16px">' +
        U.fieldHTML({ name: 'carrier', label: 'Служба доставки', required: true, options: [['', 'Выберите службу'], 'Курьерская служба', 'Почта', 'Сеть пунктов выдачи'] }) +
        U.fieldHTML({ name: 'track', label: 'Трек-номер', required: true, placeholder: 'Например, RU48302117', hint: 'Латинские буквы и цифры, от 8 до 20 символов', attrs: 'autocomplete="off" spellcheck="false" maxlength="20"' }) +
        '<p class="hint">Демо-адрес. В прототипе отправка не создаётся у перевозчика.</p></form>',
      foot: '<button class="btn" type="button" data-close>Отмена</button><button class="btn btn-primary" type="button" data-ok>Сохранить отправление</button>',
    });
    d.querySelector('[data-ok]').addEventListener('click', async (e) => {
      const f = d.querySelector('#ship-form');
      const ok = U.validate(f, {
        carrier: (v) => (v ? '' : 'Выберите службу доставки'),
        track: (v) => (!v ? 'Укажите трек-номер' : /^[A-Za-z0-9]{8,20}$/.test(v) ? '' : 'Только латинские буквы и цифры, 8–20 символов, без пробелов'),
      });
      if (!ok) return;
      await U.busy(e.currentTarget);
      const carrier = f.carrier.value, track = f.track.value.trim().toUpperCase();
      d.close();
      if (safe(() => U.flow.ship(o.id, { carrier, track }))) done('Отправление добавлено', 'Креатор получил трек-номер ' + track);
    });
  };

  U.actions.receive = (el) => {
    const o = U.q.order(el.dataset.order);
    const preview = U.T.addDays(new Date().toISOString(), o.terms.shootDays);
    const d = U.modal.open({
      title: 'Подтвердить получение',
      body: '<form id="rcv-form" novalidate style="display:grid;gap:14px"><p>Трек <b class="num">' + E(o.delivery.track) + '</b>, ' + E(o.delivery.carrier) + '.</p>' +
        '<div class="notice notice-plain">' + I('calendar') + '<span>После подтверждения срок сдачи станет: <b>до ' + U.date(preview) + '</b> (' + U.T.days(o.terms.shootDays, 'calendar') + ').</span></div>' +
        '<label class="check"><input type="checkbox" name="ok" aria-describedby="f-ok-e">Товар пришёл целым и соответствует брифу</label><span class="error-text" id="f-ok-e" data-error-for="ok"></span>' +
        U.fieldHTML({ name: 'note', label: 'Комментарий', textarea: true, placeholder: 'Необязательно: например, «упаковка помята, флакон цел»' }) +
        '<p class="hint">Если товар повреждён или не пришёл — закройте окно и выберите «Проблема с доставкой».</p></form>',
      foot: '<button class="btn" type="button" data-close>Отмена</button><button class="btn btn-primary" type="button" data-ok>Подтвердить получение</button>',
    });
    d.querySelector('[data-ok]').addEventListener('click', async (e) => {
      const f = d.querySelector('#rcv-form');
      if (!U.validate(f, { ok: (v) => (v ? '' : 'Отметьте, что товар получен целым — или сообщите о проблеме') })) return;
      await U.busy(e.currentTarget);
      const note = f.note.value.trim();
      d.close();
      if (safe(() => U.flow.receive(o.id, note))) done('Получение подтверждено', 'Срок сдачи: до ' + U.date(U.T.shootDue(U.q.order(o.id))));
    });
  };

  /* Сдача работы: файлы (имитация загрузки) + комментарий */
  const TRANSLIT = { 'соколова': 'sokolova', 'миронова': 'mironova', 'ким': 'kim', 'галиева': 'galieva', 'белова': 'belova', 'ершов': 'ershov', 'захарова': 'zakharova', 'шилов': 'shilov', 'николаева': 'nikolaeva', 'воронцов': 'vorontsov', 'чернова': 'chernova' };
  U.actions.submit = (el) => {
    const o = U.q.order(el.dataset.order);
    const c = U.q.creator(o.creatorId);
    const files = [];
    const pool = c.portfolio.map((w) => w.media);
    const used = new Set(o.versions.flatMap((v) => v.files.map((f) => f.media)));
    const fmtSize = (b) => (b > 1048576 ? (b / 1048576).toFixed(1).replace('.', ',') + ' МБ' : Math.max(1, Math.round(b / 1024)) + ' КБ');
    const last = U.q.lastVersion(o);
    const d = U.modal.open({
      title: 'Сдать ' + (o.versions.length ? 'версию ' + (o.versions.length + 1) : 'работу'), cls: 'modal-wide',
      body: (o.stage === 'revision' ? '<div class="notice notice-warning">' + I('list-check') + '<div><b>Замечания к версии ' + last.n + ':</b><ul style="margin:6px 0 0;padding-left:18px">' + last.feedback.map((x) => '<li>' + (x.time ? x.time + ' — ' : '') + E(x.text) + '</li>').join('') + '</ul></div></div>' : '') +
        '<form id="sub-form" novalidate style="display:grid;gap:16px">' +
        '<div class="field"><span class="field-label" id="files-l">Файлы <span class="req" aria-hidden="true">*</span></span>' +
        '<label class="drop" id="drop" tabindex="0" aria-labelledby="files-l files-h">' + I('upload') + '<b>Перетащите файлы или нажмите, чтобы выбрать</b><span class="hint" id="files-h">Видео MP4/MOV и фото JPG/PNG. В прототипе файлы не отправляются на сервер — для превью используется ролик из демо-набора.</span>' +
        '<input type="file" id="file-in" multiple accept="video/*,image/*" class="sr-only" tabindex="-1"></label>' +
        '<button type="button" class="btn btn-sm" id="demo-files" style="justify-self:start">' + I('film', 'icon-sm') + 'Добавить демо-файлы</button>' +
        '<div class="upload-list" id="up-list" aria-live="polite"></div><span class="error-text" data-error-for="files" id="files-e"></span></div>' +
        U.fieldHTML({ name: 'note', label: 'Комментарий к версии', textarea: true, placeholder: 'Что внутри, на что обратить внимание', value: o.stage === 'revision' ? 'Исправила замечания: ' : '' }) +
        '<fieldset style="border:0;padding:0;margin:0;display:grid;gap:2px"><legend class="field-label" style="margin-bottom:6px">Проверьте по брифу</legend>' +
        o.brief.mustShow.map((x, i) => '<label class="check"><input type="checkbox" name="chk' + i + '">' + E(x) + '</label>').join('') +
        '<span class="error-text" data-error-for="chk0"></span></fieldset></form>',
      foot: '<button class="btn" type="button" data-close>Отмена</button><button class="btn btn-primary" type="button" data-ok>Отправить на проверку</button>',
    });
    const list = d.querySelector('#up-list');
    const draw = () => {
      list.innerHTML = files.map((f, i) => '<div class="upload-item">' + (f.kind === 'video' ? I('video') : I('image')) +
        '<div style="min-width:0"><div class="row" style="justify-content:space-between;gap:8px"><span class="wrap-any">' + E(f.name) + '</span><span class="small muted nowrap">' + E(f.size) + '</span></div>' +
        '<div class="progress" style="margin-top:6px" role="progressbar" aria-label="Загрузка ' + E(f.name) + '" aria-valuenow="' + f.p + '" aria-valuemin="0" aria-valuemax="100"><span style="width:' + f.p + '%"></span></div>' +
        '<span class="small ' + (f.p < 100 ? 'muted' : '') + '" style="' + (f.p >= 100 ? 'color:var(--c-success)' : '') + '">' + (f.p < 100 ? 'Загрузка… ' + f.p + '%' : 'Загружено' + (f.demo ? ' · превью: «' + E((U.work(c, f.media) || {}).title || '') + '»' : '')) + '</span></div>' +
        '<button type="button" class="btn btn-ghost btn-icon btn-sm" data-rm="' + i + '" aria-label="Удалить ' + E(f.name) + '">' + I('trash') + '</button></div>').join('');
    };
    const add = (f) => {
      files.push(f); draw();
      d.querySelector('#files-e').innerHTML = '';
      const tick = () => {
        f.p = Math.min(100, f.p + 20 + Math.round(Math.random() * 20));
        draw();
        if (f.p < 100) setTimeout(tick, U.reduceMotion() ? 50 : 220);
      };
      setTimeout(tick, 150);
    };
    const pick = (isVid) => {
      const kindList = pool.filter((m) => (U.media[m].kind === 'video') === isVid);
      return kindList.find((m) => !used.has(m) && !files.some((f) => f.media === m)) || kindList[0];
    };
    list.addEventListener('click', (e) => { const b = e.target.closest('[data-rm]'); if (b) { files.splice(Number(b.dataset.rm), 1); draw(); d.querySelector('#drop').focus(); } });
    const fin = d.querySelector('#file-in');
    const take = (fl) => {
      [...fl].forEach((file) => {
        const isVid = file.type.startsWith('video');
        if (!isVid && !file.type.startsWith('image')) { U.toast('Файл не добавлен', file.name + ': поддерживаются только видео и фото', 'error'); return; }
        const media = pick(isVid) || pick(!isVid);
        add({ name: file.name, size: fmtSize(file.size), kind: isVid ? 'video' : 'image', media, demo: true, p: 0 });
      });
    };
    fin.addEventListener('change', () => { take(fin.files); fin.value = ''; });
    const drop = d.querySelector('#drop');
    drop.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); fin.click(); } });
    drop.addEventListener('dragover', (e) => { e.preventDefault(); drop.classList.add('is-over'); });
    drop.addEventListener('dragleave', () => drop.classList.remove('is-over'));
    drop.addEventListener('drop', (e) => { e.preventDefault(); drop.classList.remove('is-over'); take(e.dataTransfer.files); });
    d.querySelector('#demo-files').addEventListener('click', () => {
      const tr = TRANSLIT[c.name.split(' ')[1].toLowerCase()] || 'creator';
      const n = o.versions.length + 1;
      const vid = pick(true);
      // Тип файла и превью совпадают: видео — ролик из портфолио, обложка — фото или стоп-кадр
      if (vid) add({ name: tr + '_' + o.id.replace('o-', '') + '_v' + n + '.mp4', size: (38 + n * 3.4).toFixed(1).replace('.', ',') + ' МБ', kind: 'video', media: vid, p: 0 });
      const img = pick(false);
      if (img) add({ name: 'cover_' + o.id.replace('o-', '') + '_v' + n + '.jpg', size: '2,0 МБ', kind: 'image', media: img, p: 0 });
    });
    d.querySelector('[data-ok]').addEventListener('click', async (e) => {
      const f = d.querySelector('#sub-form');
      const err = d.querySelector('#files-e');
      let ok = true;
      if (!files.length) { err.innerHTML = I('alert', 'icon-sm') + '<span>Добавьте хотя бы один файл</span>'; ok = false; drop.focus(); }
      else if (files.some((x) => x.p < 100)) { err.innerHTML = I('alert', 'icon-sm') + '<span>Дождитесь окончания загрузки</span>'; ok = false; }
      else err.innerHTML = '';
      if (!ok) return;
      const chkRules = {};
      o.brief.mustShow.forEach((x, i) => { chkRules['chk' + i] = (v) => (v ? '' : 'Отметьте все пункты — материалы должны соответствовать брифу'); });
      if (!U.validate(f, chkRules)) return;
      await U.busy(e.currentTarget, 900);
      const note = f.note.value.trim();
      const out = files.map(({ name, size, kind, media, demo }) => ({ name, size, kind, media, demo: !!demo }));
      d.close();
      if (safe(() => U.flow.submit(o.id, { files: out, note }))) done('Работа отправлена на проверку', 'Версия ' + U.q.order(o.id).versions.length + ' · проверка до ' + U.date(U.T.reviewDue(U.q.order(o.id))), 'materials');
    });
  };

  U.actions.changes = (el) => {
    const o = U.q.order(el.dataset.order);
    const v = U.q.lastVersion(o);
    const rows = [{ time: '', text: '' }];
    const d = U.modal.open({
      title: 'Запросить правки к версии ' + v.n, cls: 'modal-wide',
      body: '<p class="notice notice-plain">' + I('info') + '<span>Будет использована правка <b>' + (o.revisionsUsed + 1) + ' из ' + o.terms.revisionsIncluded + '</b>. На правки — ' + U.T.days(o.terms.revisionDays, 'calendar') + '. Замечания должны опираться на согласованный бриф.</span></p>' +
        '<form id="ch-form" novalidate style="display:grid;gap:12px"><div id="fb-rows" style="display:grid;gap:12px"></div>' +
        '<button type="button" class="btn btn-sm" id="fb-add" style="justify-self:start">' + I('plus', 'icon-sm') + 'Добавить замечание</button></form>',
      foot: '<button class="btn" type="button" data-close>Отмена</button><button class="btn btn-primary" type="button" data-ok>Отправить правки</button>',
    });
    const box = d.querySelector('#fb-rows');
    const draw = (focusLast) => {
      box.innerHTML = rows.map((r, i) => '<div class="fb-item"><div class="field fb-time"><label for="fb-t' + i + '">Таймкод</label><input class="input num" id="fb-t' + i + '" name="t' + i + '" placeholder="0:15" value="' + E(r.time) + '" inputmode="numeric" aria-describedby="fb-t' + i + '-e"><span class="error-text" id="fb-t' + i + '-e" data-error-for="t' + i + '"></span></div>' +
        '<div class="field"><label for="fb-x' + i + '">Замечание ' + (i + 1) + ' <span class="req" aria-hidden="true">*</span></label><textarea class="textarea" style="min-height:72px" id="fb-x' + i + '" name="x' + i + '" placeholder="Что именно исправить и почему" aria-describedby="fb-x' + i + '-e">' + E(r.text) + '</textarea><span class="error-text" id="fb-x' + i + '-e" data-error-for="x' + i + '"></span></div>' +
        (rows.length > 1 ? '<button type="button" class="btn btn-ghost btn-icon btn-sm fb-del" data-del="' + i + '" aria-label="Удалить замечание ' + (i + 1) + '">' + I('trash') + '</button>' : '<span></span>') + '</div>').join('');
      d.querySelector('#fb-add').disabled = rows.length >= 6;
      if (focusLast) box.querySelector('#fb-x' + (rows.length - 1)).focus();
    };
    const sync = () => rows.forEach((r, i) => { r.time = box.querySelector('#fb-t' + i).value; r.text = box.querySelector('#fb-x' + i).value; });
    box.addEventListener('click', (e) => { const b = e.target.closest('[data-del]'); if (b) { sync(); rows.splice(Number(b.dataset.del), 1); draw(); box.querySelector('textarea').focus(); } });
    d.querySelector('#fb-add').addEventListener('click', () => { sync(); rows.push({ time: '', text: '' }); draw(true); });
    draw();
    d.querySelector('[data-ok]').addEventListener('click', async (e) => {
      sync();
      const f = d.querySelector('#ch-form');
      const rules = {};
      rows.forEach((r, i) => {
        rules['t' + i] = (val) => (!val || /^\d{1,2}:[0-5]\d$/.test(val) ? '' : 'Формат м:сс, например 0:15');
        rules['x' + i] = (val) => (val.length < 10 ? 'Опишите замечание подробнее — минимум 10 символов' : '');
      });
      if (!U.validate(f, rules)) return;
      await U.busy(e.currentTarget);
      const fb = rows.map((r) => ({ time: r.time.trim(), text: r.text.trim() }));
      d.close();
      if (safe(() => U.flow.requestChanges(o.id, fb))) done('Правки отправлены креатору', 'Правка ' + U.q.order(o.id).revisionsUsed + ' из ' + o.terms.revisionsIncluded + ' · срок до ' + U.date(U.T.revisionDue(U.q.order(o.id))), 'materials');
    });
  };

  U.actions.accept = async (el) => {
    const o = U.q.order(el.dataset.order);
    const c = U.q.creator(o.creatorId);
    const pub = o.terms.format === 'publish';
    const ok = await U.confirm({
      title: pub ? 'Принять ролик?' : 'Принять работу?',
      text: 'Версия ' + U.q.lastVersion(o).n + ' будет принята, правки закроются. ' + (pub
        ? 'Дальше ' + E(c.name) + ' публикует ролик в период размещения, выплата — после подтверждения публикации.'
        : E(c.name) + ' получит ' + U.moneyText(o.fee) + ' — выплата уходит отдельным шагом в течение ' + U.T.daysGen(U.config.payoutDays, 'business') + ' (симуляция).'),
      ok: pub ? 'Принять ролик' : 'Принять работу',
    });
    if (!ok) return;
    if (safe(() => U.flow.accept(o.id))) done(pub ? 'Ролик принят' : 'Работа принята', pub ? 'Следующий шаг — публикация у креатора' : 'Выплата креатору поставлена в очередь — статус «В обработке»');
  };

  /* Публикация */
  U.actions['pub-submit'] = (el) => {
    const o = U.q.order(el.dataset.order);
    const p = o.terms.publication;
    const today = new Date().toISOString().slice(0, 10);
    const d = U.modal.open({
      title: 'Ссылка на публикацию',
      body: '<form id="pub-form" novalidate style="display:grid;gap:16px"><p class="small muted">' + E(p.platform) + ' · период размещения ' + U.date(p.windowFrom) + ' — ' + U.date(p.windowTo) + ' · хранение ' + E(U.KEEP_DAYS[p.keepDays]).toLowerCase() + '.</p>' +
        U.fieldHTML({ name: 'url', label: 'Ссылка на пост', type: 'url', required: true, placeholder: 'https://t.me/канал/123', attrs: 'autocomplete="off"' }) +
        U.fieldHTML({ name: 'date', label: 'Дата публикации', type: 'date', required: true, value: today }) +
        '<div><div class="field-label" style="margin-bottom:6px">Критерии приёмки</div><ul class="brief-list">' + p.criteria.map((x) => '<li>' + I('check') + '<span>' + E(x) + '</span></li>').join('') + '</ul></div>' +
        '<p class="hint">В прототипе ссылка не проверяется автоматически — её проверяет заказчик.</p></form>',
      foot: '<button class="btn" type="button" data-close>Отмена</button><button class="btn btn-primary" type="button" data-ok>Отправить ссылку</button>',
    });
    d.querySelector('[data-ok]').addEventListener('click', async (e) => {
      const f = d.querySelector('#pub-form');
      const from = p.windowFrom.slice(0, 10), to = p.windowTo.slice(0, 10);
      const ok = U.validate(f, {
        url: (v) => (!v ? 'Добавьте ссылку на пост' : /^https?:\/\/\S+\.\S+/.test(v) ? '' : 'Ссылка должна начинаться с http:// или https://'),
        date: (v) => (!v ? 'Укажите дату' : v < from || v > to ? 'Дата вне периода размещения (' + U.date(p.windowFrom) + ' — ' + U.date(p.windowTo) + ')' : ''),
      });
      if (!ok) return;
      await U.busy(e.currentTarget);
      const url = f.url.value.trim(), date = new Date(f.date.value + 'T12:00:00').toISOString();
      d.close();
      if (safe(() => U.flow.submitPublication(o.id, { url, postedAt: date }))) done('Ссылка отправлена', 'Заказчик проверит размещение по критериям');
    });
  };
  U.actions['pub-confirm'] = (el) => {
    const o = U.q.order(el.dataset.order);
    const p = o.terms.publication;
    const d = U.modal.open({
      title: 'Подтвердить размещение',
      body: '<form id="pc-form" novalidate style="display:grid;gap:10px"><p class="small">Пост: <a class="link wrap-any" href="' + E(o.publication.url) + '" target="_blank" rel="noopener noreferrer">' + E(o.publication.url) + '</a></p>' +
        '<fieldset style="border:0;padding:0;margin:0;display:grid;gap:2px"><legend class="field-label" style="margin-bottom:6px">Проверьте по критериям приёмки</legend>' +
        p.criteria.map((x, i) => '<label class="check"><input type="checkbox" name="c' + i + '">' + E(x) + '</label>').join('') + '<span class="error-text" data-error-for="criteria" role="alert"></span></fieldset>' +
        '<p class="hint">После подтверждения выплата креатору уйдёт в обработку (симуляция).</p></form>',
      foot: '<button class="btn" type="button" data-close>Отмена</button><button class="btn btn-primary" type="button" data-ok>Подтвердить</button>',
    });
    d.querySelector('[data-ok]').addEventListener('click', async (e) => {
      const f = d.querySelector('#pc-form');
      const boxes = p.criteria.map((x, i) => f.elements['c' + i]);
      const left = boxes.filter((b) => !b.checked);
      const err = f.querySelector('[data-error-for="criteria"]');
      boxes.forEach((b) => (b.checked ? b.removeAttribute('aria-invalid') : b.setAttribute('aria-invalid', 'true')));
      if (left.length) {
        err.innerHTML = I('alert', 'icon-sm') + '<span>Не отмечено критериев: ' + left.length + ' из ' + boxes.length + '. Отметьте все — или попросите креатора исправить публикацию</span>';
        left[0].focus();
        return;
      }
      err.innerHTML = '';
      await U.busy(e.currentTarget);
      d.close();
      if (safe(() => U.flow.confirmPublication(o.id, p.criteria.map(() => true)))) done('Размещение подтверждено', 'Выплата креатору поставлена в очередь');
    });
  };
  U.actions['pub-reject'] = (el) => {
    const o = U.q.order(el.dataset.order);
    const d = U.modal.open({
      title: 'Попросить исправить публикацию',
      body: '<form id="pr-form" novalidate>' + U.fieldHTML({ name: 'reason', label: 'Что не соответствует критериям', textarea: true, required: true, placeholder: 'Например: нет пометки «Реклама» в начале поста' }) + '</form>',
      foot: '<button class="btn" type="button" data-close>Отмена</button><button class="btn btn-primary" type="button" data-ok>Отправить</button>',
    });
    d.querySelector('[data-ok]').addEventListener('click', async (e) => {
      const f = d.querySelector('#pr-form');
      if (!U.validate(f, { reason: (v) => (v.length < 10 ? 'Опишите подробнее — минимум 10 символов' : '') })) return;
      await U.busy(e.currentTarget);
      const reason = f.reason.value.trim();
      d.close();
      if (safe(() => U.flow.rejectPublication(o.id, reason))) done('Запрос отправлен креатору', 'Креатор исправит пост и пришлёт ссылку заново');
    });
  };

  U.actions.payout = async (el) => {
    const o = U.q.order(el.dataset.order);
    const ok = await U.confirm({ title: 'Провести выплату?', text: 'Симуляция: выплата ' + U.moneyText(o.fee) + ' креатору ' + E(U.q.creator(o.creatorId).name) + ' будет отмечена как проведённая. Реальный перевод не выполняется.', ok: 'Отметить выплату' });
    if (!ok) return;
    if (safe(() => U.flow.payout(o.id))) {
      if (U.route.name === 'order') done('Выплата отмечена (симуляция)', 'Заказ ' + o.id + ' завершён');
      else { U.rerender(); U.toast('Выплата отмечена (симуляция)', 'Заказ ' + o.id + ' завершён'); }
    }
  };

  U.actions.download = () => U.toast('Скачивание недоступно в прототипе', 'В рабочей версии здесь будет архив исходников и итоговых файлов', 'error');

  /* Повторный заказ: условия можно изменить до отправки предложения */
  U.actions.repeat = (el) => {
    const o = U.q.order(el.dataset.order);
    const c = U.q.creator(o.creatorId);
    const t = o.terms;
    const d = U.modal.open({
      title: 'Повторить заказ ' + o.id, cls: 'modal-wide',
      body: '<form id="rp-form" novalidate class="form-cols"><div style="display:grid;gap:16px;align-content:start">' +
        '<p class="small muted">Креатор: <b>' + E(c.name) + '</b>. Бриф — из кампании «' + E(U.q.campaign(o.campaignId).title) + '». Креатор получит новое предложение и сможет принять или отклонить его.</p>' +
        U.fieldHTML({ name: 'fee', label: 'Гонорар, ₽', type: 'number', required: true, value: o.fee, attrs: 'inputmode="numeric" min="1000" step="500"' }) +
        U.fieldHTML({ name: 'days', label: 'Срок съёмки', value: t.shootDays, options: U.config.shootDaysOptions.map((n) => [n, U.T.days(n, 'calendar')]) }) +
        '<label class="check"><input type="checkbox" name="ship"' + (t.ship ? ' checked' : '') + '>Отправить товар креатору</label>' +
        '<label class="check"><input type="checkbox" name="ret"' + (t.returnProduct ? ' checked' : '') + '>Товар нужно вернуть после съёмки</label>' +
        U.fieldHTML({ name: 'note', label: 'Сообщение креатору', textarea: true, value: 'Спасибо за прошлый заказ! Предлагаем повторить с тем же брифом.' }) +
        '</div><div id="rp-sum" class="prop-sum" aria-live="polite"></div></form>',
      foot: '<button class="btn" type="button" data-close>Отмена</button><button class="btn btn-primary" type="button" data-ok>Отправить предложение</button>',
    });
    const f = d.querySelector('#rp-form');
    const sum = d.querySelector('#rp-sum');
    const draw = () => {
      f.ret.disabled = !f.ship.checked; if (!f.ship.checked) f.ret.checked = false;
      const b = U.T.budget({ fee: f.fee.value, ship: f.ship.checked, returnProduct: f.ret.checked }, U.config);
      const block = U.rules.canOffer(c.id, { ship: f.ship.checked });
      sum.innerHTML = '<dl class="kv kv-left"><dt>Начало работы</dt><dd>' + (f.ship.checked ? 'После получения товара' : 'После оплаты заказа') + '</dd><dt>Съёмка</dt><dd>' + U.T.days(Number(f.days.value), 'calendar') + '</dd><dt>Правки</dt><dd>' + t.revisionsIncluded + ' включено</dd></dl><hr class="divider">' +
        '<dl class="kv"><dt>Гонорар</dt><dd>' + U.money(b.fee) + '</dd><dt>Сбор</dt><dd>' + U.money(b.commission) + '</dd>' + (b.delivery ? '<dt>Доставка, оценка</dt><dd>' + U.money(b.delivery) + '</dd>' : '') + (b.returnCost ? '<dt>Возврат, оценка</dt><dd>' + U.money(b.returnCost) + '</dd>' : '') + '<dt class="total">Итого' + (b.estimated ? ' ≈' : '') + '</dt><dd class="total">' + U.money(b.perCreator) + '</dd></dl>' +
        (block ? '<div class="notice notice-warning" style="margin-top:12px">' + I('alert') + '<span>' + E(block) + '</span></div>' : '');
    };
    f.addEventListener('input', draw); f.addEventListener('change', draw); draw();
    d.querySelector('[data-ok]').addEventListener('click', async (e) => {
      if (!U.validate(f, { fee: (v) => (!v || Number(v) < 1000 ? 'Минимальный гонорар — 1 000 ₽' : '') })) return;
      await U.busy(e.currentTarget);
      try {
        const r = U.flow.repeatOrder(o.id, { fee: f.fee.value, shootDays: f.days.value, ship: f.ship.checked, returnProduct: f.ret.checked, note: f.note.value.trim() });
        d.close();
        if (r.orderId) { U.toast('Повторный заказ создан', 'Демо-режим: креатор принял предложение'); U.go('orders/' + r.orderId); }
        else U.toast('Предложение отправлено', c.name + ' увидит его в кабинете');
      } catch (err) { U.toast('Не отправлено', err.message, 'error'); }
    });
  };

  U.actions.support = (el) => {
    const o = U.q.order(el.dataset.order);
    const role = roleIn();
    const topics = ['Проблема с доставкой', 'Срок сдачи', 'Спор по правкам', 'Вопрос по оплате или выплате', 'Публикация', 'Другое'];
    const d = U.modal.open({
      title: 'Обращение в поддержку',
      body: '<form id="sup-form" novalidate style="display:grid;gap:16px"><p class="small muted">Заказ ' + o.id + '. Поддержка увидит переписку и историю заказа.</p>' +
        U.fieldHTML({ name: 'topic', label: 'Тема', required: true, options: [['', 'Выберите тему']].concat(topics), value: el.dataset.topic || '' }) +
        U.fieldHTML({ name: 'text', label: 'Что случилось', textarea: true, required: true, placeholder: 'Опишите ситуацию: что ожидали и что произошло' }) + '</form>',
      foot: '<button class="btn" type="button" data-close>Отмена</button><button class="btn btn-primary" type="button" data-ok>Отправить обращение</button>',
    });
    d.querySelector('[data-ok]').addEventListener('click', async (e) => {
      const f = d.querySelector('#sup-form');
      const ok = U.validate(f, { topic: (v) => (v ? '' : 'Выберите тему'), text: (v) => (v.length < 15 ? 'Опишите ситуацию подробнее — минимум 15 символов' : '') });
      if (!ok) return;
      await U.busy(e.currentTarget);
      const num = U.flow.ticket(o.id, role === 'admin' ? 'support' : role, f.topic.value, f.text.value.trim());
      d.close();
      U.rerender();
      U.toast('Обращение №' + num + ' создано', 'Ответ придёт в переписку по заказу');
    });
  };

  /* Чат в выдвижной панели — контекст заказа остаётся на экране */
  U.actions['open-chat'] = (el) => {
    const o = U.q.order(el.dataset.order);
    const c = U.q.creator(o.creatorId);
    const role = roleIn();
    const dr = U.openDrawer('Переписка · ' + (role === 'creator' ? 'Северный уход' : E(c.name)), chatHTML(o), 'right');
    dr.el.classList.add('chat-drawer');
    wireChat(dr.el, o.id, () => { if (U.route.name === 'order') U.rerender(); });
    dr.el.querySelector('#chat-in').focus();
  };
  function wireChat(scope, orderId, after) {
    const form = scope.querySelector('[data-chat]');
    const log = scope.querySelector('#chat-log');
    log.scrollTop = log.scrollHeight;
    const ta = form.querySelector('textarea');
    const err = form.querySelector('#chat-err');
    ta.addEventListener('keydown', (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); form.requestSubmit(); } });
    ta.addEventListener('input', () => { ta.style.height = 'auto'; ta.style.height = Math.min(140, ta.scrollHeight) + 'px'; ta.removeAttribute('aria-invalid'); err.textContent = ''; });
    // Клавиатура телефона: держим поле ввода в видимой области
    ta.addEventListener('focus', () => setTimeout(() => form.scrollIntoView({ block: 'nearest' }), 250));
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const text = ta.value.trim();
      if (!text) { ta.setAttribute('aria-invalid', 'true'); ta.placeholder = 'Сообщение не может быть пустым'; err.textContent = 'Сообщение не может быть пустым'; ta.focus(); return; }
      const role = U.store.s.role;
      U.flow.message(orderId, role === 'admin' ? 'support' : role, text);
      const o = U.q.order(orderId);
      const fresh = document.createElement('div');
      fresh.innerHTML = chatHTML(o);
      log.innerHTML = fresh.querySelector('#chat-log').innerHTML;
      log.scrollTop = log.scrollHeight;
      ta.value = ''; ta.style.height = '';
      ta.removeAttribute('aria-invalid'); ta.placeholder = 'Сообщение… (Enter — отправить)';
      ta.focus();
      after && after();
    });
  }
  U.wireChat = wireChat;
  U.chatHTML = chatHTML;
})();
