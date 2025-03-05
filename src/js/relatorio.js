let paginaAtual = 1; // Página inicial
const itensPorPagina = 4; // Número máximo de transportadoras por página

document.getElementById('gerar-relatorio').addEventListener('click', function () {
    let todasTransportadoras = document.getElementById('todas-transportadoras').checked;
    let pedido = document.getElementById('pedido').value.trim().toLowerCase();
    let dataFiltro = document.getElementById('data-filtro').value;
    let transportadoraEspecifica = document.getElementById('transportadora').value.trim().toLowerCase();
    let remetente = document.getElementById('remetente').value.trim().toLowerCase();
    let destino = document.getElementById('destino').value.trim().toLowerCase();
    let cidadeRemetente = document.getElementById('cidade-remetente').value.trim().toLowerCase();
    let cidadeDestino = document.getElementById('cidade-destino').value.trim().toLowerCase();
    let cte = document.getElementById('cte').value.trim().toLowerCase();
    let tipoFiltro = document.getElementById('tipo-filtro')?.value.trim().toLowerCase();
    let statusFiltro = document.getElementById('status-filtro')?.value.trim().toLowerCase();

    let dadosArmazenados = JSON.parse(localStorage.getItem('cotacoes')) || [];
    let resultadoRelatorio = document.getElementById('resultado-relatorio');
    resultadoRelatorio.innerHTML = '';

    if (dadosArmazenados.length === 0) {
        resultadoRelatorio.innerHTML = '<p style="text-align: center; color: red; font-size: 16px;">Nenhum dado encontrado.</p>';
        return;
    }

    // Filtragem dos dados
    let dadosFiltrados = dadosArmazenados.filter(dado => {
        const dataCotacao = new Date(dado.dataCotacao).toISOString().split('T')[0];
        return (
            (!pedido || dado.pedido.toLowerCase().includes(pedido)) &&
            (!dataFiltro || dataCotacao === dataFiltro) &&
            (todasTransportadoras || dado.transportadora.toLowerCase().includes(transportadoraEspecifica)) &&
            (!remetente || dado.remetente.toLowerCase().includes(remetente)) &&
            (!destino || dado.destino.toLowerCase().includes(destino)) &&
            (!cidadeRemetente || dado.cidadeRemetente.toLowerCase().includes(cidadeRemetente)) &&
            (!cidadeDestino || dado.cidadeDestino.toLowerCase().includes(cidadeDestino)) &&
            (!cte || dado.cte?.toLowerCase().includes(cte)) &&
            (!tipoFiltro || dado.tipo?.toLowerCase() === tipoFiltro) &&
            (!statusFiltro || dado.status.toLowerCase() === statusFiltro)
        );
    });

    if (dadosFiltrados.length === 0) {
        resultadoRelatorio.innerHTML = '<p style="text-align: center; color: red; font-size: 16px;">Nenhum resultado encontrado para os filtros especificados.</p>';
        return;
    }

    window.dadosFiltrados = dadosFiltrados;
    paginaAtual = 1;
    exibirPagina(dadosFiltrados);
    document.getElementById('export-buttons').style.display = 'flex';
});

function exibirPagina(dadosFiltrados) {
    let resultadoRelatorio = document.getElementById('resultado-relatorio');
    resultadoRelatorio.innerHTML = '';
    const indiceInicial = (paginaAtual - 1) * itensPorPagina;
    const indiceFinal = paginaAtual * itensPorPagina;
    const dadosPagina = dadosFiltrados.slice(indiceInicial, indiceFinal);

    const formatarData = (dataISO) => {
        const data = new Date(dataISO);
        return data.toLocaleDateString('pt-BR');
    };

    let totalValor = dadosFiltrados.reduce((acc, dado) => acc + parseFloat(dado.valor), 0);
    let tabela = '<table><thead><tr><th>Data Cotação</th><th>Pedido</th><th>Transportadora</th><th>Remetente</th><th>Destino</th><th>Cidade Remetente</th><th>Cidade Destino</th><th>Valor</th><th>Tipo</th><th>Status</th><th>CT-e</th><th>Observação</th></tr></thead><tbody>';

    dadosPagina.forEach(dado => {
        let tipoClasse = {
            'venda': 'tipo-venda',
            'materia prima': 'tipo-materia-prima',
            'ferramentaria': 'tipo-ferramentaria',
            'manutenção': 'tipo-manutencao'
        }[dado.tipo?.trim().toLowerCase()] || '';

        let statusClasse = {
            'cotação': 'status-cotacao',
            'cancelado': 'status-cancelado',
            'aprovado': 'status-aprovado'
        }[dado.status?.trim().toLowerCase()] || '';

        // Garantir que a observação seja exibida corretamente
        let observacao = dado.observacao ? dado.observacao : '-'; // Ajuste aqui para usar "observacao"

        tabela += `<tr>
            <td>${formatarData(dado.dataCotacao)}</td>
            <td>${dado.pedido}</td>
            <td>${dado.transportadora}</td>
            <td>${dado.remetente}</td>
            <td>${dado.destino}</td>
            <td>${dado.cidadeRemetente}</td>
            <td>${dado.cidadeDestino}</td>
            <td>R$ ${parseFloat(dado.valor).toFixed(2).replace('.', ',')}</td>
            <td class="${tipoClasse}">${dado.tipo || '-'}</td>
            <td class="${statusClasse}">${dado.status || '-'}</td>
            <td>${dado.cte || '-'}</td>
            <td>${observacao}</td> <!-- Observação tratada aqui -->
        </tr>`;
    });

    tabela += `
    <tr>
        <td colspan="7" style="text-align: left;"><strong>Total</strong></td>
        <td><strong>R$ ${totalValor.toFixed(2).replace('.', ',')}</strong></td>
        <td colspan="4"></td>
    </tr>`;
    tabela += '</tbody></table>';
    resultadoRelatorio.innerHTML = tabela;
}