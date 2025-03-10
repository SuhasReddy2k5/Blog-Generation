import { VideoDetails } from "@/lib/types";

interface VideoMetadataProps {
  video: VideoDetails;
}

export default function VideoMetadata({ video }: VideoMetadataProps) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <div className="flex flex-col sm:flex-row gap-6">
        <div className="sm:w-64 flex-shrink-0">
          <img 
            src={video.thumbnailUrl} 
            alt={`Thumbnail for ${video.title}`} 
            className="w-full h-auto rounded-md object-cover"
          />
        </div>
        <div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">{video.title}</h3>
          <div className="flex items-center text-sm text-gray-500 mb-3">
            <span>{video.channelTitle}</span>
            <span className="mx-2">•</span>
            <span>{new Date(video.publishedAt).toLocaleDateString()}</span>
          </div>
          <p className="text-gray-600 text-sm line-clamp-3">{video.description}</p>
        </div>
      </div>
    </div>
  );
}
