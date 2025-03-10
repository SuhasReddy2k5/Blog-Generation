import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { getVideoInfo, getVideoTranscript } from "./lib/youtube";
import { generateBlogPost } from "./lib/openai";
import { blogStylesSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // API routes for generating blog posts from YouTube videos
  app.post("/api/generate-blog", async (req, res) => {
    try {
      const { videoId, length, style = 'professional' } = req.body;

      if (!videoId) {
        return res.status(400).json({ message: "Video ID is required" });
      }

      if (!length || !["short", "medium", "long"].includes(length)) {
        return res.status(400).json({ message: "Valid length (short, medium, long) is required" });
      }
      
      // Validate style
      if (!blogStylesSchema.safeParse(style).success) {
        return res.status(400).json({ 
          message: `Invalid style. Must be one of: ${blogStylesSchema.options.join(', ')}` 
        });
      }

      // First, check if we've cached this request
      const cachedResult = await storage.getBlogPost(videoId, length, style);
      if (cachedResult) {
        return res.json(cachedResult);
      }

      // Get video details from YouTube
      const videoDetails = await getVideoInfo(videoId);
      
      if (!videoDetails) {
        return res.status(404).json({ message: "Failed to fetch video details" });
      }

      // Get transcript
      const transcript = await getVideoTranscript(videoId);
      
      if (!transcript) {
        return res.status(404).json({ message: "Failed to fetch video transcript" });
      }

      // Generate blog post using OpenAI
      const blogContent = await generateBlogPost(transcript, videoDetails, length, style);

      // Store result in cache
      const result = {
        videoDetails,
        blogContent,
        style,
        // Flag to indicate if this is a fallback generation
        isFallbackGeneration: blogContent.includes("Note: This blog post was generated automatically based on the video transcript")
      };
      
      await storage.saveBlogPost(videoId, length, style, result);

      // Return the result
      res.json(result);
    } catch (error) {
      console.error("Error generating blog post:", error);
      res.status(500).json({ 
        message: error instanceof Error ? error.message : "Failed to generate blog post" 
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
