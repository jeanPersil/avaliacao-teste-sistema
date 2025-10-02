import { Estoque } from '../back/services/estoque.js'; // Adicione a extensão .js

const form = document.getElementById('formProduto');
const btnCadastrar = document.getElementById('btnCadastrar');
const mensagemDiv = document.getElementById('mensagem');

const estoque = new Estoque();

function showLoading() {
    btnCadastrar.classList.add('btn-loading');
    btnCadastrar.disabled = true;
    btnCadastrar.textContent = ' '; // Necessário para o spinner aparecer
}

function hideLoading() {
    btnCadastrar.classList.remove('btn-loading');
    btnCadastrar.disabled = false;
    btnCadastrar.textContent = btnCadastrar.getAttribute('data-original-text');
}

function mostrarMensagem(mensagem, tipo) {
    mensagemDiv.textContent = mensagem;
    mensagemDiv.style.display = 'block';
    mensagemDiv.className = `mt-3 alert alert-${tipo}`;
    
    setTimeout(() => {
        mensagemDiv.style.display = 'none';
        mensagemDiv.textContent = '';
    }, 5000);
}

form.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    if (!form.checkValidity()) {
        return; 
    }

    const produto = {
        nome: document.getElementById('nome').value.trim(),
        preco: parseFloat(document.getElementById('preco').value),
        quantidade: parseInt(document.getElementById('quantidade').value),
        validade: document.getElementById('validade').value
    };

    console.log('Dados do produto a ser cadastrado:', produto); // Log para debug

    showLoading();

    try {
        const resultado = await estoque.adicionarProduto(produto.nome, produto.preco, produto.quantidade, produto.validade);
        
        console.log('Resultado do cadastro:', resultado); // Log para debug

        if (resultado.sucesso) {
            mostrarMensagem(`Produto "${produto.nome}" cadastrado com sucesso!`, 'success');
            form.reset();
            document.getElementById('quantidade').value = 1;
        } else {
            mostrarMensagem(resultado.mensagem, 'error');
        }
    } catch (erro) {
        console.error('Erro ao cadastrar produto:', erro);
        mostrarMensagem('Erro inesperado ao cadastrar produto.', 'error');
    } finally {
        hideLoading();
    }
    
});