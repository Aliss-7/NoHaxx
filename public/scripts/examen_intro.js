// public/scripts/features/examen_intro.js

// --- Configuración del Examen ---
// Respuestas correctas: 
// 1: b (Seg. Info), 2: c (Disponibilidad), 3: b (Hacktivismo), 4: c (Ransomware), 5: b (ODS 16), 6: b (No dejar conectado)
const correctAnswers = { 1: 'b', 2: 'c', 3: 'b', 4: 'c', 5: 'b', 6: 'b' };
let userAnswers = {};
const totalQuestions = 6;
let currentQ = 1;

// --- Lógica Visual ---
function selectOption(qNum, value, cardElement) {
  // Guardar respuesta
  userAnswers[qNum] = value;
  
  // Actualizar UI: Quitar seleccionado de otros y poner al actual
  const parent = document.getElementById(`opt-q${qNum}`);
  const cards = parent.querySelectorAll('.option-card');
  cards.forEach(c => c.classList.remove('selected'));
  cardElement.classList.add('selected');
  
  // Mostrar botón confirmar
  const btn = document.querySelector(`#q${qNum} .btn-next-question`);
  btn.style.display = 'inline-block';
}

function nextQuestion(current) {
  // Barra de progreso
  const progress = (current / totalQuestions) * 100;
  document.getElementById('progress-bar').style.width = `${progress}%`;

  // Ocultar actual
  document.getElementById(`q${current}`).classList.remove('active');

  if (current < totalQuestions) {
    // Mostrar siguiente
    document.getElementById(`q${current + 1}`).classList.add('active');
    currentQ++;
  } else {
    // Fin del examen
    calculateAndSave();
  }
}

function calculateAndSave() {
  document.getElementById('final-screen').classList.add('active');
  
  let hits = 0;
  for (let i = 1; i <= totalQuestions; i++) {
    if (userAnswers[i] === correctAnswers[i]) hits++;
  }
  
  // Nota sobre 10
  // Regla de 3: (hits * 10) / 6
  const finalScore = Math.round((hits * 10) / totalQuestions);
  const passed = hits >= 4; // Aprobar con 4/6 (66%)

  // Mostrar resultados
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
    msgTxt.innerText = "¡Enhorabuena! 🎓";
    msgTxt.style.color = "green";
    detailTxt.innerText = `Has acertado ${hits} de ${totalQuestions} preguntas. Has completado los fundamentos.`;
    btnCont.style.display = "inline-block";
    
    // Guardar en Firebase
    saveToFirebase(10); // Guardamos 10 puntos por completar
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