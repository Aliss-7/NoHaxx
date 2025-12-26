document.addEventListener("DOMContentLoaded", () => {
  const auth = firebase.auth();
  const db = firebase.firestore();

  const userNameEl = document.getElementById('userName');
  const userInitialEl = document.getElementById('userInitial');
  const totalScoreEl = document.getElementById('totalScore');
  const moduleScoresEl = document.getElementById('moduleScores');
  const rankingEl = document.getElementById('rankingPosition');
  const logoutBtn = document.getElementById('logoutBtn');

  const TOTAL_MODULOS_POSIBLES = 6; 
  const PUNTOS_POR_MODULO = 10;
  const PUNTUACION_MAXIMA = TOTAL_MODULOS_POSIBLES * PUNTOS_POR_MODULO; 

  auth.onAuthStateChanged(async (user) => {
    if (!user) {
      window.location.href = "login.html";
      return;
    }

    // 1. Mostrar nombre e inicial
    const email = user.email;
    const shortName = email.split('@')[0];
    userNameEl.innerText = shortName;
    if(shortName.length > 0) userInitialEl.innerText = shortName.charAt(0).toUpperCase();

    // 2. Obtener puntuaciones
    const docRef = db.collection('userScores').doc(user.uid);
    const docSnap = await docRef.get();

    if (docSnap.exists) {
      const data = docSnap.data();
      const scores = data.scores || {};
      const puntosBrutos = Object.values(scores).reduce((a, b) => a + b, 0);

      let notaFinal = Math.round((puntosBrutos / PUNTUACION_MAXIMA) * 100);
      if (notaFinal > 100) notaFinal = 100;

      // Animación de conteo simple
      totalScoreEl.innerText = notaFinal;
      
      // Color del anillo según nota (opcional, si quieres manipular el CSS desde aquí)
      const circleEl = document.querySelector('.circle-progress');
      if(notaFinal >= 80) circleEl.style.borderTopColor = "#4caf50";
      else if(notaFinal < 50) circleEl.style.borderTopColor = "#d32f2f";

      // 3. Generar tarjetas de módulos
      moduleScoresEl.innerHTML = '';
      if (Object.keys(scores).length > 0) {
        
        for (const [module, score] of Object.entries(scores)) {
          const nombreModulo = module.charAt(0).toUpperCase() + module.slice(1);
          
          // Lógica de estado
          let statusClass = "failed"; 
          let icon = "⚠️";
          
          if (score === 10) { 
              statusClass = "perfect"; 
              icon = "🏆"; 
          } else if (score >= 5) { 
              statusClass = "passed"; 
              icon = "✅"; 
          }

          // HTML Tarjeta
          moduleScoresEl.innerHTML += `
            <div class="module-result-card ${statusClass}">
              <div>
                 <span class="card-icon">${icon}</span>
                 <div class="card-title">${nombreModulo}</div>
              </div>
              <div class="card-score">
                 ${score}<span>/10</span>
              </div>
            </div>`;
        }
      } else {
        moduleScoresEl.innerHTML = "<p style='grid-column: 1/-1; padding:20px; text-align:center; color:#777;'>Aún no hay módulos completados.</p>";
      }

    } else {
      totalScoreEl.innerText = "0";
      moduleScoresEl.innerHTML = "<p>Sin datos.</p>";
    }

    // 4. Ranking
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
      
      rankingEl.innerText = position > 0 ? `#${position}` : "-";
      
    } catch (error) {
      console.error("Error ranking:", error);
      rankingEl.innerText = "?";
    }
  });
  
  // Logout manual
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      auth.signOut().then(() => window.location.href = "login.html");
    });
  }
});