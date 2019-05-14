export function getThumbnails(data) {
  return fetch('https://raw.githubusercontent.com/jeremyvinec/thumbnails-json/master/data.json', {
  method: 'GET',
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json'
  },  
  body: JSON.stringify(data)
  })
    .then((response) => response.json())
    .catch((error) => console.error(error));
} 