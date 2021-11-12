import { useState, useEffect } from "react";
import "./App.css";
import Form from "./components/Form";

const App = () => {
  const [errorMessage, setErrorMessage] = useState(null);
  const [author, setAuthor] = useState("");
  const [url, setUrl] = useState("https://www.youtube.com/embed/hmKshpLXnxE");

  // Check for service worker
  if ("serviceWorker" in navigator) {
    send().catch((err) => console.error(err));
  }

  // Register SW, Register Push, Send Push
  async function send() {
    // Register Service Worker
    console.log("Registering service worker...");
    const register = await navigator.serviceWorker.getRegistration("/");
    console.log("Service Worker Registered...");

    // Register Push
    console.log("Registering Push...");
    const subscription = await register.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(
        "BBNQnvagclb6wONqqiQY3UQzUuqyZbVOEeSaYk6-FSQOY6nnnADcdLCiqjRLfdQuUrR1Lh6fIRNUvjQ8FW6diiU"
      ),
    });
    console.log("Push Registered...");

    // Send Push Notification
    console.log("Sending Push...");
    await fetch("/subscribe", {
      method: "POST",
      body: JSON.stringify(subscription),
      headers: {
        "content-type": "application/json",
      },
    });
    console.log("Push Sent...");
  }

  function urlBase64ToUint8Array(base64String) {
    const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding)
      .replace(/\-/g, "+")
      .replace(/_/g, "/");

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }

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
