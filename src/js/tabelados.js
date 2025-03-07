function carregarTabela() {
    // Faz uma requisição para carregar o arquivo JSON
    fetch('src/js/data/tabelados.json')
        .then(response => response.json())
        .then(data => {
            const tbody = document.querySelector('#tabela-clientes tbody');
            tbody.innerHTML = '';

            // Itera sobre os dados do JSON e cria as linhas da tabela
            data.forEach(item => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${item.cliente}</td>
                    <td>${item.endereco}</td>
                    <td>${item.transportadora}</td>
                    <td>${item.valorIda}</td>
                    <td>${item.valorVolta}</td>
                `;
                tbody.appendChild(row);
            });

            // Adiciona o evento de filtro
            const filtro = document.getElementById('filtro');
            filtro.addEventListener('input', () => {
                const termo = filtro.value.toLowerCase();
                const linhas = tbody.querySelectorAll('tr');

                linhas.forEach(linha => {
                    const textoLinha = linha.textContent.toLowerCase();
                    if (textoLinha.includes(termo)) {
                        linha.style.display = '';
                    } else {
                        linha.style.display = 'none';
                    }
                });
            });
        })
        .catch(error => {
            console.error('Erro ao carregar o JSON:', error);
        });
}

// Carrega a tabela quando a página carregar
document.addEventListener('DOMContentLoaded', carregarTabela);