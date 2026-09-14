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
  const detailTitle = document.getElementById('detailTitle');
  const detailText = document.getElementById('detailText');
  const detailIcon = document.getElementById('detailIcon');

  const clips = ['intro-1.mp4', 'intro-2.mp4'];
  let clipIndex = 0;

  const partInfo = {
    flower: { title: 'الزهرة', icon: '🌸', text: 'الزهرة تساعد النبتة على التكاثر وتكوين الثمار والبذور.' },
    fruit: { title: 'الثمرة', icon: '🍅', text: 'الثمرة تحمي البذور الموجودة بداخلها.' },
    leaves: { title: 'الأوراق', icon: '🍃', text: 'الأوراق تساعد النبتة على صنع غذائها باستخدام ضوء الشمس.' },
    stem: { title: 'الساق', icon: '🌿', text: 'الساق يحمل أجزاء النبتة وينقل الماء والغذاء بينها.' },
    roots: { title: 'الجذور', icon: '🌱', text: 'الجذور تثبّت النبتة في التربة وتمتص الماء والأملاح.' }
  };

  function show(name) {
    Object.values(screens).forEach(s => s.classList.remove('active'));
    screens[name].classList.add('active');
  }

  function loadClip(index) {
    clipIndex = index;
    video.pause();
    video.removeAttribute('src');
    video.load();
    video.src = clips[index];
    video.load();
  }

  async function playCurrentClip() {
    manualPlayBtn.classList.add('hidden');
    try {
      await video.play();
    } catch (err) {
      manualPlayBtn.classList.remove('hidden');
    }
  }

  startBtn.addEventListener('click', async () => {
    show('video');
    discoverBtn.classList.add('hidden');
    loadClip(0);
    await playCurrentClip();
  });

  manualPlayBtn.addEventListener('click', playCurrentClip);

  video.addEventListener('ended', async () => {
    if (clipIndex === 0) {
      loadClip(1);
      await playCurrentClip();
    } else {
      video.pause();
      discoverBtn.classList.remove('hidden');
    }
  });

  video.addEventListener('error', () => {
    manualPlayBtn.textContent = 'تعذر تشغيل الفيديو — اضغط للمحاولة';
    manualPlayBtn.classList.remove('hidden');
  });

  discoverBtn.addEventListener('click', () => {
    show('parts');
  });

  document.querySelectorAll('.part-hotspot').forEach(btn => {
    btn.addEventListener('click', () => {
      const info = partInfo[btn.dataset.part];
      if (!info) return;
      detailTitle.textContent = info.title;
      detailText.textContent = info.text;
      detailIcon.textContent = info.icon;
      show('detail');
    });
  });

  backBtn.addEventListener('click', () => show('parts'));

  // تأكد من بداية نظيفة عند الرجوع للصفحة من الذاكرة.
  window.addEventListener('pageshow', (e) => {
    if (e.persisted) {
      video.pause();
      show('cover');
    }
  });
})();
