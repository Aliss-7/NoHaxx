document.addEventListener("DOMContentLoaded", () => {
  const auth = firebase.auth();
  const db = firebase.firestore();

  // Elementos del DOM
  const userNameEl = document.getElementById('userName');
  const userInitialEl = document.getElementById('userInitial');
  const totalScoreEl = document.getElementById('totalScore');
  const moduleScoresEl = document.getElementById('moduleScores');
  const rankingEl = document.getElementById('rankingPosition');
  const logoutBtn = document.getElementById('logoutBtn');

  // Configuración de puntuación
  const TOTAL_MODULOS_POSIBLES = 6; 
  const PUNTOS_POR_MODULO = 10;
  const PUNTUACION_MAXIMA = TOTAL_MODULOS_POSIBLES * PUNTOS_POR_MODULO; 

  // --- NUEVO: LISTA PARA ORDENAR LOS MÓDULOS ---
  // Asegúrate de que estos nombres coinciden con las claves de tu base de datos (suelen ser minúsculas)
  const ORDEN_MODULOS = [
    "introduccion",
    "contrasenas",
    "phishing",
    "ransomware",
    "ingenieria",
    "navegacion"
  ];

  auth.onAuthStateChanged(async (user) => {
    if (!user) {
      window.location.href = "login.html";
      return;
    }

    // --- 1. MOSTRAR INFO USUARIO ---
    const email = user.email;
    const shortName = email.split('@')[0];
    userNameEl.innerText = shortName;
    if(shortName.length > 0) userInitialEl.innerText = shortName.charAt(0).toUpperCase();

    // --- 2. OBTENER PUNTUACIONES ---
    const docRef = db.collection('userScores').doc(user.uid);
    const docSnap = await docRef.get();

    if (docSnap.exists) {
      const data = docSnap.data();
      const scores = data.scores || {};
      const puntosBrutos = Object.values(scores).reduce((a, b) => a + b, 0);

      // Calcular porcentaje total
      let notaFinal = Math.round((puntosBrutos / PUNTUACION_MAXIMA) * 100);
      if (notaFinal > 100) notaFinal = 100;

      // Actualizar el círculo grande global
      totalScoreEl.innerText = notaFinal;
      
      const circleEl = document.querySelector('.circle-progress');
      if (circleEl) {
          if (notaFinal >= 80) circleEl.style.color = "#4caf50"; 
          else if (notaFinal < 50) circleEl.style.color = "#d32f2f";
      }

      // --- 3. GENERAR TARJETAS DE MÓDULOS (ORDENADAS) ---
      moduleScoresEl.innerHTML = ''; 
      
      if (Object.keys(scores).length > 0) {
        
        // Convertimos las puntuaciones en una lista y las ordenamos según ORDEN_MODULOS
        const entradasOrdenadas = Object.entries(scores).sort((a, b) => {
            const indexA = ORDEN_MODULOS.indexOf(a[0].toLowerCase());
            const indexB = ORDEN_MODULOS.indexOf(b[0].toLowerCase());
            
            // Si no está en la lista, lo manda al final
            return (indexA === -1 ? 999 : indexA) - (indexB === -1 ? 999 : indexB);
        });

        for (const [module, score] of entradasOrdenadas) {
          // Mayúscula inicial
          const nombreModulo = module.charAt(0).toUpperCase() + module.slice(1);
          
          // Clase de estado
          let statusClass = "failed"; 
          if (score === 10) statusClass = "perfect"; 
          else if (score >= 5) statusClass = "passed"; 

          // HTML LIMPIO: Solo Título y Número Grande
          moduleScoresEl.innerHTML += `
            <div class="module-result-card ${statusClass}">
              <div class="card-content">
                 <div class="card-title">${nombreModulo}</div>
              </div>
              <div class="card-score">
                 ${score}
              </div>
            </div>`;
        }
      } else {
        moduleScoresEl.innerHTML = "<p style='grid-column: 1/-1; padding:20px; text-align:center; color:#777;'>Aún no hay módulos completados.</p>";
      }

    } else {
      totalScoreEl.innerText = "0";
      moduleScoresEl.innerHTML = "<p style='grid-column: 1/-1; text-align:center;'>Sin datos disponibles.</p>";
    }

    // --- 4. RANKING GLOBAL ---
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
      
      if(rankingEl) rankingEl.innerText = position + "º";
      
    } catch (error) {
      console.error("Error ranking:", error);
      if(rankingEl) rankingEl.innerText = "-";
    }
  });
  
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      auth.signOut().then(() => window.location.href = "login.html");
    });
  }
});