// src/App.jsx
import { Routes, Route, Link } from 'react-router-dom'
import Home from './pages/Home'
import About from './pages/About'

function App() {
  return (
    <div>
      {/* Navigation Bar */}
      <nav className='w-full bg-amber-200 flex gap-4 items-center justify-center text-2xl py-2'>
        <Link to="/">Home</Link>
        <Link to="/about">About</Link>
      </nav>

      {/* Route Definitions */}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
      </Routes>
    </div>
  )
}

export default App