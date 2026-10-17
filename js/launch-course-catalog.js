(()=>{'use strict';
 const style=document.createElement('style');
 style.textContent='.course-card[data-locked="true"] .course-card-actions a{opacity:.55;cursor:not-allowed}.ql-catalog-account{display:flex;gap:12px;flex-wrap:wrap;margin:24px 0;padding:22px;border:1px solid currentColor;border-radius:18px}.ql-catalog-account a{color:inherit;font-weight:700;line-height:1.8}';document.head.append(style);
 const panel=document.createElement('nav');panel.className='ql-catalog-account';panel.setAttribute('aria-label','التقدم ومشروع التخرج');
 panel.innerHTML='<a href="https://www.quadralevel.com/dashboard/marketing-launch?view=progress" target="_top">التقدم، مشروع التخرج، والشهادة ←</a>';
 const footer=document.querySelector('.index-footer');if(footer)footer.before(panel);
 const cards=[...document.querySelectorAll('.course-card[data-chapter]')];
 cards.forEach(card=>{card.dataset.locked='false';card.dataset.progressState='pending';const label=card.querySelector('.local-status');if(label)label.textContent='جاري التحقق من تقدمك...';card.querySelectorAll('.course-card-actions a').forEach(a=>{a.removeAttribute('aria-disabled');a.addEventListener('click',e=>{if(card.dataset.locked==='true')e.preventDefault()})})});
 function unavailable(){cards.forEach(card=>{if(card.dataset.progressState==='pending'){card.dataset.locked='false';const label=card.querySelector('.local-status');if(label)label.textContent='التقدم غير متاح حاليًا؛ يمكنك فتح الفصل للتحقق من إتاحته.'}})}
 if(!window.QLLearning){unavailable();return;}
 const timer=setTimeout(unavailable,10000);
 window.QLLearning.request('catalog',1).then(data=>{clearTimeout(timer);
  cards.forEach(card=>{const ch=(data.chapters||[]).find(ch=>Number(ch.number)===Number(card.dataset.chapter));if(!ch)return;const unlocked=!!ch.unlocked;card.dataset.progressState='loaded';card.dataset.locked=String(!unlocked);card.querySelectorAll('.course-card-actions a').forEach(a=>a.setAttribute('aria-disabled',String(!unlocked)));
   const label=card.querySelector('.local-status');if(label)label.textContent=ch?.completed?'اجتزت الفصل'+(ch.chapterScore!=null?' — '+ch.chapterScore+'%':''):unlocked?'الفصل متاح للدراسة والاختبار':'يفتح بعد اجتياز تقييم الفصل السابق.';
  });
 }).catch(()=>{clearTimeout(timer);unavailable()});
})();
