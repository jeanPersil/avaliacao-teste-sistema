import { Autenticacao } from "../back/services/auth.js";

document.addEventListener("DOMContentLoaded", function () {
  const toggleSenha = document.getElementById("iconeSenha");

  const campoSenha = document.getElementById("senha");
  const campoEmail = document.getElementById("email");
  const formLogin = document.getElementById("loginForm");

  if (toggleSenha && campoSenha) {
    toggleSenha.addEventListener("click", function () {
      const tipo =
        campoSenha.getAttribute("type") === "password" ? "text" : "password";
      campoSenha.setAttribute("type", tipo);

      o;
      this.classList.toggle("fa-eye");
      this.classList.toggle("fa-eye-slash");
    });
  }

  if (formLogin) {
  formLogin.addEventListener("submit", async (e) => {
    e.preventDefault();

    if (!campoEmail.value || !campoSenha.value) {
      alert("Por favor, preencha todos os campos.");
      return;
    }

    try {
      const auth = new Autenticacao();
      const res = await auth.login(campoEmail.value, campoSenha.value);

      if (!res.sucesso) {
        alert(`Erro ao efetuar login: ${res.mensagem}`);
        return;
      }

      // Verifica a role e redireciona
      if (res.role === "admin") {
        window.location.href = "cadprod.html";
      } else {
        window.location.href = "produtos.html";
      }
    } catch (error) {
      alert("Erro desconhecido: " + error.message);
    }
  });
  }
});
