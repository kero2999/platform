const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {JSDOM}=require('jsdom');
const root=path.resolve(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
test('course copy removes Markdown while preserving literal HTML as text',()=>{
  const dom=new JSDOM('<p id="copy"></p>',{runScripts:'outside-only'});dom.window.eval(read('js/course-display.js'));
  const display=dom.window.QLCourseDisplay,p=dom.window.document.querySelector('p');p.textContent=display.text('**قيمة واضحة** <img src=x onerror=alert(1)>');
  assert.ok(p.textContent.startsWith('قيمة واضحة'));assert.equal(p.querySelector('img'),null);
  for(const slug of ['marketing-launch','marketing-growth','marketing-mastery','marketing-leadership']){
    assert.notEqual(display.category({slug,category:{name:'عام'}}),'عام');assert.equal(display.instructor({slug,instructor:'Kero'}),'Kero Majid');
  }dom.window.close();
});
test('public preview retains all 14 concepts and excludes private assessment assets',()=>{
  const html=read('ch1.html'),dom=new JSDOM(html),d=dom.window.document;
  for(let n=1;n<=14;n++)assert.ok(d.getElementById('concept-'+n),'missing concept '+n);
  assert.ok(d.getElementById('howto'));assert.ok(d.getElementById('chapter-summary'));
  for(const a of d.querySelectorAll('a')){const href=a.getAttribute('href');assert.ok(href.startsWith('#')||href==='/course/marketing-launch'||/^https:\/\/(www\.)?pexels\.com\//.test(href),'unsafe or private navigation: '+href)}
  for(const image of d.querySelectorAll('img')){const src=image.getAttribute('src');if(src.startsWith('/images/launch-preview/'))assert.ok(fs.existsSync(path.join(root,src)))}
  assert.ok(!html.includes('QLLearning.request'));assert.ok(!html.includes('assessment-live.js'));assert.ok(!html.includes('mentor-bridge.js'));assert.ok(!html.includes('data:font/'));assert.ok(!html.includes('أسئلة وإجابات المراجعة'));assert.ok(!html.includes('الإجابة الصحيحة'));dom.window.close();
});
test('published preview interactions and theme execute with the preserved lesson scripts',()=>{
  const dom=new JSDOM(read('ch1.html'),{url:'https://www.quadralevel.com/preview',runScripts:'outside-only'}),w=dom.window;
  w.LMSTrial={getStatus:()=>({started:true}),mountBadgeAndGuard(){}};
  for(const script of w.document.scripts)if(!script.src&&script.textContent.trim())w.eval(script.textContent);
  const d=w.document,benefit=d.querySelector('#benefitToggle');benefit.click();assert.ok(d.querySelector('#benefitText').textContent.includes('الفائدة'));
  const note=d.querySelector('[data-scene-note]');note.click();assert.equal(note.closest('.customer-universe').querySelector('.scene-note').textContent,note.dataset.sceneNote);
  const theme=d.querySelector('#theme');theme.click();assert.equal(d.body.classList.contains('dark'),true);theme.click();assert.equal(d.body.classList.contains('dark'),false);
  const motion=d.querySelector('#motion');motion.click();assert.equal(d.body.classList.contains('no-motion'),true);dom.window.close();
});
test('preview timer starts once at readable content, then expires',()=>{
  const dom=new JSDOM('<body></body>',{url:'https://www.quadralevel.com/preview',runScripts:'outside-only'}),w=dom.window;
  let now=1000000,tick,events=0;w.Date.now=()=>now;w.setInterval=fn=>(tick=fn,1);w.clearInterval=()=>{};w.QuadraMeta={startTrial(){events++}};
  w.eval(read('js/trial.js'));w.LMSTrial.prepareTrial('اختبار');assert.equal(w.LMSTrial.getStatus().pending,true);assert.equal(events,0);
  w.LMSTrial.mountBadgeAndGuard();assert.equal(events,1);assert.equal(w.LMSTrial.getStatus().remaining,600);w.LMSTrial.activateTrial();assert.equal(events,1);
  now+=601000;tick();assert.ok(w.document.querySelector('#trial-expired-overlay'));assert.equal(w.LMSTrial.getStatus().active,false);dom.window.close();
});
test('locked chapter shows recovery UI without marking the lesson complete',async()=>{
  const dom=new JSDOM(read('learn.html'),{url:'https://www.quadralevel.com/learn/marketing-growth/chapter/3',runScripts:'outside-only'}),w=dom.window;
  let completed=0;w.LMSAuth={isLoggedIn:()=>true,currentUser:()=>({id:7})};
  w.QLRoutes={current:()=>({course:'marketing-growth',chapter:3}),routes:{dashboard:id=>'/dashboard/'+id}};
  w.API_BASE_URL='https://my-server1-hk07.onrender.com';
  w.LMSPlatformAPI={getContentToken(id,options){assert.equal(options.chapter,3);return Promise.reject({message:'generic',payload:{code:'CHAPTER_LOCKED',error:'أكمل الفصل السابق',requiredChapter:2}})},completeLesson(){completed++;return Promise.resolve()}};
  const code=[...w.document.scripts].map(s=>s.textContent).find(s=>s.includes('getContentToken'));w.eval(code);await new Promise(resolve=>setImmediate(resolve));
  assert.ok(w.document.querySelector('#learnState').textContent.includes('أكمل الفصل السابق'));
  assert.ok(w.document.querySelector('#learnState a[href="/learn/marketing-growth/chapter/2?activity=assessment"]'));assert.equal(completed,0);assert.equal(w.document.querySelector('iframe').getAttribute('src'),null);dom.window.close();
});
for(const script of ['course-assessment-20261017.js','course-assessment-launch-20261017.js'])test(script+': task-specific safe rubric and empty-answer validation',async()=>{
  const ids=['templateLocked','templateContent','essayLocked','essayContent','summaryQuiz','summaryTemplate','summaryEssay','summaryNotice','liveFeedback','nextChapter','answerCount','quizResult','quizScore','quizFeedback','quizStatus','templateStatus','essayStatus','draftStatus','retryQuiz','downloadDraft'];
  const html='<body data-course-slug="marketing-growth" data-chapter="1">'+ids.map(id=>'<div id="'+id+'"></div>').join('')+'<form id="bubbleQuizForm"></form><div class="sheet-grid"></div><div class="task-brief"><h3></h3><p></p></div><div class="task-scenario"><p></p></div><form id="practicalTemplateForm"><div class="template-grid"></div><div class="review-rubric"><ul><li>wrong shared rubric</li></ul></div></form><form id="essayForm"><button>submit</button></form><div class="preview-mode"></div></body>';
  const dom=new JSDOM(html,{url:'https://www.quadralevel.com/',runScripts:'outside-only'}),w=dom.window;
  const criteria=['السؤال مرتبط بقرار واضح.','<img src=x onerror=alert(1)>'];let submissions=0;
  w.HTMLElement.prototype.scrollIntoView=function(){};
  w.QLLearning={request:async action=>{if(action!=='learning')submissions++;return {draftScope:'test',chapter:{quiz:{version:'v1',questions:[{q:'سؤال',options:['أ','ب']}]},practicalTemplate:{taskTitle:'ابحث',taskDescription:'بحث',scenario:'حالة',fields:[{id:'question',label:'سؤال البحث'}],resultPrompt:'القرار',reviewCriteria:criteria}}}}};
  w.eval(read('js/'+script));await new Promise(resolve=>setImmediate(resolve));
  const rubric=w.document.querySelector('.review-rubric ul');assert.deepEqual([...rubric.children].map(x=>x.textContent),criteria);assert.equal(rubric.querySelector('img'),null);
  w.document.querySelector('#bubbleQuizForm').dispatchEvent(new w.Event('submit',{cancelable:true}));assert.equal(submissions,0);assert.ok(w.document.querySelector('#quizStatus').textContent.includes('السؤال 1'));dom.window.close();
});
