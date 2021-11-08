import { useState, useEffect } from "react";
import "./App.css";
import Form from "./components/Form";

const App = () => {
  const [isError, setError] = useState(false);
  const [author, setAuthor] = useState("");
  const [url, setUrl] = useState("https://www.youtube.com/embed/hmKshpLXnxE");

  useEffect(() => {
    console.log("fetch /api/video");
    fetch("/api/video")
      .then((response) => console.log(response))
      // .then((data) => {
      //   console.log("data",data);
      //   data.name && setAuthor(data.name);
      //   data.youtubeUrl && setUrl(data.youtubeUrl);
      // });
  }, []);

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
    fetch("/api/video", {
      method: "POST",
      body: JSON.stringify({ name, youtubeUrl: url }),
    }).then((response) => console.log(response));

    // if (isValidHttpUrl(url)) {
    //   setAuthor(name);
    //   setUrl(url.replace("https://youtu.be", "https://www.youtube.com/embed/"));
    //   setError(false);
    // } else {
    //   setError(true);
    // }
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
        {isError && <p className="error">Invalid YouTube url</p>}
        <Form handleSubmit={handleSubmit} />
      </body>
    </div>
  );
};

export default App;