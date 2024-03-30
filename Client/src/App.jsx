import { useState } from 'react'
import reactLogo from './assets/react.svg'
import './Components/App.css'
import Content from './Components/Content'
import Navbar from './Components/Navbar'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <Navbar/>
      <Content/>
      </>
  )
}

export default App
