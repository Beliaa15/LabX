# React Web Application

A modern React application with authentication, routing, and a clean UI structure.

## Features

- **Authentication System**: Complete authentication flow with login, signup, and protected routes
- **Modern UI Components**: Clean, responsive UI components built with modern design principles
- **Routing**: React Router v6 with protected routes
- **API Integration**: Axios-based service layer for API interactions
- **State Management**: Context API for global state management
- **Form Handling**: Simple form handling with validation

## Project Structure

```
frontend/
├── public/
├── src/
│   ├── components/
│   │   ├── Auth/           # Authentication components
│   │   ├── Common/         # Shared components
│   │   ├── Pages/          # Page components
│   │   └── ui/             # UI components
│   ├── context/            # React Context providers
│   ├── lib/                # Utility libraries
│   ├── services/           # API services
│   └── utils/              # Utility functions
├── .env                    # Environment variables
├── package.json
└── README.md
```

## Getting Started

### Prerequisites

- Node.js (v14 or later)
- npm or yarn

### Installation

1. Clone this repository
2. Install dependencies:

```bash
npm install
# or
yarn install
```

3. Create a `.env` file in the root directory with the following variables:

```
REACT_APP_API_URL=http://localhost:5000/api
```

4. Start the development server:

```bash
npm start
# or
yarn start
```

## Development Mode

For development without a backend, the application uses mock data. To test the login functionality, use:
- Email: `test@example.com`
- Password: `password`

## Customization

### API Configuration

Update the API base URL in `src/services/authService.js`:

```javascript
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
```

### Authentication

The authentication system is built using React Context. You can customize the authentication logic in `src/context/AuthContext.js`.

### Styling

The application uses plain CSS with utility classes. You can easily integrate with CSS frameworks like Tailwind CSS, Material UI, or styled-components.

## Deployment

To build the application for production:

```bash
npm run build
# or
yarn build
```

This will create a `build` directory with optimized production files.