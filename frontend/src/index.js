import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import 'react-toastify/dist/ReactToastify.css';
import './index.css'; // Make sure this line is present

const root = createRoot(document.getElementById('root'));
root.render(
    //<React.StrictMode>
        <App />
    //</React.StrictMode>
);
