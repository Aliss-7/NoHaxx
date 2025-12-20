document.addEventListener("DOMContentLoaded", () => {
  const auth = firebase.auth();
  const db = firebase.firestore();

  const config = {
    intro:       { id: "intro-link",       url: "../modulos/1introduccion/teoria.html" },
    phishing:    { id: "phishing-link",    url: "../modulos/2phishing/teoria.html" },
    ransomware:  { id: "ransomware-link",  url: "../modulos/3ransomware/teoria.html" },
    ingenieria:  { id: "ingenieria-link",  url: "../modulos/4ingenieria/teoria.html" },
    contrasenas: { id: "contrasenas-link", url: "../modulos/5contrasenas/teoria.html" },
    navegacion:  { id: "navegacion-link",  url: "../modulos/6navegacion/teoria.html" }
  };

  const bloquear = (key) => {
    const el = document.getElementById(config[key].id);
    if (el) {
      el.href = "#";
      el.classList.add("bloqueado");
      el.classList.remove("aprobado");
      if (!el.innerText.includes("🔒")) el.innerText += " 🔒";
      el.onclick = (e) => {
        e.preventDefault();
        alert("🔒 Debes aprobar el módulo anterior para acceder a este.");
      };
    }
  };

  const desbloquear = (key) => {
    const el = document.getElementById(config[key].id);
    if (el) {
      el.href = config[key].url;
      el.classList.remove("bloqueado");
      el.innerText = el.innerText.replace(" 🔒", "");
      el.onclick = null;
    }
  };

  const marcarAprobado = (key) => {
    const el = document.getElementById(config[key].id);
    if (el) {
      el.classList.add("aprobado");
    }
  };

  auth.onAuthStateChanged(async (user) => {
    if (!user) {
      window.location.href = "login.html";
      return;
    }

    // Intro abierto resto cerrado
    desbloquear("intro");
    bloquear("phishing");
    bloquear("ransomware");
    bloquear("ingenieria");
    bloquear("contrasenas");
    bloquear("navegacion");

    try {
      // Leer puntuaciones de Firebase
      const docRef = db.collection("userScores").doc(user.uid);
      const docSnap = await docRef.get();

      if (docSnap.exists) {
        const s = docSnap.data().scores || {};

        // Lógica de Aprobado
        
        // Si se aprueba Introducción
        if (s.introduccion >= 5) {
            marcarAprobado("intro");
            desbloquear("phishing");
        }

        // Si se aprueba Phishing
        if (s.phishing >= 5) {
            marcarAprobado("phishing");
            desbloquear("ransomware");
        }

        // Si se aprueba Ransomware
        if (s.ransomware >= 5) {
            marcarAprobado("ransomware");
            desbloquear("ingenieria");
        }

        // Si se aprueba Ingeniería Social
        if (s.ingenieria >= 5) {
            marcarAprobado("ingenieria");
            desbloquear("contrasenas");
        }

        // Si se aprueba Contraseñas
        if (s.contrasenas >= 5) {
            marcarAprobado("contrasenas");
            desbloquear("navegacion");
        }

        // Si se aprueba Navegación
        if (s.navegacion >= 5) {
            marcarAprobado("navegacion");
        }
      }
    } catch (error) {
      console.error("Error al leer progreso:", error);
    }
  });
});