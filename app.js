let words=[]
let i=0
let flipped=false

const card=document.getElementById("card")
const hint=document.getElementById("hint")
const mode=document.getElementById("mode")

card.onclick=()=>{
 if(!words.length)return
 flipped=!flipped
 render()
}

function parseCSV(text){
 return text.split("\n").slice(1).map(r=>r.split(",")).filter(r=>r.length>=4)
}

document.getElementById("csv").onchange=e=>{
 const f=e.target.files[0]
 const reader=new FileReader()
 reader.onload=()=>{
   words=parseCSV(reader.result)
   i=0
   flipped=false
   render()
 }
 reader.readAsText(f)
}

function render(){
 if(!words.length){card.textContent="CSV laden";return}
 const w=words[i]
 const m=mode.value

 if(!flipped){
   if(m==="th-en") card.textContent=w[0]
   if(m==="en-th") card.textContent=w[2]
   if(m==="de-th") card.textContent=w[3]
   hint.textContent="Tippen zum Umdrehen"
 }else{
   if(m==="th-en") card.textContent=w[2]
   else card.textContent=w[0]
   hint.textContent=""
 }
}

function next(){
 i=(i+1)%words.length
 flipped=false
 render()
}
