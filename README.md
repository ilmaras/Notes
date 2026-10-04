# Mano užrašai

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

## Projekto etapai

| Etapas                                               | Duomenų saugojimas            | Būsena      |
| ---------------------------------------------------- | ----------------------------- | ----------- |
| [L02.1](https://github.com/ilmaras/Notes/tree/l02.1) | Naršyklės `localStorage`      | Įgyvendinta |
| L02.2                                                | Nuotolinė duomenų saugykla    | Planuojama  |
| L02.3                                                | Bus patikslinta pagal užduotį | Planuojama  |

## Paleidimas

Projektas kurtas ir tikrintas su „Node.js“ 24.21.0, `npm` 11.19.0 ir „Angular CLI“ 22.2.1.

```bash
npm install
npm start
```

Naršyklėje atverkite <http://localhost:4200/>.

## Patikra

Programėlei sukompiliuoti ir testams paleisti naudojamos komandos:

```bash
npm run build
npm test -- --watch=false
```

## Duomenys ir privatumas

L02.1 etape jokie užrašai nesiunčiami į serverį. Duomenys saugomi `notes-app.notes` raktu naršyklės `localStorage` saugykloje. Išvalius šios svetainės naršyklės duomenis, užrašai bus pašalinti.

© 2026 Ilmaras Tarikas · Klaipėdos universitetas, JMNTS25.