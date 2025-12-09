import { cadastrarUsuario } from "./api.js";

document.addEventListener("DOMContentLoaded", async function () {
  const toggleSenha = document.getElementById("iconeSenha");
  const campoSenha = document.getElementById("senha");

  if (toggleSenha && campoSenha) {
    toggleSenha.addEventListener("click", function () {
      const tipo =
        campoSenha.getAttribute("type") === "password" ? "text" : "password";
      campoSenha.setAttribute("type", tipo);
      this.classList.toggle("fa-eye");
      this.classList.toggle("fa-eye-slash");
    });
  }

  const toggleConfirmaSenha = document.getElementById("iconeConfirmaSenha");
  const campoConfirmaSenha = document.getElementById("confirma-senha");

  if (toggleConfirmaSenha && campoConfirmaSenha) {
    toggleConfirmaSenha.addEventListener("click", function () {
      const tipo =
        campoConfirmaSenha.getAttribute("type") === "password"
          ? "text"
          : "password";
      campoConfirmaSenha.setAttribute("type", tipo);
      this.classList.toggle("fa-eye");
      this.classList.toggle("fa-eye-slash");
    });
  }

  const cadastroForm = document.getElementById("cadastroForm");

  if (cadastroForm) {
    const btnSubmit = cadastroForm.querySelector('button[type="submit"]');

    cadastroForm.addEventListener("submit", async function (evento) {
      evento.preventDefault();

      const nome = document.getElementById("nome").value;
      const sobrenome = document.getElementById("sobrenome").value;
      const email = document.getElementById("email").value;
      const telefone = document.getElementById("telefone").value;
      const senha = campoSenha.value.trim();
      const confirmaSenha = campoConfirmaSenha.value;
      const nomeCompleto = `${nome} ${sobrenome}`;

      if (senha !== confirmaSenha) {
        alert("As senhas não coincidem. Por favor, tente novamente.");
        return;
      }

      const recaptchaToken = grecaptcha.getResponse();
      if (recaptchaToken.length === 0) {
        alert("Por favor, marque a caixa 'Não sou um robô'.");
        return;
      }

      const textoOriginal = btnSubmit.innerText;
      btnSubmit.disabled = true;
      btnSubmit.innerText = "Enviando...";
      btnSubmit.style.cursor = "not-allowed";
      btnSubmit.style.opacity = "0.7";

      try {
        const res = await cadastrarUsuario(
          email,
          confirmaSenha,
          nomeCompleto,
          telefone,
          recaptchaToken
        );

        if (res.error) {
          alert(res.error);

          grecaptcha.reset();
          btnSubmit.disabled = false;
          btnSubmit.innerText = textoOriginal;
          btnSubmit.style.cursor = "pointer";
          btnSubmit.style.opacity = "1";
          return;
        }

        alert(
          "Verifique a caixa de entrada do seu email. Enviamos um link de confirmação."
        );
        window.location.href = "/";
      } catch (error) {
        console.error("Erro no cadastro:", error);
        alert("Ocorreu um erro ao tentar cadastrar. Tente novamente.");

        grecaptcha.reset();
        btnSubmit.disabled = false;
        btnSubmit.innerText = textoOriginal;
        btnSubmit.style.cursor = "pointer";
        btnSubmit.style.opacity = "1";
      }
    });
  }
});
