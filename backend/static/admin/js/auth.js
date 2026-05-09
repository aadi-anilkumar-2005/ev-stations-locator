document.getElementById('login-form').addEventListener('submit', function(e) {
    // Allow form submission to proceed
    const btn = document.getElementById('login-btn');
    btn.querySelector('.normal-text').classList.add('d-none');
    btn.querySelector('.loading-text').classList.remove('d-none');
    btn.disabled = true;
});
lucide.createIcons();