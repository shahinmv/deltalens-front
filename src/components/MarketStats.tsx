import React, { useEffect, useState } from "react";
import { ArrowUpIcon, ArrowDownIcon, TrendingUpIcon } from "lucide-react";
import Skeleton from "./ui/skeleton";

// Define the type for the API response
type MarketStatsData = {
  market_cap: number;
  market_cap_change_24h: number;
  market_cap_change_percentage_24h: number;
  btc_dominance: number;
  btc_dominance_change_24h: number | null;
  volume_24h: number;
  volume_24h_change: number;
};

// Add type for sentiment API response
type NewsSentimentData = {
  sentiment: number | null;
  message?: string;
};

// Helper to format large numbers (e.g., 2.1T, 915B)
function formatNumberShort(num: number): string {
  if (num >= 1e12) return (num / 1e12).toFixed(1).replace(/\.0$/, '') + 'T';
  if (num >= 1e9) return (num / 1e9).toFixed(1).replace(/\.0$/, '') + 'B';
  if (num >= 1e6) return (num / 1e6).toFixed(1).replace(/\.0$/, '') + 'M';
  if (num >= 1e3) return (num / 1e3).toFixed(1).replace(/\.0$/, '') + 'K';
  return num.toLocaleString();
}

const MarketStats = () => {
  const [stats, setStats] = useState<MarketStatsData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // News sentiment state
  const [sentiment, setSentiment] = useState<NewsSentimentData | null>(null);
  const [sentimentLoading, setSentimentLoading] = useState(true);
  const [sentimentError, setSentimentError] = useState<string | null>(null);

  useEffect(() => {
    fetch("http://localhost:8000/api/market-stats/")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch market stats");
        return res.json();
      })
      .then((data) => {
        setStats(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    fetch("http://localhost:8000/api/news-sentiment/")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch news sentiment");
        return res.json();
      })
      .then((data) => {
        setSentiment(data);
        setSentimentLoading(false);
      })
      .catch((err) => {
        setSentimentError(err.message);
        setSentimentLoading(false);
      });
  }, []);

  if (error) return <div>Error: {error}</div>;

  // Helper for fade-in
  const fadeIn = loading ? "opacity-0" : "opacity-100 transition-opacity duration-500";
  const fadeInSentiment = sentimentLoading ? "opacity-0" : "opacity-100 transition-opacity duration-500";

  // Helper to interpret sentiment
  function sentimentLabel(score: number | null): { label: string; color: string } {
    if (score === null) return { label: "No Data", color: "text-muted-foreground" };
    if (score > 0.05) return { label: "Positive", color: "text-success" };
    if (score < -0.05) return { label: "Negative", color: "text-danger" };
    return { label: "Neutral", color: "text-warning" };
  }

  const sentimentInfo = sentimentLabel(sentiment?.sentiment ?? null);

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8 animate-fade-in">
      {/* Market Cap Block */}
      <div className="glass-card p-6 rounded-lg">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-muted-foreground">Market Cap</h3>
          <TrendingUpIcon className="w-4 h-4 text-success" />
        </div>
        <p className="text-2xl font-semibold mt-2">
          {loading ? (
            <Skeleton style={{ width: 120, height: 32 }} />
          ) : (
            <span className={fadeIn}>${formatNumberShort(stats!.market_cap)}</span>
          )}
        </p>
        <span className={`text-sm flex items-center gap-1 ${stats && stats.market_cap_change_24h >= 0 ? "text-success" : "text-danger"}`}>
          {loading ? (
            <Skeleton style={{ width: 60, height: 20 }} />
          ) : (
            <span className={`flex items-center gap-1 ${fadeIn}`}>
              {stats!.market_cap_change_24h >= 0 ? <ArrowUpIcon className="w-3 h-3" /> : <ArrowDownIcon className="w-3 h-3" />}
              {stats!.market_cap_change_percentage_24h.toFixed(2)}%
            </span>
          )}
        </span>
      </div>
      {/* 24h Volume Block */}
      <div className="glass-card p-6 rounded-lg">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-muted-foreground">24h Volume</h3>
          <TrendingUpIcon className="w-4 h-4 text-success" />
        </div>
        <p className="text-2xl font-semibold mt-2">
          {loading ? (
            <Skeleton style={{ width: 120, height: 32 }} />
          ) : (
            <span className={fadeIn}>${formatNumberShort(Number(stats!.volume_24h))}</span>
          )}
        </p>
        <span className={`text-sm flex items-center gap-1 ${stats && stats.volume_24h_change >= 0 ? "text-success" : "text-danger"}`}>
          {loading ? (
            <Skeleton style={{ width: 60, height: 20 }} />
          ) : (
            <span className={`flex items-center gap-1 ${fadeIn}`}>
              {stats!.volume_24h_change >= 0 ? <ArrowUpIcon className="w-3 h-3" /> : <ArrowDownIcon className="w-3 h-3" />}
              {stats!.volume_24h_change.toFixed(2)}%
            </span>
          )}
        </span>
      </div>
      {/* BTC Dominance Block */}
      <div className="glass-card p-6 rounded-lg">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-muted-foreground">BTC Dominance</h3>
          <TrendingUpIcon className="w-4 h-4 text-warning" />
        </div>
        <p className="text-2xl font-semibold mt-2">
          {loading ? (
            <Skeleton style={{ width: 80, height: 32 }} />
          ) : (
            <span className={fadeIn}>{stats!.btc_dominance.toFixed(2)}%</span>
          )}
        </p>
        {loading ? (
          <Skeleton style={{ width: 60, height: 20 }} />
        ) : (
          typeof stats!.btc_dominance_change_24h === 'number' && (
            <span className={`text-sm flex items-center gap-1 ${stats!.btc_dominance_change_24h >= 0 ? "text-success" : "text-danger"} ${fadeIn}`}>
              {stats!.btc_dominance_change_24h >= 0 ? <ArrowUpIcon className="w-3 h-3" /> : <ArrowDownIcon className="w-3 h-3" />}
              {stats!.btc_dominance_change_24h.toFixed(2)}%
            </span>
          )
        )}
      </div>
      {/* News Sentiment Block */}
      <div className="glass-card p-6 rounded-lg">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-muted-foreground">Today's News Sentiment</h3>
        </div>
        <div className="flex items-center justify-between mt-2">
          <div className="flex flex-col items-start">
            <span className={"text-2xl font-semibold "+fadeInSentiment+" "+sentimentInfo.color}>
              {sentimentLoading ? <Skeleton style={{ width: 80, height: 32 }} /> : sentimentInfo.label}
            </span>
            {sentimentLoading ? (
              <Skeleton style={{ width: 40, height: 28 }} />
            ) : (
              typeof sentiment?.sentiment === 'number' && (
                <span className="text-sm text-muted-foreground">{sentiment.sentiment.toFixed(2)}</span>
              )
            )}
          </div>
        </div>
        {sentimentError && <span className="text-danger text-sm">Error: {sentimentError}</span>}
        {sentiment && sentiment.message && (
          <span className="text-muted-foreground text-xs">{sentiment.message}</span>
        )}
      </div>
    </div>
  );
};

export default MarketStats;