const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {JSDOM}=require('jsdom');
for(const slug of ['marketing-launch','marketing-growth','marketing-mastery','marketing-leadership'])test(slug+': project and certificate navigate directly, results stay separate',()=>{
 const dom=new JSDOM('<body data-course-slug="'+slug+'"><footer class="index-footer"></footer></body>',{url:'https://www.quadralevel.com/',runScripts:'outside-only'});
 dom.window.eval(fs.readFileSync(path.join(__dirname,'../js/launch-course-catalog.js'),'utf8'));
 const links=[...dom.window.document.querySelectorAll('.ql-catalog-account a')];
 const project=links.find(a=>a.textContent==='مشروع التخرج ←');assert.equal(project.href,'https://www.quadralevel.com/project/'+slug);assert.equal(project.target,'_top');
 const certificate=links.find(a=>a.textContent==='الشهادة ←');assert.equal(certificate.href,'https://www.quadralevel.com/certificate/'+slug);assert.equal(certificate.target,'_top');
 assert.equal(links.filter(a=>a.href.includes('/dashboard/')).length,1);assert.equal(links.find(a=>a.href.includes('/dashboard/')).textContent,'عرض نتائجي ←');dom.window.close();
});
