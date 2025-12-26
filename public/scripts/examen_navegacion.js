// Respuestas correctas esperadas
const correctAnswers = { 
  1: 'secure',    // Elegir el hotspot personal seguro
  2: 'encrypt',   // Cifrado
  3: 'admin',     // Admin/ISP ven todo
  4: 'fake',      // Identificar la URL falsa (paypaI)
  5: 'close',     // Cerrar el popup con la X
  6: 'update',    // Actualizar
  7: 'spy',       // Riesgo de privacidad
  8: 'correct',   // Eliminar el archivo .exe
  9: 'correct',   // Configurar/Rechazar cookies
  10: 'logout'    // Cerrar sesión completo
};

let userAnswers = {};
const totalQuestions = 10;
let isTransitioning = false; 

// AVANCE GENERAL
function nextQuestion(current) {
  const progress = (current / totalQuestions) * 100;
  const progressBar = document.getElementById('progress-bar');
  if(progressBar) progressBar.style.width = `${progress}%`;

  const currentStep = document.getElementById(`q${current}`);
  if(currentStep) currentStep.classList.remove('active');

  if (current < totalQuestions) {
    const nextStep = document.getElementById(`q${current + 1}`);
    if(nextStep) nextStep.classList.add('active');
  } else {
    calculateAndSave();
  }
}

// MANEJADORES DE RESPUESTA
function checkQ1(ans) { handleAnswer(1, ans); }
function checkQ2(ans) { handleAnswer(2, ans); }
function checkQ3(ans) { handleAnswer(3, ans); }
function checkQ4(ans) { handleAnswer(4, ans); } // El botón de la URL falsa
function checkQ5(ans) { handleAnswer(5, ans); } // 'close' es correcto, 'fail' es clickar el botón
function checkQ6(ans) { handleAnswer(6, ans); }
function checkQ7(ans) { handleAnswer(7, ans); }
function checkQ8(ans) { handleAnswer(8, ans); } // 'correct' es borrar el virus
function checkQ9(ans) { handleAnswer(9, ans); } // 'correct' es rechazar cookies
function checkQ10(ans) { handleAnswer(10, ans); }

function handleAnswer(qNum, ans) {
    if(isTransitioning) return; 
    isTransitioning = true;
    userAnswers[qNum] = ans;
    
    // Feedback visual (parpadeo de selección)
    const currentStep = document.getElementById(`q${qNum}`);
    if(currentStep) {
        currentStep.style.opacity = '0.5';
    }
    
    setTimeout(() => { 
        if(currentStep) currentStep.style.opacity = '1';
        nextQuestion(qNum); 
        isTransitioning = false; 
    }, 300);
}

// CÁLCULO FINAL
function calculateAndSave() {
  document.getElementById('final-screen').classList.add('active');
  
  let hits = 0;
  for (let i = 1; i <= totalQuestions; i++) {
    // Caso especial para Q4 (la respuesta es hacer click en 'fake')
    if (i === 4) {
        if (userAnswers[i] === 'fake') hits++;
    } 
    // Resto de preguntas
    else if (userAnswers[i] === correctAnswers[i]) {
       hits++;
    }
  }
  
  const finalScore = hits; 
  const passed = hits >= 8; 

  const resultsDiv = document.getElementById('results-content');
  const loadingDiv = document.getElementById('loading-results');
  const scoreTxt = document.getElementById('final-score');
  const msgTxt = document.getElementById('final-msg');
  const detailTxt = document.getElementById('final-detail');
  
  const btnCont = document.getElementById('btn-continue');
  const btnRetry = document.getElementById('btn-retry');
  const btnNext = document.getElementById('btn-next');

  setTimeout(() => {
    loadingDiv.style.display = 'none';
    resultsDiv.style.display = 'block';
    scoreTxt.innerText = finalScore;

    if (passed) {
      msgTxt.innerText = "¡EXCELENTE!";
      msgTxt.style.color = "#2e7d32";
      detailTxt.innerText = `Has superado ${hits} de 10.`;
      
      btnCont.style.display = "inline-block";
      if(btnNext) btnNext.style.display = "inline-block";
      
      saveToFirebase(finalScore);
    } else {
      msgTxt.innerText = "Necesitas repasar";
      msgTxt.style.color = "#d32f2f";
      detailTxt.innerText = `Solo has superado ${hits} de 10. Necesitas por lo menos 8 aciertos de 10 para aprobar.`;
      
      btnRetry.style.display = "inline-block";
      btnCont.style.display = "inline-block";
    }
  }, 1000);
}

function saveToFirebase(score) {
  const auth = firebase.auth();
  const db = firebase.firestore();
  auth.onAuthStateChanged(user => {
    if (user) {
      db.collection('userScores').doc(user.uid).set({
        scores: { navegacion: score }
      }, { merge: true });
    }
  });
}