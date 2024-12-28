# My React Babylon App

This project is a React application that demonstrates how to render a Babylon.js scene using React components.

## Project Structure

```
my-react-babylon-app
├── public
│   ├── index.html          # Main HTML file
├── src
│   ├── App.tsx            # Main application component
│   ├── index.tsx          # Entry point of the application
│   └── babylon
│       └── BabylonScene.tsx # Component that renders the Babylon.js scene
├── package.json            # Yarn package configuration
├── tsconfig.json           # TypeScript configuration
└── README.md               # Project documentation
```

## Setup Instructions

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd my-react-babylon-app
   ```

2. **Install dependencies:**
   ```bash
   yarn install
   ```

3. **Run the application:**
   ```bash
   yarn start
   ```

4. **Open your browser:**
   Navigate to `http://localhost:3000` to view the application.

## Usage

The application initializes a Babylon.js scene and renders it within a React component. You can modify the `BabylonScene.tsx` file to customize the scene, add objects, and change the rendering settings.

## Dependencies

- React
- ReactDOM
- Babylon.js

## License

This project is licensed under the MIT License.