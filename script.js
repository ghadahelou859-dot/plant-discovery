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
  let seconds = 10;
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
    timer.style.setProperty('--p', `${seconds*10}%`);
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
    seconds = 10;
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

  function chooseAnswer(btn, idx){
    if(answered) return;
    answered = true;
    stopTimer();
    const item = questions[qIndex];
    const all = [...answersEl.querySelectorAll('button')];
    all.forEach(b=>b.disabled=true);
    if(idx === item.correct){
      btn.classList.add('correct');
      feedback.textContent = 'أحسنت! إجابة صحيحة 🌟';
      feedback.className = 'feedback good';
      score += 1;
    }else{
      btn.classList.add('wrong');
      all[item.correct].classList.add('correct');
      feedback.textContent = 'قريب جدًا! شاهد الإجابة الصحيحة 👀';
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
      scoreText.textContent = `أجبت عن ${score} من ${questions.length} إجابات صحيحة.`;
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
