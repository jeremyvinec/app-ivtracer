export function getThumbnails(data) {
  // https://raw.githubusercontent.com/jeremyvinec/app-ivtracer/master/API/thumbnails.json
  // http://172.20.4.42:8081/cockpit/api/thumbnails?X-User=a
  return fetch('https://raw.githubusercontent.com/jeremyvinec/app-ivtracer/master/API/thumbnails.json', {
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

