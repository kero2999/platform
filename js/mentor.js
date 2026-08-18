/* =========================================================
   LMSMentor — المرشد الذكي: شات + تحدث صوتي
   - يظهر كفقاعة عائمة في كل صفحة فصل (وفي اللوحة لأسئلة عامة)
   - محتاج سيرفر متصل (API_BASE_URL) + ANTHROPIC_API_KEY مضبوط هناك
   - الصوت (تسجيل وتشغيل) عبر Web Speech API المدمجة في المتصفح
   ========================================================= */
(function (global) {
  const HISTORY_PREFIX = "lms_mentor_history_v1_";
  const MAX_HISTORY_MESSAGES = 16;

  function _historyKey(chapter) {
    const uname = window.LMSAuth ? window.LMSAuth.currentUsername() : "guest";
    return HISTORY_PREFIX + (uname || "guest") + "_" + (chapter || "general");
  }

  function _readHistory(chapter) {
    try { return JSON.parse(localStorage.getItem(_historyKey(chapter))) || []; }
    catch (e) { return []; }
  }
  function _writeHistory(chapter, list) {
    localStorage.setItem(_historyKey(chapter), JSON.stringify(list.slice(-MAX_HISTORY_MESSAGES)));
  }

  function _injectStyle() {
    if (document.getElementById("mentor-style")) return;
    const style = document.createElement("style");
    style.id = "mentor-style";
    style.textContent = `
      #mentor-fab{
        position:fixed;bottom:22px;right:22px;z-index:4500;
        width:58px;height:58px;border-radius:50%;
        background:linear-gradient(135deg,#ffd700,#ff6f00);
        display:flex;align-items:center;justify-content:center;
        box-shadow:0 10px 30px rgba(255,215,0,0.35);
        cursor:pointer;border:none;color:#0d1b2a;font-size:1.4rem;
        transition:transform .25s;
        overflow:hidden;
      }
      #mentor-fab img{ width:100%;height:100%;object-fit:cover;border-radius:50%; }
      #mentor-fab:hover{ transform:scale(1.08); }
      #mentor-fab .mentor-dot{
        position:absolute;top:4px;right:4px;width:12px;height:12px;border-radius:50%;
        background:#00c896;border:2px solid #0d1b2a;
      }
      #mentor-panel{
        position:fixed;bottom:90px;right:22px;z-index:4500;
        width:min(380px, 92vw);height:min(560px, 72vh);
        background:#0d1b2a;border:2px solid #ffd700;border-radius:22px;
        display:none;flex-direction:column;overflow:hidden;
        box-shadow:0 25px 60px rgba(0,0,0,0.45);
        font-family:'Tajawal',sans-serif;
      }
      #mentor-panel.open{ display:flex; }
      #mentor-head{
        display:flex;align-items:center;gap:10px;padding:14px 16px;
        background:rgba(255,215,0,0.08);border-bottom:1px solid rgba(255,215,0,0.25);
        color:#fff;
      }
      #mentor-head .mh-icon{
        width:36px;height:36px;border-radius:50%;
        background:linear-gradient(135deg,#ffd700,#ff6f00);
        display:flex;align-items:center;justify-content:center;color:#0d1b2a;font-size:1rem;
        overflow:hidden;
      }
      #mentor-head .mh-icon img{ width:100%;height:100%;object-fit:cover;border-radius:50%; }
      #mentor-head .mh-title{font-weight:800;font-size:0.92rem;}
      #mentor-head .mh-sub{font-size:0.72rem;color:rgba(255,255,255,0.5);}
      #mentor-head .mh-close{margin-inline-start:auto;background:none;border:none;color:rgba(255,255,255,0.6);font-size:1.1rem;cursor:pointer;}
      #mentor-call-btn{
        width:34px;height:34px;border-radius:50%;border:none;flex-shrink:0;
        background:rgba(0,200,150,0.15);color:#00c896;font-size:0.9rem;cursor:pointer;
        display:flex;align-items:center;justify-content:center;margin-inline-start:6px;
      }
      #mentor-call-btn.active{ background:#ff5252; color:#fff; animation:mentorPulse 1s infinite; }
      #mentor-call-status{
        display:none;align-items:center;justify-content:center;gap:8px;
        padding:8px 16px;font-size:0.78rem;color:#ffd700;background:rgba(255,215,0,0.08);
        border-bottom:1px solid rgba(255,215,0,0.15);
      }
      #mentor-call-status.show{ display:flex; }
      #mentor-call-status .dot{width:8px;height:8px;border-radius:50%;background:#ffd700;animation:mentorPulse 1s infinite;}
      #mentor-stop-audio-btn{
        display:none;align-items:center;gap:6px;margin-inline-start:12px;
        background:rgba(255,82,82,0.15);color:#ff5252;border:1px solid rgba(255,82,82,0.4);
        border-radius:14px;padding:3px 10px;font-size:0.72rem;cursor:pointer;font-family:'Tajawal',sans-serif;
      }
      #mentor-stop-audio-btn.show{ display:flex; }
      #mentor-messages{
        flex:1;overflow-y:auto;padding:16px;display:flex;flex-direction:column;gap:12px;
      }
      .mentor-msg{max-width:85%;padding:11px 14px;border-radius:14px;font-size:0.86rem;line-height:1.7;white-space:pre-wrap;}
      .mentor-msg.user{align-self:flex-start;background:rgba(255,215,0,0.14);color:#fff;border-bottom-left-radius:4px;}
      .mentor-msg.assistant{align-self:flex-end;background:rgba(255,255,255,0.06);color:#fff;border-bottom-right-radius:4px;display:flex;flex-direction:column;gap:8px;}
      .mentor-msg.assistant .mentor-speak{
        align-self:flex-start;background:none;border:1px solid rgba(255,215,0,0.4);color:#ffd700;
        border-radius:20px;padding:4px 10px;font-size:0.7rem;cursor:pointer;
      }
      .mentor-typing{align-self:flex-end;color:rgba(255,255,255,0.5);font-size:0.8rem;}
      #mentor-input-row{
        display:flex;align-items:center;gap:8px;padding:12px;border-top:1px solid rgba(255,215,0,0.2);
      }
      #mentor-input{
        flex:1;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.12);
        border-radius:20px;padding:10px 14px;color:#fff;font-size:0.85rem;outline:none;font-family:'Tajawal',sans-serif;
      }
      .mentor-icon-btn{
        width:38px;height:38px;border-radius:50%;border:none;flex-shrink:0;
        display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:0.95rem;
      }
      .mentor-icon-btn.mic{ background:rgba(255,255,255,0.08); color:#fff; }
      .mentor-icon-btn.mic.recording{ background:#ff5252; color:#fff; animation:mentorPulse 1s infinite; }
      .mentor-icon-btn.send{ background:linear-gradient(135deg,#ffd700,#ff6f00); color:#0d1b2a; }
      @keyframes mentorPulse{0%,100%{opacity:1;}50%{opacity:0.6;}}
      #mentor-locked{padding:22px;text-align:center;color:rgba(255,255,255,0.6);font-size:0.85rem;line-height:1.8;}
      @media (max-width:480px){ #mentor-panel{ right:10px; bottom:80px; } #mentor-fab{ right:14px; bottom:14px; } }
    `;
    document.head.appendChild(style);
  }

  function _buildPanel(chapter) {
    const panel = document.createElement("div");
    panel.id = "mentor-panel";
    panel.innerHTML = `
      <div id="mentor-head">
        <div class="mh-icon"><img src="images/kero-avatar.jpg" alt="Kero" id="mentor-head-avatar"></div>
        <div>
          <div class="mh-title">Kero</div>
          <div class="mh-sub">${chapter ? "بيشرحلك محتوى الفصل ده خطوة بخطوة" : "اسأل أي سؤال عن الكورس"}</div>
        </div>
        <button class="mh-close" id="mentor-call-btn" title="محادثة صوتية مستمرة"><i class="fas fa-phone"></i></button>
        <button class="mh-close" id="mentor-close-btn"><i class="fas fa-xmark"></i></button>
      </div>
      <div id="mentor-call-status"><span class="dot"></span> <span id="mentor-call-status-text">جاري الاستماع...</span>
        <button id="mentor-stop-audio-btn"><i class="fas fa-stop"></i> إيقاف الصوت</button>
      </div>
      <div id="mentor-messages"></div>
      <div id="mentor-input-row">
        <button class="mentor-icon-btn mic" id="mentor-mic-btn" title="تحدث"><i class="fas fa-microphone"></i></button>
        <input type="text" id="mentor-input" placeholder="اكتب سؤالك هنا...">
        <button class="mentor-icon-btn send" id="mentor-send-btn"><i class="fas fa-paper-plane"></i></button>
      </div>
    `;
    document.body.appendChild(panel);
    return panel;
  }

  function _renderMessage(container, role, text, showSpeak) {
    const div = document.createElement("div");
    div.className = "mentor-msg " + role;
    if (role === "assistant") {
      const p = document.createElement("div");
      p.textContent = text;
      div.appendChild(p);
      if (showSpeak) {
        const speakBtn = document.createElement("button");
        speakBtn.className = "mentor-speak";
        speakBtn.innerHTML = '<i class="fas fa-volume-high"></i> استماع';
        speakBtn.onclick = function () { LMSMentor.speak(text); };
        div.appendChild(speakBtn);
      }
    } else {
      div.textContent = text;
    }
    container.appendChild(div);
    container.scrollTop = container.scrollHeight;
    return div;
  }

  let _currentAudio = null;

  function stopSpeaking() {
    if (_currentAudio) { _currentAudio.pause(); _currentAudio = null; }
    if ("speechSynthesis" in window) window.speechSynthesis.cancel();
  }

  async function speak(text, onEnd) {
    if (_currentAudio) { _currentAudio.pause(); _currentAudio = null; }

    try {
      const token = localStorage.getItem("lms_token_v1");
      const res = await fetch(API_BASE_URL + "/api/mentor/speak", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token,
        },
        body: JSON.stringify({ text }),
      });
      if (!res.ok) {
        const errBody = await res.json().catch(() => ({}));
        throw new Error(errBody.error || "tts failed with status " + res.status);
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);
      _currentAudio = audio;
      audio.onended = function () { URL.revokeObjectURL(url); if (onEnd) onEnd(); };
      audio.onerror = function () { URL.revokeObjectURL(url); if (onEnd) onEnd(); };
      await audio.play(); // لازم ننتظرها — لو اتمنعت (سياسة تشغيل تلقائي)، هتوقع هنا ونروح للخطة البديلة
    } catch (e) {
      console.warn("LMSMentor.speak: real voice failed, falling back to browser voice —", e.message || e);
      if (window.LMSUi) LMSUi.showToast("الصوت الطبيعي مش متاح دلوقتي، بنستخدم صوت بديل");
      if ("speechSynthesis" in window) {
        window.speechSynthesis.cancel();
        const utter = new SpeechSynthesisUtterance(text);
        utter.lang = "ar-SA";
        if (onEnd) { utter.onend = onEnd; utter.onerror = onEnd; }
        window.speechSynthesis.speak(utter);
      } else if (onEnd) {
        onEnd();
      }
    }
  }

  async function sendMessage(chapter, text, messagesEl, mode) {
    if (!text.trim()) return null;
    mode = mode || "full";
    const showSpeak = mode === "full";
    const history = _readHistory(chapter);
    history.push({ role: "user", content: text });
    _writeHistory(chapter, history);
    _renderMessage(messagesEl, "user", text, false);

    const typing = document.createElement("div");
    typing.className = "mentor-typing";
    typing.textContent = "المرشد بيكتب...";
    messagesEl.appendChild(typing);
    messagesEl.scrollTop = messagesEl.scrollHeight;

    try {
      let res;
      if (mode === "trial") {
        const sessionId = window.LMSTrial ? window.LMSTrial.getSessionId() : null;
        res = await fetch(API_BASE_URL + "/api/mentor/trial-chat", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Trial-Session": sessionId || "",
          },
          body: JSON.stringify({ chapter, messages: history }),
        });
      } else {
        const token = localStorage.getItem("lms_token_v1");
        res = await fetch(API_BASE_URL + "/api/mentor/chat", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + token,
          },
          body: JSON.stringify({ chapter, messages: history }),
        });
      }
      const data = await res.json();
      typing.remove();
      if (!data.ok) {
        if (data.limitReached) {
          _renderMessage(messagesEl, "assistant", "🔒 " + data.error, false);
          return { limitReached: true };
        }
        _renderMessage(messagesEl, "assistant", "⚠️ " + (data.error || "حصل خطأ، حاول تاني."), false);
        return null;
      }
      history.push({ role: "assistant", content: data.reply });
      _writeHistory(chapter, history);
      _renderMessage(messagesEl, "assistant", data.reply, showSpeak);
      return { reply: data.reply, remaining: data.remaining };
    } catch (e) {
      typing.remove();
      _renderMessage(messagesEl, "assistant", "⚠️ تعذّر الاتصال بـ Kero، تأكد من اتصالك بالإنترنت.", false);
      return null;
    }
  }

  function setupVoiceInput(inputEl, micBtn) {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      micBtn.style.display = "none";
      return;
    }
    const recognizer = new SpeechRecognition();
    recognizer.lang = "ar-SA";
    recognizer.interimResults = false;
    recognizer.maxAlternatives = 1;
    let listening = false;

    micBtn.addEventListener("click", function () {
      if (listening) { recognizer.stop(); return; }
      recognizer.start();
    });
    recognizer.onstart = function () { listening = true; micBtn.classList.add("recording"); };
    recognizer.onend = function () { listening = false; micBtn.classList.remove("recording"); };
    recognizer.onerror = function () { listening = false; micBtn.classList.remove("recording"); };
    recognizer.onresult = function (e) {
      const transcript = e.results[0][0].transcript;
      inputEl.value = transcript;
    };
  }

  function setupVoiceConversation(panel, chapter, messagesEl, callBtn) {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      callBtn.style.display = "none";
      return;
    }
    const statusEl = panel.querySelector("#mentor-call-status");
    const statusText = panel.querySelector("#mentor-call-status-text");
    const stopBtn = panel.querySelector("#mentor-stop-audio-btn");
    const recognizer = new SpeechRecognition();
    recognizer.lang = "ar-SA";
    recognizer.interimResults = false;
    recognizer.maxAlternatives = 1;

    let active = false;
    let turnInProgress = false; // true من لحظة استلام سؤال لحد ما يخلص الرد بالصوت بالكامل

    function setStatus(text) {
      statusText.textContent = text;
    }

    function listenTurn() {
      if (!active || turnInProgress) return; // ما نفتحش المايك وإحنا لسه بنفكر أو بنتكلم
      setStatus("جاري الاستماع...");
      try { recognizer.start(); } catch (e) { /* قد يكون شغال بالفعل */ }
    }

    recognizer.onresult = async function (e) {
      if (!active || turnInProgress) return;
      const transcript = e.results[0][0].transcript;
      if (!transcript || !transcript.trim()) { listenTurn(); return; }

      turnInProgress = true;
      stopBtn.classList.add("show");
      setStatus("المرشد بيفكر...");
      const result = await sendMessage(chapter, transcript, messagesEl, "full");
      if (!active) { turnInProgress = false; return; }
      if (!result || !result.reply) { turnInProgress = false; listenTurn(); return; }
      setStatus("المرشد بيتكلم...");
      speak(result.reply, function () {
        turnInProgress = false;
        stopBtn.classList.remove("show");
        if (active) listenTurn();
      });
    };

    recognizer.onerror = function (e) {
      if (!active || turnInProgress) return;
      // "no-speech" و"aborted" بتحصل بشكل طبيعي أثناء الاستماع المستمر — كمّل عادي
      if (e.error === "no-speech" || e.error === "aborted") { listenTurn(); return; }
      setStatus("حصل خطأ في المايك، حاول تاني.");
    };

    recognizer.onend = function () {
      // أعد فتح المايك بس لو لسه في وضع المكالمة ومفيش رد جاري التجهيز أو التشغيل
      if (active && !turnInProgress) setTimeout(listenTurn, 300);
    };

    stopBtn.addEventListener("click", function () {
      stopSpeaking();
      turnInProgress = false;
      stopBtn.classList.remove("show");
      if (active) listenTurn();
    });

    callBtn.addEventListener("click", function () {
      active = !active;
      callBtn.classList.toggle("active", active);
      if (active) {
        statusEl.classList.add("show");
        callBtn.innerHTML = '<i class="fas fa-phone-slash"></i>';
        listenTurn();
      } else {
        statusEl.classList.remove("show");
        stopBtn.classList.remove("show");
        callBtn.innerHTML = '<i class="fas fa-phone"></i>';
        turnInProgress = false;
        try { recognizer.stop(); } catch (e) {}
        stopSpeaking();
      }
    });
  }

  function mount(chapter) {
    const fullAccount = window.LMSAuth && window.LMSAuth.isLoggedIn();
    const trialAccount = !fullAccount && window.LMSTrial && window.LMSTrial.isTrialActive();
    if (!fullAccount && !trialAccount) return; // المرشد للمشتركين أو لزوار المعاينة المجانية بس

    _injectStyle();
    const fab = document.createElement("button");
    fab.id = "mentor-fab";
    fab.innerHTML = '<img src="images/kero-avatar.jpg" alt="Kero"><span class="mentor-dot"></span>';
    const fabImg = fab.querySelector("img");
    fabImg.addEventListener("error", function () {
      fabImg.remove();
      fab.insertAdjacentHTML("afterbegin", '<i class="fas fa-comment-dots"></i>');
    });
    document.body.appendChild(fab);

    let panel = null;

    fab.addEventListener("click", function () {
      if (!panel) {
        panel = _buildPanel(chapter);
        const headAvatar = panel.querySelector("#mentor-head-avatar");
        headAvatar.addEventListener("error", function () {
          headAvatar.parentElement.innerHTML = '<i class="fas fa-robot"></i>';
        });
        const messagesEl = panel.querySelector("#mentor-messages");
        const input = panel.querySelector("#mentor-input");
        const sendBtn = panel.querySelector("#mentor-send-btn");
        const micBtn = panel.querySelector("#mentor-mic-btn");
        const closeBtn = panel.querySelector("#mentor-close-btn");
        const callBtn = panel.querySelector("#mentor-call-btn");

        if (!window.LMSAuth.isRemote()) {
          messagesEl.innerHTML =
            '<div id="mentor-locked"><i class="fas fa-plug-circle-xmark" style="font-size:1.6rem;color:#ffd700;margin-bottom:10px;display:block;"></i>' +
            "Kero محتاج السيرفر الحقيقي شغال ومربوط (راجع js/config.js وserver/README.md).</div>";
          panel.querySelector("#mentor-input-row").style.display = "none";
          callBtn.style.display = "none";
        } else if (trialAccount) {
          // وضع المعاينة المجانية: نص بس (بدون صوت)، وعدد رسائل محدود يتحقق منه السيرفر
          callBtn.style.display = "none";
          micBtn.style.display = "none";
          let trialDone = false;

          _renderMessage(
            messagesEl,
            "assistant",
            (chapter
              ? "أهلاً! أنا Kero، هنا أساعدك تفهم الفصل ده. "
              : "أهلاً! أنا Kero، اسألني في أي حاجة في الكورس. ") +
              "دي معاينة مجانية (3 رسائل بس)، وبعدها هتحتاج تعمل حساب كامل عشان تكمل معايا من غير حدود 🙂",
            false
          );

          function handleTrialSend() {
            if (trialDone) return;
            const text = input.value;
            if (!text.trim()) return;
            input.value = "";
            sendBtn.disabled = true;
            sendMessage(chapter, text, messagesEl, "trial").then(function (result) {
              sendBtn.disabled = false;
              if (result && result.limitReached) {
                trialDone = true;
                input.disabled = true;
                input.placeholder = "خلصت رسائلك المجانية";
                sendBtn.style.display = "none";
              }
            });
          }

          sendBtn.addEventListener("click", handleTrialSend);
          input.addEventListener("keydown", function (e) {
            if (e.key === "Enter") handleTrialSend();
          });
        } else {
          const history = _readHistory(chapter);
          if (history.length === 0) {
            _renderMessage(
              messagesEl,
              "assistant",
              chapter
                ? "أهلاً! أنا Kero، هنا أساعدك تفهم الفصل ده أول بأول. قولّي أنهي جزء مش واضح ليك، أو ابدأ واسألني أي سؤال 🙂"
                : "أهلاً! أنا Kero، اسألني في أي حاجة في الكورس، أو قولّي عايز تراجع أنهي فصل.",
              true
            );
          } else {
            history.forEach((m) => _renderMessage(messagesEl, m.role, m.content, m.role === "assistant"));
          }
          setupVoiceInput(input, micBtn);
          setupVoiceConversation(panel, chapter, messagesEl, callBtn);
          sendBtn.addEventListener("click", function () {
            const text = input.value;
            input.value = "";
            sendMessage(chapter, text, messagesEl, "full");
          });
          input.addEventListener("keydown", function (e) {
            if (e.key === "Enter") {
              const text = input.value;
              input.value = "";
              sendMessage(chapter, text, messagesEl, "full");
            }
          });
        }

        closeBtn.addEventListener("click", function () { panel.classList.remove("open"); });
      }
      panel.classList.toggle("open");
    });
  }

  global.LMSMentor = { mount, speak };
})(window);
