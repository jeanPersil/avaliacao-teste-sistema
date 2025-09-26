// testeCadastro.js

// 1. Importe a classe
import { Autenticacao } from "./back/services/auth.js";

// 2. Crie uma instância
const auth = new Autenticacao();

async function executarTestes() {
  let res = await auth.login("admin1@gmail.com", "admin223");

  if (!res.sucesso) {
    console.log(res.mensagem);
    return;
  }

  console.log("Login feito com sucesso");
}
executarTestes();
