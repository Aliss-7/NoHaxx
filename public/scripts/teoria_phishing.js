let currentStep = 0;
const totalSteps = 14;
let stepUnlocked = new Array(totalSteps).fill(false);
stepUnlocked[0] = true;

const menuMap = [0, 1, 2, 2, 2, 2, 2, 2, 2, 3, 4, 4, 5, 5];
const stepMap = [0, 1, 2, 9, 10, 12];

// JUEGO
const scenarios = [
  { text: "SMS: 'Paquete retenido...'", type: 'smishing', icon: '📩'},
  { text: "Llamada grabada: 'Tarjeta bloqueada...'", type: 'vishing', icon: '📞'},
  { text: "Correo con tu nombre: 'Factura urgente...'", type: 'spear', icon: '📧'}
];
let gameIndex = 0;
let currentCase = 1; 
const totalCases = 3; 
let viewedCases = [true, false, false];

// YOUTUBE
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
        updateUI(); 
    }
}

const steps = document.querySelectorAll('.course-step');
const menuItems = document.querySelectorAll('.lms-menu-item');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const finishBtn = document.getElementById('finishBtn');
const bloqueoMsg = document.getElementById('bloqueo-msg');

function updateUI() {
    const isStepComplete = checkCurrentStepCompletion();

    steps.forEach((step, index) => {
        if (index === currentStep) step.classList.add('active'); else step.classList.remove('active');
    });

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
  
    prevBtn.style.visibility = (currentStep === 0) ? 'hidden' : 'visible';
  
    if (currentStep === totalSteps - 1) {
        nextBtn.style.display = 'none';
        finishBtn.style.display = 'inline-block';
        if (isStepComplete) {
            finishBtn.style.pointerEvents = 'auto'; 
            finishBtn.style.opacity = '1'; 
            finishBtn.textContent = "Ir al Examen";
            guardarProgresoTeoria('phishing');
        } else {
            finishBtn.style.pointerEvents = 'none'; 
            finishBtn.style.opacity = '0.5'; 
            finishBtn.textContent = "Termina el vídeo";
        }
    } else {
        nextBtn.style.display = 'inline-block'; 
        finishBtn.style.display = 'none';

        if (isStepComplete) {
            nextBtn.disabled = false;
            nextBtn.style.opacity = "1";
            nextBtn.style.cursor = "pointer";
            bloqueoMsg.style.display = 'none';
        } else {
            nextBtn.disabled = true;
            nextBtn.style.opacity = "0.5";
            nextBtn.style.cursor = "not-allowed";
        }
    }
    pauseAllVideos();
}

function checkCurrentStepCompletion() {
    const currentDiv = document.getElementById(`step-${currentStep}`);
    if (!currentDiv) return true;

    const pendingItems = currentDiv.querySelectorAll('.required-interaction:not(.viewed)');
    if (pendingItems.length > 0) return false;

    const videoRequisitos = { 4: 'smishing', 6: 'vishing', 8: 'phishing', 13: 'summary' };
    const videoKey = videoRequisitos[currentStep];
    if (videoKey && !videoStatus[videoKey]) return false;

    return true;
}

function markInteraction(element) {
    if (element && !element.classList.contains('viewed')) {
        element.classList.add('viewed');
        updateUI();
    }
}

function tryNextStep() {
    if (checkCurrentStepCompletion()) {
        stepUnlocked[currentStep + 1] = true; 
        currentStep++; 
        updateUI();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
        bloqueoMsg.textContent = "⚠️ Completa la interacción obligatoria o ve el vídeo entero.";
        bloqueoMsg.style.display = "block";
    }
}

function goToStep(n) { if (n >= 0 && n < totalSteps && stepUnlocked[n]) { currentStep = n; updateUI(); } }
function changeStep(n) { if (n < 0) { currentStep += n; if (currentStep < 0) currentStep = 0; updateUI(); } }

function revelar(id, boton) { 
    document.getElementById(id).style.display = "block"; 
    boton.style.display = "none"; 
    markInteraction(boton);
}

function checkSimulation(el) {
    var textoOculto = el.querySelector('p[style*="display:none"]');
    if (textoOculto) textoOculto.style.display = 'block';
    el.style.backgroundColor = "#ffebee";
    el.style.borderColor = "#ef5350";
    markInteraction(el);
}

function revealUrlLab(el, url) {
    const inspector = document.getElementById('url-inspector');
    inspector.innerText = "Destino real: " + url;
    markInteraction(el);
}

function verificarClick(elemento, esCorrecto, mensaje) {
    const feedback = document.getElementById('lab-feedback');
    document.querySelectorAll('.hover-case').forEach(c => {
        c.style.borderColor = "#ddd";
        c.style.backgroundColor = "#fff";
    });

    if (esCorrecto) {
        elemento.style.borderColor = "#4caf50";
        feedback.style.color = "green";
        markInteraction(elemento);
    } else {
        elemento.style.borderColor = "#f44336";
        feedback.style.color = "red";
    }
    feedback.innerText = mensaje;
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
               feedback.innerText = "Entrenamiento finalizado.";
               markInteraction(document.getElementById('game-container'));
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

function pauseAllVideos() {
    Object.values(players).forEach(p => {
        if(p && typeof p.pauseVideo === 'function') p.pauseVideo();
    });
}

function loadScenario() { 
    if(gameIndex < scenarios.length) { 
        document.getElementById('scenario-text').innerText = scenarios[gameIndex].text; 
        document.getElementById('scenario-icon').innerText = scenarios[gameIndex].icon; 
    } 
}

function guardarProgresoTeoria(modulo) {
    const user = firebase.auth().currentUser;
    if(user) {
        firebase.firestore().collection('userScores').doc(user.uid).set({
            teoria: { [modulo]: true }
        }, { merge: true });
    }
}

loadScenario();
updateUI();