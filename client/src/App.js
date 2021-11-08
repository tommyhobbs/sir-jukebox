import { useState, useEffect } from "react";
import "./App.css";
import Form from "./components/Form";

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

  const isValidHttpUrl = (potentialUrl) => {
    let url;
    try {
      url = new URL(potentialUrl);
    } catch (_) {
      return false;
    }
    return url.protocol === "http:" || url.protocol === "https:";
  };

  const handleSubmit = (name, url) => {
    const formattedUrl = url
      .replace(
        /https:\/\/youtu.be\/|https:\/\/www.youtube.com\/watch\?v=/g,
        "https://www.youtube.com/embed/"
      )
      .replace(/&.*/g, "");
    if (isValidHttpUrl(formattedUrl)) {
      fetch("/api/video", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, youtubeUrl: formattedUrl }),
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.acknowledged) {
            setLatestVideo();
            setErrorMessage("");
          } else {
            setErrorMessage("Error submitting");
          }
        })
        .catch((e) => setErrorMessage(e));
    } else {
      setErrorMessage("Invalid YouTube url");
    }
  };
  return (
    <div className="App">
      <header className="header">
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
          frameborder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowfullscreen
        ></iframe>
        {errorMessage && <p className="error">{errorMessage}</p>}
        <Form handleSubmit={handleSubmit} />
      </body>
    </div>
  );
};

export default App;
