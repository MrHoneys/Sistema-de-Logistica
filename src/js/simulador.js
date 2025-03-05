// Dados dos veículos cadastrados
const carretas = [
    { nome: "Carreta de 14m", comprimento: 14, largura: 2.5, alturaMaxima: 2.6, quantidadeMaxima: 28 },
    { nome: "Carreta de 14.6m", comprimento: 14.6, largura: 2.5, alturaMaxima: 2.6, quantidadeMaxima: 28 },
    { nome: "Carreta de 15m", comprimento: 15, largura: 2.5, alturaMaxima: 2.6, quantidadeMaxima: 30 },
    { nome: "Carreta de 15.4m", comprimento: 15.4, largura: 2.5, alturaMaxima: 2.6, quantidadeMaxima: 30 }
];

const trucks = [
    { nome: "Truck de 10.4m", comprimento: 10.4, largura: 2.5, alturaMaxima: 2.5, quantidadeMaxima: 20 },
];

const outros = [
    { nome: "Saveiro", comprimento: 1.60, largura: 1.0, alturaMaxima: 1.2, quantidadeMaxima: 1 }
];

document.getElementById('calcular').addEventListener('click', function () {
    const tipoVeiculo = document.getElementById('tipo-veiculo').value;
    const comprimentoPallet = parseFloat(document.getElementById('comprimento').value);
    const larguraPallet = parseFloat(document.getElementById('largura').value);
    const alturaPallet = parseFloat(document.getElementById('altura').value);

    // Validação dos campos
    if (!comprimentoPallet || !larguraPallet || !alturaPallet) {
        document.getElementById('resultado-relatorio').innerHTML = '<p style="color: red; text-align: center;">Por favor, preencha todos os campos.</p>';
        return;
    }

    // Seleciona o array de veículos com base no tipo escolhido
    let veiculos;
    switch (tipoVeiculo) {
        case 'carreta':
            veiculos = carretas;
            break;
        case 'truck':
            veiculos = trucks;
            break;
        case 'outros':
            veiculos = outros;
            break;
        default:
            veiculos = [];
    }

    // Cria a tabela de resultados
    let tabelaHTML = `
        <table>
            <thead>
                <tr>
                    <th>Modelo</th>
                    <th>Quantidade de Pallets</th>
                    <th>Altura do Pallet (m)</th>
                    <th>Quantidade de Camadas</th>
                    <th>Capacidade na Largura</th>
                    <th>Cubagem Total (m³)</th>
                    <th>Validação</th>
                    <th>Válido/Negativo</th>
                </tr>
            </thead>
            <tbody>
    `;

    veiculos.forEach(veiculo => {
        const palletsNaLargura = Math.floor(veiculo.largura / larguraPallet);
        const palletsNoComprimento = Math.floor(veiculo.comprimento / comprimentoPallet);
        const palletsNaAltura = Math.floor(veiculo.alturaMaxima / alturaPallet);

        const totalPallets = palletsNaLargura * palletsNoComprimento * palletsNaAltura;
        const cubagemTotal = totalPallets * (comprimentoPallet * larguraPallet * alturaPallet);

        // Validação
        const validaLargura = palletsNaLargura >= 1 ? '🟢' : '🔴';
        const validaAltura = palletsNaAltura >= 1 ? '🟢' : '🔴';
        const validacao = `${validaLargura} ${validaAltura}`;
        const validoNegativo = totalPallets > 0 ? '<span class="validacao-verde">Válido</span>' : '<span class="validacao-vermelha">Negativo</span>';

        tabelaHTML += `
            <tr>
                <td>${veiculo.nome}</td>
                <td>${totalPallets}</td>
                <td>${alturaPallet}</td>
                <td>${palletsNaAltura}</td>
                <td>${palletsNaLargura}</td>
                <td>${cubagemTotal.toFixed(2)}</td>
                <td>${validacao}</td>
                <td>${validoNegativo}</td>
            </tr>
        `;
    });

    tabelaHTML += '</tbody></table>';

    // Exibe a tabela no DOM
    document.getElementById('resultado-relatorio').innerHTML = tabelaHTML;
});