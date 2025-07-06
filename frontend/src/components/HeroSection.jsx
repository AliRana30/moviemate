import { CalendarIcon, ClockIcon, MoveRight } from "lucide-react";
import { assets } from "../assets/assets";
import { useNavigate } from "react-router-dom";

const HeroSection = () => {
  const navigate = useNavigate();

  return (
    <div className={`flex flex-col items-start justify-center gap-4 px-6 md:px-16 lg:px-36 bg-[url("/backgroundImage.png")] bg-cover bg-center h-screen`}>
      <img src={assets.marvelLogo} alt="" className="max-h-11 lg:h-11 mt-20" />

      <h1 className="text-5xl md:text-[70px] md:leading-18 font-semibold max-w-110">
        Guardians <br /> of the Galaxy
      </h1>

      <div className="flex items-center gap-4 text-gray-300">
        <span>Action | Adventure | Sci-Fi</span>

        <div className="flex items-center gap-1">
          <CalendarIcon className="w-4.5 h-4.5" /> 2018
        </div>

        <div className="flex items-center gap-1">
          <ClockIcon className="w-4.5 h-4.5" /> 2h 8m
        </div>
      </div>
      <button
        className="bg-red-600 p-4 mt-1 rounded-full w-56 flex items-center justify-center gap-4 text-white"
        onClick={() => navigate("/movies")}
      >
        Explore Movies
        <MoveRight />
      </button>
    </div>
  );
};

export default HeroSection;
