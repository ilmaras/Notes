# Mano užrašinė

Klaipėdos universiteto naudotojo sąsajų technologijų laboratorinio darbo „Angular“ programėlė. Joje galima sukurti užrašą su antrašte ir tekstu, peržiūrėti visus užrašus bei juos ištrinti.

## L02.1 etapas

Šiame etape užrašai saugomi naršyklės `localStorage`. Todėl jie išlieka perkrovus ar iš naujo atvėrus puslapį, tačiau yra pasiekiami tik toje pačioje naršyklėje ir įrenginyje.

Įgyvendinta:

- užrašo antraštės ir teksto įvedimo forma;
- tuščių laukų ir didžiausio ilgio tikrinimas;
- naujausių užrašų rodymas sąrašo pradžioje;
- užrašų ištrynimas;
- automatinis išsaugojimas ir atkūrimas iš `localStorage`;
- prisitaikanti bei klaviatūra valdoma naudotojo sąsaja;
- pagrindinės duomenų saugojimo ir sąsajos veikimo patikros.

## L02.2 etapas

Šiame etape `localStorage` pakeista lokaliu „Node.js“ HTTP API ir SQLite duomenų baze. „Angular“ programa su saugykla bendrauja per `/api/notes`, o kūrimo serveris šias užklausas nukreipia į <http://127.0.0.1:3000/>.

Vietoje siūlyto „Firebase“ pasirinktas lokalus „Node.js“ API ir SQLite, nes „Node.js“ aplinka jau naudojama „Angular“ projektui, todėl būtų neekonomiška jos nepanaudoti. API sudaro apie 90, o SQLite valdymas – apie 50 kodo eilučių, tad backend neužgožia pagrindinės „Angular“ užduoties.

Backend sąmoningai supaprastintas, nes laboratorinio darbo pagrindas yra frontend. Jame realizuotos tik užrašams reikalingos gavimo, sukūrimo ir ištrynimo operacijos, bazinė gaunamų duomenų validacija bei klaidų apdorojimas. Supaprastinant API visos užklausos apdorojimo klaidos grąžinamos bendru `400` atsakymu; produkcinėje versijoje kliento (`400`) ir vidinės serverio (`500`) klaidos būtų atskiriamos. Autentifikacija, autorizacija, HTTPS, užklausų ribojimas ir produkcinio diegimo konfigūracija nerealizuojami.

SQLite duomenų bazė automatiškai sukuriama `DB/data/notes.db` faile pirmą kartą paleidus API. Šis vykdymo metu keičiamas failas į Git nekeliamas.

## Projekto etapai

- [L02.1](https://github.com/ilmaras/Notes/tree/L02.1) – užrašai saugomi naršyklės `localStorage`; įgyvendinta.
- L02.2 – naudojamas lokalus „Node.js“ API ir SQLite; įgyvendinta.
- L02.3 – bus patikslinta pagal užduotį; planuojama.

## Paleidimas

Projektas kurtas ir tikrintas su „Node.js“ 24.21.0, `npm` 11.19.0 ir „Angular CLI“ 22.2.1.

Įdiekite priklausomybes:

```bash
npm install
```

Pirmajame terminale paleiskite lokalų API:

```bash
npm run api
```

Antrajame terminale paleiskite „Angular“ programą:

```bash
npm start
```

Naršyklėje atverkite <http://localhost:4200/>.

## Patikra

Programėlei sukompiliuoti ir testams paleisti naudojamos komandos:

```bash
npm run build
npm test -- --watch=false
npm run test:backend
```

## Duomenys ir privatumas

L02.2 etape užrašai siunčiami tik į šiame kompiuteryje veikiantį API ir saugomi lokaliame `DB/data/notes.db` faile. Jokios išorinės paskyros ar nuotolinės paslaugos nenaudojamos.

© 2026 Ilmaras Tarikas · Klaipėdos universitetas, JMNTS25.
