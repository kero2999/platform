/* Quadra Level Platform API client
   Shared by the marketplace shell and uploaded course packages.
   The server remains the source of truth for identity and access. */
(function (global) {
  const TOKEN_KEY = "lms_token_v1";

  function token() {
    return localStorage.getItem(TOKEN_KEY) || "";
  }

  async function request(path, options) {
    if (typeof API_BASE_URL !== "string" || !API_BASE_URL) {
      throw new Error("رابط الـAPI غير مضبوط.");
    }
    const opts = options || {};
    const headers = Object.assign({}, opts.headers || {});
    if (opts.body && !headers["Content-Type"]) headers["Content-Type"] = "application/json";
    const jwt = token();
    if (jwt) headers.Authorization = "Bearer " + jwt;

    const requestOptions = Object.assign({}, opts, { headers });
    if (!requestOptions.method || String(requestOptions.method).toUpperCase() === "GET") requestOptions.cache = "no-store";
    const response = await fetch(API_BASE_URL + path, requestOptions);
    let data = null;
    try { data = await response.json(); } catch (e) { data = {}; }
    if (!response.ok || data.ok === false) {
      const error = new Error(data.error || "تعذر تنفيذ الطلب.");
      error.status = response.status;
      error.payload = data;
      throw error;
    }
    return data;
  }

  function courseId(value) {
    const id = String(value || "").trim();
    if (!id || id.includes("/")) throw new Error("course_id غير صالح.");
    return encodeURIComponent(id);
  }

  const api = {
    request,
    getCourses: (filters) => {
      const params = new URLSearchParams();
      if (filters && filters.category) params.set("category", filters.category);
      const query = params.toString();
      return request("/api/courses" + (query ? "?" + query : ""));
    },
    getCourse: (id) => request("/api/courses/" + courseId(id)),
    getAccess: (id) => request("/api/courses/" + courseId(id) + "/access"),
    getContentToken: (id) => request("/api/courses/" + courseId(id) + "/content-token?fresh=" + Date.now()),
    startTrial: (id) => request("/api/courses/" + courseId(id) + "/trial/start", { method: "POST", body: "{}" }),
    getProgress: (id) => request("/api/courses/" + courseId(id) + "/progress"),
    saveProgress: (id, payload) => request("/api/courses/" + courseId(id) + "/progress", {
      method: "PUT",
      body: JSON.stringify(payload || {}),
    }),
    completeLesson: (id, lessonKey, lastPosition) => request(
      "/api/courses/" + courseId(id) + "/lessons/" + encodeURIComponent(lessonKey),
      { method: "POST", body: JSON.stringify({ lastPosition: lastPosition || {} }) }
    ),
    submitQuiz: (id, quizId, answers) => request("/api/courses/" + courseId(id) + "/quizzes/" + encodeURIComponent(quizId) + "/submit", {
      method: "POST",
      body: JSON.stringify({ answers: Array.isArray(answers) ? answers : [] }),
    }),
    getQuizResult: (id, quizId) => request("/api/courses/" + courseId(id) + "/quizzes/" + encodeURIComponent(quizId) + "/result"),
    submitProject: (id, projectId, text) => request("/api/courses/" + courseId(id) + "/projects/" + encodeURIComponent(projectId) + "/submit", {
      method: "POST",
      body: JSON.stringify({ text: String(text || "") }),
    }),
    getProjectStatus: (id, projectId) => request("/api/courses/" + courseId(id) + "/projects/" + encodeURIComponent(projectId) + "/status"),
    getCertificate: (id) => request("/api/courses/" + courseId(id) + "/certificate"),
    createCheckout: (id) => request("/api/payments/course/" + courseId(id) + "/create", {
      method: "POST",
      body: "{}",
    }),
  };

  global.LMSPlatformAPI = api;
})(window);
