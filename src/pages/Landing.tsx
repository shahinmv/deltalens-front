import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { BarChart3, ArrowRight, Zap, Shield, Eye, Brain, TrendingUp, Target } from 'lucide-react';
import { useEffect } from 'react';

const Landing = () => {
  useEffect(() => {
    document.title = 'DeltaLens - The Future of Trading Intelligence';
  }, []);
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 overflow-hidden flex flex-col">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-to-tl from-emerald-500/10 to-cyan-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      {/* Navigation */}
      <nav className="relative z-20 flex items-center justify-between px-6 py-4">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gradient-to-r from-cyan-400 to-purple-500 rounded-lg flex items-center justify-center">
            <BarChart3 className="w-5 h-5 text-white" />
          </div>
          <span className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">
            DeltaLens
          </span>
        </div>
        <div className="flex items-center space-x-4">
          <Link to="/login" className="inline-block">
            <Button variant="ghost" className="text-white hover:text-cyan-400 transition-colors">
              Sign In
            </Button>
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative z-10 container mx-auto px-6 flex items-center justify-center flex-1 py-20">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-7xl font-bold mb-6">
            <span className="bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              The Future of
            </span>
            <br />
            <span className="bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
              Trading Intelligence
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-300 mb-8 leading-relaxed">
            Harness the power of advanced machine learning to make smarter trading decisions. 
            DeltaLens transforms market complexity into actionable insights with AI-driven precision.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
            <Link to="/register">
              <Button className="bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white px-8 py-4 text-lg rounded-lg transition-all transform hover:scale-105 shadow-xl">
                Start Trading Smarter
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
          </div>

          {/* AI Features Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16 max-w-6xl mx-auto">
            <div className="glass-card p-6 text-center group hover:scale-105 transition-all duration-300">
              <div className="w-16 h-16 bg-gradient-to-r from-cyan-400 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:rotate-12 transition-transform">
                <Zap className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2 bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">
                AI-Powered Signals
              </h3>
              <p className="text-gray-400 text-sm">
                Advanced regime-aware ML models analyze market conditions and generate precise trading signals with confidence scores
              </p>
            </div>

            <div className="glass-card p-6 text-center group hover:scale-105 transition-all duration-300">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:rotate-12 transition-transform">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2 bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">
                Smart Risk Management
              </h3>
              <p className="text-gray-400 text-sm">
                Dynamic position sizing and bear market detection protect your capital during volatile market conditions
              </p>
            </div>

            <div className="glass-card p-6 text-center group hover:scale-105 transition-all duration-300">
              <div className="w-16 h-16 bg-gradient-to-r from-emerald-400 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:rotate-12 transition-transform">
                <Eye className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2 bg-gradient-to-r from-emerald-400 to-cyan-500 bg-clip-text text-transparent">
                Real-Time Insights
              </h3>
              <p className="text-gray-400 text-sm">
                Live market analytics, sentiment analysis, and multi-timeframe momentum tracking for comprehensive market understanding
              </p>
            </div>
          </div>

          {/* Technology Showcase */}
          <div className="glass-card p-8 mb-16 max-w-4xl mx-auto">
            <h3 className="text-2xl font-bold text-center mb-6 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              Powered by Advanced AI Technology
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-cyan-400 font-bold text-lg">LSTM</div>
                <div className="text-gray-400 text-xs">Neural Networks</div>
              </div>
              <div className="text-center">
                <div className="text-purple-400 font-bold text-lg">AI Chatbot</div>
                <div className="text-gray-400 text-xs">Trading Assistant</div>
              </div>
              <div className="text-center">
                <div className="text-pink-400 font-bold text-lg">Regime Detection</div>
                <div className="text-gray-400 text-xs">Market Analysis</div>
              </div>
              <div className="text-center">
                <div className="text-emerald-400 font-bold text-lg">Sentiment AI</div>
                <div className="text-gray-400 text-xs">News Processing</div>
              </div>
            </div>
          </div>

          {/* Performance Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16 max-w-5xl mx-auto">
            <div className="text-center">
              <div className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent mb-2">
                25+
              </div>
              <div className="text-gray-300 font-semibold mb-2">Technical Indicators</div>
              <div className="text-gray-400 text-sm">Price, volume, momentum, volatility & sentiment analysis</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent mb-2">
                Real-Time
              </div>
              <div className="text-gray-300 font-semibold mb-2">Market Data</div>
              <div className="text-gray-400 text-sm">Live market data processing for instant signal generation</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-500 bg-clip-text text-transparent mb-2">
                24/7
              </div>
              <div className="text-gray-300 font-semibold mb-2">Market Monitoring</div>
              <div className="text-gray-400 text-sm">Continuous market surveillance and opportunity detection</div>
            </div>
          </div>

          {/* How It Works */}
          <div className="glass-card p-8 max-w-5xl mx-auto mb-16">
            <h3 className="text-3xl font-bold text-center mb-8 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              How DeltaLens AI Works
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-gradient-to-r from-cyan-400 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-white font-bold">1</span>
                </div>
                <h4 className="font-semibold mb-2 text-cyan-400">Data Collection</h4>
                <p className="text-gray-400 text-sm">Real-time market data, news sentiment, and technical indicators</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-white font-bold">2</span>
                </div>
                <h4 className="font-semibold mb-2 text-purple-400">AI Analysis</h4>
                <p className="text-gray-400 text-sm">LSTM networks and ensemble models detect market regimes</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-gradient-to-r from-pink-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-white font-bold">3</span>
                </div>
                <h4 className="font-semibold mb-2 text-pink-400">Signal Generation</h4>
                <p className="text-gray-400 text-sm">Generate precise entry, target, and stop-loss levels</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-white font-bold">4</span>
                </div>
                <h4 className="font-semibold mb-2 text-emerald-400">Risk Management</h4>
                <p className="text-gray-400 text-sm">Dynamic position sizing and portfolio protection</p>
              </div>
            </div>
          </div>

          {/* Final CTA */}
          <div className="text-center max-w-3xl mx-auto">
            <h3 className="text-2xl font-bold mb-4 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              Ready to Transform Your Trading?
            </h3>
            <p className="text-gray-400 mb-8">
              Join traders who are already using AI to make smarter, more profitable decisions in the crypto markets.
            </p>
            <Link to="/register">
              <Button className="bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white px-12 py-4 text-lg rounded-lg transition-all transform hover:scale-105 shadow-2xl">
                Get Started Free
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="relative z-20 text-center py-6 px-6">
        <p className="text-gray-400 text-sm">
          Made with ❤️ by{' '}
          <a 
            href="https://www.linkedin.com/company/algora-tech-solutions" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-cyan-400 hover:text-cyan-300 transition-colors"
          >
            Algora
          </a>
        </p>
      </footer>
    </div>
  );
};

export default Landing;