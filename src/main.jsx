import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App';
import './index.css';

// Awtomatikong nililikha ang root ng React application at ini-render ang App component sa loob ng StrictMode para sa karagdagang checks
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
