/* Список заказов. Срок — та же формулировка, что в карточке (U.due). */
(function () {
  const I = U.icon, E = U.esc;
  const GROUPS = [
    ['all', 'Все', () => true],
    ['mine', 'Требуют действия', (o, role) => U.T.actor(o) === role],
    ['work', 'В работе', (o) => !['accepted', 'agreement'].includes(o.stage)],
    ['done', 'Завершены', (o) => o.stage === 'accepted'],
  ];
  let group = 'all';

  U.pages.orders = {
    shell: 'app',
    title: 'Заказы',
    render() {
      const role = U.store.s.role;
      const all = U.q.ordersFor(role);
      const fn = GROUPS.find((g) => g[0] === group)[2];
      const list = all.filter((o) => fn(o, role));
      const counts = GROUPS.map((g) => all.filter((o) => g[2](o, role)).length);
      const who = (o) => role === 'creator' ? { av: U.brandAvatar(U.q.brand(o.brandId), 32), name: U.q.brand(o.brandId).name } : { av: U.avatar(U.q.creator(o.creatorId), 32), name: U.q.creator(o.creatorId).name };
      const sum = (o) => role === 'creator' ? o.fee : U.T.orderTotal(o);
      const dueCell = (o) => { const d = U.due(o); return '<span class="due ' + U.dueTone(o) + '">' + E(d.short.charAt(0).toUpperCase() + d.short.slice(1)) + '</span>' + (d.date && d.kind !== 'done' ? '<span class="cell-sub">' + U.deadlineText(d.date) + '</span>' : ''); };
      const rows = list.map((o) => {
        const cmp = U.q.campaign(o.campaignId); const w = who(o);
        const mine = U.T.actor(o) === role;
        return '<tr><td class="col-order"><a class="row-link num" href="#/orders/' + o.id + '">' + o.id + '</a><span class="cell-sub clamp-1" title="' + E(cmp.product.name) + '">' + E(cmp.product.name) + '</span></td>' +
          '<td><div class="cell-person">' + w.av + '<span class="clamp-1">' + E(w.name) + '</span></div></td>' +
          '<td>' + U.stagePill(o) + (mine ? '<span class="cell-sub needs-me">Ваш ход</span>' : '') + '</td>' +
          '<td>' + dueCell(o) + '</td>' +
          '<td class="col-num">' + U.money(sum(o)) + '</td><td>' + U.payPill(o) + '</td></tr>';
      }).join('');
      const cards = list.map((o) => {
        const cmp = U.q.campaign(o.campaignId); const w = who(o);
        return '<a class="ocard" href="#/orders/' + o.id + '"><div class="ocard-top">' + w.av + '<div style="flex:1;min-width:0"><b>' + E(w.name) + '</b><span class="cell-sub wrap-any">' + o.id + ' · ' + E(cmp.product.name) + '</span></div></div>' +
          '<div class="row-wrap">' + U.stagePill(o) + U.payPill(o) + (U.T.actor(o) === role ? '<span class="needs-me">Ваш ход</span>' : '') + '</div>' +
          '<div class="ocard-row"><span class="muted">' + E(U.due(o).short.charAt(0).toUpperCase() + U.due(o).short.slice(1)) + '</span>' + U.money(sum(o)) + '</div></a>';
      }).join('');
      return '<div class="page"><div class="page-head"><div><h1>' + (role === 'admin' ? 'Все заказы' : 'Заказы') + '</h1><p class="sub">' + (role === 'creator' ? 'Ваши заказы и гонорары' : role === 'admin' ? 'Заказы всех участников платформы' : 'Заказы по всем кампаниям «Северного ухода»') + '</p></div>' +
        (role === 'brand' ? '<div class="page-head-actions"><a class="btn" href="#/creators">' + I('users') + 'Найти креатора</a><a class="btn btn-primary" href="#/campaigns/new">' + I('plus') + 'Новая кампания</a></div>' : '') + '</div>' +
        '<div class="tabs" role="tablist" aria-label="Фильтр заказов" style="margin-bottom:20px">' + GROUPS.map((g, i) => '<button class="tab" role="tab" aria-selected="' + (group === g[0]) + '" data-group="' + g[0] + '">' + g[1] + ' <span class="count">' + counts[i] + '</span></button>').join('') + '</div>' +
        (list.length ? '<div class="panel table-wrap orders-table"><table class="table"><caption class="sr-only">Заказы</caption><thead><tr><th scope="col">Заказ</th><th scope="col">' + (role === 'creator' ? 'Заказчик' : 'Креатор') + '</th><th scope="col">Этап</th><th scope="col">Срок</th><th scope="col" class="col-num">' + (role === 'creator' ? 'Гонорар' : 'Сумма') + '</th><th scope="col">Деньги</th></tr></thead><tbody>' + rows + '</tbody></table></div><div class="order-cards">' + cards + '</div>'
          : '<div class="empty">' + I('inbox') + '<h3>Здесь пусто</h3><p>' + (group === 'mine' ? 'Сейчас нет заказов, которые ждут вашего действия.' : 'Заказов в этой группе нет.') + '</p><button class="btn" type="button" data-group="all">Показать все заказы</button></div>') +
        '</div>';
    },
    mount(root) {
      root.querySelectorAll('[data-group]').forEach((b) => b.addEventListener('click', () => { group = b.dataset.group; U.rerender(); const t = document.querySelector('[data-group="' + group + '"].tab'); if (t) t.focus(); }));
    },
  };
})();
