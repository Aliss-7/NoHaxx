document.addEventListener("DOMContentLoaded", () => {
  const auth = firebase.auth();
  const form = document.getElementById("registro-form");
  const mensajeError = document.getElementById("mensaje-error");
  const passwordInput = document.getElementById("password");
  const mensajeErrorPass = document.getElementById("mensaje-error-password");

  // validar contraseña
  // mínimo 8 caracteres, al menos una mayúscula, una minúscula, un número y un símbolo
  const passRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;

  // validar la contraseña en tiempo real al escribir
  passwordInput.addEventListener("input", () => {
    const password = passwordInput.value;
    if (!passRegex.test(password)) {
      mensajeErrorPass.textContent =
        "❗ La contraseña debe tener mínimo 8 caracteres, incluyendo mayúscula, minúscula, número y símbolo.";
    } else {
      mensajeErrorPass.textContent = "";
    }
  });

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    mensajeError.textContent = "";

    const nombre = document.getElementById("nombre").value.trim();
    const apellidos = document.getElementById("apellidos").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = passwordInput.value;
    const confirmar = document.getElementById("confirmar-password").value;
    const telefono = document.getElementById("telefono").value.trim();
    const departamento = document.getElementById("departamento").value.trim();

    if (!nombre || !apellidos || !email || !password || !confirmar) {
      mensajeError.textContent = "❗ Todos los campos obligatorios deben completarse.";
      return;
    }

    if (password !== confirmar) {
      mensajeError.textContent = "❗ Las contraseñas no coinciden.";
      return;
    }

    if (!passRegex.test(password)) {
      mensajeError.textContent =
        "❗ La contraseña debe tener mínimo 8 caracteres, incluyendo mayúscula, minúscula, número y símbolo.";
      return;
    }

    auth.createUserWithEmailAndPassword(email, password)
      .then((userCredential) => {
        const user = userCredential.user;
        const db = firebase.firestore();

        db.collection("usuarios").doc(user.uid).set({
          nombre: nombre,
          apellidos: apellidos,
          email: user.email,
          telefono: telefono || null,
          departamento: departamento || null,
          creado: firebase.firestore.FieldValue.serverTimestamp()
        })
          .then(() => {
            window.location.href = "/registro-exitoso";
          })
          .catch((error) => {
            console.error("Error al guardar en Firestore:", error);
            mensajeError.textContent = "Error al guardar en Firestore: " + error.message;
          });
      })
      .catch((error) => {
        if (error.code === "auth/email-already-in-use") {
          mensajeError.textContent = "El correo ya está registrado. Intenta iniciar sesión.";
        } else if (error.code === "auth/invalid-email") {
          mensajeError.textContent = "El correo electrónico no es válido.";
        } else if (error.code === "auth/weak-password") {
          mensajeError.textContent = "La contraseña es muy débil.";
        } else {
          console.error("Error al registrar usuario:", error);
          mensajeError.textContent = "Error al registrar: " + error.message;
        }
      });
  });
});
