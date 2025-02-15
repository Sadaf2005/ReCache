const net = require('net');
const fs = require('fs');
const Parser = require('redis-parser');

const store = {}; // Key-value store
const expiryTimes = {}; // Expiry tracking
const lists = {}; // Lists store
const sets = {}; // Sets store
const subscriptions = {}; // Pub/Sub system
const DATA_FILE = './data.json'; // File for persistence

// Load Data from File
if (fs.existsSync(DATA_FILE)) {
    try {
        const rawData = fs.readFileSync(DATA_FILE, 'utf8');
        Object.assign(store, JSON.parse(rawData));
        console.log('✅ Data loaded from persistent storage.');
    } catch (error) {
        console.error('❌ Error loading data:', error);
    }
}

// Save Data Periodically
setInterval(() => {
    fs.writeFileSync(DATA_FILE, JSON.stringify(store, null, 2));
    console.log('💾 Data saved to persistent storage.');
}, 20000);

// Command Handlers
const commands = {
    set: (args, connection) => {
        const [key, value, option, ttl] = args;
        store[key] = value;
        if (option?.toLowerCase() === 'expire' && !isNaN(parseInt(ttl, 10))) {
            expiryTimes[key] = Date.now() + parseInt(ttl, 10) * 1000;
            setTimeout(() => handleExpiry(key), parseInt(ttl, 10) * 1000);
        }
        connection.write('+OK\r\n');
    },

    get: (args, connection) => {
        const key = args[0];
        if (expiryTimes[key] && Date.now() >= expiryTimes[key]) handleExpiry(key);
        const value = store[key];
        connection.write(value ? `$${value.length}\r\n${value}\r\n` : '$-1\r\n');
    },

    expire: (args, connection) => {
        const [key, ttl] = args;
        if (!store[key]) return connection.write(':0\r\n');
        expiryTimes[key] = Date.now() + parseInt(ttl, 10) * 1000;
        setTimeout(() => handleExpiry(key), parseInt(ttl, 10) * 1000);
        connection.write(':1\r\n');
    },

    ttl: (args, connection) => {
        const key = args[0];
        if (!store[key]) return connection.write(':-2\r\n');
        if (!expiryTimes[key]) return connection.write(':-1\r\n');
        connection.write(`:${Math.ceil((expiryTimes[key] - Date.now()) / 1000)}\r\n`);
    },

    del: (args, connection) => {
        const key = args[0];
        if (store[key]) {
            delete store[key];
            delete expiryTimes[key];
            connection.write(':1\r\n');
        } else {
            connection.write(':0\r\n');
        }
    },

    incr: (args, connection) => {
        const key = args[0];
        store[key] = store[key] ? (parseInt(store[key], 10) + 1).toString() : '1';
        connection.write(`:${store[key]}\r\n`);
    },

    decr: (args, connection) => {
        const key = args[0];
        store[key] = store[key] ? (parseInt(store[key], 10) - 1).toString() : '-1';
        connection.write(`:${store[key]}\r\n`);
    },

    lpush: (args, connection) => {
        const key = args[0];
        if (!lists[key]) lists[key] = [];
        lists[key].unshift(...args.slice(1));
        connection.write(`:${lists[key].length}\r\n`);
    },

    rpush: (args, connection) => {
        const key = args[0];
        if (!lists[key]) lists[key] = [];
        lists[key].push(...args.slice(1));
        connection.write(`:${lists[key].length}\r\n`);
    },

    lpop: (args, connection) => {
        const key = args[0];
        if (!lists[key] || lists[key].length === 0) return connection.write('$-1\r\n');
        const value = lists[key].shift();
        connection.write(`$${value.length}\r\n${value}\r\n`);
    },

    rpop: (args, connection) => {
        const key = args[0];
        if (!lists[key] || lists[key].length === 0) return connection.write('$-1\r\n');
        const value = lists[key].pop();
        connection.write(`$${value.length}\r\n${value}\r\n`);
    },

    sadd: (args, connection) => {
        const key = args[0];
        if (!sets[key]) sets[key] = new Set();
        args.slice(1).forEach(member => sets[key].add(member));
        connection.write(`:${sets[key].size}\r\n`);
    },

    srem: (args, connection) => {
        const key = args[0];
        if (!sets[key]) return connection.write(':0\r\n');
        let count = 0;
        args.slice(1).forEach(member => {
            if (sets[key].delete(member)) count++;
        });
        connection.write(`:${count}\r\n`);
    },

    smembers: (args, connection) => {
        const key = args[0];
        if (!sets[key]) return connection.write('*0\r\n');
        const members = Array.from(sets[key]);
        connection.write(`*${members.length}\r\n`);
        members.forEach(member => connection.write(`$${member.length}\r\n${member}\r\n`));
    },

    sismember: (args, connection) => {
        const key = args[0];
        connection.write(sets[key]?.has(args[1]) ? ':1\r\n' : ':0\r\n');
    }
};

// Handle Key Expiry
function handleExpiry(key) {
    if (store[key]) {
        delete store[key];
        delete expiryTimes[key];
        notifySubscribers(`__keyevent@0__:expired`, key);
    }
}

// Notify Subscribers
function notifySubscribers(channel, key) {
    if (subscriptions[channel]) {
        subscriptions[channel].forEach(sub => sub.write(`+Expired Key: ${key}\r\n`));
    }
}

// Background Expiry Check
setInterval(() => {
    const now = Date.now();
    Object.keys(expiryTimes).forEach((key) => {
        if (now >= expiryTimes[key]) handleExpiry(key);
    });
}, 1000);

// Server Setup
const server = net.createServer(connection => {
    console.log('Client connected...');

    const parser = new Parser({
        returnReply: (reply) => {
            console.log('Parsed Command:', reply);
            const command = reply[0].toLowerCase();
            const args = reply.slice(1);

            if (commands[command]) {
                commands[command](args, connection);
            } else {
                connection.write(`-ERR Unknown command '${command}'\r\n`);
            }
        },
        returnError: (err) => {
            console.error('Redis Protocol Error:', err);
            connection.write(`-ERR ${err.message}\r\n`);
        }
    });

    connection.on('data', data => parser.execute(data));
    
    connection.on('end', () => {
        Object.keys(subscriptions).forEach(channel => {
            subscriptions[channel] = subscriptions[channel].filter(sub => sub !== connection);
        });
    });
});

server.listen(8001, () => console.log('Custom Redis Server running on port 8001'));
