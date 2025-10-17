import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './main.css'
import App from './App.jsx'

import { initOnColors, watchThemeAttribute } from "./theme/Contrast.js";

// 1) Initialize readable on-colors (will also nudge bg tokens toward contrast if needed)
initOnColors({ target: 4.5, mutateBg: true });

// 2) Recalculate when you change data-theme (if you use a dark theme toggle)
watchThemeAttribute("data-theme", { target: 4.5, mutateBg: true });



createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
