import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Copy, Check, BookText, Sparkles, MessageSquare, BookOpen, SmilePlus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { BlogStyle } from "@/lib/types";

interface BlogContentProps {
  blogContent: string;
  isFallbackGeneration?: boolean;
  style?: BlogStyle;
}

export default function BlogContent({ blogContent, isFallbackGeneration, style = 'professional' }: BlogContentProps) {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(blogContent);
      setCopied(true);
      toast({
        title: "Copied to clipboard",
        description: "The blog content has been copied to your clipboard.",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to copy to clipboard. Please try again.",
      });
    }
  };

  // Helper function to get style icon
  const getStyleIcon = () => {
    switch (style) {
      case 'professional': return <BookText className="h-4 w-4 mr-1" />;
      case 'casual': return <MessageSquare className="h-4 w-4 mr-1" />;
      case 'enthusiastic': return <BookOpen className="h-4 w-4 mr-1" />;
      case 'animated': return <Sparkles className="h-4 w-4 mr-1" />;
      case 'humorous': return <SmilePlus className="h-4 w-4 mr-1" />;
      default: return <BookText className="h-4 w-4 mr-1" />;
    }
  };

  // Helper function to get style name with proper capitalization
  const getStyleName = () => {
    return style.charAt(0).toUpperCase() + style.slice(1);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-start mb-6">
        <div>
          <div className="flex items-center mb-2">
            <h3 className="text-xl font-bold text-gray-900 mr-3">Generated Blog Post</h3>
            <Badge 
              variant="outline" 
              className={`flex items-center ${style === 'animated' ? 'bg-purple-50 text-purple-800 border-purple-300' : ''}`}
            >
              {getStyleIcon()}
              <span>{getStyleName()} Style</span>
            </Badge>
          </div>
          
          {isFallbackGeneration && (
            <div className="text-amber-600 text-sm mt-1 mb-2">
              Using fallback generation mode due to API limits. Content quality may be reduced.
            </div>
          )}
          
          {isFallbackGeneration && style === 'animated' && (
            <div className="bg-amber-50 border border-amber-200 rounded-md px-3 py-2 mt-2 text-sm text-amber-700">
              <p className="font-medium">Note about Animated Style in Fallback Mode:</p>
              <p>The animated style features (like visual effects and dynamic content) are limited in fallback mode. Some animations and styling may not display correctly.</p>
            </div>
          )}
        </div>
        <Button
          onClick={handleCopy}
          variant="outline"
          className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
        >
          {copied ? (
            <>
              <Check className="h-5 w-5 mr-2 text-green-500" />
              Copied!
            </>
          ) : (
            <>
              <Copy className="h-5 w-5 mr-2 text-gray-500" />
              Copy to Clipboard
            </>
          )}
        </Button>
      </div>

      <div 
        className="prose prose-sm sm:prose lg:prose-lg max-w-none"
        dangerouslySetInnerHTML={{ __html: blogContent }}
      />
    </div>
  );
}
