import { efetuarLogin } from "./api.js";

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

      const recaptchaToken = grecaptcha.getResponse();

      if (recaptchaToken.length === 0) {
        alert("Por favor, marque a caixa 'Não sou um robô'.");
        return;
      }

      try {
        const result = await efetuarLogin(
          campoEmail.value,
          campoSenha.value,
          recaptchaToken
        );

        if (result.error) {
          alert(result.error);

          grecaptcha.reset();
          return;
        }

        window.location.href = result;
      } catch (erro) {
        console.error("Erro na requisição:", erro);
        alert("Ocorreu um erro ao tentar conectar.");
        grecaptcha.reset();
      }
    });
  }
});
