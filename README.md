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
