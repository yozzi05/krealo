/* Конструктор кампании. Готовность шагов вычисляется из данных черновика
   (U.builderRules) — при любом изменении пересчитываются все шаги, перед
   публикацией кампания проверяется целиком. */
(function () {
  const I = U.icon, E = U.esc;
  const STEPS = ['Товар', 'Формат', 'Бриф', 'Условия', 'Проверка'];
  const DELIV = ['Видео 9:16, 15–30 секунд', 'Видео 9:16, 30–60 секунд', 'Видео с озвучкой, до 40 секунд', 'Фото-сет, 5 кадров', 'Исходники без музыки', '2 альтернативных первых кадра (хука)'];
  const CAT_MEDIA = { 'Уход за кожей': 'p-white-bottle', 'Красота': 'p-kalos-hold', 'Гаджеты': 'p-phone-shoot', 'Еда и напитки': 'p-coffee-mug', 'Дом': 'p-candle', 'Спорт': 'p-yoga', 'Одежда и обувь': 'p-sneakers-hand', 'Товары для животных': 'p-dog-treat', 'Лайфстайл': 'p-tripod', 'Распаковка': 'p-box-give' };
  const day = (n) => { const d = new Date(Date.now() + n * 86400000); return d.toISOString().slice(0, 10); };
  const blank = () => ({
    step: 0, visited: [0],
    productName: '', category: '', price: '', link: '',
    format: 'ugc', deliverables: [DELIV[0]], presence: 'any',
    platform: '', pubService: 'create_publish', windowFrom: day(14), windowTo: day(21), keepDays: '30', criteria: 'Пост доступен по ссылке весь срок хранения\nЕсть пометка «Реклама» и ссылка на товар',
    title: '', keyPoints: '', mustShow: '', avoid: '', tone: '',
    fee: '6000', creators: '2', days: '10', ship: true, keep: 'keep', rightsScope: 'ads', rightsTerm: '12',
  });
  const D = () => { const s = U.store.s; if (!s.drafts.builder || s.drafts.builder.visited == null) s.drafts.builder = blank(); return s.drafts.builder; };
  const lines = (t) => String(t || '').split('\n').map((x) => x.trim()).filter(Boolean);
  const isPublish = (d) => d.format === 'publish';
  const shipsProduct = (d) => d.ship && !(isPublish(d) && d.pubService === 'publish_ready');

  /* Правила полей: { поле: (d) => текст ошибки | '' } по шагам */
  const RULES = [
    {
      productName: (d) => (d.productName.trim().length < 3 ? 'Укажите название товара' : ''),
      category: (d) => (d.category ? '' : 'Выберите категорию'),
      price: (d) => (d.price !== '' && Number(d.price) < 0 ? 'Цена не может быть отрицательной' : ''),
      link: (d) => (d.link && !/^https?:\/\/\S+\.\S+/.test(d.link) ? 'Ссылка должна начинаться с http:// или https://' : ''),
    },
    {
      deliverables: (d) => (d.deliverables.length ? '' : 'Выберите хотя бы один результат'),
      platform: (d) => (isPublish(d) && !d.platform ? 'Выберите площадку для публикации' : ''),
      windowFrom: (d) => (isPublish(d) && !d.windowFrom ? 'Укажите начало периода' : ''),
      windowTo: (d) => (isPublish(d) && (!d.windowTo || d.windowTo < d.windowFrom) ? 'Конец периода — не раньше начала' : ''),
      criteria: (d) => (isPublish(d) && !lines(d.criteria).length ? 'Добавьте хотя бы один критерий приёмки публикации' : ''),
    },
    {
      title: (d) => (d.title.trim().length < 5 ? 'Название — минимум 5 символов' : ''),
      keyPoints: (d) => (lines(d.keyPoints).length ? '' : 'Добавьте хотя бы один тезис'),
      mustShow: (d) => (lines(d.mustShow).length ? '' : 'Что обязательно должно быть в кадре?'),
    },
    {
      fee: (d) => (!d.fee || Number(d.fee) < 1000 ? 'Минимальный гонорар — 1 000 ₽' : Number(d.fee) > 200000 ? 'Слишком большая сумма для одного ролика' : ''),
      creators: (d) => (!d.creators || Number(d.creators) < 1 || Number(d.creators) > 20 || !Number.isInteger(Number(d.creators)) ? 'Целое число от 1 до 20' : ''),
    },
    {},
  ];
  const stepErrors = (d, i) => { const out = {}; Object.entries(RULES[i]).forEach(([k, fn]) => { const m = fn(d); if (m) out[k] = m; }); return out; };
  const stepReady = (d, i) => Object.keys(stepErrors(d, i)).length === 0;
  const firstInvalid = (d) => [0, 1, 2, 3].find((i) => !stepReady(d, i));
  U.builderRules = { RULES, stepErrors, stepReady, firstInvalid, blank };

  function stepHTML(d) {
    switch (d.step) {
      case 0: return '<div class="form-grid">' +
        '<div class="full">' + U.fieldHTML({ name: 'productName', label: 'Название товара', required: true, value: d.productName, placeholder: 'Например, сыворотка «Ниацинамид 10%», 30 мл' }) + '</div>' +
        U.fieldHTML({ name: 'category', label: 'Категория', required: true, value: d.category, options: [['', 'Выберите категорию']].concat(U.TOPICS.filter((t) => t !== 'Распаковка' && t !== 'Лайфстайл')) }) +
        U.fieldHTML({ name: 'price', label: 'Розничная цена, ₽', type: 'number', value: d.price, attrs: 'inputmode="numeric" min="0"', hint: 'Помогает креатору говорить о товаре точно' }) +
        '<div class="full">' + U.fieldHTML({ name: 'link', label: 'Ссылка на товар', type: 'url', value: d.link, placeholder: 'https://', hint: 'Карточка на маркетплейсе или сайте — необязательно' }) + '</div></div>';
      case 1: return '<fieldset style="border:0;padding:0;margin:0"><legend class="field-label" style="margin-bottom:10px">Формат</legend><div class="option-cards">' +
        '<label class="option-card"><input type="radio" name="format" value="ugc"' + (d.format === 'ugc' ? ' checked' : '') + '><b>UGC без публикации</b><span>Видео остаются у вас: реклама, карточки товара, соцсети бренда.</span></label>' +
        '<label class="option-card"><input type="radio" name="format" value="publish"' + (d.format === 'publish' ? ' checked' : '') + '><b>С публикацией у креатора</b><span>Креатор публикует у себя. Цена — по услуге публикации.</span></label></div></fieldset>' +
        (isPublish(d) ? '<div class="pub-fields"><div class="form-grid">' +
          U.fieldHTML({ name: 'platform', label: 'Площадка', required: true, value: d.platform, options: [['', 'Выберите площадку']].concat(U.PLATFORMS) }) +
          U.fieldHTML({ name: 'pubService', label: 'Услуга', value: d.pubService, options: Object.entries(U.PUB_SERVICES) }) +
          U.fieldHTML({ name: 'windowFrom', label: 'Публикация с', type: 'date', required: true, value: d.windowFrom }) +
          U.fieldHTML({ name: 'windowTo', label: 'Публикация по', type: 'date', required: true, value: d.windowTo }) +
          U.fieldHTML({ name: 'keepDays', label: 'Срок хранения публикации', value: d.keepDays, options: Object.entries(U.KEEP_DAYS) }) + '<span></span>' +
          '<div class="full">' + U.fieldHTML({ name: 'criteria', label: 'Критерии приёмки публикации', required: true, textarea: true, value: d.criteria, hint: 'Каждый критерий — с новой строки. Креатор увидит их до отклика, вы проверите по ним размещение.' }) + '</div></div>' +
          (d.pubService === 'publish_ready' ? '<p class="notice notice-plain">' + I('info') + '<span>Готовый материал предоставляете вы — съёмки и отправки товара нет, срок начинается после оплаты.</span></p>' : '') + '</div>' : '') +
        '<fieldset style="border:0;padding:0;margin:0" aria-describedby="f-deliverables-e"><legend class="field-label" style="margin-bottom:6px">Что сдать <span class="req" aria-hidden="true">*</span></legend>' +
        DELIV.map((x) => '<label class="check"><input type="checkbox" name="deliverables" value="' + E(x) + '"' + (d.deliverables.includes(x) ? ' checked' : '') + '>' + E(x) + '</label>').join('') +
        '<span class="error-text" id="f-deliverables-e" data-error-for="deliverables"></span></fieldset>' +
        U.fieldHTML({ name: 'presence', label: 'Подача в кадре', value: d.presence, options: [['any', 'Не важно'], ['face', 'Лицо в кадре'], ['hands', 'Только руки'], ['voice', 'С закадровой озвучкой']] });
      case 2: return U.fieldHTML({ name: 'title', label: 'Название кампании', required: true, value: d.title, placeholder: 'Например, видеоотзыв на сыворотку', hint: 'Креаторы увидят его в списке брифов' }) +
        U.fieldHTML({ name: 'keyPoints', label: 'Ключевые тезисы', required: true, textarea: true, value: d.keyPoints, placeholder: 'Каждый тезис — с новой строки', hint: 'Что зритель должен понять о товаре' }) +
        U.fieldHTML({ name: 'mustShow', label: 'Обязательно показать', required: true, textarea: true, value: d.mustShow, placeholder: 'Например: флакон с этикеткой в первые 3 секунды' }) +
        U.fieldHTML({ name: 'avoid', label: 'Чего избегать', textarea: true, value: d.avoid, placeholder: 'Например: медицинские обещания, чужие бренды в кадре' }) +
        U.fieldHTML({ name: 'tone', label: 'Тон', value: d.tone, placeholder: 'Например: спокойно и честно, как совет подруге' });
      case 3: {
        const ready = isPublish(d) && d.pubService === 'publish_ready';
        return '<div class="form-grid">' +
          U.fieldHTML({ name: 'fee', label: 'Гонорар одному креатору, ₽', required: true, type: 'number', value: d.fee, attrs: 'inputmode="numeric" min="1000" step="500"', hint: isPublish(d) ? 'Сверьте с ценой услуги публикации в профиле креатора' : 'В каталоге видео стоит от 4 500 до 9 000 ₽' }) +
          U.fieldHTML({ name: 'creators', label: 'Сколько креаторов', required: true, type: 'number', value: d.creators, attrs: 'inputmode="numeric" min="1" max="20"', hint: 'От 1 до 20' }) +
          (ready ? '' : U.fieldHTML({ name: 'days', label: 'Срок съёмки, календарных дней', value: d.days, options: U.config.shootDaysOptions.map((n) => [n, U.T.days(n, 'calendar')]) }) + '<span></span>') +
          (ready ? '' : '<div class="full"><label class="check"><input type="checkbox" name="ship"' + (d.ship ? ' checked' : '') + '>Отправить товар креатору — доставка ≈ ' + U.moneyText(U.config.deliveryEstimate) + ' за отправку (оценка)</label>' +
          '<p class="hint" id="start-rule">' + (d.ship ? 'Срок съёмки начнётся после того, как креатор подтвердит получение товара.' : 'Без доставки срок съёмки начнётся после оплаты заказа.') + '</p></div>' +
          '<fieldset class="full keep-fs" style="border:0;padding:0;margin:0"' + (d.ship ? '' : ' disabled') + '><legend class="field-label" style="margin-bottom:6px">После съёмки товар</legend>' +
          '<label class="check"><input type="radio" name="keep" value="keep"' + (d.keep === 'keep' ? ' checked' : '') + '>Остаётся у креатора</label><label class="check"><input type="radio" name="keep" value="return"' + (d.keep === 'return' ? ' checked' : '') + '>Нужно вернуть — обратная доставка ≈ ' + U.moneyText(U.config.returnEstimate) + ' за ваш счёт (оценка)</label></fieldset>') +
          U.fieldHTML({ name: 'rightsScope', label: 'Права: где используете', value: d.rightsScope, options: Object.entries(U.RIGHTS_SCOPE) }) +
          U.fieldHTML({ name: 'rightsTerm', label: 'Права: срок', value: d.rightsTerm, options: Object.entries(U.RIGHTS_TERM) }) +
          '<p class="hint full">Включено правок: ' + U.config.revisionsIncluded + ', на каждую — ' + U.T.days(U.config.revisionDays, 'calendar') + '. Проверка версии — ' + U.T.days(U.config.reviewDays, 'business') + '.</p></div>';
      }
      case 4: return review(d);
    }
  }

  /* Экран проверки: все условия, переход к правке каждой группы */
  function review(d) {
    const t = U.T.snapshot(toCampaign(d), U.config);
    const b = budget(d);
    const grp = (step, title, body) => {
      const ok = stepReady(d, step);
      return '<section class="rv-group' + (ok ? '' : ' is-bad') + '" aria-labelledby="rv-' + step + '"><div class="rv-head"><h3 id="rv-' + step + '">' + title + '</h3>' +
        (ok ? '' : '<span class="status status-danger">Есть незаполненные поля</span>') +
        '<button type="button" class="btn btn-sm btn-ghost" data-goto="' + step + '" aria-label="Изменить: ' + title + '">' + I('edit', 'icon-sm') + 'Изменить</button></div>' + body + '</section>';
    };
    const dl = (rows) => '<dl class="kv kv-left">' + rows.map(([k, v]) => '<dt>' + E(k) + '</dt><dd>' + (v ? E(v) : '<span class="muted">не указано</span>') + '</dd>').join('') + '</dl>';
    const ul = (arr, icon) => arr.length ? '<ul class="brief-list">' + arr.map((x) => '<li>' + I(icon) + '<span>' + E(x) + '</span></li>').join('') + '</ul>' : '<p class="muted small">не указано</p>';
    return grp(0, 'Товар', dl([['Название', d.productName], ['Категория', d.category], ['Цена', d.price ? U.moneyText(Number(d.price)) : ''], ['Ссылка', d.link]])) +
      grp(1, 'Формат и материалы', dl([['Формат', isPublish(d) ? 'С публикацией у креатора' : 'UGC без публикации'], ['Подача', { any: 'Не важно', face: 'Лицо в кадре', hands: 'Только руки', voice: 'С закадровой озвучкой' }[d.presence]]].concat(isPublish(d) ? [['Площадка', d.platform], ['Услуга', U.PUB_SERVICES[d.pubService]], ['Период', d.windowFrom && d.windowTo ? U.date(d.windowFrom) + ' — ' + U.date(d.windowTo) : ''], ['Хранение', U.KEEP_DAYS[d.keepDays]]] : [])) +
        '<h4 class="rv-sub">Что сдать</h4>' + ul(d.deliverables, 'check') + (isPublish(d) ? '<h4 class="rv-sub">Критерии приёмки публикации</h4>' + ul(lines(d.criteria), 'check') : '')) +
      grp(2, 'Бриф', dl([['Название', d.title], ['Тон', d.tone]]) + '<h4 class="rv-sub">Ключевые тезисы</h4>' + ul(lines(d.keyPoints), 'message') + '<h4 class="rv-sub">Обязательно показать</h4>' + ul(lines(d.mustShow), 'eye') + '<h4 class="rv-sub">Чего избегать</h4>' + ul(lines(d.avoid), 'x')) +
      grp(3, 'Условия', dl([['Креаторов', d.creators], ['Гонорар', d.fee ? U.moneyText(Number(d.fee)) : '']].concat(U.T.rows(t)))) +
      '<section class="rv-group"><div class="rv-head"><h3>Расчёт</h3></div>' + budgetHTML(b, d) + '</section>' +
      '<div class="notice notice-plain">' + I('info') + '<span>Публикация брифа ничего не списывает. Вы оплачиваете каждый заказ отдельно, когда креатор примет предложение.</span></div>';
  }

  function toCampaign(d) {
    return {
      format: d.format, shootDays: Number(d.days) || 10, shipProduct: shipsProduct(d), returnProduct: shipsProduct(d) && d.keep === 'return',
      rights: { scope: d.rightsScope, term: d.rightsTerm }, deliverables: d.deliverables.slice(), revisionsIncluded: U.config.revisionsIncluded,
      publication: isPublish(d) ? { platform: d.platform || '—', service: d.pubService, windowFrom: d.windowFrom ? new Date(d.windowFrom + 'T10:00:00').toISOString() : null, windowTo: d.windowTo ? new Date(d.windowTo + 'T20:00:00').toISOString() : null, keepDays: d.keepDays, criteria: lines(d.criteria) } : null,
    };
  }
  const budget = (d) => U.T.budget({ fee: d.fee, n: d.creators, ship: shipsProduct(d), returnProduct: shipsProduct(d) && d.keep === 'return' }, U.config);
  function budgetHTML(b, d) {
    return '<dl class="kv"><dt>Гонорар</dt><dd>' + U.money(b.fee) + '</dd><dt>Сервисный сбор ' + Math.round(U.config.serviceFeeRate * 100) + '%</dt><dd>' + U.money(b.commission) + '</dd>' +
      '<dt>Доставка креатору' + (b.delivery ? ', оценка' : '') + '</dt><dd>' + (b.delivery ? U.money(b.delivery) : 'не нужна') + '</dd>' +
      (shipsProduct(d) ? '<dt>Обратная доставка' + (b.returnCost ? ', оценка' : '') + '</dt><dd>' + (b.returnCost ? U.money(b.returnCost) : 'не нужна') + '</dd>' : '') +
      '<dt class="total">За одного креатора</dt><dd class="total">' + U.money(b.perCreator) + '</dd></dl>' +
      '<hr class="divider" style="margin:4px 0"><dl class="kv"><dt>Креаторов</dt><dd class="num">× ' + b.n + '</dd><dt class="total">Бюджет кампании' + (b.estimated ? ' ≈' : '') + '</dt><dd class="total">' + U.money(b.total) + '</dd></dl>' +
      '<p class="hint">Включено: гонорар креатору, сбор платформы (резервирование оплаты, поддержка, хранение материалов)' + (b.estimated ? ' и доставка по оценке — точная сумма зависит от перевозчика' : '') + '. Ставки — параметры прототипа.</p>';
  }
  function summary(d) {
    return '<aside class="panel wizard-summary" aria-labelledby="sum-h"><div class="panel-head"><h2 id="sum-h">Расчёт</h2><span class="proto-flag">прототип</span></div><div class="panel-body" style="display:grid;gap:12px">' + budgetHTML(budget(d), d) + '</div></aside>';
  }
  function nav(d) {
    return STEPS.map((s, i) => {
      const visited = d.visited.includes(i);
      const ready = i < 4 && visited && stepReady(d, i);
      const bad = i < 4 && visited && i !== d.step && !stepReady(d, i);
      const state = ready ? ' — заполнен' : bad ? ' — есть ошибки' : '';
      return '<li><button type="button" data-goto="' + i + '"' + (i === d.step ? ' aria-current="step"' : '') + ' class="' + (ready && i !== d.step ? 'is-done' : '') + (bad ? ' is-bad' : '') + '"' + (!visited ? ' disabled' : '') + '><span class="n">' + (bad ? '!' : ready && i !== d.step ? I('check', 'icon-sm') : i + 1) + '</span>' + s + '<span class="sr-only">' + state + '</span></button></li>';
    }).join('');
  }

  /* Считать значения текущего шага в черновик */
  function read(form, d) {
    const el = form.elements;
    const v = (n) => (el[n] ? el[n].value : d[n]);
    ({
      0: () => Object.assign(d, { productName: v('productName'), category: v('category'), price: v('price'), link: v('link').trim() }),
      1: () => Object.assign(d, { format: (form.querySelector('[name=format]:checked') || { value: d.format }).value, deliverables: [...form.querySelectorAll('[name=deliverables]:checked')].map((x) => x.value), presence: v('presence'), platform: v('platform'), pubService: v('pubService'), windowFrom: v('windowFrom'), windowTo: v('windowTo'), keepDays: v('keepDays'), criteria: v('criteria') }),
      2: () => Object.assign(d, { title: v('title'), keyPoints: v('keyPoints'), mustShow: v('mustShow'), avoid: v('avoid'), tone: v('tone') }),
      3: () => Object.assign(d, { fee: v('fee'), creators: v('creators'), days: v('days'), ship: el.ship ? el.ship.checked : d.ship, keep: (form.querySelector('[name=keep]:checked') || { value: d.keep }).value, rightsScope: v('rightsScope'), rightsTerm: v('rightsTerm') }),
      4: () => {},
    })[d.step]();
  }
  /* Показать ошибки текущего шага в форме */
  function showErrors(form, d) {
    const errs = stepErrors(d, d.step);
    const rules = {};
    Object.keys(RULES[d.step]).forEach((k) => { rules[k] = () => errs[k] || ''; });
    return U.validate(form, rules);
  }

  U.pages.builder = {
    shell: 'app',
    title: 'Новая кампания',
    render() {
      if (U.store.s.role === 'creator') return '<div class="page"><div class="empty">' + I('lock') + '<h1 class="t-h3">Раздел для заказчиков</h1><p>Кампании создают продавцы. Переключите роль на «Заказчик» в верхней полосе прототипа.</p></div></div>';
      const d = D();
      return '<div class="page"><nav class="crumbs" aria-label="Навигация"><a href="#/campaigns">Кампании</a>' + I('chevron-right') + '<span aria-current="page">Новая кампания</span></nav>' +
        '<div class="page-head"><div><h1>Новая кампания</h1><p class="sub">Шаг ' + (d.step + 1) + ' из ' + STEPS.length + ' · черновик сохраняется автоматически</p></div>' +
        '<div class="page-head-actions"><button class="btn btn-ghost btn-sm" type="button" data-bclear>Очистить черновик</button></div></div>' +
        '<div class="wizard"><ol class="wizard-nav" aria-label="Шаги" id="wiz-nav">' + nav(d) + '</ol>' +
        '<form class="wizard-form" id="wiz" novalidate><section class="panel" aria-labelledby="wiz-h"><div class="panel-head"><h2 id="wiz-h" tabindex="-1">' + STEPS[d.step] + '</h2></div><div class="panel-body">' + stepHTML(d) + '</div></section>' +
        '<div class="wizard-foot">' + (d.step ? '<button class="btn" type="button" data-prev>' + I('arrow-left') + 'Назад</button>' : '<span></span>') +
        (d.step < 4 ? '<button class="btn btn-primary" type="submit">Далее ' + I('arrow-right') + '</button>' : '<button class="btn btn-primary" type="submit" data-publish>Опубликовать бриф</button>') + '</div></form>' +
        (d.step < 4 ? summary(d) : '') + '</div></div>';
    },
    mount(root) {
      const form = root.querySelector('#wiz');
      if (!form) return;
      const d = D();
      const refresh = () => {
        root.querySelector('#wiz-nav').innerHTML = nav(d);
        const sm = root.querySelector('.wizard-summary');
        if (sm) sm.outerHTML = summary(d);
      };
      const save = () => { read(form, d); U.store.save(); };
      const go = (i, focusField) => {
        if (!d.visited.includes(i)) d.visited.push(i);
        d.step = i; U.store.save(); U.rerender();
        window.scrollTo(0, 0);
        const ff = focusField && document.querySelector('#wiz .input, #wiz .select, #wiz .textarea, #wiz input');
        (ff || document.getElementById('wiz-h')).focus();
        if (focusField && i < 4 && d.visited.includes(i) && !stepReady(d, i)) showErrors(document.querySelector('#wiz'), d);
      };
      form.addEventListener('input', () => { save(); refresh(); });
      form.addEventListener('change', (e) => {
        save();
        // Переключение формата/услуги меняет набор полей
        if (e.target.name === 'format' || e.target.name === 'pubService') { U.rerender(); document.querySelector('[name="' + e.target.name + '"]' + (e.target.type === 'radio' ? ':checked' : '')).focus(); return; }
        if (e.target.name === 'ship') {
          const fs = form.querySelector('.keep-fs'); if (fs) fs.disabled = !e.target.checked;
          const hint = form.querySelector('#start-rule');
          if (hint) hint.textContent = e.target.checked ? 'Срок съёмки начнётся после того, как креатор подтвердит получение товара.' : 'Без доставки срок съёмки начнётся после оплаты заказа.';
        }
        refresh();
      });
      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        save();
        if (d.step < 4) {
          if (!showErrors(form, d)) { refresh(); return; }
          return go(d.step + 1);
        }
        // Публикация: проверяем всю кампанию заново
        const bad = firstInvalid(d);
        if (bad !== undefined) {
          U.toast('Кампания не готова к публикации', 'Шаг «' + STEPS[bad] + '»: заполните отмеченные поля', 'error');
          return go(bad, true);
        }
        await U.busy(form.querySelector('[data-publish]'), 900);
        let id;
        U.store.update((s) => {
          id = 'cmp' + (s.campaigns.length + 1) + '-' + Date.now().toString(36).slice(-4);
          const c = toCampaign(d);
          s.campaigns.push(Object.assign(c, {
            id, brandId: 'b1', status: 'recruiting', createdAt: new Date().toISOString(), title: d.title.trim(),
            product: { name: d.productName.trim(), category: d.category, price: Number(d.price) || 0, link: d.link, media: CAT_MEDIA[d.category] || 'p-box-give' },
            fee: Number(d.fee), creatorsNeeded: Number(d.creators),
            keyPoints: lines(d.keyPoints), mustShow: lines(d.mustShow), avoid: lines(d.avoid), tone: d.tone.trim() || 'На усмотрение креатора',
          }));
          s.drafts.builder = null;
        });
        U.toast('Бриф опубликован', 'Креаторы увидят его в кабинете. Отклики появятся на странице кампании.');
        U.go('campaigns/' + id);
      });
      root.querySelectorAll('[data-goto]').forEach((b) => b.addEventListener('click', () => { save(); go(Number(b.dataset.goto), b.closest('.rv-group')); }));
      root.querySelector('#wiz-nav').addEventListener('click', (e) => { const b = e.target.closest('[data-goto]'); if (b && !b.dataset.bound) { save(); go(Number(b.dataset.goto)); } });
      root.querySelectorAll('#wiz-nav [data-goto]').forEach((b) => { b.dataset.bound = '1'; });
      const prev = root.querySelector('[data-prev]');
      if (prev) prev.addEventListener('click', () => { save(); go(d.step - 1); });
      root.querySelector('[data-bclear]').addEventListener('click', async () => {
        const ok = await U.confirm({ title: 'Очистить черновик?', text: 'Все введённые данные кампании будут удалены.', ok: 'Очистить', danger: true });
        if (!ok) return;
        U.store.update((s) => { s.drafts.builder = blank(); });
        U.rerender();
        U.toast('Черновик очищен');
      });
    },
  };
})();
