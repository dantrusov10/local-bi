
import * as XLSX from 'xlsx'
import Papa from 'papaparse'

export async function parseFile(file){

  const name = file.name.toLowerCase()

  if(name.endsWith('.csv')){
    return [await parseCSV(file)]
  }

  if(name.endsWith('.xlsx') || name.endsWith('.xls')){
    return await parseExcel(file)
  }

  throw new Error("Unsupported file type")
}

async function parseCSV(file){

  return new Promise(resolve=>{
    Papa.parse(file,{
      header:true,
      complete:(res)=>{

        const rows = normalize(res.data)

        resolve({
          name:file.name,
          rows,
          columns:Object.keys(rows[0] || {})
        })
      }
    })
  })
}

async function parseExcel(file){

  const buf = await file.arrayBuffer()
  const wb = XLSX.read(buf)

  const tables = []

  for(const sheet of wb.SheetNames){

    const rowsRaw = XLSX.utils.sheet_to_json(wb.Sheets[sheet],{defval:null})
    const rows = normalize(rowsRaw)

    tables.push({
      name: file.name + " / " + sheet,
      rows,
      columns: Object.keys(rows[0] || {})
    })
  }

  return tables
}

function normalize(rows){

  return rows.map(r=>{
    const out={}
    for(const k in r){
      const v=r[k]
      if(v===undefined || v==="") out[k]=null
      else if(typeof v==="string") out[k]=v.trim()
      else out[k]=v
    }
    return out
  })
}
