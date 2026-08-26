/* QuadraLevel clean URL helpers. Legacy query links remain supported by each page. */
(function (global) {
  function decode(value) {
    try { return decodeURIComponent(String(value || "")); } catch (e) { return String(value || ""); }
  }

  function segments() {
    return location.pathname.split("/").filter(Boolean).map(decode);
  }

  function query(name) {
    return new URLSearchParams(location.search).get(name) || "";
  }

  function routeValue(index) {
    return segments()[index] || "";
  }

  function encode(value) {
    return encodeURIComponent(String(value || "").trim());
  }

  function current() {
    var parts = segments();
    var queryCourse = query("course") || query("id");
    var type = parts[0] || "";
    var course = queryCourse;
    var chapter = Number(query("chapter") || query("ch") || 0);
    var code = query("code");

    if (type === "course" && parts[1]) course = parts[1];
    if (type === "reviews" && parts[1]) course = parts[1];
    if (type === "dashboard" && parts[1]) course = parts[1];
    if (type === "project" && parts[1]) course = parts[1];
    if (type === "certificate" && parts[1]) course = parts[1];
    if (type === "learn" && parts[1]) {
      course = parts[1];
      chapter = Number(parts[3] || parts[2] || chapter || 0);
    }
    if (type === "quiz" && parts[1]) {
      course = parts[1];
      chapter = Number(parts[3] || parts[2] || chapter || 1);
    }
    if (type === "verify-certificate" && parts[1]) code = parts[1];
    return { type: type, course: course, chapter: chapter, code: code };
  }

  var routes = {
    course: function (slug) { return "/course/" + encode(slug); },
    reviews: function (slug) { return "/reviews/" + encode(slug); },
    dashboard: function (slug) { return "/dashboard/" + encode(slug); },
    learn: function (slug, chapter) { return "/learn/" + encode(slug) + "/chapter/" + encode(chapter || 1); },
    quiz: function (slug, chapter) { return "/quiz/" + encode(slug) + "/chapter/" + encode(chapter || 1); },
    project: function (slug) { return "/project/" + encode(slug); },
    certificate: function (slug) { return "/certificate/" + encode(slug); },
    verifyCertificate: function (code) { return "/verify-certificate/" + encode(code); },
  };

  global.QLRoutes = { current: current, routes: routes };
})(window);
