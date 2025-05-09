// subscriber.js
const net = require('net');

const client = net.createConnection({ port: 8001, host: '127.0.0.1' }, () => {
  console.log('📡 Subscriber connected');

  const subscribeCommand = `*2\r\n$9\r\nSUBSCRIBE\r\n$4\r\nnews\r\n`;
  client.write(subscribeCommand);
});

client.on('data', data => {
  console.log('📨 Received:', data.toString());
});

client.on('end', () => {
  console.log('🔌 Subscriber disconnected');
});
