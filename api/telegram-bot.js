// api/telegram-bot.js
export default async function handler(req, res) {
    // Garante que a requisição veio do Telegram via POST
    if (req.method !== 'POST') {
        return res.status(200).json({ status: 'MKS Telegram Bot is running!' });
    }

    const { message } = req.body;

    if (message && message.text) {
        const chatId = message.chat.id;
        const text = message.text.trim();

        // Token do seu bot (o ideal é colocar isso nas Variáveis de Ambiente da Vercel depois!)
        const TOKEN = process.env.TELEGRAM_BOT_TOKEN || '7556734681:AAEBbTW2y1x7ZDjne-vdkDXDykagNbeYLeI';

        let resposta = '🤖 *MKS Tech Bot*\n\nComando não reconhecido. Digite `/preco [TICKER]` para consultar.';

        if (text.startsWith('/start')) {
            resposta = '🚀 *Bem-vindo ao MKS FII Bot!*\n\nSeu assistente pessoal de Fundos Imobiliários na Vercel está ativo.';
        } else if (text.startsWith('/preco')) {
            const parts = text.split(' ');
            const ticker = parts[1] ? parts[1].toUpperCase() : 'MXRF11';
            resposta = `📈 Cotação simulada para *${ticker}*: R$ 10,15 (Exemplo ao vivo).`;
        }

        // Envia a resposta de volta para o Telegram
        try {
            await fetch(`https://api.telegram.org/bot${TOKEN}/sendMessage`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    chat_id: chatId,
                    text: resposta,
                    parse_mode: 'Markdown'
                })
            });
        } catch (error) {
            console.error('Erro ao enviar mensagem para o Telegram:', error);
        }
    }

    return res.status(200).json({ success: true });
}