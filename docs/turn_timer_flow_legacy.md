## Overview

This document outlines how turn time is currently tracked and managed in the FUMBBL Java server. It includes class responsibilities, timing data flow, and key method interactions.

---

## Turn Time Structure

### Game Time vs. Turn Time

| Timer Type    | Stored In   | Reset On   | Updated By                         |
| ------------- | ----------- | ---------- | ---------------------------------- |
| Game Time     | `Game`      | Game start | `UtilServerTimer.syncTime()`       |
| Turn Time     | `Game`      | Turn start | `UtilServerTimer.syncTime()`       |
| Turn Start TS | `GameState` | Turn start | `UtilServerTimer.startTurnTimer()` |

---

## Key Classes

### `Game`

- Holds **persistent match state**.
- Relevant fields:

  - `turnTime`: `long` — time elapsed in **current turn**
  - `gameTime`: `long` — total elapsed game time
  - `timeoutPossible`: `boolean` — true if player exceeded allowed turn time

### `GameState`

- Holds **transient runtime info**.
- Relevant fields:

  - `turnTimeStarted`: `long` — timestamp when current turn began

### `UtilServerTimer`

- Main class for time tracking logic.
- Not threaded; relies on periodic polling (`syncTime()`).
- Methods:

  - `startTurnTimer(GameState, now)` → sets `turnTimeStarted`
  - `stopTurnTimer(GameState, now)` → sets `turnTime` and clears `turnTimeStarted`
  - `syncTime(GameState, now)`:

    - Calculates and sets `gameTime`
    - Updates `turnTime`
    - Flags `timeoutPossible` if threshold passed

### `ServerGameTimeTask`

- A `TimerTask` scheduled by `FantasyFootballServer`.

- **Runs once every second** (`1000ms`) via:

  ```java
  serverTimer.scheduleAtFixedRate(new ServerGameTimeTask(this), 1000, 1000);
  ```

- On each tick:

  - Iterates over all active `GameState` instances.

  - Calls `UtilServerTimer.syncTime(gameState, currentTimeMillis)`.

  - Sends updated game time to all clients:

    ```java
    fServer.getCommunication().sendGameTime(gameState);
    ```

---

## Flow: Start of a New Turn

1. `game.setTurnTime(0)` — clears previous turn time.
2. `UtilServerTimer.startTurnTimer(...)` — stores `System.currentTimeMillis()` in `GameState.turnTimeStarted`.
3. Every second, `ServerGameTimeTask.run()` → calls `syncTime()`:

   - Calculates current turn duration = `now - turnTimeStarted`
   - Updates `game.turnTime`
   - If `turnTime >= TURNTIME_LIMIT`, sets `timeoutPossible = true`

---

## Flow: End of Turn

1. `UtilServerTimer.stopTurnTimer(...)` is called

   - Sets `game.turnTime = now - turnTimeStarted`
   - Clears `turnTimeStarted = 0`

---

## Enforcing Timeout

- `timeoutPossible = true` is **only a flag**.
- It is up to higher-level logic (not yet covered in current trace) to:

  - Detect this flag
  - Force-end the turn or enable timeout button

---

## Summary of Fields

```java
// Game.java
private long turnTime;
private long gameTime;
private boolean timeoutPossible;

// GameState.java
private long turnTimeStarted;
```

---
