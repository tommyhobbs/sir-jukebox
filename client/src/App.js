import { useState, useEffect } from "react";
import { isValidHttpUrl } from "./lib/utils";
import "./App.css";
import Form from "./components/Form";
import Bell from "./components/Bell";

const App = () => {
  const [errorMessage, setErrorMessage] = useState(null);
  const [author, setAuthor] = useState("");
  const [url, setUrl] = useState("https://www.youtube.com/embed/hmKshpLXnxE");

  const setLatestVideo = () =>
    fetch("/api/video")
      .then((response) => response.json())
      .then((data) => {
        data.name && setAuthor(data.name);
        data.youtubeUrl && setUrl(data.youtubeUrl);
      });

  useEffect(() => {
    setLatestVideo();
  }, [url]);

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
  return (
    <div className="App">
      <header className="header">
        <Bell />
        <h1>Sir Jukebox</h1>
        <p>
          Under construction by{" "}
          <a href="https://github.com/tommyhobbs">Tom Hobbs</a>
        </p>
      </header>
      <body className="main">
        {Boolean(author.length) && (
          <span>
            Selection by <span className="author">{author}</span>
          </span>
        )}
        <iframe
          src={url}
          title="YouTube video player"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        ></iframe>
        {errorMessage && <p className="error">{errorMessage}</p>}
        <Form handleSubmit={handleSubmit} />
      </body>
    </div>
  );
};

export default App;
