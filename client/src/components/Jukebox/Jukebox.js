import TopDetail from "../detail/TopDetail";
import "./Jukebox.css";

const Jukebox = ({ children }) => (
  <div className="frame">
    <TopDetail />
    <div className="middle">
      <div className="inner">{children}</div>
    </div>
  </div>
);

export default Jukebox;
