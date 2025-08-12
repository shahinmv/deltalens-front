import { useState, useEffect } from "react";
import { Send, History, MessageSquare, Trash2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { dashboardAPI, conversationAPI, ConversationSession, ConversationMessage } from "@/services/api";
import { useAuth } from "@/contexts/AuthContext";

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  reasoning?: string; // Optional reasoning for AI messages
}


// Helper to parse <think>reasoning</think> and main answer
function parseAIMessage(text: string): { main: string; reasoning?: string } {
  const thinkStart = text.indexOf("<think>");
  const thinkEnd = text.indexOf("</think>");
  if (thinkStart !== -1 && thinkEnd !== -1 && thinkEnd > thinkStart) {
    const reasoning = text.substring(thinkStart + 7, thinkEnd).trim();
    const main = text.substring(thinkEnd + 8).trim();
    return { main, reasoning };
  }
  return { main: text };
}

// Rich text markdown parser
const parseMarkdown = (text: string): JSX.Element => {
  const lines = text.split('\n');
  const elements: JSX.Element[] = [];
  let currentList: JSX.Element[] = [];
  let currentListType: 'ul' | 'ol' | null = null;
  let currentTable: string[][] = [];
  let currentCodeBlock: string[] = [];
  let currentCodeLanguage = '';
  let inCodeBlock = false;
  let inTable = false;

  const flushList = () => {
    if (currentList.length > 0) {
      elements.push(
        currentListType === 'ul' ? (
          <ul key={elements.length} className="list-disc list-inside mb-2 space-y-1">
            {currentList}
          </ul>
        ) : (
          <ol key={elements.length} className="list-decimal list-inside mb-2 space-y-1">
            {currentList}
          </ol>
        )
      );
      currentList = [];
      currentListType = null;
    }
  };

  const flushTable = () => {
    if (currentTable.length > 0) {
      elements.push(
        <table key={elements.length} className="w-full border-collapse border border-gray-300 mb-2 text-sm">
          <thead>
            <tr className="bg-gray-100">
              {currentTable[0].map((cell, i) => (
                <th key={i} className="border border-gray-300 px-2 py-1 text-left font-medium">
                  {parseInlineMarkdown(cell)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {currentTable.slice(1).map((row, i) => (
              <tr key={i} className={i % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                {row.map((cell, j) => (
                  <td key={j} className="border border-gray-300 px-2 py-1">
                    {parseInlineMarkdown(cell)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      );
      currentTable = [];
      inTable = false;
    }
  };

  const flushCodeBlock = () => {
    if (currentCodeBlock.length > 0) {
      elements.push(
        <pre key={elements.length} className="bg-gray-900 text-green-400 p-3 rounded-md mb-2 overflow-x-auto text-sm">
          {currentCodeLanguage && (
            <div className="text-gray-400 text-xs mb-2">{currentCodeLanguage}</div>
          )}
          <code>{currentCodeBlock.join('\n')}</code>
        </pre>
      );
      currentCodeBlock = [];
      currentCodeLanguage = '';
      inCodeBlock = false;
    }
  };

  const parseInlineMarkdown = (text: string): JSX.Element => {
    const parts: (string | JSX.Element)[] = [];
    let currentIndex = 0;
    let keyCounter = 0;

    // Process all patterns in order of their appearance
    const patterns = [
      { regex: /\*\*(.*?)\*\*/g, render: (content: string, url?: string) => <strong key={keyCounter++}>{content}</strong> },
      { regex: /\*(.*?)\*/g, render: (content: string, url?: string) => <em key={keyCounter++}>{content}</em> },
      { regex: /`(.*?)`/g, render: (content: string, url?: string) => <code key={keyCounter++} className="bg-gray-200 px-1 py-0.5 rounded text-sm font-mono">{content}</code> },
      { regex: /\[([^\]]+)\]\(([^)]+)\)/g, render: (content: string, url: string) => <a key={keyCounter++} href={url} className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">{content}</a> }
    ];

    // Find all matches across all patterns
    const allMatches: Array<{
      start: number;
      end: number;
      element: JSX.Element;
    }> = [];

    patterns.forEach(pattern => {
      let match;
      const regex = new RegExp(pattern.regex.source, pattern.regex.flags);
      while ((match = regex.exec(text)) !== null) {
        const element = pattern.regex.source.includes('\\[')
          ? pattern.render(match[1], match[2]) // Links have two capture groups
          : pattern.render(match[1]);
        
        allMatches.push({
          start: match.index,
          end: match.index + match[0].length,
          element
        });
      }
    });

    // Sort matches by start position
    allMatches.sort((a, b) => a.start - b.start);

    // Remove overlapping matches (keep the first one)
    const validMatches = [];
    for (const match of allMatches) {
      if (!validMatches.some(vm => 
        (match.start >= vm.start && match.start < vm.end) ||
        (match.end > vm.start && match.end <= vm.end) ||
        (match.start <= vm.start && match.end >= vm.end)
      )) {
        validMatches.push(match);
      }
    }

    // Build the parts array
    validMatches.forEach(match => {
      // Add text before this match
      if (currentIndex < match.start) {
        const textBefore = text.slice(currentIndex, match.start);
        if (textBefore) {
          parts.push(textBefore);
        }
      }
      // Add the matched element
      parts.push(match.element);
      currentIndex = match.end;
    });

    // Add remaining text
    if (currentIndex < text.length) {
      const remainingText = text.slice(currentIndex);
      if (remainingText) {
        parts.push(remainingText);
      }
    }

    return <span>{parts}</span>;
  };

  lines.forEach((line, index) => {
    // Code blocks
    if (line.startsWith('```')) {
      if (inCodeBlock) {
        flushCodeBlock();
      } else {
        flushList();
        flushTable();
        inCodeBlock = true;
        currentCodeLanguage = line.slice(3).trim();
      }
      return;
    }

    if (inCodeBlock) {
      currentCodeBlock.push(line);
      return;
    }

    // Tables
    if (line.includes('|') && line.trim().length > 0) {
      flushList();
      const cells = line.split('|').map(cell => cell.trim()).filter(cell => cell);
      if (cells.length > 0) {
        currentTable.push(cells);
        inTable = true;
      }
      return;
    } else if (inTable) {
      flushTable();
    }

    // Headers
    if (line.startsWith('#')) {
      flushList();
      const level = line.match(/^#+/)?.[0].length || 1;
      const content = line.replace(/^#+\s*/, '');
      const headerClasses = {
        1: 'text-2xl font-bold mb-2',
        2: 'text-xl font-bold mb-2',
        3: 'text-lg font-bold mb-2',
        4: 'text-base font-bold mb-2',
        5: 'text-sm font-bold mb-2',
        6: 'text-xs font-bold mb-2'
      };
      const Tag = `h${Math.min(level, 6)}` as keyof JSX.IntrinsicElements;
      elements.push(
        <Tag key={elements.length} className={headerClasses[level as keyof typeof headerClasses]}>
          {parseInlineMarkdown(content)}
        </Tag>
      );
      return;
    }

    // Lists - be more strict about what constitutes a list
    if (line.match(/^\s*[-*+]\s+\S/)) {
      flushTable();
      if (currentListType !== 'ul') {
        flushList();
        currentListType = 'ul';
      }
      const content = line.replace(/^\s*[-*+]\s+/, '');
      currentList.push(
        <li key={currentList.length}>{parseInlineMarkdown(content)}</li>
      );
      return;
    }

    // More strict numbered list detection - must have content after the space
    if (line.match(/^\s*\d+\.\s+\S/) && !line.match(/^\s*\d+\.\s*[A-Z][^:]*:$/)) {
      flushTable();
      if (currentListType !== 'ol') {
        flushList();
        currentListType = 'ol';
      }
      const content = line.replace(/^\s*\d+\.\s+/, '');
      currentList.push(
        <li key={currentList.length}>{parseInlineMarkdown(content)}</li>
      );
      return;
    }

    // Blockquotes
    if (line.startsWith('>')) {
      flushList();
      flushTable();
      const content = line.replace(/^>\s?/, '');
      elements.push(
        <blockquote key={elements.length} className="border-l-4 border-gray-300 pl-4 italic mb-2 text-gray-700">
          {parseInlineMarkdown(content)}
        </blockquote>
      );
      return;
    }

    // Horizontal rules
    if (line.match(/^---+$/)) {
      flushList();
      flushTable();
      elements.push(<hr key={elements.length} className="my-4 border-gray-300" />);
      return;
    }

    // Regular paragraphs
    if (line.trim()) {
      flushList();
      flushTable();
      elements.push(
        <p key={elements.length} className="mb-2">
          {parseInlineMarkdown(line)}
        </p>
      );
    } else {
      flushList();
      flushTable();
      if (elements.length > 0) {
        elements.push(<br key={elements.length} />);
      }
    }
  });

  // Flush any remaining content
  flushList();
  flushTable();
  flushCodeBlock();

  return <div className="space-y-1">{elements}</div>;
};

const ChatBox = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      text: "Hello! I'm your Bitcoin AI assistant. Ask me anything about Bitcoin market data, trends, or analysis.",
      isUser: false,
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [showReasoning, setShowReasoning] = useState<{ [id: string]: boolean }>({});
  
  // Conversation management state
  const [conversationSessions, setConversationSessions] = useState<ConversationSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [isLoadingSessions, setIsLoadingSessions] = useState(false);
  const [showHistorySheet, setShowHistorySheet] = useState(false);

  // Load conversation sessions on mount and set up most recent session
  useEffect(() => {
    if (user) {
      loadConversationSessions().then(() => {
        // If there are existing sessions, load the most recent one
        // Comment this out if you want to always start fresh
        // loadMostRecentSession();
      });
    }
  }, [user]);

  const loadMostRecentSession = async () => {
    if (conversationSessions.length > 0 && !currentSessionId) {
      const mostRecent = conversationSessions[0]; // Already sorted by updated_at DESC
      await loadConversationHistory(mostRecent.id);
    }
  };

  const loadConversationSessions = async () => {
    if (!user) return;
    
    setIsLoadingSessions(true);
    try {
      const data = await conversationAPI.getSessions();
      setConversationSessions(data.sessions);
    } catch (error) {
      console.error('Error loading conversation sessions:', error);
    } finally {
      setIsLoadingSessions(false);
    }
  };

  const loadConversationHistory = async (sessionId: string) => {
    try {
      const data = await conversationAPI.getSessionDetail(sessionId);
      const conversationMessages: Message[] = data.messages.map(msg => ({
        id: msg.id,
        text: msg.content,
        isUser: msg.is_user,
        timestamp: new Date(msg.created_at),
        reasoning: msg.reasoning || undefined
      }));
      
      // Add welcome message at the beginning if empty
      if (conversationMessages.length === 0) {
        conversationMessages.unshift({
          id: "welcome",
          text: "Hello! I'm your Bitcoin AI assistant. Ask me anything about Bitcoin market data, trends, or analysis.",
          isUser: false,
          timestamp: new Date(),
        });
      }
      
      setMessages(conversationMessages);
      setCurrentSessionId(sessionId);
      setShowHistorySheet(false);
    } catch (error) {
      console.error('Error loading conversation history:', error);
    }
  };

  const startNewConversation = () => {
    setMessages([
      {
        id: "welcome",
        text: "Hello! I'm your Bitcoin AI assistant. Ask me anything about Bitcoin market data, trends, or analysis.",
        isUser: false,
        timestamp: new Date(),
      },
    ]);
    setCurrentSessionId(null);
    setShowHistorySheet(false);
    console.log('Started new conversation');
  };

  const deleteConversation = async (sessionId: string) => {
    try {
      await conversationAPI.deleteSession(sessionId);
      setConversationSessions(prev => prev.filter(s => s.id !== sessionId));
      
      // If this was the current session, start a new one
      if (currentSessionId === sessionId) {
        startNewConversation();
      }
    } catch (error) {
      console.error('Error deleting conversation:', error);
    }
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isStreaming) return;
    
    console.log('=== SENDING MESSAGE ===');
    console.log('Current session ID:', currentSessionId);
    console.log('User authenticated:', !!user);
    console.log('Message:', inputValue.substring(0, 50) + '...');

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputValue,
      isUser: true,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsStreaming(true);

    let aiMessage: Message = {
      id: (Date.now() + 1).toString(),
      text: "",
      isUser: false,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, aiMessage]);
    let aiText = "";
    try {
      await dashboardAPI.streamLLMResponse(
        userMessage.text, 
        (token) => {
          aiText += token;
          // Parse for reasoning and main answer
          const { main, reasoning } = parseAIMessage(aiText);
          setMessages((prev) => {
            const updated = [...prev];
            updated[updated.length - 1] = {
              ...aiMessage,
              text: main,
              reasoning,
            };
            return updated;
          });
        },
        currentSessionId || undefined,
        (sessionId) => {
          // Set the session ID when received from backend
          console.log('Session ID received from backend:', sessionId);
          console.log('Current session ID before:', currentSessionId);
          setCurrentSessionId(sessionId);
          console.log('New session set:', sessionId);
        }
      );
      
      // Refresh sessions list after sending a message (to get updated titles/counts)
      if (user) {
        loadConversationSessions();
      }
    } catch (error) {
      console.error('LLM streaming error:', error);
      setMessages((prev) => {
        const updated = [...prev];
        updated[updated.length - 1] = {
          ...aiMessage,
          text: `Error: ${error instanceof Error ? error.message : 'Failed to get response'}`,
        };
        return updated;
      });
    }
    setIsStreaming(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSendMessage();
    }
  };

  return (
    <div className="glass-card p-6 rounded-lg h-[500px] flex flex-col animate-fade-in">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">AI Chat</h2>
        {user && (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={startNewConversation}
              className="flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              New
            </Button>
            <Sheet open={showHistorySheet} onOpenChange={setShowHistorySheet}>
              <SheetTrigger asChild>
                <Button variant="outline" size="sm" className="flex items-center gap-2">
                  <History className="w-4 h-4" />
                  History
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-80">
                <SheetHeader>
                  <SheetTitle>Conversation History</SheetTitle>
                </SheetHeader>
                <div className="mt-6">
                  {isLoadingSessions ? (
                    <div className="text-center py-4">Loading...</div>
                  ) : conversationSessions.length === 0 ? (
                    <div className="text-center py-4 text-muted-foreground">
                      No conversations yet
                    </div>
                  ) : (
                    <ScrollArea className="h-[calc(100vh-120px)]">
                      <div className="space-y-2">
                        {conversationSessions.map((session) => (
                          <div
                            key={session.id}
                            className={`p-3 rounded-lg border cursor-pointer hover:bg-muted transition-colors ${
                              currentSessionId === session.id ? 'bg-muted border-primary' : ''
                            }`}
                          >
                            <div
                              className="flex items-start justify-between"
                              onClick={() => loadConversationHistory(session.id)}
                            >
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <MessageSquare className="w-4 h-4 text-muted-foreground" />
                                  <span className="text-sm font-medium truncate">
                                    {session.title}
                                  </span>
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  {session.message_count} messages • {new Date(session.updated_at).toLocaleDateString()}
                                </div>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="ml-2 p-1 h-auto"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  deleteConversation(session.id);
                                }}
                              >
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        )}
      </div>
      
      <ScrollArea className="flex-1 mb-4">
        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.isUser ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[80%] rounded-lg p-3 ${
                  message.isUser
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted"
                }`}
              >
                {/* Reasoning button for AI messages with reasoning, at the top */}
                {!message.isUser && message.reasoning && (
                  <div className="mb-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setShowReasoning((prev) => ({ ...prev, [message.id]: !prev[message.id] }))}
                      className="mb-1"
                    >
                      Reasoning
                    </Button>
                    {showReasoning[message.id] && (
                      <div className="bg-gray-100 text-gray-800 rounded p-2 text-xs mt-1">
                        {parseMarkdown(message.reasoning)}
                      </div>
                    )}
                  </div>
                )}
                <div className="text-sm">
                  {message.isUser ? (
                    <p className="whitespace-pre-wrap">{message.text}</p>
                  ) : (
                    parseMarkdown(message.text)
                  )}
                </div>
                <p className="text-xs opacity-70 mt-1">
                  {message.timestamp.toLocaleTimeString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>

      <div className="flex gap-2">
        <Input
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder={user ? "Ask about Bitcoin..." : "Login to save conversation history"}
          className="flex-1"
          disabled={isStreaming}
        />
        <Button onClick={handleSendMessage} size="icon" disabled={isStreaming}>
          <Send className="w-4 h-4" />
        </Button>
      </div>
      
      {currentSessionId && (
        <div className="text-xs text-muted-foreground mt-2 text-center">
          Conversation saved • {conversationSessions.find(s => s.id === currentSessionId)?.title}
        </div>
      )}
    </div>
  );
};

export default ChatBox;