# Mano užrašinė

Klaipėdos universiteto naudotojo sąsajų technologijų laboratorinio darbo „Angular“ programėlė. Joje galima sukurti užrašą su antrašte ir tekstu, peržiūrėti visus užrašus, juos redaguoti bei ištrinti.

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

Vietoje siūlyto „Firebase“ pasirinktas lokalus „Node.js“ API ir SQLite, nes „Node.js“ aplinka jau naudojama „Angular“ projektui, todėl būtų neekonomiška jos nepanaudoti. Net ir pridėjus trečiojo etapo funkcijas, API ir SQLite valdymas kartu sudaro mažiau nei 200 kodo eilučių, tad backend neužgožia pagrindinės „Angular“ užduoties.

Backend sąmoningai supaprastintas, nes laboratorinio darbo pagrindas yra frontend. Jame realizuotos tik užrašams reikalingos operacijos, bazinė gaunamų duomenų validacija ir klaidų atskyrimas: netinkamiems duomenims grąžinamas `400`, nerastam įrašui – `404`, o vidinei serverio klaidai – `500`. Autentifikacija, autorizacija, HTTPS, užklausų ribojimas ir produkcinio diegimo konfigūracija nerealizuojami.

Jei SQLite duomenų bazės failo nėra, jis automatiškai sukuriamas `DB/data/notes.db` pirmą kartą paleidus API. Repozitorijoje pateikiama išbandyta demonstracinė bazė su testiniais įrašais, kad programos veikimą būtų galima peržiūrėti iš karto.

## L02.3 etapas

Pridėtas įrašų redagavimas per `PATCH /api/notes/:id`. Pasirinkus redagavimo veiksmą, esama forma užpildoma įrašo duomenimis ir leidžia pakeitimus išsaugoti arba atšaukti; įrašo `id` ir sukūrimo laikas nekeičiami.

Ryšio, įrašo sukūrimo, redagavimo, ištrynimo ir duomenų saugyklos klaidos rodomos bendrame uždaromame perspėjime. Pagrindiniams klaidų scenarijams pateikiami šie pranešimai:

- API nepasiekiamas dėl nepaleisto serverio arba nutrūkusio ryšio – „Nepavyko prisijungti prie duomenų saugyklos.“;
- pradinė `GET /api/notes` užklausa atmetama dėl kliento arba neteisingo kelio klaidos (`400` arba `404`) – „Nepavyko įkelti užrašų.“;
- pradinė `GET /api/notes` užklausa baigiasi vidine serverio arba SQLite klaida (`500`) – „Nepavyko įkelti užrašų. Duomenų saugyklos klaida.“;
- kuriamo įrašo duomenys neatitinka backend validacijos (`POST`, `400`) – „Nepavyko sukurti įrašo. Patikrinkite formos laukus.“;
- redaguojamo įrašo duomenys neatitinka backend validacijos (`PATCH`, `400`) – „Nepavyko atnaujinti įrašo. Patikrinkite formos laukus.“;
- redaguojamas įrašas jau pašalintas arba jo `id` neegzistuoja (`PATCH`, `404`) – „Redaguojamas įrašas neberastas.“;
- trinamas įrašas jau pašalintas arba jo `id` neegzistuoja (`DELETE`, `404`) – „Trinamas įrašas neberastas.“;
- kuriant įrašą įvyksta vidinė serverio arba SQLite klaida (`POST`, `500`) – „Nepavyko sukurti įrašo. Duomenų saugyklos klaida.“;
- atnaujinant įrašą įvyksta vidinė serverio arba SQLite klaida (`PATCH`, `500`) – „Nepavyko atnaujinti įrašo. Duomenų saugyklos klaida.“;
- trinant įrašą įvyksta vidinė serverio arba SQLite klaida (`DELETE`, `500`) – „Nepavyko ištrinti įrašo. Duomenų saugyklos klaida.“

Nesėkmingai kuriant ar redaguojant įrašą, naudotojo įvesti duomenys formoje išlieka.

## Projekto etapai

- [L02.1](https://github.com/ilmaras/Notes/tree/L02.1) – užrašai saugomi naršyklės `localStorage`; įgyvendinta.
- [L02.2](https://github.com/ilmaras/Notes/tree/L02.2) – naudojamas lokalus „Node.js“ API ir SQLite; įgyvendinta.
- [L02.3](https://github.com/ilmaras/Notes/tree/L02.3) – įrašų redagavimas ir išsamesnis klaidų apdorojimas; įgyvendinta.

## Diagramos

- [Programos architektūra](diagrams/architecture.svg) – Angular komponentų, HTTP API ir SQLite ryšiai.
- [Pradinis užrašų įkėlimas](diagrams/sequence-load.svg) – programos paleidimo, duomenų gavimo ir klaidos eiga.
- [Užrašų kūrimas, redagavimas ir ištrynimas](diagrams/sequence-crud.svg) – CRUD operacijų, būsenos atnaujinimo ir klaidų eiga.

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

Nuo L02.2 etapo užrašai siunčiami tik į šiame kompiuteryje veikiantį API ir saugomi lokaliame `DB/data/notes.db` faile. Jokios išorinės paskyros ar nuotolinės paslaugos nenaudojamos.

© 2026 Ilmaras Tarikas · Klaipėdos universitetas, JMNTS25.
