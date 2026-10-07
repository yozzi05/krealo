/* Платежи заказчика и выплаты креатора — строятся из тех же заказов */
(function () {
  const I = U.icon, E = U.esc;
  U.pages.payments = {
    shell: 'app',
    title: () => (U.store.s.role === 'creator' ? 'Выплаты' : 'Платежи'),
    render() {
      const role = U.store.s.role;
      const orders = U.q.ordersFor(role);
      const note = '<div class="notice notice-warning" style="margin-bottom:20px">' + I('alert') + '<div><b>Финансовые операции симулируются.</b> Платёжная система и выплаты не подключены, суммы демонстрационные.</div></div>';
      if (role === 'creator') {
        const me = U.q.creator(U.store.s.creatorSelf);
        const rows = orders.filter((o) => o.payment.status !== 'unpaid').map((o) => {
          const st = o.payment.payoutStatus === 'paid' ? '<span class="status status-success">Выплачено ' + U.date(o.payment.payoutAt) + '</span>' : o.payment.payoutStatus === 'processing' ? '<span class="status status-warning">В обработке</span>' : '<span class="status status-info">' + (o.stage === 'publishing' ? 'Ждёт подтверждения публикации' : 'Ждёт приёмки работы') + '</span>';
          return '<tr><td><a class="row-link num" href="#/orders/' + o.id + '">' + o.id + '</a><span class="cell-sub clamp-1">' + E(U.q.campaign(o.campaignId).product.name) + '</span></td><td>' + U.stagePill(o) + '</td><td>' + st + '</td><td class="col-num">' + U.money(o.fee) + '</td></tr>';
        }).join('');
        const sum = (f) => orders.filter(f).reduce((a, o) => a + o.fee, 0);
        return '<div class="page"><div class="page-head"><div><h1>Выплаты</h1><p class="sub">Гонорар приходит после приёмки работы</p></div></div>' + note +
          '<dl class="stats"><div class="stat"><dt>Ждёт приёмки</dt><dd>' + U.money(sum((o) => o.payment.status === 'held')) + '</dd></div><div class="stat"><dt>В обработке</dt><dd>' + U.money(sum((o) => o.payment.payoutStatus === 'processing')) + '</dd></div><div class="stat is-dark"><dt>Выплачено</dt><dd>' + U.money(sum((o) => o.payment.payoutStatus === 'paid')) + '</dd></div>' +
          '<div class="stat"><dt>Реквизиты</dt><dd style="font-size:16px">' + E((me.payout || {}).type || '—') + '</dd><span class="hint">' + E((me.payout || {}).account || 'не заполнены') + ' · <a class="link" href="#/studio/settings">изменить</a></span></div></dl>' +
          (rows ? '<div class="panel table-wrap"><table class="table"><thead><tr><th scope="col">Заказ</th><th scope="col">Работа</th><th scope="col">Выплата</th><th scope="col" class="col-num">Гонорар</th></tr></thead><tbody>' + rows + '</tbody></table></div>' : '<div class="empty">' + I('wallet') + '<h3>Выплат пока нет</h3><p>Они появятся после первого оплаченного заказа.</p></div>') + '</div>';
      }
      const ops = [];
      orders.forEach((o) => {
        if (o.payment.paidAt) ops.push({ at: o.payment.paidAt, o, kind: 'Оплата заказа', amount: -U.T.orderTotal(o), st: o.payment.status === 'held' ? '<span class="status status-info">Зарезервировано</span>' : '<span class="status status-success">Списано</span>' });
        if (o.payment.payoutStatus !== 'none') ops.push({ at: o.payment.payoutAt || o.acceptedAt, o, kind: 'Выплата креатору', amount: o.fee, st: o.payment.payoutStatus === 'paid' ? '<span class="status status-success">Проведена</span>' : '<span class="status status-warning">В обработке</span>', payout: true });
      });
      ops.sort((a, b) => (b.at > a.at ? 1 : -1));
      const held = orders.filter((o) => o.payment.status === 'held').reduce((a, o) => a + U.T.orderTotal(o), 0);
      const spent = orders.filter((o) => o.payment.status === 'released').reduce((a, o) => a + U.T.orderTotal(o), 0);
      const unpaid = orders.filter((o) => o.payment.status === 'unpaid');
      return '<div class="page"><div class="page-head"><div><h1>Платежи</h1><p class="sub">' + (role === 'admin' ? 'Все операции платформы' : 'Оплаты заказов «Северного ухода»') + '</p></div></div>' + note +
        '<dl class="stats"><div class="stat"><dt>Ждут оплаты</dt><dd>' + unpaid.length + '</dd><span class="hint">' + (unpaid.length ? '<a class="link" href="#/orders/' + unpaid[0].id + '">Оплатить ' + unpaid[0].id + '</a>' : 'всё оплачено') + '</span></div>' +
        '<div class="stat"><dt>Зарезервировано</dt><dd>' + U.money(held) + '</dd><span class="hint">до приёмки работ</span></div>' +
        '<div class="stat"><dt>Списано</dt><dd>' + U.money(spent) + '</dd><span class="hint">по принятым работам</span></div>' +
        '<div class="stat"><dt>Документы</dt><dd style="font-size:16px">Акты и чеки</dd><span class="hint">в рабочей версии</span></div></dl>' +
        '<div class="panel table-wrap"><table class="table"><caption class="sr-only">Операции</caption><thead><tr><th scope="col">Дата</th><th scope="col">Операция</th><th scope="col">Заказ</th><th scope="col">Статус</th><th scope="col" class="col-num">Сумма</th>' + (role === 'admin' ? '<th scope="col"><span class="sr-only">Действие</span></th>' : '') + '</tr></thead><tbody>' +
        ops.map((x) => '<tr><td class="num nowrap">' + U.dateTime(x.at) + '</td><td>' + x.kind + '<span class="cell-sub">' + E(U.q.creator(x.o.creatorId).name) + '</span></td><td><a class="row-link num" href="#/orders/' + x.o.id + '">' + x.o.id + '</a></td><td>' + x.st + '</td><td class="col-num">' + (x.amount < 0 ? '−' : '') + U.money(Math.abs(x.amount)) + '</td>' +
          (role === 'admin' ? '<td>' + (x.payout && x.o.payment.payoutStatus === 'processing' ? '<button class="btn btn-sm" type="button" data-action="payout" data-order="' + x.o.id + '">Провести</button>' : '') + '</td>' : '') + '</tr>').join('') +
        '</tbody></table></div></div>';
    },
  };
})();
