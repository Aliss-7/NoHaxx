document.addEventListener("DOMContentLoaded", () => {
    emailjs.init("lyJuBtfl7qfLrX__9"); // Inicializas con tu public key
  
    const form = document.getElementById("contact-form");
    const mensaje = document.getElementById("form-mensaje");

    form.addEventListener("submit", (e) => {
      e.preventDefault();
  
      const nombre = form.from_name.value.trim();
      const email = form.reply_to.value.trim();
      const asunto = form.subject.value.trim();
      const mensajeTexto = form.message.value.trim();
  
      if (!nombre || !email || !asunto || !mensajeTexto) {
        mensaje.textContent = "Por favor, completa todos los campos obligatorios.";
        mensaje.style.color = "red";
        return;
      }
  
      emailjs.send("service_q85vr9x", "template_u7g3kfn", {
        from_name: nombre,
        reply_to: email,
        subject: asunto,
        message: mensajeTexto,
      })
      .then(() => {
        mensaje.textContent = "¡Gracias por tu mensaje! Nos pondremos en contacto pronto.";
        mensaje.style.color = "green";
        form.reset();
      })
      .catch((error) => {
        console.error("Error al enviar el mensaje:", error);
        mensaje.textContent = "Error al enviar el mensaje. Intenta de nuevo más tarde.";
        mensaje.style.color = "red";
      });
    });
  });
  