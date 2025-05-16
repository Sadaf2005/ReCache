# ReCache: A Custom Redis Server

![ReCache Logo/Banner (Optional)]

## Project Overview

This project, ReCache, is a custom implementation of a Redis-like in-memory data structure store built using **Node.js**. It provides a lightweight, in-memory key-value store designed to replicate some of the core functionalities and behaviors of the popular open-source Redis server. The goal is to offer a deeper understanding of how such high-performance data stores work, while being simple, extensible, and easy to use for learning, testing, or lightweight applications.

## 🚀 Features

ReCache is under active development and currently supports a range of fundamental Redis-like features:

* **GET & SET:** Store and retrieve key-value pairs.
* **INCR & DECR:** Perform atomic increment and decrement operations on numeric values.
* **Lists (LPUSH, RPUSH, LPOP, RPOP, LRANGE):** Implement list operations for managing ordered sequences of elements, suitable for queue-like behaviors.
* **EXPIRE & TTL:** Set a time-to-live (TTL) for keys, allowing for automatic expiration.
* **DEL:** Remove keys and their associated values from storage.
* **Persistence:** Data is saved inside a Docker container for basic durability.
* **Transaction Support (MULTI, EXEC, DISCARD):** (Planned) Support for atomic execution of command batches.
* **Pub/Sub:** (Coming Soon) A real-time messaging system for publish/subscribe functionality.

## Motivation

The primary motivations behind building ReCache include:

* **Educational Purposes:** To gain a comprehensive understanding of the internal workings of an in-memory data store like Redis, including network programming, data structure management, and protocol implementation.
* **Exploring Performance:** To experiment with different implementation techniques and data structures in Node.js to understand their impact on performance.
* **Customization and Specialization:** To create a base for building a data store with specific optimizations or features not present in the standard Redis.
* **Skill Development:** To enhance skills in Node.js development, network programming, and understanding database internals.

## Tech Stack

ReCache is built using the following technologies:

* **Core Programming Language:** Node.js
* **Protocol Parsing:** Likely utilizes a library like `redis-parser` for handling the Redis Serialization Protocol (RESP).
* **Data Structures:** Custom or built-in Node.js data structures for key-value storage and list implementations.
* **Networking:** Node.js's built-in networking modules for handling TCP connections.

## 📦 Setup & Installation

To get a local copy of ReCache up and running, follow these steps:

1. **Clone the Repository:**

   ```bash
   git clone https://github.com/Sadaf2005/ReCache.git
   ```

2. **Navigate to the project directory:**

   ```bash
   cd ReCache
   ```

3. **Install Dependencies:**
   *(Assuming a `package.json` with dependencies)*

   ```bash
   npm install
   # or yarn install
   ```

4. **Start the ReCache Server:**
   Run the server in one terminal:

   ```bash
   node index.js
   ```
   The server should start and listen on port `8001`.

5. **Start a Docker Container for Persistence (Optional but Recommended):**
   Ensure Docker is installed, then build your Docker image (if you haven't already, based on a provided Dockerfile in the repo) and run:

   ```bash
   docker build -t recache-image . # Build the image if a Dockerfile exists
   docker run --name recache-container -v $(pwd)/data:/data -d recache-image
   ```
   (Replace `recache-image` with your actual image name if different.)

   To restart the container after stopping it:

   ```bash
   docker start recache-container
   ```

## Quick Guide to Test the Server

You can connect to the ReCache server using the `redis-cli` tool (assuming you have it installed) or other compatible Redis clients.

Open another terminal and run:

```bash
redis-cli -p 8001
```

### Supported Commands

#### Basic Commands
```
127.0.0.1:8001> SET mykey "Hello, World!"
+OK
127.0.0.1:8001> GET mykey
$13
Hello, World!
127.0.0.1:8001> DEL mykey
:1
127.0.0.1:8001> SET counter 10
+OK
127.0.0.1:8001> INCR counter
:11
127.0.0.1:8001> DECR counter
:10
```

#### List Commands
```
127.0.0.1:8001> LPUSH mylist "item1"
:1
127.0.0.1:8001> RPUSH mylist "item2"
:2
127.0.0.1:8001> LPOP mylist
$5
item1
127.0.0.1:8001> RPOP mylist
$5
item2
127.0.0.1:8001> LRANGE mylist 0 -1
*0
```

#### Expiry Commands
```
127.0.0.1:8001> SET tempkey "tempvalue"
+OK
127.0.0.1:8001> EXPIRE tempkey 10
:1
127.0.0.1:8001> TTL tempkey
:8
```

#### Transaction Commands (If Implemented)
```
127.0.0.1:8001> MULTI
+OK
127.0.0.1:8001> SET key1 "value1"
+QUEUED
127.0.0.1:8001> INCR counter
+QUEUED
127.0.0.1:8001> EXEC
*2
+OK
:11
127.0.0.1:8001> MULTI
+OK
127.0.0.1:8001> SET key2 "value2"
+QUEUED
127.0.0.1:8001> DISCARD
+OK
```

## Future Enhancements

The following features are planned for future development:

* Support for more data types (e.g., sets, hashes, sorted sets)
* Implement clustering for horizontal scaling
* Add authentication and security features
* Optimize performance and add benchmarking
* Full implementation of Pub/Sub

## Contributing

Contributions to ReCache are welcome! If you find bugs, have suggestions for improvements, or want to add new features, feel free to:

1. Fork the repository
2. Create a new branch (`git checkout -b feature/your-feature`)
3. Make your changes
4. Commit your changes (`git commit -am 'Add some feature'`)
5. Push to the branch (`git push origin feature/your-feature`)
6. Create a new Pull Request

Please ensure your code adheres to any existing coding styles and includes appropriate tests if applicable.

## License

This project is licensed under the MIT License. See the LICENSE file for details.

## Acknowledgments

* Inspired by the official Redis project
* Built using Node.js and potentially the `redis-parser` library *(Confirm library usage from code)*

## Connect with Me

* GitHub: [Your GitHub Username]
* LinkedIn: [Your LinkedIn Profile URL]
* Email: [Your Email Address]