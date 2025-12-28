document.addEventListener("DOMContentLoaded", () => {
    const auth = firebase.auth();
    const db = firebase.firestore();
    const path = window.location.pathname;
    const body = document.body;

    // 1. PÁGINAS PÚBLICAS (Actualizado con rutas limpias)
    const paginasPublicas = [
        '/',
        '/inicio',
        '/login',
        '/registro',
        '/contacto'
    ];

    const esPublica = paginasPublicas.some(p => path === p || path.endsWith(p));

    // 2. VERIFICACIÓN DE USUARIO
    auth.onAuthStateChanged((user) => {
        if (user) {
            localStorage.setItem('usuarioLogueado', 'true');
        } else {
            localStorage.removeItem('usuarioLogueado');
        }

        gestionarCabecera(user);
        resaltarSeccionActual();

        if (!user) {
            if (!esPublica) {
                // Redirección a la ruta limpia configurada en firebase.json
                window.location.href = '/login';
            } else {
                body.style.display = 'block';
            }
        } else {
            if (!esPublica) {
                verificarAccesoCarpeta(user, path);
            } else {
                body.style.display = 'block';
            }
        }
    });

    // --- LÓGICA DE CARPETAS ---
    function verificarAccesoCarpeta(user, ruta) {
        // Mantenemos los requisitos por carpeta física ya que el path real sigue conteniendo estos nombres
        const requisitos = {
            '/modulos/2phishing/': { previo: 'introduccion', nombre: 'Phishing' },
            '/modulos/3ransomware/': { previo: 'phishing', nombre: 'Ransomware' },
            '/modulos/4ingenieria/': { previo: 'ransomware', nombre: 'Ingeniería Social' },
            '/modulos/5contrasenas/': { previo: 'ingenieria', nombre: 'Contraseñas' },
            '/modulos/6navegacion/': { previo: 'contrasenas', nombre: 'Navegación Segura' }
        };

        let moduloRestringido = null;
        for (const [clave, datos] of Object.entries(requisitos)) {
            // Se usa includes para detectar la carpeta física aunque la URL sea limpia
            if (ruta.includes(clave) || ruta.includes(clave.split('/')[2])) { 
                moduloRestringido = datos;
                break;
            }
        }

        if (moduloRestringido) {
            db.collection('userScores').doc(user.uid).get().then((doc) => {
                const scores = doc.data() ? (doc.data().scores || {}) : {};
                const notaPrevia = scores[moduloRestringido.previo] || 0;

                if (notaPrevia >= 5) {
                    body.style.display = 'block'; 
                    verificarAccesoExamen(user, ruta);
                } else {
                    alert(`⛔ ACCESO DENEGADO\n\nDebes aprobar el módulo de ${moduloRestringido.nombre} para entrar aquí.`);
                    window.location.href = '/modulos'; // Ruta limpia
                }
            });
        } else {
            body.style.display = 'block';
            verificarAccesoExamen(user, ruta);
        }
    }

    // --- LÓGICA DE EXAMEN ---
    function verificarAccesoExamen(user, ruta) {
        // Detectamos si la ruta limpia termina en /examen
        if (!ruta.endsWith('/examen') && !ruta.endsWith('examen.html')) return;

        const mapaModulos = {
            'introduccion': 'introduccion', 'phishing': 'phishing', 'ransomware': 'ransomware',
            'ingenieria': 'ingenieria', 'contrasenas': 'contrasenas', 'navegacion': 'navegacion'
        };

        let moduloActual = null;
        for (const [claveUrl, claveDb] of Object.entries(mapaModulos)) {
            if (ruta.includes(claveUrl)) { moduloActual = claveDb; break; }
        }

        if (moduloActual) {
            db.collection('userScores').doc(user.uid).get().then((doc) => {
                const data = doc.data();
                const teoriaCompletada = (data && data.teoria && data.teoria[moduloActual] === true);

                if (!teoriaCompletada) {
                    alert("⚠️ Completa toda la teoría antes del examen.");
                    // Redirige a la versión de teoría limpia
                    window.location.href = ruta.replace('/examen', '/teoria');
                }
            });
        }
    }
});

// Función optimizada para rutas limpias (/perfil, /modulos, etc)
function resaltarSeccionActual() {
    const path = window.location.pathname;
    const menuLinks = document.querySelectorAll('.top-buttons a');

    menuLinks.forEach(link => {
        const href = link.getAttribute('href');
        
        if (!href || href === '#') return;

        // Si la ruta exacta coincide (ej: /perfil === /perfil)
        // O si es inicio ( / === /inicio o /inicio === /inicio )
        const esInicio = (path === '/' || path === '/inicio') && href === '/inicio';
        
        if (path === href || esInicio) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
}

function gestionarCabecera(user) {
    const menuInvitado = document.querySelectorAll('.menu-invitado');
    const menuUsuario = document.querySelectorAll('.menu-usuario');

    if (user) {
        menuInvitado.forEach(el => el.style.display = 'none');
        menuUsuario.forEach(el => el.style.display = 'inline-block');
    } else {
        menuInvitado.forEach(el => el.style.display = 'inline-block');
        menuUsuario.forEach(el => el.style.display = 'none');
    }
}

window.cerrarSesion = function() {
    firebase.auth().signOut().then(() => {
        localStorage.removeItem('usuarioLogueado');
        window.location.href = '/login';
    });
};