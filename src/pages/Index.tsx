import MarketStats from "@/components/MarketStats";
import CryptoChart from "@/components/CryptoChart";
import ChatBox from "@/components/ChatBox";
import NewsBox from "../components/NewsBox";
import TradingSignalBox from "@/components/TradingSignalBox";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LogOut, User, Settings } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

const Index = () => {
  useEffect(() => {
    document.title = 'Dashboard - DeltaLens';
  }, []);
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      case 'member':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'non_member':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8 flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold mb-2">Welcome back, {user?.first_name || user?.username}</h1>
            {/* <p className="text-muted-foreground">Welcome back, {user?.first_name || user?.username}</p> */}
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4" />
              <span className="text-sm">{user?.email}</span>
              <Badge className={getRoleBadgeColor(user?.role || '')}>
                {user?.role?.replace('_', ' ').toUpperCase()}
              </Badge>
            </div>
            
            {isAdmin() && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/admin')}
              >
                <Settings className="h-4 w-4 mr-2" />
                Admin
              </Button>
            )}
            
            <Button
              variant="outline"
              size="sm"
              onClick={logout}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
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
      
      {/* Footer */}
      <footer className="text-center py-6 px-6">
        <p className="text-muted-foreground text-sm">
          Made with ❤️ by{' '}
          <a 
            href="https://www.linkedin.com/company/algora-tech-solutions" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-primary hover:text-primary/80 transition-colors"
          >
            Algora
          </a>
        </p>
      </footer>
    </div>
  );
};

export default Index;