/* =========================================================================
   CONTROL DE PROGRESO (MÓDULO 6 - 10 PASOS)
   ========================================================================= */
const stepRequirements = {
    0: { completed: true },
    1: { type: 'mixed', checks: { wifi: false, tooltip: false }, completed: false },
    2: { type: 'mixed', checks: { vpn: false, tooltip: false }, completed: false },
    3: { type: 'mixed', checks: { proto: false, domain: false, path: false }, completed: false },
    4: { type: 'browser', completed: false },
    5: { type: 'puzzle', itemsTotal: 7, itemsSolved: 0, completed: false },
    
    // NUEVO PASO 6: INTRODUCCIÓN HUELLA DIGITAL (Solo lectura)
    6: { completed: true },

    // PASOS DESPLAZADOS
    7: { type: 'privacy', completed: false }, // Antes era 6
    8: { type: 'cards', viewed: 0, target: 4, completed: false }, // Antes era 7
    9: { type: 'finish', completed: true }  // Antes era 8
};

/* =========================================================================
   NAVEGACIÓN BASE
   ========================================================================= */
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

    // Actualizar Menú Lateral (Ajustado para nuevos índices)
    let activeMenu = 0;
    if (index <= 2) activeMenu = 0;       // 1. Redes Públicas
    else if (index <= 5) activeMenu = 1;  // 2. Navegación Web
    else if (index <= 7) activeMenu = 2;  // 3. Redes Sociales (Ahora incluye 6 y 7)
    else if (index === 8) activeMenu = 3; // 4. Dispositivos
    else activeMenu = 4;                  // 5. Síntesis

    document.querySelectorAll('.lms-menu-item').forEach((item, i) => {
        item.classList.remove('active');
        if (i === activeMenu) item.classList.add('active');
        if (i <= activeMenu) item.classList.add('unlocked');
    });

    document.getElementById('prevBtn').disabled = (index === 0);
    document.getElementById('nextBtn').style.display = (index === totalSteps - 1) ? 'none' : 'inline-block';
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
        }
    }
}

if(steps.length > 0) showStep(0);


/* =========================================================================
   INTERACCIONES
   ========================================================================= */

// PASO 1: WI-FI
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

// PASO 2: VPN
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

// PASO 4: NAVEGADOR
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

// PASO 7 (ANTES 6): PRIVACIDAD
function checkPrivacy() {
    const vis = document.getElementById('priv-vis').checked; 
    const geo = document.getElementById('priv-geo').checked; 
    const search = document.getElementById('priv-search').checked; 
    const feedback = document.getElementById('privacy-feedback');

    if (vis && !geo && !search) {
        feedback.style.color = '#2e7d32';
        feedback.innerHTML = "¡EXCELENTE! Perfil privado.";
        // Actualizado a índice 7
        stepRequirements[7].completed = true;
        updateNextButtonState();
    } else {
        feedback.style.color = '#d32f2f';
        feedback.innerHTML = "RIESGO DETECTADO.";
    }
}

// PASO 8 (ANTES 7): DISPOSITIVOS
function showDeviceInfo(type, card) {
    document.querySelectorAll('.info-box').forEach(div => div.style.display = 'none');
    document.getElementById('info-' + type).style.display = 'block';
    
    if (!card.classList.contains('visited')) {
        card.classList.add('visited');
        card.style.borderLeft = "4px solid #2196f3";
        // Actualizado a índice 8
        stepRequirements[8].viewed++;
        
        if (stepRequirements[8].viewed === stepRequirements[8].target) {
            stepRequirements[8].completed = true;
            updateNextButtonState();
        }
    }
}

/* =========================================================================
   LÓGICA DEL PUZZLE (PASO 5)
   ========================================================================= */

function allowDrop(ev) {
    ev.preventDefault();
    if(ev.target.classList.contains('drop-zone')) {
        ev.target.classList.add('dragover');
    }
}

function drag(ev) {
    ev.dataTransfer.setData("text", ev.target.id);
    ev.dataTransfer.setData("type", ev.target.dataset.type);
}

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
styleSheet.innerText = `
@keyframes shake {
  0% { transform: translateX(0); }
  25% { transform: translateX(-5px); }
  50% { transform: translateX(5px); }
  75% { transform: translateX(-5px); }
  100% { transform: translateX(0); }
}`;
document.head.appendChild(styleSheet);