import { efetuarLogin } from "./api.js";

document.addEventListener("DOMContentLoaded", function () {
  const toggleSenha = document.getElementById("iconeSenha");
  const campoSenha = document.getElementById("senha");
  const campoEmail = document.getElementById("email");
  const formLogin = document.getElementById("loginForm");
  const recaptchaInput = document.getElementById("recaptchaToken");

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

      grecaptcha.ready(function () {
        grecaptcha
          .execute("6LdUGyEsAAAAABDkyKgw62DKlp7vy8zDNUxO2gB6", {
            action: "login",
          })
          .then(async function (token) {
            recaptchaInput.value = token;

          
            const result = await efetuarLogin(
              campoEmail.value,
              campoSenha.value,
              token 
            );

            if (result.error) {
              alert(result.error);
              return;
            }

            window.location.href = result;
          });
      });
    });
  }
});
