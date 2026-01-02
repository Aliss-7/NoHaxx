document.addEventListener("DOMContentLoaded", () => {
  const auth = firebase.auth();
  const db = firebase.firestore();

  const userNameEl = document.getElementById('userName');
  const userInitialEl = document.getElementById('userInitial');
  const totalScoreEl = document.getElementById('totalScore');
  const moduleScoresEl = document.getElementById('moduleScores');
  const rankingEl = document.getElementById('rankingPosition');
  const logoutBtn = document.getElementById('logoutBtn');

  // Configuración de puntuación
  const TOTAL_MODULOS_POSIBLES = 6; 
  const PUNTOS_POR_MODULO = 10; 

  const ORDEN_MODULOS = [
    "introduccion",
    "phishing",
    "ransomware",
    "ingenieria",
    "contrasenas",
    "navegacion"
  ];

  auth.onAuthStateChanged(async (user) => {
    if (!user) {
      window.location.href = "/login";
      return;
    }

    // INFO USUARIO
    const email = user.email;
    const shortName = email.split('@')[0];
    userNameEl.innerText = shortName;
    if(shortName.length > 0) userInitialEl.innerText = shortName.charAt(0).toUpperCase();

    // PUNTUACIONES
    const docRef = db.collection('userScores').doc(user.uid);
    const docSnap = await docRef.get();

    if (docSnap.exists) {
      const data = docSnap.data();
      const scores = data.scores || {};

      // CÁLCULO DE NOTA MEDIA
      const modulosCompletados = Object.keys(scores).length;
      const puntosBrutos = Object.values(scores).reduce((a, b) => a + b, 0);

      let notaMedia = 0;
      if (modulosCompletados > 0) {
        notaMedia = Math.round((puntosBrutos / (modulosCompletados * 10)) * 100);
      }
      if (notaMedia > 100) notaMedia = 100;

      totalScoreEl.innerText = notaMedia;
      
      const circleEl = document.querySelector('.circle-progress');
      if (circleEl) {
          if (notaMedia >= 80) circleEl.style.color = "#4caf50"; 
          else if (notaMedia >= 50) circleEl.style.color = "#ffa000";
          else circleEl.style.color = "#d32f2f";

          const label = circleEl.querySelector('.circle-label');
          if(label) label.innerText = "Media";

          let progressText = document.getElementById('progreso-detalle');
          if(!progressText) {
             progressText = document.createElement('div');
             progressText.id = 'progreso-detalle';
             progressText.style.fontSize = '0.9rem'; 
             progressText.style.marginTop = '5px';
             progressText.style.color = '#666';
             progressText.style.fontWeight = 'normal';
             circleEl.appendChild(progressText);
          }
          progressText.innerText = `${modulosCompletados} de ${TOTAL_MODULOS_POSIBLES} completados`;
      }

      // GENERAR TARJETAS DE MÓDULOS
      moduleScoresEl.innerHTML = ''; 
      
      for (const moduleKey of ORDEN_MODULOS) {
          const score = scores[moduleKey]; 
          const nombreModulo = moduleKey.charAt(0).toUpperCase() + moduleKey.slice(1);
          
          const card = document.createElement('div');
          
          if (score !== undefined) {
              let statusClass = "failed"; 
              if (score === 10) statusClass = "perfect"; 
              else if (score >= 5) statusClass = "passed"; 

              card.className = `module-result-card ${statusClass}`;
              card.innerHTML = `
                  <div class="card-content">
                     <div class="card-title">${nombreModulo}</div> 
                  </div>
                  <div class="card-score">
                     ${score}
                  </div>
              `;
          } else {
              card.className = `module-result-card locked`;
              card.innerHTML = `
                  <div class="card-content">
                     <div class="card-title">${nombreModulo}</div> 
                  </div>
                  <div class="card-score" style="color: #ccc;">
                     -
                  </div>
              `;
          }

          moduleScoresEl.appendChild(card);
      }

    } else {
      totalScoreEl.innerText = "0";
      moduleScoresEl.innerHTML = "<p style='grid-column: 1/-1; text-align:center;'>Sin datos disponibles.</p>";
    }

    if(rankingEl) rankingEl.innerText = "-";

  });
  
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      auth.signOut().then(() => window.location.href = "login.html");
    });
  }
});