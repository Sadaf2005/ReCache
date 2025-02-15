# Use the official Node.js image as the base
FROM node:18

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json (for dependency installation)
COPY package.json package-lock.json ./

# Install Node.js dependencies
RUN npm install

# Copy all project files into the container
COPY . .

# Expose port 8000 for external access
EXPOSE 8000

# Start the Redis server when the container runs
CMD ["node", "index.js"]

#592a7aeb25a03a604f8a5994445996550f80756f3c686c3266476f56d8ff2a33  after image is formed.
