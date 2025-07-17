# FFB Server/Client: Full Clean Setup (2025)

**Purpose:**
This guide shows you how to set up everything needed in your local `client` and `server` folders to build, run, and test the Fantasy Football Client and Server _locally_ for development and integration.

> **Disclaimer:**  
> I’m not a Java, FFB, or database expert. This guide is just what worked for me to get everything running from scratch, with all the hurdles and config quirks along the way.  
> If you spot something to improve, please let me know!

- **Recommended:** Clone the FFB repo _outside_ your project folder, and copy only the necessary files into your working `client` and `server` directories.
- All steps are for **Windows** (but most commands work cross-platform).

---

## 1. **Prerequisites**

- **Java 8 (JDK 8, not just JRE)**
- **Maven**
- **MariaDB** (or MySQL up to 5.6)
- **Node.js 18+** (optional, but required for automation scripts/tools)

**Verify:**

- Java: `java -version` should show `1.8.0_xxx`
- Maven: `mvn -v` should work
- MariaDB/MySQL: You can log in with `mysql -u root -p`
- Node (if using tools): `node -v` should show `v18.x.x` or later

---

## 2. **Clone the Repo**

```sh
git clone https://github.com/christerk/ffb.git
cd ffb
```

For Live branch:

```sh
git clone --branch Live https://github.com/christerk/ffb.git
cd ffb
```

---

## 3. **Database: Create Empty DB**

- Open MariaDB/MySQL shell:

  ```sh
  mysql -u root -p
  ```

- Create user/db (adjust names as you wish):

  ```sql
  CREATE DATABASE ffb DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
  CREATE USER '<DB_USER>'@'localhost' IDENTIFIED BY '<DB_PW>';
  GRANT ALL PRIVILEGES ON ffb.* TO '<DB_USER>'@'localhost';
  FLUSH PRIVILEGES;
  ```

- Exit SQL shell.

---

## 4. **Configure `ffb-server/server.ini`**

Edit `ffb-server/server.ini` with your DB/user credentials:

```
db.driver=com.mysql.jdbc.Driver
db.url=jdbc:mysql://localhost/ffblive
db.user=<DB_USER>
db.password=<DB_PW>
db.type=mariadb
```

also edit:

```
server.log.file=<PATH_TO_LOG>
server.log.folder=<PATH_TO_LOG_FOLDER>
```

For example:

```
server.log.file=logs/server.log
server.log.folder=logs
```

You can leave other settings default for local test.

---

## 5. **Build Everything (With Tests)**

From root (`ffb`):

```sh
mvn clean install
```

- If this fails due to test errors, use:

  ```sh
  mvn clean install -DskipTests
  ```

---

## 5.1. [If Needed] Add JAXB Dependency for XML (Java 9+)

Some Java versions don’t bundle `javax.xml.bind` (JAXB) by default.  
If you get errors about JAXB or `javax.xml.bind`, add this to your `ffb-client/pom.xml`:

```xml
<dependency>
    <groupId>javax.xml.bind</groupId>
    <artifactId>jaxb-api</artifactId>
    <version>2.3.1</version>
</dependency>
```

---

## 6. **Unpack Server Assembly**

- Go to `ffb-server/target/`
- Unzip `ffb-server.zip` into the **`server` folder of your project** (replace existing contents if updating)
- After unzipping, inside your `server` folder you should have:

  - `FantasyFootballServer.jar`
  - `server.ini`
  - `/lib` (with many .jar files)
  - Other support files/folders

> **Note:** All tools/scripts expect to find these files inside the `/server` folder of this project.

---

## 6.1. **Prepare Data Folders (`/teams`, `/rosters`, `/setups`)**

Before running the server, ensure your `/server` folder contains these subfolders:

- `/teams`    – for team XML files
- `/rosters`  – for roster XML files
- `/setups`   – for game setup XMLs

You’ll populate `/teams` and `/rosters` as you create teams for testing.
If the server complains about missing files/folders, check here first.

---

> **Tip:**
> For how to generate team and roster XMLs, see [FAQ: How do I create local team and roster XML files?](#faq-how-do-i-create-local-team-and-roster-xml-files).

---

## 7. **Initialize the Database**

(only if you have not done this before)
From **inside** your `run-server` folder:

```sh
java -cp "FantasyFootballServer.jar;lib/*" com.fumbbl.ffb.server.FantasyFootballServer standalone initDb -inifile server.ini
```

- This should create necessary DB tables.
- If you see errors about folders (`rosters`, `setups`), copy these folders from the repo root into your `run-server` folder.

---

## 8. **Start the Server**

You can start the server in either of these ways (from the `/server` folder):

**A.** Using the Java command:

```sh
java -cp "FantasyFootballServer.jar;lib/*" com.fumbbl.ffb.server.FantasyFootballServer standalone -inifile server.ini
```

**B.** Or, if provided in your project, simply run:

```sh
node ../runServer.js
```

(from `/server`, or adjust the path if running from project root)

- You should see logging about Jetty starting and server running on your configured port.

---

> **Note:** `runServer.js` is a Node script that launches the Java server for you (recommended for local testing if available).

---

## 9. **Unpack Client Assembly**

- Go to `ffb-client/target/`
- Unzip `ffb-client.zip` directly into your project’s `/client` folder (overwrite or clean as needed).
- After unzipping, inside your `/client` folder you should have:

  - `FantasyFootballClient.jar`
  - `FantasyFootballClientResources.jar`
  - `/lib` (with many `.jar` files)

> **Note:**
> Your `/client` folder should be in the root of this project (not in a separate temp or test directory).
> This ensures that Node tools and automation scripts will find the required files and work out-of-the-box.

## 10. **Run the Client**

From inside your `run-client` folder:

### For spectator mode:

```sh
java -cp "FantasyFootballClient.jar;FantasyFootballClientResources.jar;lib/*" com.fumbbl.ffb.client.FantasyFootballClientAwt -spectator -coach <YourCoachName> -server localhost -port 22227
```

- Example:

  ```sh
  java -cp "FantasyFootballClient.jar;FantasyFootballClientResources.jar;lib/*" com.fumbbl.ffb.client.FantasyFootballClientAwt -spectator -coach Garcangel -server localhost -port 22227
  ```

---

### Player mode:

```sh
java -cp "FantasyFootballClient.jar;FantasyFootballClientResources.jar;lib/*" com.fumbbl.ffb.client.FantasyFootballClientAwt -player -coach <YourCoachName> -teamId <teamId> -teamName "<TeamName>" -server localhost -port 22227 -auth <md5HexPassword>
```

- **Note:**

  - You can leave `<TeamName>`, the server will use the name from the XML.
  - The `-auth` parameter is optional. If omitted, the client will prompt for your password.
    For automation or scripts, use `-auth <md5HexPassword>`, where the hash is from your `ffb_coaches` database table.

- Example with auth:

  ```sh
  java -cp "FantasyFootballClient.jar;FantasyFootballClientResources.jar;lib/*" com.fumbbl.ffb.client.FantasyFootballClientAwt -player -coach Garcangel -teamId 1111158 -teamName "<TeamName>" -server localhost -port 22227 -auth 827ccb0eea8a706c4c34a16891f84e7b
  ```

---

> **Tip:**
> For local testing, you can automate launching one or both clients using the included Node script:
>
> ```sh
> node startGames.js
> ```
>
> This will read the `local-teams.json` config and handle team XML, coach setup, and launch players automatically.
>
> For details, see [local-testing.md](local-testing.md).

**Tip:**
For **how to generate the MD5 hash for `-auth` on Windows, Linux, or macOS,**
see the [“How to generate an MD5 hash” section in the FAQ](#faq-how-to-generate-an-md5-hash) at the end of this guide.

---

---

# FAQ

**Q: Where should I put `rosters` and `setups`?**  
A: Only the server requires these. Place them in your `run-server` folder if errors occur.
For details on how to create or download valid roster files, see [FAQ: How do I create local team and roster XML files?](#faq-how-do-i-create-local-team-and-roster-xml-files)

**Q: Do I need to re-initialize the DB after each rebuild?**
A: **NO.** Only if the schema changes or you want a clean DB.
**Tip:** For info on manually adding coach users to MariaDB, see the [Appendix: MariaDB Access & User Management](#appendix-mariadb-access-tables--add-a-user) at the end.

**Q: Do I need to re-copy INI files after each build?**
A: Yes, if you rebuild and re-unzip into a fresh run directory.

**Q: Can I run both client and server on the same PC?**
A: Yes.

---

## FAQ: How do I create local team and roster XML files?

- **To generate valid local team XML files** for use with the FFB server/client, use the script:
  `tools/fumbblTeamDownload.js`

- **Usage:**
  Run the script and provide the **FUMBBL team ID** you want to download.
  This script will fetch the team data and create the required XML file in the `/teams` folder.

- **Note:**
  You’ll need the **teamId** (from FUMBBL) to use this tool.

- **Rosters:**
  The script will also download the corresponding roster XML automatically into the `/rosters` folder if needed.

  Absolutely! Here’s a concise “Pro tip” you can drop under the FAQ section—ideally after the “How do I create local team and roster XML files?” entry or just before the local-testing section:

---

> **Tip:**
> If you are using the Node-based `startGames.js` launcher in this project,
> it will **automatically download any missing team and roster XML files** for the teams you specify, so you usually do **not** need to run manual scripts for development and testing.
> See [local-testing.md](local-testing.md) for details.

---

> **Important:**
> If you add new team or roster XML files (for example, when the Node automation scripts download missing data), you **must restart the server** before those changes will be recognized.
>
> The Node scripts will automatically warn you if a restart is needed.

---

## FAQ: Maven “Files\Eclipse was unexpected at this time.” (Windows)

**Problem:**
When running `mvn` (Maven) or `java` commands, you see the error:

```
Files\Eclipse was unexpected at this time.
```

**Cause:**
Your `JAVA_HOME` (or `PATH`) contains a folder with spaces (like `C:\Program Files\...`).
Maven and Java can break if these paths are not properly quoted or if short paths (8.3) are not used.

**Solution:**
**1.** Find the short (8.3) path for your JDK, e.g.

- `C:\Program Files\Eclipse Adoptium\jdk-8.0.452.9-hotspot`
  ➡️ becomes
- `C:\PROGRA~1\ECLIPS~1\JDK-80~1.9-H`

**2.** Open “Edit environment variables” in Windows.
**3.** Change `JAVA_HOME` to use the short path above.
**4.** Update any `Path` entries with the same method.
**5.** Restart your terminal/editor after saving.
**6.** Test with:

```cmd
mvn -version
java -version
```

**They should work without errors.**

**Note:** This must be repeated for every Windows profile or system-wide as needed.
If you install a new JDK, recheck the short path.

---

## FAQ: How to generate an MD5 hash?

### **Windows (PowerShell):**

Paste this into PowerShell, replacing `"yourpassword"` with your actual password:

```powershell
[System.BitConverter]::ToString((New-Object -TypeName System.Security.Cryptography.MD5CryptoServiceProvider).ComputeHash([System.Text.Encoding]::UTF8.GetBytes("yourpassword"))).Replace("-", "").ToLower()
```

---

### **Windows (GUI):**

- Use a reputable online MD5 generator, e.g. [https://emn178.github.io/online-tools/md5.html](https://emn178.github.io/online-tools/md5.html)
- Or download [md5sum.exe](https://eternallybored.org/misc/md5/) and run:

  ```cmd
  echo yourpassword | md5sum
  ```

---

### **Linux/macOS:**

Open a terminal and run:

```sh
echo -n "yourpassword" | md5sum
```

---

**Use the resulting hash as your `-auth` value.**
Example:

```sh
... -auth 827ccb0eea8a706c4c34a16891f84e7b
```

---

## Appendix: MariaDB – Access Tables & Add a User

## 1. Connect to MariaDB

```sh
mysql -u root -p
```

Enter your password.

## 2. Select the Database

```sql
USE ffb;
```

## 3. Show Tables

```sql
SHOW TABLES;
```

## 4. To see all rows in the ffb_coaches table

```sql
SELECT * FROM ffb_coaches;;
```

## 5. Add a Coach User

(Example: name `Garcangel`, password `12345`—hashed with MD5)

```sql
INSERT INTO ffb_coaches (name, password) VALUES
  ('Garcangel', '827ccb0eea8a706c4c34a16891f84e7b');
```
