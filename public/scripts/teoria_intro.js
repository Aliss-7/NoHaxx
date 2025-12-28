// Configuración Inicial 
let currentStep = 0;
const totalSteps = 7;
let stepUnlocked = new Array(totalSteps).fill(false);
stepUnlocked[0] = true;

const steps = document.querySelectorAll('.course-step');
const menuItems = document.querySelectorAll('.lms-menu-item');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const finishBtn = document.getElementById('finishBtn');
const bloqueoMsg = document.getElementById('bloqueo-msg');

// UI - Se encarga de refrescar el estado de los botones y menús
function updateUI() {
    const isStepComplete = checkCurrentStepCompletion();

    steps.forEach((step, index) => {
        step.classList.remove('active');
        menuItems[index].classList.remove('active', 'completed', 'unlocked');
        menuItems[index].onclick = null;

        if (index === currentStep) {
            step.classList.add('active');
            menuItems[index].classList.add('active', 'unlocked');
        } else if (index < currentStep || stepUnlocked[index]) {
            menuItems[index].classList.add('unlocked', 'completed');
            menuItems[index].onclick = () => goToStep(index);
        }
    });

    // Control de visibilidad de botón Anterior
    prevBtn.style.visibility = (currentStep === 0) ? 'hidden' : 'visible';

    // Lógica para el botón Siguiente / Finalizar
    if (currentStep === totalSteps - 1) {
        nextBtn.style.display = 'none';
        finishBtn.style.display = 'inline-block';

        if (isStepComplete) {
            finishBtn.style.opacity = '1';
            finishBtn.style.pointerEvents = 'auto';
            finishBtn.textContent = "Ir al Examen";
            guardarProgresoTeoria('introduccion');
        } else {
            finishBtn.style.opacity = '0.5';
            finishBtn.style.pointerEvents = 'none';
            finishBtn.textContent = "Completa el contenido";
        }
    } else {
        nextBtn.style.display = 'inline-block';
        finishBtn.style.display = 'none';

        // COMPORTAMIENTO DE BLOQUEO VISUAL (Sombreado y Desactivado)
        if (isStepComplete) {
            nextBtn.disabled = false;
            nextBtn.style.opacity = "1";
            nextBtn.style.cursor = "pointer";
        } else {
            nextBtn.disabled = true;
            nextBtn.style.opacity = "0.5";
            nextBtn.style.cursor = "not-allowed";
        }
    }

    if (isStepComplete) bloqueoMsg.style.display = 'none';
}

function goToStep(n) {
    pauseAllVideos();
    if (n >= 0 && n < totalSteps && stepUnlocked[n]) {
        currentStep = n;
        updateUI();
    }
}

function changeStep(n) {
    pauseAllVideos();
    if (n < 0) {
        currentStep += n;
        if (currentStep < 0) currentStep = 0;
        updateUI();
    }
}

function pauseAllVideos() {
    if (typeof playerFinal !== "undefined" && playerFinal.pauseVideo) playerFinal.pauseVideo();
    if (typeof playerThreats !== "undefined" && playerThreats.pauseVideo) playerThreats.pauseVideo();
}

// Validaciones
function tryNextStep() {
    if (checkCurrentStepCompletion()) {
        stepUnlocked[currentStep + 1] = true;
        currentStep++;
        updateUI();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
        bloqueoMsg.textContent = "⚠️ Debes revisar todo el contenido antes de continuar.";
        bloqueoMsg.style.display = "block";
        nextBtn.classList.add('shake');
        setTimeout(() => nextBtn.classList.remove('shake'), 500);
    }
}

function checkCurrentStepCompletion() {
    const currentDiv = document.getElementById(`step-${currentStep}`);
    if (!currentDiv) return true;

    // Verificar interacciones requeridas (clase required-interaction)
    const pendingItems = currentDiv.querySelectorAll('.required-interaction:not(.viewed)');
    if (pendingItems.length > 0) return false;

    // Verificar vídeos específicos si el paso los contiene
    if (currentStep === 5) { // Paso del vídeo de amenazas
        const videoThreats = document.getElementById('video-amenazas-container');
        if (videoThreats && !videoThreats.classList.contains('viewed')) return false;
    }
    
    if (currentStep === 6) { // Paso del vídeo final
        const videoFinal = document.getElementById('video-container-final');
        if (videoFinal && !videoFinal.classList.contains('viewed')) return false;
    }

    return true;
}

// Interacciones - Todas llaman a updateUI() para refrescar el botón en tiempo real
function markInteraction(element) {
    if (!element.classList.contains('viewed')) {
        element.classList.add('viewed');
        updateUI();
    }
}

function revelar(id, boton) {
    const bloque = document.getElementById(id);
    bloque.style.display = "block";
    boton.style.display = "none";
    boton.classList.add('viewed');
    updateUI();
    setTimeout(() => bloque.scrollIntoView({ behavior: "smooth", block: "center" }), 100);
}

function genericCardCheck(el) {
    const p = el.querySelector('p');
    if (p) p.style.display = 'block';

    if (!el.classList.contains('viewed')) {
        el.classList.add('viewed');
        if (el.classList.contains('cia-card') || el.classList.contains('threat-card') || el.classList.contains('interactive-item')) {
            el.style.backgroundColor = "#e8f5e9";
            el.style.borderColor = "#4caf50";
        }
        updateUI();
    }
}

function checkCIA(el) { genericCardCheck(el); }
function checkThreat(el) { genericCardCheck(el); }
function checkODS(el) {
    const detail = el.querySelector('.ods-detail');
    if (detail) detail.style.display = 'block';
    genericCardCheck(el);
}

function markCard(el) {
    const desc = el.querySelector('.threat-desc');
    if (desc) desc.style.display = 'block';

    if (!el.classList.contains('viewed')) {
        el.classList.add('viewed');
        el.style.backgroundColor = "#e8f5e9";
        el.style.borderColor = "#4caf50";

        const parentGrid = el.parentElement;
        if (parentGrid && parentGrid.classList.contains('threat-grid')) {
            const totalCards = parentGrid.querySelectorAll('.threat-card').length;
            const viewedCards = parentGrid.querySelectorAll('.threat-card.viewed').length;

            if (totalCards === viewedCards) {
                const videoContainer = document.getElementById('video-amenazas-container');
                videoContainer.style.display = 'block';
                setTimeout(() => videoContainer.scrollIntoView({ behavior: "smooth", block: "center" }), 300);
            }
        }
        updateUI();
    }
}

function toggleCheck(el) {
    const input = el.querySelector('input');
    if (!el.classList.contains('viewed')) {
        if (input) input.checked = true;
        el.classList.add('viewed');
        el.style.backgroundColor = "#e8f5e9";
        updateUI();
    }
}

// YOUTUBE API 
var playerFinal;
var playerThreats;

function onYouTubeIframeAPIReady() {
    playerFinal = new YT.Player('player', {
        videoId: '6pfBS8Qy_UI',
        events: { 'onStateChange': onFinalStateChange }
    });

    playerThreats = new YT.Player('player-amenazas', {
        videoId: 'iV6yNj8N1Ko',
        events: { 'onStateChange': onThreatsStateChange }
    });
}

function onFinalStateChange(event) {
    if (event.data === YT.PlayerState.PLAYING || event.data === YT.PlayerState.ENDED) {
        const container = document.getElementById('video-container-final');
        if (container && !container.classList.contains('viewed')) {
            container.classList.add('viewed');
            updateUI();
        }
    }
}

function onThreatsStateChange(event) {
    if (event.data === YT.PlayerState.PLAYING || event.data === YT.PlayerState.ENDED) {
        const container = document.getElementById('video-amenazas-container');
        if (container && !container.classList.contains('viewed')) {
            container.classList.add('viewed');
            updateUI();
        }
    }
}

// LÓGICA DEL PUZZLE
let selectedPuzzleItem = null;

function handlePuzzleClick(el) {
    if (el.classList.contains('solved')) return;

    if (selectedPuzzleItem === el) {
        el.classList.remove('selected');
        selectedPuzzleItem = null;
        return;
    }

    if (!selectedPuzzleItem) {
        selectedPuzzleItem = el;
        el.classList.add('selected');
        return;
    }

    if (selectedPuzzleItem.parentElement === el.parentElement) {
        selectedPuzzleItem.classList.remove('selected');
        selectedPuzzleItem = el;
        el.classList.add('selected');
        return;
    }

    if (selectedPuzzleItem.getAttribute('data-id') === el.getAttribute('data-id')) {
        successMatch(selectedPuzzleItem, el); 
    } else {
        errorMatch(selectedPuzzleItem, el);
    }
}

function successMatch(item1, item2) {
    item1.classList.remove('selected'); item2.classList.remove('selected');
    item1.classList.add('solved');      item2.classList.add('solved');
    
    if(item1.classList.contains('required-interaction')) item1.classList.add('viewed');
    if(item2.classList.contains('required-interaction')) item2.classList.add('viewed');

    selectedPuzzleItem = null;
    document.getElementById('puzzle-feedback').innerText = "✅ ¡Correcto!";
    document.getElementById('puzzle-feedback').style.color = "green";
    updateUI();
}

function errorMatch(item1, item2) {
    item1.classList.add('error'); item2.classList.add('error');
    document.getElementById('puzzle-feedback').innerText = "❌ No coinciden.";
    document.getElementById('puzzle-feedback').style.color = "red";
    setTimeout(() => {
        item1.classList.remove('error'); item2.classList.remove('error');
        item1.classList.remove('selected'); item2.classList.remove('selected');
        selectedPuzzleItem = null;
    }, 500);
}

function guardarProgresoTeoria(modulo) {
    const user = firebase.auth().currentUser;
    if(user) {
        firebase.firestore().collection('userScores').doc(user.uid).set({
            teoria: { [modulo]: true }
        }, { merge: true }).then(() => {
            console.log(`Teoría de ${modulo} completada y guardada.`);
        });
    }
}

// Inicializar la primera vista
updateUI();