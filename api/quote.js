// api/quote.js
export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET');
    
    const { ticker, range = '6m' } = req.query;
  
    if (!ticker) {
      return res.status(400).json({ error: 'Ticker não fornecido' });
    }
  
    const symbol = ticker.toUpperCase().endsWith('.SA') ? ticker.toUpperCase() : `${ticker.toUpperCase()}.SA`;
  
    try {
      const url = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?range=${range}&interval=1d`;
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
        }
      });
  
      if (!response.ok) {
        throw new Error(`Erro Yahoo Finance: ${response.statusText}`);
      }
  
      const data = await response.json();
      const result = data.chart.result?.[0];
      
      if (!result) {
        return res.status(404).json({ error: 'FII não encontrado' });
      }
  
      const meta = result.meta;
      const price = meta.regularMarketPrice || meta.chartPreviousClose || 0;
      const previousClose = meta.chartPreviousClose || price;
      const change = price - previousClose;
      const changePercent = previousClose ? (change / previousClose) * 100 : 0;
  
      const timestamps = result.timestamp || [];
      const quotes = result.indicators?.quote?.[0]?.close || [];
      
      const history = timestamps.map((time, index) => ({
        date: new Date(time * 1000).toISOString().split('T')[0],
        price: quotes[index] ? parseFloat(quotes[index].toFixed(2)) : null
      })).filter(item => item.price !== null);
  
      return res.status(200).json({
        ticker: ticker.toUpperCase(),
        price: parseFloat(price.toFixed(2)),
        previousClose: parseFloat(previousClose.toFixed(2)),
        change: parseFloat(change.toFixed(2)),
        changePercent: parseFloat(changePercent.toFixed(2)),
        currency: meta.currency,
        history: history
      });
  
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }