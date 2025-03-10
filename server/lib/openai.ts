import OpenAI from "openai";
import { VideoDetails, BlogStyle } from "@shared/schema";

// Initialize OpenAI with API key
const apiKey = process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY_ENV_VAR;
let openai: OpenAI;

try {
  if (!apiKey) {
    console.warn("Warning: OpenAI API key is missing. Some features may not work correctly.");
  }
  
  openai = new OpenAI({ 
    apiKey: apiKey || 'dummy-key-for-initialization' // We'll check for apiKey before making actual requests
  });
} catch (error) {
  console.error("Failed to initialize OpenAI client:", error);
  // Create a dummy client that will throw appropriate errors when used
  openai = new OpenAI({ apiKey: 'dummy-key-for-initialization' });
}

// Define word count targets for different lengths
const WORD_COUNT = {
  short: {
    min: 300,
    max: 500,
    target: 400
  },
  medium: {
    min: 700,
    max: 1000,
    target: 850
  },
  long: {
    min: 1500,
    max: 2000,
    target: 1750
  }
};

// Generate blog post from transcript and video details
// Fallback function to generate a basic blog post without AI
export function generateBasicBlogPost(
  transcript: string,
  videoDetails: VideoDetails,
  length: 'short' | 'medium' | 'long',
  style: BlogStyle = 'professional'
): string {
  // Determine the appropriate length
  const wordCountTarget = WORD_COUNT[length];
  
  // Truncate the transcript based on the target length
  // Since this is a basic formatter, we'll use a simple approach
  let truncatedTranscript = transcript;
  if (length === 'short') {
    truncatedTranscript = transcript.substring(0, Math.min(transcript.length, 2000));
  } else if (length === 'medium') {
    truncatedTranscript = transcript.substring(0, Math.min(transcript.length, 4000));
  }
  
  // Create paragraphs from the transcript
  // Break transcript into sentences
  const sentences = truncatedTranscript.replace(/([.?!])\s*(?=[A-Z])/g, "$1|").split("|");
  
  // Group sentences into paragraphs (roughly 3-4 sentences per paragraph)
  const paragraphs: string[] = [];
  for (let i = 0; i < sentences.length; i += 3) {
    const paragraph = sentences.slice(i, i + 3).join(' ').trim();
    if (paragraph) paragraphs.push(paragraph);
  }
  
  // Find potential section breaks (every ~5 paragraphs)
  const sections: string[][] = [];
  for (let i = 0; i < paragraphs.length; i += 5) {
    sections.push(paragraphs.slice(i, i + 5));
  }
  
  // Generate section headings based on content
  const sectionHeadings: string[] = [];
  for (let i = 0; i < sections.length; i++) {
    if (i === 0) {
      sectionHeadings.push("Introduction");
    } else if (i === sections.length - 1) {
      sectionHeadings.push("Conclusion");
    } else {
      // Simple generic headings
      sectionHeadings.push(`Key Points - Part ${i}`);
    }
  }
  
  // Style-specific opening phrases and expressions
  const styleElements = {
    professional: {
      titlePrefix: "",
      introPrefix: "In this article, we'll explore",
      conclusionPrefix: "In conclusion,",
      emphasis: (text: string) => `<strong>${text}</strong>`,
      headerStyle: ""
    },
    casual: {
      titlePrefix: "Let's Talk About ",
      introPrefix: "Hey there! Let's chat about",
      conclusionPrefix: "So, that's about it for",
      emphasis: (text: string) => `<em>${text}</em>`,
      headerStyle: ""
    },
    enthusiastic: {
      titlePrefix: "You Won't Believe What We Found in ",
      introPrefix: "I'm thrilled to share",
      conclusionPrefix: "Wow! We've covered so much about",
      emphasis: (text: string) => `<strong>${text}!</strong>`,
      headerStyle: ""
    },
    animated: {
      titlePrefix: "✨ Amazing Discoveries in ",
      introPrefix: "🚀 Get ready for an exciting journey through",
      conclusionPrefix: "🎉 That wraps up our amazing exploration of",
      emphasis: (text: string) => `<span class="animated-text">${text}</span>`,
      headerStyle: "class=\"animated-header\""
    },
    humorous: {
      titlePrefix: "The Hilarious Truth About ",
      introPrefix: "Buckle up for a funny take on",
      conclusionPrefix: "Well, that was fun! Let's recap",
      emphasis: (text: string) => `<em>*chuckles*</em> ${text}`,
      headerStyle: ""
    }
  };
  
  const currentStyle = styleElements[style];
  
  // Construct the HTML blog post with style options
  let blogContent = `<h1 ${currentStyle.headerStyle}>${currentStyle.titlePrefix}${videoDetails.title}</h1>
<p><em>Based on content from ${videoDetails.channelTitle}</em></p>

<h2 ${currentStyle.headerStyle}>Introduction</h2>
<p>${currentStyle.introPrefix} ${sections[0]?.join('</p>\n<p>') || 'No transcript available for this section.'}</p>
`;

  // Add middle sections with style
  for (let i = 1; i < sections.length - 1; i++) {
    const sectionTitle = style === 'animated' ? 
      `✨ ${sectionHeadings[i]} ✨` : 
      sectionHeadings[i];
    
    blogContent += `\n<h2 ${currentStyle.headerStyle}>${sectionTitle}</h2>\n`;
    
    // Apply style-specific formatting to paragraphs
    const styledParagraphs = sections[i].map(para => {
      if (style === 'animated') {
        // Add some animated elements for animated style
        const words = para.split(' ');
        if (words.length > 10) {
          // Emphasize a random word or phrase in longer paragraphs
          const randomIndex = Math.floor(Math.random() * (words.length - 3));
          const randomPhrase = words.slice(randomIndex, randomIndex + 2).join(' ');
          words.splice(randomIndex, 2, currentStyle.emphasis(randomPhrase));
          return words.join(' ');
        }
      }
      return para;
    });
    
    blogContent += `<p>${styledParagraphs.join('</p>\n<p>')}</p>\n`;
  }
  
  // Add conclusion if we have enough content
  if (sections.length > 1) {
    blogContent += `\n<h2 ${currentStyle.headerStyle}>${style === 'animated' ? '🏁 Conclusion 🏁' : 'Conclusion'}</h2>\n`;
    blogContent += `<p>${currentStyle.conclusionPrefix} ${sections[sections.length - 1].join('</p>\n<p>')}</p>\n`;
  }
  
  // Add a note about video description
  if (videoDetails.description) {
    blogContent += `\n<h3 ${currentStyle.headerStyle}>${style === 'animated' ? '📝 About this Video 📝' : 'About this Video'}</h3>\n`;
    blogContent += `<p>${videoDetails.description}</p>\n`;
  }
  
  // Add style-specific CSS for animated style
  if (style === 'animated') {
    blogContent = `<style>
  .animated-header {
    background: linear-gradient(45deg, #6e45e2, #88d3ce);
    color: white;
    padding: 10px;
    border-radius: 8px;
    text-shadow: 1px 1px 3px rgba(0,0,0,0.3);
    transition: all 0.3s ease;
  }
  .animated-text {
    font-weight: bold;
    color: #6e45e2;
    position: relative;
    display: inline-block;
    animation: pulse 2s infinite;
  }
  @keyframes pulse {
    0% { transform: scale(1); }
    50% { transform: scale(1.05); }
    100% { transform: scale(1); }
  }
</style>\n` + blogContent;
  }
  
  // Add a footer note
  blogContent += `\n<p><em>Note: This blog post was generated automatically based on the video transcript. 
For the full experience, consider watching the original video on YouTube.</em></p>`;

  return blogContent;
}

export async function generateBlogPost(
  transcript: string, 
  videoDetails: VideoDetails, 
  length: 'short' | 'medium' | 'long',
  style: BlogStyle = 'professional'
): Promise<string> {
  try {
    if (!apiKey) {
      console.warn("OpenAI API key is missing. Using fallback blog generation.");
      return generateBasicBlogPost(transcript, videoDetails, length, style);
    }
    
    // Truncate transcript if it's too long (OpenAI has token limits)
    const maxTranscriptLength = 8000;
    const truncatedTranscript = transcript.length > maxTranscriptLength
      ? transcript.substring(0, maxTranscriptLength) + "... (transcript truncated due to length)"
      : transcript;
    
    const wordCountTarget = WORD_COUNT[length];
    
    // Define style descriptions for prompting
    const styleDescriptions = {
      professional: "in a formal, educational tone with clear structure and precise language",
      casual: "in a relaxed, conversational tone like you're talking to a friend",
      enthusiastic: "with high energy and excitement, using dynamic language and expressing passion",
      animated: "with lively, vibrant language, using emojis, engaging visuals, and dynamic elements to create excitement",
      humorous: "with a light-hearted, witty approach incorporating jokes and playful language"
    };

    // Create a prompt for the OpenAI model
    const prompt = `
You are a skilled content writer creating a well-structured blog post based on a YouTube video.

Video Title: ${videoDetails.title}
Video Creator: ${videoDetails.channelTitle}
Video Description: ${videoDetails.description}

Here is the transcript of the video:
${truncatedTranscript}

Please generate a ${length} blog post (${wordCountTarget.min}-${wordCountTarget.max} words, target: ${wordCountTarget.target} words) based on this video.

Writing Style: ${style} - Write ${styleDescriptions[style]}

${style === 'animated' ? `For the animated style:
- Add emojis to headings and important points
- Use vibrant, energetic language throughout
- Create a sense of movement and excitement in your writing
- Include visually descriptive language that helps readers visualize content
- Add CSS styling with gradients, animations, and visual flair
- Make the content feel dynamic and engaging, like it's "coming alive" on the page
` : ''}

The blog post should:
1. Have a catchy title related to the content
2. Include an introduction that hooks the reader
3. Be structured with proper headings and subheadings (using h1, h2, h3 HTML tags)
4. Cover the key points from the video in a well-organized manner
5. Include lists and bullet points where appropriate
6. Have a strong conclusion that summarizes the main points
7. Be written in the specified style: ${style}

Format the blog post with proper HTML tags for structure (h1, h2, h3, p, ul, li, etc.) so it's ready for web publishing.
${style === 'animated' ? 'Include inline CSS for animations and visual effects that make the content more lively.' : ''}
Do not include any meta information, instructions, or notes - respond only with the formatted blog post content.
`;

    // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { 
          role: "system", 
          content: `You are an ${style} blog writer who specializes in creating ${style === 'professional' ? 'clear, authoritative' : 
                                     style === 'casual' ? 'relaxed, friendly' : 
                                     style === 'enthusiastic' ? 'energetic, passionate' : 
                                     style === 'animated' ? 'dynamic, visually exciting' : 
                                     style === 'humorous' ? 'witty, entertaining' : 
                                     'engaging'} content from video transcripts.`
        },
        { role: "user", content: prompt }
      ],
      max_tokens: 4000,
      temperature: style === 'professional' ? 0.6 : style === 'animated' || style === 'humorous' ? 0.9 : 0.7
    });

    const blogContent = response.choices[0].message.content || "";
    return blogContent;
  } catch (error: any) {
    console.error("Error generating blog post with OpenAI:", error);
    
    // Check if it's a rate limit or quota error
    if (error?.error?.type === 'insufficient_quota' || error?.status === 429) {
      console.warn("OpenAI API quota exceeded. Using fallback blog generation.");
      return generateBasicBlogPost(transcript, videoDetails, length, style);
    } else if (error?.error?.type === 'access_terminated') {
      console.warn("OpenAI API access terminated. Using fallback blog generation.");
      return generateBasicBlogPost(transcript, videoDetails, length, style);
    } else if (error?.status === 401) {
      console.warn("Invalid OpenAI API key. Using fallback blog generation.");
      return generateBasicBlogPost(transcript, videoDetails, length, style);
    } else if (error?.status === 500) {
      console.warn("OpenAI server error. Using fallback blog generation.");
      return generateBasicBlogPost(transcript, videoDetails, length, style);
    } else {
      console.warn("Failed to generate blog with OpenAI. Using fallback blog generation.");
      return generateBasicBlogPost(transcript, videoDetails, length, style);
    }
  }
}
