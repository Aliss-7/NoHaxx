// Respuestas correctas esperadas
const correctAnswers = { 
  1: 'secure',
  2: 'encrypt',
  3: 'admin',
  4: 'fake', 
  5: 'close',
  6: 'update',
  7: 'spy',
  8: 'correct',
  9: 'correct',
  10: 'logout'
};

let userAnswers = {};
const totalQuestions = 10;
const passingScore = 8;
let isTransitioning = false; 

// --- NAVEGACIÓN ---
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

// --- MANEJADORES DE PREGUNTAS ---
// Pasamos 'event' para saber qué elemento se clickeó y marcarlo
function checkQ1(ans) { handleAnswer(1, ans, event); }
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
    
    // 1. Identificar el elemento clicado y añadirle la clase .selected
    if(e && e.target) {
        // Buscamos el contenedor padre interactivo correcto
        const el = e.target.closest('.wifi-item, .card-option, .url-card, .popup-close, .popup-btn, .btn-action, .cookie-btn-big, .cookie-link');
        if(el) {
            el.classList.add('selected');
            // Forzamos un estilo visual simple por si el CSS específico no tiene .selected definido para ese elemento
            el.style.borderColor = '#1f73b8';
            el.style.backgroundColor = '#e8eaf6';
        }
    }
    
    // 2. Esperar y pasar a la siguiente (600ms)
    setTimeout(() => { 
        nextQuestion(qNum); 
        isTransitioning = false; 
    }, 600);
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
    
    // Mostrar nota "X/10"
    scoreDisplay.innerText = `${hits}/${totalQuestions}`;

    if (hits >= passingScore) {
      // APROBADO
      scoreDisplay.parentElement.style.background = '#1f73b8';
      scoreDisplay.parentElement.style.borderColor = '#1f73b8';
      
      msgDisplay.innerText = "¡EXCELENTE!";
      msgDisplay.style.color = "green";
      detailDisplay.innerText = `Has superado ${hits} de 10 desafíos.`;
      
      btnContinue.style.display = "inline-block";
      if(btnNext) btnNext.style.display = "inline-block"; // Botón FINALIZAR CURSO
      
      saveToFirebase(hits);
    } else {
      // SUSPENSO
      scoreDisplay.parentElement.style.background = '#d32f2f';
      scoreDisplay.parentElement.style.borderColor = '#d32f2f';
      
      msgDisplay.innerText = "Necesitas repasar";
      msgDisplay.style.color = "#d32f2f";
      detailDisplay.innerText = `Solo has superado ${hits} de 10 desafíos. Necesitas ${passingScore} para aprobar.`;
      
      btnRetry.style.display = "inline-block";
    }
  }, 500);
}

function saveToFirebase(nuevaNota) {
  const auth = firebase.auth();
  const db = firebase.firestore();
  const idModulo = 'navegacion';

  auth.onAuthStateChanged(user => {
    if (user) {
      const docRef = db.collection('userScores').doc(user.uid);
      
      docRef.get().then((doc) => {
        let notaAntigua = 0;
        if (doc.exists && doc.data().scores && doc.data().scores[idModulo]) {
          notaAntigua = doc.data().scores[idModulo];
        }

        if (nuevaNota > notaAntigua) {
          docRef.set({
            scores: { [idModulo]: nuevaNota }
          }, { merge: true }).then(() => console.log("¡Nueva nota guardada!"));
        }
      });
    }
  });
}