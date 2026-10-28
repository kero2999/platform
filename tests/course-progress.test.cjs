const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {JSDOM}=require('jsdom');
const html=fs.readFileSync(path.join(__dirname,'../dashboard.html'),'utf8');
async function render(project){
 const dom=new JSDOM(html,{url:'https://www.quadralevel.com/dashboard/marketing-leadership?view=progress',runScripts:'outside-only'}),w=dom.window;
 w.QLRoutes={current:()=>({course:'marketing-leadership'}),routes:{learn:(s,n)=>'/learn/'+s+'/chapter/'+n,course:s=>'/course/'+s,quiz:(s,n)=>'/quiz/'+s+'/'+n,certificate:s=>'/certificate/'+s,project:s=>'/project/'+s}};
 w.QLCourseDisplay={text:x=>x,instructor:()=> 'Kero Majid'};
 w.LMSPlatformAPI={getLearning:async()=>({learning:{course:{slug:'marketing-leadership',title:'Marketing Leadership',entryFile:'leadership-visual-index.html'},overall:{completedChapters:1},chapters:[{number:1,title:'الفصل الأول',unlocked:true,completed:true,progress:100,quiz:{questionCount:10},assessment:{chapterScore:85,passed:true}},{number:2,title:'الفصل الثاني',unlocked:true,progress:0},{number:3,title:'الفصل الثالث',unlocked:false,progress:0}],project}}),getReviewRequest:async()=>({})};
 for(const script of w.document.scripts)if(!script.src&&script.textContent.trim())w.eval(script.textContent);
 await new Promise(resolve=>setImmediate(resolve));return dom;
}
test('progress view retains chapter scores, locks and correct course index',async()=>{const dom=await render({ready:false}),d=dom.window.document;assert.equal(d.querySelector('#learningPage').style.display,'block');assert.equal(d.querySelectorAll('#chapterGrid article').length,3);assert.equal(d.querySelector('#overallPct').textContent,'33%');assert.ok(d.querySelector('#chapterGrid').textContent.includes('85%'));assert.equal(d.querySelectorAll('#chapterGrid .locked button:disabled').length,1);assert.equal(d.querySelector('#courseIndexLink').getAttribute('href'),'/learn/marketing-leadership/chapter/1?activity=index');assert.ok(d.querySelector('#projectActions button').disabled);dom.window.close()});
test('ready project retains correct project destination',async()=>{const dom=await render({ready:true}),d=dom.window.document;assert.equal(d.querySelector('#projectActions a').getAttribute('href'),'/project/marketing-leadership');dom.window.close()});
test('passed project retains certificate destination',async()=>{const dom=await render({passed:true,submission:{score:90}}),d=dom.window.document;assert.equal(d.querySelector('#projectActions a').getAttribute('href'),'/certificate/marketing-leadership');assert.ok(d.querySelector('#projectSub').textContent.includes('90%'));dom.window.close()});
