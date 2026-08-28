import React from 'react';
import ReactDOM from 'react-dom/client';
import DesktopCalendarWidget from './components/desktopWidget/DesktopCalendarWidget';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <DesktopCalendarWidget />
  </React.StrictMode>
);
