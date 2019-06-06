export function getThumbnails(data) {
  // http://172.20.4.42:8081/cockpit/api/thumbnails
  // http://localhost:8081/src/utils/api/thumbnails.json
  return fetch('http://172.20.4.42:8081/cockpit/api/thumbnails', {
  method: 'GET',
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
    'X-User': 'a'
  },  
  body: JSON.stringify(data)
  })
    .then((response) => response.json())
    .catch((error) => console.error(error));
}

