document.addEventListener("DOMContentLoaded", () => {
  const auth = firebase.auth();
  const db = firebase.firestore();

  const links = {
    intro: document.getElementById("intro-link"),
    phishing: document.getElementById("phishing-link"),
    ransomware: document.getElementById("ransomware-link"),
    ingenieria: document.getElementById("ingenieria-link"),
    contrasenas: document.getElementById("contrasenas-link"),
    navegacion: document.getElementById("navegacion-link")
  };

  const urls = {
    intro: "modulos/1introduccion/teoria.html",
    phishing: "modulos/2phishing/teoria.html",
    ransomware: "modulos/3ransomware/teoria.html",
    ingenieria: "modulos/4ingenieria/teoria.html",
    contrasenas: "modulos/5contrasenas/teoria.html",
    navegacion: "modulos/6navegacion/teoria.html"
  };

  // Función de bloqueo
  const bloquear = (el) => {
    if (el) {
      el.href = "#";
      el.classList.add("bloqueado");
      if (!el.innerText.includes("🔒")) el.innerText += " 🔒";
      el.onclick = (e) => { e.preventDefault(); alert("🔒 Completa el módulo anterior para desbloquear."); };
    }
  };

  // Función de desbloqueo
  const desbloquear = (el, url) => {
    if (el) {
      el.href = url;
      el.classList.remove("bloqueado");
      el.innerText = el.innerText.replace(" 🔒", "");
      el.onclick = null;
    }
  };

  auth.onAuthStateChanged(async (user) => {
    if (user) {
      // 1 Intro abierta resto cerrado
      desbloquear(links.intro, urls.intro);
      bloquear(links.phishing);
      bloquear(links.ransomware);
      bloquear(links.ingenieria);
      bloquear(links.contrasenas);
      bloquear(links.navegacion);

      try {
        const docSnap = await db.collection("userScores").doc(user.uid).get();
        if (docSnap.exists) {
          const s = docSnap.data().scores || {};

          // cadena de desbloqueo
          if (s.introduccion >= 5) desbloquear(links.phishing, urls.phishing);
          if (s.phishing >= 5) desbloquear(links.ransomware, urls.ransomware);
          if (s.ransomware >= 5) desbloquear(links.ingenieria, urls.ingenieria);
          if (s.ingenieria >= 5) desbloquear(links.contrasenas, urls.contrasenas);
          if (s.contrasenas >= 5) desbloquear(links.navegacion, urls.navegacion);
        }
      } catch (error) { console.error("Error:", error); }
    } else {
      window.location.href = "login.html";
    }
  });
});