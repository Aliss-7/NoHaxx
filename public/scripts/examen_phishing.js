document.addEventListener('DOMContentLoaded', () => {
    let currentScore = 0;
    const totalQuestions = 10;
    const passingScore = 8; 
    const moduleName = 'phishing';
    let isTransitioning = false;

    const steps = document.querySelectorAll('.exam-step');
    const progressBar = document.getElementById('progress-bar');

    if(steps.length > 0) steps[0].classList.add('active');

    // Funciones globales (VirusTotal, Tooltip)
    window.runVTScan = function() {
        const val = document.getElementById('vt-input').value.toLowerCase();
        const result = document.getElementById('vt-result');
        const options = document.getElementById('vt-options');

        if (val.length > 3) {
            result.style.display = "block";
            options.style.display = "grid"; 
        } else {
            alert("Por favor, copia parte de la URL sospechosa.");
        }
    };

    window.showUrl = function(visible) {
        const tooltip = document.getElementById('url-tooltip-9');
        if(tooltip) tooltip.style.display = visible ? 'block' : 'none';
    };

    steps.forEach((step, index) => {
        if (step.id === 'step-final') return;

        const options = step.querySelectorAll('.option-card');

        options.forEach(opt => {
            opt.addEventListener('click', () => {
                if (step.classList.contains('answered') || isTransitioning) return;
                
                step.classList.add('answered');
                isTransitioning = true;

                const correctAnswer = step.getAttribute('data-correcta');
                const userAnswer = opt.getAttribute('data-respuesta');

                opt.classList.add('selected');

                if (userAnswer === correctAnswer) {
                    currentScore++;
                } 

                const progressPct = ((index + 1) / totalQuestions) * 100;
                if(progressBar) progressBar.style.width = `${progressPct}%`;

                setTimeout(() => {
                    step.classList.remove('active');
                    const nextStep = step.nextElementSibling;
                    
                    if (nextStep && nextStep.classList.contains('exam-step') && nextStep.id !== 'step-final') {
                        nextStep.classList.add('active');
                    } else {
                        finishExam();
                    }
                    isTransitioning = false;
                }, 600);
            });
        });
    });

    function finishExam() {
        const finalScreen = document.getElementById('step-final');
        if(finalScreen) finalScreen.classList.add('active');
        
        document.getElementById('loading-results').style.display = 'none';
        document.getElementById('results-content').style.display = 'block';

        const scoreDisplay = document.getElementById('final-score');
        const msgDisplay = document.getElementById('final-msg');
        const detailDisplay = document.getElementById('final-detail');
        const btnRetry = document.getElementById('btn-retry');
        const btnContinue = document.getElementById('btn-continue');
        const btnNext = document.getElementById('btn-next'); 

        scoreDisplay.textContent = `${currentScore}/${totalQuestions}`;

        if (currentScore >= passingScore) {
            scoreDisplay.parentElement.style.background = '#1f73b8';
            scoreDisplay.parentElement.style.borderColor = '#1f73b8'; 
            msgDisplay.innerHTML = "¡EXCELENTE!";
            msgDisplay.style.color = "green";
            detailDisplay.innerText = "Has superado el test con éxito.";
            
            if(btnContinue) btnContinue.style.display = 'inline-block';
            if(btnNext) btnNext.style.display = 'inline-block';
            
            if (typeof saveScore === 'function') {
                saveScore(currentScore); 
            } else {
                localSaveScore(currentScore);
            }
        } else {
            scoreDisplay.parentElement.style.background = '#d32f2f';
            scoreDisplay.parentElement.style.borderColor = '#d32f2f';
            msgDisplay.innerHTML = "Necesitas repasar";
            msgDisplay.style.color = "red";
            detailDisplay.innerText = "Necesitas por lo menos 8 aciertos de 10 para aprobar.";
            
            if(btnRetry) btnRetry.style.display = 'inline-block';
        }
    }

    function localSaveScore(nuevaNota) {
        const auth = firebase.auth();
        const db = firebase.firestore();
        const msgDiv = document.getElementById('firebase-msg');
        const idModulo = 'phishing';

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
                            if(msgDiv) msgDiv.innerHTML = "<p style='color:green; font-weight:bold;'>¡Nueva nota guardada!</p>";
                        });
                    } else {
                         if(msgDiv) msgDiv.innerHTML = "<p style='color:grey;'>No se guarda: Ya tienes una nota mejor.</p>";
                    }
                });
            }
        });
    }
});