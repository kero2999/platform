(function (global) {
  'use strict';
  var levels = {'marketing-launch':'الأول','marketing-growth':'الثاني','marketing-mastery':'الثالث','marketing-leadership':'الرابع'};
  function text(value) {
    return String(value || '').replace(/\*\*([^*]+)\*\*/g, '$1').replace(/\r\n/g, '\n').trim();
  }
  function category(course) {
    var name = course.category && course.category.name;
    return name && name !== 'عام' ? name : levels[course.slug] ? 'التسويق — المستوى ' + levels[course.slug] : name || 'كورس رقمي';
  }
  function instructor(course) {
    return levels[course.slug] && /^kero(?:\s+majid)?$/i.test(String(course.instructor || '').trim()) ? 'Kero Majid' : course.instructor || 'فريق Quadralevel';
  }
  global.QLCourseDisplay = {text:text, category:category, instructor:instructor};
})(window);
