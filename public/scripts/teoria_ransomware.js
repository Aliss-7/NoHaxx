let currentStep = 0;
const totalSteps = 18;
let stepUnlocked = new Array(totalSteps).fill(false);
stepUnlocked[0] = true;

const sectionsMapping = [0, 0, 1, 1, 1, 1, 2, 2, 2, 3, 3, 4, 4, 4, 4, 5, 5, 6];

// 2. VARIABLES YOUTUBE
var player;
var playerWannacry;

// 3. API YOUTUBE (Carga inicial)
function onYouTubeIframeAPIReady() {
    player = new YT.Player('player-ransomware', {
        height: '360', width: '100%', videoId: 'sd7Ns_ziBPY',
        events: { 
            'onStateChange': (e) => { 
                if (e.data === YT.PlayerState.ENDED) markInteraction(document.getElementById('video-container-3')); 
            } 
        }
    });
}

// 4. CONTROL DE INTERFAZ (UPDATE UI)
function updateUI() {
    document.querySelectorAll('.course-step').forEach((s, i) => s.classList.toggle('active', i === currentStep));
    
    const currentSec = sectionsMapping[currentStep];
    for(let i=0; i<=6; i++){
        const sec = document.getElementById(`section-${i}`);
        if(sec) sec.style.display = (i === currentSec) ? 'block' : 'none';
    }
    
    // Menú lateral
    document.querySelectorAll('.lms-menu-item').forEach((m, i) => {
        m.classList.toggle('active', i === currentSec);
        m.classList.toggle('unlocked', stepUnlocked[sectionsMapping.indexOf(i)]);
    });

    // Botones
    document.getElementById('prevBtn').style.visibility = (currentStep === 0) ? 'hidden' : 'visible';
    
    const isLast = currentStep === totalSteps - 1;
    const nextBtn = document.getElementById('nextBtn');
    const finishBtn = document.getElementById('finishBtn');

    if (isLast) {
        nextBtn.style.display = 'none';
        finishBtn.style.display = 'inline-block';
        finishBtn.textContent = "Ir al Examen";
        
        // Guardar progreso al llegar al final
        guardarProgresoTeoria('ransomware');
    } else {
        nextBtn.style.display = 'inline-block';
        finishBtn.style.display = 'none';
    }

    document.getElementById('bloqueo-msg').style.display = 'none';

    // LÓGICA DEL VÍDEO WANNACRY
    if (currentStep === 10 && !playerWannacry) {
        if(document.getElementById('player-wannacry')) {
            playerWannacry = new YT.Player('player-wannacry', {
                height: '360', width: '100%', videoId: 'ftbQx_hsJE8',
                events: { 
                    'onStateChange': (e) => { 
                        if (e.data === YT.PlayerState.ENDED) {
                            markInteraction(document.getElementById('video-container-wannacry'));
                        } 
                    } 
                }
            });
        }
    }
}

// 5. SISTEMA DE INTERACCIONES
function markInteraction(el) { 
    if(!el) return; 
    el.classList.add('viewed'); 
    document.getElementById('bloqueo-msg').style.display = 'none'; 
}

function tryNextStep() {
    const activeStep = document.querySelector('.course-step.active');
  
    const pending = activeStep.querySelectorAll('.required-interaction:not(.viewed)');
        
    if (pending.length === 0) {
        currentStep++;
        if(currentStep < totalSteps) stepUnlocked[currentStep] = true;
        updateUI();
        window.scrollTo(0,0);
    } else {
        document.getElementById('bloqueo-msg').style.display = 'block';
    }
}

function changeStep(n) { if(n<0 && currentStep > 0) { currentStep--; updateUI(); } }

function revelar(id, btn) { document.getElementById(id).style.display = "block"; markInteraction(btn); }
function toggleRecon(card) { card.classList.toggle('active'); markInteraction(card); }
    
let casosVistos = new Set(); 
function gestionarAcordeon(btn) {
    const parent = btn.parentElement;
    const todosLosPasos = document.querySelectorAll('.acordeon-item');
    if (!parent.classList.contains('active')) {
        todosLosPasos.forEach(item => item.classList.remove('active'));
    }
    parent.classList.toggle('active');
   
    const idCaso = btn.getAttribute('data-case');
    if(idCaso) {
        casosVistos.add(idCaso);
        if (casosVistos.size >= 3) {
            document.querySelectorAll('#step-9 .required-interaction').forEach(el => el.classList.add('viewed'));
            updateUI(); 
        }
    }
}

function toggleImpact(card) { 
    const body = card.querySelector('.impact-body');
    body.style.display = (body.style.display === 'none' || body.style.display === '') ? 'block' : 'none';
    card.classList.add('viewed-red'); 
    markInteraction(card); 
}

// --- SIMULACIÓN RANSOMWARE ---
function ejecutarAtaque(btn) {
    btn.disabled = true;
    document.getElementById('progress-area').style.display = "block";
    const fill = document.getElementById('enc-fill');
    const docView = document.getElementById('doc-view');
    const uiError = document.getElementById('ui-error');
    const hexGrid = document.getElementById('hex-grid');
    let p = 0;
    let int = setInterval(() => {
        p += 2; fill.style.width = p + "%";
        document.getElementById('enc-pct').innerText = "Cifrando: " + p + "%";
        hexGrid.innerText += " 0x" + Math.floor(Math.random()*256).toString(16).toUpperCase();
  
        if(p >= 30) docView.className = "ui-body ui-degrade-1";
        if(p >= 60) docView.className = "ui-body ui-degrade-2";
        if(p >= 90) docView.className = "ui-body ui-corrupted";

        if(p >= 100) {
            clearInterval(int);
            hexGrid.classList.add('glitch-code');
            uiError.style.display = "flex";
            document.getElementById('tech-note').style.display = "block";
            markInteraction(btn);
        }
    }, 50);
}

function animarRed(btn) {
    const ids = ['node-1', 'link-1', 'node-2', 'link-2', 'node-3'];
    ids.forEach((id, i) => setTimeout(() => {
        const el = document.getElementById(id);
        if(el) el.classList.add(id.includes('node') ? 'infected' : 'active');
        if(i === ids.length - 1) markInteraction(btn);
    }, i * 600));
}

// --- SIMULACIÓN MACROS ---
function openTab(evt, tabName) {
    let tabcontent = document.getElementsByClassName("tab-content");
    for (let i = 0; i < tabcontent.length; i++) tabcontent[i].style.display = "none";
    let tablinks = document.getElementsByClassName("tab-btn");
    for (let i = 0; i < tablinks.length; i++) tablinks[i].className = tablinks[i].className.replace(" active", "");
    document.getElementById(tabName).style.display = "block";
    evt.currentTarget.className += " active";
}

function activarTrampa(btn) {
    const bar = document.getElementById('macro-bar');
    bar.style.background = '#f44336';
    bar.style.color = 'white';
    bar.innerHTML = '<span>❌ DESCARGANDO MALWARE... 100%</span>';
    document.querySelector('.blurred-text').style.filter = 'none';
    document.getElementById('macro-feedback').style.display = 'block';
    markInteraction(btn);
}

// --- SIMULACIÓN WINDOWS ---
function showContextMenu(e) { 
    const menu = document.getElementById('context-menu');
    menu.style.display = 'block'; menu.style.left = e.offsetX + 'px'; menu.style.top = e.offsetY + 'px';
}
function openProperties() { 
    document.getElementById('context-menu').style.display = 'none'; 
    document.getElementById('properties-window').style.display = 'block'; 
}
function closeProperties() { document.getElementById('properties-window').style.display = 'none'; }
    
let propiedadesVistas = false;
function habilitarEjecucion() { 
    propiedadesVistas = true; closeProperties(); 
    document.getElementById('instruccion-final').style.display = 'block'; 
    document.getElementById('target-file').onclick = () => document.getElementById('infection-popup').style.display = 'block';
}
function intentarEjecutarAntesDeTiempo() { if(!propiedadesVistas) alert("⚠️ Haz clic derecho y mira las propiedades primero."); }
function finalizarTodo(btn) { 
    document.getElementById('infection-popup').style.display = 'none'; 
    markInteraction(btn); 
}

// --- CRISIS PRÁCTICA ---
let crisisPracticaIniciada = false;
function iniciarPracticaCrisis(btn) {
    if (!crisisPracticaIniciada) {
    document.getElementById('crisis-sim-container').style.display = 'block';
    document.getElementById('ransomware-alert-icon').style.display = 'block';
    btn.style.display = 'none'; 
    crisisPracticaIniciada = true;
    markInteraction(btn);
    }
}

function toggleWifiMenu() {
    const wifiMenu = document.getElementById('wifi-menu');
    wifiMenu.style.display = (wifiMenu.style.display === 'none' || wifiMenu.style.display === '') ? 'block' : 'none';
    markInteraction(document.getElementById('wifi-icon-wrapper'));
}

function desconectarWifi(btn) {
    const wifiStatus = document.getElementById('wifi-status');
    const wifiIcon = document.getElementById('wifi-icon');
    const crisisSuccess = document.getElementById('crisis-success-message');
    
    if (wifiStatus.innerText === 'Activado') {
    wifiStatus.innerText = 'Desactivado';
    btn.querySelector('span:last-child').style.color = 'red';
    btn.querySelector('span:last-child').innerText = '🔴';
    wifiIcon.innerText = '🚫';
    document.getElementById('wifi-menu').style.display = 'none';
    crisisSuccess.style.display = 'block';

    markInteraction(btn);
    updateUI(); 
    }
}

// Inicialización
document.addEventListener('click', (e) => { 
    if(!e.target.classList.contains('menu-item')) document.getElementById('context-menu').style.display = 'none'; 
});
window.onload = updateUI;

function guardarProgresoTeoria(modulo) {
    const user = firebase.auth().currentUser;
    if(user) {
        firebase.firestore().collection('userScores').doc(user.uid).set({
            teoria: { [modulo]: true }
        }, { merge: true }).then(() => {
        });
    }
}