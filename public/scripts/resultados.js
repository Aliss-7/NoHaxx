document.addEventListener("DOMContentLoaded", () => {
  const auth = firebase.auth();
  const db = firebase.firestore();

  const userNameEl = document.getElementById('userName');
  const totalScoreEl = document.getElementById('totalScore');
  const moduleScoresEl = document.getElementById('moduleScores');
  const rankingEl = document.getElementById('rankingPosition');
  const logoutBtn = document.getElementById('logoutBtn');

  const TOTAL_MODULOS_POSIBLES = 6; 
  const PUNTOS_POR_MODULO = 10;
  const PUNTUACION_MAXIMA = TOTAL_MODULOS_POSIBLES * PUNTOS_POR_MODULO; // 60 puntos

  auth.onAuthStateChanged(async (user) => {
    if (!user) {
      window.location.href = "login.html";
      return;
    }

    userNameEl.innerText = `Hola, ${user.email}`;

    // puntuaciones
    const docRef = db.collection('userScores').doc(user.uid);
    const docSnap = await docRef.get();

    if (docSnap.exists) {
      const data = docSnap.data();
      const scores = data.scores || {};
      const puntosBrutos = Object.values(scores).reduce((a, b) => a + b, 0);

      let notaFinal = Math.round((puntosBrutos / PUNTUACION_MAXIMA) * 100);
      
      if (notaFinal > 100) notaFinal = 100;

      totalScoreEl.innerText = `${notaFinal}/100`;
      
      if(notaFinal < 50) totalScoreEl.style.color = "red";
      else if(notaFinal >= 80) totalScoreEl.style.color = "green";

      moduleScoresEl.innerHTML = '';
      if (Object.keys(scores).length > 0) {
        for (const [module, score] of Object.entries(scores)) {
          const nombreModulo = module.charAt(0).toUpperCase() + module.slice(1);
          moduleScoresEl.innerHTML += `
            <div class="module-card">
              <strong>${nombreModulo}</strong><br />
              ${score} puntos
            </div>`;
        }
      } else {
        moduleScoresEl.innerHTML = "<p>Aún no has completado ningún módulo.</p>";
      }

    } else {
      totalScoreEl.innerText = "0/100";
      moduleScoresEl.innerText = "No se han encontrado resultados.";
    }

    // ranking
    try {
      const allScoresSnap = await db.collection('userScores').get();
      const allUsers = [];

      allScoresSnap.forEach(doc => {
        const d = doc.data();
        const sc = d.scores || {};
        const rawTotal = Object.values(sc).reduce((a, b) => a + b, 0);
        const finalScore = Math.round((rawTotal / PUNTUACION_MAXIMA) * 100);
        
        allUsers.push({ uid: doc.id, finalScore: finalScore });
      });

      allUsers.sort((a, b) => b.finalScore - a.finalScore);

      const position = allUsers.findIndex(u => u.uid === user.uid) + 1;
      
      if (position > 0) {
        rankingEl.innerText = `#${position} de ${allUsers.length}`;
      } else {
        rankingEl.innerText = "-";
      }
      
    } catch (error) {
      console.error("Error al calcular ranking:", error);
      rankingEl.innerText = "Error";
    }
  });

  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      auth.signOut().then(() => {
        window.location.href = "login.html";
      });
    });
  }
});