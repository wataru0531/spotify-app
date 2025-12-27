
// SongList.js

import { faSpinner } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";


export function SongList({ isLoading, songs }) {
  // console.log(songs);

  return (
    <>
      {
        isLoading ? (
          <div className="inset-0 flex justify-center items-center">
            <FontAwesomeIcon icon={faSpinner} spin size="3x" />
          </div>
        ) : (
          <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-8">
            {
              songs.map((song) => {
                // console.log(song);

                return (
                  <a
                    key={ song.id }
                    href={ song.album?.external_urls?.spotify }
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-none cursor-pointer"
                  >
                    <img
                      alt={ song.album?.name || "Unknown Album" }
                      src={ song.album?.images[0].url || "/placeholder.avif" }
                      className="mb-2 rounded"
                    />
                    <h3 className="text-lg font-semibold">{ song.album?.name || "Unknown Album" }</h3>
                    <p className="text-gray-400">By { song.artists?.[0]?.name || "Unknown Artist" }</p>
                  </a>
                );
              })
            }
          </div>
        )
      }
      
    </>
  );
}
