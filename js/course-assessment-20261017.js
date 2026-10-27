(()=>{'use strict';
const slug=document.body.dataset.courseSlug||'marketing-growth',n=Number(document.body.dataset.chapter),$=s=>document.querySelector(s),all=s=>[...document.querySelectorAll(s)];
let chapter=null,assessment=null,key='',draft={quizAnswers:[],templateAnswers:{},templateResult:'',essayAnswers:[]},pending=false;
const letters=['أ','ب','ج','د'];
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function rpc(action,extra={}){return window.QLLearning.request(action,n,extra)}
function save(){if(!key)return;try{localStorage.setItem(key,JSON.stringify(draft));$('#draftStatus').textContent='مسودتك محفوظة على هذا الجهاز؛ الدرجات وفتح الفصول من المنصة.'}catch{$('#draftStatus').textContent='نزّل المسودة للاحتفاظ بإجاباتك.'}}
function stage(id){all('.stage-panel').forEach(p=>p.hidden=p.id!==id);all('.assessment-road [data-stage-target]').forEach(b=>{b.setAttribute('aria-selected',String(b.dataset.stageTarget===id));b.tabIndex=b.dataset.stageTarget===id?0:-1});refresh()}
function refresh(){
 const hasQuiz=!!chapter?.result,hasQuestions=assessment?.status==='questions_pending'&&assessment.questions?.length>0;
 $('#templateLocked').hidden=hasQuiz;$('#templateContent').hidden=!hasQuiz;
 $('#essayLocked').hidden=hasQuestions;$('#essayContent').hidden=!hasQuestions;
 $('#summaryQuiz').textContent=chapter?.result?chapter.result.score+'%':'لم يُسلّم بعد';
 $('#summaryTemplate').textContent=assessment?assessment.templateScore+'%':'لم يُرسل بعد';
 $('#summaryEssay').textContent=assessment?.status==='evaluated'?assessment.understandingScore+'%':'لم يُقيّم بعد';
 $('#summaryNotice').textContent=assessment?.status==='evaluated'?'درجة الفصل: '+assessment.chapterScore+'% — '+(assessment.passed?'اجتزت الفصل. يمكنك الانتقال للفصل التالي.':'راجع ملاحظات Kero وعدّل تطبيقك لإعادة التقييم.'):(assessment?.status==='questions_pending'?'راجع Kero تطبيقك. أجب عن أسئلة الفهم لإكمال التقييم.':'أكمل الاختبار ثم التطبيق وأسئلة الفهم. يُفتح الفصل التالي بقرار المنصة عند متوسط 75% أو أكثر.');
 $('#liveFeedback').textContent=assessment?.finalFeedback||assessment?.feedback||assessment?.templateFeedback||'';
 const next=$('#nextChapter');next.hidden=!assessment?.passed||n>=12;
 if(!next.hidden){next.href='https://www.quadralevel.com/learn/'+encodeURIComponent(slug)+'/chapter/'+(n+1);next.target='_top'}
}
function choose(i,j){if(pending)return;draft.quizAnswers[i]=j;all(`input[name="q-${i}"]`).forEach(r=>r.checked=Number(r.value)===j);all(`[data-bubble-q="${i}"]`).forEach(b=>b.setAttribute('aria-pressed',String(Number(b.dataset.bubbleA)===j)));$('#answerCount').textContent=draft.quizAnswers.filter(Number.isInteger).length+' من '+chapter.quiz.questions.length;save()}
function quiz(){const qs=chapter.quiz.questions;
 $('#bubbleQuizForm').innerHTML=qs.map((q,i)=>'<article class="question-card" id="question-'+i+'"><div class="question-top"><span>'+String(i+1).padStart(2,'0')+'</span><h3>'+esc(q.q)+'</h3></div>'+q.options.map((o,j)=>'<label class="option"><input type="radio" name="q-'+i+'" data-quiz-answer="'+i+'" value="'+j+'"><span>'+esc(o)+'</span></label>').join('')+'</article>').join('');
 $('.sheet-grid').innerHTML=qs.map((q,i)=>'<div class="bubble-row"><b>'+String(i+1).padStart(2,'0')+'</b>'+q.options.map((o,j)=>'<button class="bubble" type="button" data-bubble-q="'+i+'" data-bubble-a="'+j+'" aria-pressed="false" aria-label="السؤال '+(i+1)+' — '+letters[j]+'">'+letters[j]+'</button>').join('')+'</div>').join('');
 all('[data-quiz-answer]').forEach(r=>r.onchange=()=>choose(Number(r.dataset.quizAnswer),Number(r.value)));
 all('[data-bubble-q]').forEach(b=>b.onclick=()=>choose(Number(b.dataset.bubbleQ),Number(b.dataset.bubbleA)));
 draft.quizAnswers=qs.map((q,i)=>Number.isInteger(draft.quizAnswers[i])&&draft.quizAnswers[i]>=0&&draft.quizAnswers[i]<q.options.length?draft.quizAnswers[i]:null);
 draft.quizAnswers.forEach((a,i)=>{if(Number.isInteger(a))choose(i,a)});
 if(chapter.result)grade(chapter.result);
}
function grade(result){$('#quizResult').hidden=false;$('#quizScore').textContent=result.score+'%';$('#quizFeedback').textContent='درجة الاختبار المسجّلة على المنصة. اجتياز الفصل يعتمد أيضًا على التطبيق وأسئلة الفهم.';refresh()}
function template(){const t=chapter.practicalTemplate;if(!t)throw new Error('لم يتم إعداد التمبليت لهذا الفصل.');
 const rubric=$('.review-rubric ul');if(rubric){const criteria=Array.isArray(t.reviewCriteria)&&t.reviewCriteria.length?t.reviewCriteria:(t.fields||[]).map(f=>'وضّح إجابتك عن: '+f.label);rubric.replaceChildren(...criteria.map(item=>{const li=document.createElement('li');li.textContent=item;return li}));}
 $('.task-brief h3').textContent=t.taskTitle;$('.task-brief p').textContent=t.taskDescription;$('.task-scenario p').textContent=t.scenario;
 $('.template-grid').innerHTML=(t.fields||[]).map((f,i)=>'<div class="template-field"><label for="template-'+esc(f.id)+'"><span>'+String(i+1).padStart(2,'0')+'</span>'+esc(f.label)+'</label><textarea id="template-'+esc(f.id)+'" data-template-field="'+esc(f.id)+'" maxlength="4000" rows="4" '+(f.required?'required':'')+' placeholder="'+esc(f.placeholder||'')+'"></textarea></div>').join('')+'<div class="template-field result-field"><label for="templateResult"><span>↗</span>'+esc(t.resultPrompt)+'</label><textarea id="templateResult" maxlength="4000" rows="4" required></textarea></div>';
 all('[data-template-field]').forEach(input=>{input.value=String(draft.templateAnswers?.[input.dataset.templateField]||'');input.oninput=()=>{draft.templateAnswers[input.dataset.templateField]=input.value;save()}});
 $('#templateResult').value=draft.templateResult||'';$('#templateResult').oninput=e=>{draft.templateResult=e.target.value;save()};
}
function essays(){const f=$('#essayForm');f.querySelectorAll('.essay-question').forEach(e=>e.remove());
 const qs=assessment?.status==='questions_pending'?assessment.questions||[]:[];
 if(draft.assessmentId!==assessment?.id){draft.essayAnswers=[];draft.assessmentId=assessment?.id||null;save()}
 qs.forEach((q,i)=>{const div=document.createElement('div');div.className='essay-question';div.innerHTML='<label for="essay-'+i+'">'+(i+1)+' — '+esc(q.question||q.q||q)+'</label><textarea id="essay-'+i+'" data-essay="'+i+'" rows="5" maxlength="4000" required></textarea>';f.insertBefore(div,f.firstElementChild);const input=div.querySelector('textarea');input.value=draft.essayAnswers[i]||'';input.oninput=()=>{draft.essayAnswers[i]=input.value;save()}});
 // Keep the server's question order.
 const items=[...f.querySelectorAll('.essay-question')].reverse();items.forEach(e=>f.insertBefore(e,f.querySelector('button')));
 $('.preview-mode').textContent='هذه الأسئلة أعدّها Kero من تطبيقك الفعلي. اشرح قرارك بوضوح.';
}
async function run(status,operation){if(pending)return;pending=true;const controls=all('button,input,textarea');controls.forEach(e=>e.disabled=true);$(status).textContent='جاري الاتصال بالمنصة...';try{await operation();$(status).textContent='تم الحفظ والتقييم على المنصة.'}catch(e){$(status).textContent=e.message+' — إجاباتك لم تُحذف.'}finally{pending=false;controls.forEach(e=>{if(e.isConnected)e.disabled=false});refresh()}}
all('[data-stage-target]').forEach(b=>b.onclick=()=>stage(b.dataset.stageTarget));
all('.assessment-road [role="tab"]').forEach((b,i)=>b.onkeydown=e=>{const tabs=all('.assessment-road [role="tab"]');let j=i;if(e.key==='ArrowLeft')j=(i+1)%tabs.length;else if(e.key==='ArrowRight')j=(i+tabs.length-1)%tabs.length;else if(e.key==='Home')j=0;else if(e.key==='End')j=tabs.length-1;else return;e.preventDefault();tabs[j].click();tabs[j].focus()});
$('#bubbleQuizForm').onsubmit=e=>{e.preventDefault();if(!chapter)return;const missing=draft.quizAnswers.findIndex(a=>!Number.isInteger(a));if(missing!==-1){$('#quizStatus').textContent='أكمل إجابة السؤال '+(missing+1);$('#question-'+missing).scrollIntoView({block:'center'});return}run('#quizStatus',async()=>{const d=await rpc('quiz',{answers:draft.quizAnswers,quizVersion:chapter.quiz.version});chapter.result=d.attempt;grade(d.attempt);save()})};
$('#retryQuiz').onclick=()=>{if(pending||!chapter)return;draft.quizAnswers=Array(chapter.quiz.questions.length).fill(null);quiz();$('#quizResult').hidden=true;save()};
$('#practicalTemplateForm').onsubmit=e=>{e.preventDefault();if(!chapter?.result||!e.target.reportValidity())return;const text=Object.values(draft.templateAnswers).join(' ')+draft.templateResult;if(text.trim().length<40||draft.templateResult.trim().length<5){$('#templateStatus').textContent='أكمل الحقول والنتيجة النهائية بتفاصيل كافية.';return}run('#templateStatus',async()=>{const d=await rpc('template',{submission:{answers:draft.templateAnswers,result:draft.templateResult}});assessment=d.assessment;essays();stage('essayStage');save()})};
$('#essayForm').onsubmit=e=>{e.preventDefault();if(!assessment||!e.target.reportValidity())return;const answers=(assessment.questions||[]).map((_,i)=>String(draft.essayAnswers[i]||'').trim());if(answers.some(a=>!a)){ $('#essayStatus').textContent='أجب عن جميع أسئلة الفهم.';return}run('#essayStatus',async()=>{const d=await rpc('understanding',{assessmentId:assessment.id,answers});assessment=d.assessment;stage('summaryStage');save()})};
$('#downloadDraft').onclick=()=>{const blob=new Blob([JSON.stringify({chapter:n,...draft},null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='Quadralevel-ch'+n+'-draft.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000)};
all('form button,input,textarea').forEach(e=>e.disabled=true);
rpc('learning').then(d=>{chapter=d.chapter;assessment=chapter.assessment;key='ql_live_'+slug+'_'+d.draftScope+'_ch'+n;try{const old=JSON.parse(localStorage.getItem(key)||'null');if(old)draft={...draft,...old}}catch{}if(draft.quizVersion!==chapter.quiz.version)draft.quizAnswers=[];draft.quizVersion=chapter.quiz.version;
 if(!Object.keys(draft.templateAnswers||{}).length&&assessment?.templateSubmission){draft.templateAnswers=assessment.templateSubmission.answers||{};draft.templateResult=assessment.templateSubmission.result||''}
 quiz();template();essays();all('button,input,textarea').forEach(e=>e.disabled=false);refresh();save();$('#quizStatus').textContent='الاختبار متصل بالمنصة.';
}).catch(e=>{$('#quizStatus').textContent=e.message;$('#draftStatus').textContent='تعذر تحميل التقييم. أعد فتح الفصل من لوحة الكورس.'});
})();

