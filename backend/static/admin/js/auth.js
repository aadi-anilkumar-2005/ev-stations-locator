document.getElementById('login-form').addEventListener('submit', function(e) {
    e.preventDefault();
    const btn = document.getElementById('login-btn');
    const email = document.getElementById('email').value;
    const pass = document.getElementById('password').value;

    if(email && pass) {
        btn.querySelector('.normal-text').classList.add('d-none');
        btn.querySelector('.loading-text').classList.remove('d-none');
        btn.disabled = true;

        setTimeout(() => {
            window.location.href = 'dashboard.html';
        }, 800);
    } else {
        document.getElementById('login-error').classList.remove('d-none');
    }
});
lucide.createIcons();