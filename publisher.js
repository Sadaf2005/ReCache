// publisher.js
const net = require('net');

const client = net.createConnection({ port: 8001, host: '127.0.0.1' }, () => {
  console.log('✅ Publisher connected');

  // Wait 5 seconds, then publish to 'news' channel
  setTimeout(() => {
    const message = 'Breaking News!';
    const publishCommand = `*3\r\n$7\r\nPUBLISH\r\n$4\r\nnews\r\n$${message.length}\r\n${message}\r\n`;
    client.write(publishCommand);
    console.log(`📢 Published to channel 'news': "${message}"`);
  }, 5000);
});

client.on('data', data => {
  console.log('📥 Server response:', data.toString());
});

client.on('end', () => {
  console.log('🔌 Publisher disconnected');
});
