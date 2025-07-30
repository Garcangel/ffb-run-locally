# Local Game Loader: Quick Guide

This document explains how to launch local FFB games for development/testing using the provided scripts.

---

## TL;DR

1. **After compiling, run:**
   `node extract.js`
2. **Edit `local-teams.json`** with your teams and coaches.
3. **Start the server:**
   `node runServer.js`
4. **Start the game clients:**
   `node startGames.js`
   (or `node startGames.js 1` for the first, `node startGames.js 2` for the second)
5. **If prompted, restart the server** after any new teams/rosters are downloaded.
6. **To spectate the game:**
   `node spectate.js`
   (or `node spectate.js YourCoachName` for a custom coach name)

---

## 1. **After Compiling**: Extract Updated Server & Client

**Whenever you compile a new server or client:**

- **Run:**

  ```
  node extract.js
  ```

- This extracts the latest Java server and client files into the `/server` and `/client` folders used by your local test scripts.

---

## 2. **Edit Your Teams/Coaches**

- Open `local-teams.json` in the root.
- Edit team IDs, coach names, and passwords as needed.

  ```json
  [
    { "id": "1111158", "coach": "CoachOne", "password": "pw1" },
    { "id": "1163833", "coach": "CoachTwo", "password": "pw2" }
  ]
  ```

---

## 3. **Start the Server**

- From root, run:

  ```
  node runServer.js
  ```

---

## 4. **Start the Game Clients**

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

## 5. **Automatic Setup**

- If a required team or roster XML is missing, the script downloads it automatically.
- If any files are downloaded, you will see:

  ```
  === STOP ===
  One or more teams/rosters were downloaded. Please RESTART the server, then re-run this script.
  ```

  **You must restart the server after new teams/rosters are added!**

---

## 6. **Where Do I Configure?**

- All team/coach info is read from `local-teams.json`.
- The server must be running from the `server/` folder (`runServer.js` does this for you).
- Game clients launch from the `client/` folder.

---

## 7. **Start a Spectator Client**

- To launch a spectator client (view-only, no team control):

  ```
  node spectate.js
  ```

  - To use a custom coach name:

    ```
    node spectate.js YourCoachName
    ```

  - By default, the coach name is **Testito**.

- The spectator client connects to `localhost:22227`.

---

## 8. **FAQ**

**Q: Can I change teams/coaches without restarting the server?**
A: Only if the XMLs are already present. If new teams/rosters are downloaded, restart the server.

**Q: Where are XML files stored?**
A: In `server/teams/` and `server/rosters/`.

**Q: What about passwords?**
A: The script creates coaches in the DB if they don’t exist, using the plain password in `local-teams.json`. (Passwords are stored as MD5 hashes.)

---
