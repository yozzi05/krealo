/* Библиотека принятых материалов заказчика с фильтрами */
(function () {
  const I = U.icon, E = U.esc;
  let F = { campaign: '', creator: '', kind: '' };

  function items() {
    const out = [];
    U.store.s.orders.forEach((o) => o.versions.filter((v) => v.status === 'accepted').forEach((v) => v.files.forEach((f) => out.push({ o, v, f }))));
    return out;
  }

  U.pages.library = {
    shell: 'app',
    title: 'Материалы',
    render() {
      if (U.store.s.role === 'creator') return '<div class="page"><div class="empty">' + I('lock') + '<h1 class="t-h3">Раздел для заказчиков</h1><p>Здесь собраны принятые материалы бренда.</p></div></div>';
      const all = items();
      const camps = [...new Set(all.map((x) => x.o.campaignId))].map(U.q.campaign);
      const crs = [...new Set(all.map((x) => x.o.creatorId))].map(U.q.creator);
      const list = all.filter((x) => (!F.campaign || x.o.campaignId === F.campaign) && (!F.creator || x.o.creatorId === F.creator) && (!F.kind || x.f.kind === F.kind));
      const sel = (name, label, opts, val) => '<div class="field"><label for="lib-' + name + '">' + label + '</label><select class="select" id="lib-' + name + '" data-f="' + name + '"><option value="">Все</option>' + opts.map(([v, t]) => '<option value="' + v + '"' + (v === val ? ' selected' : '') + '>' + E(t) + '</option>').join('') + '</select></div>';
      return '<div class="page"><div class="page-head"><div><h1>Материалы</h1><p class="sub">Принятые версии из всех заказов. Права — по условиям заказа.</p></div></div>' +
        '<div class="lib-filters">' + sel('campaign', 'Кампания', camps.map((c) => [c.id, c.title]), F.campaign) + sel('creator', 'Креатор', crs.map((c) => [c.id, c.name]), F.creator) + sel('kind', 'Формат', [['video', 'Видео'], ['image', 'Фото']], F.kind) +
        (F.campaign || F.creator || F.kind ? '<button class="btn btn-ghost btn-sm" type="button" data-lib-reset style="align-self:end">Сбросить</button>' : '') + '</div>' +
        '<p class="result-count" role="status" style="margin:12px 0">Найдено: <b class="num">' + list.length + '</b></p>' +
        (list.length ? '<div class="lib-grid">' + list.map(({ o, v, f }) => {
          const m = U.media[f.media];
          const c = U.q.creator(o.creatorId);
          return '<article class="lib-item">' + U.frame(f.media, { w: 300, zoom: true, caption: f.name, label: f.kind === 'video' ? I('video', 'icon-sm') + (m.kind === 'video' ? '<span class="num">' + m.dur + '</span>' : 'Видео') : I('image', 'icon-sm') + 'Фото' }) +
            '<div><b class="wrap-any small">' + E(f.name) + '</b><p class="small muted">' + E(c.name) + ' · <a class="link" href="#/orders/' + o.id + '">' + o.id + '</a> · версия ' + v.n + '</p><p class="small muted">Права: ' + E((U.RIGHTS_SCOPE[o.terms.rights.scope] || '') + ', ' + (U.RIGHTS_TERM[o.terms.rights.term] || '').toLowerCase()) + '</p></div></article>';
        }).join('') + '</div>' : '<div class="empty">' + I('film') + '<h3>Материалов не найдено</h3><p>Принятые версии появятся здесь после приёмки работы.</p>' + (F.campaign || F.creator || F.kind ? '<button class="btn" type="button" data-lib-reset>Сбросить фильтры</button>' : '') + '</div>') + '</div>';
    },
    mount(root) {
      root.querySelectorAll('[data-f]').forEach((s) => s.addEventListener('change', () => { F[s.dataset.f] = s.value; U.rerender(); document.getElementById('lib-' + s.dataset.f).focus(); }));
      root.querySelectorAll('[data-lib-reset]').forEach((b) => b.addEventListener('click', () => { F = { campaign: '', creator: '', kind: '' }; U.rerender(); }));
    },
  };
})();
