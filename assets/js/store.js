/* Хранилище состояния: localStorage + подписчики.
   Все изменения заказов проходят через U.flow — так данные остаются связанными. */
(function () {
  let state;
  let storageOk = true;
  const subs = new Set();
  const key = () => U.config.storageKey;

  function load() {
    try {
      const raw = localStorage.getItem(key());
      if (raw) {
        const s = JSON.parse(raw);
        if (s && s.version === 2) return s;
      }
    } catch (e) { storageOk = false; }
    return U.seed();
  }

  U.store = {
    get s() { return state; },
    init() { state = load(); this.save(); },
    /* Для тестов: работа с независимым состоянием без localStorage */
    useMemory(s) { state = s; this.memory = true; },
    save() {
      if (this.memory) return;
      try { localStorage.setItem(key(), JSON.stringify(state)); storageOk = true; }
      catch (e) { storageOk = false; }
    },
    storageOk: () => storageOk,
    update(fn) { fn(state); this.save(); subs.forEach((f) => f()); },
    subscribe(f) { subs.add(f); return () => subs.delete(f); },
    reset() { state = U.seed(); this.save(); subs.forEach((f) => f()); },
  };

  /* ---------- Селекторы ---------- */
  U.q = {
    creator: (id) => state.creators.find((c) => c.id === id),
    campaign: (id) => state.campaigns.find((c) => c.id === id),
    order: (id) => state.orders.find((o) => o.id === id),
    offer: (id) => state.offers.find((o) => o.id === id),
    brand: (id) => state.brands.find((b) => b.id === id),
    ordersFor(role) {
      const list = role === 'creator' ? state.orders.filter((o) => o.creatorId === state.creatorSelf) : state.orders.slice();
      return list.sort((a, b) => (b.createdAt > a.createdAt ? 1 : -1));
    },
    total: (o) => U.T.orderTotal(o),
    actor: (o) => U.T.actor(o),
    lastVersion: (o) => o.versions[o.versions.length - 1],
    /* Минимальная цена услуги нужного вида: ugc | publish | video (ugc без фото-сетов) */
    services: (c, kind) => c.services.filter((x) => !kind || x.kind === kind),
    isPhoto: (x) => x.kind === 'ugc' && (x.media === 'photo' || /^фото/i.test(x.title)),
    minPrice(c, kind) {
      const list = kind === 'video'
        ? c.services.filter((x) => x.kind === 'ugc' && !U.q.isPhoto(x))
        : c.services.filter((x) => x.kind === (kind || 'ugc'));
      return list.length ? Math.min(...list.map((x) => x.price)) : null;
    },
    /* Цена «без публикации» с подписью: видео, если есть видео-услуги, иначе фото */
    ugcPrice(c) {
      const v = U.q.minPrice(c, 'video');
      return v != null ? { label: 'Видео', price: v } : { label: 'Фото', price: U.q.minPrice(c, 'ugc') };
    },
    publishService: (c, service) => c.services.find((x) => x.kind === 'publish' && (!service || x.service === service)),
    canShipTo: (c) => c.verification === 'verified',
  };
})();
