(() => {
  'use strict';

  const screens = {
    cover: document.getElementById('coverScreen'),
    video: document.getElementById('videoScreen'),
    parts: document.getElementById('partsScreen'),
    detail: document.getElementById('detailScreen')
  };

  const startBtn = document.getElementById('startBtn');
  const video = document.getElementById('introVideo');
  const manualPlayBtn = document.getElementById('manualPlayBtn');
  const discoverBtn = document.getElementById('discoverBtn');
  const backBtn = document.getElementById('backBtn');
  const nextBtn = document.getElementById('nextBtn');
  const detailImage = document.getElementById('detailImage');

  const partOrder = ['roots', 'stem', 'leaves', 'flower', 'fruit'];
  const partInfo = {
    roots: { img: 'roots.png', title: 'الجذور' },
    stem: { img: 'stem.png', title: 'الساق' },
    leaves: { img: 'leaves.png', title: 'الأوراق' },
    flower: { img: 'flower.png', title: 'الزهرة' },
    fruit: { img: 'fruit.png', title: 'الثمرة' },
    seed: { img: 'seed.png', title: 'البذرة' }
  };

  let currentPart = 'roots';

  function show(name) {
    Object.values(screens).forEach(s => s.classList.remove('active'));
    screens[name].classList.add('active');
  }

  async function playIntro() {
    manualPlayBtn.classList.add('hidden');
    discoverBtn.classList.add('hidden');
    video.currentTime = 0;
    try {
      await video.play();
    } catch (e) {
      manualPlayBtn.classList.remove('hidden');
    }
  }

  function openPart(part) {
    const info = partInfo[part];
    if (!info) return;
    currentPart = part;
    detailImage.src = info.img;
    detailImage.alt = info.title;
    const idx = partOrder.indexOf(part);
    if (idx === -1 || idx === partOrder.length - 1) {
      nextBtn.textContent = 'الرجوع للأجزاء';
    } else {
      nextBtn.textContent = 'الجزء التالي ←';
    }
    show('detail');
  }

  startBtn.addEventListener('click', async () => {
    show('video');
    await playIntro();
  });

  manualPlayBtn.addEventListener('click', playIntro);

  video.addEventListener('ended', () => {
    discoverBtn.classList.remove('hidden');
  });

  video.addEventListener('error', () => {
    manualPlayBtn.textContent = 'تعذر تشغيل الفيديو — اضغط للمحاولة';
    manualPlayBtn.classList.remove('hidden');
  });

  discoverBtn.addEventListener('click', () => show('parts'));

  document.querySelectorAll('.part-hotspot').forEach(btn => {
    btn.addEventListener('click', () => openPart(btn.dataset.part));
  });

  backBtn.addEventListener('click', () => show('parts'));
  nextBtn.addEventListener('click', () => {
    const idx = partOrder.indexOf(currentPart);
    if (idx === -1 || idx === partOrder.length - 1) {
      show('parts');
      return;
    }
    openPart(partOrder[idx + 1]);
  });

  window.addEventListener('pageshow', (e) => {
    if (e.persisted) {
      video.pause();
      video.currentTime = 0;
      discoverBtn.classList.add('hidden');
      show('cover');
    }
  });
})();
