/* =========================================================================
   CONTROL DE PROGRESO Y BLOQUEO
   ========================================================================= */
// Estado de cada paso que requiere interacción obligatoria
const stepRequirements = {
    2: { type: 'video', completed: false }, // Video 1
    4: { type: 'trash', count: 0, target: 3, completed: false }, // Juego Basura
    5: { type: 'video', completed: false }, // Video 2
    7: { type: 'osint', count: 0, target: 3, completed: false }, // Juego OSINT
    10: { type: 'puzzle', matches: 0, target: 4, completed: false }, // Puzzle (4 pares)
    11: { type: 'scenario', answered: 0, target: 2, completed: false } // Escenarios (2 casos)
};

function updateNextButtonState() {
    const nextBtn = document.getElementById('nextBtn');
    const req = stepRequirements[currentStep];

    if (req && !req.completed) {
        nextBtn.disabled = true;
        nextBtn.style.opacity = '0.5';
        nextBtn.style.cursor = 'not-allowed';
        nextBtn.title = "Completa la actividad o ve el vídeo para continuar";
    } else {
        nextBtn.disabled = false;
        nextBtn.style.opacity = '1';
        nextBtn.style.cursor = 'pointer';
        nextBtn.title = "";
    }
}

/* =========================================================================
   CARGA DE VÍDEOS YOUTUBE (CON DETECCIÓN DE FIN)
   ========================================================================= */
var player1, player2;

function onYouTubeIframeAPIReady() {
    player1 = new YT.Player('player-ing-social', {
        height: '315',
        width: '100%',
        videoId: 'SSjdJgINu2E', 
        events: {
            'onStateChange': onPlayerStateChange1
        }
    });

    player2 = new YT.Player('player-extra-video', {
        height: '315',
        width: '100%',
        videoId: 'j-tFoYNHi1w', 
        events: {
            'onStateChange': onPlayerStateChange2
        }
    });
}

function onPlayerStateChange1(event) {
    if (event.data === YT.PlayerState.ENDED) {
        stepRequirements[2].completed = true;
        updateNextButtonState();
    }
}

function onPlayerStateChange2(event) {
    if (event.data === YT.PlayerState.ENDED) {
        stepRequirements[5].completed = true;
        updateNextButtonState();
    }
}

/* =========================================================================
   NAVEGACIÓN (15 Pasos)
   ========================================================================= */
let currentStep = 0;
const steps = document.querySelectorAll('.course-step');
const totalSteps = steps.length;

// Variables de estado local para los juegos (se sincronizan con stepRequirements)
let foundTrashItems = 0;
let foundOsintItems = 0;
let selectedLeft = null;
let selectedRight = null;

function showStep(index) {
    steps.forEach((step, i) => {
        step.classList.remove('active');
        if (i === index) {
            step.classList.add('active');
            window.scrollTo(0, 0);
        }
    });

    currentStep = index; // Actualizar variable global
    updateNextButtonState(); // Verificar si se bloquea

    // Lógica del Menú
    let activeMenu = 0;
    if (index <= 2) activeMenu = 0;
    else if (index <= 5) activeMenu = 1;
    else if (index <= 7) activeMenu = 2;
    else if (index <= 10) activeMenu = 3;
    else if (index <= 11) activeMenu = 4;
    else if (index <= 13) activeMenu = 5;
    else activeMenu = 6;

    document.querySelectorAll('.lms-menu-item').forEach((item, i) => {
        item.classList.remove('active');
        if (i === activeMenu) item.classList.add('active');
        if (i <= activeMenu) item.classList.add('unlocked');
    });

    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    
    prevBtn.disabled = (index === 0);
    
    if (index === totalSteps - 1) {
        nextBtn.style.display = 'none';
    } else {
        nextBtn.style.display = 'inline-block';
    }
}

function changeStep(n) {
    if (n === -1 && currentStep > 0) {
        showStep(currentStep - 1);
    } 
}

function tryNextStep() {
    // Doble verificación de bloqueo
    const req = stepRequirements[currentStep];
    if (req && !req.completed) {
        alert("Por favor, completa la actividad o visualiza el vídeo completo para continuar.");
        return;
    }

    if (currentStep < totalSteps - 1) {
        showStep(currentStep + 1);
    }
}

if(steps.length > 0) showStep(0);


/* --- INTERACCIONES --- */

function revelar(id, btn) {
    const el = document.getElementById(id);
    if (el) {
        el.style.display = 'block';
        el.style.animation = 'fadeIn 0.5s';
        if(btn) btn.style.display = 'none';
    }
}

function showCycleInfo(num, element) {
    document.querySelectorAll('.cycle-step').forEach(el => el.classList.remove('active'));
    document.querySelectorAll('.cycle-info').forEach(info => info.style.display = 'none');
    element.classList.add('active');
    document.getElementById(`cycle-${num}-info`).style.display = 'block';
}

function showTechInfo(type, card) {
    document.querySelectorAll('.tech-info').forEach(div => div.style.display = 'none');
    document.querySelectorAll('.tech-card').forEach(c => c.classList.remove('active'));
    
    const infoDiv = document.getElementById('info-' + type);
    if (infoDiv) {
        infoDiv.style.display = 'block';
        infoDiv.style.animation = 'fadeIn 0.5s';
    }
    card.classList.add('active');
}

// EJERCICIO BASURA (Paso 4)
function checkTrash(type, element) {
    if (element.classList.contains('safe') || element.classList.contains('danger')) return; 

    const feedback = document.getElementById('trash-feedback');
    feedback.style.display = 'block';

    if (type === 'factura' || type === 'postit' || type === 'organigrama') {
        element.classList.add('danger');
        element.innerHTML += ' <i class="fas fa-exclamation-triangle"></i>';
        
        stepRequirements[4].count++;
        
        if (stepRequirements[4].count === stepRequirements[4].target) {
            feedback.style.backgroundColor = '#e8f5e9';
            feedback.style.color = '#2e7d32';
            feedback.innerHTML = "<strong>¡Excelente!</strong> Has encontrado los 3 riesgos.";
            stepRequirements[4].completed = true;
            updateNextButtonState();
        } else {
            feedback.innerHTML = `Bien, es un riesgo. Faltan ${stepRequirements[4].target - stepRequirements[4].count}.`;
            feedback.style.color = '#333';
        }
    } else {
        element.classList.add('safe');
        feedback.innerHTML = "Eso es basura normal. Busca datos confidenciales.";
        feedback.style.color = '#666';
    }
}

// EJERCICIO OSINT (Paso 7)
function checkOsintRisk(id, element) {
    if (element.classList.contains('found')) return;

    element.classList.add('found');
    stepRequirements[7].count++;
    document.getElementById('osint-count').innerText = stepRequirements[7].count;
    
    const feedback = document.getElementById('osint-feedback-box');
    feedback.style.display = 'block';

    let msg = "";
    if (id === 1) msg = "¡Bien visto! <strong>Tarjeta de Acceso visible:</strong> Riesgo de clonación.";
    if (id === 2) msg = "¡Correcto! <strong>Post-it con contraseña:</strong> Clásico error.";
    if (id === 3) msg = "¡Exacto! <strong>Información en pantalla:</strong> Bloquea siempre tu PC.";

    feedback.innerHTML = ` ${msg}`;
    feedback.style.backgroundColor = '#e3f2fd';
    feedback.style.color = '#0d47a1';

    if (stepRequirements[7].count === stepRequirements[7].target) {
        stepRequirements[7].completed = true;
        updateNextButtonState();
        setTimeout(() => {
            feedback.innerHTML = "<strong> ¡HAS ENCONTRADO TODOS LOS RIESGOS!</strong> Puedes continuar.";
            feedback.style.backgroundColor = '#e8f5e9';
            feedback.style.color = '#1b5e20';
        }, 1500);
    }
}

// EJERCICIO PUZZLE (Paso 10)
function selectMatch(element, col) {
    if (element.classList.contains('correct')) return;

    if (col === 'left') {
        if (selectedLeft) selectedLeft.classList.remove('selected');
        selectedLeft = element;
        selectedLeft.classList.add('selected');
    } else {
        if (selectedRight) selectedRight.classList.remove('selected');
        selectedRight = element;
        selectedRight.classList.add('selected');
    }

    if (selectedLeft && selectedRight) {
        checkMatch();
    }
}

function checkMatch() {
    const idLeft = selectedLeft.getAttribute('data-id');
    const idRight = selectedRight.getAttribute('data-id');
    const feedback = document.getElementById('match-feedback');

    if (idLeft === idRight) {
        selectedLeft.classList.remove('selected');
        selectedRight.classList.remove('selected');
        selectedLeft.classList.add('correct');
        selectedRight.classList.add('correct');
        selectedLeft = null;
        selectedRight = null;
        feedback.style.color = 'green';
        feedback.innerText = "¡Correcto!";
        
        stepRequirements[10].matches++;
        if(stepRequirements[10].matches === stepRequirements[10].target) {
            stepRequirements[10].completed = true;
            updateNextButtonState();
        }

    } else {
        selectedLeft.classList.add('wrong');
        selectedRight.classList.add('wrong');
        feedback.style.color = 'red';
        feedback.innerText = "❌ Incorrecto, inténtalo de nuevo.";
        
        setTimeout(() => {
            if(selectedLeft) selectedLeft.classList.remove('wrong', 'selected');
            if(selectedRight) selectedRight.classList.remove('wrong', 'selected');
            selectedLeft = null;
            selectedRight = null;
            feedback.innerText = "";
        }, 800);
    }
}

// ESCENARIOS PROFESIONALES (Paso 11)
function checkStory(storyId, choice, btn) {
    const feedbackDiv = document.getElementById(`feedback-story-${storyId}`);
    feedbackDiv.style.display = 'block';
    
    const parent = btn.parentElement;
    parent.querySelectorAll('.scenario-btn').forEach(b => {
        b.disabled = true;
        b.style.opacity = '0.6';
        b.style.cursor = 'not-allowed';
    });

    let correct = false;

    if (storyId === 1) {
        if (choice === 'attack') {
            correct = true;
            feedbackDiv.style.backgroundColor = '#e8f5e9';
            feedbackDiv.style.color = '#1b5e20';
            feedbackDiv.innerHTML = "Se ha aplicado correctamente el protocolo de Cero Confianza.";
        } else {
            feedbackDiv.style.backgroundColor = '#ffebee';
            feedbackDiv.style.color = '#b71c1c';
            feedbackDiv.innerHTML = "<strong>❌ BRECHA DE SEGURIDAD:</strong> Has permitido un acceso no autorizado.";
        }
    } else if (storyId === 2) {
        if (choice === 'phishing') {
            correct = true;
            feedbackDiv.style.backgroundColor = '#e8f5e9';
            feedbackDiv.style.color = '#1b5e20';
            feedbackDiv.innerHTML = "Correcto. Ningún técnico legítimo te pedirá eso.";
        } else {
            feedbackDiv.style.backgroundColor = '#ffebee';
            feedbackDiv.style.color = '#b71c1c';
            feedbackDiv.innerHTML = "<strong>❌ EQUIPO COMPROMETIDO:</strong> Al instalar el software, has dado control total al atacante.";
        }
    }

    if (correct) {
        stepRequirements[11].answered++;
        if (stepRequirements[11].answered === stepRequirements[11].target) {
            stepRequirements[11].completed = true;
            updateNextButtonState();
        }
    }
}