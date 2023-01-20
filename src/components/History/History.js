import { useState, useEffect } from "react";
import { getVideoCodeFromUrl } from "../../lib/utils";
import "./History.css";

const History = ({ results, handleSelect }) => {
  const [tracks, setTracks] = useState(results);
  useEffect(() => {
    const fetchTracks = async () => {
      const filteredResults = results.filter((result) =>
        getVideoCodeFromUrl(result.youtubeUrl)
      );
      const infoPromises = filteredResults.map((result) =>
        fetch(
          `https://www.youtube.com/oembed?url=youtu.be/${getVideoCodeFromUrl(
            result.youtubeUrl
          )}&format=json`
        )
          .then((response) => response.json())
          .catch((e) => console.log(e))
      );

      const infos = await Promise.all(infoPromises);
      setTracks(
        results.map((result, i) => ({
          ...result,
          trackName: infos[i]?.title,
          thumbnail: infos[i]?.thumbnail_url,
        }))
      );
    };
    fetchTracks().catch(console.error);
  }, [results]);
  return (
    <div className="history-container">
      <h3>History</h3>
      <div className="history">
        {tracks.map((track, i) => {
          return (
            <div className="card" key={track.trackName}>
              <img
                src={track.thumbnail}
                alt={`${track.name}'s thumbnail`}
                onClick={() => handleSelect(track)}
              />
              <span>{`${track.name}'s track: ${track.trackName}`}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default History;
