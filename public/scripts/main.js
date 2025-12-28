const comenzarSection = document.getElementById("comenzar-section");
const comenzarBtn = document.getElementById("comenzar-btn");

firebase.auth().onAuthStateChanged((user) => {
  const menuInvitado = document.querySelectorAll('.menu-invitado');
  const menuUsuario = document.querySelectorAll('.menu-usuario');

  if (user) {
    // 1. Visibilidad del menú (Unificado con seguridad.js)
    menuInvitado.forEach(el => el.style.display = 'none');
    menuUsuario.forEach(el => el.style.display = 'inline-block');

    // 2. Mostrar sección de acciones si el usuario está logueado
    if (comenzarSection) {
        comenzarSection.style.display = "block";
        if (comenzarBtn) comenzarBtn.textContent = "Ir a mis Módulos";
    }
  } else {
    // 1. Visibilidad del menú para invitados
    menuInvitado.forEach(el => el.style.display = 'inline-block');
    menuUsuario.forEach(el => el.style.display = 'none');

    // 2. Mostrar sección comenzar redirigiendo a login
    if (comenzarSection) {
        comenzarSection.style.display = "block";
        if (comenzarBtn) {
            comenzarBtn.textContent = "Comenzar";
            comenzarBtn.onclick = (e) => {
                e.preventDefault();
                window.location.href = "login.html";
            };
        }
    }
  }
});