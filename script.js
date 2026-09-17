(() => {
  'use strict';

  const screens = {
    cover: document.getElementById('coverScreen'),
    video: document.getElementById('videoScreen'),
    growth: document.getElementById('growthScreen'),
    parts: document.getElementById('partsScreen'),
    detail: document.getElementById('detailScreen'),
    challenge: document.getElementById('challengeScreen'),
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
  const beginChallengeBtn = document.getElementById('beginChallengeBtn');
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
  const ratingStatus = document.getElementById('ratingStatus');
  const ideaText = document.getElementById('ideaText');
  const submitIdeaBtn = document.getElementById('submitIdeaBtn');
  const ideaStatus = document.getElementById('ideaStatus');
  const likeBtn = document.getElementById('likeBtn');
  const likeCount = document.getElementById('likeCount');

  const partOrder = ['roots','stem','leaves','flower','fruit'];
  const partInfo = {
    roots:{img:'roots.png',title:'الجذور'},
    stem:{img:'stem.png',title:'الساق'},
    leaves:{img:'leaves.png',title:'الأوراق'},
    flower:{img:'flower.png',title:'الزهرة'},
    fruit:{img:'fruit.png',title:'الثمرة'}
  };

  const questions = [
    {q:'أي جزء يثبّت النبتة في التربة ويمتص الماء؟',choices:['الجذور','الزهرة','الثمرة'],correct:'الجذور'},
    {q:'الساق ينقل الماء والغذاء بين أجزاء النبتة.',choices:['نعم','لا'],correct:'نعم'},
    {q:'أي جزء يصنع غذاء النبتة بمساعدة ضوء الشمس؟',choices:['الأوراق','الجذور','الثمرة'],correct:'الأوراق'},
    {q:'الزهرة تساعد النبتة على تكوين الثمار والبذور.',choices:['نعم','لا'],correct:'نعم'},
    {q:'أي جزء يحمل البذور ويحميها؟',choices:['الثمرة','الساق','الأوراق'],correct:'الثمرة'},
    {q:'من أين تبدأ حياة النبتة؟',choices:['البذرة','الزهرة','الساق'],correct:'البذرة'},
    {q:'أين تنمو الجذور غالبًا؟',choices:['داخل التربة','فوق الأوراق','داخل الزهرة'],correct:'داخل التربة'},
    {q:'أي جزء يحمل الأوراق والزهور؟',choices:['الساق','الجذر','الثمرة'],correct:'الساق'},
    {q:'هل تحتاج الأوراق إلى ضوء الشمس لتصنع الغذاء؟',choices:['نعم','لا'],correct:'نعم'},
    {q:'بعد الزهرة، ماذا يمكن أن يتكوّن؟',choices:['الثمرة','الجذر','التربة'],correct:'الثمرة'}
  ];

  let currentPart='roots', qIndex=0, score=0, seconds=10, timerId=null, answered=false, currentAnswers=[], correctIndex=-1, ratingSaving=false, likeSaving=false;

  function show(name){
    Object.values(screens).forEach(s=>s.classList.remove('active'));
    screens[name].classList.add('active');
    window.scrollTo({top:0,behavior:'instant'});
  }

  async function playIntro(){
    manualPlayBtn.classList.add('hidden'); introVideo.currentTime=0;
    try{await introVideo.play();}catch(e){manualPlayBtn.classList.remove('hidden');}
  }
  async function startExperience(){show('video');await playIntro();}
  async function playGrowth(){
    growthPlayBtn.classList.add('hidden');discoverBtn.classList.add('hidden');show('growth');growthVideo.currentTime=0;
    try{await growthVideo.play();}catch(e){growthPlayBtn.classList.remove('hidden');}
  }

  function openPart(part){
    const info=partInfo[part]; if(!info)return;
    currentPart=part;detailImage.src=info.img;detailImage.alt=info.title;
    const idx=partOrder.indexOf(part);
    nextBtn.textContent=idx===partOrder.length-1?'جاهزين للتحدي؟ 🌱':'الجزء التالي ←';
    show('detail');
  }

  function stopTimer(){if(timerId){clearInterval(timerId);timerId=null;}}
  function updateTimer(){timerNumber.textContent=seconds;timer.style.setProperty('--p',`${seconds*10}%`);}
  function startTimer(){stopTimer();seconds=10;timer.classList.remove('expired');updateTimer();timerId=setInterval(()=>{seconds--;updateTimer();if(seconds<=0)timeUp();},1000);}
  function timeUp(){
    if(answered)return;answered=true;stopTimer();timer.classList.add('expired');timerNumber.textContent='0';
    const all=[...answersEl.querySelectorAll('button')];all.forEach(b=>b.disabled=true);if(all[correctIndex])all[correctIndex].classList.add('correct');
    feedback.textContent=`انتهى الوقت ⏰ الإجابة الصحيحة: ${currentAnswers[correctIndex]}`;feedback.className='feedback bad';nextQuestionBtn.classList.remove('hidden');
  }
  function shuffle(arr){const a=[...arr];for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}
  function renderQuestion(){
    answered=false;feedback.textContent='';feedback.className='feedback';nextQuestionBtn.classList.add('hidden');
    const item=questions[qIndex];quizProgress.textContent=`السؤال ${qIndex+1} من ${questions.length}`;questionText.textContent=item.q;answersEl.innerHTML='';
    currentAnswers=shuffle(item.choices);correctIndex=currentAnswers.indexOf(item.correct);
    currentAnswers.forEach((label,idx)=>{const btn=document.createElement('button');btn.type='button';btn.className='answer-btn';btn.textContent=label;btn.addEventListener('click',()=>chooseAnswer(btn,idx));answersEl.appendChild(btn);});
    startTimer();
  }
  function playApplause(){
    try{const Ctx=window.AudioContext||window.webkitAudioContext;if(!Ctx)return;const ctx=new Ctx();const now=ctx.currentTime;for(let i=0;i<12;i++){const t=now+i*.08,dur=.055,buffer=ctx.createBuffer(1,Math.floor(ctx.sampleRate*dur),ctx.sampleRate),data=buffer.getChannelData(0);for(let j=0;j<data.length;j++)data[j]=(Math.random()*2-1)*Math.pow(1-j/data.length,3);const src=ctx.createBufferSource(),gain=ctx.createGain();src.buffer=buffer;gain.gain.setValueAtTime(.0001,t);gain.gain.exponentialRampToValueAtTime(.2,t+.005);gain.gain.exponentialRampToValueAtTime(.0001,t+dur);src.connect(gain).connect(ctx.destination);src.start(t);}setTimeout(()=>ctx.close(),1600);}catch(e){}
  }
  function chooseAnswer(btn,idx){
    if(answered)return;answered=true;stopTimer();const all=[...answersEl.querySelectorAll('button')];all.forEach(b=>b.disabled=true);
    if(idx===correctIndex){btn.classList.add('correct');feedback.textContent='أحسنت يا بطل! 🌟';feedback.className='feedback good';score++;playApplause();}
    else{btn.classList.add('wrong');if(all[correctIndex])all[correctIndex].classList.add('correct');feedback.textContent=`الإجابة الصحيحة: ${currentAnswers[correctIndex]}`;feedback.className='feedback bad';}
    nextQuestionBtn.classList.remove('hidden');
  }
  function startQuiz(){qIndex=0;score=0;show('quiz');renderQuestion();}

  const SUPABASE_URL='https://jzswtwicvgppisasrkqe.supabase.co';
  const SUPABASE_KEY='sb_publishable_qJGOZoWBOrZ952qJnYTqNg_oaMSIStu';
  const INVITATION_SLUG='plant-discovery';
  function getVisitorKey(){const k='invitation_visitor_key';let v=localStorage.getItem(k);if(!v){v=self.crypto?.randomUUID?.()||'visitor-'+Date.now()+'-'+Math.random().toString(36).slice(2);localStorage.setItem(k,v);}return v;}
  const VISITOR_KEY=getVisitorKey();
  async function callInvitationRpc(name,body){const r=await fetch(`${SUPABASE_URL}/rest/v1/rpc/${name}`,{method:'POST',headers:{apikey:SUPABASE_KEY,'Content-Type':'application/json'},body:JSON.stringify(body)});if(!r.ok)throw new Error(await r.text());const t=await r.text();return t?JSON.parse(t):null;}
  async function recordView(){try{await callInvitationRpc('record_invitation_view',{p_slug:INVITATION_SLUG,p_visitor_key:VISITOR_KEY});}catch(e){console.error(e);}}

  function applyLikeStats(data){
    const row=Array.isArray(data)?data[0]:data;if(!row)return;
    likeCount.textContent=Number(row.like_count||0);
    likeBtn.classList.toggle('liked',Boolean(row.liked_by_me));
    likeBtn.setAttribute('aria-pressed',Boolean(row.liked_by_me));
  }
  async function loadLikeStats(){try{const data=await callInvitationRpc('get_invitation_stats',{p_slug:INVITATION_SLUG,p_visitor_key:VISITOR_KEY});applyLikeStats(data);}catch(e){console.error(e);}}
  async function toggleLike(){if(likeSaving)return;likeSaving=true;likeBtn.disabled=true;try{await callInvitationRpc('toggle_invitation_like',{p_slug:INVITATION_SLUG,p_visitor_key:VISITOR_KEY});await loadLikeStats();}catch(e){console.error(e);}finally{likeBtn.disabled=false;likeSaving=false;}}
  likeBtn.addEventListener('click',toggleLike);

  function paintRating(value){ratingButtons.forEach(b=>b.classList.toggle('selected',Number(b.dataset.rating)<=value));}
  async function saveRating(value){if(ratingSaving)return;ratingSaving=true;paintRating(value);ratingButtons.forEach(b=>b.disabled=true);ratingStatus.textContent='جاري حفظ التقييم…';try{await callInvitationRpc('submit_invitation_rating',{p_slug:INVITATION_SLUG,p_visitor_key:VISITOR_KEY,p_rating:value});ratingStatus.textContent='شكرًا! تم حفظ تقييمك ✓';}catch(e){ratingStatus.textContent='تعذر الحفظ، حاول مرة ثانية.';}finally{ratingButtons.forEach(b=>b.disabled=false);ratingSaving=false;}}
  ratingButtons.forEach(b=>b.addEventListener('click',()=>saveRating(Number(b.dataset.rating))));

  async function submitIdea(){
    const idea=ideaText.value.trim();if(!idea){ideaStatus.textContent='اكتب فكرتك أولًا 🌱';ideaText.focus();return;}
    submitIdeaBtn.disabled=true;ideaStatus.textContent='جاري إرسال الفكرة…';
    try{await callInvitationRpc('submit_invitation_opinion',{p_slug:INVITATION_SLUG,p_visitor_key:VISITOR_KEY,p_display_name:'زائر درس أجزاء النبتة',p_opinion_text:`فكرة لتطوير التجربة: ${idea}`});ideaText.value='';ideaStatus.textContent='شكرًا لمشاركتك! فكرتك وصلت إلينا 🌱💚';submitIdeaBtn.textContent='تم الإرسال ✓';}
    catch(e){ideaStatus.textContent='تعذر الإرسال، حاول مرة ثانية.';}finally{submitIdeaBtn.disabled=false;}
  }
  submitIdeaBtn.addEventListener('click',submitIdea);

  potStartBtn.addEventListener('click',startExperience);
  manualPlayBtn.addEventListener('click',playIntro);
  growthPlayBtn.addEventListener('click',playGrowth);
  introVideo.addEventListener('ended',playGrowth);
  introVideo.addEventListener('error',()=>manualPlayBtn.classList.remove('hidden'));
  growthVideo.addEventListener('ended',()=>discoverBtn.classList.remove('hidden'));
  growthVideo.addEventListener('error',()=>discoverBtn.classList.remove('hidden'));
  discoverBtn.addEventListener('click',()=>show('parts'));
  document.querySelectorAll('.part-hotspot').forEach(btn=>btn.addEventListener('click',()=>openPart(btn.dataset.part)));
  backBtn.addEventListener('click',()=>show('parts'));
  nextBtn.addEventListener('click',()=>{const idx=partOrder.indexOf(currentPart);if(idx===partOrder.length-1)show('challenge');else openPart(partOrder[idx+1]);});
  beginChallengeBtn.addEventListener('click',startQuiz);
  nextQuestionBtn.addEventListener('click',()=>{qIndex++;if(qIndex>=questions.length){stopTimer();scoreText.textContent=`${score} / ${questions.length} ⭐`;paintRating(0);ratingStatus.textContent='اختاروا عدد النجوم وسيتم الحفظ تلقائيًا.';ideaStatus.textContent='';submitIdeaBtn.textContent='إرسال ✈️';show('result');}else renderQuestion();});
  restartQuizBtn.addEventListener('click',startQuiz);
  returnPartsBtn.addEventListener('click',()=>show('parts'));

  recordView();
  loadLikeStats();
})();