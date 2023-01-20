const isValidHttpUrl = (potentialUrl) => {
  let url;
  try {
    url = new URL(potentialUrl);
  } catch (_) {
    return false;
  }
  return url.protocol === "http:" || url.protocol === "https:";
};

const urlBase64ToUint8Array = (base64String) => {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
};

const getVideoCodeFromUrl = (url) => {
  const matches = url.matchAll(
    /^((?:https?:)?\/\/)?((?:www|m)\.)?((?:youtube\.com|youtu.be))(\/(?:[\w-]+\?v=|embed\/|v\/)?)([\w-]+)(\S+)?$/g
  );
  for (const match of matches) {
    return match[5];
  }
};

export { isValidHttpUrl, urlBase64ToUint8Array, getVideoCodeFromUrl };
