# Stage 1: Build the React app
FROM node:18-alpine as build

ENV HOST 0.0.0.0

# Copy the package.json and package-lock.json files
COPY package*.json ./

# Install the dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Build the React app
RUN npm run build || (echo "Build failed! Check the logs for more details." && exit 1)

# Stage 2: Serve the React app
FROM nginx:alpine

# Copy the build output to the Nginx html directory
COPY --from=build ./dist /usr/share/nginx/html

# Expose port 8080
EXPOSE 8080


# Start Nginx
CMD ["nginx", "-g", "daemon off;"]

