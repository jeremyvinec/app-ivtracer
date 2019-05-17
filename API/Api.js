export function getThumbnails(data) {
  // https://raw.githubusercontent.com/jeremyvinec/app-ivtracer/master/API/thumbnails.json
  return fetch('http://172.20.4.42:8081/cockpit/api/thumbnails', {
  method: 'GET',
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
    'X-User':'a'
  },  
  body: JSON.stringify(data)
  })
    .then((response) => response.json())
    .catch((error) => console.error(error));
}

