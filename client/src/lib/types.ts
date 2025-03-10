export interface VideoDetails {
  videoId: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  channelTitle: string;
  publishedAt: string;
}

export type BlogStyle = 'professional' | 'casual' | 'enthusiastic' | 'animated' | 'humorous';

export interface BlogGenerationResult {
  videoDetails: VideoDetails;
  blogContent: string;
  isFallbackGeneration?: boolean;
  style?: BlogStyle;
}

export interface GenerateBlogRequest {
  videoId: string;
  length: 'short' | 'medium' | 'long';
  style: BlogStyle;
}
