document.addEventListener("DOMContentLoaded", () => {
    const path = window.location.pathname;
    
    const paginasPublicas = [
        '/',
        '/index.html',
        '/Pantallas/login.html',
        '/Pantallas/registro.html',
        '/Pantallas/contacto.html',
        'login.html',
        'registro.html',
        'contacto.html'
    ];

    const esPublica = paginasPublicas.some(p => path.endsWith(p));

    firebase.auth().onAuthStateChanged((user) => {
        
        // --- A) SEGURIDAD DE URL ---
        if (!user && !esPublica) {
            // Si no hay usuario y la página NO es pública, expulsar al Login
            console.warn("Acceso denegado. Redirigiendo al login...");
            window.location.href = '/Pantallas/login.html';
            return; // Detener ejecución
        }

        // --- B) CABECERA DINÁMICA ---
        const menuInvitado = document.querySelectorAll('.menu-invitado');
        const menuUsuario = document.querySelectorAll('.menu-usuario');

        if (user) {
            // USUARIO LOGUEADO: Mostrar menús de usuario, ocultar de invitado
            menuInvitado.forEach(el => el.style.display = 'none');
            menuUsuario.forEach(el => el.style.display = 'inline-block');
        } else {
            // INVITADO: Mostrar menús de login/registro, ocultar módulos/perfil
            menuInvitado.forEach(el => el.style.display = 'inline-block');
            menuUsuario.forEach(el => el.style.display = 'none');
        }
    });
});

function cerrarSesion() {
    firebase.auth().signOut().then(() => {
        window.location.href = '/index.html'; 
        
    }).catch((error) => {
        console.error("Error al cerrar sesión", error);
    });
}