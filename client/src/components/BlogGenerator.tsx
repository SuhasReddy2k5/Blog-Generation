import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { YoutubeIcon, ClipboardCopy, ArrowDown, BookText, Sparkles, MessageSquare, BookOpen, SmilePlus } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useMutation } from "@tanstack/react-query";
import { useYouTube } from "@/hooks/use-youtube";

const formSchema = z.object({
  youtubeUrl: z.string().url("Please enter a valid URL").refine(
    (value) => value.includes("youtube.com/watch") || value.includes("youtu.be/"),
    { message: "Please enter a valid YouTube URL" }
  ),
  blogLength: z.enum(["short", "medium", "long"]).default("medium"),
  blogStyle: z.enum(["professional", "casual", "enthusiastic", "animated", "humorous"]).default("professional"),
});

type FormValues = z.infer<typeof formSchema>;

interface BlogGeneratorProps {
  onBlogGenerated: (data: any) => void;
}

export default function BlogGenerator({ onBlogGenerated }: BlogGeneratorProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const { extractVideoId } = useYouTube();
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      youtubeUrl: "",
      blogLength: "medium",
      blogStyle: "professional",
    },
  });

  const generateBlogMutation = useMutation({
    mutationFn: async (data: FormValues) => {
      const videoId = extractVideoId(data.youtubeUrl);
      if (!videoId) {
        throw new Error("Invalid YouTube URL");
      }
      
      const response = await apiRequest("POST", "/api/generate-blog", {
        videoId,
        length: data.blogLength,
        style: data.blogStyle,
      });
      
      return await response.json();
    },
    onSuccess: (data) => {
      setLoading(false);
      onBlogGenerated(data);
    },
    onError: (error) => {
      setLoading(false);
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to generate blog. Please try again.",
      });
    },
  });

  const onSubmit = async (data: FormValues) => {
    setLoading(true);
    generateBlogMutation.mutate(data);
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      form.setValue("youtubeUrl", text);
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to read from clipboard. Please paste manually.",
      });
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent mb-4"></div>
        <p className="text-lg text-gray-600">Generating your blog...</p>
        <p className="text-sm text-gray-500 mt-2">This may take a minute, we're extracting information from the video.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="youtubeUrl"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="block text-sm font-medium text-gray-700 mb-1">YouTube Video URL</FormLabel>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <YoutubeIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="https://www.youtube.com/watch?v=..."
                      className="pl-10 pr-12 py-3 block w-full rounded-md border-gray-300 shadow-sm focus:ring-primary focus:border-primary sm:text-sm"
                    />
                  </FormControl>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                    <Button
                      type="button"
                      variant="ghost"
                      className="text-gray-400 hover:text-gray-600 text-sm font-medium h-full"
                      onClick={handlePaste}
                    >
                      Paste
                    </Button>
                  </div>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="blogLength"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="block text-sm font-medium text-gray-700 mb-1">Blog Length</FormLabel>
                <div className="mt-1 grid grid-cols-3 gap-3">
                  <label
                    className={`flex items-center justify-center px-3 py-3 border rounded-md cursor-pointer focus:outline-none hover:bg-gray-50 active:bg-gray-100 ${
                      field.value === "short" ? "border-primary bg-blue-50" : "border-gray-200 bg-white"
                    }`}
                  >
                    <div className="flex flex-col items-center">
                      <ClipboardCopy className="h-5 w-5 text-gray-600" />
                      <span className="text-sm font-medium text-gray-700 mt-1">Short</span>
                      <span className="text-xs text-gray-500">(300-500 words)</span>
                    </div>
                    <input
                      type="radio"
                      className="sr-only"
                      value="short"
                      checked={field.value === "short"}
                      onChange={() => field.onChange("short")}
                    />
                  </label>
                  <label
                    className={`flex items-center justify-center px-3 py-3 border rounded-md cursor-pointer focus:outline-none hover:bg-gray-50 active:bg-gray-100 ${
                      field.value === "medium" ? "border-primary bg-blue-50" : "border-gray-200 bg-white"
                    }`}
                  >
                    <div className="flex flex-col items-center">
                      <ClipboardCopy className="h-5 w-5 text-gray-600" />
                      <span className="text-sm font-medium text-gray-700 mt-1">Medium</span>
                      <span className="text-xs text-gray-500">(700-1000 words)</span>
                    </div>
                    <input
                      type="radio"
                      className="sr-only"
                      value="medium"
                      checked={field.value === "medium"}
                      onChange={() => field.onChange("medium")}
                    />
                  </label>
                  <label
                    className={`flex items-center justify-center px-3 py-3 border rounded-md cursor-pointer focus:outline-none hover:bg-gray-50 active:bg-gray-100 ${
                      field.value === "long" ? "border-primary bg-blue-50" : "border-gray-200 bg-white"
                    }`}
                  >
                    <div className="flex flex-col items-center">
                      <ClipboardCopy className="h-5 w-5 text-gray-600" />
                      <span className="text-sm font-medium text-gray-700 mt-1">Long</span>
                      <span className="text-xs text-gray-500">(1500+ words)</span>
                    </div>
                    <input
                      type="radio"
                      className="sr-only"
                      value="long"
                      checked={field.value === "long"}
                      onChange={() => field.onChange("long")}
                    />
                  </label>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="blogStyle"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="block text-sm font-medium text-gray-700 mb-1">Blog Style</FormLabel>
                <div className="mt-1 grid grid-cols-3 gap-3 md:grid-cols-5">
                  <label
                    className={`flex items-center justify-center px-3 py-3 border rounded-md cursor-pointer focus:outline-none hover:bg-gray-50 active:bg-gray-100 ${
                      field.value === "professional" ? "border-primary bg-blue-50" : "border-gray-200 bg-white"
                    }`}
                  >
                    <div className="flex flex-col items-center">
                      <BookText className="h-5 w-5 text-gray-600" />
                      <span className="text-sm font-medium text-gray-700 mt-1">Professional</span>
                      <span className="text-xs text-gray-500">Formal</span>
                    </div>
                    <input
                      type="radio"
                      className="sr-only"
                      value="professional"
                      checked={field.value === "professional"}
                      onChange={() => field.onChange("professional")}
                    />
                  </label>
                  <label
                    className={`flex items-center justify-center px-3 py-3 border rounded-md cursor-pointer focus:outline-none hover:bg-gray-50 active:bg-gray-100 ${
                      field.value === "casual" ? "border-primary bg-blue-50" : "border-gray-200 bg-white"
                    }`}
                  >
                    <div className="flex flex-col items-center">
                      <MessageSquare className="h-5 w-5 text-gray-600" />
                      <span className="text-sm font-medium text-gray-700 mt-1">Casual</span>
                      <span className="text-xs text-gray-500">Conversational</span>
                    </div>
                    <input
                      type="radio"
                      className="sr-only"
                      value="casual"
                      checked={field.value === "casual"}
                      onChange={() => field.onChange("casual")}
                    />
                  </label>
                  <label
                    className={`flex items-center justify-center px-3 py-3 border rounded-md cursor-pointer focus:outline-none hover:bg-gray-50 active:bg-gray-100 ${
                      field.value === "enthusiastic" ? "border-primary bg-blue-50" : "border-gray-200 bg-white"
                    }`}
                  >
                    <div className="flex flex-col items-center">
                      <BookOpen className="h-5 w-5 text-gray-600" />
                      <span className="text-sm font-medium text-gray-700 mt-1">Enthusiastic</span>
                      <span className="text-xs text-gray-500">Energetic</span>
                    </div>
                    <input
                      type="radio"
                      className="sr-only"
                      value="enthusiastic"
                      checked={field.value === "enthusiastic"}
                      onChange={() => field.onChange("enthusiastic")}
                    />
                  </label>
                  <label
                    className={`flex items-center justify-center px-3 py-3 border rounded-md cursor-pointer focus:outline-none hover:bg-gray-50 active:bg-gray-100 ${
                      field.value === "animated" ? "border-primary bg-blue-50" : "border-gray-200 bg-white"
                    }`}
                  >
                    <div className="flex flex-col items-center">
                      <Sparkles className="h-5 w-5 text-gray-600" />
                      <span className="text-sm font-medium text-gray-700 mt-1">Animated</span>
                      <span className="text-xs text-gray-500">Lively & Visual</span>
                    </div>
                    <input
                      type="radio"
                      className="sr-only"
                      value="animated"
                      checked={field.value === "animated"}
                      onChange={() => field.onChange("animated")}
                    />
                  </label>
                  <label
                    className={`flex items-center justify-center px-3 py-3 border rounded-md cursor-pointer focus:outline-none hover:bg-gray-50 active:bg-gray-100 ${
                      field.value === "humorous" ? "border-primary bg-blue-50" : "border-gray-200 bg-white"
                    }`}
                  >
                    <div className="flex flex-col items-center">
                      <SmilePlus className="h-5 w-5 text-gray-600" />
                      <span className="text-sm font-medium text-gray-700 mt-1">Humorous</span>
                      <span className="text-xs text-gray-500">Witty & Fun</span>
                    </div>
                    <input
                      type="radio"
                      className="sr-only"
                      value="humorous"
                      checked={field.value === "humorous"}
                      onChange={() => field.onChange("humorous")}
                    />
                  </label>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="pt-2">
            <Button
              type="submit"
              className="w-full inline-flex justify-center items-center px-4 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors"
              disabled={generateBlogMutation.isPending}
            >
              <ArrowDown className="h-5 w-5 mr-2" />
              Generate Blog
            </Button>
          </div>
        </form>
      </Form>
      
      {generateBlogMutation.isError && (
        <Alert variant="destructive" className="mt-4">
          <AlertDescription className="py-2">
            <div className="font-semibold mb-1">
              {generateBlogMutation.error instanceof Error && 
                generateBlogMutation.error.message.includes("OpenAI API quota") 
                ? "API Quota Exceeded" 
                : "Error Generating Blog Post"}
            </div>
            <div>
              {generateBlogMutation.error instanceof Error 
                ? generateBlogMutation.error.message 
                : "Failed to generate blog. Please try again."}
            </div>
            {generateBlogMutation.error instanceof Error && 
              generateBlogMutation.error.message.includes("OpenAI API quota") && (
                <div className="mt-2 text-sm">
                  <p>The OpenAI API key has reached its usage limit. This usually happens with free tier accounts. 
                  The application will now use a basic fallback mode to generate blog posts without AI.</p>
                  <p className="mt-1">You can continue using the application with reduced functionality.</p>
                </div>
            )}
            {generateBlogMutation.error instanceof Error && 
              generateBlogMutation.error.message.includes("captions") && (
                <div className="mt-2 text-sm">
                  <p>Try a different video that has subtitles/captions available.</p>
                </div>
            )}
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
