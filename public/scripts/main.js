const comenzarSection = document.getElementById("comenzar-section");
const comenzarBtn = document.getElementById("comenzar-btn");

firebase.auth().onAuthStateChanged((user) => {
  const menuInvitado = document.querySelectorAll('.menu-invitado');
  const menuUsuario = document.querySelectorAll('.menu-usuario');

  if (user) {
    // Visibilidad del menú
    menuInvitado.forEach(el => el.style.display = 'none');
    menuUsuario.forEach(el => el.style.display = 'inline-block');

    // Mostrar sección de acciones si el usuario está logueado
    if (comenzarSection) {
        comenzarSection.style.display = "block";
        if (comenzarBtn) comenzarBtn.textContent = "Ir a mis Módulos";
    }
  } else {
    // Visibilidad del menú para invitados
    menuInvitado.forEach(el => el.style.display = 'inline-block');
    menuUsuario.forEach(el => el.style.display = 'none');

    // Mostrar sección comenzar redirigiendo a login
    if (comenzarSection) {
        comenzarSection.style.display = "block";
        if (comenzarBtn) {
            comenzarBtn.textContent = "Comenzar";
            comenzarBtn.onclick = (e) => {
                e.preventDefault();
                window.location.href = "/login";
            };
        }
    }
  }
});