import { faPlayCircle } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

export function Player(props) {
  return (
    <footer className="fixed bottom-0 w-full bg-gray-800 p-5">
      <div className="grid grid-cols-3">
        <div className="flex items-center">
          <img
            src={
              'https://i.scdn.co/image/ab67616d0000b2738b7a8c1322028d45a8355f7a'
            }
            alt="thumbnail"
            className="rounded-full mr-3 h-[50px] w-[50px]"
          />
          <div>
            <p className="text-sm font-semibold">Song Name</p>
            <p className="text-xs text-gray-400">Artist</p>
          </div>
        </div>
        <div className="flex items-center justify-center">
          <FontAwesomeIcon
            icon={faPlayCircle}
            className="text-white text-3xl mx-2 h-[40px] w-[40px] cursor-pointer"
          />
        </div>
      </div>
    </footer>
  );
}
