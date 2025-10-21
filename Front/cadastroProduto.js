
import { Estoque } from '../back/services/estoque.js';

const form = document.getElementById('formProduto');
const btnCadastrar = document.getElementById('btnCadastrar');
const mensagemDiv = document.getElementById('mensagem');
const tituloPagina = document.querySelector('h2');
const descricaoPagina = document.querySelector('.form-description');

const estoque = new Estoque();

// Verificar se está em modo de edição
const urlParams = new URLSearchParams(window.location.search);
const modoEdicao = urlParams.get('editar') === 'true';
const produtoId = urlParams.get('id');

// Configurar a página para modo edição se necessário
if (modoEdicao && produtoId) {
    configurarModoEdicao();
}

function configurarModoEdicao() {
    // Alterar título e descrição
    tituloPagina.textContent = 'Editar Produto';
    descricaoPagina.textContent = 'Atualize os campos abaixo para modificar o produto.';
    
    // Alterar texto do botão
    btnCadastrar.textContent = 'Atualizar Produto';
    btnCadastrar.setAttribute('data-original-text', 'Atualizar Produto');
    
    // Preencher os campos com os dados da URL
    document.getElementById('nome').value = urlParams.get('nome') || '';
    document.getElementById('preco').value = urlParams.get('preco') || '';
    document.getElementById('quantidade').value = urlParams.get('quantidade') || '1';
    
    // Formatar data para o input date (YYYY-MM-DD)
    const validade = urlParams.get('validade');
    if (validade && validade !== 'null' && validade !== 'undefined') {
        const data = new Date(validade);
        if (!isNaN(data.getTime())) {
            document.getElementById('validade').value = data.toISOString().split('T')[0];
        }
    }
}

function showLoading() {
    btnCadastrar.classList.add('btn-loading');
    btnCadastrar.disabled = true;
    btnCadastrar.textContent = ' ';
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

    console.log('Dados do produto:', produto);
    console.log('Modo edição:', modoEdicao);
    console.log('ID do produto:', produtoId);

    showLoading();

    try {
        let resultado;
        
        if (modoEdicao && produtoId) {
            // MODO EDIÇÃO - Atualizar produto existente
            resultado = await estoque.editarProduto(
                produtoId, 
                produto.nome, 
                produto.preco, 
                produto.quantidade, 
                produto.validade
            );
            
            console.log('Resultado da edição:', resultado);
            
            if (resultado.sucesso) {
                mostrarMensagem(`Produto "${produto.nome}" atualizado com sucesso!`, 'success');
                
                // Redirecionar para listagem após 2 segundos
                setTimeout(() => {
                    window.location.href = 'listprod.html';
                }, 2000);
            } else {
                mostrarMensagem(resultado.mensagem || 'Erro ao atualizar produto.', 'error');
            }
        } else {
            // MODO CADASTRO - Adicionar novo produto
            resultado = await estoque.adicionarProduto(
                produto.nome, 
                produto.preco, 
                produto.quantidade, 
                produto.validade
            );
            
            console.log('Resultado do cadastro:', resultado);
            
            if (resultado.sucesso) {
                mostrarMensagem(`Produto "${produto.nome}" cadastrado com sucesso!`, 'success');
                form.reset();
                document.getElementById('quantidade').value = 1;
            } else {
                mostrarMensagem(resultado.mensagem, 'error');
            }
        }
    } catch (erro) {
        console.error('Erro ao processar produto:', erro);
        const mensagemErro = modoEdicao ? 
            'Erro inesperado ao atualizar produto.' : 
            'Erro inesperado ao cadastrar produto.';
        mostrarMensagem(mensagemErro, 'error');
    } finally {
        hideLoading();
    }
});

// Adicionar botão "Cancelar" no modo edição
if (modoEdicao) {
    const btnCancelar = document.createElement('button');
    btnCancelar.type = 'button';
    btnCancelar.className = 'btn btn-secondary mt-3';
    btnCancelar.textContent = 'Cancelar Edição';
    btnCancelar.style.width = '100%';
    
    btnCancelar.addEventListener('click', function() {
        if (confirm('Deseja cancelar a edição? As alterações não salvas serão perdidas.')) {
            window.location.href = 'listprod.html';
        }
    });
    
    // Inserir antes do botão "Ver Produtos Cadastrados"
    const btnVerProdutos = document.getElementById('btnVerProdutos');
    form.insertBefore(btnCancelar, btnVerProdutos);
}

// Também atualizar o texto do botão "Ver Produtos" no modo edição
if (modoEdicao) {
    const btnVerProdutos = document.getElementById('btnVerProdutos');
    btnVerProdutos.textContent = 'Voltar para Lista de Produtos';
}
