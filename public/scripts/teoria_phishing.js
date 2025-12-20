    let currentStep = 0;
    const totalSteps = 14;
    let stepUnlocked = new Array(totalSteps).fill(false);
    stepUnlocked[0] = true;

    const menuMap = [0, 1, 2, 2, 2, 2, 2, 2, 2, 3, 4, 4, 5, 5];
    const stepMap = [0, 1, 2, 9, 10, 12];

    // JUEGO
    const scenarios = [
      { text: "SMS: 'Paquete retenido...'", type: 'smishing', icon: ''},
      { text: "Llamada grabada: 'Tarjeta bloqueada...'", type: 'vishing', icon: ''},
      { text: "Correo con tu nombre: 'Factura urgente...'", type: 'spear', icon: ''}
    ];
    let gameIndex = 0;
    let currentCase = 1; const totalCases = 3; let viewedCases = [true, false, false];

    // YOUTUBE PLAYERS
    var players = {};
    var videoStatus = { smishing: false, vishing: false, phishing: false, summary: false };

    function onYouTubeIframeAPIReady() {
        createPlayer('player-smishing', 'A13q5YCCaM4', 'smishing');
        createPlayer('player-vishing', 'rz_C3X-S8Fo', 'vishing');
        createPlayer('player-phishing', 'q2oC3XunbS0', 'phishing');
        createPlayer('player-summary', 'uhzV5-iFb5E', 'summary');
    }

    function createPlayer(elementId, videoId, key) {
        players[key] = new YT.Player(elementId, {
            videoId: videoId,
            events: {
                'onStateChange': function(event) { onPlayerStateChange(event, key); }
            }
        });
    }

    function onPlayerStateChange(event, key) {
        if (event.data === 0) {
            markVideoComplete(key);
        }
    }

    function markVideoComplete(key) {
        if (!videoStatus[key]) {
            videoStatus[key] = true;
            const statusDiv = document.getElementById(`status-${key}`);
            if (statusDiv) {
                statusDiv.classList.remove('watching');
                statusDiv.classList.add('completed');
            }
            if(checkCurrentStepCompletion()) {
                document.getElementById('bloqueo-msg').style.display = 'none';
                updateUI();
            }
        }
    }

    const steps = document.querySelectorAll('.course-step');
    const menuItems = document.querySelectorAll('.lms-menu-item');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const finishBtn = document.getElementById('finishBtn');
    const bloqueoMsg = document.getElementById('bloqueo-msg');

    function updateUI() {
      const activeMenuIndex = menuMap[currentStep];
      menuItems.forEach((menu, index) => {
        menu.classList.remove('active', 'completed', 'unlocked');
        if (index === activeMenuIndex) {
            menu.classList.add('active', 'unlocked');
        } else if (index < activeMenuIndex || (stepMap[index] !== undefined && stepUnlocked[stepMap[index]])) {
            menu.classList.add('unlocked', 'completed');
            menu.onclick = () => goToStep(stepMap[index]);
        }
      });

      steps.forEach((step, index) => {
        if (index === currentStep) step.classList.add('active'); else step.classList.remove('active');
      });
      
      prevBtn.style.visibility = (currentStep === 0) ? 'hidden' : 'visible';
      
      if (currentStep === totalSteps - 1) {
        nextBtn.style.display = 'none';
        finishBtn.style.display = 'inline-block';
        if (checkCurrentStepCompletion()) {
             finishBtn.style.pointerEvents = 'auto'; finishBtn.style.opacity = '1'; finishBtn.textContent = "Ir al Examen";
        } else {
             finishBtn.style.pointerEvents = 'none'; finishBtn.style.opacity = '0.5'; finishBtn.textContent = "Termina el vídeo";
        }
      } else {
        nextBtn.style.display = 'inline-block'; finishBtn.style.display = 'none';
      }
      bloqueoMsg.style.display = 'none';
      pauseAllVideos();
    }

    function pauseAllVideos() {
        Object.values(players).forEach(p => {
            if(p && typeof p.pauseVideo === 'function') p.pauseVideo();
        });
    }

    function goToStep(n) { if (n >= 0 && n < totalSteps && stepUnlocked[n]) { currentStep = n; updateUI(); } }
    function changeStep(n) { if (n < 0) { currentStep += n; if (currentStep < 0) currentStep = 0; updateUI(); } }
    
    function tryNextStep() {
      if (checkCurrentStepCompletion()) {
        stepUnlocked[currentStep + 1] = true; currentStep++; updateUI();
      } else {
        bloqueoMsg.textContent = "⚠️ Completa la interacción o ve el vídeo entero.";
        bloqueoMsg.style.display = "block";
      }
    }

    function revealUrlLab(el, url) {
      const inspector = document.getElementById('url-inspector');
      inspector.innerText = "Destino real: " + url;
      if (!el.classList.contains('viewed')) {
        el.classList.add('viewed');
        markInteraction(el);
      }
    }

    function verificarClick(elemento, esCorrecto, mensaje) {
      const feedback = document.getElementById('lab-feedback');
      document.querySelectorAll('.hover-case').forEach(c => {
        c.style.borderColor = "#ddd";
        c.style.backgroundColor = "#fff";
      });

      if (esCorrecto) {
        elemento.style.borderColor = "#4caf50";
        elemento.style.backgroundColor = "#e8f5e9";
        feedback.style.color = "green";
        feedback.innerText = mensaje;
        markInteraction(elemento);
      } else {
        elemento.style.borderColor = "#f44336";
        elemento.style.backgroundColor = "#ffebee";
        feedback.style.color = "red";
        feedback.innerText = mensaje;
      }
    }

    function checkCurrentStepCompletion() {
        const currentDiv = document.getElementById(`step-${currentStep}`);
        if (!currentDiv) return true;
        const pendingItems = currentDiv.querySelectorAll('.required-interaction:not(.viewed)');
        if (pendingItems.length > 0) return false;

        if (currentStep === 4 && !videoStatus.smishing) return false;
        if (currentStep === 6 && !videoStatus.vishing) return false;
        if (currentStep === 8 && !videoStatus.phishing) return false;
        if (currentStep === 13 && !videoStatus.summary) return false;

        return true;
    }

    function markInteraction(element) {
      if (!element.classList.contains('viewed')) {
        element.classList.add('viewed');
        if (checkCurrentStepCompletion()) {
            bloqueoMsg.style.display = 'none';
            updateUI();
        }
      }
    }

    function revelar(id, boton) { 
        document.getElementById(id).style.display = "block"; 
        boton.style.display = "none"; 
        boton.classList.add('viewed'); 
        if(checkCurrentStepCompletion()) updateUI(); 
    }

    function checkSimulation(el) {
        var textoOculto = el.querySelector('p[style*="display:none"]');
        if (textoOculto) textoOculto.style.display = 'block';
        if (!el.classList.contains('viewed')) {
            el.classList.add('viewed');
            el.style.backgroundColor = "#ffebee";
            el.style.borderColor = "#ef5350";
            if (checkCurrentStepCompletion()) updateUI();
        }
    }

    function loadScenario() { 
        if(gameIndex < scenarios.length) { 
            document.getElementById('scenario-text').innerText = scenarios[gameIndex].text; 
            document.getElementById('scenario-icon').innerText = scenarios[gameIndex].icon; 
        } 
    }

    function playGame(answer) {
       const current = scenarios[gameIndex]; const feedback = document.getElementById('game-feedback');
       if(answer === current.type) {
           feedback.style.color = 'green'; feedback.innerText = "✅ Correcto"; gameIndex++;
           if(gameIndex < scenarios.length) {
               setTimeout(() => { loadScenario(); feedback.innerText = ""; }, 1000);
           } else {
               setTimeout(() => {
                   document.getElementById('scenario-text').innerText = "¡Completado!"; 
                   document.getElementById('scenario-icon').innerText = "🛡️";
                   feedback.innerText = "Entrenamiento finalizado.";
                   const container = document.getElementById('game-container');
                   markInteraction(container);
               }, 1000);
           }
       } else { feedback.style.color = '#d32f2f'; feedback.innerText = "❌ Incorrecto"; }
    }

    function changeCase(n) {
        const nextIndex = currentCase + n;
        if(nextIndex > 0 && nextIndex <= totalCases) {
            document.getElementById(`case-${currentCase}`).classList.remove('active');
            currentCase = nextIndex;
            document.getElementById(`case-${currentCase}`).classList.add('active');
            viewedCases[currentCase - 1] = true;
            document.getElementById('case-counter').textContent = `${currentCase} / ${totalCases}`;
            document.getElementById('btn-prev-case').disabled = (currentCase === 1);
            document.getElementById('btn-next-case').disabled = (currentCase === totalCases);
            if(viewedCases.every(Boolean)) {
                markInteraction(document.getElementById('carousel-interaction'));
            }
        }
    }

    loadScenario();
    updateUI();