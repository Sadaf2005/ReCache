Custom Redis Server Introduction This project is a custom implementation
of a Redis-like server built using Node.js. It provides a lightweight,
in-memory key-value store with support for basic Redis commands,
transactions, expiry, and persistence. The server is designed to be
simple, extensible, and easy to use, making it a great tool for
learning, testing, or lightweight applications.

🚀 Features GET & SET -- Store and retrieve key-value pairs INCR & DECR
-- Atomic increment and decrement operations Lists (LPUSH, RPUSH, LPOP,
RPOP, LRANGE) -- List operations for queue-like behavior EXPIRE & TTL --
Time-to-live (TTL) for automatic key expiration DEL -- Remove keys from
storage Persistence -- Data is saved inside a Docker container for
durability Transaction Support -- MULTI, EXEC, and DISCARD for atomic
operations (Planned) Pub/Sub (Coming Soon) -- Real-time messaging system

📦 Setup & Installation 1️⃣ Clone the Repository Plain text ANTLR4 Bash C
C# CSS CoffeeScript CMake Dart Django Docker EJS Erlang Git Go GraphQL
Groovy HTML Java JavaScript JSON JSX Kotlin LaTeX Less Lua Makefile
Markdown MATLAB Markup Objective-C Perl PHP PowerShell .properties
Protocol Buffers Python R Ruby Sass (Sass) Sass (Scss) Scheme SQL Shell
Swift SVG TSX TypeScript WebAssembly YAML XML

shCopyEditgit clone https://github.com/yourusername/redix.git cd redix

2️⃣ Start the Redix Server Run the server in one terminal: Plain text
ANTLR4 Bash C C# CSS CoffeeScript CMake Dart Django Docker EJS Erlang
Git Go GraphQL Groovy HTML Java JavaScript JSON JSX Kotlin LaTeX Less
Lua Makefile Markdown MATLAB Markup Objective-C Perl PHP PowerShell
.properties Protocol Buffers Python R Ruby Sass (Sass) Sass (Scss)
Scheme SQL Shell Swift SVG TSX TypeScript WebAssembly YAML XML

shCopyEditnode index.js

3️⃣ Start a Docker Container for Persistence Ensure Docker is installed,
then run: Plain text ANTLR4 Bash C C# CSS CoffeeScript CMake Dart Django
Docker EJS Erlang Git Go GraphQL Groovy HTML Java JavaScript JSON JSX
Kotlin LaTeX Less Lua Makefile Markdown MATLAB Markup Objective-C Perl
PHP PowerShell .properties Protocol Buffers Python R Ruby Sass (Sass)
Sass (Scss) Scheme SQL Shell Swift SVG TSX TypeScript WebAssembly YAML
XML

shCopyEditdocker run --name redix-container -v \$(pwd)/data:/data -d
redix-image

(Replace redix-image with your actual image name.) To restart the
container after stopping it: Plain text ANTLR4 Bash C C# CSS
CoffeeScript CMake Dart Django Docker EJS Erlang Git Go GraphQL Groovy
HTML Java JavaScript JSON JSX Kotlin LaTeX Less Lua Makefile Markdown
MATLAB Markup Objective-C Perl PHP PowerShell .properties Protocol
Buffers Python R Ruby Sass (Sass) Sass (Scss) Scheme SQL Shell Swift SVG
TSX TypeScript WebAssembly YAML XML

shCopyEditdocker start redix-container

4️⃣ Connect a Custom Redis Client Open another terminal and run: Plain
text ANTLR4 Bash C C# CSS CoffeeScript CMake Dart Django Docker EJS
Erlang Git Go GraphQL Groovy HTML Java JavaScript JSON JSX Kotlin LaTeX
Less Lua Makefile Markdown MATLAB Markup Objective-C Perl PHP PowerShell
.properties Protocol Buffers Python R Ruby Sass (Sass) Sass (Scss)
Scheme SQL Shell Swift SVG TSX TypeScript WebAssembly YAML XML

shCopyEditredis-cli -p 8001

Quick Guide to Test the Server Basic Commands bashCopy127.0.0.1:8000\>
SET mykey "Hello, World!"+OK bashCopy127.0.0.1:8000\> GET
mykey\$13Hello, World! bashCopy127.0.0.1:8000\> DEL mykey:1
bashCopy127.0.0.1:8000\> SET counter 10+OK127.0.0.1:8000\> INCR
counter:11 bashCopy127.0.0.1:8000\> DECR counter:10

List Commands bashCopy127.0.0.1:8000\> LPUSH mylist
"item1":1127.0.0.1:8000\> RPUSH mylist "item2":2
bashCopy127.0.0.1:8000\> LPOP mylist\$5item1127.0.0.1:8000\> RPOP
mylist\$5item2 bashCopy127.0.0.1:8000\> LRANGE mylist 0 -1\*0

Expiry Commands bashCopy127.0.0.1:8000\> SET tempkey
"tempvalue"+OK127.0.0.1:8000\> EXPIRE tempkey 10:1
bashCopy127.0.0.1:8000\> TTL tempkey:8

Transaction Commands bashCopy127.0.0.1:8000\> MULTI+OK
bashCopy127.0.0.1:8000\> SET key1 "value1"+QUEUED127.0.0.1:8000\> INCR
counter+QUEUED bashCopy127.0.0.1:8000\> EXEC\*2+OK:11
bashCopy127.0.0.1:8000\> MULTI+OK127.0.0.1:8000\> SET key2
"value2"+QUEUED127.0.0.1:8000\> DISCARD+OK

Future Enhancements Support for more data types (e.g., sets, hashes,
sorted sets). Implement clustering for horizontal scaling. Add
authentication and security features. Optimize performance and add
benchmarking.

Contributing Contributions are welcome! If you'd like to contribute,
please follow these steps: Fork the repository. Create a new branch for
your feature or bugfix. Submit a pull request with a detailed
description of your changes.

License This project is licensed under the MIT License. See
the LICENSE file for details. Acknowledgments Inspired by the
official Redis project. Built using Node.js and
the redis-parser library.

Connect with Me GitHub: your-username LinkedIn: Your Name
Email: your.email@example.co
