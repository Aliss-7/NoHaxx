document.addEventListener("DOMContentLoaded", () => {
    const auth = firebase.auth();
    const emailInput = document.getElementById("email");
    const passwordInput = document.getElementById("password");
    const form = document.getElementById("login-form");
    const loginBtn = document.getElementById("login-btn");
    const mensajeError = document.getElementById("mensaje-error");
  
    // redirigir si ya hay sesión iniciada
    auth.onAuthStateChanged((user) => {
      if (user) {
        window.location.href = "/modulos";
      }
    });
   
    // iniciar sesión cuando se envía el formulario
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      
      mensajeError.textContent = "";
      const email = emailInput.value;
      const password = passwordInput.value;
  
      auth.signInWithEmailAndPassword(email, password)
        .then(() => {
          window.location.href = "/inicio";
        })
        .catch((error) => {
            console.log("Código de error:", error.code);
          
            if (error.code === 'auth/invalid-login-credentials' || error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
              mensajeError.textContent = "⚠️ Usuario o contraseña incorrectos.";
            } else if (error.code === 'auth/invalid-email') {
              mensajeError.textContent = "⚠️ El correo electrónico no es válido.";
            } else if (error.code === 'auth/too-many-requests') {
              mensajeError.textContent = "⚠️ Demasiados intentos fallidos. Inténtalo más tarde.";
            } else {
              mensajeError.textContent = "Error: " + error.message;
            }
        });         
    });
});

firebase.auth().signInWithEmailAndPassword(email, password)
  .then((userCredential) => {
    localStorage.setItem('usuarioLogueado', 'true');
    window.location.href = "/inicio";
  });