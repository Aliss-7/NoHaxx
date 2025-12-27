const correctAnswers = { 
  1: 'lock',
  2: 'correct_trio',
  3: 'it',
  4: 'sender',
  5: 'phone', // Se acepta 'phone' o 'teams' en la lógica de cálculo
  6: 'file2',
  7: 'b',
  8: 'link',
  9: 'blurred',
  10: 'block'
};

let userAnswers = {};
const totalQuestions = 10;
const passingScore = 8;
let isTransitioning = false; 

let deskSelection = []; 

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

function checkSystem(action) {
  if(isTransitioning) return; isTransitioning = true;
  userAnswers[1] = action;
  
  const btns = document.querySelectorAll('.os-btn');
  btns.forEach(b => b.style.opacity = '0.5');
  
  setTimeout(() => { nextQuestion(1); isTransitioning = false; }, 500);
}

function deskClick(element) {
  if (element.classList.contains('picked')) return; 
  
  element.classList.add('picked');
  const type = element.getAttribute('data-type');
  deskSelection.push(type);

  if (deskSelection.length === 3) {
    const dangers = deskSelection.filter(t => t === 'danger').length;
    userAnswers[2] = (dangers === 3) ? 'correct_trio' : 'wrong';
    setTimeout(() => nextQuestion(2), 600);
  }
}

function usbAction(zone) {
  if(isTransitioning) return; isTransitioning = true;
  userAnswers[3] = zone;
  const zones = document.querySelectorAll('.usb-zone');
  zones.forEach(z => z.style.opacity = '0.5');
  setTimeout(() => { nextQuestion(3); isTransitioning = false; }, 500);
}

function checkHotspot(qNum, zone) {
  if(isTransitioning) return; isTransitioning = true;
  userAnswers[qNum] = zone;
  setTimeout(() => { nextQuestion(qNum); isTransitioning = false; }, 400);
}

function checkApp(app) {
  if(isTransitioning) return; isTransitioning = true;
  userAnswers[5] = app;
  const icons = document.querySelectorAll('.app-icon');
  icons.forEach(i => i.style.opacity = '0.5');
  setTimeout(() => { nextQuestion(5); isTransitioning = false; }, 400);
}

function checkFile(fileId) {
  if(isTransitioning) return; isTransitioning = true;
  userAnswers[6] = fileId;
  const cards = document.querySelectorAll('.file-card');
  cards.forEach(c => c.style.opacity = '0.5');
  setTimeout(() => { nextQuestion(6); isTransitioning = false; }, 400);
}

function replyChat(option) {
  const chatLog = document.getElementById('chat-log-q7');
  document.getElementById('chat-opts-q7').style.display = 'none';
  
  let text = (option === 'a') ? "Claro Laura, es 600..." : "No puedo dar datos por aquí, te lo mando por Teams.";
  chatLog.innerHTML += `<div class="msg outgoing">${text}</div>`;
  userAnswers[7] = option;
  
  setTimeout(() => nextQuestion(7), 800);
}

function toggleBlur() {
  const bg = document.getElementById('room-bg');
  const checkbox = document.getElementById('blur-check');
  
  if(checkbox.checked) {
    bg.classList.add('blurred');
  } else {
    bg.classList.remove('blurred');
  }
}

function attemptJoin() {
  const checkbox = document.getElementById('blur-check');
  userAnswers[9] = checkbox.checked ? 'blurred' : 'clear';
  nextQuestion(9);
}

function checkPopup(action) {
  if(isTransitioning) return; isTransitioning = true;
  userAnswers[10] = action;
  document.querySelector('.popup-card').style.opacity = '0.5';
  setTimeout(() => { nextQuestion(10); isTransitioning = false; }, 400);
}

function calculateAndSave() {
  document.getElementById('final-screen').classList.add('active');
  
  let hits = 0;
  for (let i = 1; i <= totalQuestions; i++) {
    // Caso especial pregunta 5 (Phone o Teams son válidos)
    if(i === 5 && (userAnswers[5] === 'phone' || userAnswers[5] === 'teams')) {
       hits++;
    } else if (userAnswers[i] === correctAnswers[i]) {
       hits++;
    }
  }
  
  const finalScore = hits; 
  const passed = hits >= passingScore; 

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
    
    // Formato "8/10"
    scoreTxt.innerText = `${hits}/${totalQuestions}`;

    if (passed) {
      // APROBADO (Azul/Verde)
      scoreTxt.parentElement.style.background = '#1f73b8'; // Azul corporativo
      scoreTxt.parentElement.style.borderColor = '#1f73b8';
      
      msgTxt.innerText = "¡EXCELENTE!";
      msgTxt.style.color = "green";
      detailTxt.innerText = "Has superado el test con éxito.";
      
      if(btnCont) btnCont.style.display = "inline-block";
      if(btnNext) btnNext.style.display = "inline-block";
      
      saveToFirebase(finalScore);
    } else {
      // SUSPENSO (Rojo)
      scoreTxt.parentElement.style.background = '#d32f2f';
      scoreTxt.parentElement.style.borderColor = '#d32f2f';
      
      msgTxt.innerText = "Necesitas repasar";
      msgTxt.style.color = "#d32f2f"; // Rojo
      detailTxt.innerText = `Has conseguido ${hits} de ${totalQuestions}. Necesitas al menos ${passingScore} aciertos para aprobar.`;
      
      if(btnRetry) btnRetry.style.display = "inline-block";
      // Opcional: mostrar botón salir aunque suspenda
      // if(btnCont) btnCont.style.display = "inline-block"; 
    }
  }, 1000);
}

function saveToFirebase(nuevaNota) {
  const auth = firebase.auth();
  const db = firebase.firestore();
  const idModulo = 'ingenieria';

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