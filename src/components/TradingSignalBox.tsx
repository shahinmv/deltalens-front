import React, { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { dashboardAPI } from "@/services/api";

// Define the type for signal performance
interface SignalPerformance {
  signal_id: number;
  status: string;
  entry_date: string;
  current_price: number;
  hit_target: number;
  hit_stop_loss: number;
  is_expired: number;
  pnl_percentage: number;
  exit_reason: string;
  exit_date: string | null;
  exit_timestamp: number | null;
  days_active: number;
  last_checked: string;
  created_at: string;
  updated_at: string;
}

// Define the type for iterative trading signal
interface IterativeTradingSignal {
  id?: number;
  prediction_date: string;
  symbol: string;
  signal_type: string;
  entry_price: number;
  target_price: number;
  stop_loss: number;
  confidence: number;
  predicted_return: number;
  position_size: number;
  timestamp: string;
  expires_at: string;
  status: string;
  dynamic_stop_pct: number;
  market_volatility: number;
  trend_strength: number;
  momentum: number;
  fear_index: number;
  is_active: boolean;
}

interface IterativeTradingSignalResponse {
  signals: IterativeTradingSignal[];
  message?: string;
  error?: string;
}

interface SignalPerformanceResponse {
  performances: SignalPerformance[];
  message?: string;
  error?: string;
}

const TradingSignalBox = () => {
  const [signals, setSignals] = useState<IterativeTradingSignal[]>([]);
  const [performances, setPerformances] = useState<SignalPerformance[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch both signals and performances
        const [signalsData, performancesData] = await Promise.all([
          dashboardAPI.getTradingSignals(),
          dashboardAPI.getSignalPerformance()
        ]);
        
        if (signalsData.error) {
          setError(signalsData.error);
        } else if (signalsData.signals && signalsData.signals.length > 0) {
          setSignals(signalsData.signals);
        }
        
        if (performancesData.performances) {
          setPerformances(performancesData.performances);
        }
        
        if (!signalsData.signals?.length && !performancesData.performances?.length) {
          setError("No trading data available");
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const getSignalTypeColor = (signalType: string) => {
    switch (signalType) {
      case "LONG":
        return "bg-green-500 text-white";
      case "SHORT":
        return "bg-red-500 text-white";
      case "HOLD":
        return "bg-yellow-500 text-black";
      default:
        return "bg-gray-500 text-white";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "TARGET_HIT":
        return "bg-green-500 text-white";
      case "STOP_LOSS_HIT":
        return "bg-red-500 text-white";
      case "ACTIVE_PENDING_DATA":
        return "bg-yellow-500 text-black";
      case "EXPIRED":
        return "bg-gray-500 text-white";
      default:
        return "bg-blue-500 text-white";
    }
  };

  const getPerformanceBySignalId = (signalId: number) => {
    return performances.find(p => p.signal_id === signalId);
  };

  const formatStatusDisplay = (status: string) => {
    if (status === "ACTIVE_PENDING_DATA") {
      return "ACTIVE";
    }
    return status.replace('_', ' ');
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(price);
  };

  const formatPercentage = (value: number) => {
    return `${(value * 100).toFixed(2)}%`;
  };

  const formatTimestamp = (timestamp: string) => {
    try {
      return new Date(timestamp).toLocaleString();
    } catch {
      return timestamp;
    }
  };

  if (loading) {
    return (
      <Card className="glass-card h-[500px]">
        <CardHeader>
          <CardTitle className="text-lg">Trading Signals</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-96">
            <div className="text-muted-foreground">Loading signals...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || signals.length === 0) {
    return (
      <Card className="glass-card h-[500px]">
        <CardHeader>
          <CardTitle className="text-lg">Trading Signals</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-96">
            <div className="text-muted-foreground">
              {error || "No trading signals available"}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass-card h-[500px] flex flex-col">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Trading Signals ({signals.length})</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 overflow-y-auto">
        {signals.map((signal, index) => {
          const performance = signal.id ? getPerformanceBySignalId(signal.id) : null;
          return (
            <div key={index} className="border rounded-lg p-3 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{signal.symbol}</span>
                  <Badge className={getSignalTypeColor(signal.signal_type)}>
                    {signal.signal_type}
                  </Badge>
                  {performance && (
                    <Badge className={getStatusColor(performance.status)}>
                      {formatStatusDisplay(performance.status)}
                    </Badge>
                  )}
                </div>
                <div className="text-xs text-muted-foreground">
                  {formatTimestamp(signal.prediction_date)}
                </div>
              </div>
            
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-muted-foreground">Predicted Return:</span>
                <div className="font-medium">{formatPercentage(signal.predicted_return)}</div>
              </div>
              <div>
                <span className="text-muted-foreground">Entry Price:</span>
                <div className="font-medium">{formatPrice(signal.entry_price)}</div>
              </div>
              <div>
                <span className="text-muted-foreground">Target:</span>
                <div className="font-medium">{formatPrice(signal.target_price)}</div>
              </div>
              <div>
                <span className="text-muted-foreground">Stop Loss:</span>
                <div className="font-medium">{formatPrice(signal.stop_loss)}</div>
              </div>
              {performance && (
                <>
                  <div>
                    <span className="text-muted-foreground">PnL:</span>
                    <div className={`font-medium ${performance.pnl_percentage >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {formatPercentage(performance.pnl_percentage / 100)}
                    </div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Days Active:</span>
                    <div className="font-medium">{performance.days_active}</div>
                  </div>
                </>
              )}
            </div>
            
            <div className="grid grid-cols-3 gap-3 text-xs">
              <div>
                <span className="text-muted-foreground">Volatility:</span>
                <div className="font-medium">{signal.market_volatility.toFixed(2)}</div>
              </div>
              <div>
                <span className="text-muted-foreground">Trend Strength:</span>
                <div className="font-medium">{signal.trend_strength.toFixed(2)}</div>
              </div>
              <div>
                <span className="text-muted-foreground">Momentum:</span>
                <div className="font-medium">{signal.momentum.toFixed(2)}</div>
              </div>
            </div>
            
            <div className="flex items-center justify-between text-xs text-muted-foreground border-t pt-2">
              <div>Updated: {formatTimestamp(signal.timestamp)}</div>
              <div className="flex gap-2">
                {performance ? (
                  <Badge className={`${getStatusColor(performance.status)} text-xs`}>
                    {formatStatusDisplay(performance.status)}
                  </Badge>
                ) : (
                  <Badge variant={signal.is_active ? "default" : "secondary"} className="text-xs">
                    {signal.is_active ? "Active" : "Expired"}
                  </Badge>
                )}
              </div>
            </div>
          </div>
          );
        })}
      </CardContent>
    </Card>
  );
};

export default TradingSignalBox;