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
let isTransitioning = false; 

// AVANCE GENERAL
function nextQuestion(current) {
  const progress = (current / totalQuestions) * 100;
  document.getElementById('progress-bar').style.width = `${progress}%`;
  document.getElementById(`q${current}`).classList.remove('active');

  if (current < totalQuestions) {
    document.getElementById(`q${current + 1}`).classList.add('active');
  } else {
    calculateAndSave();
  }
}

// Q1: CREADOR DE CONTRASEÑA
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

// RESTO DE PREGUNTAS
function checkQ2(ans) { handleAnswer(2, ans); }
function checkQ3(ans) { handleAnswer(3, ans); }
function checkQ4(ans) { handleAnswer(4, ans); }
function checkQ5(ans) { handleAnswer(5, ans); }
function checkQ6(ans) { handleAnswer(6, ans); }
function checkQ7(ans) { handleAnswer(7, ans); }
function checkQ8(ans) { handleAnswer(8, ans); }
function checkQ9(ans) { handleAnswer(9, ans); }
function checkQ10(ans) { handleAnswer(10, ans); }

function handleAnswer(qNum, ans) {
    if(isTransitioning) return; isTransitioning = true;
    userAnswers[qNum] = ans;
    
    // Feedback visual simple (opacidad)
    const currentStep = document.getElementById(`q${qNum}`);
    if(currentStep) {
        currentStep.style.opacity = '0.9';
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
    if (userAnswers[i] === correctAnswers[i]) {
       hits++;
    }
  }
  
  const finalScore = hits; 
  const passed = hits >= 6; 

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
      msgTxt.innerText = "CONFIGURACIÓN SEGURA";
      msgTxt.style.color = "#2e7d32";
      detailTxt.innerText = `Has superado ${hits} de 10 desafíos de seguridad.`;
      
      btnCont.style.display = "inline-block";
      btnNext.style.display = "inline-block";
      
      saveToFirebase(finalScore);
    } else {
      msgTxt.innerText = "CONFIGURACIÓN VULNERABLE";
      msgTxt.style.color = "#d32f2f";
      detailTxt.innerText = `Solo has superado ${hits} de 10 desafíos.`;
      
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
        scores: { contrasenas: score }
      }, { merge: true });
    }
  });
}