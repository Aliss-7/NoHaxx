document.addEventListener("DOMContentLoaded", () => {
    const auth = firebase.auth();
    const db = firebase.firestore();
    const path = window.location.pathname;
    const body = document.body;

    // 1. PÁGINAS PÚBLICAS
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

    // ESTRATEGIA ANTI-PARPADEO:
    // Si la página es pública, mostramos el body inmediatamente
    if (esPublica) {
        body.style.display = 'block';
    }

    // 2. VERIFICACIÓN DE USUARIO (UNIFICADA)
    auth.onAuthStateChanged((user) => {
        // Gestionamos la cabecera siempre
        gestionarCabecera(user);

        if (!user) {
            // SI NO HAY USUARIO:
            if (!esPublica) {
                // Si intenta ver algo privado, fuera.
                window.location.href = '/Pantallas/login.html';
            }
        } else {
            // SI HAY USUARIO:
            if (!esPublica) {
                // Verificamos permisos solo en páginas privadas
                verificarAccesoCarpeta(user, path);
            }
        }
    });

    // --- LÓGICA DE CARPETAS ---
    function verificarAccesoCarpeta(user, ruta) {
        const requisitos = {
            '/modulos/2phishing/': { previo: 'introduccion', nombre: 'Phishing' },
            '/modulos/3ransomware/': { previo: 'phishing', nombre: 'Ransomware' },
            '/modulos/4ingenieria/': { previo: 'ransomware', nombre: 'Ingeniería Social' },
            '/modulos/5contrasenas/': { previo: 'ingenieria', nombre: 'Contraseñas' },
            '/modulos/6navegacion/': { previo: 'contrasenas', nombre: 'Navegación Segura' }
        };

        let moduloRestringido = null;
        for (const [clave, datos] of Object.entries(requisitos)) {
            if (ruta.includes(clave)) {
                moduloRestringido = datos;
                break;
            }
        }

        if (moduloRestringido) {
            db.collection('userScores').doc(user.uid).get().then((doc) => {
                const scores = doc.data() ? (doc.data().scores || {}) : {};
                const notaPrevia = scores[moduloRestringido.previo] || 0;

                if (notaPrevia >= 5) {
                    body.style.display = 'block'; // Mostramos solo si tiene permiso
                    verificarAccesoExamen(user, ruta);
                } else {
                    alert(`⛔ ACCESO DENEGADO\n\nDebes aprobar el módulo de ${moduloRestringido.nombre} para entrar aquí.`);
                    window.location.href = '/Pantallas/modulos.html';
                }
            });
        } else {
            // Si es un módulo sin restricciones (como el 1), mostramos body
            body.style.display = 'block';
            verificarAccesoExamen(user, ruta);
        }
    }

    // --- LÓGICA DE EXAMEN ---
    function verificarAccesoExamen(user, ruta) {
        if (!ruta.endsWith('examen.html')) return;

        const mapaModulos = {
            '1introduccion': 'introduccion', '2phishing': 'phishing', '3ransomware': 'ransomware',
            '4ingenieria': 'ingenieria', '5contrasenas': 'contrasenas', '6navegacion': 'navegacion'
        };

        let moduloActual = null;
        for (const [carpeta, clave] of Object.entries(mapaModulos)) {
            if (ruta.includes(carpeta)) { moduloActual = clave; break; }
        }

        if (moduloActual) {
            db.collection('userScores').doc(user.uid).get().then((doc) => {
                const data = doc.data();
                const teoriaCompletada = (data && data.teoria && data.teoria[moduloActual] === true);

                if (!teoriaCompletada) {
                    alert("⚠️ Completa toda la teoría antes del examen.");
                    window.location.href = ruta.replace('examen.html', 'teoria.html');
                }
            });
        }
    }
});

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
        window.location.href = '/Pantallas/login.html';
    });
};