
export function applyRLS(rows, role, user){
  if(role==="admin") return rows
  return rows.filter(r=>r.owner===user)
}
