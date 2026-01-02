const correctAnswers = { 1: 'b', 2: 'c', 3: 'b', 4: 'c', 5: 'b', 6: 'b' };
let userAnswers = {};
const totalQuestions = 6;
let isTransitioning = false; 

function selectOption(qNum, value, cardElement) {
  if (isTransitioning) return;
  
  userAnswers[qNum] = value;
  
  const parent = document.getElementById(`opt-q${qNum}`);
  const cards = parent.querySelectorAll('.option-card');
  cards.forEach(c => c.classList.remove('selected'));
  cardElement.classList.add('selected');
  
  isTransitioning = true;
  
  setTimeout(() => {
    nextQuestion(qNum);
    isTransitioning = false;
  }, 600); 
}

function nextQuestion(current) {
  const progress = (current / totalQuestions) * 100;
  const progressBar = document.getElementById('progress-bar');
  if(progressBar) progressBar.style.width = `${progress}%`;

  document.getElementById(`q${current}`).classList.remove('active');

  if (current < totalQuestions) {
    document.getElementById(`q${current + 1}`).classList.add('active');
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
  
  const finalGrade = Math.round((hits / totalQuestions) * 10);

  const passed = hits >= 4;

  const resultsDiv = document.getElementById('results-content');
  const loadingDiv = document.getElementById('loading-results');
  const scoreTxt = document.getElementById('final-score');
  const msgTxt = document.getElementById('final-msg');
  const detailTxt = document.getElementById('final-detail');
  
  const btnRetry = document.getElementById('btn-retry');
  const btnCont = document.getElementById('btn-continue');
  const btnNext = document.getElementById('btn-next');

  setTimeout(() => {
      loadingDiv.style.display = 'none';
      resultsDiv.style.display = 'block';
      
      scoreTxt.innerText = `${hits}/${totalQuestions}`;

      if (passed) {
        scoreTxt.parentElement.style.background = '#1f73b8'; 
        scoreTxt.parentElement.style.borderColor = '#1f73b8';
        
        msgTxt.innerText = "¡Enhorabuena!";
        msgTxt.style.color = "green";
        detailTxt.innerText = `Has superado el test con éxito. Nota: ${finalGrade}/10`;
        
        if(btnCont) btnCont.style.display = "inline-block";
        if(btnNext) btnNext.style.display = "inline-block";
        
        saveToFirebase(finalGrade); 
      } else {
        scoreTxt.parentElement.style.background = '#d32f2f';
        scoreTxt.parentElement.style.borderColor = '#d32f2f';
        
        msgTxt.innerText = "Necesitas repasar";
        msgTxt.style.color = "#d32f2f";
        detailTxt.innerText = `Has acertado ${hits} de ${totalQuestions}. Necesitas al menos 4 aciertos.`;
        
        if(btnRetry) btnRetry.style.display = "inline-block";
      }
  }, 500);
}

function saveToFirebase(nuevaNota) {
  const auth = firebase.auth();
  const db = firebase.firestore();
  const idModulo = 'introduccion';

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
          }, { merge: true }).then(() => {
             console.log("¡Nueva nota guardada en Introducción!");
          });
        }
      });
    }
  });
}