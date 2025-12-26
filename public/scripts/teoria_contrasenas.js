const stepRequirements = {
    0: { type: 'reveal', completed: false },
    1: { type: 'reveal_deep', completed: false }, 
    2: { type: 'strength', completed: false }, 
    3: { type: 'read', completed: true }, 
    4: { type: 'cards', viewed: 0, target: 3, completed: false },
    5: { type: 'read', completed: true },
    6: { type: 'video', completed: false }, 
    7: { type: 'errors', count: 0, target: 3, completed: false },
    8: { type: 'read', completed: true }, 
    9: { type: 'leak', completed: false },
    10: { type: 'read', completed: true }
};

var player;
function onYouTubeIframeAPIReady() {
    player = new YT.Player('player-passwords', {
        height: '315',
        width: '100%',
        videoId: 'Fd87JLBz5Ac', 
        events: {
            'onStateChange': onPlayerStateChange
        }
    });
}

function onPlayerStateChange(event) {
    if (event.data === YT.PlayerState.ENDED) {
        stepRequirements[6].completed = true;
        updateNextButtonState();
    }
}

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
    if (index <= 1) activeMenu = 0;      
    else if (index <= 2) activeMenu = 1; 
    else if (index <= 4) activeMenu = 2; 
    else if (index <= 6) activeMenu = 3; 
    else if (index <= 7) activeMenu = 4; 
    else if (index <= 9) activeMenu = 5; 
    else if (index <= 10) activeMenu = 6;
    else activeMenu = 7; 

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
        alert("Por favor, completa la actividad requerida para avanzar.");
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

function revelar(id, btn) {
    const el = document.getElementById(id);
    if (el) {
        el.style.display = 'block';
        el.style.animation = 'fadeIn 0.5s';
        if(btn) btn.style.display = 'none';
        
        if(stepRequirements[currentStep]) {
            stepRequirements[currentStep].completed = true;
            updateNextButtonState();
        }
    }
}

function checkStrength() {
    const input = document.getElementById('pass-input').value;
    const bar = document.getElementById('strength-fill');
    const timeText = document.getElementById('crack-time');
    const feed = document.getElementById('pass-feedback');

    let score = 0;
    if (input.length > 8) score += 20;
    if (input.length > 12) score += 30;
    if (/[A-Z]/.test(input)) score += 15;
    if (/[0-9]/.test(input)) score += 15;
    if (/[^A-Za-z0-9]/.test(input)) score += 20;

    bar.style.width = score + '%';
    
    if (score < 40) {
        bar.style.background = '#d63031';
        timeText.innerText = "INSTANTÁNEO";
        timeText.style.color = '#d63031';
        feed.innerText = "Demasiado débil.";
    } else if (score < 80) {
        bar.style.background = '#fdcb6e';
        timeText.innerText = "3 DÍAS";
        timeText.style.color = '#fdcb6e';
        feed.innerText = "Mejorable. Añade longitud.";
    } else {
        bar.style.background = '#00b894';
        timeText.innerText = "400 SIGLOS";
        timeText.style.color = '#00b894';
        feed.innerText = "¡Excelente! Contraseña segura.";
        
        if (!stepRequirements[2].completed) {
            stepRequirements[2].completed = true;
            updateNextButtonState();
        }
    }
}

function showAuthInfo(type, card) {
    document.querySelectorAll('.tech-info').forEach(div => div.style.display = 'none');
    document.getElementById('info-' + type).style.display = 'block';
    
    if (!card.classList.contains('visited')) {
        card.classList.add('visited');
        card.style.borderLeft = "5px solid #4caf50";
        stepRequirements[4].viewed++;
        
        if (stepRequirements[4].viewed === stepRequirements[4].target) {
            stepRequirements[4].completed = true;
            updateNextButtonState();
        }
    }
}

function checkError(type, card) {
    if (card.classList.contains('found') || card.classList.contains('safe')) return;

    const feedback = document.getElementById('error-feedback');
    feedback.style.display = 'block';

    if (type === 'reuse' || type === 'postit' || type === 'personal') {
        card.classList.add('found'); 
        stepRequirements[7].count++;
        
        if (stepRequirements[7].count === stepRequirements[7].target) {
            feedback.innerHTML = "<strong>¡Bien hecho!</strong> Has identificado todas las malas prácticas.";
            feedback.style.backgroundColor = '#e8f5e9';
            feedback.style.color = '#2e7d32';
            stepRequirements[7].completed = true;
            updateNextButtonState();
        } else {
            feedback.innerHTML = "Correcto, eso es un riesgo. Sigue buscando.";
            feedback.style.backgroundColor = '#ffebee';
            feedback.style.color = '#c62828';
        }
    } else {
        card.classList.add('safe');
        feedback.innerHTML = "¡No! Usar un Gestor de Contraseñas es una BUENA práctica.";
        feedback.style.backgroundColor = '#e3f2fd';
        feedback.style.color = '#0d47a1';
    }
}

function checkLeak() {
    const input = document.getElementById('leak-email-input').value;
    const resultDiv = document.getElementById('leak-result');
    
    if (!input || !input.includes('@')) {
        resultDiv.innerHTML = "> ERROR: Formato de email inválido.";
        return;
    }

    resultDiv.innerHTML = "> BUSCANDO COINCIDENCIAS...";
    
    setTimeout(() => {
        if (input.match(/test|ejemplo|admin|user|juan|maria|gmail|hotmail|outlook/i)) {
            resultDiv.innerHTML = `
                > <span style="color:red; font-weight:bold;">¡ALERTA! EMAIL ENCONTRADO EN FILTRACIONES.</span><br>
                > Este es un ejemplo simulado.
                <br><br>
                <a href="https://haveibeenpwned.com/account/${input}" target="_blank" style="color:white; text-decoration:underline; background:#d32f2f; padding:5px 10px; border-radius:4px;">VERIFICA ESTE EMAIL EN LA WEB OFICIAL REAL</a>
            `;
        } else {
            resultDiv.innerHTML = `
                > <span style="color:#0f0;">NO SE ENCONTRARON REGISTROS (EN ESTA SIMULACIÓN).</span>
                <br><br>
                > Para estar 100% seguro, consulta la fuente oficial:
                <br>
                <a href="https://haveibeenpwned.com/account/${input}" target="_blank" style="color:black; background:#0f0; padding:5px 10px; text-decoration:none; display:inline-block; margin-top:5px; font-weight:bold;">CONSULTAR HAVE I BEEN PWNED REAL</a>
            `;
        }
        
        stepRequirements[9].completed = true;
        updateNextButtonState();
    }, 1500);
}