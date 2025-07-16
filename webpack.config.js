const path = require('path');

module.exports = {
  // Set mode to 'development' for better debugging and no minification
  mode: 'development',

  // Entry point of your application (adjust based on your setup)
  entry: './src/index.js',

  // Output configuration for bundled files
  output: {
    filename: 'bundle.js', // Name of the output file
    path: path.resolve(__dirname, 'dist'),
  },

  // Disable minification in development mode
  optimization: {
    minimize: false, // Disables the minification of the output
  },

  // Configuration for module resolution (if needed)
  module: {
    rules: [
      {
        test: /\.js$/, // Applies to JavaScript files
        exclude: /node_modules/, // Exclude node_modules folder
        use: 'babel-loader', // Use Babel for transpiling
      },
      // You can add other loaders here for CSS, images, etc.
    ],
  },

  // Development server configuration (optional)
  devServer: {
    contentBase: path.join(__dirname, 'dist'), // Serve files from the 'dist' directory
    compress: true,
    port: 9000, // Port number for local development server
  },

  // Source map configuration for easier debugging (optional)
  devtool: 'source-map', // This generates source maps to help debug minified code
};
