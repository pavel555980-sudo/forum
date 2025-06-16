import React, { useState } from 'react';
import ReactDOM from 'react-dom/client'
import { Toaster } from 'react-hot-toast';
import './styles/index.css'
import App from './App'
import customToastStyle from './ToasterCustom';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
      <App/>
      <Toaster toastOptions={customToastStyle}/>
      
  </React.StrictMode>,
)
