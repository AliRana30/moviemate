import { dummyShowsData } from '../../assets/assets';
import timeFormat from '../../libs/timeFormat'; // Assuming you have a utility function for formatting time

const ListShows = () => {
  return (
    <div className="p-4 space-y-4">
      <h2 className="text-xl font-semibold mb-2">All Shows</h2>
      {dummyShowsData.map((show) => (
        <div key={show._id} className="p-4 border rounded-md shadow-sm flex gap-4">
          <img src={show.poster_path} alt={show.title} className="w-24 h-36 object-cover rounded" />
          <div className="flex flex-col justify-between">
            <div>
              <h3 className="text-lg font-bold">{show.title}</h3>
              <p className="text-sm text-gray-600">{show.overview.slice(0, 100)}...</p>
              <p className="text-sm mt-2 text-gray-500">Genres: {show.genres.map(g => g.name).join(', ')}</p>
              <p className="text-sm mt-1">Release Date: {show.release_date}</p>
              <p className="text-sm mt-1">Runtime: {timeFormat(show.runtime)}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ListShows;
