
export function buildExploreData(rows, config){

  const {dimension, metric, metricField, sort="desc"} = config

  if(!dimension) return {rows, chartData:[]}

  const groups = {}

  rows.forEach(r=>{
    const key = r[dimension] ?? "—"
    if(!groups[key]) groups[key]=[]
    groups[key].push(r)
  })

  const data = Object.entries(groups).map(([label,items])=>{

    const values = metricField
      ? items.map(i=>Number(i[metricField]||0))
      : []

    let value=0

    if(metric==="count") value=items.length
    if(metric==="sum") value=values.reduce((a,b)=>a+b,0)
    if(metric==="avg") value=values.length ? values.reduce((a,b)=>a+b,0)/values.length : 0
    if(metric==="max") value=Math.max(...values,0)
    if(metric==="min") value=Math.min(...values,0)

    return {label,value:Math.round(value*100)/100}

  })

  data.sort((a,b)=> sort==="asc" ? a.value-b.value : b.value-a.value)

  return {rows, chartData:data}
}
