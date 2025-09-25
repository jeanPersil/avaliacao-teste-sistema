<?php
include "funcoes.php";

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $acao = $_POST['acao'] ?? null;

    if ($acao === "cliente") {
        echo adicionarCliente($_POST['nome'], $_POST['usuario'], $_POST['telefone'], $_POST['email'], $_POST['senha']);
    }
    elseif ($acao === "admin") {
        echo adicionarAdmin($_POST['nome'], $_POST['usuario'], $_POST['telefone'], $_POST['email'], $_POST['senha']);
    }
    elseif ($acao === "produto") {
        echo adicionarProduto($_POST['nome'], $_POST['preco'], $_POST['quantidade'], $_POST['validade']);
    }
    else {
        echo "Ação inválida!";
    }
}
?>
