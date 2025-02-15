const net = require('net');
const fs = require('fs');
const Parser = require('redis-parser');

const store = {};//hashmap to store key value pairs
const expiryTimes = {}; // Store expiry times
const lists = {}; // Store lists separately
const DATA_FILE = './data.json'; // File to persist data


// 🔹 Load Data from File (if exists)
if (fs.existsSync(DATA_FILE)) {
    try {
        const rawData = fs.readFileSync(DATA_FILE, 'utf8');
        const parsedData = JSON.parse(rawData);
        store.keyValues = parsedData.keyValues || {};
        store.lists = parsedData.lists || {};
        console.log('✅ Data loaded from persistent storage.');
    } catch (error) {
        console.error('❌ Error loading data:', error);
    }
}

// 🔹 Function to Save Data Periodically
function saveData() {
    fs.writeFileSync(DATA_FILE, JSON.stringify(store, null, 2));
    console.log('💾 Data saved to persistent storage.');
}

setInterval(saveData, 20000); // Save data every 20 seconds


const server = net.createServer(connection => {
    console.log('Client connected...');

    let inTransaction = false; // Track if the client is in a transaction
    let transactionQueue = []; // Queue to store commands during a transaction

    connection.on('data', data => {
        const parser = new Parser({
            returnReply: (reply) => {
                console.log('Parsed Command:', reply); // Log the parsed array
                const command = reply[0].toLowerCase(); // Ensure command is case-insensitive

                switch (command) {
                    case 'set': {
                        const key = reply[1];
                        const value = reply[2];
                        store[key] = value; // Store the key-value pair
                        // Check if an expiration time is provided
                        if (reply.length > 3 && reply[3].toLowerCase() === 'expire') {
                            const ttl = parseInt(reply[4], 10);
                            if (!isNaN(ttl)) {
                                expiryTimes[key] = Date.now() + ttl * 1000;
                                setTimeout(() => handleExpiry(key), ttl * 1000);
                            }
                        }

                        connection.write('+OK\r\n'); // Respond with success
                        break;
                    }
                    case 'get': {
                        const key = reply[1];
                        if (expiryTimes[key] && Date.now() >= expiryTimes[key]) {
                            handleExpiry(key);
                        }
                        const value = store[key]; // Fetch the value
                        if (value === undefined) {
                            connection.write('$-1\r\n'); // Key not found
                        } else {
                            connection.write(`$${value.length}\r\n${value}\r\n`); // Return value
                        }
                        break;
                    }
                    //expiry logic
                    case 'expire': {
                        const key = reply[1];
                        const ttl = parseInt(reply[2], 10);
                        if (!store[key]) {
                            connection.write(':0\r\n'); // Key does not exist
                        } else {
                            expiryTimes[key] = Date.now() + ttl * 1000;
                            setTimeout(() => delete store[key], ttl * 1000);
                            connection.write(':1\r\n'); // Success
                        }
                        break;
                    }

                    //ttl logic
                    case 'ttl': {
                        const key = reply[1];
                        if (!store[key]) {
                            connection.write(':-2\r\n'); // Key does not exist
                        } else if (!expiryTimes[key]) {
                            connection.write(':-1\r\n'); // No expiry set
                        } else {
                            const remaining = Math.ceil((expiryTimes[key] - Date.now()) / 1000);
                            connection.write(`:${remaining}\r\n`);
                        }
                        break;
                    }

                    //delete
                    case 'del': {
                        const key = reply[1];
                        if (store[key]) {
                            delete store[key];
                            delete expiryTimes[key]; // Remove expiry if set
                            connection.write(':1\r\n'); // Key deleted
                        } else {
                            connection.write(':0\r\n'); // Key not found
                        }
                        break;
                    }

                    case 'incr': {
                        const key = reply[1];
                        if (!(key in store)) store[key] = "0"; // Default to 0 if key does not exist
                        if (isNaN(store[key])) {
                            connection.write(`-ERR value is not an integer\r\n`);
                        } else {
                            store[key] = (parseInt(store[key], 10) + 1).toString();
                            connection.write(`:${store[key]}\r\n`);
                        }
                        break;
                    }

                    case 'decr': {
                        const key = reply[1];
                        if (!store[key]) store[key] = '0';
                        store[key] = (parseInt(store[key], 10) - 1).toString();
                        connection.write(`:${store[key]}\r\n`);
                        break;
                    }

                    case 'lpush': {
                        const key = reply[1];
                        const values = reply.slice(2); // Extract all values to be pushed
                    
                        if (!lists[key]) lists[key] = []; // Ensure list exists
                        lists[key].unshift(...values); // Prepend values to the list
                    
                        console.log(`Updated List [${key}]:`, lists[key]); // Debugging
                    
                        connection.write(`:${lists[key].length}\r\n`); // Return new length
                        break;
                    }
                    
                    
                    case 'rpush': {
                        const key = reply[1];
                        const values = reply.slice(2); // Extract all values to be pushed
                    
                        if (!lists[key]) lists[key] = []; // Ensure list exists
                        lists[key].push(...values); // Append values to the list
                    
                        console.log(`Updated List [${key}]:`, lists[key]); // Debugging
                    
                        connection.write(`:${lists[key].length}\r\n`); // Return new length
                        break;
                    }

                    case 'lpop': {
                        const key = reply[1];
                        if (!lists[key] || lists[key].length === 0) {
                            connection.write('$-1\r\n');
                        } else {
                            const value = lists[key].shift();
                            connection.write(`$${value.length}\r\n${value}\r\n`);
                        }
                        break;
                    }
                    
                    case 'rpop': {
                        const key = reply[1];
                        if (!lists[key] || lists[key].length === 0) {
                            connection.write('$-1\r\n');
                        } else {
                            const value = lists[key].pop();
                            connection.write(`$${value.length}\r\n${value}\r\n`);
                        }
                        break;
                    }
                    
                    case 'lrange': {
                        const key = reply[1];
                        const start = parseInt(reply[2], 10);
                        const end = parseInt(reply[3], 10);
                    
                        if (!lists[key] || lists[key].length === 0) {
                            connection.write('*0\r\n'); // Return empty list if key does not exist
                            break;
                        }
                    
                        // Handle negative indices (like Redis)
                        const listLength = lists[key].length;
                        const normalizedStart = start < 0 ? Math.max(listLength + start, 0) : Math.min(start, listLength - 1);
                        const normalizedEnd = end < 0 ? Math.max(listLength + end, 0) : Math.min(end, listLength - 1);
                    
                        // If start > end, return an empty list
                        if (normalizedStart > normalizedEnd) {
                            connection.write('*0\r\n');
                            break;
                        }
                    
                        // Get the range of elements
                        const range = lists[key].slice(normalizedStart, normalizedEnd + 1);
                    
                        console.log(`LRANGE ${key} ${start} ${end}:`, range); // Debugging
                    
                        // Send the response in Redis protocol format
                        connection.write(`*${range.length}\r\n`);
                        range.forEach(item => connection.write(`$${item.length}\r\n${item}\r\n`));
                        break;
                    }
                    case 'multi': {
                        console.log('Starting transaction...multi');
                        inTransaction = true;
                        transactionQueue = []; // Reset the transaction queue
                        connection.write('+OK\r\n'); // Acknowledge MULTI command
                        break;
                    }
                    case 'exec': {
                        if (!inTransaction) {
                            connection.write('-ERR EXEC without MULTI\r\n');
                            return;
                        }

                        // Execute all queued commands atomically
                        const results = [];
                        for (const cmd of transactionQueue) {
                            const result = executeCommand(cmd, connection);
                            results.push(result);
                        }

                        // Reset transaction state
                        inTransaction = false;
                        transactionQueue = [];

                        // Send the results of the executed commands
                        connection.write(`*${results.length}\r\n`);
                        results.forEach(result => connection.write(`${result}\r\n`));
                        break;
                    }
                    case 'discard': {
                        if (!inTransaction) {
                            connection.write('-ERR DISCARD without MULTI\r\n');
                            return;
                        }

                        // Discard all queued commands
                        inTransaction = false;
                        transactionQueue = [];
                        connection.write('+OK\r\n');
                        break;
                    }
                    
                    
                    
                    default: {
                        if (inTransaction) {
                            // Queue the command for later execution
                            transactionQueue.push(reply);
                            connection.write('+QUEUED\r\n');
                        } else {
                            // Execute the command immediately
                            executeCommand(reply, connection);
                        }
                        break;
                    }
                }
            },
            returnError: (err) => {
                console.error('Redis Protocol Error:', err);
                connection.write(`-ERR ${err.message}\r\n`); // Respond with error
            }
        });

        parser.execute(data); // Parse the input data

        connection.on('end', () => {
            Object.keys(subscriptions).forEach(channel => {
                subscriptions[channel] = subscriptions[channel].filter(sub => sub !== connection);
            });
        });

        
    });
});
   
// 🔥 Function to handle key expiration and notify subscribers
function handleExpiry(key) {
    if (store[key]) {
        delete store[key];
        delete expiryTimes[key];
        notifySubscribers(`__keyevent@0__:expired`, key);
    }
}

// 🔔 Notify all subscribed clients about expired keys
function notifySubscribers(channel, key) {
    if (subscriptions[channel]) {
        subscriptions[channel].forEach(sub => {
            sub.write(`+Expired Key: ${key}\r\n`);
        });
    }
}

// Background process to remove expired keys
setInterval(() => {
    const now = Date.now();
    Object.keys(expiryTimes).forEach((key) => {
        if (now >= expiryTimes[key]) {
            handleExpiry(key);
        }
    });
}, 1000); // Check every second

// 🔹 Function to Execute Commands
function executeCommand(reply, connection) {
    const command = reply[0].toLowerCase();
    const args = reply.slice(1); // Extract arguments

    switch (command) {
        case 'set': {
            const key = args[0];
            const value = args[1];
            store[key] = value; // Store the key-value pair
            // Check if an expiration time is provided
            if (args.length > 2 && args[2].toLowerCase() === 'expire') {
                const ttl = parseInt(args[3], 10);
                if (!isNaN(ttl)) {
                    expiryTimes[key] = Date.now() + ttl * 1000;
                    setTimeout(() => handleExpiry(key), ttl * 1000);
                }
            }
            return '+OK';
        }
        case 'get': {
            const key = args[0];
            if (expiryTimes[key] && Date.now() >= expiryTimes[key]) {
                handleExpiry(key);
            }
            const value = store[key]; // Fetch the value
            if (value === undefined) {
                return '$-1'; // Key not found
            } else {
                return `$${value.length}\r\n${value}`; // Return value
            }
        }
        case 'multi': {
            console.log('Starting transaction...multi');
            inTransaction = true;
            transactionQueue = []; // Reset the transaction queue
            return '+OK';
        }
        case 'exec': {
            if (!inTransaction) {
                return '-ERR EXEC without MULTI';
            }

            // Execute all queued commands atomically
            const results = [];
            for (const cmd of transactionQueue) {
                const result = executeCommand(cmd, connection);
                results.push(result);
            }

            // Reset transaction state
            inTransaction = false;
            transactionQueue = [];

            // Send the results of the executed commands
            let response = `*${results.length}\r\n`;
            results.forEach(result => response += `${result}\r\n`);
            return response.trim();
        }
        case 'discard': {
            if (!inTransaction) {
                return '-ERR DISCARD without MULTI';
            }

            // Discard all queued commands
            inTransaction = false;
            transactionQueue = [];
            return '+OK';
        }
        // Add other command cases (e.g., EXPIRE, TTL, DEL, INCR, DECR, LPUSH, RPUSH, LPOP, RPOP, LRANGE) here...
        default: {
            return `-ERR Unknown command '${command}'`;
        }
    }
}

server.listen(8001, () => console.log('Custom Redis Server running on port 8001'));

// in diff terminal run node index.js
//redis-cli -p 8000  - staring server (under root folder) another terminal 
//redis-cli for actual client


