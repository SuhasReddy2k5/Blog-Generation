export function useYouTube() {
  const extractVideoId = (url: string): string | null => {
    try {
      // Handle youtube.com URLs
      if (url.includes('youtube.com/watch')) {
        const urlObj = new URL(url);
        return urlObj.searchParams.get('v');
      }
      
      // Handle youtu.be URLs
      if (url.includes('youtu.be/')) {
        const urlParts = url.split('youtu.be/');
        if (urlParts.length < 2) return null;
        
        // Handle any query parameters after the ID
        const idPart = urlParts[1].split('?')[0].split('&')[0];
        return idPart || null;
      }
      
      return null;
    } catch (error) {
      console.error('Error extracting YouTube video ID:', error);
      return null;
    }
  };

  return {
    extractVideoId
  };
}
