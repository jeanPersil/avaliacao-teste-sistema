import { adicionar_produto } from "./api.js";

const form = document.getElementById("form-produto");

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  const formdata = new FormData(form);

  const nome = formdata.get("nome");
  const preco = formdata.get("preco");
  const quantidade = formdata.get("quantidade");
  const data = formdata.get("data");

  const campos = [
    { nome: "nome", valor: formdata.get("nome") },
    { nome: "preço", valor: formdata.get("preco") },
    { nome: "quantidade", valor: formdata.get("quantidade") },
    { nome: "data", valor: formdata.get("data") },
  ];

  const todosPreenchidos = campos.every(
    (campo) => campo.valor && campo.valor.trim() !== ""
  );

  if (!todosPreenchidos) {
    const vazios = campos.filter(
      (campo) => !campo.valor || campo.valor.trim() === ""
    );
    const nomesVazios = vazios.map((campo) => campo.nome).join(", ");
    alert(`Preencha os campos: ${nomesVazios}`);
    return;
  }

  try {
    const resultado = await adicionar_produto(
      nome,
      Number(preco),
      Number(quantidade),
      data
    );

    if (resultado.error) {
      alert(resultado.error);
      return;
    }

    alert("Produto cadastrado com sucesso!");
    form.reset();
  } catch (error) {
    console.error("Erro ao cadastrar produto:", error);
    alert("Erro ao cadastrar produto");
  }
});
