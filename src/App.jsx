
import React from 'react'
import Upload from './components/Upload.jsx'
import Explore from './components/Explore.jsx'

export default function App() {
  return (
    <div style={{fontFamily:'Arial', padding:20}}>
      <h1>Local BI (No Server)</h1>
      <Upload />
      <Explore />
    </div>
  )
}
