import React from 'react';
import ReactDOM from 'react-dom/client';
import CalendarWindow from './components/desktopWidget/CalendarWindow';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <CalendarWindow />
  </React.StrictMode>
);
