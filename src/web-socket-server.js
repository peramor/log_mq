const WebSocket = require('ws');
const server = new WebSocket.Server({
  port: 8081
})

server.on('connection', ws => {
  ws.on('message', message => {
    server.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN)
        client.send(message);
    })
  })
  
  ws.send('Добро пожаловать в CodeDojo')
})