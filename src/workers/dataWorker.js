
self.onmessage = (e)=>{
  const data = e.data
  // placeholder for heavy processing
  self.postMessage(data)
}
