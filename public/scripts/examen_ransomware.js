document.addEventListener('DOMContentLoaded', () => {
    let currentScore = 0;
    const totalQuestions = 10; 
    const passingScore = 8;    
    const moduleName = 'ransomware';
    let isTransitioning = false;

    const steps = document.querySelectorAll('.exam-step');
    const progressBar = document.getElementById('progress-bar');

    if(steps.length > 0) steps[0].classList.add('active');
 
    // Funciones para la ventana de propiedades (Pregunta 1)
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
                // Evitar doble clic
                if (step.classList.contains('answered') || isTransitioning) return;
                
                step.classList.add('answered');
                isTransitioning = true;

                const correctAnswer = step.getAttribute('data-correcta');
                const userAnswer = opt.getAttribute('data-respuesta');
                
                // CAMBIO: Solo marcamos visualmente la selección (neutro)
                opt.classList.add('selected');

                // Calculamos la nota internamente (sin mostrar verde/rojo)
                if (userAnswer === correctAnswer) {
                    currentScore++;
                }
                // Ya no hay "else" para mostrar errores

                // Actualizar barra de progreso
                const progressPct = ((index + 1) / totalQuestions) * 100;
                if(progressBar) progressBar.style.width = `${progressPct}%`;

                // Pasar a la siguiente pregunta
                setTimeout(() => {
                    step.classList.remove('active'); 
                    const nextStep = step.nextElementSibling;
                    
                    if (nextStep && nextStep.classList.contains('exam-step') && nextStep.id !== 'step-final') {
                        nextStep.classList.add('active');
                    } else {
                        finishExam();
                    }
                    isTransitioning = false;
                }, 600); // Transición rápida
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
        const detailDisplay = document.getElementById('final-detail');
        const btnRetry = document.getElementById('btn-retry');
        const btnContinue = document.getElementById('btn-continue');
        const btnNext = document.getElementById('btn-next');

        // Mostrar nota final
        scoreDisplay.textContent = `${currentScore}/${totalQuestions}`;

        if (currentScore >= passingScore) {
            // APROBADO
            scoreDisplay.parentElement.style.background = '#1f73b8';
            scoreDisplay.parentElement.style.borderColor = '#1f73b8';
            
            msgDisplay.innerHTML = "¡EXCELENTE!";
            msgDisplay.style.color = "green";
            if(detailDisplay) detailDisplay.innerText = "Has superado el test con éxito.";
            
            if(btnContinue) btnContinue.style.display = 'inline-block';
            if(btnNext) btnNext.style.display = 'inline-block'; 
            
            if (typeof saveScore === 'function') {
                saveScore(currentScore); 
            } else {
                localSaveScore(currentScore);
            }
        } else {
            // SUSPENSO
            scoreDisplay.parentElement.style.background = '#d32f2f';
            scoreDisplay.parentElement.style.borderColor = '#d32f2f';
            
            msgDisplay.innerHTML = "Necesitas repasar";
            msgDisplay.style.color = "red";
            if(detailDisplay) detailDisplay.innerText = `Necesitas por lo menos ${passingScore} aciertos de ${totalQuestions} para aprobar.`;
            
            if(btnRetry) btnRetry.style.display = 'inline-block';
        }
    }

    function localSaveScore(nuevaNota) {
        const auth = firebase.auth();
        const db = firebase.firestore();
        const msgDiv = document.getElementById('firebase-msg');
        const idModulo = 'ransomware';

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
                    }
                });
            }
        });
    }
});