# View.me

## Portfolio & Calisthenics Graph Engine

A personal portfolio landing page integrated with a robust high-performance Rust backend engine designed to track complex calisthenics skill progressions.

---

## Current Project State
* **Frontend:** A minimalist landing page containing a hardcoded grid dashboard showing the progress of the current projects.
* **Backend:** A compiled systems-level Rust server (Axum + Tokio) actively serving graph data configurations over a secure `/api/exercises` network route. 

---

## Getting Started

### Prerequisites
Ensure your local system has the native Rust compiler toolchain initialized:
```
rustc --version
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
- [ ] Connect the frontend landing page to dynamically pull project card data from the server.
- [ ] Build the JavaScript visualization canvas to render calisthenics exercises as an interactive multi-parent graph web.
- [ ] Seamlessly merge this landing page to another dashboard project.
- [ ] Implement local folder-tiling structural views for easier dashboard navigation.
- [ ] Integrate user tracking to mark movements as `unlocked` or `completed` in real time.
- [ ] Design and implement a mobile-responsive daily logging module to schedule workouts, track real-time activities, and synchronize active metrics.
- [ ] Build a modular language acquisition tracker featuring visual progress metrics, streak counts, and milestone validation bars.
- [ ] Integrate a centralized script and automation database with advanced local query search and syntax-highlighted algorithm previews.
- [ ] Refactor the core landing page layout into a production-grade showcase, integrating custom viewport cursor trackers and layered parallax depth effects.
- [ ] Implement a lightweight analytics layer to visually map workout performance trends, volume tracking, and historical skill execution data.
- [ ] Build a secure local authentication gate to safeguard personal logging inputs and private configuration dotfiles.
- [ ] Connect the Rust backend to a dedicated storage array to architect a self-hosted, private cloud environment for personal file backups and asset streaming.
- [ ∞ ] System Integration: Permanently embed this unified dashboard into my daily lifestyle as a central hub, continuous utility engine, and lifestyle maintenance ecosystem.