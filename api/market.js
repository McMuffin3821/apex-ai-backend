export default async function handler(req, res) {
  // CORS (allows Netlify → Vercel requests)
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // Handle browser preflight request
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  const apiKey = process.env.FINNHUB_API_KEY;

  if (!apiKey) {
    return res.status(500).json({
      success: false,
      error: "Missing FINNHUB_API_KEY",
    });
  }

  const symbols = [
    "AAPL",
    "TSLA",
    "NVDA",
    "MSFT",
    "AMZN",
    "META",
    "SPY",
    "QQQ",
    "BTCUSD",
    "ETHUSD",
  ];

  try {
    const market = await Promise.all(
      symbols.map(async (symbol) => {
        const response = await fetch(
          `https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${apiKey}`
        );

        const data = await response.json();

        const current = data.c || 0;
        const previousClose = data.pc || 0;

        const percentChange =
          previousClose > 0
            ? (((current - previousClose) / previousClose) * 100).toFixed(2)
            : "0.00";

        return {
          symbol,
          current,
          high: data.h || 0,
          low: data.l || 0,
          open: data.o || 0,
          previousClose,
          percentChange,
        };
      })
    );

    return res.status(200).json({
      success: true,
      timestamp: new Date().toISOString(),
      market,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: "Failed to fetch market data",
      details: error.message,
    });
  }
}
