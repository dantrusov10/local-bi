
export function suggestJoins(tables){

  const suggestions=[]

  for(let i=0;i<tables.length;i++){
    for(let j=i+1;j<tables.length;j++){

      const t1=tables[i]
      const t2=tables[j]

      t1.columns.forEach(c=>{
        if(t2.columns.includes(c)){
          suggestions.push({
            left:t1.name,
            right:t2.name,
            column:c
          })
        }
      })
    }
  }

  return suggestions
}
