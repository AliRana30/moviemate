import { useContext } from 'react';
import { dummyShowsData } from '../assets/assets'
import BlurCircle from '../components/BlurCircle';
import MovieCards from '../components/MovieCards'
import { UserContext } from '../context/UserContext';

const Movies = () => {

  const {shows} = useContext(UserContext)

  return shows.length > 0 ? (
    <div className="mt-28 px-5 max-w-7xl mx-auto">
      <BlurCircle/>
      <h1 className="mb-5 text-xl font-bold text-white">Now Showing</h1>
      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {shows.map((movie) => (
          <MovieCards movie={movie} key={movie._id} />
        ))}
      </div> 
      <div className="absolute right-80 bottom-2">
  <BlurCircle />
</div>

    </div>
  ) : (
    <div className="mt-28 px-5">
      <h1 className="text-white text-xl">No movie to display</h1>
    </div>
  );
}

export default Movies
