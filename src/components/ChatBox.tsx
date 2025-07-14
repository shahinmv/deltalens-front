import { useState } from "react";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  reasoning?: string; // Optional reasoning for AI messages
}

const streamLLMResponse = async (userMessage: string, onToken: (token: string) => void) => {
  const response = await fetch("http://localhost:8000/api/llm-stream/", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message: userMessage }),
  });
  if (!response.body) return;
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let done = false;
  while (!done) {
    const { value, done: doneReading } = await reader.read();
    done = doneReading;
    if (value) {
      const chunk = decoder.decode(value);
      onToken(chunk);
    }
  }
};

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
    let result = text;
    const parts: (string | JSX.Element)[] = [];
    let lastIndex = 0;

    // Bold **text**
    result = result.replace(/\*\*(.*?)\*\*/g, (match, content, offset) => {
      parts.push(result.slice(lastIndex, offset));
      parts.push(<strong key={offset}>{content}</strong>);
      lastIndex = offset + match.length;
      return '';
    });

    // Italic *text*
    result = result.replace(/\*(.*?)\*/g, (match, content, offset) => {
      parts.push(result.slice(lastIndex, offset));
      parts.push(<em key={offset}>{content}</em>);
      lastIndex = offset + match.length;
      return '';
    });

    // Code `text`
    result = result.replace(/`(.*?)`/g, (match, content, offset) => {
      parts.push(result.slice(lastIndex, offset));
      parts.push(<code key={offset} className="bg-gray-200 px-1 py-0.5 rounded text-sm font-mono">{content}</code>);
      lastIndex = offset + match.length;
      return '';
    });

    // Links [text](url)
    result = result.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (match, text, url, offset) => {
      parts.push(result.slice(lastIndex, offset));
      parts.push(<a key={offset} href={url} className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">{text}</a>);
      lastIndex = offset + match.length;
      return '';
    });

    if (lastIndex < result.length) {
      parts.push(result.slice(lastIndex));
    }

    return <span>{parts.filter(part => part !== '')}</span>;
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

    // Lists
    if (line.match(/^\s*[-*+]\s/)) {
      flushTable();
      if (currentListType !== 'ul') {
        flushList();
        currentListType = 'ul';
      }
      const content = line.replace(/^\s*[-*+]\s/, '');
      currentList.push(
        <li key={currentList.length}>{parseInlineMarkdown(content)}</li>
      );
      return;
    }

    if (line.match(/^\s*\d+\.\s/)) {
      flushTable();
      if (currentListType !== 'ol') {
        flushList();
        currentListType = 'ol';
      }
      const content = line.replace(/^\s*\d+\.\s/, '');
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

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isStreaming) return;

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
    await streamLLMResponse(userMessage.text, (token) => {
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
    });
    setIsStreaming(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSendMessage();
    }
  };

  return (
    <div className="glass-card p-6 rounded-lg h-[500px] flex flex-col animate-fade-in">
      <h2 className="text-xl font-semibold mb-4">Bitcoin AI Chat</h2>
      
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
          placeholder="Ask about Bitcoin..."
          className="flex-1"
          disabled={isStreaming}
        />
        <Button onClick={handleSendMessage} size="icon" disabled={isStreaming}>
          <Send className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};

export default ChatBox;