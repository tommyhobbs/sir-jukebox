import { useState, useEffect } from "react";
import { isValidHttpUrl } from "./lib/utils";
import "./App.css";
import Form from "./components/Form/Form";
import Bell from "./components/Bell/Bell";
import History from "./components/History/History";

const App = () => {
  const [errorMessage, setErrorMessage] = useState(null);
  const [nowPlaying, setNowPlaying] = useState({
    name: "Stevie Wonder",
    youtubeUrl: "https://www.youtube.com/embed/hmKshpLXnxE",
  });
  const [results, setResults] = useState([]);

  const setLatestVideo = () =>
    fetch("/api/videos")
      .then((response) => response.json())
      .then((data) => {
        // only have the newest song from each person
        const filtered = data.reduce(
          (prev, curr) =>
            curr.name &&
            curr.youtubeUrl &&
            prev.find(({ name }) => name.trim() === curr.name.trim())
              ? prev
              : [...prev, curr],
          []
        );
        filtered[0].name &&
          filtered[0].youtubeUrl &&
          setNowPlaying(filtered[0]);
        setResults(filtered);
      });

  useEffect(() => {
    setLatestVideo();
  }, []);

  const handleSubmit = (name, url) => {
    const formattedUrl = url
      .replace(
        /https:\/\/youtu.be\/|https:\/\/www.youtube.com\/watch\?v=/g,
        "https://www.youtube.com/embed/"
      )
      .replace(/&.*/g, "");
    if (isValidHttpUrl(formattedUrl)) {
      navigator.serviceWorker.ready
        .then((subscription) => {
          if (!subscription) {
            // We aren’t subscribed to push, so set UI
            // to allow the user to enable push
            return;
          }
          return subscription;
        })
        .then((serviceWorkerRegistration) =>
          serviceWorkerRegistration.pushManager.getSubscription()
        )
        .then((registration) =>
          fetch("/api/video", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              subscription: registration,
              data: { name, youtubeUrl: formattedUrl },
            }),
          })
        )
        .then((response) => response.json())
        .then((data) => {
          if (data.acknowledged) {
            setLatestVideo();
            setErrorMessage("");
          } else {
            setErrorMessage("Error submitting");
          }
        })
        .catch((e) => {
          setErrorMessage(e);
        });
    } else {
      setErrorMessage("Invalid YouTube url");
    }
  };

  const handleSelect = (result) => setNowPlaying(result);

  return (
    <div className="App">
      <div className="main">
        <header className="header">
          <Bell />
          <h1>Sir Jukebox</h1>
        </header>
        <div className="now-playing">
          <div className="player">
            <iframe
              src={nowPlaying.youtubeUrl}
              title="YouTube video player"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
          <div>
            <h2>
              Selection by <span className="author">{nowPlaying.name}</span>
            </h2>
          </div>
        </div>
        {errorMessage && <p className="error">{errorMessage}</p>}

        <Form handleSubmit={handleSubmit} />
        <History results={results} handleSelect={handleSelect} />
        <p className="signature">
          by <a href="https://github.com/tommyhobbs/sir-jukebox">Tom Hobbs</a>
        </p>
      </div>
    </div>
  );
};

export default App;
