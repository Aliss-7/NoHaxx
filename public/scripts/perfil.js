document.addEventListener("DOMContentLoaded", () => {
    const auth = firebase.auth();
    const db = firebase.firestore();
  
    function mostrarNotificacion(mensaje) {
      const notif = document.getElementById("notificacion");
      if (notif) {
        notif.textContent = mensaje;
        notif.style.display = "block";
        setTimeout(() => {
          notif.style.display = "none";
        }, 3000);
      }
    }
  
    const editarBtn = document.getElementById("editar-btn");
    const logoutBtn = document.getElementById("logout-btn");
  
    if (!editarBtn || !logoutBtn) {
      console.error("Faltan elementos en el DOM.");
      return;
    }
  
    let editando = false;
  
    editarBtn.addEventListener("click", () => {
      const campos = ["nombre", "apellidos", "telefono", "departamento"];
      editando = !editando;
  
      campos.forEach(id => {
        const campo = document.getElementById(id);
        if (campo) campo.disabled = !editando;
      });
  
      if (!editando) {
        // guardar cambios
        editarBtn.disabled = true;
  
        const nuevosDatos = {};
        campos.forEach(id => {
          const campo = document.getElementById(id);
          if (campo) nuevosDatos[id] = campo.value.trim();
        });
  
        if (!nuevosDatos.nombre || !nuevosDatos.apellidos) {
          mostrarNotificacion("Nombre y apellidos no pueden estar vacíos.");
          editarBtn.textContent = "Guardar Cambios";
          editarBtn.disabled = false;
          editando = true;
  
          campos.forEach(id => {
            const campo = document.getElementById(id);
            if (campo) campo.disabled = false;
          });
          return;
        }
  
        const user = auth.currentUser;
        const refUsuario = db.collection("usuarios").doc(user.uid);
  
        refUsuario.update(nuevosDatos)
          .then(() => {
            mostrarNotificacion("Perfil actualizado correctamente.");
            editarBtn.disabled = false;
          })
          .catch((error) => {
            mostrarNotificacion("Error al guardar los datos: " + error.message);
            editarBtn.disabled = false;
          });
  
        editarBtn.textContent = "Editar Perfil";
      } else {
        // activar edición
        editarBtn.textContent = "Guardar Cambios";
      }
    });
  
    // cargar datos
    auth.onAuthStateChanged((user) => {
      if (user) {
        mostrarNotificacion("Cargando perfil...");
        
        const refUsuario = db.collection("usuarios").doc(user.uid);
        const emailSpan = document.getElementById("email");
        if (emailSpan) emailSpan.textContent = user.email;
  
        refUsuario.get().then((doc) => {
          if (doc.exists) {
            const data = doc.data();
            const setVal = (id, val) => {
              const el = document.getElementById(id);
              if (el) el.value = val || "";
            };
            setVal("nombre", data.nombre);
            setVal("apellidos", data.apellidos);
            setVal("telefono", data.telefono);
            setVal("departamento", data.departamento);
          }
        });

        const refScores = db.collection("userScores").doc(user.uid);
        refScores.get().then((doc) => {
            let progreso = 0;
            if (doc.exists) {
              const scores = doc.data().scores || {};
    
              let completados = 0;
              if (scores.introduccion >= 5) completados++; // Asumiendo que 5 es el umbral de aprobado de modulos.js
              if (scores.phishing >= 5) completados++;
              if (scores.ransomware >= 5) completados++;
              if (scores.ingenieria >= 5) completados++;
              if (scores.contrasenas >= 5) completados++;
              if (scores.navegacion >= 5) completados++;
    
              progreso = Math.floor((completados / 6) * 100); // 6 es el número total de módulos
            }
            
            // actualización de la barra
            const titulo = document.getElementById("titulo-progreso");
            const barra = document.getElementById("barra-progreso");
            if (titulo) titulo.textContent = `Mi progreso (${progreso}%)`;
            if (barra) barra.style.width = progreso + "%";
            
            mostrarNotificacion("Perfil cargado.");
        }).catch(err => {
            console.error("Error cargando progreso:", err);
        });

      } else {
        window.location.href = "/login.html";
      }
    });
  
    // cerrar sesión
    logoutBtn.addEventListener("click", (e) => {
      e.preventDefault();
      auth.signOut().then(() => {
        window.location.href = "/login.html";
      });
    });
});