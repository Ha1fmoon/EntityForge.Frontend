import {StrictMode} from 'react'
import {createRoot} from 'react-dom/client'
import '@picocss/pico/css/pico.min.css'
import './index.css'
import App from './App.jsx'

document.documentElement.setAttribute('data-theme', 'dark')

createRoot(document.getElementById('root')).render(
    <StrictMode>
        <App/>
    </StrictMode>,
)