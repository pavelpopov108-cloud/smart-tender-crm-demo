/* Выбор дизайна: ?dizain=1..4 (запоминается), data-dizain на <html>, свой CSS и шрифты. Грузится в <head> до отрисовки. */
(function () {
  var n = 0, fromUrl = false;
  try { var m = /[?&]dizain=([1-4])\b/.exec(location.search); if (m) { n = +m[1]; fromUrl = true; } } catch (e) { }
  if (!n) { try { n = +localStorage.getItem('st-dizain') || 0; } catch (e) { } }
  if (!(n >= 1 && n <= 4)) n = 1;
  if (fromUrl) { try { localStorage.setItem('st-dizain', String(n)); } catch (e) { } }
  var de = document.documentElement;
  de.setAttribute('data-dizain', String(n));
  window.DIZAIN = n;
  /* вариант 3 — тёмный по умолчанию, пока тему не выбрали руками */
  try { if (n === 3 && !localStorage.getItem('st-theme')) de.setAttribute('data-theme', 'dark'); } catch (e) { if (n === 3) de.setAttribute('data-theme', 'dark'); }
  var fonts = {
    2: 'Golos+Text:wght@400..800&family=PT+Serif:wght@400;700&family=PT+Mono',
    3: 'IBM+Plex+Sans:wght@400;500;600;700&family=IBM+Plex+Mono:wght@500;600',
    4: 'Onest:wght@400..800&family=JetBrains+Mono:wght@500;600'
  };
  if (fonts[n]) document.write('<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=' + fonts[n] + '&display=swap">');
  document.write('<link rel="stylesheet" href="dizain-' + n + '.css">');
})();
