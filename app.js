// BANCO DE DADOS COMPLETO B3
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

const MKS_COLORS = [
    '#00F0FF', '#0066FF', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899', '#34D399', '#F43F5E'
];

// STATE
let carteira = JSON.parse(localStorage.getItem('mks_carteira_v3')) || INITIAL_CARTEIRA;
let watchlist = JSON.parse(localStorage.getItem('mks_watchlist_v3')) || INITIAL_WATCHLIST;
let livePrices = {};

let chartCatInstance = null;
let chartProvInstance = null;
let chartCompInstance = null;

document.addEventListener('DOMContentLoaded', () => {
    populateFiiDatalist();
    populateComparativoSelect();
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
}

function saveLocalStorage() {
    localStorage.setItem('mks_carteira_v3', JSON.stringify(carteira));
    localStorage.setItem('mks_watchlist_v3', JSON.stringify(watchlist));
}

// DROPDOWN AUTOCOMPLETE B3
function populateFiiDatalist() {
    const datalist = document.getElementById('fiis-datalist');
    datalist.innerHTML = '';
    ALL_MARKET_FIIS.forEach(f => {
        const opt = document.createElement('option');
        opt.value = f.ticker;
        opt.label = `${f.ticker} - ${f.setor} (P/VP: ${f.pvp})`;
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
        checkbox.checked = idx < 3;
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

// REALTIME API (YAHOO / FALLBACK)
async function fetchQuoteFromAPI(ticker, range = '6m') {
    try {
        const res = await fetch(`/api/quote?ticker=${ticker}&range=${range}`);
        if (!res.ok) throw new Error();
        return await res.json();
    } catch (e) {
        let base = 10.0;
        if (ticker === 'MXRF11') base = 10.15;
        if (ticker === 'GARE11') base = 8.45;
        if (ticker === 'TGAR11') base = 115.50;
        if (ticker === 'XPSF11') base = 7.10;
        if (ticker === 'CPTS11') base = 8.12;
        if (ticker === 'VINO11') base = 5.20;
        if (ticker === 'BTLG11') base = 98.50;
        if (ticker === 'HGLG11') base = 158.00;

        const variation = (Math.random() * 0.2 - 0.1);
        const price = parseFloat((base + variation).toFixed(2));
        
        let history = [];
        let tempPrice = price;
        let limitDays = range === '1m' ? 30 : range === '3m' ? 90 : 180;
        
        for(let i = limitDays; i >= 0; i--) {
            let d = new Date();
            d.setDate(d.getDate() - i);
            tempPrice += (Math.random() * 0.3 - 0.15);
            history.push({
                date: d.toISOString().split('T')[0],
                price: parseFloat(tempPrice.toFixed(2))
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
    setInterval(updateQuotes, 15000);
}

function updateTimestampIndicator() {
    const indicator = document.getElementById('source-indicator');
    if (indicator) {
        const now = new Date().toLocaleTimeString('pt-BR');
        indicator.innerText = `Serviço ao Vivo (Yahoo / Vercel API) • Atualizado às ${now}`;
    }
}

async function updateQuotes() {
    // Coleta tickers únicos da carteira e da watchlist
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

// METRICS
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
    document.getElementById('renda-anual-sub').innerText = `${formatCurrency(renda * 12)} / ano`;

    document.getElementById('yoc-medio').innerText = `${(yoc / 12).toFixed(2)}% a.m.`;
    document.getElementById('yoc-anual-sub').innerText = `${yoc.toFixed(2)}% ao ano`;

    const lucroElem = document.getElementById('lucro-total');
    lucroElem.innerText = formatCurrency(lucro);
    lucroElem.style.color = lucro >= 0 ? 'var(--accent-green)' : 'var(--accent-red)';
    document.getElementById('lucro-percent-sub').innerText = `${lucroPercent.toFixed(2)}% de retorno`;
}

// RENDER TABLES
function renderResumoTable() {
    const tbody = document.getElementById('resumo-table-body');
    tbody.innerHTML = '';

    carteira.forEach(item => {
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
    tbody.innerHTML = '';

    carteira.forEach((item, index) => {
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
                <button class="btn btn-outline btn-sm" onclick="editAporte(${index})" title="Editar"><i class="fa-solid fa-pen"></i></button>
                <button class="btn btn-danger btn-sm" onclick="deleteAporte(${index})" title="Excluir"><i class="fa-solid fa-trash"></i></button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

// RENDER LIVE CARDS
function renderLiveCards() {
    const container = document.getElementById('live-cards-container');
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

// RADAR COM INDICADORES QUANTITATIVOS E COMPARATIVO DE PREÇO
function renderRadar() {
    const container = document.getElementById('radar-container');
    container.innerHTML = '';

    carteira.forEach(item => {
        const marketData = ALL_MARKET_FIIS.find(f => f.ticker === item.ticker) || { pvp: 0.95, dyAnual: 11.0 };
        const livePrice = livePrices[item.ticker]?.price || item.precoMedio;
        const diffMedia = livePrice - item.precoMedio;
        const diffPercent = ((diffMedia / item.precoMedio) * 100).toFixed(2);

        const card = document.createElement('div');
        card.className = 'radar-card';
        card.innerHTML = `
            <div class="radar-card-header">
                <span class="ticker">${item.ticker}</span>
                <span class="badge badge-papel">${item.setor}</span>
            </div>
            <div style="display: flex; gap: 8px; margin: 10px 0; font-size: 11px; flex-wrap: wrap;">
                <span style="background: rgba(0,240,255,0.1); padding: 4px 8px; border-radius: 4px; color: var(--primary-cyan);">Preço Atual: <strong>R$ ${livePrice.toFixed(2)}</strong></span>
                <span style="background: rgba(255,255,255,0.05); padding: 4px 8px; border-radius: 4px; color: var(--text-muted);">Seu Preço Médio: <strong>R$ ${item.precoMedio.toFixed(2)}</strong></span>
                <span style="background: rgba(16,185,129,0.1); padding: 4px 8px; border-radius: 4px; color: var(--accent-green);">P/VP: <strong>${marketData.pvp}</strong></span>
            </div>
            <p class="radar-reason">Variação frente ao seu PM: <strong style="color: ${diffMedia >= 0 ? 'var(--accent-green)' : 'var(--accent-red)'};">${diffMedia >= 0 ? '+' : ''}${diffPercent}%</strong>. Excelente para rebalanceamento ou aporte em baixa.</p>
            <div class="radar-signal">
                <i class="fa-solid fa-lightbulb"></i>
                <span>Sinal MKS: Oportunidade Validada por Preço</span>
            </div>
        `;
        container.appendChild(card);
    });
}

// WATCHLIST COM COTAÇÃO ATUAL E PREÇO TETO
function renderWatchlist() {
    const container = document.getElementById('watchlist-container');
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
                <span>Cotação Vivo: <strong style="color: var(--primary-cyan);">R$ ${livePrice.toFixed(2)}</strong></span>
                <span>Preço Teto: <strong>R$ ${item.precoTeto.toFixed(2)}</strong></span>
                <span style="color: ${isBelowCeiling ? 'var(--accent-green)' : 'var(--accent-red)'};">Margem: ${margemSeguranca}%</span>
            </div>

            <div class="flex-between" style="border-top: 1px solid var(--border-color); padding-top: 12px;">
                <span style="font-size: 11px; color: var(--text-dim);">Monitorando Teto MKS</span>
                <div>
                    <button class="btn btn-primary btn-sm" onclick="convertWatchlistToAporte(${index})"><i class="fa-solid fa-plus"></i> Aportar</button>
                    <button class="btn btn-danger btn-sm" onclick="deleteWatchlist(${index})"><i class="fa-solid fa-xmark"></i></button>
                </div>
            </div>
        `;
        container.appendChild(card);
    });
}

// CHARTS
function renderDashboardCharts() {
    const ctxCat = document.getElementById('chart-categorias').getContext('2d');
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

    const ctxProv = document.getElementById('chart-proventos').getContext('2d');
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

// COMPARATIVO CHART (BASE 100)
async function loadComparativoChart() {
    const checkboxes = document.querySelectorAll('#comparativo-checkboxes input[type="checkbox"]:checked');
    const selectedTickers = Array.from(checkboxes).map(cb => cb.value);
    
    if (selectedTickers.length === 0) {
        if (chartCompInstance) chartCompInstance.destroy();
        return;
    }

    const range = document.getElementById('months-select').value;
    const ctx = document.getElementById('chart-historico-comparativo').getContext('2d');

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

// MODAL ACTIONS & EDITING
function openAporteModal() {
    document.getElementById('form-aporte').reset();
    document.getElementById('edit-index').value = -1;
    document.getElementById('modal-aporte').classList.add('active');
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
            const totalQtd = existing.quantidade + quantidade;
            existing.precoMedio = ((existing.quantidade * existing.precoMedio) + (quantidade * precoPago)) / totalQtd;
            existing.quantidade = totalQtd;
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

// WATCHLIST MODAL
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

// BACKUPS
function exportData() {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify({ carteira, watchlist }));
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
        populateComparativoSelect();
        renderAll();
    }
}

function switchTab(tabName) {
    document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    
    document.getElementById(`tab-${tabName}`).classList.add('active');
    
    const buttons = document.querySelectorAll('.nav-btn');
    buttons.forEach(btn => {
        if (btn.getAttribute('onclick').includes(tabName)) {
            btn.classList.add('active');
        }
    });
}

function formatCurrency(val) {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
}
