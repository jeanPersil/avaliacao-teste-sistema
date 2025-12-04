import { cadastrarUsuario, efetuarLogin } from "./api.js";

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

      const res = await cadastrarUsuario(
        email,
        confirmaSenha,
        nomeCompleto,
        telefone
      );

      if (res.error) {
        alert(res.error);
        return;
      }

      alert(
        "Verifique a caixa de entrada do seu email. Enviamos um link de confirmação."
      );

      window.location.href = "/";
    });
  }
});
