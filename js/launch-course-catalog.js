(()=>{'use strict';
 const style=document.createElement('style');
 style.textContent='.course-card[data-locked="true"] .course-card-actions a{opacity:.55;cursor:not-allowed}.ql-catalog-account{display:flex;gap:12px;flex-wrap:wrap;margin:24px 0;padding:22px;border:1px solid currentColor;border-radius:18px}.ql-catalog-account a{color:inherit;font-weight:700;line-height:1.8}';document.head.append(style);
 const panel=document.createElement('nav');panel.className='ql-catalog-account';panel.setAttribute('aria-label','التقدم ومشروع التخرج');
 panel.innerHTML='<a href="https://www.quadralevel.com/dashboard/marketing-launch?view=progress" target="_top">التقدم، مشروع التخرج، والشهادة ←</a>';
 const footer=document.querySelector('.index-footer');if(footer)footer.before(panel);
 const cards=[...document.querySelectorAll('.course-card[data-chapter]')];
 cards.forEach(card=>{card.dataset.locked='true';const label=card.querySelector('.local-status');if(label)label.textContent='جاري التحقق من تقدمك...';card.querySelectorAll('.course-card-actions a').forEach(a=>{a.setAttribute('aria-disabled','true');a.addEventListener('click',e=>{if(card.dataset.locked==='true')e.preventDefault()})})});
 if(!window.QLLearning)return;
 window.QLLearning.request('catalog',1).then(data=>{
  cards.forEach(card=>{const ch=(data.chapters||[]).find(ch=>ch.number===Number(card.dataset.chapter));const unlocked=!!ch?.unlocked;card.dataset.locked=String(!unlocked);card.querySelectorAll('.course-card-actions a').forEach(a=>a.setAttribute('aria-disabled',String(!unlocked)));
   const label=card.querySelector('.local-status');if(label)label.textContent=ch?.completed?'اجتزت الفصل'+(ch.chapterScore!=null?' — '+ch.chapterScore+'%':''):unlocked?'الفصل متاح للدراسة والاختبار':'يفتح بعد اجتياز تقييم الفصل السابق.';
  });
 }).catch(()=>{cards.forEach(card=>{const label=card.querySelector('.local-status');if(label)label.textContent='تعذر تحميل التقدم. حدّث الصفحة أو افتح لوحة التقدم.'})});
})();
