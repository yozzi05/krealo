/* Общие помощники интерфейса: форматирование, медиа, модальные окна, уведомления. */
(function () {
  const I = U.icon;
  const reduceMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  U.reduceMotion = reduceMotion;

  /* ---------- Форматирование ---------- */
  U.esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const nf = new Intl.NumberFormat('ru-RU');
  U.money = (n) => '<span class="money nowrap">' + nf.format(Math.round(n)) + ' ₽</span>';
  U.moneyText = (n) => nf.format(Math.round(n)) + ' ₽';
  U.num = (n) => nf.format(n);
  U.plural = (n, f) => {
    const a = Math.abs(n) % 100, b = a % 10;
    return f[a > 10 && a < 20 ? 2 : b > 1 && b < 5 ? 1 : b === 1 ? 0 : 2];
  };
  const dShort = new Intl.DateTimeFormat('ru-RU', { day: 'numeric', month: 'short' });
  const dTime = new Intl.DateTimeFormat('ru-RU', { hour: '2-digit', minute: '2-digit' });
  U.date = (iso) => (iso ? dShort.format(new Date(iso)).replace('.', '') : '—');
  U.dateTime = (iso) => (iso ? U.date(iso) + ', ' + dTime.format(new Date(iso)) : '—');
  U.daysLeft = (iso) => {
    const a = new Date(); a.setHours(0, 0, 0, 0);
    const b = new Date(iso); b.setHours(0, 0, 0, 0);
    return Math.round((b - a) / 86400000);
  };
  U.deadlineText = (iso) => {
    const d = U.daysLeft(iso);
    if (d === 0) return 'сегодня';
    if (d === 1) return 'завтра';
    if (d > 1) return 'через ' + d + ' ' + U.plural(d, ['день', 'дня', 'дней']);
    return 'просрочен на ' + -d + ' ' + U.plural(-d, ['день', 'дня', 'дней']);
  };
  U.initials = (name) => name.split(' ').map((p) => p[0]).slice(0, 2).join('');

  /* ---------- Медиа ---------- */
  U.img = function (id, w, h, cls, alt) {
    const m = U.media[id];
    if (!m) return '<div class="media-fallback">' + I('image') + '<span>Нет изображения</span></div>';
    const src = U.mediaUrl(id, w, h);
    const src2 = U.mediaUrl(id, w * 2, h ? h * 2 : 0);
    return '<img src="' + src + '" srcset="' + src + ' 1x, ' + src2 + ' 2x" alt="' + U.esc(alt != null ? alt : m.alt) + '" loading="lazy" decoding="async" style="object-position:' + m.pos + '"' + (cls ? ' class="' + cls + '"' : '') + ' data-media-img>';
  };

  /* Кадр 9:16 (или иной). Видео — постер + кнопка воспроизведения, открывает плеер. */
  U.frame = function (id, o = {}) {
    const m = U.media[id];
    const w = o.w || 360, h = o.h || Math.round(w * (o.ratio || 16 / 9));
    const isVideo = m && m.kind === 'video';
    const label = o.label ? '<span class="frame-label">' + o.label + '</span>' : '';
    const top = o.top ? '<div class="frame-top">' + o.top + '</div>' : '';
    let action = '';
    // Работа из портфолио открывается с описанием (название, формат, задача)
    const act = o.creator ? 'data-action="open-work" data-creator="' + o.creator + '"' : 'data-action="play"';
    if (isVideo && o.play !== false) {
      action = '<button class="play-btn" type="button" ' + act + ' data-media="' + id + '" data-caption="' + U.esc(o.caption || m.alt) + '" aria-label="Смотреть видео: ' + U.esc(o.caption || m.alt) + '">' + I('play') + '</button>';
    } else if (o.zoom) {
      action = '<button class="frame-btn" type="button" ' + act + ' data-media="' + id + '" data-caption="' + U.esc(o.caption || (m && m.alt) || '') + '" aria-label="Открыть: ' + U.esc(o.caption || (m && m.alt) || '') + '"></button>';
    }
    return '<figure class="frame ' + (o.cls || '') + (label || o.scrim ? ' frame-scrim' : '') + '">' +
      U.img(id, w, h, '', o.alt) + top + label + action + '</figure>';
  };

  /* Аватар креатора */
  U.avatar = function (c, size = 40, cls = '') {
    if (!c) return '';
    if (!c.avatar) return '<span class="avatar avatar-initials ' + cls + '" style="width:' + size + 'px;height:' + size + 'px" aria-hidden="true">' + U.esc(U.initials(c.name)) + '</span>';
    return '<img class="avatar ' + cls + '" style="width:' + size + 'px;height:' + size + 'px;object-position:' + (U.media[c.avatar] || {}).pos + '" src="' + U.mediaUrl(c.avatar, size * 2, size * 2) + '" alt="" loading="lazy" data-media-img>';
  };
  U.brandAvatar = function (b, size = 40) {
    return '<span class="avatar avatar-initials" style="width:' + size + 'px;height:' + size + 'px" aria-hidden="true">' + U.esc(b.initials) + '</span>';
  };

  /* Фолбэк для недоступных изображений */
  document.addEventListener('error', (e) => {
    const t = e.target;
    if (t.tagName === 'IMG' && t.hasAttribute('data-media-img') && !t.dataset.failed) {
      t.dataset.failed = '1';
      if (t.classList.contains('avatar')) { t.style.visibility = 'hidden'; return; }
      const fb = document.createElement('div');
      fb.className = 'media-fallback';
      fb.innerHTML = I('image') + '<span>Изображение недоступно</span><span class="sr-only">' + U.esc(t.alt) + '</span>';
      t.replaceWith(fb);
    }
    if (t.tagName === 'VIDEO' && !t.dataset.failed) {
      t.dataset.failed = '1';
      const wrap = t.parentElement;
      const fb = document.createElement('div');
      fb.className = 'media-fallback';
      fb.innerHTML = I('video') + '<span>Видео не загрузилось. Показан постер, попробуйте позже.</span>';
      t.style.display = 'none';
      if (wrap) wrap.appendChild(fb);
    }
  }, true);

  /* Одновременно играет только одно видео */
  document.addEventListener('play', (e) => {
    document.querySelectorAll('video').forEach((v) => { if (v !== e.target && !v.paused) v.pause(); });
  }, true);

  /* ---------- Уведомления ---------- */
  U.toast = function (title, text, type = 'success') {
    const host = document.getElementById('toasts');
    const el = document.createElement('div');
    el.className = 'toast toast-' + type;
    el.setAttribute('role', type === 'error' ? 'alert' : 'status');
    el.innerHTML = I(type === 'error' ? 'alert' : 'check-circle') + '<div><strong>' + U.esc(title) + '</strong>' + (text ? '<span class="muted">' + U.esc(text) + '</span>' : '') + '</div>';
    host.appendChild(el);
    setTimeout(() => el.remove(), 5200);
  };

  /* ---------- Модальные окна на <dialog> ---------- */
  U.modal = {
    open({ title, body, foot = '', cls = '', onMount, onClose, label }) {
      const d = document.createElement('dialog');
      const id = 'm' + Math.random().toString(36).slice(2, 8);
      d.className = 'modal ' + cls;
      d.setAttribute('aria-labelledby', id + '-t');
      d.innerHTML = '<div class="modal-head"><h2 id="' + id + '-t">' + title + '</h2>' +
        '<button type="button" class="btn btn-ghost btn-icon btn-sm" data-close aria-label="Закрыть">' + I('x') + '</button></div>' +
        '<div class="modal-body">' + body + '</div>' + (foot ? '<div class="modal-foot">' + foot + '</div>' : '');
      const opener = document.activeElement;
      document.body.appendChild(d);
      d.addEventListener('click', (e) => {
        if (e.target === d) d.close(); // клик по подложке
        if (e.target.closest('[data-close]')) d.close();
      });
      // Очистка идемпотентна: срабатывает по событию close и страхуется прямым вызовом
      let cleaned = false;
      const cleanup = () => {
        if (cleaned) return;
        cleaned = true;
        d.querySelectorAll('video').forEach((v) => v.pause());
        d.remove();
        onClose && onClose();
        if (opener && document.contains(opener)) opener.focus();
      };
      d.addEventListener('close', cleanup);
      const nativeClose = d.close.bind(d);
      d.close = (v) => { if (d.open) nativeClose(v); cleanup(); };
      d.showModal();
      const first = d.querySelector('[autofocus]') || d.querySelector('.modal-body input, .modal-body textarea, .modal-body select, .modal-body button, .modal-foot .btn-primary');
      if (first) first.focus();
      onMount && onMount(d);
      return d;
    },
  };

  /* Плеер / просмотр медиа */
  U.lightbox = function (id, caption, details) {
    const m = U.media[id];
    if (!m) return;
    const h = Math.max(240, Math.min(window.innerHeight - 160, 720));
    const w = Math.round(h * 9 / 16);
    const body = m.kind === 'video'
      ? '<div class="frame" style="width:' + w + 'px;max-width:calc(100vw - 48px)"><video controls playsinline autoplay preload="metadata" poster="' + U.mediaUrl(id, 540) + '" style="object-position:' + m.pos + '"><source src="' + m.src + '" type="video/mp4">Ваш браузер не поддерживает видео.</video></div>'
      : '<div class="frame" style="width:' + w + 'px;max-width:calc(100vw - 48px)">' + U.img(id, 540, 960) + '</div>';
    U.modal.open({
      title: U.esc(caption || m.alt),
      body: details ? '<div class="media-detail">' + body + '<div class="media-detail-info">' + details + '</div></div>' : body,
      cls: 'modal-media on-dark' + (details ? ' modal-media-wide' : ''),
    });
  };

  /* Подтверждение */
  U.confirm = function ({ title, text, ok = 'Подтвердить', danger = false }) {
    return new Promise((resolve) => {
      let result = false;
      const d = U.modal.open({
        title: U.esc(title), body: '<p>' + text + '</p>',
        foot: '<button class="btn" type="button" data-close>Отмена</button><button class="btn ' + (danger ? 'btn-dark' : 'btn-primary') + '" type="button" data-ok>' + U.esc(ok) + '</button>',
        onClose: () => resolve(result),
      });
      d.querySelector('[data-ok]').addEventListener('click', () => { result = true; d.close(); });
    });
  };

  /* Имитация сетевой задержки для действий */
  U.busy = function (btn, ms = 700) {
    return new Promise((r) => {
      if (btn) { btn.classList.add('is-loading'); btn.setAttribute('aria-busy', 'true'); }
      setTimeout(() => { if (btn) { btn.classList.remove('is-loading'); btn.removeAttribute('aria-busy'); } r(); }, reduceMotion() ? 300 : ms);
    });
  };

  /* ---------- Статусы ---------- */
  U.stagePill = function (o) {
    const map = {
      agreement: ['status-warning', 'Ожидает оплаты'],
      shipping: ['status-warning', 'Ожидает отправки'],
      in_transit: ['status-info', 'Товар в пути'],
      production: ['status-info', 'Съёмка'],
      review: ['status-accent', 'Материалы на проверке'],
      revision: ['status-warning', 'Правки'],
      publishing: ['status-info', o.publication && o.publication.url ? 'Публикация на проверке' : 'Ждём публикацию'],
      accepted: ['status-success', 'Работа принята'],
      cancelled: ['', 'Отменён'],
    };
    const [c, t] = map[o.stage] || ['', o.stage];
    return '<span class="status ' + c + '">' + t + '</span>';
  };
  U.paymentInfo = function (o) {
    const p = o.payment;
    if (p.status === 'unpaid') return { cls: 'status-warning', text: 'Не оплачен', hint: 'Креатор начнёт работу после оплаты' };
    if (p.status === 'held') return { cls: 'status-info', text: 'Зарезервировано', hint: o.terms.format === 'publish' ? 'Деньги удерживаются до подтверждения публикации' : 'Деньги удерживаются до приёмки работы' };
    if (p.status === 'released' && p.payoutStatus === 'processing') return { cls: 'status-warning', text: 'Выплата в обработке', hint: 'Работа принята, выплата — до ' + U.T.daysGen(U.config.payoutDays, 'business') };
    if (p.status === 'released' && p.payoutStatus === 'paid') return { cls: 'status-success', text: 'Выплачено креатору', hint: 'Выплата проведена ' + U.date(p.payoutAt) };
    if (p.status === 'refunded') return { cls: '', text: 'Возвращено', hint: 'Средства возвращены заказчику' };
    return { cls: '', text: '—', hint: '' };
  };
  U.payPill = function (o) {
    const p = U.paymentInfo(o);
    return '<span class="status ' + p.cls + '">' + p.text + '</span>';
  };
  U.verifyLine = function (c) {
    if (c.verification === 'verified') return '<div class="verify">' + I('shield') + '<span><strong>Проверен.</strong> ' + U.esc(c.verifyNote) + '</span></div>';
    if (c.verification === 'needs_info') return '<div class="verify is-pending">' + I('alert') + '<span><strong>Нужны дополнения.</strong> ' + U.esc(c.verifyNote) + '</span></div>';
    return '<div class="verify is-pending">' + I('shield-clock') + '<span><strong>На проверке.</strong> ' + U.esc(c.verifyNote) + '</span></div>';
  };
  U.ratingLine = function (c) {
    if (!c.completed) return '<span class="muted small">Новый креатор — пока нет завершённых заказов</span>';
    return '<span class="rating">' + I('star') + String(c.rating).replace('.', ',') + '</span><span class="muted small num">' + c.completed + ' ' + U.plural(c.completed, ['завершённый заказ', 'завершённых заказа', 'завершённых заказов']) + '</span>';
  };

  /* ---------- Валидация форм ---------- */
  U.validate = function (form, rules) {
    let firstBad = null;
    Object.keys(rules).forEach((name) => {
      const el = form.elements[name];
      if (!el) return;
      const val = (el.type === 'checkbox') ? el.checked : (el.value || '').trim();
      const msg = rules[name](val, el);
      const node = el.length && !el.tagName ? el[0] : el;
      const err = form.querySelector('[data-error-for="' + name + '"]');
      if (msg) {
        (el.length && !el.tagName ? [...el] : [el]).forEach((x) => x.setAttribute('aria-invalid', 'true'));
        if (err) err.innerHTML = I('alert', 'icon-sm') + '<span>' + U.esc(msg) + '</span>';
        if (!firstBad) firstBad = node;
      } else {
        (el.length && !el.tagName ? [...el] : [el]).forEach((x) => x.removeAttribute('aria-invalid'));
        if (err) err.innerHTML = '';
      }
    });
    if (firstBad) firstBad.focus();
    return !firstBad;
  };
  U.fieldHTML = function ({ name, label, type = 'text', value = '', placeholder = '', hint = '', required = false, attrs = '', textarea = false, options = null }) {
    const id = 'f-' + name;
    const desc = (hint ? id + '-h ' : '') + id + '-e';
    let ctrl;
    if (options) {
      ctrl = '<select class="select" id="' + id + '" name="' + name + '" aria-describedby="' + desc + '" ' + attrs + '>' + options.map((o) => {
        const [v, t] = Array.isArray(o) ? o : [o, o];
        return '<option value="' + U.esc(v) + '"' + (String(v) === String(value) ? ' selected' : '') + '>' + U.esc(t) + '</option>';
      }).join('') + '</select>';
    } else if (textarea) {
      ctrl = '<textarea class="textarea" id="' + id + '" name="' + name + '" placeholder="' + U.esc(placeholder) + '" aria-describedby="' + desc + '" ' + attrs + '>' + U.esc(value) + '</textarea>';
    } else {
      ctrl = '<input class="input" id="' + id + '" name="' + name + '" type="' + type + '" value="' + U.esc(value) + '" placeholder="' + U.esc(placeholder) + '" aria-describedby="' + desc + '" ' + attrs + '>';
    }
    return '<div class="field"><label for="' + id + '">' + label + (required ? ' <span class="req" aria-hidden="true">*</span><span class="sr-only">(обязательно)</span>' : '') + '</label>' + ctrl +
      (hint ? '<span class="hint" id="' + id + '-h">' + hint + '</span>' : '') +
      '<span class="error-text" id="' + id + '-e" data-error-for="' + name + '" aria-live="polite"></span></div>';
  };
})();

/* Срок текущего этапа заказа — одна формулировка для всех экранов */
U.due = (o) => U.T.due(o, U.date);
U.dueTone = (o) => {
  const d = U.due(o);
  if (!d.date || d.kind === 'done' || d.kind === 'pending') return '';
  const left = U.daysLeft(d.date);
  return left < 0 ? 'is-late' : left <= 1 ? 'is-soon' : '';
};
/* Работа портфолио по id медиа */
U.work = (c, mediaId) => (c.portfolio || []).find((w) => w.media === mediaId);
U.workDetails = function (c, w) {
  const m = U.media[w.media];
  return '<p class="md-kicker">' + (m.kind === 'video' ? 'Видео · <span class="num">' + m.dur + '</span>' : 'Фото') + ' · ' + U.esc(w.format) + '</p>' +
    '<h3 class="md-title">' + U.esc(w.title) + '</h3>' +
    '<dl class="md-dl"><dt>Категория</dt><dd>' + U.esc(w.category) + '</dd><dt>Задача</dt><dd>' + U.esc(w.task) + '</dd><dt>Автор</dt><dd>' + U.esc(c.name) + ', ' + U.esc(c.city) + '</dd></dl>' +
    '<p class="md-note">Демо-материал со стока, использован как пример работы. Имя и задача вымышлены.</p>';
};
U.openWork = function (cid, mediaId) {
  const c = U.q.creator(cid);
  const w = c && U.work(c, mediaId);
  if (!w) return U.lightbox(mediaId);
  U.lightbox(mediaId, w.title, U.workDetails(c, w));
};
U.actions = U.actions || {};
U.actions['open-work'] = (el) => U.openWork(el.dataset.creator, el.dataset.media);
