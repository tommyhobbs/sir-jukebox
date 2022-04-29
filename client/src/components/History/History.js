import { getVideoCodeFromUrl } from "../../lib/utils";
import "./History.css";

const History = ({ results, handleSelect }) => {
  return (
    <div className="history-container">
      {results.map((result, i) => {
        const imageUrl = `https://i1.ytimg.com/vi/${getVideoCodeFromUrl(
          result.youtubeUrl
        )}/mqdefault.jpg`;
        return (
          <div
            className="card"
            style={{ left: `${i * 80}px`, zIndex: results.length - i }}
          >
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
