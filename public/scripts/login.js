document.addEventListener("DOMContentLoaded", () => {
    const auth = firebase.auth();
    const emailInput = document.getElementById("email");
    const passwordInput = document.getElementById("password");
    const form = document.getElementById("login-form");
    const loginBtn = document.getElementById("login-btn");
    const mensajeError = document.getElementById("mensaje-error");
  
    // Redirigir si ya hay sesión
    auth.onAuthStateChanged((user) => {
      if (user) {
        window.location.href = "modulos.html";
      }
    });
  
    // Iniciar sesión solo si se pulsa el botón de login
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const email = emailInput.value;
      const password = passwordInput.value;
  
      auth.signInWithEmailAndPassword(email, password)
        .then(() => {
          window.location.href = "modulos.html";
        })
        .catch((error) => {
            console.log("Código de error:", error.code);
          
            if (error.code === 'auth/invalid-login-credentials') {
              console.log("Entró en el if de invalid-login-credentials");
              mensajeError.textContent = "⚠️ ERROR DE AUTENTICACIÓN: Usuario o contraseña incorrectos. Si no estás registrado, haz clic en Registrarte.";
            } else {
              console.log("Entró en el else");
              mensajeError.textContent = "Error al iniciar sesión: " + error.message;
            }
          });
          
          
                    
    });