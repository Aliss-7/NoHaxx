function guardarNota(modulo, puntos, mensajeFinal) {
  const auth = firebase.auth();
  const db = firebase.firestore();

  auth.onAuthStateChanged(user => {
    if (user) {
      const scoreData = {};
      scoreData[modulo] = puntos;
      
      db.collection('userScores').doc(user.uid).set({
        scores: scoreData
      }, { merge: true }).then(() => {
        mensajeFinal.innerHTML += "<br><a href='../../modulos.html' class='boton' style='margin-top:10px'>Volver a Módulos</a>";
      }).catch(err => {
        console.error("Error al guardar la nota:", err);
        mensajeFinal.textContent = "Error al guardar: " + err.message;
      });
    } else {
      mensajeFinal.textContent = "Error: No se detectó sesión de usuario. La nota no se ha guardado.";
    }
  });
}

/**
 * Inicializa y gestiona el flujo de un examen.
 * @param {string} moduloName Nombre del módulo para guardar en Firebase (e.g., 'phishing').
 * @param {number} totalQuestions Número total de preguntas esperadas.
 * @param {number} passingScore Puntuación mínima de aciertos para aprobar.
 */
function iniciarExamen(moduloName, totalQuestions, passingScore) {
  const preguntas = document.querySelectorAll('.pregunta.examen');
  const puntuacionTxt = document.getElementById('puntuacion-examen');
  const mensajeFinal = document.getElementById('mensaje-final');
  
  let aciertos = 0;
  let contestadas = 0;
  const total = preguntas.length;

  if (total !== totalQuestions) {
      console.warn(`[EXAM] Inconsistencia: Se esperaban ${totalQuestions} preguntas, pero se encontraron ${total}.`);
  }

  preguntas.forEach(pregunta => {
    const botones = pregunta.querySelectorAll('button');
    botones.forEach(btn => {
      btn.addEventListener('click', (e) => {
        if(pregunta.classList.contains('contestada')) return;
        pregunta.classList.add('contestada');

        const respuestaUser = e.target.getAttribute('data-respuesta');
        const respuestaCorrecta = pregunta.getAttribute('data-correcta');

        if (respuestaUser === respuestaCorrecta) {
          e.target.style.backgroundColor = '#d4edda';
          e.target.style.borderColor = '#c3e6cb';
          aciertos++;
        } else {
          e.target.style.backgroundColor = '#f8d7da';
          e.target.style.borderColor = '#f5c6cb';
          botones.forEach(b => {
             if (b.getAttribute('data-respuesta') === respuestaCorrecta) {
                 b.style.backgroundColor = '#d4edda'; 
                 b.style.borderColor = '#c3e6cb';
             }
          });
        }
        
        contestadas++;

        if (contestadas === total) {
          finalizarExamen(aciertos);
        }
      });
    });
  });

  function finalizarExamen(nota) {
    puntuacionTxt.textContent = `Tu puntuación: ${nota}/${total}`;
    
    const aprobado = nota >= passingScore; 
    let puntosGuardados = 0;
    const notaMaxima = 10;

    if (aprobado) {
       mensajeFinal.innerHTML = "<h3 style='color:green'>¡Aprobado! ✅</h3><p>Guardando tu progreso...</p>";
       puntosGuardados = notaMaxima;
       guardarNota(moduloName, puntosGuardados, mensajeFinal);
    } else {
       mensajeFinal.innerHTML = "<h3 style='color:red'>Has suspendido ❌</h3><p>Repasa la teoría e inténtalo de nuevo.</p><button onclick='location.reload()' class='boton'>Reintentar</button>";
    }
  }
}