
let current = 0;
let answers = [];
const correctOnes = ['a', 'a', 'b', 'a', 'a', 'b', 'a', 'a', 'a', 'a'];
const total = 10;

function recordAnswer(idx, val) {
    answers[idx] = val;
    if (current < total - 1) {
        document.getElementById(`q-${current}`).classList.remove('active');
        current++;
        document.getElementById(`q-${current}`).classList.add('active');
        document.getElementById('step-counter').innerText = `Misión ${current + 1} de 10`;
    } else {
        showResults();
    }
}

function runVTScan() {
    const val = document.getElementById('vt-input').value.trim();
    if (val.includes('login-verificar')) {
        document.getElementById('vt-result').style.display = "block";
        document.getElementById('vt-actions').style.display = "grid";
    } else {
        alert("URL incorrecta. Copie la de arriba.");
           }
}

function showUrl(visible) {
    document.getElementById('url-tooltip-9').style.display = visible ? 'block' : 'none';
}

function showResults() {
    document.getElementById(`q-${current}`).classList.remove('active');
    document.getElementById('step-final').classList.add('active');
     
    let aciertos = 0;
    answers.forEach((ans, i) => { if(ans === correctOnes[i]) aciertos++; });

    const statsText = document.getElementById('final-stats');
    if (aciertos >= 8) {
        statsText.innerText = `✅ ¡Aprobado! Has resuelto ${aciertos}/10 correctamente.`;
        statsText.style.color = "green";
        saveScore(10);
    } else {
        statsText.innerText = `❌ No superado (${aciertos}/10 aciertos).`;
        statsText.style.color = "red";
        document.getElementById('firebase-msg').innerHTML = "<p>Necesitas al menos 8 aciertos.</p><br><a href='teoria.html' class='boton'>Reintentar</a>";
    }
}

function saveScore(nota) {
    const auth = firebase.auth();
    const db = firebase.firestore();
    auth.onAuthStateChanged(user => {
        if (user) {
            db.collection('userScores').doc(user.uid).set({
                scores: { phishing: nota }
            }, { merge: true }).then(() => {
                document.getElementById('firebase-msg').innerHTML = "<h3 style='color:green'>Puntuación registrada en tu perfil.</h3><br><a href='../../modulos.html' class='boton'>Volver al Menú</a>";
            });
        }
    });
}