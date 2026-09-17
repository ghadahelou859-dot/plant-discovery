const screens=[...document.querySelectorAll('.screen')];

function layoutMappedElements(screenId,imageId){
  const screen=document.getElementById(screenId);
  const image=document.getElementById(imageId);
  if(!screen||!image||!image.naturalWidth||!screen.classList.contains('active'))return;

  const cw=screen.clientWidth;
  const ch=screen.clientHeight;
  const nw=image.naturalWidth;
  const nh=image.naturalHeight;
  const scale=Math.max(cw/nw,ch/nh);
  const renderedW=nw*scale;
  const renderedH=nh*scale;
  const offsetX=(cw-renderedW)/2;
  const offsetY=(ch-renderedH)/2;

  screen.querySelectorAll('.mapped-hotspot,.mapped-ui').forEach(el=>{
    const x=Number(el.dataset.x||0);
    const y=Number(el.dataset.y||0);
    const w=Number(el.dataset.w||0);
    const h=Number(el.dataset.h||0);
    el.style.left=`${offsetX+x*renderedW}px`;
    el.style.top=`${offsetY+y*renderedH}px`;
    el.style.width=`${w*renderedW}px`;
    el.style.height=`${h*renderedH}px`;
  });
}

function layoutAllMappedElements(){
  layoutMappedElements('partsScreen','partsImage');
  layoutMappedElements('challengeScreen','challengeImage');
  layoutMappedElements('quizScreen','quizImage');
}

const showScreen=id=>{
  screens.forEach(s=>s.classList.toggle('active',s.id===id));
  requestAnimationFrame(()=>requestAnimationFrame(layoutAllMappedElements));
};

const coverStartBtn=document.getElementById('coverStartBtn');
const introVideo=document.getElementById('introVideo');
const playIntroBtn=document.getElementById('playIntroBtn');
const goGrowthBtn=document.getElementById('goGrowthBtn');
const growthVideo=document.getElementById('growthVideo');
const playGrowthBtn=document.getElementById('playGrowthBtn');
const showPartsBtn=document.getElementById('showPartsBtn');
const partsImage=document.getElementById('partsImage');
const challengeImage=document.getElementById('challengeImage');
const quizImage=document.getElementById('quizImage');
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
const ratingMsg=document.getElementById('ratingMsg');
const ideaInput=document.getElementById('ideaInput');
const sendIdeaBtn=document.getElementById('sendIdeaBtn');
const ideaMsg=document.getElementById('ideaMsg');
const likeBtn=document.getElementById('likeBtn');
const likeCount=document.getElementById('likeCount');

[partsImage,challengeImage,quizImage].forEach(img=>img?.addEventListener('load',layoutAllMappedElements));
window.addEventListener('resize',layoutAllMappedElements);
window.addEventListener('orientationchange',()=>setTimeout(layoutAllMappedElements,120));

const parts=[
  {key:'roots',title:'الجذور',image:'roots.png'},
  {key:'stem',title:'الساق',image:'stem.png'},
  {key:'leaves',title:'الأوراق',image:'leaves.png'},
  {key:'flower',title:'الزهرة',image:'flower.png'},
  {key:'fruit',title:'الثمرة',image:'fruit.png'}
];
let currentPartIndex=0;

const A={
  roots:{label:'الجذور',image:'quiz-roots.png'},
  stem:{label:'الساق',image:'quiz-stem.png'},
  leaves:{label:'الأوراق',image:'quiz-leaves.png'},
  flower:{label:'الزهرة',image:'quiz-flower.png'},
  fruit:{label:'الثمرة',image:'quiz-fruit.png'},
  seed:{label:'البذرة',image:'quiz-seed.png'}
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

coverStartBtn.onclick=()=>showScreen('videoScreen');
playIntroBtn.onclick=async()=>{playIntroBtn.classList.add('hidden');introVideo.currentTime=0;try{await introVideo.play();}catch{playIntroBtn.classList.remove('hidden')}};
introVideo.onended=()=>goGrowthBtn.classList.remove('hidden');
introVideo.onerror=()=>goGrowthBtn.classList.remove('hidden');
goGrowthBtn.onclick=()=>showScreen('growthScreen');
playGrowthBtn.onclick=async()=>{playGrowthBtn.classList.add('hidden');growthVideo.currentTime=0;try{await growthVideo.play();}catch{playGrowthBtn.classList.remove('hidden')}};
growthVideo.onended=()=>showPartsBtn.classList.remove('hidden');
growthVideo.onerror=()=>showPartsBtn.classList.remove('hidden');
showPartsBtn.onclick=()=>showScreen('partsScreen');

document.querySelectorAll('[data-part]').forEach(btn=>btn.onclick=()=>openPart(btn.dataset.part));
function openPart(key){
  currentPartIndex=parts.findIndex(p=>p.key===key);
  if(currentPartIndex<0)return;
  detailImage.src=parts[currentPartIndex].image;
  detailImage.alt=parts[currentPartIndex].title;
  detailNextBtn.textContent=currentPartIndex===parts.length-1?'ابدأ التحدي':'الجزء التالي';
  showScreen('detailScreen');
}
detailBackBtn.onclick=()=>showScreen('partsScreen');
detailNextBtn.onclick=()=>{
  if(currentPartIndex<parts.length-1){
    currentPartIndex++;
    detailImage.src=parts[currentPartIndex].image;
    detailImage.alt=parts[currentPartIndex].title;
    detailNextBtn.textContent=currentPartIndex===parts.length-1?'ابدأ التحدي':'الجزء التالي';
  }else{
    showScreen('challengeScreen');
  }
};
beginQuizBtn.onclick=()=>startQuiz();

function startQuiz(){
  clearInterval(timer);
  quizOrder=shuffle(questions);
  qIndex=0;
  score=0;
  timedOutCount=0;
  showScreen('quizScreen');
  renderQuestion();
}

function renderQuestion(){
  clearInterval(timer);
  questionLocked=false;
  timeLeft=10;
  timerNum.textContent=timeLeft;
  feedbackEl.textContent='';
  const q=quizOrder[qIndex];
  quizProgress.textContent=`${qIndex+1} / ${quizOrder.length}`;
  questionText.textContent=q.q;
  answersEl.innerHTML='';
  const options=shuffle(q.options);

  options.forEach(opt=>{
    const btn=document.createElement('button');
    btn.type='button';
    btn.className='answer-btn';

    const shell=document.createElement('span');
    shell.className='icon-shell';
    const img=document.createElement('img');
    img.className='option-img';
    img.src=opt.image;
    img.alt=opt.label;
    shell.appendChild(img);

    const label=document.createElement('span');
    label.className='label';
    label.textContent=opt.label;
    btn.append(shell,label);
    btn.onclick=()=>chooseAnswer(opt,q.options.find(o=>o.correct));
    answersEl.appendChild(btn);
  });

  layoutAllMappedElements();
  timer=setInterval(()=>{
    timeLeft--;
    timerNum.textContent=timeLeft;
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
  img.src=src;
  img.alt=alt;
  img.className='answer-badge';
  btn.appendChild(img);
}

function revealAnswer(selected,correct,isTimeout=false){
  questionLocked=true;
  [...answersEl.children].forEach(btn=>{
    btn.classList.add('disabled');
    const label=btn.querySelector('.label')?.textContent;
    if(label===correct.label){
      btn.classList.add('correct');
      addBadge(btn,'correct-badge.png','صح');
    }
    if(selected&&label===selected.label&&selected.label!==correct.label){
      btn.classList.add('wrong');
      addBadge(btn,'wrong-badge.png','خطأ');
    }
  });

  if(selected&&selected.label===correct.label){
    score++;
    feedbackEl.textContent='أحسنت يا بطل 👏';
    playClap();
  }else if(isTimeout){
    feedbackEl.textContent='انتهى الوقت ⏰';
  }else{
    feedbackEl.textContent='الإجابة الصحيحة مميزة بالأخضر';
  }

  setTimeout(()=>{
    qIndex++;
    if(qIndex>=quizOrder.length)finishQuiz();
    else renderQuestion();
  },1500);
}

function finishQuiz(){
  clearInterval(timer);
  scoreText.textContent=`حصلت على ${score} من ${quizOrder.length} • انتهى الوقت في ${timedOutCount} سؤال`;
  ratingStars.querySelectorAll('button').forEach(b=>b.classList.remove('active'));
  ratingMsg.textContent='';
  ideaMsg.textContent='';
  showScreen('resultScreen');
}
restartQuizBtn.onclick=startQuiz;
returnPartsBtn.onclick=()=>showScreen('partsScreen');

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
    method:'POST',
    headers:{apikey:SUPABASE_KEY,'Content-Type':'application/json'},
    body:JSON.stringify(body)
  });
  if(!res.ok)throw new Error(await res.text());
  const text=await res.text();
  return text?JSON.parse(text):null;
}
async function refreshLike(){
  try{
    const data=await callRpc('get_invitation_stats',{p_slug:INVITATION_SLUG,p_visitor_key:VISITOR_KEY});
    const row=Array.isArray(data)?data[0]:data;
    if(row){
      likeCount.textContent=row.like_count??0;
      likeBtn.classList.toggle('liked',!!row.liked_by_me);
    }
  }catch(e){console.error(e)}
}
likeBtn.onclick=async()=>{
  likeBtn.disabled=true;
  try{
    await callRpc('toggle_invitation_like',{p_slug:INVITATION_SLUG,p_visitor_key:VISITOR_KEY});
    await refreshLike();
  }catch(e){console.error(e)}
  finally{likeBtn.disabled=false}
};
ratingStars.querySelectorAll('button').forEach(btn=>btn.onclick=async()=>{
  const r=+btn.dataset.rate;
  ratingStars.querySelectorAll('button').forEach(b=>b.classList.toggle('active',+b.dataset.rate<=r));
  ratingMsg.textContent='جاري حفظ التقييم…';
  try{
    await callRpc('submit_invitation_rating',{p_slug:INVITATION_SLUG,p_visitor_key:VISITOR_KEY,p_rating:r});
    ratingMsg.textContent='شكرًا! تم حفظ تقييمك ✓';
  }catch(e){ratingMsg.textContent='تعذر الحفظ، حاولي مرة ثانية.'}
});
sendIdeaBtn.onclick=async()=>{
  const idea=ideaInput.value.trim();
  if(!idea){ideaMsg.textContent='اكتب فكرتك أولًا 🌱';return}
  sendIdeaBtn.disabled=true;
  ideaMsg.textContent='جاري الإرسال…';
  try{
    await callRpc('submit_invitation_opinion',{
      p_slug:INVITATION_SLUG,
      p_visitor_key:VISITOR_KEY,
      p_display_name:'زائر درس أجزاء النبتة',
      p_opinion_text:`فكرة لتطوير التجربة: ${idea}`
    });
    ideaInput.value='';
    ideaMsg.textContent='شكرًا لمشاركتك! فكرتك وصلت إلينا 🌱💚';
  }catch(e){ideaMsg.textContent='تعذر الإرسال، حاولي مرة ثانية.'}
  finally{sendIdeaBtn.disabled=false}
};
async function recordView(){
  try{await callRpc('record_invitation_view',{p_slug:INVITATION_SLUG,p_visitor_key:VISITOR_KEY})}catch(e){console.error(e)}
}
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
recordView();
refreshLike();
layoutAllMappedElements();
