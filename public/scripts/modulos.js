document.addEventListener("DOMContentLoaded", () => {
  const auth = firebase.auth();
  const db = firebase.firestore();

  // Referencias a los enlaces del HTML
  const linkMod1 = document.getElementById("phishing-link");
  const linkMod2 = document.getElementById("ransomware-link");
  const linkMod3 = document.getElementById("ingenieria-link");

  // URLs de destino (Asegúrate de que las rutas son correctas)
  const urlMod1 = "modulos/phishing/teoria.html";
  const urlMod2 = "modulos/ransomware/teoria.html";
  const urlMod3 = "modulos/ingenieria/teoria.html";

  // Función para bloquear un módulo
  const bloquear = (elemento) => {
    if (elemento) {
      elemento.href = "#"; // Desactiva el enlace
      elemento.classList.add("bloqueado"); // Añade estilo gris
      // Añadir candado si no lo tiene
      if (!elemento.innerHTML.includes("🔒")) {
        elemento.innerHTML += " 🔒";
      }
      elemento.onclick = (e) => {
        e.preventDefault();
        alert("🔒 ¡Alto ahí! Debes completar el módulo anterior para desbloquear este.");
      };
    }
  };

  // Función para desbloquear
  const desbloquear = (elemento, url) => {
    if (elemento) {
      elemento.href = url;
      elemento.classList.remove("bloqueado");
      elemento.innerHTML = elemento.innerHTML.replace(" 🔒", ""); // Quitar candado
      elemento.onclick = null; // Quitar alerta
    }
  };

  auth.onAuthStateChanged(async (user) => {
    if (user) {
      // 1. Estado inicial: Módulo 1 Abierto, Resto Bloqueados
      desbloquear(linkMod1, urlMod1);
      bloquear(linkMod2);
      bloquear(linkMod3);

      // 2. Consultar progreso en Firestore
      try {
        const docRef = db.collection("userScores").doc(user.uid);
        const docSnap = await docRef.get();

        if (docSnap.exists) {
          const data = docSnap.data();
          const scores = data.scores || {};

          // Lógica de desbloqueo:
          // Si aprobó Phishing (tiene puntuación) -> Desbloquea Ransomware
          if (scores.phishing && scores.phishing >= 5) {
            desbloquear(linkMod2, urlMod2);
          }

          // Si aprobó Ransomware -> Desbloquea Ingeniería Social
          if (scores.ransomware && scores.ransomware >= 5) {
            desbloquear(linkMod3, urlMod3);
          }
        }
      } catch (error) {
        console.error("Error al leer progreso:", error);
      }
    } else {
      window.location.href = "login.html";
    }
  });
});