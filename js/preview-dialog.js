(function(){
  'use strict';
  var dialog=document.getElementById('previewDialog'), form=document.getElementById('previewForm');
  if(!dialog||!form)return;
  function open(event){if(event)event.preventDefault();dialog.showModal();document.getElementById('previewName').focus();}
  document.querySelectorAll('[data-open-preview]').forEach(function(link){link.addEventListener('click',open);});
  dialog.querySelector('.preview-close').addEventListener('click',function(){dialog.close();});
  dialog.addEventListener('click',function(event){if(event.target===dialog)dialog.close();});
  form.addEventListener('submit',function(event){event.preventDefault();var name=document.getElementById('previewName').value.trim();if(!name)return;LMSTrial.prepareTrial(name);location.assign('/preview');});
  if(new URLSearchParams(location.search).get('preview')==='1')open();
})();
