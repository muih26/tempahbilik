const sheetURL = "https://script.google.com/macros/s/AKfycbyGGFEeFt7Qb_S0YJM4-YoAo53k6Jp71ZSQfFhUA0BXztRG_rbF14jJqZDh9DqTz2qI/exec";

const rooms = [
 {name:"Makmal 1", class:"makmal"},
 {name:"Makmal 2", class:"makmal"},
 {name:"Pusat Sumber", class:"pusat"},
 {name:"Bilik Mesyuarat", class:"mesyuarat"},
 {name:"Dewan Besar", class:"dewan"}
];

let bookings = [];
let selected = [];
let selecting = false;

function init(){
    document.getElementById("tarikh").value = today();

    let dropdown = document.getElementById("bilik");
    rooms.forEach(r=>{
        let opt = document.createElement("option");
        opt.text = r.name;
        dropdown.add(opt);
    });

    loadData();
}

function today(){
    return new Date().toISOString().split('T')[0];
}

function build(){
    let div = document.getElementById("schedule");
    div.innerHTML="";

    div.appendChild(cell("Bilik/Waktu",true));

    for(let i=1;i<=17;i++){
        div.appendChild(cell(i,true));
    }

    rooms.forEach(r=>{
        div.appendChild(cell(r.name,true));

        for(let i=1;i<=17;i++){
            let c = cell("");
            c.dataset.room = r.name;
            c.dataset.time = i;
            c.classList.add(r.class);
            c.onclick = ()=>clickCell(c);
            div.appendChild(c);
        }
    });
}

function cell(txt,header=false){
    let d=document.createElement("div");
    d.className="cell"+(header?" header":"");
    d.innerText=txt;
    return d;
}

function clickCell(c){
    if(!selecting) return;

    if(c.classList.contains("booked")){
        alert("Slot sudah ditempah!");
        return;
    }

    c.classList.toggle("selected");

    let room=c.dataset.room;
    let time=parseInt(c.dataset.time);

    let i=selected.findIndex(s=>s.room===room&&s.time===time);
    if(i>=0) selected.splice(i,1);
    else selected.push({room,time});
}

function startSelect(){
    selecting=true;
    selected=[];
    alert("Pilih slot (maks 4 waktu)");
}

async function confirmBooking(){
    let nama=document.getElementById("nama").value;
    let bilik=document.getElementById("bilik").value;
    let tarikh=document.getElementById("tarikh").value;

    let slots=selected.filter(s=>s.room===bilik).map(s=>s.time);

    if(slots.length===0){
        alert("Tiada slot dipilih");
        return;
    }

    slots.sort((a,b)=>a-b);

    if(nama!=="Muskhairil" && slots.length>4){
        alert("Maksimum 4 waktu sahaja!");
        return;
    }

    let mula=slots[0];
    let tamat=slots[slots.length-1];

    let overlap=bookings.some(b=>
        b.bilik===bilik &&
        b.tarikh===tarikh &&
        (mula<=b.tamat && tamat>=b.mula)
    );

    if(overlap){
        alert("Tempahan bertindih!");
        return;
    }

    let data={nama,bilik,mula,tamat,tarikh};

    await fetch(sheetURL,{
        method:"POST",
        body:JSON.stringify(data)
    });

    alert("Tempahan berjaya!");
    loadData();
}

function paint(){
    document.querySelectorAll(".cell").forEach(c=>{
        if(c.dataset.room){
            c.classList.remove("booked","selected");
            c.innerText="";
        }
    });

    bookings.forEach(b=>{
        for(let t=b.mula;t<=b.tamat;t++){
            let c=document.querySelector(`[data-room='${b.bilik}'][data-time='${t}']`);
            if(c){
                c.classList.add("booked");
                c.innerText=b.nama;
            }
        }
    });
}

async function loadData(){
    let res=await fetch(sheetURL);
    bookings=await res.json();
    build();
    paint();
}

init();
