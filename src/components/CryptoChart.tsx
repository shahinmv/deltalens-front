const CryptoChart = () => (
  <div className="glass-card p-6 rounded-lg mb-8 animate-fade-in">
    <div className="flex items-center justify-between mb-6">
      <h2 className="text-xl font-semibold">Bitcoin Price</h2>
    </div>
    <div className="h-[400px] w-full">
      <iframe
        src="https://s.tradingview.com/widgetembed/?symbol=BINANCE:BTCUSDT&interval=D&theme=dark"
        style={{ width: '100%', height: '400px', border: 'none' }}
        allowFullScreen
        title="TradingView Chart"
      />
    </div>
  </div>
);

export default CryptoChart;