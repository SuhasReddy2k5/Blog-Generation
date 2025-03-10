import { useState } from "react";
import Header from "@/components/Header";
import BlogGenerator from "@/components/BlogGenerator";
import VideoMetadata from "@/components/VideoMetadata";
import BlogContent from "@/components/BlogContent";
import Footer from "@/components/Footer";
import { BlogGenerationResult } from "@/lib/types";

export default function Home() {
  const [result, setResult] = useState<BlogGenerationResult | null>(null);

  const handleBlogGenerated = (data: BlogGenerationResult) => {
    setResult(data);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-grow">
        <section className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl mb-3">Transform YouTube Videos into Blog Posts</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-3">
            Paste any YouTube link and our AI will generate a well-structured blog post in seconds. 
            Choose your preferred length and writing style to customize your content.
          </p>
          <p className="text-md text-gray-500 max-w-2xl mx-auto">
            Try our <span className="font-medium text-purple-600">Animated Style</span> for lively, visually engaging content with dynamic elements!
          </p>
        </section>

        <BlogGenerator onBlogGenerated={handleBlogGenerated} />

        {result && (
          <>
            <VideoMetadata video={result.videoDetails} />
            <BlogContent 
              blogContent={result.blogContent} 
              isFallbackGeneration={result.isFallbackGeneration}
              style={result.style} 
            />
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}
