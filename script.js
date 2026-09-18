const screens=[...document.querySelectorAll('.screen')];

function isPortraitMobile(){
  return window.matchMedia('(orientation: portrait) and (max-width: 700px)').matches;
}

function mappedValue(el,key){
  const portrait=isPortraitMobile();
  const mobileKey='p'+key;
  const raw=portrait && el.dataset[mobileKey]!==undefined ? el.dataset[mobileKey] : el.dataset[key];
  return Number(raw||0);
}

function layoutMappedElements(screenId,imageId){
  const screen=document.getElementById(screenId);
  const image=document.getElementById(imageId);
  if(!screen||!image||!image.naturalWidth||!screen.classList.contains('active'))return;

  const cw=screen.clientWidth;
  const ch=screen.clientHeight;
  const nw=image.naturalWidth;
  const nh=image.naturalHeight;
  const scale=isPortraitMobile()?Math.min(cw/nw,ch/nh):Math.max(cw/nw,ch/nh);
  const renderedW=nw*scale;
  const renderedH=nh*scale;
  const offsetX=(cw-renderedW)/2;
  const offsetY=(ch-renderedH)/2;

  screen.querySelectorAll('.mapped-hotspot,.mapped-ui').forEach(el=>{
    const x=mappedValue(el,'x');
    const y=mappedValue(el,'y');
    const w=mappedValue(el,'w');
    const h=mappedValue(el,'h');
    el.style.left=`${offsetX+x*renderedW}px`;
    el.style.top=`${offsetY+y*renderedH}px`;
    el.style.width=`${w*renderedW}px`;
    el.style.height=`${h*renderedH}px`;
  });
}

function layoutAllMappedElements(){
  layoutMappedElements('coverScreen','coverImage');
  layoutMappedElements('partsScreen','partsImage');
  layoutMappedElements('challengeScreen','challengeImage');
  layoutMappedElements('quizScreen','quizImage');
  layoutMappedElements('resultScreen','resultImage');
}

const showScreen=id=>{
  screens.forEach(s=>s.classList.toggle('active',s.id===id));
  requestAnimationFrame(()=>requestAnimationFrame(layoutAllMappedElements));
  setTimeout(layoutAllMappedElements,120);
};

const coverImage=document.getElementById('coverImage');
const coverStartBtn=document.getElementById('coverStartBtn');
const introVideo=document.getElementById('introVideo');
const playIntroBtn=document.getElementById('playIntroBtn');
const skipIntroBtn=document.getElementById('skipIntroBtn');
const goGrowthBtn=document.getElementById('goGrowthBtn');
const growthVideo=document.getElementById('growthVideo');
const playGrowthBtn=document.getElementById('playGrowthBtn');
const skipGrowthBtn=document.getElementById('skipGrowthBtn');
const showPartsBtn=document.getElementById('showPartsBtn');
const partsImage=document.getElementById('partsImage');
const challengeImage=document.getElementById('challengeImage');
const quizImage=document.getElementById('quizImage');
const resultImage=document.getElementById('resultImage');
const detailImage=document.getElementById('detailImage');
const detailBackBtn=document.getElementById('detailBackBtn');
const detailNextBtn=document.getElementById('detailNextBtn');
const beginQuizBtn=document.getElementById('beginQuizBtn');
const quizProgress=document.getElementById('quizProgress');
const timerNum=document.getElementById('timerNum');
const questionText=document.getElementById('questionText');
const answersEl=document.getElementById('answers');
const feedbackEl=document.getElementById('feedback');
const scoreText=document.getElementById('scoreText');
const restartQuizBtn=document.getElementById('restartQuizBtn');
const returnPartsBtn=document.getElementById('returnPartsBtn');
const ratingStars=document.getElementById('ratingStars');
const ideaInput=document.getElementById('ideaInput');
const sendIdeaBtn=document.getElementById('sendIdeaBtn');
const statusToast=document.getElementById('statusToast');
const celebrationLayer=document.getElementById('celebrationLayer');
const likeBtn=document.getElementById('likeBtn');
const likeCount=document.getElementById('likeCount');

const responsiveImages=[coverImage,partsImage,challengeImage,quizImage,resultImage];
const responsiveVideos=[introVideo,growthVideo];

function syncResponsiveVideo(video,portrait){
  if(!video)return;
  video.removeAttribute('poster');
  const target=portrait?video.dataset.mobileSrc:video.dataset.desktopSrc;
  if(!target||video.dataset.activeSrc===target)return;
  const resume=!video.paused&&!video.ended;
  const previousTime=Number.isFinite(video.currentTime)?video.currentTime:0;
  video.pause();
  video.src=target;
  video.dataset.activeSrc=target;
  video.load();
  if(resume){
    video.addEventListener('loadedmetadata',()=>{
      try{video.currentTime=Math.min(previousTime,Math.max(0,(video.duration||previousTime)-.05));}catch(e){}
      video.play().catch(()=>{});
    },{once:true});
  }
}

function syncResponsiveAssets(){
  const portrait=isPortraitMobile();
  responsiveImages.forEach(img=>{
    if(!img)return;
    const target=portrait?img.dataset.mobileSrc:img.dataset.desktopSrc;
    if(target && img.getAttribute('src')!==target)img.setAttribute('src',target);
  });
  responsiveVideos.forEach(video=>syncResponsiveVideo(video,portrait));
  if(typeof currentPartIndex==='number' && parts?.[currentPartIndex]){
    const target=portrait?parts[currentPartIndex].mobileImage:parts[currentPartIndex].image;
    if(detailImage.getAttribute('src')!==target)detailImage.setAttribute('src',target);
  }
  requestAnimationFrame(()=>requestAnimationFrame(layoutAllMappedElements));
}

responsiveImages.forEach(img=>img?.addEventListener('load',layoutAllMappedElements));
window.addEventListener('resize',()=>{syncResponsiveAssets();layoutAllMappedElements();});
window.addEventListener('orientationchange',()=>setTimeout(()=>{syncResponsiveAssets();layoutAllMappedElements();},180));

const parts=[
  {key:'roots',title:'الجذور',image:'roots.png',mobileImage:'roots-mobile.png?v=20260918p'},
  {key:'stem',title:'الساق',image:'stem.png',mobileImage:'stem-mobile.png?v=20260918p'},
  {key:'leaves',title:'الأوراق',image:'leaves.png',mobileImage:'leaves-mobile.png?v=20260918p'},
  {key:'flower',title:'الزهرة',image:'flower.png',mobileImage:'flower-mobile.png?v=20260918p'},
  {key:'fruit',title:'الثمرة',image:'fruit.png',mobileImage:'fruit-mobile.png?v=20260918p'}
];
let currentPartIndex=0;

const A={
  roots:{label:'الجذور',image:'quiz-roots-icon.png'},
  stem:{label:'الساق',image:'quiz-stem-icon.png'},
  leaves:{label:'الأوراق',image:'quiz-leaf-icon.png'},
  flower:{label:'الزهرة',image:'quiz-flower-icon.png'},
  fruit:{label:'الثمرة',image:'quiz-fruit-icon.png'},
  seed:{label:'البذرة',image:'quiz-seed-icon.png'}
};
const opt=(key,correct=false)=>({...A[key],correct});

const questions=[
  {q:'أي جزء يثبّت النبتة في التربة ويمتص الماء؟',options:[opt('roots',true),opt('stem'),opt('flower'),opt('fruit')]},
  {q:'أي جزء يحمل الأوراق والأزهار والثمار؟',options:[opt('stem',true),opt('roots'),opt('leaves'),opt('seed')]},
  {q:'أي جزء يصنع غذاء النبتة بمساعدة ضوء الشمس؟',options:[opt('leaves',true),opt('roots'),opt('fruit'),opt('flower')]},
  {q:'من أي جزء تبدأ حياة النبتة؟',options:[opt('seed',true),opt('flower'),opt('stem'),opt('fruit')]},
  {q:'أي جزء يساعد النبتة على تكوين الثمار والبذور؟',options:[opt('flower',true),opt('roots'),opt('stem'),opt('leaves')]},
  {q:'أي جزء يحمل البذور ويحميها؟',options:[opt('fruit',true),opt('stem'),opt('leaves'),opt('roots')]},
  {q:'أي جزء ينمو غالبًا داخل التربة؟',options:[opt('roots',true),opt('flower'),opt('fruit'),opt('leaves')]},
  {q:'أي جزء ينقل الماء بين أجزاء النبتة؟',options:[opt('stem',true),opt('seed'),opt('flower'),opt('fruit')]},
  {q:'أي جزء يحتاج إلى ضوء الشمس ليصنع الغذاء؟',options:[opt('leaves',true),opt('roots'),opt('seed'),opt('fruit')]},
  {q:'بعد الزهرة، أي جزء يمكن أن يتكوّن؟',options:[opt('fruit',true),opt('roots'),opt('stem'),opt('seed')]}
];

let quizOrder=[];
let qIndex=0;
let score=0;
let timer=null;
let timeLeft=10;
let timedOutCount=0;
let questionLocked=false;

function shuffle(a){
  const arr=[...a];
  for(let i=arr.length-1;i>0;i--){
    const j=Math.floor(Math.random()*(i+1));
    [arr[i],arr[j]]=[arr[j],arr[i]];
  }
  return arr;
}

let growthAudioCtx=null;
let growthBeatTimer=null;
let growthStep=0;
function playGrowthNote(freq,duration=.16,volume=.035,type='triangle'){
  if(!growthAudioCtx)return;
  const osc=growthAudioCtx.createOscillator();
  const gain=growthAudioCtx.createGain();
  const now=growthAudioCtx.currentTime;
  osc.type=type;
  osc.frequency.setValueAtTime(freq,now);
  gain.gain.setValueAtTime(0.0001,now);
  gain.gain.exponentialRampToValueAtTime(volume,now+.02);
  gain.gain.exponentialRampToValueAtTime(0.0001,now+duration);
  osc.connect(gain);gain.connect(growthAudioCtx.destination);
  osc.start(now);osc.stop(now+duration+.03);
}
function startGrowthMusic(){
  stopGrowthMusic();
  try{
    growthAudioCtx=new(window.AudioContext||window.webkitAudioContext)();
    growthStep=0;
    const notes=[523.25,659.25,783.99,659.25,587.33,698.46,880,698.46];
    const tick=()=>{
      if(!growthAudioCtx)return;
      playGrowthNote(notes[growthStep%notes.length],.19,.035,'triangle');
      if(growthStep%2===0)playGrowthNote(notes[(growthStep+2)%notes.length]/2,.12,.018,'sine');
      growthStep++;
    };
    tick();
    growthBeatTimer=setInterval(tick,280);
  }catch(e){}
}
function stopGrowthMusic(){
  if(growthBeatTimer){clearInterval(growthBeatTimer);growthBeatTimer=null;}
  if(growthAudioCtx){try{growthAudioCtx.close();}catch(e){}growthAudioCtx=null;}
}

coverStartBtn.onclick=()=>showScreen('videoScreen');
playIntroBtn.onclick=async()=>{
  playIntroBtn.classList.add('hidden');
  introVideo.classList.remove('mobile-awaiting-play');
  introVideo.currentTime=0;
  try{await introVideo.play();}
  catch{
    introVideo.classList.add('mobile-awaiting-play');
    playIntroBtn.classList.remove('hidden');
  }
};
introVideo.onended=()=>goGrowthBtn.classList.remove('hidden');
introVideo.onerror=()=>goGrowthBtn.classList.remove('hidden');
goGrowthBtn.onclick=()=>showScreen('growthScreen');
skipIntroBtn.onclick=()=>{
  try{introVideo.pause();}catch(e){}
  if(isPortraitMobile())growthVideo.classList.add('mobile-awaiting-play');
  showScreen('growthScreen');
};
playGrowthBtn.onclick=async()=>{
  playGrowthBtn.classList.add('hidden');
  growthVideo.classList.remove('mobile-awaiting-play');
  growthVideo.currentTime=0;
  try{startGrowthMusic();await growthVideo.play();}
  catch{
    stopGrowthMusic();
    growthVideo.classList.add('mobile-awaiting-play');
    playGrowthBtn.classList.remove('hidden');
  }
};
growthVideo.onended=()=>{stopGrowthMusic();showPartsBtn.classList.remove('hidden')};
growthVideo.onerror=()=>{stopGrowthMusic();showPartsBtn.classList.remove('hidden')};
growthVideo.addEventListener('pause',()=>{if(!growthVideo.ended)stopGrowthMusic()});
showPartsBtn.onclick=()=>{stopGrowthMusic();showScreen('partsScreen')};
skipGrowthBtn.onclick=()=>{
  try{growthVideo.pause();}catch(e){}
  stopGrowthMusic();
  showScreen('partsScreen');
};

document.querySelectorAll('[data-part]').forEach(btn=>btn.onclick=()=>openPart(btn.dataset.part));
function openPart(key){
  currentPartIndex=parts.findIndex(p=>p.key===key);
  if(currentPartIndex<0)return;
  detailImage.src=isPortraitMobile()?parts[currentPartIndex].mobileImage:parts[currentPartIndex].image;
  detailImage.alt=parts[currentPartIndex].title;
  detailNextBtn.textContent=currentPartIndex===parts.length-1?'ابدأ التحدي':'الجزء التالي';
  showScreen('detailScreen');
}
detailBackBtn.onclick=()=>showScreen('partsScreen');
detailNextBtn.onclick=()=>{
  if(currentPartIndex<parts.length-1){
    currentPartIndex++;
    detailImage.src=isPortraitMobile()?parts[currentPartIndex].mobileImage:parts[currentPartIndex].image;
    detailImage.alt=parts[currentPartIndex].title;
    detailNextBtn.textContent=currentPartIndex===parts.length-1?'ابدأ التحدي':'الجزء التالي';
  }else{
    showScreen('challengeScreen');
  }
};
beginQuizBtn.onclick=startQuiz;

function startQuiz(){
  clearInterval(timer);
  stopGrowthMusic();
  quizOrder=shuffle(questions);
  qIndex=0;
  score=0;
  timedOutCount=0;
  questionLocked=false;
  clearCelebration();
  showScreen('quizScreen');
  renderQuestion();
}

function renderQuestion(){
  clearInterval(timer);
  if(qIndex>=quizOrder.length){finishQuiz();return;}
  questionLocked=false;
  timeLeft=10;
  timerNum.textContent=timeLeft;
  feedbackEl.textContent='';
  const q=quizOrder[qIndex];
  quizProgress.textContent=isPortraitMobile()?String(qIndex+1):`${qIndex+1} / ${quizOrder.length}`;
  questionText.textContent=q.q;
  answersEl.innerHTML='';
  const options=shuffle(q.options);

  options.forEach(option=>{
    const btn=document.createElement('button');
    btn.type='button';
    btn.className='answer-btn';
    const shell=document.createElement('span');
    shell.className='icon-shell';
    const img=document.createElement('img');
    img.className='option-img';
    img.src=option.image;
    img.alt=option.label;
    shell.appendChild(img);
    const label=document.createElement('span');
    label.className='label';
    label.textContent=option.label;
    btn.append(shell,label);
    btn.onclick=()=>chooseAnswer(option,q.options.find(o=>o.correct));
    answersEl.appendChild(btn);
  });

  layoutAllMappedElements();
  timer=setInterval(()=>{
    timeLeft--;
    timerNum.textContent=Math.max(0,timeLeft);
    if(timeLeft<=0){
      clearInterval(timer);
      timedOutCount++;
      revealAnswer(null,q.options.find(o=>o.correct),true);
    }
  },1000);
}

function chooseAnswer(selected,correct){
  if(questionLocked)return;
  questionLocked=true;
  clearInterval(timer);
  revealAnswer(selected,correct,false);
}

function addBadge(btn,src,alt){
  const img=document.createElement('img');
  img.src=src;img.alt=alt;img.className='answer-badge';
  btn.appendChild(img);
}

function revealAnswer(selected,correct,isTimeout=false){
  questionLocked=true;
  [...answersEl.children].forEach(btn=>{
    btn.classList.add('disabled');
    const label=btn.querySelector('.label')?.textContent;
    if(label===correct.label){btn.classList.add('correct');addBadge(btn,'correct-badge.png','صح');}
    if(selected&&label===selected.label&&selected.label!==correct.label){btn.classList.add('wrong');addBadge(btn,'wrong-badge.png','خطأ');}
  });

  if(selected&&selected.label===correct.label){score++;feedbackEl.textContent='أحسنت يا بطل 👏';playClap();}
  else if(isTimeout){feedbackEl.textContent='انتهى الوقت ⏰';}
  else{feedbackEl.textContent='الإجابة الصحيحة مميزة بالأخضر';}

  setTimeout(()=>{
    qIndex++;
    if(qIndex>=quizOrder.length)finishQuiz();
    else renderQuestion();
  },1100);
}

function finishQuiz(){
  clearInterval(timer);
  questionLocked=true;
  feedbackEl.textContent='';
  scoreText.textContent=String(score);
  ratingStars.querySelectorAll('button').forEach(b=>b.classList.remove('active'));
  ideaInput.value='';
  showScreen('resultScreen');
  if(!resultImage.complete){resultImage.addEventListener('load',layoutAllMappedElements,{once:true});}
  else layoutAllMappedElements();
  if(score>8)setTimeout(startCelebration,250);
}
restartQuizBtn.onclick=startQuiz;
returnPartsBtn.onclick=()=>{clearCelebration();showScreen('partsScreen')};

function showToast(message){
  statusToast.textContent=message;
  statusToast.classList.add('show');
  clearTimeout(showToast._t);
  showToast._t=setTimeout(()=>statusToast.classList.remove('show'),2200);
}
function clearCelebration(){celebrationLayer.innerHTML=''}
function startCelebration(){
  clearCelebration();
  const colors=['#ffd43b','#55c76a','#ff7a7a','#54b8ff','#ffffff'];
  for(let i=0;i<55;i++){
    const p=document.createElement('i');
    p.className='confetti-piece';
    p.style.left=`${Math.random()*100}%`;
    p.style.background=colors[Math.floor(Math.random()*colors.length)];
    p.style.animationDelay=`${Math.random()*.7}s`;
    p.style.animationDuration=`${1.9+Math.random()*1.5}s`;
    p.style.setProperty('--drift',`${-80+Math.random()*160}px`);
    celebrationLayer.appendChild(p);
  }
  setTimeout(clearCelebration,3800);
}

const SUPABASE_URL='https://jzswtwicvgppisasrkqe.supabase.co';
const SUPABASE_KEY='sb_publishable_qJGOZoWBOrZ952qJnYTqNg_oaMSIStu';
const INVITATION_SLUG='plant-discovery';
function getVisitorKey(){
  const key='invitation_visitor_key';
  let value=localStorage.getItem(key);
  if(!value){
    value=self.crypto?.randomUUID?.()||`visitor-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    localStorage.setItem(key,value);
  }
  return value;
}
const VISITOR_KEY=getVisitorKey();
async function callRpc(name,body){
  const res=await fetch(`${SUPABASE_URL}/rest/v1/rpc/${name}`,{
    method:'POST',headers:{apikey:SUPABASE_KEY,'Content-Type':'application/json'},body:JSON.stringify(body)
  });
  if(!res.ok)throw new Error(await res.text());
  const text=await res.text();
  return text?JSON.parse(text):null;
}
async function refreshLike(){
  try{
    const data=await callRpc('get_invitation_stats',{p_slug:INVITATION_SLUG,p_visitor_key:VISITOR_KEY});
    const row=Array.isArray(data)?data[0]:data;
    if(row){likeCount.textContent=row.like_count??0;likeBtn.classList.toggle('liked',!!row.liked_by_me);}
  }catch(e){console.error(e)}
}
likeBtn.onclick=async()=>{
  likeBtn.disabled=true;
  try{await callRpc('toggle_invitation_like',{p_slug:INVITATION_SLUG,p_visitor_key:VISITOR_KEY});await refreshLike();}
  catch(e){console.error(e)}finally{likeBtn.disabled=false}
};
ratingStars.querySelectorAll('button').forEach(btn=>btn.onclick=async()=>{
  const r=+btn.dataset.rate;
  ratingStars.querySelectorAll('button').forEach(b=>b.classList.toggle('active',+b.dataset.rate<=r));
  showToast('جاري حفظ التقييم…');
  try{
    await callRpc('submit_invitation_rating',{p_slug:INVITATION_SLUG,p_visitor_key:VISITOR_KEY,p_rating:r});
    showToast('شكرًا! تم حفظ تقييمك ✓');
  }catch(e){showToast('تعذر حفظ التقييم، حاولي مرة ثانية.')}
});
sendIdeaBtn.onclick=async()=>{
  const idea=ideaInput.value.trim();
  if(!idea){showToast('اكتب فكرتك أولًا 🌱');return}
  sendIdeaBtn.disabled=true;
  showToast('جاري الإرسال…');
  try{
    await callRpc('submit_invitation_opinion',{
      p_slug:INVITATION_SLUG,p_visitor_key:VISITOR_KEY,p_display_name:'زائر درس أجزاء النبتة',p_opinion_text:`فكرة لتطوير التجربة: ${idea}`
    });
    ideaInput.value='';
    showToast('شكرًا لمشاركتك! فكرتك وصلت إلينا 🌱💚');
  }catch(e){showToast('تعذر الإرسال، حاولي مرة ثانية.')}
  finally{sendIdeaBtn.disabled=false}
};
async function recordView(){try{await callRpc('record_invitation_view',{p_slug:INVITATION_SLUG,p_visitor_key:VISITOR_KEY})}catch(e){console.error(e)}}

function playClap(){
  try{
    const ctx=new(window.AudioContext||window.webkitAudioContext)();
    const now=ctx.currentTime;
    for(let i=0;i<3;i++){
      const buffer=ctx.createBuffer(1,ctx.sampleRate*.11,ctx.sampleRate);
      const data=buffer.getChannelData(0);
      for(let j=0;j<data.length;j++)data[j]=(Math.random()*2-1)*Math.exp(-j/(ctx.sampleRate*.02));
      const src=ctx.createBufferSource(),gain=ctx.createGain();
      src.buffer=buffer;src.connect(gain);gain.connect(ctx.destination);gain.gain.value=.13;src.start(now+i*.14);
    }
  }catch(e){}
}

syncResponsiveAssets();
if(isPortraitMobile()){
  introVideo.classList.add('mobile-awaiting-play');
  growthVideo.classList.add('mobile-awaiting-play');
}
recordView();
refreshLike();
layoutAllMappedElements();
