/* =========================================================
   KERO — المرشد الذكي
   Chat + Voice + Kero Image
   ========================================================= */

(function (global) {

  /* =======================================================
     إعدادات Kero
     ======================================================= */

  const KERO_IMAGE_URL = "/images/kero.png";

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


    document.head.appendChild(style);
  }


  /* =======================================================
     Panel
     ======================================================= */

  function _buildPanel(chapter) {

    const panel =
      document.createElement("div");


    panel.id = "mentor-panel";


    panel.innerHTML = `

      <div id="mentor-head">

        <div class="mh-icon">

          <img
            src="${KERO_IMAGE_URL}"
            alt="Kero"
          >

        </div>


        <div>

          <div class="mh-title">
            Kero
          </div>

          <div class="mh-sub">

            ${
              chapter
                ? "مدربك في التسويق — بيشرحلك الفصل ده خطوة بخطوة"
                : "مدربك الذكي في التسويق"
            }

          </div>

        </div>


        <button
          id="mentor-call-btn"
          title="محادثة صوتية مستمرة"
        >

          <i class="fas fa-phone"></i>

        </button>


        <button
          id="mentor-close-btn"
          class="mh-close"
          title="إغلاق"
        >

          <i class="fas fa-xmark"></i>

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

          <i class="fas fa-stop"></i>

          إيقاف الصوت

        </button>

      </div>


      <div id="mentor-messages"></div>


      <div id="mentor-input-row">

        <button
          class="mentor-icon-btn mic"
          id="mentor-mic-btn"
          title="تحدث"
        >

          <i class="fas fa-microphone"></i>

        </button>


        <input
          id="mentor-input"
          type="text"
          placeholder="اكتب سؤالك هنا..."
        >


        <button
          class="mentor-icon-btn send"
          id="mentor-send-btn"
        >

          <i class="fas fa-paper-plane"></i>

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
        document.createElement("img");


      avatar.className =
        "mentor-avatar-small";


      avatar.src =
        KERO_IMAGE_URL;


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
          '<i class="fas fa-volume-high"></i> استماع';


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
      '<i class="fas fa-volume-high"></i> استماع';
  }


  function setSpeakButtonLoading(button) {

    if (!button) return;


    button.disabled = true;

    button.classList.remove(
      "playing"
    );


    button.innerHTML =
      '<i class="fas fa-spinner fa-spin"></i> جاري التحميل';
  }


  function setSpeakButtonPlaying(button) {

    if (!button) return;


    button.disabled = false;

    button.classList.add(
      "playing"
    );


    button.innerHTML =
      '<i class="fas fa-pause"></i> إيقاف مؤقت';
  }


  function setSpeakButtonPaused(button) {

    if (!button) return;


    button.disabled = false;

    button.classList.remove(
      "playing"
    );


    button.innerHTML =
      '<i class="fas fa-play"></i> استكمال';
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
      "Kero بيكتب...";


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
                  messages: history
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
                  messages: history
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
            '<i class="fas fa-phone-slash"></i>';


          listenTurn();

        } else {

          statusEl.classList.remove(
            "show"
          );


          stopBtn.classList.remove(
            "show"
          );


          callBtn.innerHTML =
            '<i class="fas fa-phone"></i>';


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

  function mount(chapter) {

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


    fab.innerHTML = `

      <img
        class="kero-fab-img"
        src="${KERO_IMAGE_URL}"
        alt="Kero"
      >

      <span
        class="mentor-dot"
      ></span>

    `;


    document.body.appendChild(fab);


    let panel = null;


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

              (
                chapter

                  ? "أهلاً! أنا Kero، وهساعدك تفهم الفصل ده. "

                  : "أهلاً! أنا Kero، اسألني في أي حاجة في الكورس. "
              ) +

              "دي معاينة مجانية (3 رسائل بس)، وبعدها هتحتاج تعمل حساب كامل عشان تكمل معايا من غير حدود 🙂",

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

                chapter

                  ? "أهلاً! أنا Kero، مدربك في التسويق. هساعدك تفهم الفصل ده أول بأول. قولّي أنهي جزء مش واضح ليك، أو ابدأ واسألني أي سؤال 🙂"

                  : "أهلاً! أنا Kero، مدربك الذكي في التسويق. اسألني في أي حاجة في الكورس، أو قولّي عايز تراجع أنهي فصل.",

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

              panel.classList.remove(
                "open"
              );
            }
          );
        }


        panel.classList.toggle(
          "open"
        );


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

  global.LMSMentor = {

    mount,

    speak,

    stopSpeaking,

    toggleMessageAudio

  };


})(window);
