import { useState, useEffect, useRef } from "react";
import { getVideoCodeFromUrl } from "../../lib/utils";
import Page from "../Page/Page";
import "./History.css";

const History = ({ results, handleSelect }) => {
  const [tracks, setTracks] = useState(results);
  const [pages, setPages] = useState([]);

  const [isHolding, setIsHolding] = useState(false);
  const [bookWidth, setBookWidth] = useState(0);
  const [pageWidth, setPageWidth] = useState(0);
  const [spine, setSpine] = useState(0);
  const [activePage, setActivePage] = useState(null);
  const bookRef = useRef(null);

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
        results.slice(0, 20).map((result, i) => ({
          ...result,
          trackName: infos[i]?.title,
          thumbnail: infos[i]?.thumbnail_url,
        }))
      );
    };
    fetchTracks().catch(console.error);
  }, [results]);

  useEffect(() => {
    setPages(() => {
      let p = [];
      for (let i = 0; i < tracks.length; i += 2) {
        p.push({
          key: `${tracks[i]?.trackName} + ${tracks[i + 1]?.trackName}`,
          A: { ...tracks[i], index: i },
          B: { ...tracks[i + 1], index: i + 1 },
        });
      }
      return p;
    });
  }, [tracks]);

  const setRotation = (activePage, locationX) => {
    if (!activePage || activePage?.isHolding === false) return;
    activePage.rotation = ((locationX - spine) / pageWidth) * 100;
    activePage.style.transform = `scaleX(${activePage.rotation}%)`;
    if (activePage.rotation > 0) {
      activePage.activeSide = "A";
      activePage.isRight = true;
      activePage.isLeft = false;
      activePage.getElementsByClassName("side A")[0].style.display = "block";
      activePage.getElementsByClassName("side B")[0].style.display = "none";
    } else if (activePage.rotation < 0) {
      activePage.activeSide = "B";
      activePage.isLeft = true;
      activePage.isRight = false;
      activePage.getElementsByClassName("side B")[0].style.display = "block";
      activePage.getElementsByClassName("side A")[0].style.display = "none";
    }
    if (activePage.rotation > 100 || activePage.rotation < -100) {
      activePage.isHolding = false;
    }
  };

  useEffect(() => {
    if (bookRef?.current) {
      setBookWidth(bookRef.current.clientWidth);
      setSpine(bookRef.current.getBoundingClientRect().left + bookWidth / 2);

      bookRef.current.addEventListener("mousedown", () => {
        bookRef.current.style.cursor = "grabbing";
      });
      bookRef.current.addEventListener("mouseup", () => {
        if (activePage) activePage.isHolding = false;
      });
      bookRef.current.addEventListener("mouseenter", () => {
        bookRef.current.style.cursor = "grab";
      });
      bookRef.current.addEventListener("mousemove", (e) => {
        setRotation(activePage, e.clientX);
      });
      bookRef.current.addEventListener("mouseout", () => {
        bookRef.current.style.cursor = "grab";
      });
      bookRef.current.addEventListener("touchmove", (e) => {
        setRotation(e.touches[0].clientX);
      });
    }
  }, [activePage, bookWidth, pageWidth, spine, isHolding]);

  return (
    <>
      <div className="track-select">
        {tracks.map((track, index) => (
          <button>{index + 1}</button>
        ))}
      </div>
      <div className="history-container" ref={bookRef}>
        {pages.map(({ key, A, B }, i) => (
          <Page
            key={key}
            A={A}
            B={B}
            handleSelect={handleSelect}
            handleActivePage={(activePage) => {
              console.log(activePage);
              setActivePage(activePage);
            }}
            handleSetPageWidth={(pageWidth) => setPageWidth(pageWidth)}
            index={i}
            noOfPages={pages.length}
          />
        ))}
      </div>
    </>
  );
};

export default History;
