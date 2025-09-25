<?php
//! Configuração do banco de dados
$host = "localhost";
$user = "root";
$pass = "";
$dbname = "cadastro";

//! Conexão com o banco
$conn = new mysqli($host, $user, $pass, $dbname);

//! Verifica a conexão
if($conn->connect_error){
    die("Conexão falhou: " . $conn->connection_error)

}

echo("conectado!")

/*
$produto
$preco
$quantidade
$total
*/
?>