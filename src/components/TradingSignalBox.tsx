import React, { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// Define the type for trading signal
interface TradingSignal {
  symbol: string;
  signal_type: string;
  confidence: number;
  predicted_return: number;
  entry_price: number;
  target_price: number;
  stop_loss: number;
  position_size: number;
  timestamp: string;
  expires_at: string;
  status: string;
  is_active: boolean;
}

interface TradingSignalResponse {
  signal: TradingSignal | null;
  message?: string;
  error?: string;
}

const TradingSignalBox = () => {
  const [signal, setSignal] = useState<TradingSignal | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSignal = async () => {
      try {
        setLoading(true);
        const response = await fetch("http://localhost:8000/api/trading-signal/");
        
        if (!response.ok) {
          throw new Error("Failed to fetch trading signal");
        }
        
        const data: TradingSignalResponse = await response.json();
        
        if (data.error) {
          setError(data.error);
        } else if (data.signal) {
          setSignal(data.signal);
        } else {
          setError(data.message || "No trading signal available");
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchSignal();
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
          <CardTitle className="text-lg">Trading Signal</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-96">
            <div className="text-muted-foreground">Loading signal...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !signal) {
    return (
      <Card className="glass-card h-[500px]">
        <CardHeader>
          <CardTitle className="text-lg">Trading Signal</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-96">
            <div className="text-muted-foreground">
              {error || "No trading signal available"}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass-card h-[500px] flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Trading Signal</CardTitle>
          <Badge className={getSignalTypeColor(signal.signal_type)}>
            {signal.signal_type}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <span className="text-muted-foreground">Symbol:</span>
            <div className="font-medium">{signal.symbol}</div>
          </div>
          <div>
            <span className="text-muted-foreground">Confidence:</span>
            <div className="font-medium">{formatPercentage(signal.confidence)}</div>
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
          <div>
            <span className="text-muted-foreground">Position Size:</span>
            <div className="font-medium">{formatPercentage(signal.position_size)}</div>
          </div>
        </div>
        
        <div className="text-xs text-muted-foreground border-t pt-2">
          <div>Updated: {formatTimestamp(signal.timestamp)}</div>
          <div className="flex items-center gap-2 mt-1">
            <span>Status:</span>
            <Badge variant={signal.is_active ? "default" : "secondary"} className="text-xs">
              {signal.is_active ? "Active" : "Expired"}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TradingSignalBox;