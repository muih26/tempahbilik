const sheetURL = "https://script.google.com/macros/s/AKfycbyGGFEeFt7Qb_S0YJM4-YoAo53k6Jp71ZSQfFhUA0BXztRG_rbF14jJqZDh9DqTz2qI/exec";

let bookings = [];

function today() {
    return new Date().toISOString().split('T')[0];
}

function checkOverlap(newData) {
    return bookings.some(b =>
        b.bilik === newData.bilik &&
        b.tarikh === newData.tarikh &&
        (newData.mula <= b.tamat && newData.tamat >= b.mula)
    );
}

function render() {
    let tbody = document.querySelector("#table tbody");
    tbody.innerHTML = "";

    bookings.sort((a,b)=> a.mula - b.mula);

    bookings.forEach(b => {
        let row = `<tr>
        <td>${b.nama}</td>
        <td>${b.bilik}</td>
        <td>${b.mula} - ${b.tamat}</td>
        <td>${b.tarikh}</td>
        </tr>`;
        tbody.innerHTML += row;
    });
}

document.getElementById("bookingForm").addEventListener("submit", async function(e){
    e.preventDefault();

    let nama = document.getElementById("nama").value;
    let bilik = document.getElementById("bilik").value;
    let mula = parseInt(document.getElementById("mula").value);
    let tamat = parseInt(document.getElementById("tamat").value);

    let tarikh = today();

    if(nama !== "Muskhairil" && (tamat - mula + 1 > 4)){
        alert("Maksimum 4 waktu sahaja!");
        return;
    }

    let newBooking = {nama, bilik, mula, tamat, tarikh};

    if(checkOverlap(newBooking)){
        alert("Tempahan bertindih!");
        return;
    }

    bookings.push(newBooking);

    await fetch(sheetURL, {
        method: "POST",
        body: JSON.stringify(newBooking)
    });

    alert("Tempahan berjaya!");
    render();
});

function generatePDF(){
    const { jsPDF } = window.jspdf;
    let doc = new jsPDF();

    let start = document.getElementById("startDate").value;
    let end = document.getElementById("endDate").value;

    let filtered = bookings.filter(b => b.tarikh >= start && b.tarikh <= end);

    let y = 10;
    filtered.forEach(b => {
        doc.text(`${b.nama} | ${b.bilik} | ${b.mula}-${b.tamat} | ${b.tarikh}`, 10, y);
        y += 10;
    });

    doc.save("laporan.pdf");
}

async function loadData(){
    let res = await fetch(sheetURL);
    bookings = await res.json();
    render();
}

loadData();
