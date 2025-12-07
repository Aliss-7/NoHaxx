document.addEventListener("DOMContentLoaded", () => {
  const auth = firebase.auth();
  const db = firebase.firestore();

  const config = {
    intro:       { id: "intro-link",       url: "modulos/1introduccion/teoria.html" },
    phishing:    { id: "phishing-link",    url: "modulos/2phishing/teoria.html" },
    ransomware:  { id: "ransomware-link",  url: "modulos/3ransomware/teoria.html" },
    ingenieria:  { id: "ingenieria-link",  url: "modulos/4ingenieria/teoria.html" },
    contrasenas: { id: "contrasenas-link", url: "modulos/5contrasenas/teoria.html" },
    navegacion:  { id: "navegacion-link",  url: "modulos/6navegacion/teoria.html" }
  };

  const bloquear = (key) => {
    const el = document.getElementById(config[key].id);
    if (el) {
      el.href = "#";
      el.classList.add("bloqueado");
      if (!el.innerText.includes("🔒")) el.innerText += " 🔒";
      el.onclick = (e) => {
        e.preventDefault();
        alert("🔒 Debes aprobar el módulo anterior para acceder.");
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

  auth.onAuthStateChanged(async (user) => {
    if (!user) {
      window.location.href = "login.html";
      return;
    }

    // intro abierta el resto cerrado
    desbloquear("intro");
    bloquear("phishing");
    bloquear("ransomware");
    bloquear("ingenieria");
    bloquear("contrasenas");
    bloquear("navegacion");

    try {
      const docRef = db.collection("userScores").doc(user.uid);
      const docSnap = await docRef.get();

      if (docSnap.exists) {
        const s = docSnap.data().scores || {};

        // desbloqueo en cadena
        if (s.introduccion >= 5) desbloquear("phishing");
        if (s.phishing >= 5) desbloquear("ransomware");
        if (s.ransomware >= 5) desbloquear("ingenieria");
        if (s.ingenieria >= 5) desbloquear("contrasenas");
        if (s.contrasenas >= 5) desbloquear("navegacion");
      }
    } catch (error) {
      console.error("Error al leer progreso:", error);
    }
  });
});