import { getVideoCodeFromUrl } from "../../lib/utils";
import "./History.css";

const History = ({ results, handleSelect }) => {
  return (
    <div className="history-container">
      {results.map((result) => {
        const imageUrl = `https://i1.ytimg.com/vi/${getVideoCodeFromUrl(
          result.youtubeUrl
        )}/default.jpg`;
        return (
          <div>
            <span>{`${result.name}'s track`}</span>
            <img
              src={imageUrl}
              alt={`${result.name}'s thumbnail`}
              onClick={() => handleSelect(result)}
            />
          </div>
        );
      })}
    </div>
  );
};

export default History;
