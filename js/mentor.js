/* =========================================================
   KERO — المرشد الذكي
   Chat + Voice — Quadralevel visual identity
   ========================================================= */

(function (global) {
  // Resolve assets against the loaded script so the same widget works in the content gateway.
  let mentorCourseSlug = "";
  let mentorHostedByParent = false;
  const mentorAssetOrigin = new URL(document.currentScript ? document.currentScript.src : location.href).origin;


  /* =======================================================
     إعدادات Kero
     ======================================================= */



  function countryProfile() { return global.LMSCountry && global.LMSCountry.getProfile ? global.LMSCountry.getProfile() : {}; }
  function mentorGreeting(chapter, trial) {
    const profile = countryProfile();
    const market = profile.countryName ? " في سوق " + profile.countryName : "";
    if (trial) return (chapter ? "أهلاً! أنا Kero، وهساعدك تفهم الفصل ده" : "أهلاً! أنا Kero، اسألني في أي حاجة في الكورس") + market + ". دي معاينة مجانية (3 رسائل بس)، وبعدها هتحتاج تعمل حساب كامل عشان تكمل معايا من غير حدود.";
    return chapter ? "أهلاً! أنا Kero، مدربك في التسويق" + market + ". هساعدك تفهم الفصل ده أول بأول. قولّي أنهي جزء مش واضح ليك، أو ابدأ واسألني أي سؤال." : "أهلاً! أنا Kero، مدربك الذكي في التسويق" + market + ". اسألني في أي حاجة في الكورس، أو قولّي عايز تراجع أنهي فصل.";
  }

  const HISTORY_PREFIX =
    "lms_mentor_history_v1_";

  const MAX_HISTORY_MESSAGES = 16;


  /* =======================================================
     History
     ======================================================= */

  function _historyKey(chapter) {

    const uname =
      window.LMSAuth
        ? window.LMSAuth.currentUsername()
        : "guest";

    return (
      HISTORY_PREFIX +
      (uname || "guest") +
      "_" +
      (mentorCourseSlug ? mentorCourseSlug + "_" : "") +
      (chapter || "general")
    );
  }


  function _readHistory(chapter) {

    try {

      return (
        JSON.parse(
          localStorage.getItem(
            _historyKey(chapter)
          )
        ) || []
      );

    } catch (e) {

      return [];
    }
  }


  function _writeHistory(chapter, list) {

    localStorage.setItem(
      _historyKey(chapter),
      JSON.stringify(
        list.slice(-MAX_HISTORY_MESSAGES)
      )
    );
  }


  /* =======================================================
     CSS
     ======================================================= */

  function _injectStyle() {

    if (
      document.getElementById(
        "mentor-style"
      )
    ) {
      return;
    }


    const style =
      document.createElement("style");


    style.id = "mentor-style";


    style.textContent = `

      #mentor-fab {

        position: fixed;

        bottom: 22px;

        right: 22px;

        z-index: 4500;

        width: 62px;

        height: 62px;

        border-radius: 50%;

        padding: 0;

        overflow: visible;

        background:
          linear-gradient(
            135deg,
            #ffd700,
            #ff6f00
          );

        display: flex;

        align-items: center;

        justify-content: center;

        box-shadow:
          0 10px 30px
          rgba(255, 215, 0, .35);

        cursor: pointer;

        border:
          2px solid
          rgba(255, 215, 0, .7);

        transition:
          transform .25s;
      }


      #mentor-fab:hover {

        transform:
          scale(1.08);
      }


      #mentor-fab .kero-fab-img {

        width: 100%;

        height: 100%;

        object-fit: cover;

        border-radius: 50%;

        display: block;
      }


      #mentor-fab .mentor-dot {

        position: absolute;

        top: 2px;

        right: 2px;

        width: 12px;

        height: 12px;

        border-radius: 50%;

        background: #00c896;

        border:
          2px solid
          #0d1b2a;

        z-index: 5;
      }


      #mentor-panel {

        position: fixed;

        bottom: 92px;

        right: 22px;

        z-index: 4500;

        width:
          min(390px, 92vw);

        height:
          min(580px, 72vh);

        background: #0d1b2a;

        border:
          2px solid #ffd700;

        border-radius: 22px;

        display: none;

        flex-direction: column;

        overflow: hidden;

        box-shadow:
          0 25px 60px
          rgba(0, 0, 0, .45);

        font-family:
          'Tajawal',
          sans-serif;
      }


      #mentor-panel.open {

        display: flex;
      }


      #mentor-head {

        display: flex;

        align-items: center;

        gap: 10px;

        padding:
          14px 16px;

        background:
          rgba(255, 215, 0, .08);

        border-bottom:
          1px solid
          rgba(255, 215, 0, .25);

        color: #fff;
      }


      #mentor-head .mh-icon {

        width: 46px;

        height: 46px;

        border-radius: 50%;

        overflow: hidden;

        flex-shrink: 0;

        border:
          2px solid
          rgba(255, 215, 0, .7);
      }


      #mentor-head .mh-icon img {

        width: 100%;

        height: 100%;

        object-fit: cover;

        display: block;
      }


      #mentor-head .mh-title {

        font-weight: 800;

        font-size: .95rem;
      }


      #mentor-head .mh-sub {

        font-size: .72rem;

        color:
          rgba(255, 255, 255, .5);
      }


      #mentor-head .mh-close {

        margin-inline-start: auto;

        background: none;

        border: none;

        color:
          rgba(255, 255, 255, .6);

        font-size: 1.1rem;

        cursor: pointer;
      }


      #mentor-call-btn {

        width: 34px;

        height: 34px;

        border-radius: 50%;

        border: none;

        flex-shrink: 0;

        background:
          rgba(0, 200, 150, .15);

        color: #00c896;

        cursor: pointer;

        display: flex;

        align-items: center;

        justify-content: center;
      }


      #mentor-call-btn.active {

        background: #ff5252;

        color: #fff;

        animation:
          mentorPulse 1s infinite;
      }


      #mentor-call-status {

        display: none;

        align-items: center;

        justify-content: center;

        gap: 8px;

        padding:
          8px 16px;

        font-size: .78rem;

        color: #ffd700;

        background:
          rgba(255, 215, 0, .08);
      }


      #mentor-call-status.show {

        display: flex;
      }


      #mentor-call-status .dot {

        width: 8px;

        height: 8px;

        border-radius: 50%;

        background: #ffd700;

        animation:
          mentorPulse 1s infinite;
      }


      #mentor-stop-audio-btn {

        display: none;

        align-items: center;

        gap: 6px;

        margin-inline-start: 12px;

        background:
          rgba(255, 82, 82, .15);

        color: #ff5252;

        border:
          1px solid
          rgba(255, 82, 82, .4);

        border-radius: 14px;

        padding:
          3px 10px;

        font-size: .72rem;

        cursor: pointer;
      }


      #mentor-stop-audio-btn.show {

        display: flex;
      }


      #mentor-messages {

        flex: 1;

        overflow-y: auto;

        padding: 16px;

        display: flex;

        flex-direction: column;

        gap: 12px;
      }


      .mentor-msg {

        max-width: 85%;

        padding:
          11px 14px;

        border-radius: 14px;

        font-size: .86rem;

        line-height: 1.7;

        white-space: pre-wrap;
      }


      .mentor-msg.user {

        align-self: flex-start;

        background:
          rgba(255, 215, 0, .14);

        color: #fff;

        border-bottom-left-radius: 4px;
      }


      .mentor-assistant-row {

        display: flex;

        align-items: flex-end;

        gap: 7px;

        align-self: flex-end;

        max-width: 94%;
      }


      .mentor-avatar-small {

        width: 34px;

        height: 34px;

        border-radius: 50%;

        object-fit: cover;

        flex-shrink: 0;

        border:
          1px solid
          rgba(255, 215, 0, .55);
      }


      .mentor-assistant-content {

        max-width: 85%;
      }


      .mentor-msg.assistant {

        align-self: auto;

        background:
          rgba(255, 255, 255, .06);

        color: #fff;

        border-bottom-right-radius: 4px;

        display: flex;

        flex-direction: column;

        gap: 8px;
      }


      .mentor-speak {

        align-self: flex-start;

        background: none;

        border:
          1px solid
          rgba(255, 215, 0, .4);

        color: #ffd700;

        border-radius: 20px;

        padding:
          5px 11px;

        font-size: .7rem;

        cursor: pointer;

        transition:
          all .2s ease;
      }


      .mentor-speak:hover {

        background:
          rgba(255, 215, 0, .1);
      }


      .mentor-speak.playing {

        background:
          rgba(255, 215, 0, .12);
      }


      .mentor-speak:disabled {

        opacity: .65;

        cursor: not-allowed;
      }


      .mentor-typing {

        align-self: flex-end;

        color:
          rgba(255, 255, 255, .5);

        font-size: .8rem;
      }


      #mentor-input-row {

        display: flex;

        align-items: center;

        gap: 8px;

        padding: 12px;

        border-top:
          1px solid
          rgba(255, 215, 0, .2);
      }


      #mentor-input {

        flex: 1;

        background:
          rgba(255, 255, 255, .06);

        border:
          1px solid
          rgba(255, 255, 255, .12);

        border-radius: 20px;

        padding:
          10px 14px;

        color: #fff;

        font-size: .85rem;

        outline: none;

        font-family:
          'Tajawal',
          sans-serif;
      }


      .mentor-icon-btn {

        width: 38px;

        height: 38px;

        border-radius: 50%;

        border: none;

        flex-shrink: 0;

        display: flex;

        align-items: center;

        justify-content: center;

        cursor: pointer;
      }


      .mentor-icon-btn.mic {

        background:
          rgba(255, 255, 255, .08);

        color: #fff;
      }


      .mentor-icon-btn.mic.recording {

        background: #ff5252;

        color: #fff;

        animation:
          mentorPulse 1s infinite;
      }


      .mentor-icon-btn.send {

        background:
          linear-gradient(
            135deg,
            #ffd700,
            #ff6f00
          );

        color: #0d1b2a;
      }


      #mentor-locked {

        padding: 22px;

        text-align: center;

        color:
          rgba(255, 255, 255, .6);
      }


      @keyframes mentorPulse {

        0%,
        100% {
          opacity: 1;
        }

        50% {
          opacity: .6;
        }
      }


      @media (max-width: 480px) {

        #mentor-panel {

          right: 10px;

          bottom: 80px;
        }


        #mentor-fab {

          right: 14px;

          bottom: 14px;
        }
      }

    `;


    style.textContent += `
/* Kero shares the approved platform identity, including inside course iframes. */
#mentor-panel#mentor-panel,#mentor-fab#mentor-fab{
 --km-bg:#f5f8ff;--km-card:#fff;--km-soft:#eaf1ff;--km-line:#cddcf1;--km-text:#122e55;--km-muted:#4a6382;--km-blue:#195ce5;--km-user:#195ce5;--km-on-user:#fff;
 font-family:'Alexandria',sans-serif;direction:rtl;box-sizing:border-box;
}
:is(html[data-theme=dark],body.dark,body[data-theme=dark]) :is(#mentor-panel#mentor-panel,#mentor-fab#mentor-fab){
 --km-bg:#080f1c;--km-card:#13243b;--km-soft:#1b304b;--km-line:#2c425d;--km-text:#edf3fc;--km-muted:#becce0;--km-blue:#a5c7ff;--km-user:#285f9e;
}
#mentor-fab#mentor-fab{width:126px;height:58px;right:22px;bottom:max(22px,env(safe-area-inset-bottom));border-radius:18px;gap:10px;background:var(--km-user);border:1px solid #8bbaff;color:#fff;box-shadow:0 8px 24px #11387630;transition:transform .2s,box-shadow .2s}
#mentor-fab#mentor-fab .kero-symbol{width:32px;height:32px;border-radius:10px;background:#ffffff1a;color:#fff;font:500 24px 'Space Grotesk',sans-serif;display:grid;place-items:center}
#mentor-fab#mentor-fab .kero-fab-label{font:500 18px 'Space Grotesk',sans-serif}
#mentor-fab#mentor-fab .mentor-dot{width:9px;height:9px;right:12px;top:9px;border:2px solid var(--km-user);background:#86e5c2}
#mentor-fab#mentor-fab:hover{transform:translateY(-3px);box-shadow:0 12px 28px #11387640}
#mentor-panel#mentor-panel{right:22px;bottom:calc(max(22px,env(safe-area-inset-bottom)) + 72px);width:min(460px,calc(100vw - 32px));height:min(650px,calc(100dvh - 120px));max-height:calc(100dvh - 120px);background:var(--km-bg);color:var(--km-text);border:1px solid var(--km-line);border-radius:24px;box-shadow:0 22px 70px #07182e35;isolation:isolate}
#mentor-panel#mentor-panel *{box-sizing:border-box}
#mentor-panel#mentor-panel #mentor-head{background:var(--km-card);border-color:var(--km-line);color:var(--km-text);padding:18px;gap:12px;flex-shrink:0}
#mentor-panel#mentor-panel .mh-icon{border:1px solid var(--km-line);border-radius:15px;background:var(--km-soft);width:48px;height:48px;display:grid;place-items:center}
#mentor-panel#mentor-panel .mh-icon .kero-symbol{display:grid;place-items:center;color:var(--km-blue);background:transparent;width:100%;height:100%;font:500 29px 'Space Grotesk',sans-serif}
#mentor-panel#mentor-panel .mh-copy{flex:1;min-width:0}
#mentor-panel#mentor-panel .mh-title{font:500 25px/1.2 'Space Grotesk',sans-serif;color:var(--km-text);letter-spacing:-.6px}
#mentor-panel#mentor-panel .mh-sub{font-size:12px;line-height:1.8;color:var(--km-muted);margin-top:6px}
#mentor-panel#mentor-panel :is(.mh-close,#mentor-call-btn,.mentor-icon-btn){border:1px solid var(--km-line);border-radius:12px;width:44px;height:44px;min-width:44px;min-height:44px;display:grid;place-items:center;background:var(--km-soft);color:var(--km-blue);flex-shrink:0;cursor:pointer;margin:0;font-size:17px}
#mentor-panel#mentor-panel :is(button,input){font-family:inherit}
#mentor-panel#mentor-panel :is(button,input):focus-visible,#mentor-fab#mentor-fab:focus-visible{outline:3px solid var(--km-blue);outline-offset:3px}
#mentor-panel#mentor-panel :is(button):disabled{opacity:.55;cursor:not-allowed}
#mentor-panel#mentor-panel #mentor-messages{padding:20px 16px;gap:18px;min-height:0;overscroll-behavior:contain;scrollbar-width:thin;scrollbar-color:var(--km-line) transparent}
#mentor-panel#mentor-panel .mentor-msg{font:400 16px/2 'Alexandria',sans-serif;overflow-wrap:anywhere;word-break:normal;max-width:100%;padding:14px 16px;border-radius:17px;letter-spacing:0;text-align:start}
#mentor-panel#mentor-panel .mentor-msg.user{align-self:flex-start;max-width:88%;background:var(--km-user);color:var(--km-on-user);border:1px solid transparent;border-start-start-radius:5px}
#mentor-panel#mentor-panel .mentor-assistant-row{align-self:flex-end;align-items:flex-start;gap:9px;max-width:100%;min-width:0;width:100%}
#mentor-panel#mentor-panel .mentor-avatar-small{display:grid;place-items:center;width:30px;height:34px;border:1px solid var(--km-line);border-radius:10px;background:var(--km-soft);color:var(--km-blue);font:500 19px 'Space Grotesk',sans-serif;flex-shrink:0}
#mentor-panel#mentor-panel .mentor-assistant-content{max-width:calc(100% - 39px);min-width:0}
#mentor-panel#mentor-panel .mentor-msg.assistant{background:var(--km-card);color:var(--km-text);border:1px solid var(--km-line);border-start-end-radius:5px;box-shadow:0 4px 12px #07182e05}
#mentor-panel#mentor-panel .mentor-speak{font-size:12px;line-height:1.7;padding:7px 11px;min-height:36px;border:1px solid var(--km-line);border-radius:10px;background:var(--km-soft);color:var(--km-blue);white-space:normal}
#mentor-panel#mentor-panel .mentor-speak:is(:hover,.playing){background:var(--km-card);border-color:var(--km-blue)}
#mentor-panel#mentor-panel .mentor-typing{font-size:13px;color:var(--km-muted);line-height:1.8}
#mentor-panel#mentor-panel #mentor-input-row{padding:14px 12px;gap:8px;background:var(--km-card);border-color:var(--km-line);flex-shrink:0}
#mentor-panel#mentor-panel #mentor-input{width:0;min-width:0;flex:1;font:400 16px/1.8 'Alexandria',sans-serif;border:1px solid var(--km-line);border-radius:13px;padding:11px 12px;color:var(--km-text);background:var(--km-bg);height:50px}
#mentor-panel#mentor-panel #mentor-input::placeholder{color:var(--km-muted);opacity:1}
#mentor-panel#mentor-panel #mentor-send-btn{background:var(--km-user);color:#fff;border-color:var(--km-user)}
#mentor-panel#mentor-panel :is(#mentor-call-btn.active,.mentor-icon-btn.mic.recording){background:#ab2942;border-color:#ab2942;color:#fff}
#mentor-panel#mentor-panel #mentor-call-status{background:var(--km-soft);color:var(--km-text);font-size:13px;line-height:1.8;flex-shrink:0;flex-wrap:wrap}
#mentor-panel#mentor-panel #mentor-call-status .dot{background:var(--km-blue)}
#mentor-panel#mentor-panel #mentor-stop-audio-btn{background:var(--km-card);border:1px solid var(--km-line);color:var(--km-blue);font-size:12px;min-height:36px;padding:6px 10px;border-radius:10px}
#mentor-panel#mentor-panel #mentor-locked{color:var(--km-muted);font-size:16px;line-height:2}
#mentor-panel#mentor-panel #mentor-locked i{color:var(--km-blue)!important}
@media(max-width:560px){
 #mentor-panel#mentor-panel{right:10px;width:calc(100vw - 20px);bottom:calc(max(12px,env(safe-area-inset-bottom)) + 68px);height:min(660px,calc(100dvh - 100px));max-height:calc(100dvh - 100px);border-radius:20px}
 #mentor-fab#mentor-fab{right:14px;bottom:max(12px,env(safe-area-inset-bottom));height:54px;width:116px}
 #mentor-panel#mentor-panel #mentor-head{padding:14px 12px;gap:8px}
 #mentor-panel#mentor-panel .mh-icon{width:40px;height:44px}
 #mentor-panel#mentor-panel .mh-sub{font-size:11px}
 #mentor-panel#mentor-panel .mentor-msg{padding:12px;font-size:15px;line-height:2}
 #mentor-panel#mentor-panel #mentor-messages{padding:16px 12px}
}
@media(prefers-reduced-motion:reduce){#mentor-fab#mentor-fab,#mentor-panel#mentor-panel,#mentor-panel#mentor-panel *{animation:none;transition:none;scroll-behavior:auto}}
`;
    if (!document.querySelector('link[data-kero-fonts],link[href*="academy-v3-fonts.css"]')) {
      const fonts = document.createElement("link");
      fonts.rel = "stylesheet";
      fonts.href = mentorAssetOrigin + "/css/academy-v3-fonts.css";
      fonts.dataset.keroFonts = "true";
      document.head.appendChild(fonts);
    }
    document.head.appendChild(style);
  }


  /* =======================================================
     Panel
     ======================================================= */

  function _buildPanel(chapter) {

    const panel =
      document.createElement("div");


    panel.id = "mentor-panel";
    panel.dir = "rtl";
    panel.setAttribute("role", "region");
    panel.setAttribute("aria-label", "Kero — مساعدك التعليمي");


    panel.innerHTML = `

      <div id="mentor-head">

        <div class="mh-icon">

          <span class="kero-symbol" aria-hidden="true">K</span>

        </div>


        <div class="mh-copy">

          <div class="mh-title">
            Kero
          </div>

          <div class="mh-sub">

            ${
              chapter
                ? "مساعدك لفهم الفصل، خطوة بخطوة"
                : "مدربك الذكي في التسويق"
            }

          </div>

        </div>


        <button
          id="mentor-call-btn"
          title="محادثة صوتية مستمرة"
          aria-label="محادثة صوتية مستمرة"
        >

          <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 2 .7 2.9a2 2 0 0 1-.5 2.1L8 10a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.5c.9.3 1.9.6 2.9.7a2 2 0 0 1 1.7 2z"/></svg>

        </button>


        <button
          id="mentor-close-btn"
          class="mh-close"
          title="إغلاق"
          aria-label="إغلاق المحادثة"
        >

          <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="m6 6 12 12M6 18 18 6"/></svg>

        </button>

      </div>


      <div id="mentor-call-status">

        <span class="dot"></span>

        <span id="mentor-call-status-text">
          جاري الاستماع...
        </span>


        <button
          id="mentor-stop-audio-btn"
        >

          <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="6" y="6" width="12" height="12" rx="2"/></svg>

          إيقاف الصوت

        </button>

      </div>


      <div id="mentor-messages" role="log" aria-label="المحادثة مع Kero" aria-live="polite" aria-relevant="additions text"></div>


      <div id="mentor-input-row">

        <button
          class="mentor-icon-btn mic"
          id="mentor-mic-btn"
          title="تحدث"
          aria-label="تحدث بالميكروفون"
        >

          <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="2" width="6" height="12" rx="3"/><path d="M5 10v2a7 7 0 0 0 14 0v-2M12 19v3M8 22h8"/></svg>

        </button>


        <input
          id="mentor-input"
          type="text"
          placeholder="اسأل عن الجزء غير الواضح..."
          aria-label="سؤالك إلى Kero"
        >


        <button
          class="mentor-icon-btn send"
          id="mentor-send-btn"
          aria-label="إرسال السؤال"
        >

          <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="m22 2-7 20-4-9-9-4Z M22 2 11 13"/></svg>

        </button>

      </div>
    `;


    document.body.appendChild(panel);


    return panel;
  }


  /* =======================================================
     Render Message
     ======================================================= */

  function _renderMessage(
    container,
    role,
    text,
    showSpeak
  ) {

    if (role === "assistant") {

      const row =
        document.createElement("div");


      row.className =
        "mentor-assistant-row";


      const avatar =
        document.createElement("span");


      avatar.className =
        "mentor-avatar-small";


      avatar.textContent = "K";


      avatar.alt =
        "Kero";


      const content =
        document.createElement("div");


      content.className =
        "mentor-assistant-content";


      const div =
        document.createElement("div");


      div.className =
        "mentor-msg assistant";


      const p =
        document.createElement("div");


      p.textContent = text;


      div.appendChild(p);


      if (showSpeak) {

        const speakBtn =
          document.createElement("button");


        speakBtn.className =
          "mentor-speak";


        speakBtn.type = "button";


        speakBtn.innerHTML =
          '<svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="m11 5-6 4H2v6h3l6 4zM15 8a5 5 0 0 1 0 8M18 4a10 10 0 0 1 0 16"/></svg> استماع';


        speakBtn.onclick =
          function () {

            toggleMessageAudio(
              text,
              speakBtn
            );
          };


        div.appendChild(
          speakBtn
        );
      }


      content.appendChild(div);

      row.appendChild(avatar);

      row.appendChild(content);

      container.appendChild(row);


      container.scrollTop =
        container.scrollHeight;


      return row;
    }


    const div =
      document.createElement("div");


    div.className =
      "mentor-msg user";


    div.textContent = text;


    container.appendChild(div);


    container.scrollTop =
      container.scrollHeight;


    return div;
  }


  /* =======================================================
     Audio System
     ======================================================= */

  let _currentAudio = null;

  let _currentAudioUrl = null;

  let _currentSpeakButton = null;

  let _audioRequestId = 0;


  function resetSpeakButton(button) {

    if (!button) return;


    button.disabled = false;

    button.classList.remove(
      "playing"
    );


    button.innerHTML =
      '<svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="m11 5-6 4H2v6h3l6 4zM15 8a5 5 0 0 1 0 8M18 4a10 10 0 0 1 0 16"/></svg> استماع';
  }


  function setSpeakButtonLoading(button) {

    if (!button) return;


    button.disabled = true;

    button.classList.remove(
      "playing"
    );


    button.innerHTML =
      '<svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M20 12a8 8 0 1 1-8-8"/></svg> جاري التحميل';
  }


  function setSpeakButtonPlaying(button) {

    if (!button) return;


    button.disabled = false;

    button.classList.add(
      "playing"
    );


    button.innerHTML =
      '<svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M8 5v14M16 5v14"/></svg> إيقاف مؤقت';
  }


  function setSpeakButtonPaused(button) {

    if (!button) return;


    button.disabled = false;

    button.classList.remove(
      "playing"
    );


    button.innerHTML =
      '<svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="m8 5 11 7-11 7z"/></svg> استكمال';
  }


  function cleanupCurrentAudio() {

    if (_currentAudio) {

      try {

        _currentAudio.pause();

        _currentAudio.currentTime = 0;

      } catch (e) {}


      _currentAudio.onended = null;

      _currentAudio.onerror = null;

      _currentAudio.onpause = null;

      _currentAudio.onplay = null;

      _currentAudio = null;
    }


    if (_currentAudioUrl) {

      try {

        URL.revokeObjectURL(
          _currentAudioUrl
        );

      } catch (e) {}


      _currentAudioUrl = null;
    }


    resetSpeakButton(
      _currentSpeakButton
    );


    _currentSpeakButton = null;
  }


  function stopSpeaking() {

    _audioRequestId++;

    cleanupCurrentAudio();


    if (
      "speechSynthesis" in window
    ) {

      try {

        window.speechSynthesis.cancel();

      } catch (e) {}
    }
  }


  /* =======================================================
     Browser Male Arabic Voice
     ======================================================= */

  function getMaleArabicBrowserVoice() {

    if (
      !("speechSynthesis" in window)
    ) {

      return null;
    }


    const voices =
      window.speechSynthesis
        .getVoices() || [];


    const arabic =
      voices.filter(
        (voice) =>
          /^ar([-_]|$)/i.test(
            voice.lang || ""
          )
      );


    const maleHints =
      /male|man|hamza|hamed|omar|maged|tarik|naayf|fahd|saad|abdul|مذكر|ذكر/i;


    return (
      arabic.find(
        (voice) =>
          maleHints.test(
            voice.name || ""
          )
      ) ||
      arabic[0] ||
      null
    );
  }


  /* =======================================================
     Message Audio
     ======================================================= */

  async function toggleMessageAudio(
    text,
    button
  ) {

    if (
      !text ||
      !text.trim()
    ) {

      return;
    }


    /*
      لو نفس الرسالة شغالة:
      Pause / Resume
    */

    if (
      _currentAudio &&
      _currentSpeakButton === button
    ) {

      if (!_currentAudio.paused) {

        _currentAudio.pause();

        setSpeakButtonPaused(
          button
        );

        return;
      }


      try {

        await _currentAudio.play();

        setSpeakButtonPlaying(
          button
        );

      } catch (e) {

        resetSpeakButton(button);
      }


      return;
    }


    /*
      تشغيل رسالة جديدة:
      إيقاف الصوت القديم
    */

    stopSpeaking();


    const requestId =
      ++_audioRequestId;


    _currentSpeakButton =
      button;


    setSpeakButtonLoading(button);


    try {

      const token =
        localStorage.getItem(
          "lms_token_v1"
        );


      const res =
        await fetch(
          API_BASE_URL +
            "/api/mentor/speak",
          {

            method: "POST",

            headers: {

              "Content-Type":
                "application/json",

              Authorization:
                "Bearer " + token
            },

            body:
              JSON.stringify({
                text
              })
          }
        );


      if (
        requestId !==
        _audioRequestId
      ) {

        return;
      }


      if (!res.ok) {

        const error =
          await res
            .json()
            .catch(
              () => ({})
            );


        throw new Error(
          error.error ||
            "TTS failed"
        );
      }


      const blob =
        await res.blob();


      if (
        requestId !==
        _audioRequestId
      ) {

        return;
      }


      const url =
        URL.createObjectURL(
          blob
        );


      const audio =
        new Audio(url);


      _currentAudio = audio;

      _currentAudioUrl = url;


      audio.onplay =
        function () {

          if (
            requestId ===
            _audioRequestId
          ) {

            setSpeakButtonPlaying(
              button
            );
          }
        };


      audio.onpause =
        function () {

          if (
            requestId ===
              _audioRequestId &&
            !audio.ended
          ) {

            setSpeakButtonPaused(
              button
            );
          }
        };


      audio.onended =
        function () {

          if (
            requestId !==
            _audioRequestId
          ) {

            return;
          }


          resetSpeakButton(
            button
          );


          if (
            _currentAudio === audio
          ) {

            _currentAudio = null;

            _currentSpeakButton = null;


            try {

              URL.revokeObjectURL(url);

            } catch (e) {}


            _currentAudioUrl = null;
          }
        };


      audio.onerror =
        function () {

          if (
            requestId !==
            _audioRequestId
          ) {

            return;
          }


          resetSpeakButton(
            button
          );


          if (
            _currentAudio === audio
          ) {

            _currentAudio = null;

            _currentSpeakButton = null;


            try {

              URL.revokeObjectURL(url);

            } catch (e) {}


            _currentAudioUrl = null;
          }
        };


      await audio.play();


    } catch (error) {

      if (
        requestId !==
        _audioRequestId
      ) {

        return;
      }


      console.warn(
        "Kero TTS error:",
        error
      );


      resetSpeakButton(button);


      /*
        Browser fallback
      */

      if (
        "speechSynthesis" in window
      ) {

        try {

          window.speechSynthesis.cancel();

        } catch (e) {}


        const utter =
          new SpeechSynthesisUtterance(
            text
          );


        utter.lang = "ar-SA";


        const voice =
          getMaleArabicBrowserVoice();


        if (voice) {

          utter.voice = voice;
        }


        utter.onend =
          function () {

            resetSpeakButton(
              button
            );


            if (
              _currentSpeakButton ===
              button
            ) {

              _currentSpeakButton =
                null;
            }
          };


        utter.onerror =
          function () {

            resetSpeakButton(
              button
            );


            if (
              _currentSpeakButton ===
              button
            ) {

              _currentSpeakButton =
                null;
            }
          };


        _currentSpeakButton =
          button;


        setSpeakButtonPlaying(
          button
        );


        window.speechSynthesis.speak(
          utter
        );
      }
    }
  }


  /* =======================================================
     Continuous Voice
     ======================================================= */

  async function speak(
    text,
    onEnd
  ) {

    if (
      !text ||
      !text.trim()
    ) {

      if (onEnd) onEnd();

      return;
    }


    stopSpeaking();


    const requestId =
      ++_audioRequestId;


    try {

      const token =
        localStorage.getItem(
          "lms_token_v1"
        );


      const res =
        await fetch(
          API_BASE_URL +
            "/api/mentor/speak",
          {

            method: "POST",

            headers: {

              "Content-Type":
                "application/json",

              Authorization:
                "Bearer " + token
            },

            body:
              JSON.stringify({
                text
              })
          }
        );


      if (
        requestId !==
        _audioRequestId
      ) {

        return;
      }


      if (!res.ok) {

        throw new Error(
          "TTS failed"
        );
      }


      const blob =
        await res.blob();


      if (
        requestId !==
        _audioRequestId
      ) {

        return;
      }


      const url =
        URL.createObjectURL(
          blob
        );


      const audio =
        new Audio(url);


      _currentAudio = audio;

      _currentAudioUrl = url;


      audio.onended =
        function () {

          try {

            URL.revokeObjectURL(url);

          } catch (e) {}


          if (
            _currentAudio === audio
          ) {

            _currentAudio = null;

            _currentAudioUrl = null;

            _currentSpeakButton = null;
          }


          if (onEnd) {

            onEnd();
          }
        };


      audio.onerror =
        function () {

          try {

            URL.revokeObjectURL(url);

          } catch (e) {}


          if (
            _currentAudio === audio
          ) {

            _currentAudio = null;

            _currentAudioUrl = null;

            _currentSpeakButton = null;
          }


          if (onEnd) {

            onEnd();
          }
        };


      await audio.play();


    } catch (error) {

      if (
        requestId !==
        _audioRequestId
      ) {

        return;
      }


      if (
        "speechSynthesis" in window
      ) {

        try {

          window.speechSynthesis.cancel();

        } catch (e) {}


        const utter =
          new SpeechSynthesisUtterance(
            text
          );


        utter.lang = "ar-SA";


        const voice =
          getMaleArabicBrowserVoice();


        if (voice) {

          utter.voice = voice;
        }


        if (onEnd) {

          utter.onend = onEnd;

          utter.onerror = onEnd;
        }


        window.speechSynthesis.speak(
          utter
        );

      } else if (onEnd) {

        onEnd();
      }
    }
  }


  /* =======================================================
     Send Message
     ======================================================= */

  async function sendMessage(
    chapter,
    text,
    messagesEl,
    mode
  ) {

    if (!text.trim()) {

      return null;
    }


    mode =
      mode || "full";


    const showSpeak =
      mode === "full";


    const history =
      _readHistory(chapter);


    history.push({

      role: "user",

      content: text
    });


    _writeHistory(
      chapter,
      history
    );


    _renderMessage(
      messagesEl,
      "user",
      text,
      false
    );


    const typing =
      document.createElement("div");


    typing.className =
      "mentor-typing";


    typing.textContent =
      "Kero بيكتب..." + (countryProfile().countryName ? " — " + countryProfile().countryName : "");


    messagesEl.appendChild(typing);


    messagesEl.scrollTop =
      messagesEl.scrollHeight;


    try {

      let res;


      if (mode === "trial") {

        const sessionId =
          window.LMSTrial
            ? window.LMSTrial.getSessionId()
            : null;


        res =
          await fetch(
            API_BASE_URL +
              "/api/mentor/trial-chat",
            {

              method: "POST",

              headers: {

                "Content-Type":
                  "application/json",

                "X-Trial-Session":
                  sessionId || ""
              },

              body:
                JSON.stringify({
                  chapter,
                  ...(mentorCourseSlug ? { courseSlug: mentorCourseSlug } : {}),
                  messages: history,
                  countryCode: global.LMSCountry && global.LMSCountry.getCode ? global.LMSCountry.getCode() : "EG"
                })
            }
          );

      } else {

        const token =
          localStorage.getItem(
            "lms_token_v1"
          );


        res =
          await fetch(
            API_BASE_URL +
              "/api/mentor/chat",
            {

              method: "POST",

              headers: {

                "Content-Type":
                  "application/json",

                Authorization:
                  "Bearer " + token
              },

              body:
                JSON.stringify({
                  chapter,
                  ...(mentorCourseSlug ? { courseSlug: mentorCourseSlug } : {}),
                  messages: history,
                  countryCode: global.LMSCountry && global.LMSCountry.getCode ? global.LMSCountry.getCode() : "EG"
                })
            }
          );
      }


      const data =
        await res.json();


      typing.remove();


      if (!data.ok) {

        if (
          data.limitReached
        ) {

          _renderMessage(
            messagesEl,
            "assistant",
            "🔒 " + data.error,
            false
          );


          return {
            limitReached: true
          };
        }


        _renderMessage(
          messagesEl,
          "assistant",
          "⚠️ " +
            (
              data.error ||
              "حصل خطأ، حاول تاني."
            ),
          false
        );


        return null;
      }


      history.push({

        role: "assistant",

        content: data.reply
      });


      _writeHistory(
        chapter,
        history
      );


      _renderMessage(
        messagesEl,
        "assistant",
        data.reply,
        showSpeak
      );


      return {

        reply: data.reply,

        remaining:
          data.remaining
      };


    } catch (e) {

      typing.remove();


      _renderMessage(
        messagesEl,
        "assistant",
        "⚠️ تعذّر الاتصال بالمرشد الذكي، تأكد من اتصالك بالإنترنت.",
        false
      );


      return null;
    }
  }


  /* =======================================================
     Microphone
     ======================================================= */

  function setupVoiceInput(
    inputEl,
    micBtn
  ) {

    const SpeechRecognition =
      window.SpeechRecognition ||
      window.webkitSpeechRecognition;


    if (!SpeechRecognition) {

      micBtn.style.display =
        "none";

      return;
    }


    const recognizer =
      new SpeechRecognition();


    recognizer.lang =
      "ar-SA";


    recognizer.interimResults =
      false;


    recognizer.maxAlternatives =
      1;


    let listening = false;


    micBtn.addEventListener(
      "click",
      function () {

        if (listening) {

          recognizer.stop();

          return;
        }


        try {

          recognizer.start();

        } catch (e) {}
      }
    );


    recognizer.onstart =
      function () {

        listening = true;

        micBtn.classList.add(
          "recording"
        );
      };


    recognizer.onend =
      function () {

        listening = false;

        micBtn.classList.remove(
          "recording"
        );
      };


    recognizer.onerror =
      function () {

        listening = false;

        micBtn.classList.remove(
          "recording"
        );
      };


    recognizer.onresult =
      function (e) {

        const transcript =
          e.results[0][0]
            .transcript;


        inputEl.value =
          transcript;
      };
  }


  /* =======================================================
     Continuous Voice Conversation
     ======================================================= */

  function setupVoiceConversation(
    panel,
    chapter,
    messagesEl,
    callBtn
  ) {

    const SpeechRecognition =
      window.SpeechRecognition ||
      window.webkitSpeechRecognition;


    if (!SpeechRecognition) {

      callBtn.style.display =
        "none";

      return;
    }


    const statusEl =
      panel.querySelector(
        "#mentor-call-status"
      );


    const statusText =
      panel.querySelector(
        "#mentor-call-status-text"
      );


    const stopBtn =
      panel.querySelector(
        "#mentor-stop-audio-btn"
      );


    const recognizer =
      new SpeechRecognition();


    recognizer.lang =
      "ar-SA";


    recognizer.interimResults =
      false;


    recognizer.maxAlternatives =
      1;


    let active = false;

    let turnInProgress = false;


    function setStatus(text) {

      statusText.textContent =
        text;
    }


    function listenTurn() {

      if (
        !active ||
        turnInProgress
      ) {

        return;
      }


      setStatus(
        "جاري الاستماع..."
      );


      try {

        recognizer.start();

      } catch (e) {}
    }


    recognizer.onresult =
      async function (e) {

        if (
          !active ||
          turnInProgress
        ) {

          return;
        }


        const transcript =
          e.results[0][0]
            .transcript;


        if (
          !transcript ||
          !transcript.trim()
        ) {

          listenTurn();

          return;
        }


        turnInProgress =
          true;


        stopBtn.classList.add(
          "show"
        );


        setStatus(
          "Kero بيفكر..."
        );


        const result =
          await sendMessage(
            chapter,
            transcript,
            messagesEl,
            "full"
          );


        if (!active) {

          turnInProgress =
            false;

          return;
        }


        if (
          !result ||
          !result.reply
        ) {

          turnInProgress =
            false;

          listenTurn();

          return;
        }


        setStatus(
          "Kero بيتكلم..."
        );


        speak(
          result.reply,
          function () {

            turnInProgress =
              false;


            stopBtn.classList.remove(
              "show"
            );


            if (active) {

              listenTurn();
            }
          }
        );
      };


    recognizer.onerror =
      function (e) {

        if (
          !active ||
          turnInProgress
        ) {

          return;
        }


        if (
          e.error === "no-speech" ||
          e.error === "aborted"
        ) {

          listenTurn();

          return;
        }


        setStatus(
          "حصل خطأ في المايك، حاول تاني."
        );
      };


    recognizer.onend =
      function () {

        if (
          active &&
          !turnInProgress
        ) {

          setTimeout(
            listenTurn,
            300
          );
        }
      };


    stopBtn.addEventListener(
      "click",
      function () {

        stopSpeaking();


        turnInProgress =
          false;


        stopBtn.classList.remove(
          "show"
        );


        if (active) {

          listenTurn();
        }
      }
    );


    callBtn.addEventListener(
      "click",
      function () {

        active = !active;


        callBtn.classList.toggle(
          "active",
          active
        );


        if (active) {

          statusEl.classList.add(
            "show"
          );


          callBtn.innerHTML =
            '<svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="m3 3 18 18M7 3H4a2 2 0 0 0-2 2c1 9 8 16 17 17a2 2 0 0 0 2-2v-3l-6-2-2 2M7 3l2 5-1 1"/></svg>';


          listenTurn();

        } else {

          statusEl.classList.remove(
            "show"
          );


          stopBtn.classList.remove(
            "show"
          );


          callBtn.innerHTML =
            '<svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 2 .7 2.9a2 2 0 0 1-.5 2.1L8 10a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.5c.9.3 1.9.6 2.9.7a2 2 0 0 1 1.7 2z"/></svg>';


          turnInProgress =
            false;


          try {

            recognizer.stop();

          } catch (e) {}


          stopSpeaking();
        }
      }
    );
  }


  /* =======================================================
     Mount Kero
     ======================================================= */

  function mount(chapter, context) {
    if (mentorHostedByParent) return;
    if (context && typeof context.courseSlug === "string") mentorCourseSlug = context.courseSlug;


    if (document.getElementById("mentor-fab")) return;

    const fullAccount =
      window.LMSAuth &&
      window.LMSAuth.isLoggedIn();


    const trialAccount =
      !fullAccount &&
      window.LMSTrial &&
      window.LMSTrial.isTrialActive();


    if (
      !fullAccount &&
      !trialAccount
    ) {

      return;
    }


    _injectStyle();


    const fab =
      document.createElement("button");


    fab.id = "mentor-fab";
    fab.setAttribute("aria-label", "افتح Kero المساعد التعليمي");
    fab.setAttribute("aria-controls", "mentor-panel");
    fab.setAttribute("aria-expanded", "false");


    fab.innerHTML = `

      <span class="kero-symbol" aria-hidden="true">K</span>

      <span class="kero-fab-label" lang="en">Kero</span>
      <span
        class="mentor-dot"
      ></span>

    `;


    document.body.appendChild(fab);


    let panel = null;
    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && panel && panel.classList.contains("open")) {
        stopSpeaking();
        panel.classList.remove("open");
        fab.setAttribute("aria-expanded", "false");
        fab.focus();
      }
    });


    fab.addEventListener(
      "click",
      function () {

        if (!panel) {

          panel =
            _buildPanel(chapter);


          const messagesEl =
            panel.querySelector(
              "#mentor-messages"
            );


          const input =
            panel.querySelector(
              "#mentor-input"
            );


          const sendBtn =
            panel.querySelector(
              "#mentor-send-btn"
            );


          const micBtn =
            panel.querySelector(
              "#mentor-mic-btn"
            );


          const closeBtn =
            panel.querySelector(
              "#mentor-close-btn"
            );


          const callBtn =
            panel.querySelector(
              "#mentor-call-btn"
            );


          const isRemote =
            window.LMSAuth &&
            typeof window.LMSAuth.isRemote ===
              "function"
              ? window.LMSAuth.isRemote()
              : true;


          if (!isRemote) {

            messagesEl.innerHTML = `

              <div id="mentor-locked">

                <i
                  class="fas fa-plug-circle-xmark"
                  style="
                    font-size:1.6rem;
                    color:#ffd700;
                    margin-bottom:10px;
                    display:block;
                  "
                ></i>

                المرشد الذكي محتاج السيرفر الحقيقي شغال ومربوط.

              </div>

            `;


            panel.querySelector(
              "#mentor-input-row"
            ).style.display =
              "none";


            callBtn.style.display =
              "none";
          }


          else if (trialAccount) {

            callBtn.style.display =
              "none";


            micBtn.style.display =
              "none";


            let trialDone = false;


            _renderMessage(
              messagesEl,
              "assistant",

              mentorGreeting(chapter, true),

              false
            );


            function handleTrialSend() {

              if (trialDone) {

                return;
              }


              const text =
                input.value;


              if (!text.trim()) {

                return;
              }


              input.value = "";


              sendBtn.disabled = true;


              sendMessage(
                chapter,
                text,
                messagesEl,
                "trial"
              ).then(
                function (result) {

                  sendBtn.disabled =
                    false;


                  if (
                    result &&
                    result.limitReached
                  ) {

                    trialDone = true;


                    input.disabled = true;


                    input.placeholder =
                      "خلصت رسائلك المجانية";


                    sendBtn.style.display =
                      "none";
                  }
                }
              );
            }


            sendBtn.addEventListener(
              "click",
              handleTrialSend
            );


            input.addEventListener(
              "keydown",
              function (e) {

                if (
                  e.key === "Enter"
                ) {

                  handleTrialSend();
                }
              }
            );
          }


          else {

            const history =
              _readHistory(chapter);


            if (
              history.length === 0
            ) {

              _renderMessage(
                messagesEl,
                "assistant",

                mentorGreeting(chapter, false),

                true
              );

            } else {

              history.forEach(
                function (m) {

                  _renderMessage(
                    messagesEl,
                    m.role,
                    m.content,
                    m.role === "assistant"
                  );

                }
              );
            }


            setupVoiceInput(
              input,
              micBtn
            );


            setupVoiceConversation(
              panel,
              chapter,
              messagesEl,
              callBtn
            );


            sendBtn.addEventListener(
              "click",
              function () {

                const text =
                  input.value;


                input.value = "";


                sendMessage(
                  chapter,
                  text,
                  messagesEl,
                  "full"
                );
              }
            );


            input.addEventListener(
              "keydown",
              function (e) {

                if (
                  e.key === "Enter"
                ) {

                  const text =
                    input.value;


                  input.value = "";


                  sendMessage(
                    chapter,
                    text,
                    messagesEl,
                    "full"
                  );
                }
              }
            );
          }


          closeBtn.addEventListener(
            "click",
            function () {

              stopSpeaking();

              panel.classList.remove("open");
              fab.setAttribute("aria-expanded", "false");
              fab.focus();
            }
          );
        }


        panel.classList.toggle("open");
        fab.setAttribute("aria-expanded", String(panel.classList.contains("open")));
        if (panel.classList.contains("open")) {
          const input = panel.querySelector("#mentor-input");
          if (input && !input.disabled && input.getClientRects().length) input.focus();
          else panel.querySelector("#mentor-close-btn").focus();
        }


        if (
          !panel.classList.contains(
            "open"
          )
        ) {

          stopSpeaking();
        }
      }
    );
  }


  /* =======================================================
     Public API
     ======================================================= */

  // Hide only this iframe's duplicate controls when the trusted platform shell owns Kero.
  global.addEventListener("message", function (event) {
    if (global.parent === global || event.source !== global.parent || event.origin !== mentorAssetOrigin || !event.data || event.data.type !== "ql-mentor-host-active") return;
    mentorHostedByParent = true;
    stopSpeaking();
    ["mentor-fab", "mentor-panel"].forEach(function (id) {
      const element = document.getElementById(id);
      if (element) element.style.display = "none";
    });
  });

  global.LMSMentor = {

    mount,

    speak,

    stopSpeaking,

    toggleMessageAudio

  };


})(window);
