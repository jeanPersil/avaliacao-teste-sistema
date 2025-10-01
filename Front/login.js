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

      // Alterna os ícones
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

        console.log("Resposta do login:", res); // Debug

        if (!res || !res.sucesso) {
          alert(
            `Erro ao efetuar login: ${res?.mensagem || "Erro desconhecido"}`
          );
          return;
        }

        if (res.role === "admin") {
          alert("Redirecionando para tela de admin");
          window.location.href = "./cadprodlist/listprod.html";
          return;
        }

        alert("Redirecionando para tela de usuário comum");
      } catch (error) {
        console.error("Erro no login:", error);
        alert(`Erro inesperado: ${error.message}`);
      }
    });
  }
});
