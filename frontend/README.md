# Baat Chit Frontend

Frontend application for the Baat Chit video calling app.

## Features

- Modern glassmorphism UI design
- WebRTC video calling interface
- Real-time chat functionality
- Responsive design
- User authentication interface
- Room creation and joining
- Multi-user conference support

## Setup

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm start
```

The frontend will be served on `http://localhost:8080`

## Configuration

The frontend connects to the backend server at `http://localhost:3000` by default. This can be changed in `public/js/utils/constants.js`:

```javascript
export const CONFIG = {
    BACKEND_URL: 'http://localhost:3000',
    // ... other config
};
```

## File Structure

- `public/` - Static files served by the web server
  - `index.html` - Main application page
  - `auth.html` - Authentication page
  - `history.html` - Call history page
  - `css/` - Stylesheets
  - `js/` - JavaScript modules
    - `modules/` - Core application modules
    - `utils/` - Utility functions and constants

## Usage

1. Make sure the backend server is running on port 3000
2. Start the frontend server
3. Navigate to `http://localhost:8080`
4. Register or login to access the video calling features