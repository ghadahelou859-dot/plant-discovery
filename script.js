(() => {
  'use strict';

  const screens = {
    cover: document.getElementById('coverScreen'),
    video: document.getElementById('videoScreen'),
    parts: document.getElementById('partsScreen'),
    detail: document.getElementById('detailScreen'),
    quiz: document.getElementById('quizScreen'),
    result: document.getElementById('resultScreen')
  };

  const startBtn = document.getElementById('startBtn');
  const potStartBtn = document.getElementById('potStartBtn');
  const video = document.getElementById('introVideo');
  const manualPlayBtn = document.getElementById('manualPlayBtn');
  const discoverBtn = document.getElementById('discoverBtn');
  const backBtn = document.getElementById('backBtn');
  const nextBtn = document.getElementById('nextBtn');
  const detailImage = document.getElementById('detailImage');
  const narrationText = document.getElementById('narrationText');
  const quizFromPartsBtn = document.getElementById('quizFromPartsBtn');
  const quizProgress = document.getElementById('quizProgress');
  const timer = document.getElementById('timer');
  const timerNumber = document.getElementById('timerNumber');
  const questionText = document.getElementById('questionText');
  const answersEl = document.getElementById('answers');
  const feedback = document.getElementById('feedback');
  const nextQuestionBtn = document.getElementById('nextQuestionBtn');
  const scoreText = document.getElementById('scoreText');
  const restartQuizBtn = document.getElementById('restartQuizBtn');
  const returnPartsBtn = document.getElementById('returnPartsBtn');

  const partOrder = ['roots','stem','leaves','flower','fruit'];
  const partInfo = {
    roots: { img:'roots.png', title:'الجذور', text:'الجذور تثبّت النبتة في التربة وتمتص الماء والأملاح.' },
    stem: { img:'stem.png', title:'الساق', text:'الساق يحمل أجزاء النبتة وينقل الماء والغذاء بينها.' },
    leaves: { img:'leaves.png', title:'الأوراق', text:'الأوراق تصنع غذاء النبتة بمساعدة ضوء الشمس.' },
    flower: { img:'flower.png', title:'الزهرة', text:'الزهرة تساعد النبتة على تكوين الثمار والبذور.' },
    fruit: { img:'fruit.png', title:'الثمرة', text:'الثمرة تحمل البذور وتحميها.' }
  };

  const questions = [
    { q:'أي جزء يثبّت النبتة في التربة ويمتص الماء؟', a:['الجذور','الزهرة','الثمرة'], correct:0 },
    { q:'الساق ينقل الماء والغذاء بين أجزاء النبتة.', a:['نعم','لا'], correct:0 },
    { q:'أي جزء يصنع غذاء النبتة بمساعدة ضوء الشمس؟', a:['الأوراق','الجذور','الثمرة'], correct:0 },
    { q:'الزهرة تساعد النبتة على تكوين الثمار والبذور.', a:['نعم','لا'], correct:0 },
    { q:'أي جزء يحمل البذور ويحميها؟', a:['الثمرة','الساق','الأوراق'], correct:0 },
    { q:'من أين تبدأ حياة النبتة؟', a:['البذرة','الزهرة','الساق'], correct:0 }
  ];

  let currentPart = 'roots';
  let qIndex = 0;
  let score = 0;
  let seconds = 5;
  let timerId = null;
  let answered = false;

  function show(name){
    Object.values(screens).forEach(s=>s.classList.remove('active'));
    screens[name].classList.add('active');
  }

  async function playIntro(){
    manualPlayBtn.classList.add('hidden');
    discoverBtn.classList.add('hidden');
    video.currentTime = 0;
    try{ await video.play(); }
    catch(e){ manualPlayBtn.classList.remove('hidden'); }
  }

  async function startExperience(){
    show('video');
    await playIntro();
  }

  function openPart(part){
    const info = partInfo[part];
    if(!info) return;
    currentPart = part;
    detailImage.src = info.img;
    detailImage.alt = info.title;
    narrationText.textContent = info.text;
    const idx = partOrder.indexOf(part);
    nextBtn.textContent = idx === partOrder.length-1 ? 'ابدأ التحدي 🏆' : 'الجزء التالي ←';
    show('detail');
  }

  function stopTimer(){
    if(timerId){ clearInterval(timerId); timerId = null; }
  }

  function updateTimer(){
    timerNumber.textContent = seconds;
    timer.style.setProperty('--p', `${seconds*20}%`);
  }

  function timeUp(){
    answered = true;
    stopTimer();
    timer.classList.add('expired');
    timerNumber.textContent = '0';
    feedback.textContent = 'انتهى الوقت ⏰';
    feedback.className = 'feedback bad';
    answersEl.querySelectorAll('button').forEach(b=>b.disabled=true);
    nextQuestionBtn.classList.remove('hidden');
  }

  function startTimer(){
    stopTimer();
    seconds = 5;
    timer.classList.remove('expired');
    updateTimer();
    timerId = setInterval(()=>{
      seconds -= 1;
      updateTimer();
      if(seconds <= 0) timeUp();
    },1000);
  }

  function renderQuestion(){
    answered = false;
    feedback.textContent = '';
    feedback.className = 'feedback';
    nextQuestionBtn.classList.add('hidden');
    const item = questions[qIndex];
    quizProgress.textContent = `سؤال ${qIndex+1} من ${questions.length}`;
    questionText.textContent = item.q;
    answersEl.innerHTML = '';
    item.a.forEach((label, idx)=>{
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'answer-btn';
      btn.textContent = label;
      btn.addEventListener('click',()=>chooseAnswer(btn, idx));
      answersEl.appendChild(btn);
    });
    startTimer();
  }

  function playApplause(){
    try{
      const Ctx = window.AudioContext || window.webkitAudioContext;
      if(!Ctx) return;
      const ctx = new Ctx();
      const now = ctx.currentTime;
      for(let i=0;i<16;i++){
        const t = now + i*0.045 + Math.random()*0.018;
        const dur = 0.045 + Math.random()*0.025;
        const buffer = ctx.createBuffer(1, Math.floor(ctx.sampleRate*dur), ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for(let j=0;j<data.length;j++){
          const env = Math.pow(1-j/data.length, 2.2);
          data[j] = (Math.random()*2-1)*env;
        }
        const src = ctx.createBufferSource();
        src.buffer = buffer;
        const filter = ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.value = 1200 + Math.random()*900;
        filter.Q.value = 0.7;
        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0.0001, t);
        gain.gain.exponentialRampToValueAtTime(0.16 + Math.random()*0.08, t+0.006);
        gain.gain.exponentialRampToValueAtTime(0.0001, t+dur);
        src.connect(filter).connect(gain).connect(ctx.destination);
        src.start(t);
      }
      setTimeout(()=>ctx.close(),1400);
    }catch(e){}
  }

  function celebrate(){
    const layer = document.createElement('div');
    layer.className = 'celebrate';
    const icons = ['⭐','✨','🌟','👏'];
    for(let i=0;i<18;i++){
      const s = document.createElement('span');
      s.textContent = icons[i%icons.length];
      s.style.left = `${46 + (Math.random()*8-4)}%`;
      s.style.top = `${48 + (Math.random()*8-4)}%`;
      s.style.setProperty('--x', `${(Math.random()*360-180)}px`);
      s.style.setProperty('--y', `${(Math.random()*-240-40)}px`);
      layer.appendChild(s);
    }
    document.body.appendChild(layer);
    setTimeout(()=>layer.remove(),1000);
  }

  function chooseAnswer(btn, idx){
    if(answered) return;
    answered = true;
    stopTimer();
    const item = questions[qIndex];
    const all = [...answersEl.querySelectorAll('button')];
    all.forEach(b=>b.disabled=true);
    if(idx === item.correct){
      btn.classList.add('correct');
      feedback.textContent = 'أحسنت يا بطل! 🌟';
      feedback.className = 'feedback good';
      score += 1;
      playApplause();
      celebrate();
    }else{
      btn.classList.add('wrong');
      all[item.correct].classList.add('correct');
      feedback.textContent = 'جرّب مرة ثانية 👀';
      feedback.className = 'feedback bad';
    }
    nextQuestionBtn.classList.remove('hidden');
  }

  function startQuiz(){
    qIndex = 0;
    score = 0;
    show('quiz');
    renderQuestion();
  }

  startBtn.addEventListener('click', startExperience);
  potStartBtn.addEventListener('click', startExperience);
  manualPlayBtn.addEventListener('click', playIntro);
  video.addEventListener('ended',()=>discoverBtn.classList.remove('hidden'));
  video.addEventListener('error',()=>{
    manualPlayBtn.textContent='تعذر تشغيل الفيديو — اضغط للمحاولة';
    manualPlayBtn.classList.remove('hidden');
  });
  discoverBtn.addEventListener('click',()=>show('parts'));

  document.querySelectorAll('.part-hotspot').forEach(btn=>{
    btn.addEventListener('click',()=>openPart(btn.dataset.part));
  });

  backBtn.addEventListener('click',()=>show('parts'));
  nextBtn.addEventListener('click',()=>{
    const idx = partOrder.indexOf(currentPart);
    if(idx === partOrder.length-1){
      startQuiz();
    }else{
      openPart(partOrder[idx+1]);
    }
  });

  quizFromPartsBtn.addEventListener('click', startQuiz);
  nextQuestionBtn.addEventListener('click',()=>{
    qIndex += 1;
    if(qIndex >= questions.length){
      stopTimer();
      scoreText.textContent = `جمعت ${score} نجمة من ${questions.length} ⭐`;
      show('result');
    }else{
      renderQuestion();
    }
  });

  restartQuizBtn.addEventListener('click', startQuiz);
  returnPartsBtn.addEventListener('click',()=>show('parts'));

  window.addEventListener('pageshow',(e)=>{
    if(e.persisted){
      stopTimer();
      video.pause();
      video.currentTime=0;
      discoverBtn.classList.add('hidden');
      show('cover');
    }
  });
})();
