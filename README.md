# UCO — Universiti Malaya Cooking Oil Tracker

A mobile-first web app built for the 9-student project team tracking a **300.0 kg** used cooking oil recycling drive across Universiti Malaya (KK1–KK13 & Faculty Cafeterias).

---

## Deployment (Vercel)

This application is built for direct deployment on **Vercel** with zero build configuration.

### 1. Deploy to Vercel
* Push this repository to GitHub and import it into [Vercel](https://vercel.com/new), or run `vercel` via CLI:
  ```bash
  vercel
  ```
* No build command or framework preset needed (leave defaults as Static / Other).

### 2. Multi-Phone Sync (Vercel KV — Optional, 1-Click)
By default, the app stores entries in local cache and connects automatically to the built-in serverless endpoint (`/api/records`).

To make all 9 teammates permanently share and sync data across their phones in real time:
1. In your **Vercel Project Dashboard**, go to the **Storage** tab.
2. Click **Create Database** → Select **KV** (Powered by Upstash, 100% free tier).
3. Connect the KV database to your project. Vercel automatically injects `KV_REST_API_URL` and `KV_REST_API_TOKEN`.
4. Redeploy. All 9 team members will now read and write to the same central database in real time.

---

## Key Features

1. **Apple Dynamic Island (Live 300 kg Target):**
   * Live count-up display (`18.5 / 300.0 kg`), thin gradient progress indicator, and week 8 target pacing.
2. **Interactive Campus Map:**
   * **All 13 Kolej Kediaman (KK1 – KK13)** mapped with verified OpenStreetMap coordinates.
   * **9 Faculty Cafeterias** (Edu Fac, FCSIT, Engineering, Arts, Business, Science, Built Environment, Law, Medicine).
   * Keyless Humanitarian OpenStreetMap tiles (100% free, no API keys, no watermarks).
   * Tapping any pin highlights the college and opens the log sheet with the location pre-selected.
3. **Tactile Record Pickup Sheet:**
   * Quick collector chip selector for all 9 teammates (`Jitesh`, `Chee Keat`, `Mingdao`, `Norman`, `Zayn`, `Yong Jiang`, `Zhi Heng`, `Zhuo Lin`, `Ariq`).
   * Tactile weight stepper (`−1.0`, `−0.5`, `+0.5`, `+1.0`, `+5.0`) & direct input.
   * Photo proof uploader with automatic client-side canvas compression down to ~50KB.
4. **Quick Look Photo Lightbox:**
   * Tapping any photo thumbnail in the Activity feed opens a full-screen blurred preview displaying the scale reading, college, and collector.
5. **Academic Environmental Impact (Course Requirement):**
   * Real-time calculation of CO₂e offset ($kg \times 2.85$), biodiesel yield ($kg \times 0.92\text{ L}$), and clean water preserved ($kg \times 1,000,000\text{ L}$).

---

## File Structure

```text
├── index.html        # Clean, semantic Apple-style interface
├── style.css         # SF Pro / Apple design system with native spring curves
├── app.js            # Map logic, canvas photo compression, and sync engine
├── vercel.json       # Clean URLs & CORS configuration
├── api/
│   └── records.js    # Vercel serverless function (KV / memory store)
└── README.md
```
