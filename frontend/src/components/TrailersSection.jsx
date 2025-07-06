import { useState } from "react";
import ReactPlayer from "react-player";
import { dummyTrailers } from "../assets/assets";
import { PlayCircleIcon } from "lucide-react";

const TrailersSection = () => {
  const [currentTrailer, setCurrentTrailer] = useState(dummyTrailers[0]);

  return (
    <div className="sm:px-6 lg:px-16 mt-16">
      <p className="text-xl font-semibold text-white mb-4">Trailers</p>

      {/* Main Video */}
      <div className="relative">

        <div className="relative z-10">
          <ReactPlayer
            url={currentTrailer.videoUrl}
            controls={true}
            width="100%"
            height="400px"
            className="rounded-lg overflow-hidden"
          />
        </div>
      </div>

      {/* Trailer Thumbnails */}
      <div className="flex gap-4 mt-6 overflow-x-auto pb-2 px-1">
        {dummyTrailers.map((trailer) => (
          <div
            key={trailer.image}
            onClick={() => setCurrentTrailer(trailer)}
            className={`relative min-w-[130px] sm:min-w-[150px] md:min-w-[180px] h-24 sm:h-28 md:h-32 cursor-pointer group rounded-lg overflow-hidden flex-shrink-0 border-2 ${
              trailer.videoUrl === currentTrailer.videoUrl
                ? "border-red-500"
                : "border-transparent"
            }`}
          >
            <img
              src={trailer.image}
             onClick={() => setCurrentTrailer(trailer)}
              alt="trailer"
              className="w-full h-full object-cover group-hover:brightness-75 transition"
            />
            <PlayCircleIcon
              strokeWidth={1.6}
              className="absolute inset-0 m-auto w-8 h-8 text-white opacity-80 group-hover:opacity-100 transition"
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default TrailersSection;
