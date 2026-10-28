(function(){
  const choice=document.getElementById('replayPreference'),save=document.getElementById('saveReplayPreference'),withdraw=document.getElementById('withdrawReplayPreference'),status=document.getElementById('replayPreferenceStatus');
  if(!choice||!window.LMSPlatformAPI)return;
  let known=false;
  const draw=p=>{choice.checked=p&&p.allowed===true;known=true;save.disabled=false;withdraw.disabled=false;status.textContent=choice.checked?'اختيارك الحالي: موافق اختياريًا. تسجيل الجلسات ما زال متوقفًا.':'اختيارك الحالي: غير موافق. لا يتم تحميل Clarity.';};
  LMSPlatformAPI.request('/api/auth/me').then(data=>draw(data.user&&data.user.replayPreference)).catch(()=>{status.textContent='تعذّر تحميل اختيارك. يمكنك سحب الموافقة مباشرة.';withdraw.disabled=false;});
  async function update(allowed){save.disabled=true;withdraw.disabled=true;status.textContent='جاري حفظ اختيارك…';try{const data=await LMSPlatformAPI.request('/api/auth/session-replay-consent',{method:'POST',body:JSON.stringify({allowed,adultConfirmed:allowed,noticeVersion:'2026-10-28-replay-choice.1'})});draw(data.preference);}catch(error){status.textContent=error.message||'تعذّر حفظ اختيارك.';save.disabled=!known;withdraw.disabled=false;}}
  save.addEventListener('click',()=>update(choice.checked));
  withdraw.addEventListener('click',()=>update(false));
})();
