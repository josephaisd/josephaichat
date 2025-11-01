import { User } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";

interface MessageBubbleProps {
  message: string;
  isAI?: boolean;
  timestamp?: string;
  imageUrl?: string;
}

export default function MessageBubble({ message, isAI = false, timestamp, imageUrl }: MessageBubbleProps) {
  return (
    <div className={`flex gap-3 p-4 ${isAI ? '' : 'flex-row-reverse'}`} data-testid={`message-${isAI ? 'ai' : 'user'}`}>
      <Avatar className="w-8 h-8 mt-1">
        <AvatarFallback className={`${isAI ? 'bg-primary/10 text-primary' : 'bg-secondary/50 text-secondary-foreground'}`}>
          {isAI ? <span className="text-sm font-bold">J</span> : <User className="w-4 h-4" />}
        </AvatarFallback>
      </Avatar>
      
      <div className={`flex flex-col max-w-[80%] ${isAI ? 'items-start' : 'items-end'}`}>
        <div className={`relative group p-4 rounded-2xl backdrop-blur-lg border ${
          isAI 
            ? 'bg-gradient-to-r from-primary/8 via-primary/4 to-accent/8 border-primary/20 rounded-tl-md' 
            : 'bg-gradient-to-r from-accent/8 via-primary/4 to-primary/8 border-primary/20 rounded-tr-md'
        }`}>
          {/* Enhanced glass reflection effect */}
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/10 via-white/5 to-transparent pointer-events-none"></div>
          
          {/* Subtle shimmer on hover */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
          
          {imageUrl && (
            <img 
              src={imageUrl} 
              alt="Message attachment" 
              className="relative max-w-full max-h-64 rounded-lg mb-2"
              data-testid="message-image"
            />
          )}
          
          {message && (
            <div className={`relative text-sm leading-relaxed prose prose-sm dark:prose-invert max-w-none ${isAI ? 'text-foreground' : 'text-foreground'}`}>
              <ReactMarkdown 
                remarkPlugins={[remarkGfm]}
                components={{
                  h1: ({node, ...props}) => <h1 className="text-xl font-bold mb-2 mt-4" {...props} />,
                  h2: ({node, ...props}) => <h2 className="text-lg font-bold mb-2 mt-3" {...props} />,
                  h3: ({node, ...props}) => <h3 className="text-base font-bold mb-1 mt-2" {...props} />,
                  p: ({node, ...props}) => <p className="mb-2 last:mb-0" {...props} />,
                  ul: ({node, ...props}) => <ul className="list-disc list-inside mb-2 space-y-1" {...props} />,
                  ol: ({node, ...props}) => <ol className="list-decimal list-inside mb-2 space-y-1" {...props} />,
                  li: ({node, ...props}) => <li className="ml-2" {...props} />,
                  code: ({node, inline, className, children, ...props}: any) => {
                    const match = /language-(\w+)/.exec(className || '');
                    const language = match ? match[1] : '';
                    const codeString = String(children).replace(/\n$/, '');
                    
                    // Block code (not inline)
                    if (!inline) {
                      // If we have a language, use syntax highlighting
                      if (language) {
                        return (
                          <SyntaxHighlighter
                            style={oneDark as any}
                            language={language}
                            PreTag="div"
                            className="rounded-lg my-2 text-xs"
                          >
                            {codeString}
                          </SyntaxHighlighter>
                        );
                      }
                      // Plain code block without language
                      return (
                        <pre className="bg-muted p-3 rounded-lg overflow-x-auto mb-2">
                          <code className="text-xs font-mono block">{children}</code>
                        </pre>
                      );
                    }
                    
                    // Inline code
                    return (
                      <code className="bg-muted px-1.5 py-0.5 rounded text-xs font-mono" {...props}>
                        {children}
                      </code>
                    );
                  },
                  pre: ({node, children, ...props}: any) => <>{children}</>,
                  blockquote: ({node, ...props}) => <blockquote className="border-l-4 border-primary/30 pl-4 italic my-2" {...props} />,
                  a: ({node, ...props}) => <a className="text-primary hover:underline" {...props} />,
                  strong: ({node, ...props}) => <strong className="font-bold" {...props} />,
                  em: ({node, ...props}) => <em className="italic" {...props} />,
                  hr: ({node, ...props}) => <hr className="border-t border-primary/20 my-4" {...props} />,
                  table: ({node, ...props}) => <table className="border-collapse w-full my-2" {...props} />,
                  th: ({node, ...props}) => <th className="border border-primary/20 px-2 py-1 bg-muted font-bold" {...props} />,
                  td: ({node, ...props}) => <td className="border border-primary/20 px-2 py-1" {...props} />,
                }}
              >
                {message}
              </ReactMarkdown>
            </div>
          )}
        </div>
        
        {timestamp && (
          <span className="text-xs text-muted-foreground mt-1 px-2">
            {timestamp}
          </span>
        )}
      </div>
    </div>
  );
}