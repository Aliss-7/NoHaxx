document.addEventListener("DOMContentLoaded", () => {
  const auth = firebase.auth();
  const db = firebase.firestore();

  // referencias a los enlaces del HTML
  const linkMod1 = document.getElementById("phishing-link");
  const linkMod2 = document.getElementById("ransomware-link");
  const linkMod3 = document.getElementById("ingenieria-link");

  // URLs de destino
  const urlMod1 = "modulos/phishing/teoria.html";
  const urlMod2 = "modulos/ransomware/teoria.html";
  const urlMod3 = "modulos/ingenieria/teoria.html";

  // función para bloquear un módulo
  const bloquear = (elemento) => {
    if (elemento) {
      elemento.href = "#";
      elemento.classList.add("bloqueado"); // añade estilo gris
      // añadir candado si no lo tiene
      if (!elemento.innerHTML.includes("🔒")) {
        elemento.innerHTML += " 🔒";
      }
      elemento.onclick = (e) => {
        e.preventDefault();
        alert("🔒 ¡Alto ahí! Debes completar el módulo anterior para desbloquear este.");
      };
    }
  };

  // función para desbloquear
  const desbloquear = (elemento, url) => {
    if (elemento) {
      elemento.href = url;
      elemento.classList.remove("bloqueado");
      elemento.innerHTML = elemento.innerHTML.replace(" 🔒", ""); // quitar candado
      elemento.onclick = null; // quitar alerta
    }
  };

  auth.onAuthStateChanged(async (user) => {
    if (user) {
      // módulo 1 abierto, resto bloqueados
      desbloquear(linkMod1, urlMod1);
      bloquear(linkMod2);
      bloquear(linkMod3);

      // consultar progreso en Firestore
      try {
        const docRef = db.collection("userScores").doc(user.uid);
        const docSnap = await docRef.get();

        if (docSnap.exists) {
          const data = docSnap.data();
          const scores = data.scores || {};

          if (scores.phishing && scores.phishing >= 5) {
            desbloquear(linkMod2, urlMod2);
          }

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