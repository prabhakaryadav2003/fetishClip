type Props = {
  id: string;
  title: string;
  thumbnail: string;
  channel?: string;
  views?: string;
};

const VideoCard = ({ id, title, thumbnail, channel, views }: Props) => {
  return (
    <div className="bg-gray-100 rounded-lg overflow-hidden shadow hover:shadow-red-300 hover:scale-103 transition cursor-pointer">
      <img
        src={thumbnail}
        alt={title}
        className="w-full object-contain aspect-video"
      />
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 text-sm mb-1 line-clamp-2">
          {title}
        </h3>
        {(channel || views) && (
          <div className="flex justify-between">
            {channel && (
              <span className="text-xs text-gray-600">{channel}</span>
            )}
            {views && <span className="text-xs text-gray-500">{views}</span>}
          </div>
        )}
      </div>
    </div>
  );
};

export default VideoCard;
