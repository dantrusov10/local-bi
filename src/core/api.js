
export async function sendWebhook(event, payload){
  console.log("Webhook:", event, payload)
}

export async function writeBack(row){
  console.log("Write-back:", row)
}
