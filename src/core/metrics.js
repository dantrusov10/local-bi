
export function computeMetric(row, formula){
  try{
    return Function("r", "return "+formula)(row)
  }catch(e){
    return 0
  }
}
