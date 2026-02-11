# 🟢 Vezi live: [https://vizualizatordateeurostat.netlify.app/](https://vizualizatordateeurostat.netlify.app/)

# Vizualizator Date Eurostat

## Descriere Proiect
Acest proiect este o aplicație web interactivă pentru vizualizarea indicatorilor socio-economici ai țărilor Uniunii Europene între anii 2000-2018. Indicatorii vizualizați sunt:
- PIB pe cap de locuitor
- Speranță de viață
- Populație

Datele sunt preluate automat la pornirea aplicației, direct de la API-ul Eurostat, folosind seturile de date oficiale și procesate pentru a fi afișate într-o formă intuitivă.

## Tehnologii și Biblioteci Folosite
- **HTML5**: Structura aplicației și elemente interactive (select, tabel, SVG, canvas)
- **CSS3**: Stilizare modernă, responsive, cu fonturi Google și efecte vizuale
- **JavaScript Vanilla**: Preluare date din API, procesare, generare grafică SVG și canvas, animații, interactivitate

## Funcționalități

### 1. Preluare automată date Eurostat
- La pornirea aplicației, datele pentru indicatorii PIB, Speranță de viață și Populație sunt descărcate automat de la API-ul Eurostat.
- Datele sunt procesate pentru a fi compatibile cu formatul cerut și pentru a acoperi ultimii 15 ani disponibili (2000-2018).
- Seturile de date folosite:
  - `sdg_08_10?na_item=B1GQ&unit=CLV20_EUR_HAB` (PIB)
  - `demo_mlexpec?sex=T&age=Y1` (Speranță de viață)
  - `demo_pjan?sex=T&age=TOTAL` (Populație)
- Lista de țări: BE, BG, CZ, DK, DE, EE, IE, EL, ES, FR, HR, IT, CY, LV, LT, LU, HU, MT, NL, AT, PL, PT, RO, SI, SK, FI, SE

### 2. Vizualizare grafică evoluție indicator
- Utilizatorul poate selecta indicatorul și țara dorită.
- Evoluția indicatorului este afișată într-un grafic de tip linie (SVG), cu axa X pentru ani și axa Y pentru valoare.

### 3. Tooltip interactiv pe grafic
- La hover pe punctele graficului, se afișează un tooltip cu anul și valoarea indicatorului pentru acel punct.

### 4. Bubble Chart pentru un an selectat
- Pentru anul selectat, se afișează un bubble chart (canvas) unde:
  - X = PIB/locuitor
  - Y = Speranță de viață
  - Raza = Populație
- Fiecare țară este reprezentată printr-un cerc colorat distinct.

### 5. Animație Bubble Chart
- Aplicația permite animarea bubble chart-ului pentru toți anii disponibili (2000-2018), oferind o vizualizare dinamică a evoluției indicatorilor.

### 6. Tabel date și medii UE
- Datele pentru anul selectat sunt afișate într-un tabel, cu evidențierea valorilor peste/sub media UE.
- Media UE pentru fiecare indicator este calculată și afișată în footer-ul tabelului.

## Structura Fișierelor
- `index.html`: Structura aplicației și elementele UI
- `style.css`: Stilizare modernă, responsive, cu accent pe vizualizare
- `script.js`: Logica aplicației, preluare date, procesare, generare grafică și animații

## Exemplu de Apel API
```url
https://ec.europa.eu/eurostat/api/dissemination/statistics/1.0/data/demo_mlexpec?sex=T&age=Y1&time=2019&time=2020&geo=RO&geo=BG
```

## Resurse și Documentație
- [Eurostat API Documentation](https://wikis.ec.europa.eu/display/EUROSTATHELP/API+Statistics+-+data+query)
- [API Detailed Guidelines](https://ec.europa.eu/eurostat/web/user-guides/data-browser/api-data-access/api-detailed-guidelines/api-statistics)

---

Prin acest proiect am reusit sa capăt:
- Abilități de preluare și procesare date din API-uri publice
- Vizualizare interactivă cu SVG și Canvas
- UI modern și responsive
- Programare JavaScript fără framework-uri externe
- Atenție la UX și detalii vizuale

Proiectul poate fi extins cu noi indicatori, filtre, export date, integrare cu framework-uri moderne etc.
=======
# Vizualizator-Date-Eurostat
>>>>>>> ece699fceb0b6b8703b79eb144bea740d72e8e2a
