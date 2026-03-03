# Stage 1: Build the React frontend
FROM node:18-alpine as builder

# Set working directory for frontend
WORKDIR /app/client
# Copy package files and install dependencies
COPY client/package*.json ./
RUN npm install
# Copy the rest of the frontend code and build it
COPY client/ ./
# Set API URL to point to the same origin since we will serve it from the backend
ENV VITE_API_URL=/api
RUN npm run build

# Stage 2: Setup the Node.js backend
FROM node:18-alpine

WORKDIR /app/server
# Copy backend package files and install dependencies
COPY server/package*.json ./
RUN npm install --production

# Copy backend source code
COPY server/index.js ./

# Create a directory for projects
RUN mkdir -p /app/projects

# Copy the built frontend from the builder stage
COPY --from=builder /app/client/dist /app/client/dist

# Expose the backend port
EXPOSE 3001

# Start the server
CMD ["node", "index.js"]
