## 📂 File Structure

```
game/
├── index.html
├── style.css
├── game-data.yaml
├── strings.yaml
├── images/
└── js/
    ├── constants.js
    ├── state.js
    ├── utils.js
    ├── sound.js
    ├── localization.js
    ├── board.js
    ├── animations.js
    ├── gameLogic.js
    ├── dataLoader.js
    └── main.js
```

## 📄 What Each Non‑JavaScript File Does (For Non‑Coders)

You don’t need to understand programming to edit the game. Most of the time you’ll only touch **`strings.yaml`** (all on‑screen text) and maybe **`game-data.yaml`** (quiz questions).

| File / Folder | What it does | Should you edit it? |
|---------------|--------------|----------------------|
| `index.html` | The main webpage. Loads the board, buttons, and all code. | ❌ **No** – only for developers. |
| `style.css` | Controls colours, fonts, button sizes, animations (flashing, pulsing). | ⚠️ **Optional** – only if you know CSS. |
| `game-data.yaml` | The **game board data**: space order, positions, quiz questions, answers, points, drawing challenges. | ✅ **Yes** – to change questions, points, or board layout. |
| `strings.yaml` | **ALL text** in the game: button labels, pop‑up messages, the guide, game logs. | ✅ **Yes** – this is the main file for non‑coders. |
| `splash.jpg` | The image shown while the game loads. | ✅ **Yes** – replace with your own splash image. |
| `Copy_of_inovasi_2026.png` | The **board background** (the picture with all spaces). | ✅ **Yes** – replace with your own board design. |
| `images/` folder | Small images that appear when you click a space (e.g., `1.png`, `jail.png`). | ✅ **Yes** – add or replace images. Name them exactly like the space key. |

---

## 🧠 What each JavaScript file does (for curious non‑coders)


| JavaScript File   | Purpose                                                                                                                                      |
| ----------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| `constants.js`    | Things that never change, like player colours and dice dot patterns.                                                                         |
| `state.js`        | Remembers where tokens are, whose turn it is, and whether the game is active.                                                                |
| `utils.js`        | Small helper functions: turns dice numbers into dots, shows images in pop-ups, and builds the player name form.                              |
| `sound.js`        | Plays sound effects when players click, roll, or answer correctly.                                                                           |
| `localization.js` | Loads `strings.yaml` and replaces `{placeholders}` with actual values.                                                                       |
| `board.js`        | Draws the 40 board cells, player tokens, scoreboard, game log, and pop-up windows.                                                           |
| `animations.js`   | Handles token movement, dice rolling animations, and cell highlight effects.                                                                 |
| `gameLogic.js`    | Contains the game rules: rolling dice, moving players, handling spaces, quizzes, drawing challenges, lap completion, and victory conditions. |
| `dataLoader.js`   | Loads `game-data.yaml` when the game starts.                                                                                                 |
| `main.js`         | Connects UI buttons and events (`Start Game`, `Roll Dice`, `Home`, etc.) to the rest of the game systems.                                    |
