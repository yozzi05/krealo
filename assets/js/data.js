/* Демонстрационные данные прототипа. Все люди, компании, адреса и цифры вымышлены
   и не являются реальными клиентами или результатами. Даты строятся относительно
   момента первого запуска, чтобы сроки не устаревали. */
(function () {
  const DAY = 86400000;

  U.seed = function () {
    const now = Date.now();
    const at = (days, hour = 12, min = 0) => {
      const d = new Date(now + days * DAY);
      d.setHours(hour, min, 0, 0);
      return d.toISOString();
    };
    const W = (id, media, title, format, category, task) => ({ id, media, title, format, category, task });
    const addr = (name, city, pvz, tail) => ({ recipient: name, city, pvz, phone: '+7 9•• •••-' + tail });

    /* ---------- Креаторы ---------- */
    const creators = [
      {
        id: 'c1', name: 'Алина Соколова', city: 'Казань', langs: ['русский', 'татарский'],
        topics: ['Уход за кожей', 'Красота'], presence: ['face', 'hands', 'voice'],
        rating: 4.9, completed: 31, responseHours: 3,
        verification: 'verified', verifyNote: 'Паспорт и самозанятость подтверждены, пробное видео принято',
        avatar: 'v-face-cream',
        services: [
          { id: 'u1', kind: 'ugc', title: 'Видео 15–30 с', price: 6500 },
          { id: 'u2', kind: 'ugc', title: 'Видео 30–60 с', price: 8500 },
          { id: 'u3', kind: 'ugc', title: 'Фото-сет, 5 кадров', price: 4000 },
        ],
        portfolio: [
          W('w1', 'v-face-cream', 'Утренний уход: крем для лица', 'Демонстрация', 'Уход за кожей', 'Показать текстуру и как крем впитывается без блеска'),
          W('w2', 'v-cream-close', 'Текстура крема крупным планом', 'Демонстрация', 'Уход за кожей', 'Крупный план нанесения для первого кадра рекламы'),
          W('w3', 'v-eye-cream', 'Средство для кожи вокруг глаз', 'Инструкция', 'Уход за кожей', 'Объяснить, сколько средства брать и как наносить'),
          W('w4', 'v-eye-mask', 'Патчи: до и после', 'Отзыв в кадре', 'Красота', 'Честное впечатление после первого применения'),
        ],
        bio: 'Снимаю спокойные бьюти-видео при дневном свете: текстуры, нанесение, честное «до и после» без фильтров. Есть комната с хорошим светом и стойка для съёмки рук.',
        equipment: 'iPhone 14 Pro, кольцевой свет, петличный микрофон',
        address: addr('Алина Соколова', 'Казань', 'ПВЗ, ул. Баумана, 44 (демо-адрес)', '12-34'),
        payout: { type: 'Самозанятый', inn: '16•• •••• ••12', account: 'Карта •• 4417', status: 'verified' },
      },
      {
        id: 'c2', name: 'Дарья Миронова', city: 'Москва', langs: ['русский', 'английский'],
        topics: ['Красота', 'Лайфстайл'], presence: ['face', 'voice'],
        rating: 4.8, completed: 46, responseHours: 2,
        verification: 'verified', verifyNote: 'Документы подтверждены, 46 заказов приняты без споров',
        avatar: 'v-talk',
        services: [
          { id: 'u1', kind: 'ugc', title: 'Видео 15–30 с', price: 9000 },
          { id: 'u2', kind: 'ugc', title: 'Видео 30–60 с', price: 12000 },
          { id: 'p1', kind: 'publish', title: 'Ролик и публикация в Telegram-канале', platform: 'Telegram-канал', service: 'create_publish', price: 15000 },
          { id: 'p2', kind: 'publish', title: 'Публикация готового ролика в Telegram-канале', platform: 'Telegram-канал', service: 'publish_ready', price: 10000 },
        ],
        portfolio: [
          W('w1', 'v-talk', 'Отзыв о сыворотке за 13 секунд', 'Отзыв в кадре', 'Красота', 'Своими словами: что понравилось и кому подойдёт'),
          W('w2', 'v-talk-2', 'Три причины попробовать', 'Отзыв в кадре', 'Лайфстайл', 'Короткий сценарий с хуком в первой секунде'),
          W('w3', 'v-talk-mic', 'Анонс в Telegram-канале', 'Публикация', 'Лайфстайл', 'Видео-обращение для поста с промокодом'),
        ],
        audience: { platform: 'Telegram-канал', followers: 18400, reach: 6200, geo: 'Москва и МО — 58%' },
        bio: 'Говорю в камеру просто и по делу. Делаю отзывы и сравнения, пишу сценарий сама, если в брифе есть ключевые тезисы.',
        equipment: 'Sony ZV-1, iPhone 15, свет Godox',
        address: addr('Дарья Миронова', 'Москва', 'ПВЗ, Профсоюзная ул., 12 (демо-адрес)', '45-10'),
      },
      {
        id: 'c3', name: 'Вероника Ким', city: 'Санкт-Петербург', langs: ['русский', 'английский', 'корейский'],
        topics: ['Гаджеты', 'Распаковка'], presence: ['face', 'hands', 'voice'],
        rating: 4.9, completed: 22, responseHours: 5,
        verification: 'verified', verifyNote: 'Документы подтверждены, пробное видео принято',
        avatar: 'v-unbox-phone',
        services: [
          { id: 'u1', kind: 'ugc', title: 'Видео 15–30 с', price: 7500 },
          { id: 'u2', kind: 'ugc', title: 'Видео 30–60 с', price: 10000 },
          { id: 'u3', kind: 'ugc', title: 'Фото-сет, 5 кадров', price: 4500 },
        ],
        portfolio: [
          W('w1', 'v-unbox-phone', 'Распаковка смартфона', 'Распаковка', 'Гаджеты', 'Все этапы: коробка, комплект, первое касание'),
          W('w2', 'v-unbox-phone-2', 'Первое включение', 'Демонстрация', 'Гаджеты', 'Показать экран и скорость настройки'),
          W('w3', 'v-open-box', 'Посылка с аксессуарами', 'Распаковка', 'Распаковка', 'Живая реакция и звук открывания'),
          W('w4', 'v-laptop', 'Осмотр ноутбука', 'Отзыв в кадре', 'Гаджеты', 'Корпус, порты и вес — без технического жаргона'),
        ],
        bio: 'Распаковки техники и аксессуаров: крупные планы, звук открывания, первые впечатления. Могу снять горизонтальную версию для карточки товара.',
        equipment: 'iPhone 15 Pro, макролинза, два источника света',
        address: addr('Вероника Ким', 'Санкт-Петербург', 'ПВЗ, Невский пр., 100 (демо-адрес)', '77-02'),
      },
      {
        id: 'c4', name: 'Камила Галиева', city: 'Уфа', langs: ['русский', 'башкирский'],
        topics: ['Еда и напитки', 'Дом'], presence: ['face', 'hands', 'voice'],
        rating: 4.7, completed: 14, responseHours: 6,
        verification: 'verified', verifyNote: 'Документы подтверждены, пробное видео принято',
        avatar: 'v-make-coffee',
        services: [
          { id: 'u1', kind: 'ugc', title: 'Видео 15–30 с', price: 5500 },
          { id: 'u2', kind: 'ugc', title: 'Инструкция до 60 с', price: 7500 },
          { id: 'u3', kind: 'ugc', title: 'Фото-сет, 5 кадров', price: 3500 },
        ],
        portfolio: [
          W('w1', 'v-barista', 'Как молоть зерно для эспрессо', 'Инструкция', 'Еда и напитки', 'Помол, дозировка и типичные ошибки'),
          W('w2', 'p-pour-coffee', 'Кофе для карточки товара', 'Фото для карточки', 'Еда и напитки', 'Предметный кадр без лица: кофейник и чашка'),
          W('w3', 'v-make-coffee', 'Кофе за стойкой', 'Демонстрация', 'Еда и напитки', 'Атмосферный ролик для карточки кофе'),
          W('w4', 'v-filter', 'Холдер и темпер', 'Видео с озвучкой', 'Дом', 'Руки в кадре, голос за кадром'),
        ],
        bio: 'Бариста. Снимаю рецепты и инструкции: как заварить, сколько засыпать, что получится. Хорошо работаю с озвучкой поверх кадра.',
        equipment: 'Pixel 8 Pro, штатив сверху, накамерный микрофон',
        address: addr('Камила Галиева', 'Уфа', 'ПВЗ, ул. Ленина, 5 (демо-адрес)', '31-88'),
      },
      {
        id: 'c5', name: 'Ксения Белова', city: 'Екатеринбург', langs: ['русский'],
        topics: ['Дом', 'Уход за кожей'], presence: ['face', 'hands', 'voice'],
        rating: 4.8, completed: 19, responseHours: 4,
        verification: 'verified', verifyNote: 'Документы подтверждены, пробное видео принято',
        avatar: 'v-face-care',
        services: [
          { id: 'u1', kind: 'ugc', title: 'Видео 15–30 с', price: 5000 },
          { id: 'u2', kind: 'ugc', title: 'Видео 30–60 с', price: 7000 },
          { id: 'u3', kind: 'ugc', title: 'Фото-сет, 5 кадров', price: 3500 },
        ],
        portfolio: [
          W('w1', 'v-face-care', 'Утренняя рутина', 'Демонстрация', 'Уход за кожей', 'Последовательность средств в спокойном темпе'),
          W('w2', 'v-lotion-body', 'Лосьон после душа', 'Демонстрация', 'Уход за кожей', 'Показать, как быстро впитывается'),
          W('w3', 'v-body-cream', 'Крем для тела перед сном', 'Видео с озвучкой', 'Дом', 'Уютная сцена с закадровым текстом'),
          W('w4', 'p-candle', 'Свеча в интерьере', 'Фото для карточки', 'Дом', 'Предметный кадр для карточки маркетплейса'),
        ],
        bio: 'Уютные домашние сцены: уход, свечи, текстиль. Снимаю спокойно и без суеты — подходит для товаров «для себя».',
        equipment: 'iPhone 13, софтбокс, деревянные фоны',
        address: addr('Ксения Белова', 'Екатеринбург', 'ПВЗ, ул. Малышева, 71 (демо-адрес)', '09-55'),
      },
      {
        id: 'c6', name: 'Марк Ершов', city: 'Новосибирск', langs: ['русский', 'английский'],
        topics: ['Гаджеты', 'Спорт'], presence: ['face', 'voice'],
        rating: 4.6, completed: 9, responseHours: 8,
        verification: 'verified', verifyNote: 'Документы подтверждены, пробное видео принято',
        avatar: 'v-man-rec',
        services: [
          { id: 'u1', kind: 'ugc', title: 'Видео 15–30 с', price: 8000 },
          { id: 'u2', kind: 'ugc', title: 'Видео 30–60 с', price: 11000 },
          { id: 'p1', kind: 'publish', title: 'Ролик и публикация в VK Клипах', platform: 'VK Клипы', service: 'create_publish', price: 14000 },
          { id: 'p2', kind: 'publish', title: 'Публикация готового ролика в VK Клипах', platform: 'VK Клипы', service: 'publish_ready', price: 9000 },
        ],
        portfolio: [
          W('w1', 'v-man-rec', 'Обзор наушников за минуту', 'Отзыв в кадре', 'Гаджеты', 'Звук, посадка и время работы простыми словами'),
          W('w2', 'v-man-rec-2', 'Тест колонки дома', 'Демонстрация', 'Гаджеты', 'Сравнить громкость в комнате и на кухне'),
          W('w3', 'v-man-phone', 'Ролик для VK Клипов', 'Публикация', 'Спорт', 'Короткий формат с призывом в описании'),
          W('w4', 'v-man-rec-3', 'Распаковка фитнес-браслета', 'Распаковка', 'Спорт', 'Первое знакомство и настройка'),
        ],
        audience: { platform: 'VK Клипы', followers: 32700, reach: 11800, geo: 'Сибирь — 41%' },
        bio: 'Тестирую наушники, колонки и спортивные гаджеты в реальных условиях: дома, на тренировке, в дороге.',
        equipment: 'GoPro 12, iPhone 15, беспроводной микрофон',
        address: addr('Марк Ершов', 'Новосибирск', 'ПВЗ, Красный пр., 25 (демо-адрес)', '60-17'),
      },
      {
        id: 'c7', name: 'Полина Захарова', city: 'Краснодар', langs: ['русский'],
        topics: ['Одежда и обувь', 'Лайфстайл'], presence: ['face', 'hands'],
        rating: 4.9, completed: 27, responseHours: 3,
        verification: 'verified', verifyNote: 'Документы подтверждены, пробное видео принято',
        avatar: 'v-bag',
        services: [
          { id: 'u1', kind: 'ugc', title: 'Видео 15–30 с', price: 6000 },
          { id: 'u2', kind: 'ugc', title: 'Примерка, 3 образа', price: 9000 },
          { id: 'u3', kind: 'ugc', title: 'Фото-сет, 5 кадров', price: 4000 },
        ],
        portfolio: [
          W('w1', 'v-bag', 'Распаковка заказа одежды', 'Распаковка', 'Одежда и обувь', 'Показать упаковку и первое впечатление от ткани'),
          W('w2', 'v-measure', 'Как выбрать размер', 'Инструкция', 'Одежда и обувь', 'Замеры по таблице размеров продавца'),
          W('w3', 'v-paper-bag', 'Покупки недели', 'Примерка', 'Лайфстайл', 'Лёгкий lifestyle-ролик для соцсетей'),
          W('w4', 'p-sneakers-hand', 'Кеды для карточки', 'Фото для карточки', 'Одежда и обувь', 'Предметный кадр на светлом фоне'),
        ],
        bio: 'Примерки и образы: показываю посадку, ткань, как вещь сидит в движении. Снимаю дома и на улице.',
        equipment: 'iPhone 14, зеркало в полный рост, отражатель',
        address: addr('Полина Захарова', 'Краснодар', 'ПВЗ, ул. Красная, 3 (демо-адрес)', '20-41'),
      },
      {
        id: 'c8', name: 'Артём Шилов', city: 'Нижний Новгород', langs: ['русский'],
        topics: ['Распаковка', 'Дом'], presence: ['face', 'hands', 'voice'],
        rating: 4.7, completed: 17, responseHours: 5,
        verification: 'verified', verifyNote: 'Документы подтверждены, пробное видео принято',
        avatar: 'v-unbox-man-2',
        services: [
          { id: 'u1', kind: 'ugc', title: 'Видео 15–30 с', price: 5500 },
          { id: 'u2', kind: 'ugc', title: 'Видео 30–60 с', price: 7500 },
          { id: 'u3', kind: 'ugc', title: 'Серия из 3 коротких', price: 12000 },
        ],
        portfolio: [
          W('w1', 'v-unbox-man', 'Распаковка от двери', 'Распаковка', 'Распаковка', 'Живая реакция на посылку'),
          W('w2', 'v-unbox-man-2', 'Что внутри коробки', 'Распаковка', 'Дом', 'Крупный план содержимого'),
          W('w3', 'v-box-from-bag', 'Подарочная упаковка', 'Демонстрация', 'Дом', 'Показать упаковку как подарок'),
          W('w4', 'v-check-bag', 'Проверка комплектации', 'Инструкция', 'Распаковка', 'Что должно быть в наборе'),
        ],
        bio: 'Распаковки с живой реакцией: от двери до первого использования. Снимаю серией, чтобы было из чего собрать несколько роликов.',
        equipment: 'Samsung S23, свет, петличка',
        address: addr('Артём Шилов', 'Нижний Новгород', 'ПВЗ, ул. Большая Покровская, 8 (демо-адрес)', '73-05'),
      },
      {
        id: 'c9', name: 'Софья Николаева', city: 'Москва', langs: ['русский', 'английский'],
        topics: ['Спорт', 'Еда и напитки'], presence: ['face', 'hands'],
        rating: 5.0, completed: 12, responseHours: 2,
        verification: 'verified', verifyNote: 'Документы подтверждены, пробное видео принято',
        avatar: 'p-yoga',
        services: [
          { id: 'u1', kind: 'ugc', title: 'Видео 15–30 с', price: 7000 },
          { id: 'u2', kind: 'ugc', title: 'Видео 30–60 с', price: 9500 },
          { id: 'u3', kind: 'ugc', title: 'Фото-сет, 5 кадров', price: 4500 },
        ],
        portfolio: [
          W('w1', 'p-yoga', 'Коврик для домашней практики', 'Фото для карточки', 'Спорт', 'Товар в реальной обстановке'),
          W('w2', 'p-kitchen', 'Перекус после тренировки', 'Фото для карточки', 'Еда и напитки', 'Lifestyle-кадр для соцсетей бренда'),
          W('w3', 'p-blender', 'Смузи в блендере', 'Фото для карточки', 'Еда и напитки', 'Руки и продукт без лица'),
        ],
        bio: 'Тренер по йоге. Снимаю спортивные товары и полезные перекусы так, как ими пользуются на самом деле. В портфолио пока только фото.',
        equipment: 'iPhone 15, штатив, дневной свет студии',
        address: addr('Софья Николаева', 'Москва', 'ПВЗ, ул. Сретенка, 9 (демо-адрес)', '88-30'),
      },
      {
        id: 'c10', name: 'Илья Воронцов', city: 'Самара', langs: ['русский'],
        topics: ['Товары для животных', 'Лайфстайл'], presence: ['hands', 'voice'],
        rating: null, completed: 0, responseHours: 10,
        verification: 'pending', verifyNote: 'Документы загружены и ждут проверки модератором, пробная работа принята',
        avatar: null,
        docs: [
          { name: 'Паспорт, разворот с фото', status: 'uploaded' },
          { name: 'Справка о постановке на учёт как самозанятого', status: 'uploaded' },
        ],
        services: [
          { id: 'u1', kind: 'ugc', title: 'Видео 15–30 с', price: 4500 },
          { id: 'u2', kind: 'ugc', title: 'Фото-сет, 5 кадров', price: 3000 },
        ],
        portfolio: [
          W('w1', 'p-dog-treat', 'Лакомство для собак', 'Фото для карточки', 'Товары для животных', 'Показать реакцию питомца'),
          W('w2', 'p-dog-lick', 'Тест нового вкуса', 'Фото для карточки', 'Товары для животных', 'Крупный план без людей в кадре'),
          W('w3', 'p-dog-bowl', 'Корм в миске', 'Фото для карточки', 'Товары для животных', 'Кадр для карточки маркетплейса'),
        ],
        bio: 'Снимаю с собакой Бонни: корм, лакомства, игрушки, аксессуары для прогулок. Новый креатор на платформе, в кадре — питомец и руки.',
        equipment: 'iPhone 13, кольцевой свет',
        address: addr('Илья Воронцов', 'Самара', 'ПВЗ, ул. Ленинградская, 2 (демо-адрес)', '14-66'),
      },
      {
        id: 'c11', name: 'Ева Чернова', city: 'Ростов-на-Дону', langs: ['русский', 'английский'],
        topics: ['Красота', 'Уход за кожей'], presence: ['face', 'hands', 'voice'],
        rating: 4.8, completed: 8, responseHours: 4,
        verification: 'verified', verifyNote: 'Документы подтверждены, пробное видео принято',
        avatar: 'p-kalos-bottle',
        services: [
          { id: 'u1', kind: 'ugc', title: 'Видео 15–30 с', price: 5000 },
          { id: 'u2', kind: 'ugc', title: 'Видео с озвучкой', price: 6500 },
          { id: 'u3', kind: 'ugc', title: 'Фото-сет, 5 кадров', price: 3500 },
        ],
        portfolio: [
          W('w1', 'p-kalos-hold', 'Флакон для карточки товара', 'Фото для карточки', 'Уход за кожей', 'Предметный кадр: флакон в руке без лица'),
          W('w2', 'p-kalos-bottle', 'Флакон в руке', 'Фото для карточки', 'Красота', 'Портретный кадр с продуктом'),
          W('w3', 'p-mist', 'Мист у зеркала', 'Фото для карточки', 'Уход за кожей', 'Сцена использования в ванной'),
          W('w4', 'p-kalos-towel', 'После душа', 'Фото для карточки', 'Уход за кожей', 'Lifestyle-кадр для соцсетей'),
        ],
        bio: 'Уход и макияж для чувствительной кожи. Умею записывать чистую озвучку в домашней студии. В портфолио пока только фото.',
        equipment: 'iPhone 14 Pro, микрофон Rode, свет Aputure',
        address: addr('Ева Чернова', 'Ростов-на-Дону', 'ПВЗ, Большая Садовая ул., 70 (демо-адрес)', '52-19'),
      },
    ];

    /* ---------- Заказчик (текущий аккаунт) ---------- */
    const brands = [{ id: 'b1', name: 'Северный уход', legal: 'ИП Морозова Е. А.', initials: 'СУ', contact: 'Екатерина Морозова' }];

    /* ---------- Кампании ---------- */
    const base = { brandId: 'b1', revisionsIncluded: U.config.revisionsIncluded };
    const campaigns = [
      Object.assign({}, base, {
        id: 'cmp1', status: 'active', createdAt: at(-16),
        title: 'Видеоотзыв на сыворотку с ниацинамидом',
        product: { name: 'Сыворотка «Ниацинамид 10%», 30 мл', category: 'Уход за кожей', price: 1290, link: '', media: 'p-black-bottle' },
        format: 'ugc', fee: 6500, creatorsNeeded: 3,
        deliverables: ['Видео 9:16, 30–60 секунд', '2 альтернативных первых кадра (хука)', 'Исходники без музыки'],
        keyPoints: ['Лёгкая текстура, не липнет', 'Подходит под макияж', 'Результат через 2–3 недели регулярного применения'],
        mustShow: ['Флакон с этикеткой в первые 3 секунды', 'Нанесение пипеткой на лицо', 'Как впитывается — крупный план'],
        avoid: ['Обещания «вылечить» акне', 'Сравнение с другими брендами по названию', 'Сильные фильтры на коже'],
        tone: 'Спокойно и честно, как совет подруге',
        shootDays: 7, shipProduct: true, returnProduct: false, rights: { scope: 'ads', term: '12' },
      }),
      Object.assign({}, base, {
        id: 'cmp2', status: 'active', createdAt: at(-9),
        title: 'Распаковка подарочного набора кремов для рук',
        product: { name: 'Набор кремов для рук «Три сезона»', category: 'Уход за кожей', price: 1890, link: '', media: 'p-lotion-hands' },
        format: 'ugc', fee: 5500, creatorsNeeded: 4,
        deliverables: ['Видео 9:16, 15–30 секунд', 'Фото-сет, 5 кадров'],
        keyPoints: ['Подарочная коробка без лишнего пластика', 'Три аромата: хвоя, облепиха, мята', 'Быстро впитывается'],
        mustShow: ['Открытие коробки', 'Каждый тюбик крупно', 'Нанесение на руки'],
        avoid: ['Посторонние бренды в кадре', 'Музыка с авторскими правами'],
        tone: 'Тёплое, подарочное настроение',
        shootDays: 10, shipProduct: true, returnProduct: false, rights: { scope: 'organic', term: '12' },
      }),
      Object.assign({}, base, {
        id: 'cmp3', status: 'recruiting', createdAt: at(-2),
        title: 'Инструкция с озвучкой: мист для лица',
        product: { name: 'Мист для лица «Утро», 100 мл', category: 'Уход за кожей', price: 990, link: '', media: 'p-white-bottle' },
        format: 'ugc', fee: 5000, creatorsNeeded: 2,
        deliverables: ['Видео с озвучкой, до 40 секунд', 'Текст озвучки отдельным файлом'],
        keyPoints: ['Три способа использовать: утром, поверх макияжа, в дороге', 'Мелкодисперсное распыление'],
        mustShow: ['Распыление на расстоянии 20 см', 'Флакон в руке'],
        avoid: ['Медицинские обещания'],
        tone: 'Понятно и по шагам',
        shootDays: 10, shipProduct: true, returnProduct: false, rights: { scope: 'ads', term: '6' },
      }),
      Object.assign({}, base, {
        id: 'cmp4', status: 'active', createdAt: at(-18),
        title: 'Анонс сыворотки в Telegram-канале',
        product: { name: 'Сыворотка «Ниацинамид 10%», 30 мл', category: 'Уход за кожей', price: 1290, link: '', media: 'p-black-bottle' },
        format: 'publish', fee: 15000, creatorsNeeded: 1,
        publication: {
          platform: 'Telegram-канал', service: 'create_publish', windowFrom: at(-1, 10), windowTo: at(5, 20), keepDays: '30',
          criteria: ['Пост доступен по ссылке весь срок хранения', 'Есть пометка «Реклама» и ссылка на товар', 'В посте — принятая версия ролика'],
        },
        deliverables: ['Видео 9:16 до 30 секунд', 'Пост в Telegram-канале с роликом'],
        keyPoints: ['Сыворотка для ежедневного ухода', 'Подходит под макияж'],
        mustShow: ['Флакон с этикеткой', 'Нанесение на лицо'],
        avoid: ['Медицинские обещания'],
        tone: 'Личный опыт, без продающих штампов',
        shootDays: 7, shipProduct: true, returnProduct: false, rights: { scope: 'organic', term: '12' },
      }),
      Object.assign({}, base, {
        id: 'cmp5', status: 'closed', createdAt: at(-40),
        title: 'Летний крем SPF 50 — короткие отзывы',
        product: { name: 'Крем SPF 50, 50 мл', category: 'Уход за кожей', price: 1490, link: '', media: 'p-white-bottle' },
        format: 'ugc', fee: 6000, creatorsNeeded: 2,
        deliverables: ['Видео 9:16, 15–30 секунд'], keyPoints: ['Не оставляет белых следов'], mustShow: ['Нанесение на лицо'], avoid: [],
        tone: 'Лёгкий, летний', shootDays: 7, shipProduct: true, returnProduct: false, rights: { scope: 'organic', term: '6' },
      }),
    ];
    const C = (id) => campaigns.find((x) => x.id === id);

    /* ---------- Отклики ---------- */
    const applications = [
      { id: 'a1', campaignId: 'cmp3', creatorId: 'c11', price: 5000, at: at(-1, 10), status: 'new', message: 'Записываю озвучку в домашней студии, покажу три сценария по шагам. Сдам за 6 дней после получения.' },
      { id: 'a2', campaignId: 'cmp3', creatorId: 'c5', price: 5000, at: at(-1, 15), status: 'new', message: 'Сниму руками и флаконом на светлом фоне, озвучка спокойная. Срок из брифа подходит.' },
      { id: 'a3', campaignId: 'cmp3', creatorId: 'c2', price: 9000, at: at(0, 9), status: 'new', message: 'Предлагаю формат «в кадре + озвучка». Цена выше брифа — готова обсудить вариант без лица.' },
      { id: 'a4', campaignId: 'cmp3', creatorId: 'c10', price: 4500, at: at(0, 11), status: 'new', message: 'Могу снять с питомцем в кадре: мист для лап после прогулки. Документы на проверке.' },
      { id: 'a5', campaignId: 'cmp3', creatorId: 'c1', price: 6500, at: at(0, 13), status: 'new', message: 'Сниму три сценария с крупными планами распыления. Озвучку запишу на петличку.' },
      { id: 'a6', campaignId: 'cmp5', creatorId: 'c1', price: 6500, at: at(-38, 12), status: 'declined', declineReason: 'Набрали нужное количество креаторов', message: 'Покажу нанесение без белых следов при дневном свете.' },
    ];

    /* ---------- Предложения и заказы ---------- */
    const offers = [];
    const orders = [];
    let offerN = 1;
    const mkOrder = (o) => {
      const cmp = C(o.campaignId);
      const terms = U.T.snapshot(cmp, U.config, o.termsOver);
      const offerId = 'of' + offerN++;
      offers.push({ id: offerId, campaignId: cmp.id, creatorId: o.creatorId, fee: o.fee, note: '', at: o.createdAt, status: 'accepted', source: 'invite', terms, orderId: o.id, decidedAt: o.agreedAt });
      const order = Object.assign({
        offerId, brandId: 'b1', terms, commission: Math.round(o.fee * U.config.serviceFeeRate),
        brief: { agreedAt: o.agreedAt, keyPoints: cmp.keyPoints, mustShow: cmp.mustShow, avoid: cmp.avoid, tone: cmp.tone },
        delivery: { carrier: null, track: null, sentAt: null, receivedAt: null },
        payment: { status: 'unpaid', paidAt: null, payoutStatus: 'none', payoutAt: null },
        revisionsUsed: 0, changesAt: null, acceptedAt: null, publication: null,
        versions: [], messages: [], history: [], tickets: [],
      }, o);
      delete order.termsOver;
      orders.push(order);
      return order;
    };
    const H = (d, actor, text) => ({ at: d, actor, text });

    /* 1. Сценарий: товар получен, креатор снимает */
    mkOrder({
      id: 'o-1051', campaignId: 'cmp1', creatorId: 'c1', fee: 6500, createdAt: at(-9, 10), agreedAt: at(-8, 11), stage: 'production',
      payment: { status: 'held', paidAt: at(-8, 12), payoutStatus: 'none', payoutAt: null },
      delivery: { carrier: 'Курьерская служба', track: 'RU48302117', sentAt: at(-6, 14), receivedAt: at(-3, 18) },
      messages: [
        { from: 'brand', at: at(-8, 12, 10), text: 'Алина, здравствуйте! Оплатили заказ, завтра отправим сыворотку. Главное — показать текстуру крупно.' },
        { from: 'creator', at: at(-8, 13, 2), text: 'Здравствуйте! Поняла. Сниму при дневном свете у окна, нанесение пипеткой и как впитывается.' },
        { from: 'system', at: at(-6, 14, 0), text: 'Заказчик добавил отправление RU48302117.' },
        { from: 'creator', at: at(-3, 18, 20), text: 'Посылка у меня, флакон целый. Снимаю в выходные.' },
      ],
      history: [
        H(at(-9, 10), 'brand', 'Предложение отправлено креатору'), H(at(-8, 11), 'creator', 'Креатор принял предложение — условия зафиксированы в заказе'),
        H(at(-8, 12), 'brand', 'Заказ оплачен — средства зарезервированы до приёмки'), H(at(-6, 14), 'brand', 'Товар отправлен: Курьерская служба, RU48302117'),
        H(at(-3, 18), 'creator', 'Креатор подтвердил получение. Срок сдачи рассчитан: 7 календарных дней'),
      ],
    });

    /* 2. Материалы на проверке */
    mkOrder({
      id: 'o-1048', campaignId: 'cmp1', creatorId: 'c2', fee: 9000, createdAt: at(-13, 9), agreedAt: at(-12, 10), stage: 'review',
      payment: { status: 'held', paidAt: at(-12, 11), payoutStatus: 'none', payoutAt: null },
      delivery: { carrier: 'Курьерская служба', track: 'RU48299054', sentAt: at(-11, 15), receivedAt: at(-8, 12) },
      versions: [{
        n: 1, at: at(-1, 17, 40), status: 'pending', note: 'Основной ролик и два варианта первого кадра. Исходники — в архиве.',
        files: [
          { media: 'v-talk', name: 'mironova_niacinamide_v1.mp4', size: '48,2 МБ', kind: 'video' },
          { media: 's-talk-a', name: 'hook_A.jpg', size: '2,1 МБ', kind: 'image' },
          { media: 's-talk-b', name: 'hook_B_flakon_v_kadre_kruplym_planom.jpg', size: '1,9 МБ', kind: 'image' },
        ],
        feedback: [],
      }],
      messages: [{ from: 'creator', at: at(-1, 17, 42), text: 'Загрузила первую версию. В хуке B флакон держу у лица — посмотрите, какой вариант ближе.' }],
      history: [
        H(at(-13, 9), 'brand', 'Предложение отправлено креатору'), H(at(-12, 10), 'creator', 'Креатор принял предложение — условия зафиксированы в заказе'),
        H(at(-12, 11), 'brand', 'Заказ оплачен — средства зарезервированы до приёмки'), H(at(-11, 15), 'brand', 'Товар отправлен: Курьерская служба, RU48299054'),
        H(at(-8, 12), 'creator', 'Креатор подтвердил получение. Срок сдачи рассчитан: 7 календарных дней'), H(at(-1, 17, 40), 'creator', 'Сдана версия 1 — 3 файла'),
      ],
    });

    /* 3. Товар в пути */
    mkOrder({
      id: 'o-1046', campaignId: 'cmp2', creatorId: 'c11', fee: 5000, createdAt: at(-6, 10), agreedAt: at(-5, 12), stage: 'in_transit',
      payment: { status: 'held', paidAt: at(-5, 13), payoutStatus: 'none', payoutAt: null },
      delivery: { carrier: 'Почта', track: '80085294173622', sentAt: at(-2, 11), receivedAt: null },
      messages: [
        { from: 'system', at: at(-2, 11), text: 'Заказчик добавил отправление 80085294173622.' },
        { from: 'creator', at: at(-1, 12, 30), text: 'Трек не обновляется со вчерашнего дня, написала в поддержку.' },
        { from: 'system', at: at(-1, 12, 35), text: 'Создано обращение в поддержку №3001 («Проблема с доставкой»).' },
      ],
      tickets: [{ id: 3001, topic: 'Проблема с доставкой', text: 'Трек 80085294173622 не обновляется больше суток. Посылка должна была прийти в пункт выдачи вчера.', role: 'creator', at: at(-1, 12, 35), status: 'open', log: [{ at: at(-1, 12, 35), by: 'creator', text: 'Обращение создано' }] }],
      history: [
        H(at(-6, 10), 'brand', 'Предложение отправлено креатору'), H(at(-5, 12), 'creator', 'Креатор принял предложение — условия зафиксированы в заказе'),
        H(at(-5, 13), 'brand', 'Заказ оплачен — средства зарезервированы до приёмки'), H(at(-2, 11), 'brand', 'Товар отправлен: Почта, 80085294173622'),
        H(at(-1, 12, 35), 'creator', 'Обращение в поддержку №3001: Проблема с доставкой'),
      ],
    });

    /* 4. Ожидает оплаты */
    mkOrder({
      id: 'o-1053', campaignId: 'cmp2', creatorId: 'c5', fee: 5000, createdAt: at(-1, 14), agreedAt: at(-1, 16), stage: 'agreement',
      messages: [{ from: 'creator', at: at(-1, 16, 5), text: 'Условия подходят, бриф прочитала. Жду товар.' }],
      history: [H(at(-1, 14), 'brand', 'Предложение отправлено креатору'), H(at(-1, 16), 'creator', 'Креатор принял предложение — условия зафиксированы в заказе')],
    });

    /* 5. Оплачен, ждёт отправки товара */
    mkOrder({
      id: 'o-1055', campaignId: 'cmp2', creatorId: 'c8', fee: 5500, createdAt: at(-3, 18), agreedAt: at(-2, 10), stage: 'shipping',
      payment: { status: 'held', paidAt: at(-2, 11), payoutStatus: 'none', payoutAt: null },
      messages: [{ from: 'creator', at: at(-2, 10, 20), text: 'Пункт выдачи указан в профиле. Сниму распаковку от двери.' }],
      history: [H(at(-3, 18), 'brand', 'Предложение отправлено креатору'), H(at(-2, 10), 'creator', 'Креатор принял предложение — условия зафиксированы в заказе'), H(at(-2, 11), 'brand', 'Заказ оплачен — средства зарезервированы до приёмки')],
    });

    /* 6. Завершён и выплачен */
    mkOrder({
      id: 'o-1037', campaignId: 'cmp1', creatorId: 'c1', fee: 6500, createdAt: at(-16, 9), agreedAt: at(-15, 10), stage: 'accepted',
      payment: { status: 'released', paidAt: at(-15, 11), payoutStatus: 'paid', payoutAt: at(-3, 14) },
      delivery: { carrier: 'Курьерская служба', track: 'RU48271840', sentAt: at(-14, 13), receivedAt: at(-12, 10) },
      revisionsUsed: 1, changesAt: at(-7, 11), acceptedAt: at(-5, 10),
      versions: [
        { n: 1, at: at(-8, 16), status: 'changes_requested', note: 'Основной ролик.', files: [{ media: 'v-wipe', name: 'sokolova_v1.mp4', size: '41,0 МБ', kind: 'video' }],
          feedback: [{ time: '0:03', text: 'Флакон в первом кадре виден слишком мелко — приблизьте или возьмите в руку.' }, { time: '0:08', text: 'Уберите фразу «убирает воспаления» — это медицинское обещание.' }] },
        { n: 2, at: at(-6, 12), status: 'accepted', note: 'Исправила первый кадр и текст.', files: [{ media: 'v-cream-close', name: 'sokolova_v2.mp4', size: '44,6 МБ', kind: 'video' }, { media: 's-cream-a', name: 'cover_v2.jpg', size: '1,8 МБ', kind: 'image' }], feedback: [] },
      ],
      messages: [{ from: 'brand', at: at(-5, 10), text: 'Спасибо, Алина! Приняли вторую версию.' }],
      history: [
        H(at(-16, 9), 'brand', 'Предложение отправлено креатору'), H(at(-15, 10), 'creator', 'Креатор принял предложение — условия зафиксированы в заказе'),
        H(at(-15, 11), 'brand', 'Заказ оплачен — средства зарезервированы до приёмки'), H(at(-14, 13), 'brand', 'Товар отправлен: Курьерская служба, RU48271840'),
        H(at(-12, 10), 'creator', 'Креатор подтвердил получение. Срок сдачи рассчитан: 7 календарных дней'), H(at(-8, 16), 'creator', 'Сдана версия 1 — 1 файл'),
        H(at(-7, 11), 'brand', 'Запрошены правки к версии 1 (правка 1 из 2)'), H(at(-6, 12), 'creator', 'Сдана версия 2 — 2 файла'),
        H(at(-5, 10), 'brand', 'Работа принята. Выплата креатору поставлена в очередь'), H(at(-3, 14), 'system', 'Выплата креатору отмечена как проведённая (симуляция)'),
      ],
    });

    /* 7. Формат с публикацией: ролик принят, ждём ссылку на пост */
    mkOrder({
      id: 'o-1044', campaignId: 'cmp4', creatorId: 'c2', fee: 15000, createdAt: at(-17, 10), agreedAt: at(-16, 12), stage: 'publishing',
      payment: { status: 'held', paidAt: at(-16, 13), payoutStatus: 'none', payoutAt: null },
      delivery: { carrier: 'Курьерская служба', track: 'RU48266120', sentAt: at(-15, 12), receivedAt: at(-11, 15) },
      versions: [{ n: 1, at: at(-6, 18), status: 'accepted', note: 'Ролик для поста и текст анонса.', files: [{ media: 'v-talk-mic', name: 'mironova_tg_v1.mp4', size: '52,7 МБ', kind: 'video' }], feedback: [] }],
      publication: { url: null, postedAt: null, confirmedAt: null },
      messages: [{ from: 'brand', at: at(-4, 11), text: 'Ролик согласовали. Публикуйте в период размещения и пришлите ссылку.' }],
      history: [
        H(at(-17, 10), 'brand', 'Предложение отправлено креатору'), H(at(-16, 12), 'creator', 'Креатор принял предложение — условия зафиксированы в заказе'),
        H(at(-16, 13), 'brand', 'Заказ оплачен — средства зарезервированы до приёмки'), H(at(-15, 12), 'brand', 'Товар отправлен: Курьерская служба, RU48266120'),
        H(at(-11, 15), 'creator', 'Креатор подтвердил получение. Срок сдачи рассчитан: 7 календарных дней'), H(at(-6, 18), 'creator', 'Сдана версия 1 — 1 файл'),
        H(at(-4, 11), 'brand', 'Ролик принят. Следующий шаг — публикация в период размещения'),
      ],
    });
    // Завершённый заказ: дата приёмки задана явно; для этапа «публикация» — тоже
    orders.find((o) => o.id === 'o-1044').acceptedContentAt = at(-4, 11);

    /* Приглашение, ожидающее ответа креатора (Алина) */
    offers.push({
      id: 'of' + offerN++, campaignId: 'cmp2', creatorId: 'c1', fee: 6500, at: at(-1, 9), status: 'pending', source: 'invite',
      note: 'Алина, нам понравились ваши крупные планы текстуры. Предлагаем снять распаковку набора кремов для рук.',
      terms: U.T.snapshot(C('cmp2'), U.config),
    });

    return {
      version: 2,
      seededAt: new Date(now).toISOString(),
      role: 'brand',
      creatorSelf: 'c1',
      settings: { autoAccept: false },
      creators, brands, campaigns, applications, offers, orders,
      signups: [
        { id: 's1', name: 'Мария Лаптева', email: 'm.lapteva@example.ru', city: 'Пермь', topics: ['Дом', 'Еда и напитки'], portfolio: 'https://example.ru/portfolio/lapteva', samples: ['p-candle', 'p-coffee-mug'], about: 'Снимаю уютные кухонные сцены и предметку для маркетплейсов, 2 года веду блог о доме.', at: at(-1, 9), status: 'pending', log: [] },
      ],
      drafts: {},
      counters: { order: 1056, ticket: 3002, offer: offerN },
    };
  };

  /* Справочники */
  U.TOPICS = ['Уход за кожей', 'Красота', 'Лайфстайл', 'Гаджеты', 'Распаковка', 'Еда и напитки', 'Дом', 'Спорт', 'Одежда и обувь', 'Товары для животных'];
  U.PRESENCE = { face: 'Лицо в кадре', hands: 'Только руки', voice: 'Озвучка' };
})();
