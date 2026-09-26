/* Quadra Level Platform API client
   Shared by the marketplace shell and uploaded course packages.
   The server remains the source of truth for identity and access. */
(function (global) {
  const TOKEN_KEY = "lms_token_v1";
  const COUNTRY_KEY = "ql_country_code_v1";
  const COUNTRY_CODE_PATTERN = /^[A-Z]{2}$/;
  const FRIENDLY_FAILURE_MESSAGE = "الخدمة مشغولة حاليًا. انتظر لحظات ثم أعد المحاولة. لم يتم فقدان بياناتك.";

  function token() {
    return localStorage.getItem(TOKEN_KEY) || "";
  }

  function countryCode() {
    let code = "";
    try {
      const user = global.LMSAuth && global.LMSAuth.currentUser ? global.LMSAuth.currentUser() : null;
      if (user && user.id) code = String(localStorage.getItem("ql_country_code_user_" + String(user.id)) || "");
      if (!code) code = String(localStorage.getItem(COUNTRY_KEY) || "");
    } catch (error) {
      code = String(localStorage.getItem(COUNTRY_KEY) || "");
    }
    code = code.trim().toUpperCase();
    return COUNTRY_CODE_PATTERN.test(code) ? code : "";
  }

  async function request(path, options) {
    try {
      if (typeof API_BASE_URL !== "string" || !API_BASE_URL) {
        throw new Error("API_NOT_CONFIGURED");
      }
      const opts = options || {};
      const headers = Object.assign({}, opts.headers || {});
      if (opts.body && !headers["Content-Type"]) headers["Content-Type"] = "application/json";
      const jwt = token();
      if (jwt && opts.skipAuth !== true) headers.Authorization = "Bearer " + jwt;
      const selectedCountry = countryCode();
      if (selectedCountry) headers["X-Country-Code"] = selectedCountry;

      const requestOptions = Object.assign({}, opts, { headers });
      delete requestOptions.skipAuth;
      if (!requestOptions.method || String(requestOptions.method).toUpperCase() === "GET") {
        if (!requestOptions.cache) requestOptions.cache = "no-store";
      }
      const response = await fetch(API_BASE_URL + path, requestOptions);
      let data = null;
      try { data = await response.json(); } catch (e) { data = {}; }
      if (!response.ok || data.ok === false) {
        const error = new Error(data.error || "REQUEST_FAILED");
        error.status = response.status;
        error.payload = data;
        throw error;
      }
      return data;
    } catch (error) {
      const errorCode = error && error.payload && error.payload.code;
      const isPaymentRequest = /\/api\/payments\//.test(String(path || ""));
      const keepSpecificMessage = isPaymentRequest || errorCode === "PAYMENT_PENDING" || errorCode === "WALLET_PHONE_INVALID";
      error.userMessage = keepSpecificMessage && error.payload && error.payload.error ? error.payload.error : FRIENDLY_FAILURE_MESSAGE;
      error.message = error.userMessage;
      throw error;
    }
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
      return request("/api/courses" + (query ? "?" + query : ""), { cache: "no-store" });
    },
    getCourse: (id) => request("/api/courses/" + courseId(id), { cache: "no-store" }),
    getCountries: () => request("/api/countries", { skipAuth: true, cache: "no-store" }),
    getMyCountry: () => request("/api/countries/me"),
    saveMyCountry: (code) => request("/api/countries/me", { method: "PATCH", body: JSON.stringify({ countryCode: code }) }),
    getAccess: (id) => request("/api/courses/" + courseId(id) + "/access"),
    getLearning: (id) => request("/api/courses/" + courseId(id) + "/learning"),
    getLearningPreview: (id) => request("/api/courses/" + courseId(id) + "/preview"),
    getContentToken: (id) => request("/api/courses/" + courseId(id) + "/content-token?fresh=" + Date.now()),
    startTrial: (id) => request("/api/courses/" + courseId(id) + "/trial/start", { method: "POST", body: "{}" }),
    getCampaign: (id) => request("/api/campaigns/" + courseId(id)),
    getPaymentStatus: (paymentId) => request("/api/payments/" + encodeURIComponent(String(paymentId || "")) + "/status"),
    getMyCampaign: (id) => request("/api/campaigns/" + courseId(id) + "/mine"),
    createCampaignCheckout: (id, paymentMethod, walletPhone) => request("/api/payments/course/" + courseId(id) + "/campaign/create", {
      method: "POST",
      body: JSON.stringify({
        paymentMethod: paymentMethod === "wallet" ? "wallet" : "card",
        walletPhone: paymentMethod === "wallet" ? String(walletPhone || "").trim() : undefined,
      }),
    }),
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
    startChapterAssessment: (id, chapter, templateInput) => request("/api/courses/" + courseId(id) + "/chapters/" + encodeURIComponent(String(chapter)) + "/assessment/start", {
      method: "POST",
      body: JSON.stringify(typeof templateInput === "string"
        ? { templateText: templateInput }
        : { templateSubmission: templateInput || {} }),
    }),
    submitChapterAssessment: (id, chapter, assessmentId, answers) => request("/api/courses/" + courseId(id) + "/chapters/" + encodeURIComponent(String(chapter)) + "/assessment/" + encodeURIComponent(String(assessmentId)) + "/submit", { method: "POST", body: JSON.stringify({ answers: Array.isArray(answers) ? answers : [] }) }),
    submitProject: (id, projectId, text) => request("/api/courses/" + courseId(id) + "/projects/" + encodeURIComponent(projectId) + "/submit", {
      method: "POST",
      body: JSON.stringify({ text: String(text || "") }),
    }),
    getProjectStatus: (id, projectId) => request("/api/courses/" + courseId(id) + "/projects/" + encodeURIComponent(projectId) + "/status"),
    getCertificate: (id) => request("/api/courses/" + courseId(id) + "/certificate"),
    getCertificatePreview: (id) => request("/api/courses/" + courseId(id) + "/certificate/preview"),
    verifyCertificate: (code) => request("/api/certificates/verify/" + encodeURIComponent(String(code || ""))),
    createCheckout: (id, paymentMethod, walletPhone) => request("/api/payments/course/" + courseId(id) + "/create", {
      method: "POST",
      body: JSON.stringify({
        paymentMethod: paymentMethod === "wallet" ? "wallet" : "card",
        walletPhone: paymentMethod === "wallet" ? String(walletPhone || "").trim() : undefined,
      }),
    }),
    getReviews: (id) => request("/api/reviews/" + courseId(id), { skipAuth: true }),
    getMyReview: (id) => request("/api/reviews/" + courseId(id) + "/mine"),
    getReviewRequest: (id) => request("/api/reviews/" + courseId(id) + "/request"),
    requestReview: (id) => request("/api/reviews/" + courseId(id) + "/request", { method: "POST", body: "{}" }),
    createReview: (id, payload) => request("/api/reviews/" + courseId(id), {
      method: "POST",
      body: JSON.stringify(payload || {}),
    }),
    uploadReviewVideo: (reviewId, file) => request("/api/reviews/" + encodeURIComponent(String(reviewId || "")) + "/video", {
      method: "POST",
      headers: { "Content-Type": file.type },
      body: file,
    }),
    getAdminCampaign: (id) => request("/api/campaigns/admin/" + courseId(id)),
    updateAdminCampaign: (id, payload) => request("/api/campaigns/admin/" + courseId(id), { method: "PATCH", body: JSON.stringify(payload || {}) }),
    getAdminCampaignReviews: (id, status) => request("/api/campaigns/admin/" + courseId(id) + "/reviews" + (status ? "?status=" + encodeURIComponent(status) : "")),
    updateAdminCampaignReview: (reviewId, status) => request("/api/campaigns/admin/reviews/" + encodeURIComponent(String(reviewId || "")), { method: "PATCH", body: JSON.stringify({ status }) }),
    getAdminCountries: () => request("/api/countries/admin/configs"),
    createAdminCountry: (payload) => request("/api/countries/admin/configs", { method: "POST", body: JSON.stringify(payload || {}) }),
    updateAdminCountry: (code, payload) => request("/api/countries/admin/configs/" + encodeURIComponent(String(code || "")), { method: "PATCH", body: JSON.stringify(payload || {}) }),
    getAdminCountryPricing: (id) => request("/api/countries/admin/courses/" + courseId(id) + "/pricing"),
    updateAdminCountryPricing: (id, code, payload) => request("/api/countries/admin/courses/" + courseId(id) + "/pricing/" + encodeURIComponent(String(code || "")), { method: "PUT", body: JSON.stringify(payload || {}) }),
    getAdminCountryVariants: (id) => request("/api/countries/admin/courses/" + courseId(id) + "/variants"),
    saveAdminCountryVariant: (id, kind, code, key, payload) => request("/api/countries/admin/courses/" + courseId(id) + "/variants/" + encodeURIComponent(kind) + "/" + encodeURIComponent(code) + "/" + encodeURIComponent(key), { method: "PUT", body: JSON.stringify(payload || {}) }),
    getAdminAffiliates: () => request("/api/admin/affiliates"),
    getAdminEvents: (params) => request("/api/admin/events?" + new URLSearchParams(params || {}).toString()),
    getAdminEventsSummary: () => request("/api/admin/events/summary"),
    getAdminAffiliate: (id) => request("/api/admin/affiliates/" + encodeURIComponent(String(id || "")), { cache: "default" }),
    createAdminAffiliate: (payload) => request("/api/admin/affiliates", { method: "POST", body: JSON.stringify(payload || {}) }),
    updateAdminAffiliate: (id, payload) => request("/api/admin/affiliates/" + encodeURIComponent(String(id || "")), { method: "PATCH", body: JSON.stringify(payload || {}) }),
    countryCode,
  };

  global.LMSPlatformAPI = api;
})(window);
