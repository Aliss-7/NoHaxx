document.addEventListener("DOMContentLoaded", () => {
    // Inicializar EmailJS
    emailjs.init("lyJuBtfl7qfLrX__9"); 
  
    const form = document.getElementById("contact-form");
    const mensaje = document.getElementById("form-mensaje");
    const navButtons = document.getElementById("nav-buttons");
    const auth = firebase.auth();

    // Controlar el Header según el estado de sesión
    auth.onAuthStateChanged((user) => {
        if (user) {
            // USUARIO LOGUEADO: Mostrar menú completo
            if(form.reply_to && !form.reply_to.value) {
                form.reply_to.value = user.email;
            }

            navButtons.innerHTML = `
                <a href="index.html">Inicio</a>
                <a href="modulos.html">Módulos</a>
                <a href="resultados.html">Resultados</a>
                <a href="perfil.html">Perfil</a>
                <a href="contacto.html" style="background-color: #eee; color: #000; font-weight: bold;">Contacto</a>
                <a href="#" id="logout-btn" style="background-color: #d32f2f; color: white;">Cerrar sesión</a>
            `;

            // Activar botón de logout
            const logoutBtn = document.getElementById("logout-btn");
            logoutBtn.addEventListener("click", (e) => {
                e.preventDefault();
                auth.signOut().then(() => window.location.href = "login.html");
            });

        } else {
            // USUARIO VISITANTE: Mostrar menú básico
            navButtons.innerHTML = `
                <a href="index.html">Inicio</a>
                <a href="login.html" style="background-color: #333; color: white;">Login</a>
            `;
        }
    });

    // Lógica del Formulario
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      
      const btnEnviar = document.getElementById("enviar-btn");
      const textoOriginal = btnEnviar.innerText;
      
      // Feedback visual de carga
      btnEnviar.innerText = "Enviando...";
      btnEnviar.disabled = true;
      mensaje.textContent = "";

      const nombre = form.from_name.value.trim();
      const email = form.reply_to.value.trim();
      const asunto = form.subject.value.trim();
      const mensajeTexto = form.message.value.trim();
  
      if (!nombre || !email || !asunto || !mensajeTexto) {
        mensaje.textContent = "Por favor, completa todos los campos obligatorios.";
        mensaje.style.color = "#d32f2f"; // Rojo
        btnEnviar.innerText = textoOriginal;
        btnEnviar.disabled = false;
        return;
      }
  
      emailjs.send("service_q85vr9x", "template_u7g3kfn", {
        from_name: nombre,
        reply_to: email,
        subject: asunto,
        message: mensajeTexto,
      })
      .then(() => {
        mensaje.textContent = "¡Mensaje enviado con éxito! Te responderemos pronto.";
        mensaje.style.color = "#4caf50";
        form.reset();
      })
      .catch((error) => {
        console.error("Error al enviar el mensaje:", error);
        mensaje.textContent = "Hubo un error al enviar. Por favor intenta más tarde.";
        mensaje.style.color = "#d32f2f";
      })
      .finally(() => {
        btnEnviar.innerText = textoOriginal;
        btnEnviar.disabled = false;
      });
    });
});