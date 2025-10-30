document.addEventListener("DOMContentLoaded", () => {
  // Definimos auth y db con la sintaxis "compat"
  const auth = firebase.auth();
  const db = firebase.firestore();

  const userNameEl = document.getElementById('userName');
  const totalScoreEl = document.getElementById('totalScore');
  const moduleScoresEl = document.getElementById('moduleScores');
  const rankingEl = document.getElementById('rankingPosition');
  const logoutBtn = document.getElementById('logoutBtn');

  // Usamos auth.onAuthStateChanged
  auth.onAuthStateChanged(async (user) => {
    if (!user) {
      window.location.href = "login.html";
      return;
    }

    userNameEl.innerText = `Hola, ${user.email}`;

    // Cambiamos la sintaxis para Firestore
    const docRef = db.collection('userScores').doc(user.uid);
    const docSnap = await docRef.get(); // Usamos .get()

    if (docSnap.exists) {
      const data = docSnap.data();

      // Puntuación total
      totalScoreEl.innerText = `${data.totalScore}/100`;

      // Por módulos
      const scores = data.scores;
      moduleScoresEl.innerHTML = '';
      if (scores) {
        for (const [module, score] of Object.entries(scores)) {
          moduleScoresEl.innerHTML += `
            <div class="module-card">
              <strong>${module}</strong><br />
              ${score} punts
            </div>`;
        }
      }

      // Ránking
      const allScoresSnap = await db.collection('userScores').get(); // Usamos .get()
      const allUsers = [];
      allScoresSnap.forEach(doc => {
        const d = doc.data();
        allUsers.push({ uid: doc.id, totalScore: d.totalScore || 0 });
      });

      // Ordenar por score
      allUsers.sort((a, b) => b.totalScore - a.totalScore);
      const position = allUsers.findIndex(u => u.uid === user.uid) + 1;
      rankingEl.innerText = `#${position} de ${allUsers.length}`;

    } else {
      totalScoreEl.innerText = "No se han encontrado resultados";
    }
  });

  // Cerrar sesión
  logoutBtn.addEventListener('click', () => {
    auth.signOut().then(() => { // Usamos auth.signOut()
      window.location.href = "login.html";
    });
  });
});