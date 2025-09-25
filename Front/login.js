document.addEventListener('DOMContentLoaded', function() {
  const toggleSenha = document.getElementById('iconeSenha');
  const campoSenha = document.getElementById('senha');

  if (toggleSenha && campoSenha) {
    toggleSenha.addEventListener('click', function() {
      
      const tipo = campoSenha.getAttribute('type') === 'password' ? 'text' : 'password';
      campoSenha.setAttribute('type', tipo);

      o
      this.classList.toggle('fa-eye');
      this.classList.toggle('fa-eye-slash');
    });
  }
})