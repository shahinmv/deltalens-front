import MarketStats from "@/components/MarketStats";
import CryptoChart from "@/components/CryptoChart";
import ChatBox from "@/components/ChatBox";
import NewsBox from "../components/NewsBox";
import TradingSignalBox from "@/components/TradingSignalBox";

const Index = () => {
  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Crypto Dashboard</h1>
          <p className="text-muted-foreground">Welcome back to your portfolio</p>
        </header>
        
        <MarketStats />
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <CryptoChart />
            <div className="mt-8 h-[500px]">
              <TradingSignalBox />
            </div>
          </div>
          <div>
            <ChatBox />
            <div className="mt-8">
              <div className="h-[500px]">
                <NewsBox />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;