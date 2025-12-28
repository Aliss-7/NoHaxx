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

    if (esPublica) {
        body.style.display = 'block';
        auth.onAuthStateChanged((user) => {
            gestionarCabecera(user);
        });
        return; 
    }

    // 2. VERIFICACIÓN DE USUARIO
    auth.onAuthStateChanged((user) => {
        if (!user) {
            window.location.href = '/Pantallas/login.html';
        } else {
            // A) Verificar Permisos de Módulo (El "Pasillo")
            // Comprueba si puedes entrar a la carpeta del módulo basándose en el anterior
            const accesoCarpeta = verificarAccesoCarpeta(user, path);
            
            // B) Verificar Permiso de Examen (La "Puerta del Examen")
            // Si intenta entrar al examen, comprueba si hizo la teoría
            if (accesoCarpeta) {
                verificarAccesoExamen(user, path);
            }

            gestionarCabecera(user);
        }
    });

    // --- LÓGICA DE CARPETAS (Módulo N requiere aprobar Módulo N-1) ---
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
                const scores = doc.data() ? doc.data().scores : {};
                const notaPrevia = scores ? scores[moduloRestringido.previo] : 0;

                if (notaPrevia >= 5) {
                    // Acceso permitido a la carpeta, ahora veremos si es el examen
                } else {
                    alert(`⛔ ACCESO DENEGADO\n\nDebes aprobar el módulo de ${moduloRestringido.nombre} (mínimo 5) para entrar aquí.`);
                    window.location.href = '/Pantallas/modulos.html';
                    return false;
                }
            });
        }
        return true; 
    }

    // --- LÓGICA DE EXAMEN (Examen N requiere Teoría N) ---
    function verificarAccesoExamen(user, ruta) {
        // Solo nos importa si está intentando entrar en un examen
        if (!ruta.endsWith('examen.html')) {
            document.body.style.display = 'block';
            return;
        }

        // Detectar en qué módulo estamos
        const mapaModulos = {
            '1introduccion': 'introduccion',
            '2phishing': 'phishing',
            '3ransomware': 'ransomware',
            '4ingenieria': 'ingenieria',
            '5contrasenas': 'contrasenas',
            '6navegacion': 'navegacion'
        };

        let moduloActual = null;
        for (const [carpeta, clave] of Object.entries(mapaModulos)) {
            if (ruta.includes(carpeta)) {
                moduloActual = clave;
                break;
            }
        }

        if (moduloActual) {
            db.collection('userScores').doc(user.uid).get().then((doc) => {
                const data = doc.data();
                // Miramos si existe el campo teoria.[modulo] == true
                const teoriaCompletada = (data && data.teoria && data.teoria[moduloActual] === true);

                if (teoriaCompletada) {
                    document.body.style.display = 'block';
                } else {
                    // Si no ha hecho la teoría, lo mandamos a la teoría
                    console.warn("Intento de acceso a examen sin teoría.");
                    alert("⚠️ Antes de realizar el examen, debes completar toda la teoría y ejercicios.");
                    // Reemplazamos 'examen.html' por 'teoria.html' en la URL
                    window.location.href = ruta.replace('examen.html', 'teoria.html');
                }
            });
        } else {
            // Por si acaso no detecta módulo (raro), mostramos
            document.body.style.display = 'block';
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


// --- FUNCIÓN GLOBAL DE LOGOUT ---
window.cerrarSesion = function() {
    firebase.auth().signOut().then(() => {
        window.location.href = '/Pantallas/login.html';
    }).catch((error) => {
        console.error("Error al cerrar sesión:", error);
    });
};