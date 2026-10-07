/* Анкета креатора и список источников медиа */
(function () {
  const I = U.icon, E = U.esc;

  U.pages.join = {
    shell: 'site',
    title: 'Стать креатором',
    render() {
      return '<section class="wrap page-pad"><div class="join">' +
        '<div><span class="t-eyebrow">Для креаторов</span><h1 style="margin-top:16px">Заявка креатора</h1><p class="t-lead" style="margin-top:16px;max-width:40ch">Расскажите, что снимаете. Модератор посмотрит портфолио и ответит в течение 2 рабочих дней.</p>' +
        '<div class="creators-photos" style="margin-top:32px;max-width:440px">' + U.frame('p-phone-model', { w: 300 }) + U.frame('p-phone-shoot', { w: 240 }) + '</div></div>' +
        '<div id="join-box"><form class="panel" id="join-form" novalidate><div class="panel-body" style="display:grid;gap:16px">' +
        '<div class="form-grid">' + U.fieldHTML({ name: 'name', label: 'Имя и фамилия', required: true, attrs: 'autocomplete="name"' }) +
        U.fieldHTML({ name: 'city', label: 'Город', required: true, attrs: 'autocomplete="address-level2"' }) + '</div>' +
        U.fieldHTML({ name: 'email', label: 'Электронная почта', type: 'email', required: true, attrs: 'autocomplete="email"', hint: 'Сюда придёт ответ модератора' }) +
        '<fieldset style="border:0;padding:0;margin:0" aria-describedby="f-topics-e"><legend class="field-label" style="margin-bottom:8px">Тематики <span class="req" aria-hidden="true">*</span></legend><div class="row-wrap">' +
        U.TOPICS.map((t) => '<label class="chip" style="cursor:pointer"><input type="checkbox" name="topics" value="' + E(t) + '" class="sr-only">' + E(t) + '</label>').join('') +
        '</div><span class="error-text" id="f-topics-e" data-error-for="topics"></span></fieldset>' +
        U.fieldHTML({ name: 'portfolio', label: 'Ссылка на портфолио', type: 'url', required: true, placeholder: 'https://', hint: 'Облачная папка, профиль в соцсети или сайт — 3–5 вертикальных видео' }) +
        '<label class="check"><input type="checkbox" name="selfemployed">У меня есть статус самозанятого или ИП</label>' +
        '<label class="check"><input type="checkbox" name="consent" aria-describedby="f-consent-e">Согласен на обработку персональных данных для рассмотрения заявки</label><span class="error-text" id="f-consent-e" data-error-for="consent"></span>' +
        '<p class="hint">Подписчики не обязательны. В прототипе заявка сохраняется только в вашем браузере и появляется в админ-панели.</p>' +
        '<button class="btn btn-primary btn-lg" type="submit">Отправить заявку</button></div></form></div></div></section>';
    },
    mount(root) {
      const f = root.querySelector('#join-form');
      f.addEventListener('submit', async (e) => {
        e.preventDefault();
        const ok = U.validate(f, {
          name: (v) => (v.length < 2 ? 'Укажите имя' : ''),
          city: (v) => (v.length < 2 ? 'Укажите город' : ''),
          email: (v) => (!v ? 'Укажите почту' : /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? '' : 'Проверьте адрес — например, name@mail.ru'),
          topics: () => (f.querySelectorAll('[name=topics]:checked').length ? '' : 'Выберите хотя бы одну тематику'),
          portfolio: (v) => (!v ? 'Добавьте ссылку на работы' : /^https?:\/\/\S+\.\S+/.test(v) ? '' : 'Ссылка должна начинаться с http:// или https://'),
          consent: (v) => (v ? '' : 'Без согласия мы не сможем рассмотреть заявку'),
        });
        if (!ok) return;
        await U.busy(f.querySelector('[type=submit]'), 900);
        const name = f.elements.name.value.trim();
        U.store.update((s) => {
          s.signups.push({ id: 's' + Date.now(), name, email: f.elements.email.value.trim(), city: f.elements.city.value.trim(), topics: [...f.querySelectorAll('[name=topics]:checked')].map((x) => x.value), portfolio: f.elements.portfolio.value.trim(), at: new Date().toISOString(), status: 'pending', log: [], samples: [] });
        });
        root.querySelector('#join-box').innerHTML = '<div class="success-state" tabindex="-1" id="join-ok"><span class="badge">' + I('check') + '</span><h2 class="t-h2">Заявка отправлена</h2><p>Спасибо, ' + E(name.split(' ')[0]) + '! Модератор проверит портфолио и ответит на почту в течение 2 рабочих дней.</p><p class="small muted">Прототип: заявку можно увидеть и одобрить в админ-панели.</p><div class="row-wrap"><a class="btn btn-primary" href="#/admin" data-action="as-admin">Открыть админ-панель</a><a class="btn" href="#/">На главную</a></div></div>';
        root.querySelector('#join-ok').focus();
        U.toast('Заявка отправлена', 'Ответ придёт в течение 2 рабочих дней');
      });
    },
  };

  U.pages.sources = {
    shell: 'site',
    title: 'Источники медиа',
    render() {
      const list = Object.values(U.media);
      return '<section class="wrap page-pad"><span class="t-eyebrow">Прототип</span><h1 class="t-h1" style="margin:16px 0 12px">Источники фото и видео</h1>' +
        '<p class="t-lead" style="max-width:60ch">Все материалы — со стоков с бесплатной лицензией для коммерческого использования. Люди на фото и видео не являются креаторами платформы: имена и профили вымышлены.</p>' +
        '<ul class="row-wrap" role="list" style="margin:20px 0 28px"><li><a class="link" href="https://unsplash.com/license" target="_blank" rel="noopener">Unsplash License</a></li><li><a class="link" href="https://www.pexels.com/license/" target="_blank" rel="noopener">Pexels License</a></li></ul>' +
        '<div class="panel table-wrap"><table class="table"><thead><tr><th scope="col">Превью</th><th scope="col">Описание</th><th scope="col">Тип</th><th scope="col">Автор</th><th scope="col">Лицензия</th><th scope="col">Источник</th></tr></thead><tbody>' +
        list.map((m) => '<tr><td style="width:56px"><span style="display:block;width:40px">' + U.frame(m.id, { w: 80, play: false, cls: 'frame-sm' }) + '</span></td><td>' + E(m.alt) + '</td><td>' + (m.kind === 'video' ? 'Видео' : 'Фото') + '</td><td>' + E(m.author) + '</td><td>' + E(m.license) + '</td><td><a class="link" href="' + E(m.page) + '" target="_blank" rel="noopener">' + E(m.source) + '<span class="sr-only"> (откроется в новой вкладке)</span></a></td></tr>').join('') +
        '</tbody></table></div></section>';
    },
  };
})();
