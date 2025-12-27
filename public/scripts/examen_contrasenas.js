// Respuestas correctas esperadas
const correctAnswers = { 
  1: 'strong_pass',
  2: 'no',
  3: 'app', 
  4: 'manager',
  5: 'report',
  6: 'change',
  7: 'token',
  8: 'save',
  9: 'fake',
  10: 'incognito'
};

let userAnswers = {};
const totalQuestions = 10;
const passingScore = 8;
let isTransitioning = false; 

// --- GESTIÓN DE BARRA DE PROGRESO Y NAVEGACIÓN ---
function nextQuestion(current) {
  const progress = (current / totalQuestions) * 100;
  const progressBar = document.getElementById('progress-bar');
  if(progressBar) progressBar.style.width = `${progress}%`;

  document.getElementById(`q${current}`).classList.remove('active');

  if (current < totalQuestions) {
    document.getElementById(`q${current + 1}`).classList.add('active');
  } else {
    finishExam();
  }
}

// --- PREGUNTA 1: INPUT MANUAL ---
function checkQ1Strength() {
    const input = document.getElementById('q1-input').value;
    const bar = document.getElementById('q1-bar');
    const msg = document.getElementById('q1-msg');
    const btn = document.getElementById('btn-q1');

    let score = 0;
    if (input.length > 8) score += 30;
    if (input.length > 12) score += 30;
    if (/[A-Z]/.test(input)) score += 10;
    if (/[0-9]/.test(input)) score += 10;
    if (/[^A-Za-z0-9]/.test(input)) score += 20;

    bar.style.width = score + '%';
    
    if (score > 70) {
        bar.style.background = '#4caf50';
        msg.innerText = "NIVEL: SEGURO";
        msg.style.color = '#4caf50';
        btn.disabled = false;
        btn.style.opacity = '1';
    } else {
        bar.style.background = '#d32f2f';
        msg.innerText = "NIVEL: INSEGURO";
        msg.style.color = '#d32f2f';
        btn.disabled = true;
        btn.style.opacity = '0.5';
    }
}

function submitQ1() {
    userAnswers[1] = 'strong_pass';
    nextQuestion(1);
}

// --- PREGUNTAS DE SELECCIÓN (Q2 - Q10) ---
// Pasamos el evento (e) para poder marcar el elemento pulsado
function checkQ2(ans) { handleAnswer(2, ans, event); }
function checkQ3(ans) { handleAnswer(3, ans, event); }
function checkQ4(ans) { handleAnswer(4, ans, event); }
function checkQ5(ans) { handleAnswer(5, ans, event); }
function checkQ6(ans) { handleAnswer(6, ans, event); }
function checkQ7(ans) { handleAnswer(7, ans, event); }
function checkQ8(ans) { handleAnswer(8, ans, event); }
function checkQ9(ans) { handleAnswer(9, ans, event); }
function checkQ10(ans) { handleAnswer(10, ans, event); }

function handleAnswer(qNum, ans, e) {
    if(isTransitioning) return; 
    isTransitioning = true;
    userAnswers[qNum] = ans;
    
    // 1. Identificar el elemento clicado y añadirle la clase .selected (Azul neutro)
    if(e && e.target) {
        // Buscamos el contenedor padre (tarjeta o botón) por si se hizo clic en el texto
        const el = e.target.closest('.card-option, .auth-btn, .btn-save, .boton, .q-option, .email-link');
        if(el) el.classList.add('selected');
    }
    
    // 2. Esperar y pasar a la siguiente (Sin revelar si es correcta)
    setTimeout(() => { 
        nextQuestion(qNum); 
        isTransitioning = false; 
    }, 600); // 600ms igual que los otros módulos
}

// --- CÁLCULO FINAL Y RESULTADOS ---
function finishExam() {
  document.getElementById('final-screen').classList.add('active');
  
  // Cálculo interno silencioso
  let hits = 0;
  for (let i = 1; i <= totalQuestions; i++) {
    if (userAnswers[i] === correctAnswers[i]) {
       hits++;
    }
  }
  
  const scoreDisplay = document.getElementById('final-score');
  const msgDisplay = document.getElementById('final-msg');
  const detailDisplay = document.getElementById('final-detail');
  const btnRetry = document.getElementById('btn-retry');
  const btnContinue = document.getElementById('btn-continue');
  const btnNext = document.getElementById('btn-next');

  // Simular carga breve
  setTimeout(() => {
    document.getElementById('loading-results').style.display = 'none';
    document.getElementById('results-content').style.display = 'block';
    
    // Mostrar nota
    scoreDisplay.innerText = `${hits}/${totalQuestions}`;

    if (hits >= passingScore) {
      // APROBADO
      scoreDisplay.parentElement.style.background = '#1f73b8'; 
      scoreDisplay.parentElement.style.borderColor = '#1f73b8';
      
      msgDisplay.innerText = "¡EXCELENTE!";
      msgDisplay.style.color = "green";
      detailDisplay.innerText = "Has superado el test con éxito.";
      
      btnContinue.style.display = "inline-block";
      btnNext.style.display = "inline-block"; // Botón al Módulo 6
      
      saveToFirebase(hits);
    } else {
      // SUSPENSO
      scoreDisplay.parentElement.style.background = '#d32f2f';
      scoreDisplay.parentElement.style.borderColor = '#d32f2f';
      
      msgDisplay.innerText = "Necesitas repasar";
      msgDisplay.style.color = "#d32f2f";
      detailDisplay.innerText = `Necesitas por lo menos ${passingScore} aciertos de ${totalQuestions} para aprobar.`;
      
      btnRetry.style.display = "inline-block";
    }
  }, 500);
}

function saveToFirebase(score) {
  const auth = firebase.auth();
  const db = firebase.firestore();
  auth.onAuthStateChanged(user => {
    if (user) {
      db.collection('userScores').doc(user.uid).set({
        scores: { contrasenas: score }
      }, { merge: true });
    }
  });
}