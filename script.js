const coverScreen = document.getElementById('coverScreen');
const videoScreen = document.getElementById('videoScreen');
const partsScreen = document.getElementById('partsScreen');
const partDetail = document.getElementById('partDetail');
const startBtn = document.getElementById('startBtn');
const discoverBtn = document.getElementById('discoverBtn');
const video1 = document.getElementById('video1');
const video2 = document.getElementById('video2');
const endOverlay = document.getElementById('videoEndOverlay');
const backBtn = document.getElementById('backBtn');
const partTitle = document.getElementById('partTitle');
const partText = document.getElementById('partText');
const partIcon = document.getElementById('partIcon');

video1.src = 'assets/intro-1.mp4';
video2.src = 'assets/intro-2.mp4';

function show(screen){
  [coverScreen,videoScreen,partsScreen,partDetail].forEach(s=>s.classList.remove('active'));
  screen.classList.add('active');
  window.scrollTo({top:0,behavior:'instant'});
}

async function playVideo(el){
  el.currentTime = 0;
  try { await el.play(); }
  catch (e) { console.warn('Autoplay blocked:', e); }
}

startBtn.addEventListener('click', async ()=>{
  show(videoScreen);
  video1.classList.remove('hidden');
  video2.classList.add('hidden');
  endOverlay.classList.add('hidden');
  await playVideo(video1);
});

video1.addEventListener('ended', async ()=>{
  video1.classList.add('hidden');
  video2.classList.remove('hidden');
  await playVideo(video2);
});

video2.addEventListener('ended', ()=>{
  endOverlay.classList.remove('hidden');
});

discoverBtn.addEventListener('click', ()=>show(partsScreen));

const parts = {
  flower:{title:'الزهرة',icon:'🌸',text:'سنضيف هنا فيديو الزهرة ووظيفتها.'},
  fruit:{title:'الثمرة',icon:'🍅',text:'سنضيف هنا فيديو الثمرة ووظيفتها.'},
  leaves:{title:'الأوراق',icon:'🍃',text:'سنضيف هنا فيديو الأوراق ووظيفتها.'},
  stem:{title:'الساق',icon:'🌿',text:'سنضيف هنا فيديو الساق ووظيفته.'},
  roots:{title:'الجذور',icon:'🌱',text:'سنضيف هنا فيديو الجذور ووظيفتها.'}
};

document.querySelectorAll('.hotspot').forEach(btn=>{
  btn.addEventListener('click',()=>{
    const data = parts[btn.dataset.part];
    partTitle.textContent = data.title;
    partIcon.textContent = data.icon;
    partText.textContent = data.text;
    show(partDetail);
  });
});

backBtn.addEventListener('click',()=>show(partsScreen));
