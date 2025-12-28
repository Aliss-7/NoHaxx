let currentStep = 0;
const totalSteps = 18;
let stepUnlocked = new Array(totalSteps).fill(false);
stepUnlocked[0] = true;

const sectionsMapping = [0, 0, 1, 1, 1, 1, 2, 2, 2, 3, 3, 4, 4, 4, 4, 5, 5, 6];

// 2. VARIABLES YOUTUBE
var player;
var playerWannacry;
var videoStatus = { ransomware: false, wannacry: false };

// 3. API YOUTUBE
function onYouTubeIframeAPIReady() {
    player = new YT.Player('player-ransomware', {
        height: '360', width: '100%', videoId: 'sd7Ns_ziBPY',
        events: { 
            'onStateChange': (e) => { 
                if (e.data === YT.PlayerState.ENDED) {
                    videoStatus.ransomware = true;
                    const vCont = document.getElementById('video-container-3');
                    if(vCont) vCont.classList.add('viewed');
                    updateUI(); 
                } 
            } 
        }
    });
}

// 4. CONTROL DE INTERFAZ (UPDATE UI)
function updateUI() {
    const isStepComplete = checkCurrentStepCompletion();

    // Actualizar pasos
    document.querySelectorAll('.course-step').forEach((s, i) => {
        s.classList.toggle('active', i === currentStep);
    });
    
    // Mostrar/Ocultar Secciones
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

    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const finishBtn = document.getElementById('finishBtn');
    const bloqueoMsg = document.getElementById('bloqueo-msg');

    if(prevBtn) prevBtn.style.visibility = (currentStep === 0) ? 'hidden' : 'visible';
    
    const isLast = currentStep === totalSteps - 1;

    if (isLast) {
        if(nextBtn) nextBtn.style.display = 'none';
        if(finishBtn) {
            finishBtn.style.display = 'inline-block';
            if (isStepComplete) {
                finishBtn.style.opacity = '1';
                finishBtn.style.pointerEvents = 'auto';
                finishBtn.textContent = "Ir al Examen";
                guardarProgresoTeoria('ransomware');
            } else {
                finishBtn.style.opacity = '0.5';
                finishBtn.style.pointerEvents = 'none';
                finishBtn.textContent = "Completa el contenido";
            }
        }
    } else {
        if(nextBtn) {
            nextBtn.style.display = 'inline-block';
            // BLOQUEO VISUAL
            if (isStepComplete) {
                nextBtn.disabled = false;
                nextBtn.style.opacity = "1";
                nextBtn.style.cursor = "pointer";
                if(bloqueoMsg) bloqueoMsg.style.display = 'none';
            } else {
                nextBtn.disabled = true;
                nextBtn.style.opacity = "0.5";
                nextBtn.style.cursor = "not-allowed";
            }
        }
        if(finishBtn) finishBtn.style.display = 'none';
    }

    // Video Wannacry (Paso 10)
    if (currentStep === 10 && !playerWannacry) {
        const container = document.getElementById('player-wannacry');
        if(container) {
            playerWannacry = new YT.Player('player-wannacry', {
                height: '360', width: '100%', videoId: 'ftbQx_hsJE8',
                events: { 
                    'onStateChange': (e) => { 
                        if (e.data === YT.PlayerState.ENDED) {
                            videoStatus.wannacry = true;
                            const vWanna = document.getElementById('video-container-wannacry');
                            if(vWanna) vWanna.classList.add('viewed');
                            updateUI();
                        } 
                    } 
                }
            });
        }
    }
}

// 5. SISTEMA DE INTERACCIONES
function checkCurrentStepCompletion() {
    const activeStep = document.getElementById(`step-${currentStep}`);
    if (!activeStep) return true;

    const pending = activeStep.querySelectorAll('.required-interaction:not(.viewed)');
    if (pending.length > 0) return false;

    if (currentStep === 3 && !videoStatus.ransomware) return false;
    if (currentStep === 10 && !videoStatus.wannacry) return false;

    return true;
}

function markInteraction(el) { 
    if(!el) return; 
    el.classList.add('viewed'); 
    updateUI(); 
}

function tryNextStep() {
    if (checkCurrentStepCompletion()) {
        currentStep++;
        if(currentStep < totalSteps) stepUnlocked[currentStep] = true;
        updateUI();
        window.scrollTo({top: 0, behavior: 'smooth'});
    } else {
        const msg = document.getElementById('bloqueo-msg');
        if(msg) {
            msg.textContent = "⚠️ Completa la interacción para continuar.";
            msg.style.display = 'block';
        }
    }
}

// --- TODAS TUS FUNCIONES ORIGINALES RECUPERADAS ---

function revelar(id, btn) { 
    const target = document.getElementById(id);
    if(target) target.style.display = "block"; 
    markInteraction(btn); 
}

function toggleRecon(card) { 
    card.classList.toggle('active'); 
    markInteraction(card); 
}

let casosVistos = new Set(); 
function gestionarAcordeon(btn) {
    const parent = btn.parentElement;
    if (!parent.classList.contains('active')) {
        document.querySelectorAll('.acordeon-item').forEach(item => item.classList.remove('active'));
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
    if(body) body.style.display = (body.style.display === 'none' || body.style.display === '') ? 'block' : 'none';
    card.classList.add('viewed-red'); 
    markInteraction(card); 
}

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

// --- LÓGICA DE MACROS (EXCEL) ---
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
    if(bar) {
        bar.style.background = '#f44336';
        bar.style.color = 'white';
        bar.innerHTML = '<span>❌ DESCARGANDO MALWARE... 100%</span>';
    }
    const blurred = document.querySelector('.blurred-text');
    if(blurred) blurred.style.filter = 'none';
    const feedback = document.getElementById('macro-feedback');
    if(feedback) feedback.style.display = 'block';
    markInteraction(btn);
}

// --- LÓGICA DE CLIC DERECHO ---
function showContextMenu(e) { 
    e.preventDefault();
    const menu = document.getElementById('context-menu');
    if(menu) {
        menu.style.display = 'block'; 
        menu.style.left = e.offsetX + 'px'; 
        menu.style.top = e.offsetY + 'px';
    }
}

function openProperties() { 
    const menu = document.getElementById('context-menu');
    const props = document.getElementById('properties-window');
    if(menu) menu.style.display = 'none'; 
    if(props) props.style.display = 'block'; 
}

function closeProperties() { 
    const props = document.getElementById('properties-window');
    if(props) props.style.display = 'none'; 
}

let propiedadesVistas = false;
function habilitarEjecucion() { 
    propiedadesVistas = true; 
    closeProperties(); 
    const inst = document.getElementById('instruccion-final');
    if(inst) inst.style.display = 'block'; 
    const target = document.getElementById('target-file');
    if(target) target.onclick = () => {
        const popup = document.getElementById('infection-popup');
        if(popup) popup.style.display = 'block';
    };
}

function intentarEjecutarAntesDeTiempo() { 
    if(!propiedadesVistas) alert("⚠️ Haz clic derecho y mira las propiedades primero para ver la extensión real."); 
}

function finalizarTodo(btn) { 
    const popup = document.getElementById('infection-popup');
    if(popup) popup.style.display = 'none'; 
    markInteraction(btn); 
}

// --- CRISIS PRÁCTICA ---
function iniciarPracticaCrisis(btn) {
    const container = document.getElementById('crisis-sim-container');
    const icon = document.getElementById('ransomware-alert-icon');
    if(container) container.style.display = 'block';
    if(icon) icon.style.display = 'block';
    btn.style.display = 'none'; 
    markInteraction(btn);
}

function toggleWifiMenu() {
    const wifiMenu = document.getElementById('wifi-menu');
    if(wifiMenu) wifiMenu.style.display = (wifiMenu.style.display === 'none' || wifiMenu.style.display === '') ? 'block' : 'none';
    markInteraction(document.getElementById('wifi-icon-wrapper'));
}

function desconectarWifi(btn) {
    const wifiStatus = document.getElementById('wifi-status');
    if (wifiStatus && wifiStatus.innerText === 'Activado') {
        wifiStatus.innerText = 'Desactivado';
        const span = btn.querySelector('span:last-child');
        if(span) span.innerText = '🔴';
        const icon = document.getElementById('wifi-icon');
        if(icon) icon.innerText = '🚫';
        document.getElementById('wifi-menu').style.display = 'none';
        const success = document.getElementById('crisis-success-message');
        if(success) success.style.display = 'block';
        markInteraction(btn);
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

document.addEventListener('click', (e) => { 
    const menu = document.getElementById('context-menu');
    if(menu && !e.target.classList.contains('menu-item')) menu.style.display = 'none'; 
});

function changeStep(n) { if(n<0 && currentStep > 0) { currentStep--; updateUI(); } }

window.onload = updateUI;