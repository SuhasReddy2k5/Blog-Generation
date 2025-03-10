import axios from 'axios';
import { VideoDetails } from '@shared/schema';

// Get video information using YouTube Data API
export async function getVideoInfo(videoId: string): Promise<VideoDetails | null> {
  try {
    // Use environment variable for API key with fallback
    const apiKey = process.env.YOUTUBE_API_KEY || process.env.YOUTUBE_API_KEY_ENV_VAR;
    
    if (!apiKey) {
      throw new Error('YouTube API key is missing');
    }

    const response = await axios.get(
      `https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${videoId}&key=${apiKey}`
    );

    if (!response.data.items || response.data.items.length === 0) {
      return null;
    }

    const videoData = response.data.items[0];
    const snippet = videoData.snippet;

    return {
      videoId,
      title: snippet.title,
      description: snippet.description,
      thumbnailUrl: snippet.thumbnails.high?.url || snippet.thumbnails.medium?.url || snippet.thumbnails.default?.url,
      channelTitle: snippet.channelTitle,
      publishedAt: snippet.publishedAt
    };
  } catch (error: any) {
    console.error('Error fetching video info:', error);
    
    // Check if it's an API key issue
    if (error?.response?.status === 403 || error?.response?.data?.error?.status === 'PERMISSION_DENIED') {
      throw new Error('YouTube API key is invalid or has insufficient permissions');
    } else if (error?.response?.status === 429 || error?.response?.data?.error?.status === 'RESOURCE_EXHAUSTED') {
      throw new Error('YouTube API quota exceeded. The API key has reached its usage limit');
    } else if (!process.env.YOUTUBE_API_KEY) {
      throw new Error('YouTube API key is missing. Please provide a valid API key');
    } else {
      throw new Error('Failed to fetch video information from YouTube');
    }
  }
}

// Get video transcript
export async function getVideoTranscript(videoId: string): Promise<string | null> {
  try {
    // Use YouTube Transcript API through our proxy service
    // This is a server-side implementation using a Node.js package
    const { YoutubeTranscript } = await import('youtube-transcript');
    
    const transcriptItems = await YoutubeTranscript.fetchTranscript(videoId);
    
    if (!transcriptItems || transcriptItems.length === 0) {
      return null;
    }
    
    // Combine all transcript segments into a single text
    return transcriptItems.map(item => item.text).join(' ');
  } catch (error: any) {
    console.error('Error fetching transcript:', error);
    
    if (error?.message?.includes('Could not get transcriptions')) {
      throw new Error('No captions available for this video. Please try a different video with subtitles.');
    } else if (error?.message?.includes('private')) {
      throw new Error('Cannot access transcript for a private video.');
    } else {
      throw new Error('Failed to fetch video transcript. Please ensure the video has captions/subtitles.');
    }
  }
}
