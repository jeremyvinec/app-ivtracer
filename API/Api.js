export function getThumbnails(data) {
  // https://raw.githubusercontent.com/jeremyvinec/thumbnails-json/master/data.json
  return fetch('http://172.20.4.42:8081/cockpit/api/thumbnails?X-User=a', {
  method: 'GET',
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json'
  },  
  body: JSON.stringify(data)
  })
    .then((response) => {response.json(); console.log()})
    .catch((error) => console.error(error));
} 