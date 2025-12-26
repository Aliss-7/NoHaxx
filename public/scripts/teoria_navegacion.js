/* =========================================================================
   CONTROL DE PROGRESO (MÓDULO 6 - 7 PASOS)
   ========================================================================= */
const stepRequirements = {
    0: { completed: true },                 // Intro (Texto)
    1: { type: 'wifi', completed: false },  // Wifi Sim
    2: { type: 'vpn', completed: false },   // NUEVO: VPN
    3: { type: 'browser', completed: false }, // Browser Sim
    4: { type: 'privacy', completed: false }, // Privacy Sim
    5: { type: 'cards', viewed: 0, target: 4, completed: false }, // Cards
    6: { type: 'finish', completed: true }  // Síntesis
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

    // Actualizar Menú Lateral (Agrupando 0,1,2 en el primer ítem)
    let activeMenu = 0;
    if (index <= 2) activeMenu = 0; // Pasos 0,1,2 -> "Redes Públicas"
    else if (index === 3) activeMenu = 1;
    else if (index === 4) activeMenu = 2;
    else if (index === 5) activeMenu = 3;
    else activeMenu = 4;

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
        alert("Completa la actividad interactiva para continuar.");
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
        
        stepRequirements[1].completed = true;
        updateNextButtonState();
    }
}

// PASO 2: VPN (NUEVO)
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

    stepRequirements[2].completed = true;
    updateNextButtonState();
}

// PASO 3: NAVEGADOR
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
        feedback.innerHTML = "¡ALTO! Es HTTPS pero descargas un .exe. Es Malware.";
        stepRequirements[3].completed = true;
        updateNextButtonState();
    } else {
        feedback.style.color = '#d32f2f';
        feedback.innerHTML = "¡PELIGRO! Sitio no seguro y archivo sospechoso.";
    }
}

// PASO 4: PRIVACIDAD
function checkPrivacy() {
    const vis = document.getElementById('priv-vis').checked; 
    const geo = document.getElementById('priv-geo').checked; 
    const search = document.getElementById('priv-search').checked; 
    const feedback = document.getElementById('privacy-feedback');

    if (vis && !geo && !search) {
        feedback.style.color = '#2e7d32';
        feedback.innerHTML = "¡EXCELENTE! Perfil privado.";
        stepRequirements[4].completed = true;
        updateNextButtonState();
    } else {
        feedback.style.color = '#d32f2f';
        feedback.innerHTML = "RIESGO DETECTADO.";
    }
}

// PASO 5: DISPOSITIVOS
function showDeviceInfo(type, card) {
    document.querySelectorAll('.info-box').forEach(div => div.style.display = 'none');
    document.getElementById('info-' + type).style.display = 'block';
    
    if (!card.classList.contains('visited')) {
        card.classList.add('visited');
        card.style.borderLeft = "4px solid #2196f3";
        stepRequirements[5].viewed++;
        
        if (stepRequirements[5].viewed === stepRequirements[5].target) {
            stepRequirements[5].completed = true;
            updateNextButtonState();
        }
    }
}