/* Сообщения: переписка по заказам */
(function () {
  const I = U.icon, E = U.esc;
  U.pages.messages = {
    shell: 'app',
    title: 'Сообщения',
    render(p) {
      const role = U.store.s.role;
      const list = U.q.ordersFor(role).filter((o) => o.messages.length)
        .sort((a, b) => (b.messages[b.messages.length - 1].at > a.messages[a.messages.length - 1].at ? 1 : -1));
      const cur = p.id ? U.q.order(p.id) : null;
      const title = (o) => role === 'creator' ? U.q.brand(o.brandId).name : U.q.creator(o.creatorId).name;
      const av = (o) => role === 'creator' ? U.brandAvatar(U.q.brand(o.brandId), 40) : U.avatar(U.q.creator(o.creatorId), 40);
      return '<div class="page page-messages' + (cur ? ' has-thread' : '') + '"><div class="page-head"><div><h1>Сообщения</h1><p class="sub">Переписка привязана к заказам — договорённости не теряются.</p></div></div>' +
        (list.length ? '<div class="inbox' + (cur ? ' has-thread' : '') + '"><nav class="threads" aria-label="Диалоги">' + list.map((o) => {
          const m = o.messages[o.messages.length - 1];
          return '<a class="thread" href="#/messages/' + o.id + '"' + (cur && cur.id === o.id ? ' aria-current="true"' : '') + '>' + av(o) + '<div style="min-width:0"><div class="t"><span>' + E(title(o)) + '</span><time>' + U.date(m.at) + '</time></div><div class="p">' + o.id + ' · ' + E(m.text) + '</div></div></a>';
        }).join('') + '</nav>' +
        '<section class="thread-pane" aria-label="Переписка">' + (cur ? '<div class="thread-head"><a class="btn btn-ghost btn-sm show-md" href="#/messages" aria-label="Назад к диалогам">' + I('arrow-left') + '</a>' + av(cur) + '<div style="flex:1;min-width:0"><b>' + E(title(cur)) + '</b><span class="cell-sub">' + E(U.q.campaign(cur.campaignId).product.name) + '</span></div>' + U.stagePill(cur) + '<a class="btn btn-sm" href="#/orders/' + cur.id + '">Открыть заказ</a></div>' + U.chatHTML(cur)
          : '<div class="empty" style="margin:auto;border:0">' + I('message') + '<h3>Выберите диалог</h3><p>Слева — переписка по каждому заказу.</p></div>') + '</section></div>'
          : '<div class="empty">' + I('message') + '<h3>Сообщений пока нет</h3><p>Переписка появится, когда начнётся работа по заказу.</p></div>') + '</div>';
    },
    mount(root, p) {
      if (p.id && U.q.order(p.id) && root.querySelector('[data-chat]')) U.wireChat(root.querySelector('.thread-pane'), p.id, () => {
        const t = root.querySelector('.thread[aria-current="true"] .p');
        const o = U.q.order(p.id);
        if (t) t.textContent = o.id + ' · ' + o.messages[o.messages.length - 1].text;
      });
    },
  };
})();
