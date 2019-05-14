export function getThumbnails() {
  return fetch('https://raw.githubusercontent.com/jeremyvinec/thumbnails-json/master/data.json')
    .then((response) => response.json())
    .catch((error) => console.error(error));
} 