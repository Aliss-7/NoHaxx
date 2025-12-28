(function() {
    const estaLogueado = localStorage.getItem('usuarioLogueado') === 'true';
    const style = document.createElement('style');
    
    if (estaLogueado) {
        style.innerHTML = `
            .menu-invitado { display: none !important; }
            .menu-usuario { display: inline-block !important; }
        `;
    } else {
        style.innerHTML = `
            .menu-invitado { display: inline-block !important; }
            .menu-usuario { display: none !important; }
        `;
    }
    document.head.appendChild(style);
})();