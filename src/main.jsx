import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import './styles/app.css'
import './styles/theme.css'
import './styles/pro.css'
import './styles/home.css'

createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <App />
  </BrowserRouter>
)

if ('serviceWorker' in navigator && import.meta.env.PROD) {
  addEventListener('load', () => navigator.serviceWorker.register('/sw.js'))
}
