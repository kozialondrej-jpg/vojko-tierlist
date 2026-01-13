# Minecraft Player Tier List

Jednoduchý statický projekt pro zobrazení hráčů Minecraftu rozdělených do tierů (S, A, B, C, D).

## Spuštění lokálně

- Nejjednodušší (nepotřebujete nic instalovat):
  ```bash
  cd minecraft-tierlist
  python3 -m http.server 3000
  # otevřete http://localhost:3000
  ```

- Pomocí Node.js a Live Server (pokud chcete automatické reloadování):
  ```bash
  cd minecraft-tierlist
  npm install
  npm start
  # Live Server spustí web na http://127.0.0.1:3000
  ```

## Úpravy
- Upravit `players.json` pro změnu hráčů a jejich tierů.
- Přidat avatar přes URL (vlastnost `avatar`) nebo poznámky (`notes`).

## Přidání zápasu
Zápasy se ukládají v `matches.json`. Každý záznam obsahuje `player1`, `player2` a `result` (ve formátu `X-Y`). Příklad položky:

```json
{
  "player1": "Příklad",
  "player2": "Příklad",
  "result": "4-0"
}
```

Nebo nahraďte celý soubor tímto seznamem zápasů:

```json
[
  {
    "player1": "Dream",
    "player2": "Technoblade",
    "result": "4-0"
  },
  {
    "player1": "Sapnap",
    "player2": "GeorgeNotFound",
    "result": "3-2"
  }
]
```

## Aplikace výher z `matches.json` na `players.json`
Stránka automaticky načítá `players.json` i `matches.json`. Pro každé utkání ve tvaru `X-Y` (kde X ≠ Y) se určí vítěz a tomuto hráči se přičte 1 výhra pro **vizuální** zobrazení i pro rozhodování o postupu.

Pravidla postupu (maximálně o jeden stupeň):
- D → C: 3 výhry
- C → B: 4 výhry
- B → A: 5 výher
- A → S: 6 výher

Poznámky:
- Výpočty jsou prováděny při načtení stránky, hráči, kteří nejsou uvedení v `players.json` ale vyhráli zápas, budou automaticky přidáni s výchozím tierem `D`.
- Pokud chcete persistovat aktualizované počty do souboru `players.json`, použijte skript `npm run apply-wins` (ten upraví soubor a vytvoří zálohu `players.json.bak`).


## Další nápady
- Přidat UI pro editaci seznamu a ukládání (lokálně/na server).
- Přidat drag & drop pro přesouvání hráčů mezi třiery.
