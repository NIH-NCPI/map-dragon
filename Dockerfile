# Use an official Node.js runtime as the base image
FROM node:18-alpine

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json (if you have it)
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of your application code
COPY . .

# Build your React app for production
RUN npm run build

# Expose the port your app will run on (usually 3000 for React)
EXPOSE 3000

# Start your app using a production-ready server like serve
CMD ["npm", "run", "build"]