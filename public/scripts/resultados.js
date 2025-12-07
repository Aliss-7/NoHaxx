document.addEventListener("DOMContentLoaded", () => {
  const auth = firebase.auth();
  const db = firebase.firestore();

  const userNameEl = document.getElementById('userName');
  const totalScoreEl = document.getElementById('totalScore');
  const moduleScoresEl = document.getElementById('moduleScores');
  const rankingEl = document.getElementById('rankingPosition');
  const logoutBtn = document.getElementById('logoutBtn');

  auth.onAuthStateChanged(async (user) => {
    if (!user) {
      window.location.href = "login.html";
      return;
    }

    userNameEl.innerText = `Hola, ${user.email}`;

    // puntuaciones del usuario actual
    const docRef = db.collection('userScores').doc(user.uid);
    const docSnap = await docRef.get();

    let miPuntuacionTotal = 0;

    if (docSnap.exists) {
      const data = docSnap.data();
      const scores = data.scores || {};

      miPuntuacionTotal = Object.values(scores).reduce((a, b) => a + b, 0);

      // mostrar puntuación total
      totalScoreEl.innerText = `${miPuntuacionTotal}/60`;

      // desglose por módulos
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
      totalScoreEl.innerText = "0/30";
      moduleScoresEl.innerText = "No se han encontrado resultados.";
    }

    // ranking
    try {
      const allScoresSnap = await db.collection('userScores').get();
      const allUsers = [];

      allScoresSnap.forEach(doc => {
        const d = doc.data();
        const sc = d.scores || {};
        const userTotal = Object.values(sc).reduce((a, b) => a + b, 0);
        
        allUsers.push({ uid: doc.id, totalScore: userTotal });
      });

      // ordenar
      allUsers.sort((a, b) => b.totalScore - a.totalScore);

      // mi posición
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

  // cerrar sesión
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      auth.signOut().then(() => {
        window.location.href = "login.html";
      });
    });
  }
});