// Variáveis globais para controle da paginação
let dadosSalvos = [];
let paginaAtual = 1;
let ordemAtual = 'asc'; // Controla a direção da ordenação
const itensPorPagina = 10;
const { jsPDF } = window.jspdf;
const doc = new jsPDF();

// Carrega os dados dos remetentes e destinos
async function carregarDadosJSON() {
    const response = await fetch('src/js/data/dados.json');
    return await response.json();
}

// Função para obter a cor do tipo
function obterCorTipo(tipo) {
    const cores = {
        'VENDA': 'blue',
        'FERRAMENTARIA': 'purple',
        'MANUTENÇÃO': 'orange',
        'MATERIA PRIMA': 'brown'
    };
    return cores[tipo] || 'black';
}

// Função para obter a cor do status
function obterCorStatus(status) {
    const cores = {
        'COTAÇÃO': '#fc0356',
        'CANCELADO': 'red',
        'APROVADO': 'green'
    };
    return cores[status] || 'black';
}

// Função para criar um menu suspenso dinâmico
function criarDropdown(opcoes, valorSelecionado, onChange) {
    const select = document.createElement('select');
    opcoes.forEach(opcao => {
        const option = document.createElement('option');
        option.value = opcao;
        option.textContent = opcao;
        if (opcao === valorSelecionado) {
            option.selected = true;
        }
        select.appendChild(option);
    });
    select.addEventListener('change', onChange);
    return select;
}
// Função para carregar dados salvos no localStorage
function carregarDados() {
    const tabelaBody = document.querySelector('#tabela-cotacoes tbody');
    dadosSalvos = JSON.parse(localStorage.getItem('cotacoes')) || [];

    tabelaBody.innerHTML = '';

    const indiceInicial = (paginaAtual - 1) * itensPorPagina;
    const indiceFinal = indiceInicial + itensPorPagina;
    const dadosPaginaAtual = dadosSalvos.slice(indiceInicial, indiceFinal);

    dadosPaginaAtual.forEach((dados, index) => {
        const novaLinha = document.createElement('tr');
        
        // Criando menus suspensos para TIPO e STATUS
        const selectTipo = criarDropdown(['VENDA', 'FERRAMENTARIA', 'MANUTENÇÃO', 'MATERIA PRIMA'], dados.tipo, (event) => {
            dadosSalvos[indiceInicial + index].tipo = event.target.value;
            salvarDadosNoCache(dadosSalvos);
        });
        selectTipo.style.color = obterCorTipo(dados.tipo);
        
        const selectStatus = criarDropdown(['COTAÇÃO', 'CANCELADO', 'APROVADO'], dados.status, (event) => {
            dadosSalvos[indiceInicial + index].status = event.target.value;
            salvarDadosNoCache(dadosSalvos);
        });
        selectStatus.style.color = obterCorStatus(dados.status);

        novaLinha.innerHTML = `
            <td>${dados.dataCotacao}</td>
            <td>${dados.pedido}</td>
            <td>${dados.transportadora}</td>
            <td>${dados.remetente}</td>
            <td>${dados.destino}</td>
            <td>${dados.cidadeRemetente}</td>
            <td>${dados.cidadeDestino}</td>
            <td>R$ ${parseFloat(dados.valor).toFixed(2)}</td>
            <td></td>
            <td></td>
            <td>${dados.cte || '-'}</td>
            <td>${dados.observacao || '-'}</td>
            <td class="action-buttons">
                <button class="edit-button" data-index="${indiceInicial + index}">Editar</button>
                <button class="delete-button" data-index="${indiceInicial + index}">Excluir</button>
            </td>
        `;
        
        // Adicionando os menus suspensos às células
        novaLinha.children[8].appendChild(selectTipo);
        novaLinha.children[9].appendChild(selectStatus);
        
        tabelaBody.appendChild(novaLinha);
    });

    adicionarEventosAcoes();
    atualizarBotoesPaginacao();
}

// Função para salvar os dados no localStorage
function salvarDadosNoCache(dados) {
    localStorage.setItem('cotacoes', JSON.stringify(dados));
}

// Preenche automaticamente a data de cotação
function preencherDataAtual() {
    const dataCotacaoInput = document.getElementById('data-cotacao');
    const hoje = new Date();
    const ano = hoje.getFullYear();
    const mes = String(hoje.getMonth() + 1).padStart(2, '0'); // Adiciona zero à esquerda se necessário
    const dia = String(hoje.getDate()).padStart(2, '0'); // Adiciona zero à esquerda se necessário
    const dataFormatada = `${ano}-${mes}-${dia}`;
    dataCotacaoInput.value = dataFormatada;
}

// Formata o valor monetário em R$
function formatarValorMonetario(inputId) {
    const input = document.getElementById(inputId);
    input.addEventListener('input', () => {
        let valor = input.value.replace(/\D/g, '');
        if (valor.length > 0) {
            valor = (parseFloat(valor) / 100).toFixed(2);
            input.value = `R$ ${valor.replace('.', ',')}`;
        } else {
            input.value = '';
        }
    });
}

// Preenche automaticamente a cidade do remetente
async function preencherCidadeRemetente() {
    const remetenteInput = document.getElementById('remetente');
    const cidadeRemetenteInput = document.getElementById('cidade-remetente');

    remetenteInput.addEventListener('blur', async () => {
        const remetenteNome = remetenteInput.value.trim();
        if (!remetenteNome) return;

        const dados = await carregarDadosJSON();
        const remetenteEncontrado = dados.remetentes.find(r => r.nome.toUpperCase() === remetenteNome.toUpperCase());

        if (remetenteEncontrado) {
            cidadeRemetenteInput.value = remetenteEncontrado.cidade;
        } else {
            alert(`Remetente "${remetenteNome}" não encontrado.`);
            cidadeRemetenteInput.value = '';
        }
    });
}

// Preenche automaticamente a cidade do destino
async function preencherCidadeDestino() {
    const destinoInput = document.getElementById('destino');
    const cidadeDestinoInput = document.getElementById('cidade-destino');

    destinoInput.addEventListener('blur', async () => {
        const destinoNome = destinoInput.value.trim();
        if (!destinoNome) return;

        const dados = await carregarDadosJSON();
        const destinoEncontrado = dados.destinos.find(d => d.nome.toUpperCase() === destinoNome.toUpperCase());

        if (destinoEncontrado) {
            cidadeDestinoInput.value = destinoEncontrado.cidade;
        } else {
            alert(`Destino "${destinoNome}" não encontrado.`);
            cidadeDestinoInput.value = '';
        }
    });
}

// Filtro de Pesquisa
document.getElementById('campo-pesquisa').addEventListener('input', () => {
    const termoPesquisa = document.getElementById('campo-pesquisa').value.trim().toLowerCase();
    if (!termoPesquisa) {
        carregarDados(); // Se o campo estiver vazio, carrega todos os dados
        document.getElementById('botao-voltar').disabled = false;
        document.getElementById('botao-proximo').disabled = false;
        return;
    }

    const dadosFiltrados = dadosSalvos.filter(item =>
        item.pedido.toLowerCase().includes(termoPesquisa) ||
        item.transportadora.toLowerCase().includes(termoPesquisa) ||
        item.remetente.toLowerCase().includes(termoPesquisa) ||
        item.destino.toLowerCase().includes(termoPesquisa) ||
        item.cidadeDestino.toLowerCase().includes(termoPesquisa) ||
        item.cidadeRemetente.toLowerCase().includes(termoPesquisa)
    );

    // Exibe os dados filtrados na tabela
    exibirDadosFiltrados(dadosFiltrados);
});

// Função para exibir dados filtrados
function exibirDadosFiltrados(dadosFiltrados) {
    const tabelaBody = document.querySelector('#tabela-cotacoes tbody');
    tabelaBody.innerHTML = '';

    dadosFiltrados.forEach((dados, index) => {
        const novaLinha = document.createElement('tr');
        novaLinha.innerHTML = `
            <td>${dados.dataCotacao}</td>
            <td>${dados.pedido}</td>
            <td>${dados.transportadora}</td>
            <td>${dados.remetente}</td>
            <td>${dados.destino}</td>
            <td>${dados.cidadeRemetente}</td>
            <td>${dados.cidadeDestino}</td>
            <td>R$ ${parseFloat(dados.valor).toFixed(2)}</td>
            <td>${dados.tipo}</td>
            <td>${dados.status}</td>
            <td>${dados.cte || '-'}</td>
            <td>${dados.observacao || '-'}</td>
            <td class="action-buttons">
                <button class="edit-button" data-index="${index}">Editar</button>
                <button class="delete-button" data-index="${index}">Excluir</button>
            </td>
        `;
        tabelaBody.appendChild(novaLinha);
    });

    // Desativa a paginação durante a pesquisa
    document.getElementById('botao-voltar').disabled = true;
    document.getElementById('botao-proximo').disabled = true;
}

// Evento de envio do formulário
document.getElementById('form-adicao').addEventListener('submit', function (event) {
    event.preventDefault();

    const dataCotacao = document.getElementById('data-cotacao').value;
    const pedido = document.getElementById('pedido').value;
    const transportadora = document.getElementById('transportadora').value;
    const remetente = document.getElementById('remetente').value;
    const destino = document.getElementById('destino').value;
    const cidadeDestino = document.getElementById('cidade-destino').value;
    const cidadeRemetente = document.getElementById('cidade-remetente').value;
    const valor = document.getElementById('valor').value.replace('R$', '').replace(',', '.');
    const tipo = document.getElementById('tipo').value;
    const cte = document.getElementById('cte').value;
    const observacao = document.getElementById('observacao').value;
    const status = document.getElementById('status').value;

    const novaCotacao = {
        dataCotacao,
        pedido,
        transportadora,
        remetente,
        destino,
        cidadeDestino,
        cidadeRemetente,
        valor: parseFloat(valor),
        tipo,
        cte,
        observacao,
        status
    };

    dadosSalvos.push(novaCotacao);
    salvarDadosNoCache(dadosSalvos);
    paginaAtual = 1;
    carregarDados();
    this.reset();
});

// Adiciona eventos aos botões de edição e exclusão
function adicionarEventosAcoes() {
    document.querySelectorAll('.edit-button').forEach(button => {
        button.addEventListener('click', () => {
            const index = button.dataset.index;
            editarRegistro(index);
        });
    });

    document.querySelectorAll('.delete-button').forEach(button => {
        button.addEventListener('click', () => {
            const index = button.dataset.index;
            excluirRegistro(index);
        });
    });
}

// Função para editar um registro
function editarRegistro(index) {
    const registro = dadosSalvos[index];

    // Preenche o formulário com os dados do registro
    document.getElementById('data-cotacao').value = registro.dataCotacao;
    document.getElementById('pedido').value = registro.pedido;
    document.getElementById('transportadora').value = registro.transportadora;
    document.getElementById('remetente').value = registro.remetente;
    document.getElementById('destino').value = registro.destino;
    document.getElementById('cidade-destino').value = registro.cidadeDestino;
    document.getElementById('cidade-remetente').value = registro.cidadeRemetente;
    document.getElementById('valor').value = `R$ ${parseFloat(registro.valor).toFixed(2).replace('.', ',')}`;
    document.getElementById('tipo').value = registro.tipo;
    document.getElementById('cte').value = registro.cte;
    document.getElementById('observacao').value = registro.observacao;

    // Remove o registro original
    dadosSalvos.splice(index, 1);
    salvarDadosNoCache(dadosSalvos);

    // Carrega os dados novamente na tabela
    carregarDados();
}

// Função para excluir um registro
function excluirRegistro(index) {
    if (confirm('Tem certeza que deseja excluir este registro?')) {
        dadosSalvos.splice(index, 1);
        salvarDadosNoCache(dadosSalvos);
        carregarDados();
    }
}

// Atualiza os botões de paginação
function atualizarBotoesPaginacao() {
    const totalPaginas = Math.ceil(dadosSalvos.length / itensPorPagina);
    const botaoVoltar = document.getElementById('botao-voltar');
    const botaoProximo = document.getElementById('botao-proximo');
    const paginaAtualElement = document.getElementById('pagina-atual');

    // Atualiza o texto da página atual
    paginaAtualElement.textContent = `Página ${paginaAtual} de ${totalPaginas}`;

    // Habilita/desabilita os botões "Voltar" e "Próximo"
    botaoVoltar.disabled = paginaAtual === 1;
    botaoProximo.disabled = paginaAtual === totalPaginas;
}

// Evento para navegar para a próxima página
document.getElementById('botao-proximo').addEventListener('click', () => {
    const totalPaginas = Math.ceil(dadosSalvos.length / itensPorPagina);
    if (paginaAtual < totalPaginas) {
        paginaAtual++;
        carregarDados();
    }
});

// Evento para navegar para a página anterior
document.getElementById('botao-voltar').addEventListener('click', () => {
    if (paginaAtual > 1) {
        paginaAtual--;
        carregarDados();
    }
});


// Função para adicionar eventos de clique nas linhas da tabela
function adicionarEventosSelecao() {
    const linhas = document.querySelectorAll('#tabela-cotacoes tbody tr');

    linhas.forEach((linha, index) => {
        linha.addEventListener('click', () => {
            // Remove a classe 'selecionado' de todas as linhas
            linhas.forEach(l => l.classList.remove('selecionado'));

            // Adiciona a classe 'selecionado' à linha clicada
            linha.classList.add('selecionado');

            // Obtém os dados do registro selecionado
            const registroSelecionado = dadosSalvos[index];

            // Exibe os dados do registro selecionado (opcional)
            console.log('Registro Selecionado:', registroSelecionado);

            // Preenche o formulário com os dados do registro selecionado (opcional)
            preencherFormularioComRegistro(registroSelecionado);
        });
    });
}

// Função para ordenar a tabela
function ordenarTabela(coluna, tipo) {
    const tabelaBody = document.querySelector('#tabela-cotacoes tbody');
    const linhas = Array.from(tabelaBody.querySelectorAll('tr'));

    linhas.sort((a, b) => {
        const valorA = a.querySelector(`td:nth-child(${coluna + 1})`).textContent.trim();
        const valorB = b.querySelector(`td:nth-child(${coluna + 1})`).textContent.trim();

        if (tipo === 'numero') {
            return parseFloat(valorA.replace('R$', '').replace(',', '')) - parseFloat(valorB.replace('R$', '').replace(',', ''));
        } else if (tipo === 'data') {
            return new Date(valorA) - new Date(valorB);
        } else {
            return valorA.localeCompare(valorB);
        }
    });

    // Limpa a tabela
    tabelaBody.innerHTML = '';

    // Adiciona as linhas ordenadas
    linhas.forEach(linha => tabelaBody.appendChild(linha));
}

function ordenarTabela(coluna, tipo) {
    const tabelaBody = document.querySelector('#tabela-cotacoes tbody');
    const linhas = Array.from(tabelaBody.querySelectorAll('tr'));

    linhas.sort((a, b) => {
        const valorA = a.querySelector(`td:nth-child(${coluna + 1})`).textContent.trim();
        const valorB = b.querySelector(`td:nth-child(${coluna + 1})`).textContent.trim();

        let comparacao;
        if (tipo === 'numero') {
            comparacao = parseFloat(valorA.replace('R$', '').replace(',', '')) - parseFloat(valorB.replace('R$', '').replace(',', ''));
        } else if (tipo === 'data') {
            comparacao = new Date(valorA) - new Date(valorB);
        } else {
            comparacao = valorA.localeCompare(valorB);
        }

        return ordemAtual === 'asc' ? comparacao : -comparacao;
    });

    // Limpa a tabela
    tabelaBody.innerHTML = '';

    // Adiciona as linhas ordenadas
    linhas.forEach(linha => tabelaBody.appendChild(linha));

    // Alterna a direção da ordenação
    ordemAtual = ordemAtual === 'asc' ? 'desc' : 'asc';

    // Atualiza os indicadores de ordenação
    atualizarIndicadoresOrdenacao(coluna);
}

function atualizarIndicadoresOrdenacao(coluna) {
    const ths = document.querySelectorAll('#tabela-cotacoes th');
    ths.forEach((th, index) => {
        th.innerHTML = th.textContent; // Remove setas anteriores
        if (index === coluna) {
            th.innerHTML += ordemAtual === 'asc' ? ' ▲' : ' ▼';
        }
    });
}

function ajustarTabelaParaMobile() {
    const tabela = document.getElementById('tabela-cotacoes');
    if (window.innerWidth < 768) {
        const ths = tabela.querySelectorAll('th');
        tabela.querySelectorAll('tbody tr').forEach(tr => {
            tr.querySelectorAll('td').forEach((td, index) => {
                td.setAttribute('data-label', ths[index].textContent);
            });
        });
    }
}

window.addEventListener('resize', ajustarTabelaParaMobile);
window.addEventListener('load', ajustarTabelaParaMobile);

// Inicializa as funcionalidades
window.addEventListener('load', async () => {
    preencherDataAtual();
    formatarValorMonetario('valor');
    await preencherCidadeRemetente();
    await preencherCidadeDestino();
    carregarDados();
});