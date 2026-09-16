(() => {
  'use strict';

  const screens = {
    cover: document.getElementById('coverScreen'),
    video: document.getElementById('videoScreen'),
    growth: document.getElementById('growthScreen'),
    parts: document.getElementById('partsScreen'),
    detail: document.getElementById('detailScreen'),
    quiz: document.getElementById('quizScreen'),
    result: document.getElementById('resultScreen')
  };

  const potStartBtn = document.getElementById('potStartBtn');
  const introVideo = document.getElementById('introVideo');
  const growthVideo = document.getElementById('growthVideo');
  const manualPlayBtn = document.getElementById('manualPlayBtn');
  const growthPlayBtn = document.getElementById('growthPlayBtn');
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
  const ratingButtons = [...document.querySelectorAll('[data-rating]')];
  const submitRatingBtn = document.getElementById('submitRatingBtn');
  const ratingStatus = document.getElementById('ratingStatus');

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
  let selectedRating = 0;

  function show(name){
    Object.values(screens).forEach(s=>s.classList.remove('active'));
    screens[name].classList.add('active');
  }

  async function playIntro(){
    manualPlayBtn.classList.add('hidden');
    introVideo.currentTime = 0;
    try{ await introVideo.play(); }
    catch(e){ manualPlayBtn.classList.remove('hidden'); }
  }

  async function startExperience(){
    show('video');
    await playIntro();
  }

  async function playGrowth(){
    growthPlayBtn.classList.add('hidden');
    discoverBtn.classList.add('hidden');
    show('growth');
    growthVideo.currentTime = 0;
    try{ await growthVideo.play(); }
    catch(e){ growthPlayBtn.classList.remove('hidden'); }
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
    if(answered) return;
    answered = true;
    stopTimer();
    timer.classList.add('expired');
    timerNumber.textContent = '0';
    const item = questions[qIndex];
    const all = [...answersEl.querySelectorAll('button')];
    all.forEach(b=>b.disabled=true);
    if(all[item.correct]) all[item.correct].classList.add('correct');
    feedback.textContent = `انتهى الوقت ⏰ الإجابة الصحيحة: ${item.a[item.correct]}`;
    feedback.className = 'feedback bad';
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

  function playApplause(){
    try{
      const Ctx = window.AudioContext || window.webkitAudioContext;
      if(!Ctx) return;
      const ctx = new Ctx();
      const master = ctx.createGain();
      master.gain.value = 0.75;
      master.connect(ctx.destination);
      const now = ctx.currentTime;

      const clap = (t, strength=1) => {
        [0,0.012,0.026].forEach((offset,k)=>{
          const dur = 0.055 + k*0.01;
          const buffer = ctx.createBuffer(1, Math.floor(ctx.sampleRate*dur), ctx.sampleRate);
          const data = buffer.getChannelData(0);
          for(let i=0;i<data.length;i++){
            const env = Math.pow(1-i/data.length, 3.3);
            data[i] = (Math.random()*2-1)*env;
          }
          const src = ctx.createBufferSource();
          src.buffer = buffer;
          const hp = ctx.createBiquadFilter();
          hp.type='highpass'; hp.frequency.value=650;
          const bp = ctx.createBiquadFilter();
          bp.type='bandpass'; bp.frequency.value=1500 + k*420; bp.Q.value=0.75;
          const gain = ctx.createGain();
          gain.gain.setValueAtTime(0.0001,t+offset);
          gain.gain.exponentialRampToValueAtTime(0.24*strength,t+offset+0.004);
          gain.gain.exponentialRampToValueAtTime(0.0001,t+offset+dur);
          src.connect(hp).connect(bp).connect(gain).connect(master);
          src.start(t+offset);
        });
      };

      [0,.12,.24,.39,.53,.67,.82,1.0].forEach((d,i)=>clap(now+d, i%2 ? .8 : 1));
      setTimeout(()=>ctx.close(),1800);
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
      feedback.textContent = `الإجابة الصحيحة: ${item.a[item.correct]}`;
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

  /* Supabase */
  const SUPABASE_URL = 'https://jzswtwicvgppisasrkqe.supabase.co';
  const SUPABASE_KEY = 'sb_publishable_qJGOZoWBOrZ952qJnYTqNg_oaMSIStu';
  const INVITATION_SLUG = 'plant-discovery';

  function getVisitorKey(){
    const storageKey = 'invitation_visitor_key';
    let visitorKey = localStorage.getItem(storageKey);
    if(!visitorKey){
      visitorKey = self.crypto?.randomUUID?.() || 'visitor-' + Date.now() + '-' + Math.random().toString(36).slice(2);
      localStorage.setItem(storageKey, visitorKey);
    }
    return visitorKey;
  }

  const VISITOR_KEY = getVisitorKey();

  async function callInvitationRpc(functionName, body){
    const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/${functionName}`, {
      method:'POST',
      headers:{apikey:SUPABASE_KEY,'Content-Type':'application/json'},
      body:JSON.stringify(body)
    });
    if(!response.ok) throw new Error(await response.text());
    const text = await response.text();
    return text ? JSON.parse(text) : null;
  }

  async function recordView(){
    try{
      await callInvitationRpc('record_invitation_view', {
        p_slug:INVITATION_SLUG,
        p_visitor_key:VISITOR_KEY
      });
    }catch(error){
      console.error('تعذر تسجيل الزيارة:', error);
    }
  }

  function paintRating(value){
    ratingButtons.forEach(btn=>btn.classList.toggle('selected', Number(btn.dataset.rating) <= value));
  }

  ratingButtons.forEach(btn=>{
    btn.addEventListener('click',()=>{
      selectedRating = Number(btn.dataset.rating);
      paintRating(selectedRating);
      ratingStatus.textContent = '';
    });
  });

  submitRatingBtn.addEventListener('click', async ()=>{
    if(!selectedRating){
      ratingStatus.textContent = 'اختاروا عدد النجوم أولًا ⭐';
      return;
    }
    submitRatingBtn.disabled = true;
    ratingStatus.textContent = 'جاري حفظ التقييم…';
    try{
      await callInvitationRpc('submit_invitation_opinion', {
        p_slug:INVITATION_SLUG,
        p_visitor_key:VISITOR_KEY,
        p_display_name:'زائر درس أجزاء النبتة',
        p_opinion_text:`التقييم: ${selectedRating}/5`
      });
      ratingStatus.textContent = 'شكرًا! تم حفظ تقييمك ✓';
      submitRatingBtn.textContent = 'تم الإرسال ✓';
      ratingButtons.forEach(btn=>btn.disabled=true);
    }catch(error){
      console.error('تعذر حفظ التقييم:', error);
      ratingStatus.textContent = 'تعذر الحفظ، جرّب مرة ثانية.';
      submitRatingBtn.disabled = false;
    }
  });

  potStartBtn.addEventListener('click', startExperience);
  manualPlayBtn.addEventListener('click', playIntro);
  growthPlayBtn.addEventListener('click', playGrowth);

  introVideo.addEventListener('ended', playGrowth);
  introVideo.addEventListener('error',()=>{
    manualPlayBtn.textContent='تعذر تشغيل المقدمة — اضغط للمحاولة';
    manualPlayBtn.classList.remove('hidden');
  });

  growthVideo.addEventListener('ended',()=>discoverBtn.classList.remove('hidden'));
  growthVideo.addEventListener('error',()=>{
    growthPlayBtn.classList.add('hidden');
    discoverBtn.classList.remove('hidden');
  });

  discoverBtn.addEventListener('click',()=>show('parts'));

  document.querySelectorAll('.part-hotspot').forEach(btn=>{
    btn.addEventListener('click',()=>openPart(btn.dataset.part));
  });

  backBtn.addEventListener('click',()=>show('parts'));
  nextBtn.addEventListener('click',()=>{
    const idx = partOrder.indexOf(currentPart);
    if(idx === partOrder.length-1) startQuiz();
    else openPart(partOrder[idx+1]);
  });

  quizFromPartsBtn.addEventListener('click', startQuiz);
  nextQuestionBtn.addEventListener('click',()=>{
    qIndex += 1;
    if(qIndex >= questions.length){
      stopTimer();
      scoreText.textContent = `جمعت ${score} نجمة من ${questions.length} ⭐`;
      selectedRating = 0;
      paintRating(0);
      ratingButtons.forEach(btn=>btn.disabled=false);
      submitRatingBtn.disabled = false;
      submitRatingBtn.textContent = 'إرسال التقييم';
      ratingStatus.textContent = '';
      show('result');
    }else renderQuestion();
  });

  restartQuizBtn.addEventListener('click', startQuiz);
  returnPartsBtn.addEventListener('click',()=>show('parts'));

  recordView();

  window.addEventListener('pageshow',(e)=>{
    if(e.persisted){
      stopTimer();
      introVideo.pause();
      growthVideo.pause();
      introVideo.currentTime=0;
      growthVideo.currentTime=0;
      discoverBtn.classList.add('hidden');
      show('cover');
    }
  });
})();
