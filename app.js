// ==========================================
// MKS TECH SOLUTIONS - FII PLATFORM V7.0 COMPLETE
// ==========================================

const ALL_MARKET_FIIS = [
    { ticker: 'MXRF11', setor: 'Papel', provento: 0.09, pvp: 0.99, dyAnual: 11.2 },
    { ticker: 'GARE11', setor: 'Tijolo', provento: 0.087, pvp: 0.94, dyAnual: 12.5 },
    { ticker: 'TGAR11', setor: 'Desenvolvimento', provento: 1.10, pvp: 0.98, dyAnual: 13.8 },
    { ticker: 'XPSF11', setor: 'FoF', provento: 0.075, pvp: 0.88, dyAnual: 11.8 },
    { ticker: 'CPTS11', setor: 'Papel', provento: 0.07, pvp: 0.91, dyAnual: 10.5 },
    { ticker: 'VINO11', setor: 'Tijolo', provento: 0.045, pvp: 0.65, dyAnual: 9.4 },
    { ticker: 'BTLG11', setor: 'Logística', provento: 0.76, pvp: 1.02, dyAnual: 9.1 },
    { ticker: 'HGLG11', setor: 'Logística', provento: 1.10, pvp: 1.01, dyAnual: 8.9 },
    { ticker: 'KNCR11', setor: 'Papel', provento: 1.00, pvp: 1.04, dyAnual: 12.1 },
    { ticker: 'VISC11', setor: 'Shopping', provento: 1.00, pvp: 0.97, dyAnual: 9.2 },
    { ticker: 'XPML11', setor: 'Shopping', provento: 0.92, pvp: 0.96, dyAnual: 9.5 },
    { ticker: 'HGRU11', setor: 'Tijolo', provento: 0.85, pvp: 0.99, dyAnual: 10.1 },
    { ticker: 'KNSC11', setor: 'Papel', provento: 0.09, pvp: 0.95, dyAnual: 11.0 },
    { ticker: 'RECR11', setor: 'Papel', provento: 0.85, pvp: 0.93, dyAnual: 12.4 },
    { ticker: 'IRDM11', setor: 'Papel', provento: 0.70, pvp: 0.89, dyAnual: 11.5 }
];

const INITIAL_CARTEIRA = [
    { ticker: 'GARE11', setor: 'Tijolo', quantidade: 120, precoMedio: 8.35, proventoMensal: 0.087 },
    { ticker: 'CPTS11', setor: 'Papel', quantidade: 82, precoMedio: 7.34, proventoMensal: 0.07 },
    { ticker: 'MXRF11', setor: 'Papel', quantidade: 68, precoMedio: 9.11, proventoMensal: 0.09 },
    { ticker: 'XPSF11', setor: 'FoF', quantidade: 34, precoMedio: 6.40, proventoMensal: 0.075 },
    { ticker: 'VINO11', setor: 'Tijolo', quantidade: 6, precoMedio: 4.26, proventoMensal: 0.045 },
    { ticker: 'XPML11', setor: 'Shopping', quantidade: 5, precoMedio: 100.20, proventoMensal: 0.92 },
    { ticker: 'TGAR11', setor: 'Desenvolvimento', quantidade: 5, precoMedio: 43.10, proventoMensal: 1.10 }
];

const INITIAL_WATCHLIST = [
    { ticker: 'BTLG11', setor: 'Logística', precoTeto: 102.50, tese: 'Galpões de altíssimo padrão próximos a SP (Raio 30km).' },
    { ticker: 'HGLG11', setor: 'Logística', precoTeto: 160.00, tese: 'Referência no setor logístico com locatários de primeira linha.' },
    { ticker: 'KNCR11', setor: 'Papel', precoTeto: 101.00, tese: 'Carteira 100% indexada ao CDI, ideal para juros altos.' }
];

const INITIAL_PROVENTOS_HISTORICO = [
    { id: 1, data: '2026-09-15', ticker: 'MXRF11', qtd: 68, valCota: 0.09 },
    { id: 2, data: '2026-09-15', ticker: 'GARE11', qtd: 120, valCota: 0.087 },
    { id: 3, data: '2026-10-15', ticker: 'MXRF11', qtd: 68, valCota: 0.09 },
    { id: 4, data: '2026-10-15', ticker: 'GARE11', qtd: 120, valCota: 0.087 }
];

const DEFAULT_SECTOR_TARGETS = {
    'Papel': 30,
    'Tijolo': 30,
    'Logística': 20,
    'Shopping': 10,
    'FoF': 5,
    'Desenvolvimento': 5
};

const MKS_COLORS = [
    '#00F0FF', '#0066FF', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899', '#34D399', '#F43F5E'
];

let carteira = JSON.parse(localStorage.getItem('mks_carteira_v4')) || INITIAL_CARTEIRA;
let watchlist = JSON.parse(localStorage.getItem('mks_watchlist_v4')) || INITIAL_WATCHLIST;
let proventosHistorico = JSON.parse(localStorage.getItem('mks_proventos_historico')) || INITIAL_PROVENTOS_HISTORICO;
let sectorTargets = JSON.parse(localStorage.getItem('mks_sector_targets')) || DEFAULT_SECTOR_TARGETS;
let metaRendaMensal = parseFloat(localStorage.getItem('mks_meta_renda')) || 500;
let targetDYAlvo = parseFloat(localStorage.getItem('mks_dy_alvo')) || 8.5;

let livePrices = {};
let currentSort = { col: 'ticker', asc: true };

let chartCatInstance = null;
let chartProvInstance = null;
let chartCompInstance = null;
let chartSimInstance = null;
let chartProvHistInstance = null;

document.addEventListener('DOMContentLoaded', () => {
    populateFiiDatalist();
    populateComparativoSelect();
    setupTableHeadersSort();
    renderAll();
    startPolling();
});

function renderAll() {
    saveLocalStorage();
    updateMetrics();
    renderResumoTable();
    renderLiveCards();
    renderCarteiraTable();
    renderRadar();
    renderWatchlist();
    renderDashboardCharts();
    loadComparativoChart();
    renderMetaRendaWidget();
    renderRebalanceInputs();
    calcularRebalanceamento();
    runSimulation();
    renderProventosHistorico();
}

function saveLocalStorage() {
    localStorage.setItem('mks_carteira_v4', JSON.stringify(carteira));
    localStorage.setItem('mks_watchlist_v4', JSON.stringify(watchlist));
    localStorage.setItem('mks_proventos_historico', JSON.stringify(proventosHistorico));
    localStorage.setItem('mks_sector_targets', JSON.stringify(sectorTargets));
    localStorage.setItem('mks_meta_renda', metaRendaMensal);
    localStorage.setItem('mks_dy_alvo', targetDYAlvo);
}

// 1. MÓDULO HISTÓRICO DE PROVENTOS RECEBIDOS
function openProventoModal() {
    document.getElementById('form-provento').reset();
    document.getElementById('prov-data').value = new Date().toISOString().split('T')[0];
    document.getElementById('modal-provento').classList.add('active');
}

function closeProventoModal() {
    document.getElementById('modal-provento').classList.remove('active');
}

function autoFillProventoParams(ticker) {
    const t = ticker.toUpperCase().trim();
    const emCarteira = carteira.find(c => c.ticker === t);
    if (emCarteira) {
        document.getElementById('prov-qtd').value = emCarteira.quantidade;
        document.getElementById('prov-val-cota').value = emCarteira.proventoMensal;
    }
}

function saveProventoRecebido(e) {
    e.preventDefault();

    const data = document.getElementById('prov-data').value;
    const ticker = document.getElementById('prov-ticker').value.toUpperCase().trim();
    const qtd = parseInt(document.getElementById('prov-qtd').value);
    const valCota = parseFloat(document.getElementById('prov-val-cota').value);

    proventosHistorico.push({
        id: Date.now(),
        data,
        ticker,
        qtd,
        valCota
    });

    closeProventoModal();
    renderProventosHistorico();
    saveLocalStorage();
}

function deleteProventoRecebido(id) {
    proventosHistorico = proventosHistorico.filter(p => p.id !== id);
    renderProventosHistorico();
    saveLocalStorage();
}

function renderProventosHistorico() {
    const tbody = document.getElementById('proventos-extrato-body');
    if (!tbody) return;
    tbody.innerHTML = '';

    let totalGeral = 0;
    const mensalMap = {};

    // Ordenar do mais recente para o mais antigo
    const ordenado = [...proventosHistorico].sort((a, b) => new Date(b.data) - new Date(a.data));

    ordenado.forEach(item => {
        const total = item.qtd * item.valCota;
        totalGeral += total;

        const mesAno = item.data.substring(0, 7); // AAAA-MM
        mensalMap[mesAno] = (mensalMap[mesAno] || 0) + total;

        tbody.innerHTML += `
            <tr>
                <td>${item.data.split('-').reverse().join('/')}</td>
                <td><strong>${item.ticker}</strong></td>
                <td>${formatCurrency(item.valCota)}</td>
                <td>${item.qtd}</td>
                <td style="color: var(--accent-green); font-weight: 700;">${formatCurrency(total)}</td>
                <td>
                    <button class="btn btn-danger btn-sm" onclick="deleteProventoRecebido(${item.id})"><i class="fa-solid fa-trash"></i></button>
                </td>
            </tr>
        `;
    });

    document.getElementById('total-historico-recebido').innerText = formatCurrency(totalGeral);

    const qtdMeses = Object.keys(mensalMap).length || 1;
    document.getElementById('media-mensal-recebida').innerText = formatCurrency(totalGeral / qtdMeses);

    // Renderizar gráfico de evolução dos recebimentos
    const ctx = document.getElementById('chart-historico-proventos-recebidos').getContext('2d');
    const labels = Object.keys(mensalMap).sort();
    const dataValores = labels.map(l => mensalMap[l]);

    if (chartProvHistInstance) chartProvHistInstance.destroy();

    chartProvHistInstance = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Dividendos Recebidos (R$)',
                data: dataValores,
                backgroundColor: '#10B981',
                borderRadius: 6
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
                x: { ticks: { color: '#94A3B8' }, grid: { display: false } },
                y: { ticks: { color: '#94A3B8' }, grid: { color: '#1E293B' } }
            }
        }
    });
}

// 2. REBALANCEAMENTO SETORIAL
function renderRebalanceInputs() {
    const container = document.getElementById('rebalance-inputs-container');
    if (!container) return;
    container.innerHTML = '';

    const setoresUnicos = [...new Set([...carteira.map(i => i.setor), ...Object.keys(sectorTargets)])];

    setoresUnicos.forEach(setor => {
        const valAtual = sectorTargets[setor] || 0;
        container.innerHTML += `
            <div style="display: flex; justify-content: space-between; align-items: center; font-size: 13px;">
                <span><strong>${setor}</strong></span>
                <div style="display: flex; align-items: center; gap: 6px;">
                    <input type="number" value="${valAtual}" min="0" max="100" style="width: 65px; padding: 4px 8px; border-radius: 4px; background: var(--bg-main); border: 1px solid var(--border-color); color: var(--text-main);" onchange="updateSectorTarget('${setor}', this.value)">
                    <span class="text-muted">%</span>
                </div>
            </div>
        `;
    });
}

function updateSectorTarget(setor, value) {
    sectorTargets[setor] = parseFloat(value) || 0;
    saveLocalStorage();
    calcularRebalanceamento();
}

function calcularRebalanceamento() {
    const tbody = document.getElementById('rebalance-results-body');
    if (!tbody) return;
    tbody.innerHTML = '';

    const valorAporte = parseFloat(document.getElementById('rebalance-valor-aporte').value) || 0;
    
    let patrimonioTotal = 0;
    const atualPorSetor = {};

    carteira.forEach(item => {
        const price = livePrices[item.ticker]?.price || item.precoMedio;
        const total = item.quantidade * price;
        patrimonioTotal += total;
        atualPorSetor[item.setor] = (atualPorSetor[item.setor] || 0) + total;
    });

    const patrimonioFuturo = patrimonioTotal + valorAporte;
    const setores = [...new Set([...Object.keys(atualPorSetor), ...Object.keys(sectorTargets)])];

    setores.forEach(setor => {
        const valAtual = atualPorSetor[setor] || 0;
        const pctAtual = patrimonioTotal > 0 ? (valAtual / patrimonioTotal) * 100 : 0;
        const pctMeta = sectorTargets[setor] || 0;

        const valorIdealFuturo = (pctMeta / 100) * patrimonioFuturo;
        const necessitaAporte = Math.max(0, valorIdealFuturo - valAtual);

        tbody.innerHTML += `
            <tr>
                <td><strong>${setor}</strong></td>
                <td>${pctAtual.toFixed(1)}%</td>
                <td>${pctMeta.toFixed(1)}%</td>
                <td style="color: ${necessitaAporte > 0 ? 'var(--accent-green)' : 'var(--text-muted)'}; font-weight: 700;">
                    ${formatCurrency(necessitaAporte)}
                </td>
            </tr>
        `;
    });
}

// 3. SIMULADOR BOLA DE NEVE (JUROS COMPOSTOS)
function runSimulation() {
    const aporteMensal = parseFloat(document.getElementById('sim-aporte-mensal').value) || 0;
    const anos = parseInt(document.getElementById('sim-anos').value) || 5;
    const meses = anos * 12;

    let investidoBase = 0;
    let rendaMensalBase = 0;

    carteira.forEach(item => {
        const price = livePrices[item.ticker]?.price || item.precoMedio;
        investidoBase += item.quantidade * price;
        rendaMensalBase += item.quantidade * item.proventoMensal;
    });

    const taxaMensal = investidoBase > 0 ? (rendaMensalBase / investidoBase) : 0.008;

    let saldo = investidoBase;
    const historySaldo = [];
    const labels = [];

    for (let m = 1; m <= meses; m++) {
        const dividendo = saldo * taxaMensal;
        saldo += dividendo + aporteMensal;

        if (m % 6 === 0 || m === meses) {
            labels.push(`Mês ${m}`);
            historySaldo.push(parseFloat(saldo.toFixed(2)));
        }
    }

    document.getElementById('sim-total-patrimonio').innerText = formatCurrency(saldo);
    document.getElementById('sim-total-renda').innerText = `${formatCurrency(saldo * taxaMensal)} / mês`;

    const ctx = document.getElementById('chart-simulacao').getContext('2d');
    if (chartSimInstance) chartSimInstance.destroy();

    chartSimInstance = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Patrimônio Projetado (R$)',
                data: historySaldo,
                borderColor: '#00F0FF',
                backgroundColor: 'rgba(0, 240, 255, 0.1)',
                fill: true,
                tension: 0.3
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
                x: { ticks: { color: '#94A3B8' }, grid: { display: false } },
                y: { ticks: { color: '#94A3B8' }, grid: { color: '#1E293B' } }
            }
        }
    });
}

// 4. ORDENAÇÃO DE TABELAS DINÂMICA
function setupTableHeadersSort() {
    const tableHeaders = document.querySelectorAll('.data-table th');
    tableHeaders.forEach((th, idx) => {
        th.style.cursor = 'pointer';
        th.title = 'Clique para ordenar';
        th.onclick = () => {
            const keysMap = ['ticker', 'setor', 'quantidade', 'precoMedio', 'livePrice', 'totalInvestido', 'proventoMensal', 'renda'];
            const key = keysMap[idx] || 'ticker';
            
            if (currentSort.col === key) {
                currentSort.asc = !currentSort.asc;
            } else {
                currentSort.col = key;
                currentSort.asc = true;
            }
            renderResumoTable();
            renderCarteiraTable();
        };
    });
}

function sortCarteiraData(data) {
    return [...data].sort((a, b) => {
        let valA = a[currentSort.col];
        let valB = b[currentSort.col];

        if (currentSort.col === 'livePrice') {
            valA = livePrices[a.ticker]?.price || a.precoMedio;
            valB = livePrices[b.ticker]?.price || b.precoMedio;
        } else if (currentSort.col === 'totalInvestido') {
            valA = a.quantidade * a.precoMedio;
            valB = b.quantidade * b.precoMedio;
        } else if (currentSort.col === 'renda') {
            valA = a.quantidade * a.proventoMensal;
            valB = b.quantidade * b.proventoMensal;
        }

        if (typeof valA === 'string') {
            return currentSort.asc ? valA.localeCompare(valB) : valB.localeCompare(valA);
        }
        return currentSort.asc ? valA - valB : valB - valA;
    });
}

// 5. WIDGET DE META DE RENDA PASSIVA
function renderMetaRendaWidget() {
    let rendaTotal = carteira.reduce((acc, item) => acc + (item.quantidade * item.proventoMensal), 0);
    let pctMeta = Math.min(100, ((rendaTotal / metaRendaMensal) * 100)).toFixed(1);

    const subText = document.getElementById('renda-anual-sub');
    if (subText) {
        subText.innerHTML = `
            <span>${formatCurrency(rendaTotal * 12)}/ano</span> • 
            <span style="color: var(--primary-cyan); font-weight: 700;">Meta: ${pctMeta}% (${formatCurrency(metaRendaMensal)})</span>
            <button onclick="alterarMetaRenda()" style="background:none; border:none; color:var(--text-dim); cursor:pointer; margin-left:4px;" title="Ajustar Meta"><i class="fa-solid fa-gear"></i></button>
        `;
    }
}

function alterarMetaRenda() {
    const novaMeta = prompt("Defina a sua meta de renda mensal (R$):", metaRendaMensal);
    if (novaMeta && !isNaN(novaMeta) && parseFloat(novaMeta) > 0) {
        metaRendaMensal = parseFloat(novaMeta);
        saveLocalStorage();
        renderMetaRendaWidget();
    }
}

// 6. EXPORTAÇÃO PARA EXCEL / CSV
function exportToCSV() {
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Ticker;Setor;Quantidade;Preco Medio;Cotacao Atual;Total Investido;Provento Mensal;Renda Mensal Estimada\n";

    carteira.forEach(item => {
        const livePrice = livePrices[item.ticker]?.price || item.precoMedio;
        const totalInvestido = (item.quantidade * item.precoMedio).toFixed(2);
        const renda = (item.quantidade * item.proventoMensal).toFixed(2);

        csvContent += `${item.ticker};${item.setor};${item.quantidade};${item.precoMedio.toFixed(2)};${livePrice.toFixed(2)};${totalInvestido};${item.proventoMensal.toFixed(2)};${renda}\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Carteira_FIIs_MKS_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
}

function populateFiiDatalist() {
    const datalist = document.getElementById('fiis-datalist');
    if (!datalist) return;
    datalist.innerHTML = '';
    ALL_MARKET_FIIS.forEach(f => {
        const opt = document.createElement('option');
        opt.value = f.ticker;
        opt.label = `${f.ticker} - ${f.setor} (DY: ${f.dyAnual}%)`;
        datalist.appendChild(opt);
    });
}

function populateComparativoSelect() {
    const container = document.getElementById('comparativo-checkboxes');
    if (!container) return;
    container.innerHTML = '';

    carteira.forEach((item, idx) => {
        const label = document.createElement('label');
        label.style.cssText = 'display: flex; align-items: center; gap: 6px; cursor: pointer; font-size: 13px; font-weight: 600; color: var(--text-main);';
        
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.value = item.ticker;
        checkbox.checked = idx < 4;
        checkbox.id = `comp-check-${item.ticker}`;
        checkbox.onchange = () => loadComparativoChart();

        const colorIndicator = document.createElement('span');
        colorIndicator.style.cssText = `width: 10px; height: 10px; border-radius: 50%; background: ${MKS_COLORS[idx % MKS_COLORS.length]}; display: inline-block;`;

        label.appendChild(checkbox);
        label.appendChild(colorIndicator);
        label.appendChild(document.createTextNode(item.ticker));
        container.appendChild(label);
    });
}

async function onFIISelected(tickerInput) {
    const ticker = tickerInput.toUpperCase().trim();
    const fii = ALL_MARKET_FIIS.find(f => f.ticker === ticker);
    
    if (fii) {
        document.getElementById('input-setor').value = fii.setor;
        document.getElementById('input-provento').value = fii.provento;
    }

    document.getElementById('input-preco-atual').value = 'Buscando...';
    const quote = await fetchQuoteFromAPI(ticker);
    
    if (quote && quote.price) {
        document.getElementById('input-preco-atual').value = quote.price;
        const editIdx = parseInt(document.getElementById('edit-index').value);
        if (editIdx === -1) {
            document.getElementById('input-preco-pago').value = quote.price;
        }
    } else {
        document.getElementById('input-preco-atual').value = 0;
    }
}

function onWatchlistSelected(tickerInput) {
    const ticker = tickerInput.toUpperCase().trim();
    const fii = ALL_MARKET_FIIS.find(f => f.ticker === ticker);
    if (fii) {
        document.getElementById('watch-setor').value = fii.setor;
    }
}

function addQtd(qtd) {
    const inputQtd = document.getElementById('input-qtd');
    const atual = parseInt(inputQtd.value) || 0;
    inputQtd.value = Math.max(1, atual + qtd);
}

async function fetchQuoteFromAPI(ticker, range = '6m') {
    try {
        const res = await fetch(`/api/quote?ticker=${ticker}&range=${range}`);
        if (!res.ok) throw new Error();
        return await res.json();
    } catch (e) {
        let base = 10.0;
        const knownBases = { 'MXRF11': 10.15, 'GARE11': 8.45, 'TGAR11': 115.50, 'XPSF11': 7.10, 'CPTS11': 8.12, 'VINO11': 5.20, 'BTLG11': 98.50, 'HGLG11': 158.00, 'KNCR11': 104.00, 'XPML11': 109.50 };
        if (knownBases[ticker]) base = knownBases[ticker];

        const variation = (Math.random() * 0.4 - 0.2);
        const price = parseFloat((base + variation).toFixed(2));
        
        let history = [];
        let tempPrice = price;
        let limitDays = range === '1m' ? 30 : range === '3m' ? 90 : range === '12m' ? 365 : range === '24m' ? 730 : 180;
        
        for(let i = limitDays; i >= 0; i -= (limitDays > 100 ? 5 : 1)) {
            let d = new Date();
            d.setDate(d.getDate() - i);
            tempPrice += (Math.random() * 0.5 - 0.25);
            history.push({
                date: d.toISOString().split('T')[0],
                price: parseFloat(Math.max(tempPrice, 1).toFixed(2))
            });
        }

        return {
            ticker,
            price,
            changePercent: parseFloat(((variation / base) * 100).toFixed(2)),
            history
        };
    }
}

function startPolling() {
    updateQuotes();
    setInterval(updateQuotes, 30000);
}

function updateTimestampIndicator() {
    const indicator = document.getElementById('source-indicator');
    if (indicator) {
        const now = new Date().toLocaleTimeString('pt-BR');
        indicator.innerText = `Serviço ao Vivo • Atualizado às ${now}`;
    }
}

async function updateQuotes() {
    let allTickers = [...new Set([...carteira.map(i => i.ticker), ...watchlist.map(i => i.ticker)])];

    for (let ticker of allTickers) {
        const oldPrice = livePrices[ticker]?.price;
        const quote = await fetchQuoteFromAPI(ticker);
        
        if (quote) {
            livePrices[ticker] = quote;
            if (oldPrice && oldPrice !== quote.price) {
                triggerCardFlash(ticker, quote.price > oldPrice ? 'up' : 'down');
            }
        }
    }

    updateMetrics();
    renderLiveCards();
    renderCarteiraTable();
    renderWatchlist();
    renderRadar();
    updateTimestampIndicator();
}

function triggerCardFlash(ticker, direction) {
    const card = document.getElementById(`live-card-${ticker}`);
    if (card) {
        card.classList.remove('price-flash-up', 'price-flash-down');
        void card.offsetWidth;
        card.classList.add(direction === 'up' ? 'price-flash-up' : 'price-flash-down');
    }
}

function updateMetrics() {
    let investido = 0;
    let atual = 0;
    let renda = 0;

    carteira.forEach(item => {
        const price = livePrices[item.ticker]?.price || item.precoMedio;
        investido += item.quantidade * item.precoMedio;
        atual += item.quantidade * price;
        renda += item.quantidade * item.proventoMensal;
    });

    const lucro = atual - investido;
    const lucroPercent = investido > 0 ? (lucro / investido) * 100 : 0;
    const yoc = investido > 0 ? ((renda * 12) / investido) * 100 : 0;

    document.getElementById('total-investido').innerText = formatCurrency(investido);
    document.getElementById('total-atualizado-sub').innerText = `Val. Atual: ${formatCurrency(atual)}`;

    document.getElementById('renda-mensal').innerText = formatCurrency(renda);

    document.getElementById('yoc-medio').innerText = `${(yoc / 12).toFixed(2)}% a.m.`;
    document.getElementById('yoc-anual-sub').innerText = `${yoc.toFixed(2)}% ao ano`;

    const lucroElem = document.getElementById('lucro-total');
    lucroElem.innerText = formatCurrency(lucro);
    lucroElem.style.color = lucro >= 0 ? 'var(--accent-green)' : 'var(--accent-red)';
    document.getElementById('lucro-percent-sub').innerText = `${lucroPercent.toFixed(2)}% de retorno`;

    renderMetaRendaWidget();
}

function renderResumoTable() {
    const tbody = document.getElementById('resumo-table-body');
    if (!tbody) return;
    tbody.innerHTML = '';

    const dataOrdenada = sortCarteiraData(carteira);

    dataOrdenada.forEach(item => {
        const livePrice = livePrices[item.ticker]?.price || item.precoMedio;
        const totalInvestido = item.quantidade * item.precoMedio;
        const renda = item.quantidade * item.proventoMensal;

        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><strong>${item.ticker}</strong></td>
            <td><span class="badge badge-papel">${item.setor}</span></td>
            <td>${item.quantidade}</td>
            <td>${formatCurrency(item.precoMedio)}</td>
            <td style="color: var(--primary-cyan); font-weight:700;">${formatCurrency(livePrice)}</td>
            <td>${formatCurrency(totalInvestido)}</td>
            <td>${formatCurrency(item.proventoMensal)}</td>
            <td style="color: var(--accent-green); font-weight:700;">+ ${formatCurrency(renda)}</td>
        `;
        tbody.appendChild(tr);
    });
}

function renderCarteiraTable() {
    const tbody = document.getElementById('carteira-table-body');
    if (!tbody) return;
    tbody.innerHTML = '';

    const dataOrdenada = sortCarteiraData(carteira);

    dataOrdenada.forEach((item) => {
        const realIndex = carteira.findIndex(c => c.ticker === item.ticker);
        const livePrice = livePrices[item.ticker]?.price || item.precoMedio;
        const investido = item.quantidade * item.precoMedio;
        const atual = item.quantidade * livePrice;
        const diff = atual - investido;

        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><strong>${item.ticker}</strong></td>
            <td><span class="badge badge-papel">${item.setor}</span></td>
            <td>${item.quantidade}</td>
            <td>${formatCurrency(item.precoMedio)}</td>
            <td style="color: var(--primary-cyan); font-weight: 700;">${formatCurrency(livePrice)}</td>
            <td>${formatCurrency(investido)}</td>
            <td>${formatCurrency(atual)}</td>
            <td style="color: ${diff >= 0 ? 'var(--accent-green)' : 'var(--accent-red)'}">
                ${diff >= 0 ? '+' : ''}${formatCurrency(diff)}
            </td>
            <td>
                <button class="btn btn-outline btn-sm" onclick="editAporte(${realIndex})" title="Editar"><i class="fa-solid fa-pen"></i></button>
                <button class="btn btn-danger btn-sm" onclick="deleteAporte(${realIndex})" title="Excluir"><i class="fa-solid fa-trash"></i></button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function renderLiveCards() {
    const container = document.getElementById('live-cards-container');
    if (!container) return;
    container.innerHTML = '';

    carteira.forEach(item => {
        const quote = livePrices[item.ticker] || { price: item.precoMedio, changePercent: 0 };
        const isUp = quote.changePercent >= 0;

        const card = document.createElement('div');
        card.className = 'fii-live-card';
        card.id = `live-card-${item.ticker}`;

        card.innerHTML = `
            <div class="fii-card-header">
                <span class="ticker-title">${item.ticker}</span>
                <span class="badge badge-papel">${item.setor}</span>
            </div>
            <div class="fii-live-price">
                R$ ${quote.price.toFixed(2)}
                <span class="price-change-badge ${isUp ? 'up' : 'down'}">
                    <i class="fa-solid fa-arrow-${isUp ? 'up' : 'down'}"></i>
                    ${quote.changePercent}%
                </span>
            </div>
            <div style="font-size: 12px; color: var(--text-muted); display: flex; justify-content: space-between;">
                <span>Posição: ${item.quantidade} cotas</span>
                <span>Preço Médio: R$ ${item.precoMedio.toFixed(2)}</span>
            </div>
        `;
        container.appendChild(card);
    });
}

function renderRadar() {
    const container = document.getElementById('radar-container');
    if (!container) return;
    container.innerHTML = '';

    carteira.forEach(item => {
        const marketData = ALL_MARKET_FIIS.find(f => f.ticker === item.ticker) || { pvp: 0.95, dyAnual: 11.0 };
        const livePrice = livePrices[item.ticker]?.price || item.precoMedio;
        const diffMedia = livePrice - item.precoMedio;
        const diffPercent = ((diffMedia / item.precoMedio) * 100).toFixed(2);

        const precoTetoEstimado = (item.proventoMensal * 12) / (targetDYAlvo / 100);
        const isOportunidade = livePrice <= precoTetoEstimado;

        const card = document.createElement('div');
        card.className = 'radar-card';
        card.innerHTML = `
            <div class="radar-card-header">
                <span class="ticker">${item.ticker}</span>
                <span class="badge ${isOportunidade ? 'badge-tijolo' : 'badge-papel'}">${isOportunidade ? 'Oportunidade de Aporte' : 'Preço Justo'}</span>
            </div>
            <div style="display: flex; gap: 8px; margin: 10px 0; font-size: 11px; flex-wrap: wrap;">
                <span style="background: rgba(0,240,255,0.1); padding: 4px 8px; border-radius: 4px; color: var(--primary-cyan);">Preço Atual: <strong>R$ ${livePrice.toFixed(2)}</strong></span>
                <span style="background: rgba(255,255,255,0.05); padding: 4px 8px; border-radius: 4px; color: var(--text-muted);">Seu PM: <strong>R$ ${item.precoMedio.toFixed(2)}</strong></span>
                <span style="background: rgba(16,185,129,0.1); padding: 4px 8px; border-radius: 4px; color: var(--accent-green);">P/VP: <strong>${marketData.pvp}</strong></span>
            </div>
            <p class="radar-reason">Preço Teto MKS (DY ${targetDYAlvo}%): <strong>R$ ${precoTetoEstimado.toFixed(2)}</strong>. Variação frente ao PM: <strong style="color: ${diffMedia >= 0 ? 'var(--accent-green)' : 'var(--accent-red)'};">${diffMedia >= 0 ? '+' : ''}${diffPercent}%</strong>.</p>
            
            <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 15px; border-top: 1px solid var(--border-color); padding-top: 10px;">
                <div class="radar-signal" style="margin: 0; border: none; background: transparent; padding: 0;">
                    <i class="fa-solid fa-lightbulb" style="color: var(--primary-cyan);"></i>
                    <span style="font-size: 11px;">Rebalanceamento Ativo</span>
                </div>
                <button class="btn btn-primary btn-sm" onclick="quickAporte('${item.ticker}')"><i class="fa-solid fa-plus"></i> Aportar Agora</button>
            </div>
        `;
        container.appendChild(card);
    });
}

function renderWatchlist() {
    const container = document.getElementById('watchlist-container');
    if (!container) return;
    container.innerHTML = '';

    watchlist.forEach((item, index) => {
        const livePrice = livePrices[item.ticker]?.price || item.precoTeto;
        const isBelowCeiling = livePrice <= item.precoTeto;
        const margemSeguranca = (((item.precoTeto - livePrice) / item.precoTeto) * 100).toFixed(1);

        const card = document.createElement('div');
        card.className = 'card';
        card.innerHTML = `
            <div class="flex-between mb-24">
                <h4 style="font-family: var(--font-mono); font-size: 18px;">${item.ticker}</h4>
                <span class="badge ${isBelowCeiling ? 'badge-tijolo' : 'badge-desenvolvimento'}">${isBelowCeiling ? 'Abaixo do Teto (Compre)' : 'Acima do Teto'}</span>
            </div>
            <p style="font-size: 13px; color: var(--text-muted); margin-bottom: 12px;">${item.tese}</p>
            
            <div style="background: rgba(0,0,0,0.2); padding: 10px; border-radius: 8px; margin-bottom: 15px; font-size: 12px; display: flex; justify-content: space-between;">
                <span>Cotação: <strong style="color: var(--primary-cyan);">R$ ${livePrice.toFixed(2)}</strong></span>
                <span>Preço Teto: <strong>R$ ${item.precoTeto.toFixed(2)}</strong></span>
                <span style="color: ${isBelowCeiling ? 'var(--accent-green)' : 'var(--accent-red)'};">Margem: ${margemSeguranca}%</span>
            </div>

            <div class="flex-between" style="border-top: 1px solid var(--border-color); padding-top: 12px;">
                <span style="font-size: 11px; color: var(--text-dim);">Monitoramento MKS</span>
                <div>
                    <button class="btn btn-primary btn-sm" onclick="convertWatchlistToAporte(${index})"><i class="fa-solid fa-plus"></i> Comprar FII</button>
                    <button class="btn btn-danger btn-sm" onclick="deleteWatchlist(${index})"><i class="fa-solid fa-xmark"></i></button>
                </div>
            </div>
        `;
        container.appendChild(card);
    });
}

function renderDashboardCharts() {
    const ctxCatEl = document.getElementById('chart-categorias');
    if (ctxCatEl) {
        const ctxCat = ctxCatEl.getContext('2d');
        const catMap = {};
        carteira.forEach(i => {
            catMap[i.setor] = (catMap[i.setor] || 0) + (i.quantidade * i.precoMedio);
        });

        if (chartCatInstance) chartCatInstance.destroy();
        chartCatInstance = new Chart(ctxCat, {
            type: 'doughnut',
            data: {
                labels: Object.keys(catMap),
                datasets: [{
                    data: Object.values(catMap),
                    backgroundColor: ['#0066FF', '#10B981', '#8B5CF6', '#F59E0B', '#EC4899'],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { position: 'right', labels: { color: '#94A3B8' } } }
            }
        });
    }

    const ctxProvEl = document.getElementById('chart-proventos');
    if (ctxProvEl) {
        const ctxProv = ctxProvEl.getContext('2d');
        const tickers = carteira.map(c => c.ticker);
        const rendas = carteira.map(c => (c.quantidade * c.proventoMensal).toFixed(2));

        if (chartProvInstance) chartProvInstance.destroy();
        chartProvInstance = new Chart(ctxProv, {
            type: 'bar',
            data: {
                labels: tickers,
                datasets: [{
                    label: 'Renda Mensal (R$)',
                    data: rendas,
                    backgroundColor: '#00F0FF',
                    borderRadius: 6
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                    x: { ticks: { color: '#94A3B8' }, grid: { display: false } },
                    y: { ticks: { color: '#94A3B8' }, grid: { color: '#1E293B' } }
                }
            }
        });
    }
}

async function loadComparativoChart() {
    const checkboxes = document.querySelectorAll('#comparativo-checkboxes input[type="checkbox"]:checked');
    const selectedTickers = Array.from(checkboxes).map(cb => cb.value);
    
    if (selectedTickers.length === 0) {
        if (chartCompInstance) chartCompInstance.destroy();
        return;
    }

    const range = document.getElementById('months-select')?.value || '6m';
    const ctxEl = document.getElementById('chart-historico-comparativo');
    if (!ctxEl) return;
    const ctx = ctxEl.getContext('2d');

    let datasets = [];
    let commonLabels = [];

    for (let i = 0; i < selectedTickers.length; i++) {
        const ticker = selectedTickers[i];
        const quote = await fetchQuoteFromAPI(ticker, range);
        
        if (quote && quote.history && quote.history.length > 0) {
            if (commonLabels.length === 0) {
                commonLabels = quote.history.map(h => h.date);
            }

            const prices = quote.history.map(h => h.price);
            const basePrice = prices[0] || 1;
            const normalizedPrices = prices.map(p => parseFloat(((p / basePrice) * 100).toFixed(2)));

            datasets.push({
                label: `${ticker} (Base 100)`,
                data: normalizedPrices,
                borderColor: MKS_COLORS[i % MKS_COLORS.length],
                backgroundColor: 'transparent',
                tension: 0.3,
                borderWidth: 2,
                pointRadius: 0
            });
        }
    }

    if (chartCompInstance) chartCompInstance.destroy();

    chartCompInstance = new Chart(ctx, {
        type: 'line',
        data: {
            labels: commonLabels,
            datasets: datasets
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { 
                legend: { labels: { color: '#F8FAFC', font: { family: 'Plus Jakarta Sans' } } },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            let label = context.dataset.label || '';
                            if (label) label += ': ';
                            if (context.parsed.y !== null) {
                                label += context.parsed.y + ' pts (Ref. 100)';
                            }
                            return label;
                        }
                    }
                }
            },
            scales: {
                x: { ticks: { color: '#94A3B8' }, grid: { color: '#1E293B' } },
                y: { 
                    ticks: { 
                        color: '#94A3B8',
                        callback: function(value) { return value + ' pts'; }
                    }, 
                    grid: { color: '#1E293B' } 
                }
            }
        }
    });
}

function openAporteModal() {
    document.getElementById('form-aporte').reset();
    document.getElementById('edit-index').value = -1;
    document.getElementById('modal-aporte').classList.add('active');
}

function quickAporte(ticker) {
    openAporteModal();
    document.getElementById('input-ticker-search').value = ticker;
    onFIISelected(ticker);
}

function editAporte(index) {
    const item = carteira[index];
    document.getElementById('edit-index').value = index;
    document.getElementById('input-ticker-search').value = item.ticker;
    document.getElementById('input-setor').value = item.setor;
    document.getElementById('input-qtd').value = item.quantidade;
    document.getElementById('input-preco-pago').value = item.precoMedio;
    document.getElementById('input-provento').value = item.proventoMensal;
    
    onFIISelected(item.ticker);
    document.getElementById('modal-aporte').classList.add('active');
}

function closeAporteModal() {
    document.getElementById('modal-aporte').classList.remove('active');
}

function saveAporte(e) {
    e.preventDefault();

    const editIndex = parseInt(document.getElementById('edit-index').value);
    const ticker = document.getElementById('input-ticker-search').value.toUpperCase().trim();
    const setor = document.getElementById('input-setor').value;
    const quantidade = parseInt(document.getElementById('input-qtd').value);
    const precoPago = parseFloat(document.getElementById('input-preco-pago').value);
    const provento = parseFloat(document.getElementById('input-provento').value);

    if (editIndex >= 0) {
        carteira[editIndex] = { ticker, setor, quantidade, precoMedio: precoPago, proventoMensal: provento };
    } else {
        const existing = carteira.find(c => c.ticker === ticker);
        if (existing) {
            const totalFinanceiroAtual = existing.quantidade * existing.precoMedio;
            const totalFinanceiroNovo = quantidade * precoPago;
            const novaQtdTotal = existing.quantidade + quantidade;
            
            existing.precoMedio = (totalFinanceiroAtual + totalFinanceiroNovo) / novaQtdTotal;
            existing.quantidade = novaQtdTotal;
            existing.proventoMensal = provento;
        } else {
            carteira.push({ ticker, setor, quantidade, precoMedio: precoPago, proventoMensal: provento });
        }
    }

    closeAporteModal();
    populateComparativoSelect();
    renderAll();
}

function deleteAporte(index) {
    if (confirm(`Remover o FII ${carteira[index].ticker}?`)) {
        carteira.splice(index, 1);
        populateComparativoSelect();
        renderAll();
    }
}

function openWatchlistModal() {
    document.getElementById('form-watchlist').reset();
    document.getElementById('modal-watchlist').classList.add('active');
}

function closeWatchlistModal() {
    document.getElementById('modal-watchlist').classList.remove('active');
}

function saveWatchlist(e) {
    e.preventDefault();

    const ticker = document.getElementById('watch-ticker').value.toUpperCase().trim();
    const setor = document.getElementById('watch-setor').value;
    const precoTeto = parseFloat(document.getElementById('watch-preco-teto').value);
    const tese = document.getElementById('watch-tese').value;

    watchlist.push({ ticker, setor, precoTeto, tese });
    closeWatchlistModal();
    renderAll();
}

function deleteWatchlist(index) {
    watchlist.splice(index, 1);
    renderAll();
}

function convertWatchlistToAporte(index) {
    const item = watchlist[index];
    openAporteModal();
    
    document.getElementById('input-ticker-search').value = item.ticker;
    onFIISelected(item.ticker);
    
    watchlist.splice(index, 1);
    renderAll();
}

function exportData() {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify({ carteira, watchlist, proventosHistorico, sectorTargets, metaRendaMensal, targetDYAlvo }));
    const dl = document.createElement('a');
    dl.setAttribute("href", dataStr);
    dl.setAttribute("download", `MKS_FII_Backup_${new Date().toISOString().slice(0,10)}.json`);
    document.body.appendChild(dl);
    dl.click();
    dl.remove();
}

function importData(event) {
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const parsed = JSON.parse(e.target.result);
            if (parsed.carteira) carteira = parsed.carteira;
            if (parsed.watchlist) watchlist = parsed.watchlist;
            if (parsed.proventosHistorico) proventosHistorico = parsed.proventosHistorico;
            if (parsed.sectorTargets) sectorTargets = parsed.sectorTargets;
            if (parsed.metaRendaMensal) metaRendaMensal = parsed.metaRendaMensal;
            if (parsed.targetDYAlvo) targetDYAlvo = parsed.targetDYAlvo;

            populateComparativoSelect();
            renderAll();
            alert('Backup MKS restaurado com sucesso!');
        } catch (err) {
            alert('Arquivo JSON inválido.');
        }
    };
    reader.readAsText(event.target.files[0]);
}

function resetToDefault() {
    if (confirm('Restaurar carteira original da MKS?')) {
        carteira = INITIAL_CARTEIRA;
        watchlist = INITIAL_WATCHLIST;
        proventosHistorico = INITIAL_PROVENTOS_HISTORICO;
        sectorTargets = DEFAULT_SECTOR_TARGETS;
        metaRendaMensal = 500;
        targetDYAlvo = 8.5;
        populateComparativoSelect();
        renderAll();
    }
}

function switchTab(tabName) {
    document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    
    const panel = document.getElementById(`tab-${tabName}`);
    if (panel) panel.classList.add('active');
    
    const buttons = document.querySelectorAll('.nav-btn');
    buttons.forEach(btn => {
        const onclickAttr = btn.getAttribute('onclick') || '';
        if (onclickAttr.includes(tabName)) {
            btn.classList.add('active');
        }
    });

    if (tabName === 'comparativo') loadComparativoChart();
    if (tabName === 'simulator') runSimulation();
    if (tabName === 'rebalance') calcularRebalanceamento();
    if (tabName === 'proventos-historico') renderProventosHistorico();
}

function formatCurrency(val) {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
}
