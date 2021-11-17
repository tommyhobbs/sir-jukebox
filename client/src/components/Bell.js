import { useEffect, useState } from "react";
import { urlBase64ToUint8Array } from "../lib/utils";
import "./Bell.css";

const publicVapidKey =
  "BNcIUnZ1ZHcrOSjMaF304qB5pcYWnxOlIO6QUwwnkOoHxA5zUup4YyovWqE3NGvAwW22bzn5WUqSab1yqpaeOtA";

const Bell = () => {
  const [isSupported, setSupported] = useState(false);
  const [subscription, setSubscription] = useState(null);

  useEffect(() => {
    const fetchSubscription = async (worker) => {
      try {
        const subscription = await worker.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(publicVapidKey),
        });
        console.log("Push Registered...");

        // Send subscription and check if its in the db
        console.log("Checking subscription...");
        const res = await fetch("/isSubscribed", {
          method: "POST",
          body: JSON.stringify(subscription),
          headers: {
            "content-type": "application/json",
          },
        });
        console.log("IsSubscribed Sent...");
        const data = await res.json();
        return data?.subscription || null;
      } catch (e) {
        console.error(e);
      }
    };
    navigator.serviceWorker
      .register("/worker.js")
      .then((worker) => {
        setSupported(Boolean(worker.pushManager));
        return isSupported
          ? fetchSubscription(worker)
          : console.log("Notifications unsupported 😔");
      })
      .then((subscription) => setSubscription(subscription))
      .catch((e) => console.error(e));
  }, [isSupported]);

  const handleBellClick = () => {
    if (subscription) {
      unregister();
    } else {
      Notification.requestPermission()
        .then((permission) => permission === "granted" && register())
        .catch((err) => console.error(err));
    }
  };

  // Register SW, Register Push, Send Push
  const register = async () => {
    try {
      // Register Service Worker
      console.log("Registering service worker...");
      const register = await navigator.serviceWorker.register("/worker.js", {
        scope: "/",
      });
      console.log("Service Worker Registered...");

      // Register Push
      console.log("Registering Push...");
      const subscription = await register.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicVapidKey),
      });
      console.log("Push Registered...");

      // Send Push Notification
      console.log("Sending Push...");
      const res = await fetch("/subscribe", {
        method: "POST",
        body: JSON.stringify(subscription),
        headers: {
          "content-type": "application/json",
        },
      });
      console.log("Push Sent...");
      console.log(res);
      res.status === 201 && setSubscription(subscription);
    } catch (e) {
      console.error(e);
    }
  };

  // Delete subscription
  const unregister = async () => {
    try {
      // Delete registration
      console.log("Unregistering...");
      await fetch("/subscribe", {
        method: "DELETE",
        body: JSON.stringify(subscription),
        headers: {
          "content-type": "application/json",
        },
      });
      setSubscription(null);
      navigator.serviceWorker.unregister();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <>
      {isSupported ? (
        <button onClick={handleBellClick}>
          {subscription ? "Unsubscribe 🔕" : "Subscribe 🔔"}
        </button>
      ) : null}
    </>
  );
};

export default Bell;
