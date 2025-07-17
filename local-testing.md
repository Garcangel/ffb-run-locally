# Local Game Loader: Quick Guide

This document explains how to launch local FFB games for development/testing using the provided scripts.

---

## TL;DR

1. **Edit `local-teams.json`** with your teams and coaches.
2. **Start the server:**
   `node runServer.js`
3. **Start the game clients:**
   `node startGames.js`
   (or `node startGames.js 1` for the first, `node startGames.js 2` for the second)
4. **If prompted, restart the server** after any new teams/rosters are downloaded.

---

_(Then continue with the detailed guide as before.)_

---

If you want it even shorter or with inline code, let me know!

## 1. **Edit Your Teams/Coaches**

- Open `local-teams.json` in the root.
- Edit team IDs, coach names, and passwords as needed.

  ```json
  [
    { "id": "1111158", "coach": "CoachOne", "password": "pw1" },
    { "id": "1163833", "coach": "CoachTwo", "password": "pw2" }
  ]
  ```

---

## 2. **Start the Server**

- From root, run:

  ```
  node runServer.js
  ```

---

## 3. **Start the Game Clients**

- In a new terminal, run:

  ```
  node startGames.js
  ```

- By default, both clients will launch.

  - To launch just one client:

    ```
    node startGames.js 1    # Only CoachOne
    node startGames.js 2    # Only CoachTwo
    ```

---

## 4. **Automatic Setup**

- If a required team or roster XML is missing, the script downloads it automatically.
- If any files are downloaded, you will see:

  ```
  === STOP ===
  One or more teams/rosters were downloaded. Please RESTART the server, then re-run this script.
  ```

  **You must restart the server after new teams/rosters are added!**

---

## 5. **Where Do I Configure?**

- All team/coach info is read from `local-teams.json`.
- The server must be running from the `server/` folder (`runServer.js` does this for you).
- Game clients launch from the `client/` folder.

---

## 6. **FAQ**

**Q: Can I change teams/coaches without restarting the server?**
A: Only if the XMLs are already present. If new teams/rosters are downloaded, restart the server.

**Q: Where are XML files stored?**
A: In `server/teams/` and `server/rosters/`.

**Q: What about passwords?**
A: The script creates coaches in the DB if they don’t exist, using the plain password in `local-teams.json`. (Passwords are stored as MD5 hashes.)

---
