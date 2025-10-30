import { Autenticacao } from "../back/services/auth.js";
const autenticacao = new Autenticacao();

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
      const email = document.getElementById("email").value;
      const telefone = document.getElementById("telefone").value;
      const senha = campoSenha.value;
      const confirmaSenha = campoConfirmaSenha.value;

      if (senha !== confirmaSenha) {
        alert("As senhas não coincidem. Por favor, tente novamente.");
        return;
      }

      let resposta = await autenticacao.cadastrarUsuario(
        email,
        senha,
        nome,
        telefone
      );

      if (!resposta.sucesso) {
        alert(`Erro ao cadastrar usuario: ${resposta.mensagem}`);
        return;
      }
      alert("Cadastro realizado com sucesso! Redirecionando para login...");
      setTimeout(() => {
        window.location.href = "../index.html";
      }, 1500);
    });
  }
});
