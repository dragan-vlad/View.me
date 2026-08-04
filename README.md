# View.me

## Personal Operations Deck & Dashboard Engine

A unified, minimalist landing page and personal ecosystem backend. Powered by an asynchronous Rust engine (Axum + Tokio), it serves portfolio visualization assets, handles real-time skill progression graphs, and executes lightweight background micro-daemons (such as zero-delay IMAP notification routing).

---

## Architecture Overview
* **Web & API Server (Axum):** Serves the dashboard frontend assets and exposes REST endpoints for local state persistence.
* **Background Services (Tokio Async Daemons):** Runs non-blocking background workers, including an IMAP IDLE mail evaluator linked to the Telegram Bot API.
* **Storage Layer:** Local JSON state arrays (`commands.json`, `mail-checklist.json`) designed for fast iteration and future database binding.

---

## Current System State
* [x] **Static Server & Frontend:** Host dashboard static files and exercises graph endpoints (`/api/exercises`).
* [x] **Real-Time Mail Watcher Subsystem:** Integrated async IMAP IDLE listener executing background email category checks.
* [x] **Dynamic Rule Engine:** Exposed `/api/checklist` GET and POST routes to read/modify mail evaluation parameters in real time.

---

## Getting Started

### Prerequisites
Ensure your local system has the native Rust compiler toolchain initialized:
```
rustc --version
```

### Environment Variables
To enable background mail daemon, export your credential before running the server: (recommended to make a .env file)
```
export TELEGRAM_BOT_TOKEN="your_bot_token"
export TELEGRAM_CHAT_ID="your_chat_id"
export IMAP_USER="your_email@gmail.com"
export IMAP_PASS="your_app_password"
```

### How to run the server
```
cd server
cargo run
```

After the compilation it should appear the message that the server is running live at `http://localhost:3000`. 
Open your browser or Ctr+click / Cmd+click on the terminal link to open in your default browser. 

## To Do:

- [ ] Sketch and map out the full calisthenics skill progression data points inside `commands.json`.
- [ ] Connect the frontend landing page to dynamically pull project card data from the `/api/exercises`.
- [ ] Build the JavaScript visualization canvas to render calisthenics exercises as an interactive multi-parent graph web.
- [ ] Build a visual UI panel to view and append rules to the email checklist API (/api/checklist).
- [ ] Seamlessly merge this landing page to another dashboard project.
- [ ] Implement local folder-tiling structural views for easier dashboard navigation.
- [ ] Integrate user tracking to mark movements as `unlocked` or `completed` in real time.
- [ ] Design and implement a mobile-responsive daily logging module to schedule workouts, track real-time activities, and synchronize active metrics.
- [ ] Build a modular language acquisition tracker featuring visual progress metrics, streak counts, and milestone validation bars.
- [ ] Integrate a centralized script and automation database with advanced local query search and syntax-highlighted algorithm previews.
- [ ] Refactor the core landing page layout into a production-grade showcase, integrating custom viewport cursor trackers and layered parallax depth effects.
- [ ] Implement a lightweight analytics layer to visually map workout performance trends, volume tracking, and historical skill execution data.
- [ ] Design and implement a mobile-responsive daily logging module.
- [ ] Build a secure local authentication gate to safeguard personal logging inputs and private configuration dotfiles.
- [ ] Connect the Rust backend to a dedicated storage array to architect a self-hosted, private cloud environment for personal file backups and asset streaming.
- [ ∞ ] System Integration: Permanently embed this unified dashboard into my daily lifestyle as a central hub, continuous utility engine, and lifestyle maintenance ecosystem.