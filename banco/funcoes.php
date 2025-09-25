<?php
include "conexao.php"; 

// Função para adicionar cliente
function adicionarCliente($nome, $usuario, $telefone, $email, $senha) {
    global $conn;
    $sql = "INSERT INTO clientes (nome, usuario, telefone, email, senha) 
            VALUES ('$nome', '$usuario', '$telefone', '$email', '$senha')";
    if ($conn->query($sql) === TRUE) {
        return "Cliente adicionado com sucesso!";
    } else {
        return "Erro: " . $conn->error;
    }
}

// Função para adicionar admin
function adicionarAdmin($nome, $usuario, $telefone, $email, $senha) {
    global $conn;
    $sql = "INSERT INTO admin (nome, usuario, telefone, email, senha) 
            VALUES ('$nome', '$usuario', '$telefone', '$email', '$senha')";
    if ($conn->query($sql) === TRUE) {
        return "Admin adicionado com sucesso!";
    } else {
        return "Erro: " . $conn->error;
    }
}

// Função para adicionar produto
function adicionarProduto($nome, $preco, $quantidade, $validade) {
    global $conn;
    $sql = "INSERT INTO produtos (nome, preco, quantidade, validade) 
            VALUES ('$nome', '$preco', '$quantidade', '$validade')";
    if ($conn->query($sql) === TRUE) {
        return "Produto adicionado com sucesso!";
    } else {
        return "Erro: " . $conn->error;
    }
}
?>
