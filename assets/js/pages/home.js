/* Главная страница */
(function () {
  const I = U.icon, E = U.esc;

  /* Мини-карточка заказа: раскладку определяет её собственная ширина (container queries) */
  function orderSnip(o) {
    const cr = U.q.creator(o.creatorId), cmp = U.q.campaign(o.campaignId);
    const stages = U.T.stages(o);
    const cur = o.stage === 'revision' ? 'review' : o.stage;
    const ci = stages.indexOf(cur);
    const steps = stages.map((id, i) => {
      const label = id === 'review' && o.stage === 'revision' ? 'Правки' : U.T.STAGE_LABEL[id];
      return '<li class="' + (i < ci || o.stage === 'accepted' ? 'is-done' : i === ci ? 'is-current' : '') + '"><span>' + label + '</span></li>';
    }).join('');
    const v = U.q.lastVersion(o);
    const due = U.due(o);
    return '<a class="order-snip" href="#/orders/' + o.id + '" aria-label="Открыть пример заказа ' + o.id + ': ' + E(cmp.product.name) + '"><div class="os">' +
      '<div class="os-head"><span class="thumb">' + U.img(cmp.product.media, 112, 112, '', '') + '</span>' +
      '<div class="os-title"><b title="' + E(cmp.product.name) + '">' + E(cmp.product.name) + '</b><span>Заказ ' + o.id + ' · ' + E(cr.name) + '</span></div>' +
      '<span class="os-status">' + U.stagePill(o) + '</span></div>' +
      '<div class="os-steps"><ol class="steps" aria-label="Этапы заказа">' + steps + '</ol>' +
      '<p class="os-steps-short">Этап ' + (ci + 1) + ' из ' + stages.length + ': <b>' + (o.stage === 'revision' ? 'Правки' : U.T.STAGE_LABEL[cur]) + '</b></p></div>' +
      '<div class="os-foot">' +
      (v ? '<span class="os-files"><span class="os-thumbs">' + v.files.slice(0, 3).map((f) => U.frame(f.media, { w: 80, play: false, cls: 'frame-sm', alt: '' })).join('') + '</span><span><b>Версия ' + v.n + '</b> · ' + v.files.length + ' ' + U.plural(v.files.length, ['файл', 'файла', 'файлов']) + '</span></span>' : '') +
      '<span>' + E(due.short.charAt(0).toUpperCase() + due.short.slice(1)) + '</span><span>Гонорар <b>' + U.money(o.fee) + '</b></span></div>' +
      '</div></a>';
  }

  function hero() {
    const o = U.q.order('o-1048');
    const daria = U.q.creator('c2'), alina = U.q.creator('c1'), artem = U.q.creator('c8');
    const reduce = U.reduceMotion();
    const vid = U.media['v-talk'];
    const cap = (c) => '<div class="hero-cap">' + U.avatar(c, 24) + '<span><strong>' + E(c.name.split(' ')[0]) + '</strong> · ' + E(c.city) + '</span></div>';
    return '<section class="hero" aria-labelledby="hero-h"><div class="wrap hero-grid">' +
      '<div class="hero-copy">' +
      '<h1 id="hero-h"><span class="line">Ваш продукт.</span><span class="line"><span class="hl">Их подача.</span></span></h1>' +
      '<p class="t-lead">Находите креаторов, заказывайте видео по брифу и управляйте всей работой в одном месте.</p>' +
      '<div class="hero-actions"><a class="btn btn-primary btn-lg" href="#/campaigns/new">Заказать видео ' + I('arrow-right') + '</a>' +
      '<a class="btn btn-lg" href="#/join">Стать креатором</a></div>' +
      '<div class="hero-facts"><span>' + I('video', 'icon-sm') + 'Вертикальные видео и фото</span><span>' + I('lock', 'icon-sm') + 'Оплата резервируется до приёмки</span><span>' + I('refresh', 'icon-sm') + U.config.revisionsIncluded + ' правки включены</span></div>' +
      '</div>' +
      '<div class="hero-visual">' +
      '<div class="hero-stage" role="group" aria-label="Примеры работ креаторов">' +
      '<div class="hero-col hero-col-a">' + U.frame('v-face-cream', { w: 360, label: I('video', 'icon-sm') + 'Демонстрация', creator: 'c1', caption: 'Утренний уход: крем для лица' }) + cap(alina) + '</div>' +
      '<div class="hero-col hero-col-b"><figure class="frame frame-scrim">' +
      '<video id="hero-video" muted loop playsinline preload="none" poster="' + U.mediaUrl('v-talk', 480) + '" aria-label="' + E(vid.alt) + '" style="object-position:' + vid.pos + '"><source src="' + vid.src + '" type="video/mp4"></video>' +
      '<div class="frame-top"><span class="hero-rec">Отзыв<span class="rec-more"> в кадре</span></span></div>' +
      '<button class="hero-video-ctl" type="button" id="hero-video-ctl" aria-label="' + (reduce ? 'Воспроизвести видео' : 'Поставить видео на паузу') + '">' + I(reduce ? 'play' : 'pause') + '</button>' +
      '</figure>' + cap(daria) + '</div>' +
      '<div class="hero-col hero-col-c">' + U.frame('v-unbox-man', { w: 360, label: I('video', 'icon-sm') + 'Распаковка', creator: 'c8', caption: 'Распаковка от двери' }) + cap(artem) + '</div>' +
      '</div>' + (o ? orderSnip(o) : '') + '</div></div></section>';
  }

  const EXAMPLES = [
    { media: 'v-face-cream', c: 'c1', fmt: 'Демонстрация товара', text: 'Текстура, нанесение и результат крупным планом.' },
    { media: 'v-unbox-phone', c: 'c3', fmt: 'Распаковка', text: 'От коробки до первого включения — с живой реакцией.' },
    { media: 'v-barista', c: 'c4', fmt: 'Инструкция', text: 'Как пользоваться: шаги, пропорции, ошибки.' },
    { media: 'v-body-cream', c: 'c5', fmt: 'Видео с озвучкой', text: 'Спокойная сцена в кадре, голос за кадром.' },
    { media: 'v-talk-2', c: 'c2', fmt: 'Отзыв в кадре', text: 'Человек рассказывает о товаре своими словами.' },
    { media: 'p-sneakers-hand', c: 'c7', fmt: 'Фото для карточки', text: 'Предметные и lifestyle-кадры для маркетплейса.' },
  ];
  function examples() {
    return '<section class="section" id="examples" aria-labelledby="ex-h"><div class="wrap">' +
      '<div class="section-head"><div><span class="t-eyebrow">Примеры контента</span><h2 id="ex-h">Форматы, в которых товар понятен за секунды</h2></div>' +
      '<p>Креаторы снимают вертикальные видео и фото по вашему брифу. Нажмите на кадр, чтобы посмотреть работу и задачу.</p></div>' +
      '<div class="examples-grid">' + EXAMPLES.map((x) => {
        const c = U.q.creator(x.c);
        const m = U.media[x.media];
        const w = U.work(c, x.media);
        return '<article class="example">' + U.frame(x.media, { w: 400, label: (m.kind === 'video' ? I('video', 'icon-sm') + 'Видео <span class="num">' + m.dur + '</span>' : I('image', 'icon-sm') + 'Фото'), caption: w ? w.title : x.fmt, zoom: true, creator: c.id }) +
          '<div><h3>' + x.fmt + '</h3><p>' + x.text + '</p></div>' +
          '<div class="example-by">' + U.avatar(c, 22) + '<a href="#/creators/' + c.id + '">' + E(c.name) + '</a></div></article>';
      }).join('') + '</div></div></section>';
  }

  function choose() {
    const list = ['c1', 'c4', 'c7'].map(U.q.creator);
    return '<section class="section" aria-labelledby="ch-h" style="padding-top:0"><div class="wrap choose-grid">' +
      '<div class="choose-copy"><span class="t-eyebrow">Выбор креатора</span><h2 id="ch-h" style="margin-top:16px">Выбирайте по работам, а не по подписчикам</h2>' +
      '<ol class="criteria" role="list">' +
      '<li><b>Портфолио в вашей категории</b><span>Видно, как человек снимает похожие товары.</span></li>' +
      '<li><b>Подача в кадре</b><span>Лицо, только руки или закадровая озвучка.</span></li>' +
      '<li><b>Город и языки</b><span>Влияют на сроки доставки товара и тон ролика.</span></li>' +
      '<li><b>Гонорар и сроки ответа</b><span>Цена видна заранее, без торга в переписке.</span></li>' +
      '<li><b>Проверка и история заказов</b><span>Статус проверки и число завершённых заказов.</span></li>' +
      '</ol><a class="btn btn-dark" href="#/creators" style="margin-top:32px">Открыть каталог ' + I('arrow-right') + '</a></div>' +
      '<div class="pro-list">' + list.map((c) =>
        '<article class="pro"><div class="pro-in"><div class="pro-works">' + c.portfolio.slice(0, 3).map((w) => U.frame(w.media, { w: 240, caption: w.title, zoom: true, creator: c.id })).join('') + '</div>' +
        '<div class="pro-info"><div class="pro-name">' + U.avatar(c, 44) + '<div style="min-width:0"><h3>' + E(c.name) + '</h3><span class="muted">' + E(c.city) + ' · ' + E(c.langs.join(', ')) + '</span></div></div>' +
        '<div class="row-wrap">' + c.topics.map((t) => '<span class="tag">' + E(t) + '</span>').join('') + c.presence.map((p) => '<span class="tag">' + U.PRESENCE[p] + '</span>').join('') + '</div>' +
        '<dl class="pro-facts"><div><dt>Гонорар</dt><dd>от ' + U.money(U.q.minPrice(c, 'ugc')) + '</dd></div><div><dt>Ответ</dt><dd class="num">~' + c.responseHours + ' ч</dd></div>' +
        '<div><dt>Рейтинг</dt><dd>' + (c.rating ? '<span class="rating">' + I('star') + String(c.rating).replace('.', ',') + '</span>' : '—') + '</dd></div><div><dt>Завершено</dt><dd class="num">' + c.completed + '</dd></div></dl>' +
        U.verifyLine(c) +
        '<a class="link" href="#/creators/' + c.id + '">Посмотреть профиль</a></div></div></article>'
      ).join('') + '</div></div></section>';
  }

  /* Фрагменты интерфейса для шагов — из тех же данных, что и кабинет */
  function howFragments() {
    const cmp = U.q.campaign('cmp1');
    const cmp3 = U.q.campaign('cmp3');
    const apps = U.store.s.applications.filter((a) => a.campaignId === 'cmp3').slice(0, 3);
    const o1048 = U.q.order('o-1048');
    const v = o1048 && o1048.versions[0];
    const done = U.q.order('o-1037');
    return [
      {
        t: 'Бриф', d: 'Товар, задача, что обязательно показать и чего избегать.', link: '#/campaigns/new', linkText: 'Открыть конструктор кампании',
        html: '<div class="snip"><div class="snip-head">' + I('file') + 'Бриф кампании<span class="spacer"></span><span class="status status-success">Опубликован</span></div><div class="snip-body">' +
          '<div class="snip-row"><span class="frame frame-1x1 frame-sm" style="width:52px;flex:none">' + U.img(cmp.product.media, 104, 104, '', '') + '</span><div class="grow"><b>' + E(cmp.product.name) + '</b><div class="muted small">' + E(cmp.product.category) + ' · ' + U.money(cmp.product.price) + '</div></div></div>' +
          '<div><div class="muted small" style="margin-bottom:6px">Что сдать</div>' + cmp.deliverables.map((x) => '<div class="snip-row">' + I('check', 'icon-sm') + '<span>' + E(x) + '</span></div>').join('') + '</div>' +
          '<div><div class="muted small" style="margin-bottom:6px">Срок</div><div class="snip-row">' + I('calendar', 'icon-sm') + '<span>' + E(U.T.shootRule(U.T.snapshot(cmp, U.config))) + '</span></div></div>' +
          '<div class="snip-row" style="justify-content:space-between"><span class="muted">Гонорар креатору</span><b>' + U.money(cmp.fee) + '</b></div></div></div>',
      },
      {
        t: 'Выбор исполнителя', d: 'Креаторы откликаются на бриф — вы сравниваете работы и цену.', link: '#/campaigns/cmp3', linkText: 'Открыть отклики',
        html: '<div class="snip"><div class="snip-head">' + I('users') + '<span>Отклики · ' + E(cmp3.product.name) + '</span></div><div class="snip-body">' +
          apps.map((a) => { const c = U.q.creator(a.creatorId); return '<div class="snip-row">' + U.avatar(c, 40) + '<div class="grow"><b>' + E(c.name) + '</b><div class="muted small" style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis">' + E(a.message) + '</div></div><b class="nowrap">' + U.money(a.price) + '</b></div>'; }).join('') +
          '</div></div>',
      },
      {
        t: 'Получение товара', d: 'Вы добавляете трек-номер, креатор подтверждает получение — с этого момента идёт срок съёмки.', link: '#/orders/o-1046', linkText: 'Открыть заказ в доставке',
        html: '<div class="snip"><div class="snip-head">' + I('truck') + 'Доставка товара<span class="spacer"></span><span class="status status-info">В пути</span></div><div class="snip-body"><ol class="timeline">' +
          '<li class="is-done"><span class="dot">' + I('check') + '</span><div><div class="t">Заказ оплачен</div><div class="d">Средства зарезервированы до приёмки</div></div><span class="r">шаг 1</span></li>' +
          '<li class="is-done"><span class="dot">' + I('check') + '</span><div><div class="t">Товар отправлен</div><div class="d">Почта · 80085294173622</div></div><span class="r">шаг 2</span></li>' +
          '<li class="is-now"><span class="dot"></span><div><div class="t">Креатор подтверждает получение</div><div class="d">После этого рассчитывается дата сдачи: 10 календарных дней</div></div><span class="r">шаг 3</span></li>' +
          '</ol></div></div>',
      },
      {
        t: 'Материалы', d: 'Версии видео, комментарии с таймкодами и включённые правки.', link: '#/orders/o-1048', linkText: 'Открыть заказ на проверке',
        html: '<div class="snip"><div class="snip-head">' + I('film') + 'Версия 1 · ' + (v ? v.files.length : 0) + ' файла<span class="spacer"></span><span class="status status-accent">На проверке</span></div><div class="snip-body">' +
          '<div class="snip-row" style="align-items:flex-start">' + (v ? v.files : []).map((f) => '<span style="width:72px;flex:none">' + U.frame(f.media, { w: 144, play: false, cls: 'frame-sm', alt: '' }) + '</span>').join('') + '</div>' +
          '<div class="comment"><span class="timecode">0:03</span><span>Флакон в первом кадре — крупнее, этикетка должна читаться.</span></div>' +
          '<div class="snip-row wrap-row"><span class="muted small grow">Правки: 0 из 2 использовано</span><span class="fake-btn">Запросить правки</span><span class="fake-btn primary">Принять</span></div></div></div>',
      },
      {
        t: 'Приёмка', d: 'Работа принята — выплата креатору уходит отдельным шагом.', link: '#/orders/o-1037', linkText: 'Открыть завершённый заказ',
        html: '<div class="snip"><div class="snip-head">' + I('check-circle') + 'Итог заказа</div><div class="snip-body">' +
          '<div class="snip-row" style="justify-content:space-between"><span>Работа</span><span class="status status-success">Принята</span></div>' +
          '<div class="snip-row" style="justify-content:space-between"><span>Выплата креатору</span><span class="status status-warning">В обработке</span></div>' +
          '<p class="muted small">«Работа принята» и «Выплата проведена» — разные статусы: деньги уходят креатору в течение ' + U.T.daysGen(U.config.payoutDays, 'business') + ' после приёмки.</p>' +
          '<div class="snip-row" style="justify-content:space-between"><span class="muted">Креатор получит</span><b>' + U.money(done ? done.fee : 0) + '</b></div></div></div>',
      },
    ];
  }
  function how() {
    const fr = howFragments();
    return '<section class="section section-dark on-dark" id="how" aria-labelledby="how-h"><div class="wrap">' +
      '<div class="section-head"><div><span class="t-eyebrow">Как проходит заказ</span><h2 id="how-h">Пять шагов — в одном рабочем окне</h2></div>' +
      '<p>Рядом — фрагменты настоящего интерфейса прототипа. Переключайте шаги, чтобы увидеть, что происходит на каждом.</p></div>' +
      '<div class="how-grid"><div class="how-steps" role="tablist" aria-label="Шаги заказа">' +
      fr.map((f, i) => '<button class="how-step" role="tab" id="how-t' + i + '" aria-controls="how-p" aria-selected="' + (i === 0) + '" tabindex="' + (i === 0 ? 0 : -1) + '" data-step="' + i + '"><span class="n">0' + (i + 1) + '</span><b>' + f.t + '</b><span class="d">' + f.d + '</span></button>').join('') +
      '</div><div class="how-stage" role="tabpanel" id="how-p" aria-labelledby="how-t0"></div></div></div></section>';
  }

  function deal() {
    const o = U.q.order('o-1037');
    const c = U.q.creator(o.creatorId), cmp = U.q.campaign(o.campaignId);
    const v1 = o.versions[0], v2 = o.versions[1];
    return '<section class="section" aria-labelledby="deal-h"><div class="wrap">' +
      '<div class="section-head"><div><span class="t-eyebrow">Управление работой</span><h2 id="deal-h">Вся сделка на одной карточке</h2></div>' +
      '<p>Срок, доставка, переписка и версии видео не теряются в мессенджерах. Каждое решение остаётся в истории заказа.</p></div>' +
      '<a class="deal" href="#/orders/' + o.id + '" style="text-decoration:none" aria-label="Открыть заказ ' + o.id + '"><div class="deal-main">' +
      '<div class="deal-head"><h3>' + E(cmp.title) + '</h3>' + U.stagePill(o) + '</div>' +
      '<div class="row" style="flex-wrap:wrap;gap:8px 16px"><span class="row">' + U.brandAvatar(U.q.brand('b1'), 28) + '<span class="small">Северный уход</span></span>' + I('arrow-right', 'icon-sm') + '<span class="row">' + U.avatar(c, 28) + '<span class="small">' + E(c.name) + '</span></span></div>' +
      '<div class="versions">' +
      '<div class="version">' + U.frame(v1.files[0].media, { w: 240, play: false, alt: '' }) + '<div style="min-width:0"><h4>Версия 1 <span class="status status-warning">Правки</span></h4>' + v1.feedback.map((f) => '<div class="comment"><span class="timecode">' + f.time + '</span><span>' + E(f.text) + '</span></div>').join('') + '</div></div>' +
      '<div class="version">' + U.frame(v2.files[0].media, { w: 240, play: false, alt: '' }) + '<div style="min-width:0"><h4>Версия 2 <span class="status status-success">Принята</span></h4><p class="small muted">' + E(v2.note) + '</p></div></div>' +
      '</div>' +
      '<div class="comment"><span class="avatar-pair">' + U.brandAvatar(U.q.brand('b1'), 28) + '</span><div class="small"><b>Северный уход</b> · ' + E(o.messages[o.messages.length - 1].text) + '</div></div>' +
      '</div><div class="deal-side">' +
      '<dl class="kv"><dt>Срок съёмки</dt><dd>' + U.T.days(o.terms.shootDays, 'calendar') + '</dd><dt>Отсчёт</dt><dd>с получения товара</dd><dt>Доставка</dt><dd>' + E(o.delivery.carrier) + '</dd><dt>Правки</dt><dd class="num">' + o.revisionsUsed + ' из ' + o.terms.revisionsIncluded + '</dd></dl>' +
      '<hr class="divider" style="margin:0">' +
      '<dl class="kv"><dt>Гонорар</dt><dd>' + U.money(o.fee) + '</dd><dt>Сервисный сбор</dt><dd>' + U.money(o.commission) + '</dd><dt>Доставка (оценка)</dt><dd>' + U.money(o.terms.deliveryCost) + '</dd><dt class="total">Оплачено</dt><dd class="total">' + U.money(U.q.total(o)) + '</dd></dl>' +
      '<div class="row" style="justify-content:space-between"><span class="small muted">Работа</span><span class="status status-success">Принята</span></div>' +
      '<div class="row" style="justify-content:space-between"><span class="small muted">Выплата</span>' + U.payPill(o) + '</div>' +
      '<span class="link small" style="justify-self:start">Открыть пример заказа</span></div></a>' +
      '<div class="deal-callouts"><div><h3>Сроки на виду</h3><p>Срок съёмки считается от получения товара, проверка и правки — отдельными сроками.</p></div>' +
      '<div><h3>Правки по таймкодам</h3><p>Замечания привязаны к секунде ролика. Число включённых правок известно заранее.</p></div>' +
      '<div><h3>Деньги отдельно от работы</h3><p>Оплата резервируется при заказе и уходит креатору только после приёмки.</p></div></div>' +
      '</div></section>';
  }

  function pricing() {
    return '<section class="section" id="pricing" aria-labelledby="pr-h" style="padding-top:0"><div class="wrap price-grid">' +
      '<div><span class="t-eyebrow">Стоимость</span><h2 id="pr-h" style="margin-top:16px">Цена складывается из понятных частей</h2>' +
      '<div class="price-notes">' +
      '<div>' + I('user') + '<p><b>Гонорар креатора</b>Креатор указывает его в профиле или отклике. Получает полностью — налог самозанятого платит сам.</p></div>' +
      '<div>' + I('layers') + '<p><b>Сервисный сбор ' + Math.round(U.config.serviceFeeRate * 100) + '%</b>Платит заказчик сверху гонорара: резервирование оплаты, поддержка и хранение материалов.</p></div>' +
      '<div>' + I('truck') + '<p><b>Доставка товара — оценка</b>Отправка креатору по тарифу перевозчика. Если товар нужно вернуть, добавляется обратная отправка.</p></div>' +
      '</div><p class="notice notice-plain" style="margin-top:28px;max-width:60ch">' + I('info') + '<span>Ставка сбора и стоимость доставки — параметры прототипа, а не утверждённые тарифы.</span></p></div>' +
      '<div class="receipt" id="calc"><div class="receipt-top">' +
      '<div class="field"><label for="calc-fee">Гонорар креатора</label><div class="input-group"><input class="input num" id="calc-fee" type="number" inputmode="numeric" min="1000" max="50000" step="500" value="6500" aria-describedby="calc-fee-h calc-err"><span class="input-affix">₽</span></div>' +
      '<input class="range" type="range" min="2000" max="20000" step="500" value="6500" id="calc-range" aria-label="Гонорар креатора, ползунок"><span class="hint" id="calc-fee-h">От 1 000 до 50 000 ₽</span><span class="error-text" id="calc-err" aria-live="polite"></span></div>' +
      '<label class="check"><input type="checkbox" id="calc-ship" checked> Нужна доставка товара креатору</label>' +
      '<label class="check"><input type="checkbox" id="calc-ret"> Товар нужно вернуть после съёмки</label></div>' +
      '<div class="receipt-rows" aria-live="polite" id="calc-rows"></div>' +
      '<div class="receipt-split on-dark" id="calc-split"></div></div>' +
      '</div></section>';
  }
  function calcRows(fee, ship, ret) {
    const b = U.T.budget({ fee, ship, returnProduct: ret }, U.config);
    return [
      '<div class="receipt-row"><span>Гонорар креатора</span>' + U.money(b.fee) + '</div>' +
      '<div class="receipt-row"><span>Сервисный сбор ' + Math.round(U.config.serviceFeeRate * 100) + '%</span>' + U.money(b.commission) + '</div>' +
      '<div class="receipt-row"><span>Доставка креатору, оценка</span>' + (ship ? U.money(b.delivery) : '<span>не нужна</span>') + '</div>' +
      (ship && ret ? '<div class="receipt-row"><span>Обратная доставка, оценка</span>' + U.money(b.returnCost) + '</div>' : '') +
      '<div class="receipt-row total"><span>Заказчик платит' + (b.estimated ? ' ≈' : '') + '</span>' + U.money(b.perCreator) + '</div>',
      '<div class="receipt-row"><span class="who">Креатор получает после приёмки</span>' + U.money(b.fee) + '</div>' +
      '<div class="receipt-row"><span>Платформе</span>' + U.money(b.commission) + '</div>' +
      (ship ? '<div class="receipt-row"><span>Перевозчику (оценка)</span>' + U.money(b.delivery + b.returnCost) + '</div>' : ''),
    ];
  }

  function forCreators() {
    return '<section class="section section-dark on-dark" id="for-creators" aria-labelledby="fc-h"><div class="wrap creators-band">' +
      '<div class="creators-photos">' + U.frame('p-tripod', { w: 520, alt: 'Девушка снимает видео на телефон на штативе дома' }) + U.frame('v-film-home', { w: 400, caption: 'Креатор снимает видео дома' }) + '</div>' +
      '<div class="creators-copy"><span class="t-eyebrow">Для креаторов</span><h2 id="fc-h" style="margin-top:16px">Снимайте то, чем пользуетесь, и получайте гонорар</h2>' +
      '<ul class="creator-steps" role="list">' +
      '<li>' + I('search') + '<span><b>Откликайтесь на брифы.</b> Полный бриф и условия видны до отклика, цену называете сами.</span></li>' +
      '<li>' + I('package') + '<span><b>Получайте товар.</b> Отправку оплачивает заказчик, срок съёмки считается с момента получения.</span></li>' +
      '<li>' + I('upload') + '<span><b>Сдавайте материалы в заказе.</b> Правки — только в рамках брифа и включённого количества.</span></li>' +
      '<li>' + I('wallet') + '<span><b>Получайте выплату.</b> После приёмки — в течение ' + U.T.daysGen(U.config.payoutDays, 'business') + '. Нужен статус самозанятого или ИП.</span></li>' +
      '</ul>' +
      '<dl class="earn" aria-label="Пример расчёта заработка"><div><dt>Заказов в месяц</dt><dd class="num">4</dd></div><div><dt>Средний гонорар</dt><dd>' + U.money(6000) + '</dd></div><div><dt>До налога</dt><dd class="accent">' + U.money(24000) + '</dd></div></dl>' +
      '<p class="small" style="color:var(--c-on-dark-2);margin-top:10px;max-width:60ch">Пример расчёта, а не обещание дохода. Количество заказов зависит от портфолио и брифов.</p>' +
      '<div class="hero-actions"><a class="btn btn-primary" href="#/join">Стать креатором ' + I('arrow-right') + '</a><a class="btn" href="#/studio" data-action="as-creator">Посмотреть кабинет креатора</a></div>' +
      '</div></div></section>';
  }

  const FAQ = () => [
    ['Нужно ли отправлять товар креатору?', '<p>Да, если товар должен быть в кадре. Вы добавляете трек-номер в заказ, креатор подтверждает получение — с этого момента идёт срок съёмки. Отправка креатору с неподтверждёнными документами недоступна.</p><p>Для цифровых продуктов и сервисов доставку можно отключить в брифе — тогда срок отсчитывается с оплаты заказа.</p>'],
    ['Обязательны ли креатору подписчики?', '<p>Нет. Для UGC без публикации важны портфолио и подача: видео остаются у вас и используются в рекламе и карточках товара.</p><p>Показатели аудитории нужны только для формата с публикацией у креатора — их видно в профиле и каталоге.</p>'],
    ['Как проходят правки?', '<p>В заказ включены ' + U.config.revisionsIncluded + ' правки, на каждую — ' + U.T.days(U.config.revisionDays, 'calendar') + '. Замечания оставляются к конкретной версии и секунде ролика и должны опираться на согласованный бриф.</p>'],
    ['Когда креатор получает выплату?', '<p>Оплата резервируется при заказе. После приёмки работы выплата уходит креатору в течение ' + U.T.daysGen(U.config.payoutDays, 'business') + '. Статусы «Работа принята» и «Выплата проведена» в заказе показаны отдельно.</p>'],
    ['Что если заказчик не проверяет материалы?', '<p>На проверку каждой версии — ' + U.T.days(U.config.reviewDays, 'business') + '. Если заказчик не ответил, поддержка связывается с ним. Спорные ситуации решаются через обращение из карточки заказа.</p>'],
    ['Кому принадлежат права на видео?', '<p>Объём и срок прав задаются в брифе (например, «реклама и карточки маркетплейсов, 12 месяцев») и фиксируются в заказе до начала работы.</p>'],
  ];
  function faq() {
    return '<section class="section" aria-labelledby="faq-h"><div class="wrap faq-grid">' +
      '<div><span class="t-eyebrow">Вопросы</span><h2 id="faq-h" style="margin-top:16px">Коротко о важном</h2></div>' +
      '<div class="accordion">' + FAQ().map(([q, a], i) => '<details' + (i === 0 ? ' open' : '') + '><summary>' + q + I('plus') + '</summary><div class="answer">' + a + '</div></details>').join('') + '</div>' +
      '</div></section>' +
      '<section aria-labelledby="final-h"><div class="wrap"><div class="final">' +
      '<div><h2 id="final-h">Опишите товар — креаторы откликнутся на бриф</h2><p>Конструктор кампании проведёт по шагам: товар, формат, требования, сроки и бюджет.</p>' +
      '<div class="hero-actions"><a class="btn btn-dark btn-lg" href="#/campaigns/new">Заказать видео ' + I('arrow-right') + '</a><a class="btn btn-lg" href="#/creators">Смотреть креаторов</a></div></div>' +
      '<div class="final-frames" aria-hidden="true">' + ['p-bottle-hold', 'p-coffee-man', 'p-pink-smile'].map((m) => U.frame(m, { w: 260, alt: '' })).join('') + '</div>' +
      '</div></div></section>';
  }

  U.pages.home = {
    shell: 'site',
    title: '',
    render() { return hero() + examples() + choose() + how() + deal() + pricing() + forCreators() + faq(); },
    mount(root) {
      /* Видео первого экрана: тихо, по кругу, только когда видно и движение разрешено */
      const v = root.querySelector('#hero-video');
      const ctl = root.querySelector('#hero-video-ctl');
      let userPaused = U.reduceMotion();
      const setBtn = () => {
        const playing = !v.paused;
        ctl.innerHTML = I(playing ? 'pause' : 'play');
        ctl.setAttribute('aria-label', playing ? 'Поставить видео на паузу' : 'Воспроизвести видео');
      };
      v.addEventListener('play', setBtn); v.addEventListener('pause', setBtn);
      ctl.addEventListener('click', () => {
        if (v.paused) { userPaused = false; v.play().catch(() => {}); } else { userPaused = true; v.pause(); }
      });
      if ('IntersectionObserver' in window) {
        const io = new IntersectionObserver(([en]) => {
          if (en.isIntersecting && !userPaused) v.play().catch(() => {});
          else if (!en.isIntersecting) v.pause();
        }, { threshold: 0.4 });
        io.observe(v);
      }

      /* Вкладки шагов. На узком экране описание шага идёт перед фрагментом интерфейса */
      const frs = howFragments();
      const panel = root.querySelector('#how-p');
      const tabs = [...root.querySelectorAll('.how-step')];
      const show = (i, focus) => {
        tabs.forEach((t, j) => { t.setAttribute('aria-selected', j === i); t.tabIndex = j === i ? 0 : -1; });
        panel.setAttribute('aria-labelledby', 'how-t' + i);
        const f = frs[i];
        panel.innerHTML = '<div class="how-stage-cap"><span>Фрагмент интерфейса · шаг ' + (i + 1) + ' из 5</span><a href="' + f.link + '">' + f.linkText + I('arrow-right', 'icon-sm') + '</a></div>' +
          '<p class="how-desc">' + E(f.d) + '</p><div inert aria-hidden="true">' + f.html + '</div>';
        U.typograph(panel);
        if (focus) tabs[i].focus();
      };
      tabs.forEach((t, i) => {
        t.addEventListener('click', () => show(i));
        t.addEventListener('keydown', (e) => {
          const k = e.key;
          let n = null;
          if (k === 'ArrowDown' || k === 'ArrowRight') n = (i + 1) % tabs.length;
          if (k === 'ArrowUp' || k === 'ArrowLeft') n = (i - 1 + tabs.length) % tabs.length;
          if (k === 'Home') n = 0;
          if (k === 'End') n = tabs.length - 1;
          if (n !== null) { e.preventDefault(); show(n, true); }
        });
      });
      show(0);

      /* Калькулятор стоимости */
      const fee = root.querySelector('#calc-fee'), range = root.querySelector('#calc-range'), ship = root.querySelector('#calc-ship'), ret = root.querySelector('#calc-ret');
      const rows = root.querySelector('#calc-rows'), split = root.querySelector('#calc-split'), err = root.querySelector('#calc-err');
      const upd = () => {
        ret.disabled = !ship.checked;
        if (!ship.checked) ret.checked = false;
        const n = Number(fee.value);
        if (!n || n < 1000 || n > 50000) {
          fee.setAttribute('aria-invalid', 'true');
          err.innerHTML = I('alert', 'icon-sm') + '<span>Укажите сумму от 1 000 до 50 000 ₽</span>';
          return;
        }
        fee.removeAttribute('aria-invalid'); err.innerHTML = '';
        const [a, b] = calcRows(n, ship.checked, ret.checked);
        rows.innerHTML = a; split.innerHTML = b;
      };
      fee.addEventListener('input', () => { if (Number(fee.value) >= 2000 && Number(fee.value) <= 20000) range.value = fee.value; upd(); });
      range.addEventListener('input', () => { fee.value = range.value; upd(); });
      ship.addEventListener('change', upd);
      ret.addEventListener('change', upd);
      upd();
    },
  };
})();
