# Stage 1: Build the React app
FROM node:lts-alpine as builder


# Copy the package.json and package-lock.json files
COPY package*.json ./

# Install the dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Build the React app
RUN npm run build

# Stage 2: Serve the React app
FROM nginx:alpine

# Copy the build output to the Nginx html directory
COPY --from=build ./dist /usr/share/nginx/html

# Expose port 8080
EXPOSE 8080

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]

