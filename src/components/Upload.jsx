
import React, {useState} from 'react'
import { parseFile } from '../core/parser.js'

export default function Upload(){

  const [tables,setTables] = useState([])

  async function handleFiles(e){
    const files = Array.from(e.target.files)

    for(const file of files){
      const result = await parseFile(file)
      setTables(t=>[...t,...result])
    }
  }

  return (
    <div style={{marginTop:20}}>
      <h2>Upload Files</h2>
      <input type="file" multiple onChange={handleFiles}/>

      {tables.map((t,i)=>(
        <div key={i} style={{marginTop:10}}>
          <h4>{t.name}</h4>
          <div>Rows: {t.rows.length}</div>
          <div>Columns: {t.columns.join(", ")}</div>
        </div>
      ))}
    </div>
  )
}
