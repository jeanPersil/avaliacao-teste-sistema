import {
  abrirModalReportFeedback,
  fecharModalReportFeedback,
} from "./modal.js";
import { enviarFeedback } from "./api.js";

const botaoFeedback = document.getElementById("reportarFeedback");

botaoFeedback.addEventListener("click", (e) => {
  e.preventDefault();

  abrirModalReportFeedback();

  const form = document.getElementById("form-feedback");
  const botaofechar = document.getElementById("fecharFeedback");

  botaofechar.addEventListener("click", (evt) => {
    evt.preventDefault();
    fecharModalReportFeedback();
  });

  form.addEventListener("submit", async (evt) => {
    evt.preventDefault();

    const tipo = document.getElementById("novo-tipo").value;
    const mensagem = document.getElementById("nova-mensagem").value;

    console.log("Enviando...", tipo, mensagem);

    const res = await enviarFeedback(tipo, mensagem);

    if (res.error) {
      alert(res.error);
      return;
    }

    alert("Feedback enviado com sucesso!");

    fecharModalReportFeedback();
  });
});
