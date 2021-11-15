console.log("Service Worker Loaded...");

self.addEventListener("push", (e) => {
  const data = e.data.json();
  console.log("Push Recieved...");
  self.registration.showNotification(data.title, {
    body: "Sir Jukebox",
    icon: "logo512.png",
  });
});

self.addEventListener("notificationclick", (event) => {
  event.waitUntil(
    (async function () {
      const allClients = await clients.matchAll({
        includeUncontrolled: true,
      });
      let sirjukeboxClient;
      // Let's see if we already have a chat window open:
      for (const client of allClients) {
        if (client.location.href.indexOf("sirjukebox") > -1) {
          // Excellent, let's use it!
          client.focus();
          sirjukeboxClient = client;
          break;
        }
      }
      // If we didn't find an existing chat window,
      // open a new one:
      if (!sirjukeboxClient) {
        sirjukeboxClient = await clients.openWindow(
          "https://sirjukebox.herokuapp.com/"
        );
      }
    })()
  );
});
