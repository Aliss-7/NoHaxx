document.addEventListener("DOMContentLoaded", () => {
    const auth = firebase.auth();
    const db = firebase.firestore();
  
    // 1. Función para mostrar mensajes flotantes
    function mostrarNotificacion(mensaje) {
      const notif = document.getElementById("notificacion");
      if (notif) {
        notif.textContent = mensaje;
        notif.style.display = "block";
        notif.style.backgroundColor = "#333";
        notif.style.color = "#fff";
        notif.style.padding = "10px 20px";
        notif.style.position = "fixed";
        notif.style.top = "20px";
        notif.style.right = "20px";
        notif.style.borderRadius = "5px";
        notif.style.zIndex = "1000";
        
        setTimeout(() => {
          notif.style.display = "none";
        }, 3000);
      }
    }
  
    const editarBtn = document.getElementById("editar-btn");
  
    if (!editarBtn) {
      console.error("Error: No se encuentra el botón 'editar-btn' en el HTML.");
      return;
    }
  
    let editando = false;
  
    editarBtn.addEventListener("click", () => {
      const campos = ["nombre", "apellidos", "telefono", "departamento"];
      editando = !editando;
  
      campos.forEach(id => {
        const campo = document.getElementById(id);
        if (campo) {
            campo.disabled = !editando;
            campo.style.backgroundColor = editando ? "#fff" : ""; 
            campo.style.border = editando ? "2px solid #1f73b8" : "1px solid #ddd";
        }
      });
  
      if (!editando) {
        editarBtn.disabled = true;
        editarBtn.textContent = "Guardando...";
  
        const nuevosDatos = {};
        campos.forEach(id => {
          const campo = document.getElementById(id);
          if (campo) nuevosDatos[id] = campo.value.trim();
        });
  
        if (!nuevosDatos.nombre || !nuevosDatos.apellidos) {
          mostrarNotificacion("Nombre y apellidos son obligatorios.");
          editarBtn.textContent = "Guardar Cambios";
          editarBtn.disabled = false;
          editando = true;
          
          campos.forEach(id => {
             const c = document.getElementById(id);
             if(c) c.disabled = false;
          });
          return;
        }

        const telefonoRegex = /^[0-9+ ]{9,15}$/; 
        if (nuevosDatos.telefono && !telefonoRegex.test(nuevosDatos.telefono)) {
             mostrarNotificacion("El teléfono no es válido (solo números, espacios o +).");
             editarBtn.textContent = "Guardar Cambios";
             editarBtn.disabled = false;
             editando = true;
             
             campos.forEach(id => {
                const c = document.getElementById(id);
                if(c) c.disabled = false;
             });
             return;
        }
  
        const user = auth.currentUser;
        if (user) {
            const refUsuario = db.collection("usuarios").doc(user.uid);
    
            refUsuario.update(nuevosDatos)
              .then(() => {
                mostrarNotificacion("Perfil actualizado correctamente.");
                editarBtn.textContent = "Editar Perfil";
                editarBtn.disabled = false;
                
                campos.forEach(id => {
                    const c = document.getElementById(id);
                    if(c) {
                        c.style.backgroundColor = "";
                        c.style.border = "1px solid #ddd";
                    }
                });
              })
              .catch((error) => {
                mostrarNotificacion("Error: " + error.message);
                editarBtn.textContent = "Guardar Cambios"; 
                editarBtn.disabled = false;
                editando = true; 
              });
        }
      } else {
        editarBtn.textContent = "Guardar Cambios";
      }
    });
  
    auth.onAuthStateChanged((user) => {
      if (user) { 
        const emailSpan = document.getElementById("email");
        const emailSidebar = document.getElementById("email-sidebar");
        const avatarLetra = document.getElementById("avatar-letra");

        if (emailSpan) emailSpan.textContent = user.email;
        if (emailSidebar) emailSidebar.textContent = user.email;
        
        if (avatarLetra && user.email) {
            avatarLetra.textContent = user.email.charAt(0).toUpperCase();
        }
  
        const refUsuario = db.collection("usuarios").doc(user.uid);
        
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
        }).catch(err => console.error("Error al traer datos:", err));

        const refScores = db.collection("userScores").doc(user.uid);
        refScores.get().then((doc) => {
            let progreso = 0;
            if (doc.exists) {
              const scores = doc.data().scores || {};
              const modulos = ['introduccion', 'phishing', 'ransomware', 'ingenieria', 'contrasenas', 'navegacion'];
              let completados = 0;
              
              modulos.forEach(mod => {
                  if (scores[mod] && scores[mod] >= 5) completados++;
              });
    
              progreso = Math.floor((completados / 6) * 100);
            }
            
            const barra = document.getElementById("barra-progreso");
            if (barra) {
                barra.style.width = progreso + "%";
                if(progreso === 100) barra.style.backgroundColor = "#4caf50";
            }
            
        }).catch(err => console.error("Error progreso:", err));
  
      } else {
        window.location.href = "login.html";
      }
    });
    
});