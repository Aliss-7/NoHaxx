const correctAnswers = { 1: 'b', 2: 'c', 3: 'b', 4: 'c', 5: 'b', 6: 'b' };
let userAnswers = {};
const totalQuestions = 6;
let currentQ = 1;

function selectOption(qNum, value, cardElement) {
  userAnswers[qNum] = value;
  
  const parent = document.getElementById(`opt-q${qNum}`);
  const cards = parent.querySelectorAll('.option-card');
  cards.forEach(c => c.classList.remove('selected'));
  cardElement.classList.add('selected');
  
  const btn = document.querySelector(`#q${qNum} .btn-next-question`);
  btn.style.display = 'inline-block';
}

function nextQuestion(current) {
  const progress = (current / totalQuestions) * 100;
  document.getElementById('progress-bar').style.width = `${progress}%`;

  document.getElementById(`q${current}`).classList.remove('active');

  if (current < totalQuestions) {
    document.getElementById(`q${current + 1}`).classList.add('active');
    currentQ++;
  } else {
    calculateAndSave();
  }
}

function calculateAndSave() {
  document.getElementById('final-screen').classList.add('active');
  
  let hits = 0;
  for (let i = 1; i <= totalQuestions; i++) {
    if (userAnswers[i] === correctAnswers[i]) hits++;
  }
  
  const finalScore = Math.round((hits * 10) / totalQuestions);
  const passed = hits >= 4;

  const resultsDiv = document.getElementById('results-content');
  const loadingDiv = document.getElementById('loading-results');
  const scoreTxt = document.getElementById('final-score');
  const msgTxt = document.getElementById('final-msg');
  const detailTxt = document.getElementById('final-detail');
  const btnRetry = document.getElementById('btn-retry');
  const btnCont = document.getElementById('btn-continue');

  loadingDiv.style.display = 'none';
  resultsDiv.style.display = 'block';
  scoreTxt.innerText = finalScore;

  if (passed) {
    msgTxt.innerText = "¡Enhorabuena!";
    msgTxt.style.color = "green";
    detailTxt.innerText = `Has superado el test con éxito.`;
    btnCont.style.display = "inline-block";
    
    saveToFirebase(10);
  } else {
    msgTxt.innerText = "Necesitas repasar";
    msgTxt.style.color = "#d32f2f";
    detailTxt.innerText = `Has acertado ${hits} de ${totalQuestions}. Necesitas al menos 4 aciertos para aprobar.`;
    btnRetry.style.display = "inline-block";
  }
}

function saveToFirebase(score) {
  const auth = firebase.auth();
  const db = firebase.firestore();

  auth.onAuthStateChanged(user => {
    if (user) {
      db.collection('userScores').doc(user.uid).set({
        scores: { introduccion: score }
      }, { merge: true }).then(() => {
        console.log("Nota guardada");
      }).catch(err => {
        console.error("Error al guardar:", err);
        alert("Error de conexión al guardar la nota.");
      });
    }
  });
}