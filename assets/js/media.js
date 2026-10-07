/* Реестр медиа. Все файлы — со стоков с лицензией, разрешающей бесплатное
   коммерческое использование без обязательной атрибуции:
   Unsplash License — https://unsplash.com/license
   Pexels License   — https://www.pexels.com/license/
   Профили собраны из серий одного автора: в работах одного креатора — один и тот же человек.
   Длительности видео измерены по самим файлам (loadedmetadata).
   Полный список: MEDIA_SOURCES.md и страница #/sources. */
(function () {
  const UNS = 'https://unsplash.com/photos/';
  const PEX = 'https://www.pexels.com/video/';

  // [id, unsplash photo id, alt, author, slug, object-position]
  const photos = [
    // Ева Чернова — серия Kalos Skincare (одна модель)
    ['p-kalos-bottle', '1599847903756-c359cd73f9b4', 'Девушка держит флакон с бело-чёрной этикеткой', 'Kalos Skincare', 'woman-holding-white-and-black-labeled-bottle-DlkU48tSlHw', '50% 30%'],
    ['p-kalos-towel', '1599847962388-ab2525732eec', 'Девушка в полотенце со флаконом средства', 'Kalos Skincare', 'woman-in-white-towel-holding-bottle-igY71C40UEY', '50% 30%'],
    ['p-mist', '1599847987657-881f11b92a75', 'Девушка в халате наносит мист для лица у зеркала', 'Kalos Skincare', 'woman-spraying-facial-mist-in-bathroom-jyKa0Ynxvow', '50% 35%'],
    ['p-kalos-hold', '1599847944101-57816855bb33', 'Флакон с белой этикеткой в руке', 'Kalos Skincare', 'person-holding-white-labeled-bottle-baXysI54o5I', '50% 50%'],
    // Софья Николаева — серия Look Studio
    ['p-yoga', '1713201673819-122ab540f947', 'Девушка на коврике для йоги в комнате', 'Look Studio', 'a-woman-sitting-on-a-yoga-mat-in-a-room-BPWTDYf7ICI', '50% 50%'],
    ['p-kitchen', '1713201431727-2904d90ff959', 'Девушка готовит на светлой кухне', 'Look Studio', 'a-woman-standing-in-a-kitchen-preparing-food-qptXKoNVOlQ', '50% 40%'],
    // Предметные кадры без лиц
    ['p-blender', '1649776648468-c4c2c2859469', 'Руки с блендером и смузи на кухне', 'Jonathan Cooper', 'a-woman-is-holding-a-blender-with-a-tattoo-on-her-arm-9ikR2HHjuNE', '50% 50%'],
    ['p-lotion-hands', '1619451427882-6aaaded0cc61', 'Руки наносят лосьон из флакона с дозатором', 'Nataliya Melnychuk', 'hands-applying-lotion-from-white-pump-dFBhXJHKNeo', '50% 50%'],
    ['p-black-bottle', '1620916297397-a4a5402a3c6c', 'Рука держит тёмный стеклянный флакон', 'Mathilde Langevin', 'person-holding-black-glass-bottle-FDRaYqiTY1k', '50% 50%'],
    ['p-white-bottle', '1601049541079-473f79fd3746', 'Рука держит белый флакон средства', 'Neauthy Skincare', 'person-holding-white-plastic-bottle-M8Vl5jWSV9s', '50% 50%'],
    ['p-pour-coffee', '1522012188892-24beb302783d', 'Кофе наливают из кофейника в чашку', 'Nathan Dumlao', 'person-pouring-black-coffee-in-white-ceramic-mug-placed-on-brown-wooden-table-during-daytime-N3btvQ51dL0', '50% 50%'],
    ['p-coffee-mug', '1495862433577-132cf20d7902', 'Приготовление кофе в кружку на кухне', 'Nathan Dumlao', 'person-pouring-coffee-in-mug-zTZRZV86GhE', '50% 50%'],
    ['p-sneakers-hand', '1743100619209-0f3695fa4c92', 'Рука держит пару светлых кед', 'Thomas-Olivier Guimond', 'a-hand-holds-a-pair-of-cream-colored-sneakers-mLntf5GgqhM', '50% 50%'],
    ['p-box-give', '1566576721346-d4a3b4eaeb55', 'Руки передают картонную коробку', 'RoseBox', 'person-giving-brown-box-BFdSCxmqvYc', '50% 50%'],
    ['p-box-items', '1571510176556-bcc735aaf06d', 'Открытая коробка с товарами для ухода', 'RoseBox', 'woman-beside-box-of-items-uB6MQIpnPns', '50% 50%'],
    ['p-candle', '1699458586548-5e2c0c99dad9', 'Рука зажигает свечу на столе', 'Katya Azimova', 'a-person-lighting-a-candle-on-a-table-ve9yv6BciKI', '50% 50%'],
    ['p-dog-treat', '1741942732547-45a0d0c2b99a', 'Собака ждёт лакомство из рук', 'Dogfluence.com', 'a-dog-eagerly-awaits-a-tasty-treat-ENqs0WEM3nY', '50% 50%'],
    ['p-dog-lick', '1741942731788-5712579ebb16', 'Собака облизывается в ожидании лакомства', 'Dogfluence.com', 'dog-awaits-treat-with-anticipation-and-a-lick-avoDhYsEX-c', '50% 45%'],
    ['p-dog-bowl', '1601758228006-964e41e5e8eb', 'Собака ест корм из миски', 'Chewy', 'black-and-white-short-coated-dog-eating-NOBRu2TAqcs', '50% 50%'],
    // Иллюстрации лендинга (без привязки к креаторам)
    ['p-tripod', '1665327475815-afea816da76a', 'Девушка снимает видео на телефон на штативе дома', 'Daria Trofimova', 'a-woman-sitting-on-a-bed-holding-a-phone-IiTUVLikdJQ', '50% 45%'],
    ['p-phone-model', '1551232865-e24823b9e922', 'Съёмка девушки на смартфон', 'Amanda Vick', 'person-holding-white-smartphone-taking-photo-of-woman-wearing-blue-jeans-pPV-kqfs5wA', '50% 45%'],
    ['p-phone-shoot', '1543525469-65b61cc2bc06', 'Руки снимают предмет на смартфон', 'charlesdeluvio', 'person-using-smartphone-and-capturing-images-lkHNDf-oXTk', '50% 50%'],
    ['p-bottle-hold', '1670201202833-b0932731628f', 'Девушка показывает флакон с прозрачным средством', 'Laura Jaeger', 'a-woman-holding-a-bottle-_dSHqe4mcWE', '50% 30%'],
    ['p-coffee-man', '1679935725383-1d03c9671d3b', 'Мужчина в джинсовой куртке с чашкой кофе', 'Sergey Sokolov', 'a-man-in-a-denim-jacket-holding-a-cup-of-coffee-i6r0L-7JXro', '50% 25%'],
    ['p-pink-smile', '1631248621222-64bba871dc23', 'Девушка в розовой рубашке улыбается', 'Chalo Garcia', 'woman-in-pink-and-white-shirt-smiling-62aBf07lkwQ', '50% 30%'],
  ];

  // [id, pexels id, файл sd, slug постера, alt, slug страницы, длительность, object-position]
  const videos = [
    // Алина Соколова — серия 12322xxx (одна модель)
    ['v-face-cream', '12322654', 'sd_540_960_30fps', 'adult-beautiful-brunette-cute-12322654', 'Девушка наносит крем для лица', 'a-woman-applying-face-cream-12322654', '0:10', '50% 30%'],
    ['v-cream-close', '12322665', 'sd_540_960_30fps', 'pexels-photo-12322665', 'Крем на коже крупным планом', 'close-up-of-a-young-woman-applying-cream-on-her-face-12322665', '0:14', '50% 35%'],
    ['v-eye-cream', '12322659', 'sd_540_960_30fps', 'beautiful-bed-bedroom-brunette-12322659', 'Нанесение средства вокруг глаз', 'a-woman-applying-a-cosmetic-product-around-her-eyes-12322659', '0:11', '50% 30%'],
    ['v-eye-mask', '12322622', 'sd_540_960_30fps', 'pexels-photo-12322622', 'Патчи под глаза', 'a-young-woman-applying-under-eye-mask-12322622', '0:14', '50% 30%'],
    ['v-wipe', '12322612', 'sd_540_960_30fps', 'adult-bed-bedroom-bridal-12322612', 'Очищение лица салфеткой', 'a-woman-using-a-a-facial-cleansing-wipe-12322612', '0:10', '50% 30%'],
    // Дарья Миронова — серия 8135xxx
    ['v-talk', '8135207', 'sd_540_960_25fps', 'pexels-photo-8135207', 'Девушка рассказывает о продукте в камеру', 'woman-is-talking-while-looking-at-camera-8135207', '0:13', '50% 30%'],
    ['v-talk-2', '8135208', 'sd_540_960_25fps', 'adolescent-adult-beautiful-brunette-8135208', 'Девушка говорит в камеру крупным планом', 'woman-looking-at-camera-and-speaking-8135208', '0:13', '50% 30%'],
    ['v-talk-mic', '8135220', 'sd_540_960_25fps', 'adolescent-adult-audio-beautiful-8135220', 'Девушка записывает обращение у микрофона', 'woman-speaking-and-waving-in-front-of-mic-8135220', '0:15', '50% 30%'],
    // Вероника Ким — серия 7191xxx
    ['v-unbox-phone', '7191509', 'sd_540_960_25fps', 'adult-asian-beautiful-brunette-7191509', 'Девушка распаковывает смартфон за столом', 'a-woman-unboxing-a-smartphone-7191509', '0:35', '50% 40%'],
    ['v-unbox-phone-2', '7191511', 'sd_540_960_25fps', 'adult-asian-breakfast-chair-7191511', 'Первое включение нового телефона', 'woman-unboxing-new-phone-7191511', '0:20', '50% 40%'],
    ['v-open-box', '7191514', 'sd_540_960_25fps', 'adult-asian-bed-bedroom-7191514', 'Открытие коробки с техникой', 'woman-opening-a-box-7191514', '0:33', '50% 40%'],
    ['v-laptop', '7191504', 'sd_540_960_25fps', 'adolescent-adult-asian-beautiful-7191504', 'Осмотр ноутбука после распаковки', 'a-woman-inspecting-a-laptop-7191504', '0:23', '50% 40%'],
    // Камила Галиева — серия 13736xxx
    ['v-barista', '13736673', 'sd_540_960_24fps', 'adult-bar-breakfast-caffeine-13736673', 'Бариста засыпает зёрна в кофемолку', 'a-barista-putting-coffee-beans-into-an-electric-grinder-13736673', '0:12', '50% 40%'],
    ['v-filter', '13736682', 'sd_540_960_24fps', 'adult-bar-beer-blur-13736682', 'Молотый кофе в холдере', 'a-barista-filling-a-filter-with-ground-coffee-13736682', '0:10', '50% 50%'],
    ['v-milk', '13736677', 'sd_540_960_24fps', 'adult-blur-business-child-13736677', 'Взбивание молока для капучино', 'a-barista-frothing-milk-on-an-espresso-machine-13736677', '0:12', '50% 50%'],
    ['v-make-coffee', '13736701', 'sd_540_960_24fps', 'adult-business-coffee-commerce-13736701', 'Приготовление кофе за стойкой', 'a-woman-making-coffee-13736701', '0:12', '50% 35%'],
    // Ксения Белова — серия 5937xxx
    ['v-lotion-body', '5937411', 'sd_540_960_24fps', 'pexels-photo-5937411', 'Нанесение лосьона дома', 'woman-putting-on-lotion-5937411', '0:10', '50% 40%'],
    ['v-face-care', '5937414', 'sd_540_960_24fps', 'pexels-photo-5937414', 'Уходовые средства для лица утром', 'woman-putting-on-facial-care-products-5937414', '0:10', '50% 35%'],
    ['v-body-cream', '5937388', 'sd_540_960_24fps', 'pexels-photo-5937388', 'Крем для тела в спальне', 'woman-using-body-cream-in-her-bedroom-5937388', '0:10', '50% 40%'],
    // Марк Ершов — серия 8360xxx
    ['v-man-rec', '8360178', 'sd_506_960_25fps', 'blogger-challenge-content-creating-8360178', 'Мужчина записывает видео на телефон', 'man-recording-himself-8360178', '0:38', '50% 40%'],
    ['v-man-rec-2', '8360171', 'sd_506_960_25fps', 'blogger-challenge-content-creating-8360171', 'Запись обзора на телефон', 'man-recording-himself-8360171', '0:47', '50% 40%'],
    ['v-man-rec-3', '8360258', 'sd_506_960_25fps', 'pexels-photo-8360258', 'Блогер снимает себя дома', 'man-recording-himself-8360258', '0:35', '50% 40%'],
    ['v-man-phone', '8360264', 'sd_506_960_25fps', 'pexels-photo-8360264', 'Съёмка ролика на смартфон', 'a-man-recording-a-video-on-a-cellphone-8360264', '0:32', '50% 40%'],
    // Полина Захарова — серия 8788xxx
    ['v-bag', '8788557', 'sd_540_960_25fps', 'adult-beautiful-brunette-buy-8788557', 'Девушка достаёт одежду из пакета', 'woman-taking-out-a-crop-top-from-a-shopping-bag-8788557', '0:10', '50% 40%'],
    ['v-measure', '8788566', 'sd_540_960_25fps', 'adult-baby-beautiful-book-bindings-8788566', 'Замер размера вещи сантиметром', 'a-woman-getting-the-size-of-a-crop-top-using-tape-measure-8788566', '0:14', '50% 40%'],
    ['v-paper-bag', '8788563', 'sd_540_960_25fps', 'adult-beautiful-brunette-buy-8788563', 'Девушка с бумажным пакетом покупок', 'a-footage-of-a-woman-holding-paper-bag-8788563', '0:11', '50% 40%'],
    // Артём Шилов — серия 6956xxx
    ['v-unbox-man', '6956639', 'sd_540_960_25fps', 'buyer-credit-card-internet-online-purchase-6956639', 'Мужчина распаковывает коробку с товаром', 'man-opening-a-box-6956639', '0:07', '50% 40%'],
    ['v-unbox-man-2', '6956637', 'sd_540_960_25fps', 'buyer-credit-card-internet-online-purchase-6956637', 'Открытие посылки крупным планом', 'man-wearing-denim-jacket-opening-a-box-6956637', '0:08', '50% 40%'],
    ['v-box-from-bag', '6956642', 'sd_540_960_25fps', 'buyer-credit-card-internet-online-purchase-6956642', 'Коробка из бумажного пакета', 'a-man-taking-out-a-box-from-a-paper-bag-6956642', '0:07', '50% 40%'],
    ['v-check-bag', '6956644', 'sd_540_960_25fps', 'buyer-credit-card-internet-online-purchase-6956644', 'Проверка содержимого пакета', 'man-checking-content-of-paper-bag-6956644', '0:07', '50% 40%'],
    // Ева Чернова — руки и озвучка
    ['v-lotion', '7196312', 'sd_540_960_25fps', 'pexels-photo-7196312', 'Руки наносят лосьон крупным планом', 'woman-applying-lotion-to-her-hands-7196312', '0:09', '50% 50%'],
    // Иллюстрация лендинга
    ['v-film-home', '4962724', 'sd_540_960_25fps', 'pexels-photo-4962724', 'Девушка снимает себя дома', 'woman-filming-herself-at-home-4962724', '0:18', '50% 40%'],
  ];

  // Стоп-кадры из роликов (обложки и «хуки»): [id, из видео, alt]
  const stills = [
    ['s-talk-a', 'v-talk', 'Стоп-кадр: рассказ в камеру'],
    ['s-talk-b', 'v-talk-2', 'Стоп-кадр: крупный план'],
    ['s-cream-a', 'v-cream-close', 'Стоп-кадр: текстура крема'],
    ['s-wipe', 'v-wipe', 'Стоп-кадр: очищение'],
  ];

  const M = {};
  photos.forEach(([id, uid, alt, author, slug, pos]) => {
    M[id] = { id, kind: 'image', alt, pos, uid, author, source: 'Unsplash', license: 'Unsplash License', page: UNS + slug };
  });
  videos.forEach(([id, pid, file, poster, alt, slug, dur, pos]) => {
    M[id] = {
      id, kind: 'video', alt, pos, dur, pid,
      src: `https://videos.pexels.com/video-files/${pid}/${pid}-${file}.mp4`,
      posterBase: `https://images.pexels.com/videos/${pid}/${poster}.jpeg`,
      author: 'автор указан на странице', source: 'Pexels', license: 'Pexels License', page: PEX + slug + '/',
    };
  });
  stills.forEach(([id, from, alt]) => {
    const v = M[from];
    M[id] = { id, kind: 'image', alt, pos: v.pos, posterBase: v.posterBase, still: from, author: v.author, source: v.source, license: v.license, page: v.page };
  });

  /* URL изображения нужного размера. Для видео — постер. */
  U.mediaUrl = function (id, w, h) {
    const m = M[id];
    if (!m) return '';
    if (m.uid) {
      let q = `?auto=format&fit=crop&crop=faces,entropy&q=70&w=${w}`;
      if (h) q += `&h=${h}`;
      return `https://images.unsplash.com/photo-${m.uid}${q}`;
    }
    return `${m.posterBase}?auto=compress&cs=tinysrgb&fit=crop&w=${w}${h ? '&h=' + h : ''}`;
  };
  U.media = M;
})();
