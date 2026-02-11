"use strict";
const selectedIndicator = document.getElementById("selectedIndicator");
const selectedCountry = document.getElementById("selectedCountry");
const selectedYear = document.getElementById("selectedYear");
const lineChart = document.getElementById("lineChart");
const bubbleChart = document.getElementById("bubbleChart");
const dataTable = document.getElementById("dataTable").querySelector("tbody");
const playButton = document.getElementById("playButton");

const countryNames = {
  BE: "Belgia", BG: "Bulgaria", CZ: "Cehia", DK: "Danemarca", DE: "Germania",
  EE: "Estonia", IE: "Irlanda", EL: "Grecia", ES: "Spania", FR: "Franța",
  HR: "Croația", IT: "Italia", CY: "Cipru", LV: "Letonia", LT: "Lituania",
  LU: "Luxemburg", HU: "Ungaria", MT: "Malta", NL: "Olanda", AT: "Austria",
  PL: "Polonia", PT: "Portugalia", RO: "România", SI: "Slovenia",
  SK: "Slovacia", FI: "Finlanda", SE: "Suedia"
};

const countries = Object.keys(countryNames);

const years = Array.from(
  { length: 2018 - 2000 + 1 },
  (_, i) => 2000 + i
);

document.addEventListener("DOMContentLoaded", initApp);

let currentData = [];
let allData = {};
let isAnimating = false;

function initUI() {
  countries.forEach(code => {
    const option = document.createElement("option");
    option.value = code;
    option.textContent = countryNames[code];
    selectedCountry.appendChild(option);
  })

  years.slice().reverse().forEach(year => {
    const option = document.createElement("option");
    option.value = year;
    option.textContent = year;
    selectedYear.appendChild(option);
  })

  selectedIndicator.value = "pib";
  selectedCountry.value = "RO";
  selectedYear.value = "2018";
  console.log("UI Initializat !")
}

async function loadData(indicator) {
  const base = "https://ec.europa.eu/eurostat/api/dissemination/statistics/1.0/data/";

  let dataset = "";
  if (indicator === "pib") dataset = "sdg_08_10?na_item=B1GQ&unit=CLV20_EUR_HAB";
  if (indicator === "viata") dataset = "demo_mlexpec?sex=T&age=Y1";
  if (indicator === "populatie") dataset = "demo_pjan?sex=T&age=TOTAL";
  const url =
    `${base}${dataset}` +
    countries.map(c => `&geo=${c}`).join("") +
    years.map(y => `&time=${y}`).join("");

  console.log("Se cer date de la :", url);
  const res = await fetch(url);
  if (!res.ok) throw new Error("Eroare la descarcarea datelor Eurostat");

  const data = await res.json();
  return parseEurostatData(data);
}

function parseEurostatData(data) {
  const geo = Object.keys(data.dimension.geo.category.index);
  const time = Object.keys(data.dimension.time.category.index);
  const values = data.value;
  const result = [];

  let i = 0;
  for (const g of geo) {
    for (const t of time) {
      const v = values[i];
      if (v !== undefined) {
        result.push({ country: g, year: Number(t), value: v });
      }
      i++;
    }
  }
  return result;
}

function drawLineChart(data, country) {
  lineChart.innerHTML = "";

  const filtered = data
    .filter(d => d.country === country)
    .sort((a, b) => a.year - b.year);

  if (!filtered.length) return;

  const maxVal = Math.max(...filtered.map(d => d.value));
  const minVal = Math.min(...filtered.map(d => d.value));

  const paddingLeft = 70;
  const padding = 50;
  const width = lineChart.clientWidth || Number(lineChart.getAttribute("width")) || 800;
  const height = lineChart.clientHeight || Number(lineChart.getAttribute("height")) || 400;

  const xScale = year =>
    paddingLeft + (year - years[0]) * ((width - paddingLeft - padding) / (years[years.length - 1] - years[0] || 1));

  const yScale = val => {
    if (maxVal === minVal) return height / 2;
    return height - padding - (val - minVal) * ((height - 2 * padding) / (maxVal - minVal));
  };

  const xAxis = document.createElementNS("http://www.w3.org/2000/svg", "line");
  xAxis.setAttribute("x1", paddingLeft);
  xAxis.setAttribute("y1", height - padding);
  xAxis.setAttribute("x2", width - padding);
  xAxis.setAttribute("y2", height - padding);
  xAxis.setAttribute("stroke", "#000");
  xAxis.setAttribute("stroke-width", "3");
  xAxis.setAttribute("stroke-linecap", "round");
  lineChart.appendChild(xAxis);

  const yAxis = document.createElementNS("http://www.w3.org/2000/svg", "line");
  yAxis.setAttribute("x1", paddingLeft);
  yAxis.setAttribute("y1", padding);
  yAxis.setAttribute("x2", paddingLeft);
  yAxis.setAttribute("y2", height - padding);
  yAxis.setAttribute("stroke", "#000");
  yAxis.setAttribute("stroke-width", "2");
  lineChart.appendChild(yAxis);

  years.forEach((year, i) => {
    const x = xScale(year);
    const tick = document.createElementNS("http://www.w3.org/2000/svg", "line");
    tick.setAttribute("x1", x);
    tick.setAttribute("y1", height - padding);
    tick.setAttribute("x2", x);
    if (i === 0 || i === years.length - 1) {
      tick.setAttribute("y2", height - padding + 16);
      tick.setAttribute("stroke-width", "2.5");
    } else {
      tick.setAttribute("y2", height - padding + 8);
      tick.setAttribute("stroke-width", "1");
    }
    tick.setAttribute("stroke", "#000");
    lineChart.appendChild(tick);
    if (i % 2 === 0 || years.length < 10 || i === 0 || i === years.length - 1) {
      const label = document.createElementNS("http://www.w3.org/2000/svg", "text");
      label.setAttribute("x", x);
      label.setAttribute("y", height - padding + 28);
      label.setAttribute("text-anchor", "middle");
      label.setAttribute("font-size", i === 0 || i === years.length - 1 ? "14" : "12");
      label.setAttribute("font-weight", i === 0 || i === years.length - 1 ? "bold" : "normal");
      label.setAttribute("fill", "#000");
      label.textContent = year;
      lineChart.appendChild(label);
    }
  });

  const yTicks = 6;
  for (let i = 0; i <= yTicks; i++) {
    const v = minVal + (i * (maxVal - minVal) / yTicks);
    const y = yScale(v);

    const tick = document.createElementNS("http://www.w3.org/2000/svg", "line");
    tick.setAttribute("x1", paddingLeft - 8);
    tick.setAttribute("y1", y);
    tick.setAttribute("x2", paddingLeft);
    tick.setAttribute("y2", y);
    tick.setAttribute("stroke", "#000");
    tick.setAttribute("stroke-width", "1");
    lineChart.appendChild(tick);

    const label = document.createElementNS("http://www.w3.org/2000/svg", "text");
    label.setAttribute("x", paddingLeft - 12);
    label.setAttribute("y", y + 4);
    label.setAttribute("text-anchor", "end");
    label.setAttribute("font-size", "12");
    label.setAttribute("fill", "#222");
    label.textContent = Math.round(v).toLocaleString();
    lineChart.appendChild(label);
  }

  const dAttr = filtered.map((d, i) =>
    `${i === 0 ? "M" : "L"} ${xScale(d.year)} ${yScale(d.value)}`
  ).join(" ");

  const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
  path.setAttribute("d", dAttr);
  path.setAttribute("fill", "none");
  path.setAttribute("stroke", "#0074d9");
  path.setAttribute("stroke-width", "2");
  lineChart.appendChild(path);

  filtered.forEach(d => {
    const c = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    c.setAttribute("cx", xScale(d.year));
    c.setAttribute("cy", yScale(d.value));
    c.setAttribute("r", 4);
    c.setAttribute("fill", "#FF4136");
    c.dataset.year = d.year;
    c.dataset.value = d.value;
    lineChart.appendChild(c);
  });

  let tooltip = document.getElementById("chart-tooltip");
  if (!tooltip) {
    tooltip = document.createElement("div");
    tooltip.id = "chart-tooltip";
    Object.assign(tooltip.style, {
      position: "absolute",
      background: "white",
      border: "1px solid #ccc",
      padding: "4px 8px",
      display: "none",
      pointerEvents: "none",
      fontSize: "12px",
      borderRadius: "4px"
    });
    document.body.appendChild(tooltip);

    lineChart.addEventListener("mousemove", e => {
      const t = e.target;
      if (t.tagName === "circle") {
        tooltip.innerHTML = `${t.dataset.year}: <b>${Number(t.dataset.value).toLocaleString()}</b>`;
        tooltip.style.left = e.pageX + 10 + "px";
        tooltip.style.top = e.pageY - 20 + "px";
        tooltip.style.display = "block";
      } else {
        tooltip.style.display = "none";
      }
    });
  }
}

function drawBubbleChart(pibData, svData, popData, year) {
  const ctx = bubbleChart.getContext("2d");
  ctx.clearRect(0, 0, bubbleChart.width, bubbleChart.height);

  const pibYear = pibData.filter(d => d.year === year);
  const svYear = svData.filter(d => d.year === year);
  const popYear = popData.filter(d => d.year === year);

  const dataByCountry = {};
  pibYear.forEach(d => {
    if (!dataByCountry[d.country]) dataByCountry[d.country] = {};
    dataByCountry[d.country].pib = d.value;
  });
  svYear.forEach(d => {
    if (!dataByCountry[d.country]) dataByCountry[d.country] = {};
    dataByCountry[d.country].sv = d.value;
  });
  popYear.forEach(d => {
    if (!dataByCountry[d.country]) dataByCountry[d.country] = {};
    dataByCountry[d.country].pop = d.value;
  });

  const validCountries = countries.filter(c =>
    dataByCountry[c] && dataByCountry[c].pib && dataByCountry[c].sv && dataByCountry[c].pop
  );

  if (!validCountries.length) {
    ctx.fillStyle = "#999";
    ctx.font = "14px Arial";
    ctx.fillText("Nu sunt date disponibile pentru anul " + year, 50, 50);
    return;
  }

  const pibValues = validCountries.map(c => dataByCountry[c].pib);
  const svValues = validCountries.map(c => dataByCountry[c].sv);
  const popValues = validCountries.map(c => dataByCountry[c].pop);

  const minPib = Math.min(...pibValues);
  const maxPib = Math.max(...pibValues);
  const minSv = Math.min(...svValues);
  const maxSv = Math.max(...svValues);
  const minPop = Math.min(...popValues);
  const maxPop = Math.max(...popValues);

  const padding = 50;
  const width = bubbleChart.width;
  const height = bubbleChart.height;

  ctx.fillStyle = "#222";
  ctx.font = "12px Arial";
  ctx.textAlign = "center";
  ctx.fillText("PIB/locuitor", width / 2, height - 10);
  ctx.save();
  ctx.translate(10, height / 2);
  ctx.rotate(-Math.PI / 2);
  ctx.fillText("Speranță de viață", 0, 0);
  ctx.restore();

  ctx.fillStyle = "rgba(0, 116, 217, 0.15)";
  ctx.font = "bold 48px Arial";
  ctx.textAlign = "right";
  ctx.fillText(year, width - padding - 10, padding + 40);

  const xTicks = 5;
  for (let i = 0; i <= xTicks; i++) {
    const pibVal = minPib + (i * (maxPib - minPib) / xTicks);
    const x = padding + (i * (width - 2 * padding) / xTicks);

    ctx.strokeStyle = "#ddd";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x, height - padding);
    ctx.lineTo(x, padding);
    ctx.stroke();

    ctx.fillStyle = "#444";
    ctx.font = "10px Arial";
    ctx.textAlign = "center";
    ctx.fillText(Math.round(pibVal).toLocaleString(), x, height - padding + 15);
  }

  const yTicks = 5;
  for (let i = 0; i <= yTicks; i++) {
    const svVal = minSv + (i * (maxSv - minSv) / yTicks);
    const y = height - padding - (i * (height - 2 * padding) / yTicks);

    ctx.strokeStyle = "#ddd";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(padding, y);
    ctx.lineTo(width - padding, y);
    ctx.stroke();

    ctx.fillStyle = "#444";
    ctx.font = "10px Arial";
    ctx.textAlign = "right";
    ctx.fillText(svVal.toFixed(1), padding - 5, y + 3);
  }

  ctx.strokeStyle = "#222";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(padding, height - padding);
  ctx.lineTo(width - padding, height - padding);
  ctx.moveTo(padding, height - padding);
  ctx.lineTo(padding, padding);
  ctx.stroke();

  validCountries.forEach(c => {
    const pib = dataByCountry[c].pib;
    const sv = dataByCountry[c].sv;
    const pop = dataByCountry[c].pop;

    const x = padding + ((pib - minPib) / (maxPib - minPib || 1)) * (width - 2 * padding);
    const y = height - padding - ((sv - minSv) / (maxSv - minSv || 1)) * (height - 2 * padding);
    const radius = 5 + ((pop - minPop) / (maxPop - minPop || 1)) * 25;

    ctx.fillStyle = `hsl(${(countries.indexOf(c) * 360) / countries.length}, 70%, 50%)`;
    ctx.globalAlpha = 0.7;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, 2 * Math.PI);
    ctx.fill();
    ctx.globalAlpha = 1;

    ctx.fillStyle = "#222";
    ctx.font = "bold 10px Arial";
    ctx.textAlign = "center";
    ctx.fillText(c, x, y);
  });

  ctx.fillStyle = "#666";
  ctx.font = "12px Arial";
  ctx.textAlign = "left";
  ctx.fillText("Rază = Populație | X = PIB | Y = Speranță viață", padding, 20);
}

function drawDataTable(year) {
  const pibYear = (allData.pib || []).filter(d => d.year === year);
  const svYear = (allData.viata || []).filter(d => d.year === year);
  const popYear = (allData.populatie || []).filter(d => d.year === year);

  const avg = arr => arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;
  const pibAvg = avg(pibYear.map(d => d.value));
  const svAvg = avg(svYear.map(d => d.value));
  const popAvg = avg(popYear.map(d => d.value));

  function cellColor(val, medie, indicator) {
    if (val === undefined) return '#eee';
    const diff = val - medie;

    let threshold;
    if (indicator === 'sv') {
      threshold = 2;
      if (diff < -threshold) return '#ffb3b3';
      if (diff > threshold) return '#b3ffb3';
    } else {
      const ratio = diff / (medie || 1);
      if (ratio < -0.2) return '#ffb3b3';
      if (ratio > 0.2) return '#b3ffb3';
    }

    return '#ffffb3';
  }

  dataTable.innerHTML = "";
  countries.forEach(c => {
    const row = document.createElement("tr");
    const pib = pibYear.find(d => d.country === c)?.value;
    const sv = svYear.find(d => d.country === c)?.value;
    const pop = popYear.find(d => d.country === c)?.value;

    const tdTara = document.createElement("td");
    tdTara.textContent = countryNames[c];
    row.appendChild(tdTara);

    const tdPib = document.createElement("td");
    tdPib.textContent = pib !== undefined ? pib.toLocaleString() : '-';
    tdPib.style.background = cellColor(pib, pibAvg, 'pib');
    row.appendChild(tdPib);

    const tdSv = document.createElement("td");
    tdSv.textContent = sv !== undefined ? sv.toLocaleString() : '-';
    tdSv.style.background = cellColor(sv, svAvg, 'sv');
    row.appendChild(tdSv);

    const tdPop = document.createElement("td");
    tdPop.textContent = pop !== undefined ? pop.toLocaleString() : '-';
    tdPop.style.background = cellColor(pop, popAvg, 'pop');
    row.appendChild(tdPop);
    dataTable.appendChild(row);
  });

  document.getElementById('avgPib').textContent = Math.round(pibAvg).toLocaleString();
  document.getElementById('avgSv').textContent = svAvg.toFixed(1);
  document.getElementById('avgPop').textContent = Math.round(popAvg).toLocaleString();
}

async function initApp() {
  initUI();

  allData = {
    pib: await loadData("pib"),
    viata: await loadData("viata"),
    populatie: await loadData("populatie")
  };
  currentData = allData[selectedIndicator.value];

  drawLineChart(currentData, selectedCountry.value);
  drawBubbleChart(allData.pib, allData.viata, allData.populatie, Number(selectedYear.value));
  drawDataTable(Number(selectedYear.value));

  selectedIndicator.addEventListener("change", () => {
    currentData = allData[selectedIndicator.value];
    drawLineChart(currentData, selectedCountry.value);
  });

  selectedCountry.addEventListener("change", () => {
    drawLineChart(currentData, selectedCountry.value);
  });

  selectedYear.addEventListener("change", () => {
    drawBubbleChart(allData.pib, allData.viata, allData.populatie, Number(selectedYear.value));
    drawDataTable(Number(selectedYear.value));
  });

  playButton.addEventListener("click", async () => {
    if (isAnimating) {
      isAnimating = false;
      playButton.textContent = "Play";
      return;
    }

    isAnimating = true;
    playButton.textContent = "Stop";
    for (let y of years) {
      if (!isAnimating) break;
      selectedYear.value = y;
      drawBubbleChart(allData.pib, allData.viata, allData.populatie, y);
      drawDataTable(y);
      await new Promise(res => setTimeout(res, 600));
    }
    isAnimating = false;
    playButton.textContent = "Play";
  });

}