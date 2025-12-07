  const comenzarSection = document.getElementById("comenzar-section");
  const comenzarBtn = document.getElementById("comenzar-btn");
  const loginLink = document.getElementById("login-link");
  const navButtons = document.getElementById("nav-buttons");
  
  firebase.auth().onAuthStateChanged((user) => {
    if (user) {
      // ocultar botón Login
      if (loginLink) loginLink.style.display = "none";
  
      // añadir botón Módulos si está logueado
      if (!document.getElementById("modulos-link")) {
        const modulosLink = document.createElement("a");
        modulosLink.href = "/modulos.html";
        modulosLink.textContent = "Módulos";
        modulosLink.id = "modulos-link";
        navButtons.insertBefore(modulosLink, navButtons.firstChild);
      }
    } else {
      // mostrar botón Comenzar si no hay sesión
      comenzarSection.style.display = "block";
      comenzarBtn.addEventListener("click", (e) => {
        e.preventDefault();
        window.location.href = "/login.html";
      });
    }
  });
  