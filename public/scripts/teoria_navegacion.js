const stepRequirements = {
    0: { completed: true },
    1: { type: 'mixed', checks: { wifi: false, tooltip: false }, completed: false },
    2: { type: 'mixed', checks: { vpn: false, tooltip: false }, completed: false },
    3: { type: 'mixed', checks: { proto: false, domain: false, path: false }, completed: false },
    4: { type: 'browser', completed: false },
    5: { type: 'puzzle', itemsTotal: 7, itemsSolved: 0, completed: false },
    6: { type: 'video', completed: false }, 
    7: { completed: true }, 
    8: { type: 'privacy', checks: { toggles: false, tooltip: false }, completed: false }, 
    9: { type: 'profile_sim', found: 0, total: 3, items: { avatar: false, stats: false, link: false }, completed: false }, 
    10: { type: 'cards', viewed: 0, target: 4, completed: false },
    11: { type: 'permissions', solved: 0, total: 3, items: { flash: false, maps: false, calc: false }, completed: false },
    12: { type: 'finish', completed: true }
};

let currentStep = 0;
const steps = document.querySelectorAll('.course-step');
const totalSteps = steps.length;

function showStep(index) {
    steps.forEach((step, i) => {
        step.classList.remove('active');
        if (i === index) {
            step.classList.add('active');
            window.scrollTo(0, 0);
        }
    });

    currentStep = index;
    updateNextButtonState();

    let activeMenu = 0;
    if (index <= 2) activeMenu = 0;
    else if (index <= 6) activeMenu = 1;
    else if (index <= 9) activeMenu = 2;
    else if (index <= 11) activeMenu = 3;
    else activeMenu = 4;

    document.querySelectorAll('.lms-menu-item').forEach((item, i) => {
        item.classList.remove('active');
        if (i === activeMenu) item.classList.add('active');
        if (i <= activeMenu) item.classList.add('unlocked');
    });

    document.getElementById('prevBtn').disabled = (index === 0);
    
    const nextBtn = document.getElementById('nextBtn');
    const finishBtn = document.getElementById('finishBtn');

    if (index === totalSteps - 1) {
        nextBtn.style.display = 'none';
        
        if (finishBtn) {
            finishBtn.style.display = 'inline-block';
            finishBtn.disabled = false;
            finishBtn.style.opacity = '1';
            finishBtn.textContent = "Ir al Examen";
            
            guardarProgresoTeoria('navegacion');
        }
    } else {
        nextBtn.style.display = 'inline-block';
        if (finishBtn) finishBtn.style.display = 'none';
    }
}

function changeStep(n) {
    if (n === -1 && currentStep > 0) showStep(currentStep - 1);
}

function tryNextStep() {
    const req = stepRequirements[currentStep];
    if (req && !req.completed) {
        if (currentStep === 1 || currentStep === 2) {
            alert("Debes completar la simulación Y revisar los términos marcados en azul.");
        } else if (currentStep === 3) {
            alert("Pasa el ratón por todas las partes de la URL para continuar.");
        } else if (currentStep === 5) {
            alert("Arrastra todos los elementos a la zona correcta para continuar.");
        } else if (currentStep === 6) {
            alert("Debes ver el video completo para poder continuar.");
        } else if (currentStep === 8) {
            alert("Debes configurar la privacidad Y leer la definición de 'Oversharing'.");
        } else if (currentStep === 9) {
            alert("Encuentra las 3 señales de alerta en el perfil falso para continuar.");
        } else if (currentStep === 11) {
            alert("Revisa correctamente los permisos de las 3 aplicaciones.");
        } else {
            alert("Completa la actividad interactiva para continuar.");
        }
        return;
    }
    if (currentStep < totalSteps - 1) showStep(currentStep + 1);
}

function updateNextButtonState() {
    const nextBtn = document.getElementById('nextBtn');
    const req = stepRequirements[currentStep];
    
    if (req && !req.completed) {
        nextBtn.disabled = true;
        nextBtn.style.opacity = '0.5';
        nextBtn.style.cursor = 'not-allowed';
    } else {
        nextBtn.disabled = false;
        nextBtn.style.opacity = '1';
        nextBtn.style.cursor = 'pointer';
    }
}

function markCheck(step, key) {
    if (stepRequirements[step] && stepRequirements[step].checks) {
        stepRequirements[step].checks[key] = true;
        const allDone = Object.values(stepRequirements[step].checks).every(v => v === true);
        if (allDone) {
            stepRequirements[step].completed = true;
            updateNextButtonState();
        } else {
            if(step === 8) checkPrivacy();
        }
    }
}

if(steps.length > 0) showStep(0);


// WI-FI
function checkWifi(type) {
    const feedback = document.getElementById('wifi-feedback');
    const status = document.getElementById('wifi-status');
    feedback.style.display = 'block';

    if (type === 'fake') {
        feedback.style.color = '#d32f2f';
        feedback.innerHTML = "¡PELIGRO! Esa red no tiene candado y su nombre es sospechoso.";
        status.innerText = "ERROR DE CONEXIÓN";
    } else {
        feedback.style.color = '#2e7d32';
        feedback.innerHTML = "Correcto. Esta red tiene seguridad WPA2. Aún así, usa VPN.";
        status.innerText = "CONEXIÓN SEGURA";
        markCheck(1, 'wifi');
    }
}

// VPN
function toggleVPN() {
    const tunnel = document.getElementById('vpn-tunnel');
    const status = document.getElementById('vpn-text');
    const packets = document.querySelectorAll('.vpn-packet');
    const btn = document.querySelector('.vpn-btn');

    tunnel.style.background = "#00b894"; 
    tunnel.style.boxShadow = "0 0 15px #00b894";
    status.innerText = "ESTADO: CIFRADO";
    status.style.color = "#00b894";
    btn.innerText = "VPN ACTIVADA";
    btn.disabled = true;
    btn.style.opacity = "0.5";
    packets.forEach(p => p.style.background = "white");
    markCheck(2, 'vpn');
}

// NAVEGADOR
let isHttps = false;
function toggleHttps() {
    isHttps = !isHttps;
    const badge = document.getElementById('ssl-indicator');
    const url = document.getElementById('url-text');
    
    if (isHttps) {
        badge.className = 'ssl-badge ssl-secure';
        badge.innerText = 'SEGURO';
        url.innerText = 'https://banco-login-seguro.com';
    } else {
        badge.className = 'ssl-badge ssl-insecure';
        badge.innerText = 'NO SEGURO';
        url.innerText = 'http://banco-login-seguro.com';
    }
}

function checkDownload() {
    const feedback = document.getElementById('browser-feedback');
    if (isHttps) {
        feedback.style.color = '#d32f2f';
        feedback.innerHTML = "¡ALTO! Es HTTPS pero descargas un .exe.<br> Es Malware.";
        stepRequirements[4].completed = true; 
        updateNextButtonState();
    } else {
        feedback.style.color = '#d32f2f';
        feedback.innerHTML = "¡PELIGRO! Sitio no seguro y archivo sospechoso.";
    }
}

// API DE YOUTUBE ===
var player;
function onYouTubeIframeAPIReady() {
    player = new YT.Player('yt-player', {
        height: '315',
        width: '560',
        videoId: 'cjSNVxtXY-U', 
        playerVars: {
            'start': 11, 
            'rel': 0,
            'controls': 1 
        },
        events: {
            'onStateChange': onPlayerStateChange
        }
    });
}

function onPlayerStateChange(event) {
    if (event.data === 0) {
        stepRequirements[6].completed = true;
        updateNextButtonState();
        
        const status = document.getElementById('video-status');
        if(status) {
            status.innerHTML = '';
            status.style.color = "#2e7d32";
        }
    }
}

// PRIVACIDAD
function checkPrivacy() {
    const vis = document.getElementById('priv-vis').checked; 
    const geo = document.getElementById('priv-geo').checked; 
    const search = document.getElementById('priv-search').checked; 
    const feedback = document.getElementById('privacy-feedback');
    const req = stepRequirements[8];

    const togglesCorrect = (vis && !geo && !search);
    req.checks.toggles = togglesCorrect;

    if (togglesCorrect) {
        feedback.style.color = '#2e7d32';
        feedback.innerHTML = "¡Configuración de Privacidad Correcta!";
    } else {
        feedback.style.color = '#d32f2f';
        feedback.innerHTML = "RIESGO DETECTADO. Revisa la configuración.";
    }

    const allDone = req.checks.toggles && req.checks.tooltip;
    req.completed = allDone;
    
    updateNextButtonState();
}

// SIMULADOR PERFIL FALSO
function analyzeProfile(part, element) {
    const req = stepRequirements[9]; 
    const feedback = document.getElementById('profile-feedback');
    const countDisplay = document.getElementById('flags-count');

    if (req.items[part]) return;

    req.items[part] = true;
    req.found++;
    
    const badge = document.createElement("div");
    badge.className = "found-badge";
    badge.innerHTML = "✓";
    element.style.position = "relative"; 
    element.appendChild(badge);
    
    element.style.border = "2px solid #2e7d32";
    element.style.borderRadius = "5px";
    element.style.backgroundColor = "rgba(46, 125, 50, 0.1)";

    if(countDisplay) countDisplay.innerText = req.found;

    if (part === 'avatar') feedback.innerText = "¡Bien! Foto genérica o sin rostro real.";
    else if (part === 'stats') feedback.innerText = "¡Correcto! Pocos seguidores, sigue a muchos.";
    else if (part === 'link') feedback.innerText = "¡Exacto! Enlaces acortados o promesas de dinero fácil.";
    
    feedback.style.color = "#2e7d32";

    if (req.found >= 3) {
        req.completed = true;
        feedback.innerHTML = "¡EXCELENTE! Has identificado al Bot. Perfil denunciado.";
        const nextBtn = document.getElementById('nextBtn');
        if(nextBtn) {
            nextBtn.disabled = false;
            nextBtn.style.opacity = '1';
            nextBtn.style.cursor = 'pointer';
        }
        updateNextButtonState();
    }
}

// DISPOSITIVOS
function showDeviceInfo(type, card) {
    const step10Ids = ['info-lock', 'info-encrypt', 'info-update', 'info-find'];
    step10Ids.forEach(id => {
        const el = document.getElementById(id);
        if(el) el.style.display = 'none';
    });

    const target = document.getElementById('info-' + type);
    if(target) target.style.display = 'block';
    
    if (!card.classList.contains('visited')) {
        card.classList.add('visited');
        card.style.borderLeft = "4px solid #2196f3";
        stepRequirements[10].viewed++;
        
        if (stepRequirements[10].viewed === stepRequirements[10].target) {
            stepRequirements[10].completed = true;
            updateNextButtonState();
        }
    }
}

// PERMISOS DE APPS
function checkPermission(app, choice, btn) {
    const req = stepRequirements[11];
    const feedback = document.getElementById('perm-feedback');
    const countDisplay = document.getElementById('perm-count');
    
    if (req.items[app]) return;

    const correctAnswers = { 'flash': 'deny', 'maps': 'allow', 'calc': 'deny' };
    const parent = btn.closest('.perm-card');

    if (choice === correctAnswers[app]) {
        req.items[app] = true;
        req.solved++;
        
        parent.style.border = "2px solid #2e7d32";
        parent.style.background = "#e8f5e9";
        parent.innerHTML = `<div style="color:#2e7d32; font-weight:bold; width:100%; text-align:center;">✓ DECISIÓN CORRECTA</div>`;
        
        if(countDisplay) countDisplay.innerText = req.solved;

        if (req.solved === req.total) {
            req.completed = true;
            feedback.innerHTML = "¡EXCELENTE! Has evitado la fuga de datos.";
            feedback.style.color = "#2e7d32";
            updateNextButtonState();
        } else {
            feedback.innerHTML = "¡Bien! Sigue revisando...";
            feedback.style.color = "#2e7d32";
        }
    } else {
        btn.style.animation = "shake 0.5s";
        setTimeout(() => btn.style.animation = "", 500);
        feedback.innerHTML = "¡Error! Piénsalo: ¿Esa app realmente necesita eso para funcionar?";
        feedback.style.color = "#d32f2f";
    }
}

// PUZZLE
function allowDrop(ev) { ev.preventDefault(); if(ev.target.classList.contains('drop-zone')) ev.target.classList.add('dragover'); }
function drag(ev) { ev.dataTransfer.setData("text", ev.target.id); ev.dataTransfer.setData("type", ev.target.dataset.type); }
function drop(ev, zoneType) {
    ev.preventDefault();
    const dropTarget = ev.target.closest('.drop-zone');
    dropTarget.classList.remove('dragover');
    const dataId = ev.dataTransfer.getData("text");
    const dataType = ev.dataTransfer.getData("type");
    const element = document.getElementById(dataId);
    const feedback = document.getElementById('puzzle-feedback');

    if (dataType === zoneType) {
        dropTarget.appendChild(element);
        element.draggable = false;
        element.style.cursor = "default";
        element.style.background = "#c8e6c9";
        feedback.style.color = "#2e7d32";
        feedback.innerText = "¡Correcto!";
        stepRequirements[5].itemsSolved++;
        checkPuzzleCompletion();
    } else {
        feedback.style.color = "#d32f2f";
        feedback.innerText = "¡Incorrecto! Piénsalo bien e inténtalo de nuevo.";
        element.style.animation = "shake 0.5s";
        setTimeout(() => element.style.animation = "", 500);
    }
}
function checkPuzzleCompletion() {
    if (stepRequirements[5].itemsSolved === stepRequirements[5].itemsTotal) {
        stepRequirements[5].completed = true;
        document.getElementById('puzzle-feedback').innerText = "¡EXCELENTE! Has identificado todas las amenazas.";
        updateNextButtonState();
    }
}
const styleSheet = document.createElement("style");
styleSheet.innerText = `@keyframes shake { 0% { transform: translateX(0); } 25% { transform: translateX(-5px); } 50% { transform: translateX(5px); } 75% { transform: translateX(-5px); } 100% { transform: translateX(0); } }`;
document.head.appendChild(styleSheet);


function guardarProgresoTeoria(modulo) {
    const user = firebase.auth().currentUser;
    if(user) {
        firebase.firestore().collection('userScores').doc(user.uid).set({
            teoria: { [modulo]: true }
        }, { merge: true });
    }
}