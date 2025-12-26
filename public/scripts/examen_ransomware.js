document.addEventListener('DOMContentLoaded', () => {
    let currentScore = 0;
    const totalQuestions = 10; 
    const passingScore = 8;    
    const moduleName = 'ransomware';

    const steps = document.querySelectorAll('.exam-step');
    const progressBar = document.getElementById('progress-bar');

    if(steps.length > 0) steps[0].classList.add('active');

    window.mostrarPropiedades = function() {
        const v = document.getElementById('propiedades-file');
        if(v) v.style.display = 'block';
    }
    window.cerrarPropiedades = function() {
        const v = document.getElementById('propiedades-file');
        if(v) v.style.display = 'none';
    }

    // --- LÓGICA DE PREGUNTAS ---
    steps.forEach((step, index) => {
        if (step.id === 'step-final') return;

        const options = step.querySelectorAll('.option-card');

        options.forEach(opt => {
            opt.addEventListener('click', () => {
                if (step.classList.contains('answered')) return;
                step.classList.add('answered');

                const correctAnswer = step.getAttribute('data-correcta');
                const userAnswer = opt.getAttribute('data-respuesta');

                if (userAnswer === correctAnswer) {
                    opt.classList.add('correct');
                    currentScore++;
                } else {
                    opt.classList.add('incorrect');
                    options.forEach(o => {
                        if (o.getAttribute('data-respuesta') === correctAnswer) {
                            o.classList.add('correct');
                        }
                    });
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
                }, 1500);
            });
        });
    });

    function finishExam() {
        const finalScreen = document.getElementById('step-final');
        if(finalScreen) finalScreen.classList.add('active');
        
        const loader = document.getElementById('loading-results');
        const content = document.getElementById('results-content');
        
        if(loader) loader.style.display = 'none';
        if(content) content.style.display = 'block';

        const scoreDisplay = document.getElementById('final-score');
        const msgDisplay = document.getElementById('final-msg');
        const btnRetry = document.getElementById('btn-retry');
        const btnContinue = document.getElementById('btn-continue');

        scoreDisplay.textContent = `${currentScore}/${totalQuestions}`;

        if (currentScore >= passingScore) {
            scoreDisplay.parentElement.style.background = '#4caf50';
            msgDisplay.innerHTML = "¡EXCELENTE! <br>Has superado el test con éxito.";
            msgDisplay.style.color = "green";
            if(btnContinue) btnContinue.style.display = 'inline-block';
            
            if (typeof saveScore === 'function') {
                saveScore(currentScore); 
            } else {
                localSaveScore(currentScore);
            }
        } else {
            scoreDisplay.parentElement.style.background = '#f44336';
            msgDisplay.innerHTML = "SISTEMA COMPROMETIDO. <br>Debes mejorar tu defensa.";
            msgDisplay.style.color = "red";
            if(btnRetry) btnRetry.style.display = 'inline-block';
        }
    }

    function localSaveScore(nota) {
        const auth = firebase.auth();
        const db = firebase.firestore();
        const msgDiv = document.getElementById('firebase-msg');

        auth.onAuthStateChanged(user => {
            if (user) {
                db.collection('userScores').doc(user.uid).set({
                    scores: { ransomware: nota }
                }, { merge: true }).then(() => {
                    if(msgDiv) msgDiv.innerHTML = "<p style='color:green; font-weight:bold;'>Progreso guardado correctamente.</p>";
                }).catch((error) => {
                    console.error("Error:", error);
                    if(msgDiv) msgDiv.innerHTML = "<p style='color:orange'>Error al guardar nota.</p>";
                });
            }
        });
    }
});