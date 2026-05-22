export default async function handler(req, res) {
  const apiKey = process.env.FINNHUB_API_KEY;

  if (!apiKey) {
    return res.status(500).json({
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
    "ETHUSD"
  ];

  try {
    const stockData = await Promise.all(
      symbols.map(async (symbol) => {
        const response = await fetch(
          `https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${apiKey}`
        );

        const data = await response.json();

        return {
          symbol,
          current: data.c || 0,
          high: data.h || 0,
          low: data.l || 0,
          open: data.o || 0,
          previousClose: data.pc || 0,
          percentChange:
            data.pc > 0
              ? (((data.c - data.pc) / data.pc) * 100).toFixed(2)
              : "0.00",
        };
      })
    );

    res.status(200).json({
      success: true,
      timestamp: new Date().toISOString(),
      market: stockData,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      error: "Failed to fetch market data",
    });
  }
}
