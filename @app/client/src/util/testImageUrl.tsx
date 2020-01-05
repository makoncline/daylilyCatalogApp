export default function testImage(__: any, url: any, callback: any) {
  if (!url) callback();
  let timeout = 5000;
  let timedOut = false;
  let timer: any;
  let img = new Image();
  img.onerror = img.onabort = () => {
    if (!timedOut) {
      clearTimeout(timer);
      callback("Error: The URL entered may not be an image");
    }
  };
  img.onload = () => {
    if (!timedOut) {
      clearTimeout(timer);
      callback();
    }
  };
  img.src = url;
  timer = setTimeout(() => {
    timedOut = true;
    img.src = "//!!!!/test.jpg";
    callback("Error: The URL entered may not be an image");
  }, timeout);
}
