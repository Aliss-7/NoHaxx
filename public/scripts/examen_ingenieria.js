document.addEventListener('DOMContentLoaded', () => {
    
    // 1. Definimos las respuestas correctas (coinciden con el 'value' del HTML)
    const respuestasCorrectas = {
        p1: 'b', // <br>
        p2: 'a', // Cascading Style Sheets
        p3: 'c'  // <script src...>
    };

    // 2. Seleccionamos los elementos del DOM
    const botonEnviar = document.getElementById('btn-enviar');
    const divResultado = document.getElementById('resultado');

    // 3. Función principal al hacer clic
    botonEnviar.addEventListener('click', () => {
        let puntaje = 0;
        let totalPreguntas = Object.keys(respuestasCorrectas).length;
        
        // Objeto FormData para leer lo que marcó el usuario fácilmente
        const formulario = document.getElementById('formulario-quiz');
        const datos = new FormData(formulario);

        // Recorremos las respuestas correctas para comparar
        for (let [pregunta, respuestaCorrecta] of Object.entries(respuestasCorrectas)) {
            const respuestaUsuario = datos.get(pregunta);

            if (respuestaUsuario === respuestaCorrecta) {
                puntaje++;
                // Opcional: Pintar la pregunta de verde si quieres feedback visual inmediato
            }
        }

        // 4. Mostrar el resultado
        mostrarFeedback(puntaje, totalPreguntas);
    });

    function mostrarFeedback(puntaje, total) {
        // Calculamos porcentaje
        const porcentaje = (puntaje / total) * 100;
        
        let mensaje = '';
        let colorClase = '';

        if (porcentaje === 100) {
            mensaje = '¡Excelente! Has acertado todo.';
            colorClase = 'exito'; // Necesitarás definir este estilo en tu CSS
        } else if (porcentaje >= 60) {
            mensaje = 'Bien hecho, has aprobado.';
            colorClase = 'aprobado';
        } else {
            mensaje = 'Necesitas repasar el Módulo 4.';
            colorClase = 'error';
        }

        divResultado.innerHTML = `
            <h3>Resultados:</h3>
            <p>Has obtenido <strong>${puntaje}</strong> de <strong>${total}</strong> aciertos.</p>
            <p class="${colorClase}">${mensaje}</p>
            <button onclick="location.reload()">Intentar de nuevo</button>
        `;
        
        // Hacemos visible el div y hacemos scroll hacia él
        divResultado.style.display = 'block'; 
        divResultado.scrollIntoView({ behavior: 'smooth' });
    }
});