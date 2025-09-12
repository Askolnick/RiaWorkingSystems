export async function saveView(input:any){
  await fetch('/api/saved-views',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(input)})
}