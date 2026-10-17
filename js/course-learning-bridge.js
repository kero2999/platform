(function (global) {
  'use strict';
  const busy = new Set();
  async function handle(event, context) {
    const data = event.data || {};
    if (event.source !== context.frame.contentWindow || event.origin !== context.origin) return;
    if (typeof data.requestId !== 'string' || data.requestId.length > 120 || busy.has(data.requestId)) return;
    const actions = ['learning', 'catalog', 'quiz', 'template', 'understanding'];
    if (!actions.includes(data.action) || Number(data.chapter) !== context.chapter || context.chapter < 1 || context.chapter > 12) return;
    busy.add(data.requestId);
    const source = event.source;
    function reply(ok, payload) {
      if (source === context.frame.contentWindow) source.postMessage({type:'ql-learning-response',requestId:data.requestId,ok,payload}, context.origin);
    }
    try {
      const api = global.LMSPlatformAPI;
      const learningResponse = await api.getLearning(context.course);
      const learning = learningResponse.learning;
      const chapter = (learning.chapters || []).find(ch => ch.number === context.chapter);
      if (!chapter || !chapter.unlocked) throw new Error('هذا الفصل مقفول. أكمل تقييم الفصل السابق أولًا.');
      let result;
      if (data.action === 'catalog') {
        result = {chapters:(learning.chapters||[]).map(ch=>({number:ch.number,unlocked:ch.unlocked,completed:ch.completed,chapterScore:ch.assessment?.chapterScore})),overall:learning.overall};
      } else if (data.action === 'learning') {
        result = {course:learning.course,chapter,draftScope:String(global.LMSAuth?.currentUser?.()?.id || "session")};
      } else if (data.action === 'quiz') {
        if (!chapter.quiz || data.quizVersion !== chapter.quiz.version) throw new Error('تم تحديث الاختبار. حدّث الصفحة قبل التسليم.');
        result = await api.submitQuiz(context.course, chapter.quiz.id, data.answers, data.quizVersion);
      } else if (data.action === 'template') {
        result = await api.startChapterAssessment(context.course, context.chapter, data.submission);
      } else {
        if (!data.assessmentId || !chapter.assessment || String(chapter.assessment.id) !== String(data.assessmentId)) throw new Error('أعد تحميل تقييم الفصل قبل التسليم.');
        result = await api.submitChapterAssessment(context.course,context.chapter,data.assessmentId,data.answers);
      }
      reply(true,result);
    } catch (error) {
      reply(false,{error:error.payload?.error || error.message || 'تعذر الاتصال. مسودتك محفوظة.'});
    } finally { busy.delete(data.requestId); }
  }
  global.QLCourseBridge = {handle};
})(window);
