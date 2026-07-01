# ✨ Timely

A cozy, productivity-focused study companion that helps students build consistent study habits through structured focus sessions and intuitive progress tracking.

Most study apps nail the functionality but forget about the experience. I wanted something that actually felt good to open every day — so Timely pairs proven techniques like Pomodoro sessions, streak tracking, and progress visualization with a cozy pastel aesthetic, instead of yet another sterile productivity dashboard.

**[Try it live →](https://timely-anushka-reece.vercel.app/)**

---

## Features

| Feature | What it does |
|---|---|
| 🍅 **Customizable Pomodoro Timer** | Set your own focus and break intervals and just follow the rhythm |
| 🔥 **Study Streak Tracking** | Keeps a running streak of consistent days to nudge you into showing up daily |
| 📊 **Productivity Analytics** | Daily insights, weekly progress, and a monthly overview of how you've actually been studying |
| 📈 **Focus Heatmap** | A GitHub-style heatmap that visualizes your consistency and focus patterns at a glance |
| 🔔 **Browser Notifications** | Get pinged when a session ends or a break's over, so you're not watching the clock |
| 💾 **Local Storage Persistence** | Preferences and history save right in the browser — no account, no sign-up, no friction |
| 📱 **Responsive Design** | Works just as well on your phone or tablet as it does on desktop |

---

## Tech Stack

| Layer | Tools |
| **Frontend** | React 19, TypeScript, Vite |
| **Routing & Data** | TanStack Start, TanStack Router, TanStack Query |
| **Styling & UI** | Tailwind CSS, Radix UI |
| **Data & APIs** | Recharts, Browser Notifications API, Local Storage |
| **Deployment** | Vercel |

---

## Project Highlights

- Designed and built a full productivity web app from scratch, not just a template
- Pomodoro timer with fully customizable session lengths
- Analytics dashboards built on real interactive charts (Recharts), not static numbers
- Browser-based notifications wired up for session/break alerts
- Fully responsive component set, tested across screen sizes
- Iterated on through actual daily personal use, not just a demo run
- Deployed and running in production on Vercel

---

## A Deployment Hiccup Worth Mentioning

Everything ran fine locally, then broke the moment I deployed to Vercel. Turned out to be the TanStack Start + Nitro build config — it didn't have a Vercel target specified by default, so the build didn't know how to package itself for Vercel's runtime. Once that was set explicitly, deployment went through clean.

---

## Status


| **Version** | 1.0 — Feature Complete |
| **Usage** | Actively used daily, not a shelved side project |

---

## Links


| **Live demo** | [timely-anushka-reece.vercel.app](https://timely-anushka-reece.vercel.app/) |
| **Source code** | [github.com/anushkajha366-oss/focus-timely](https://github.com/anushkajha366-oss/focus-timely) |

---

## Author

**Anushka Jha**

## Screenshots

<img width="1918" height="868" alt="Screenshot 2026-06-23 102001" src="https://github.com/user-attachments/assets/ae5bb6a9-3bf3-4cf7-892e-741b17571eb5" />
<img width="1901" height="856" alt="Screenshot 2026-06-23 102110" src="https://github.com/user-attachments/assets/6043f825-cc72-40e5-9dc4-bf9d3a788ebf" />
<img width="1918" height="862" alt="Screenshot 2026-06-23 102017" src="https://github.com/user-attachments/assets/c2b30a0c-f733-4c1a-a6b1-53b1346b58d0" />




## Live Demo

[View Timely Live](https://timely-anushka-reece.vercel.app/)

## Source Code

https://github.com/anushkajha366-oss/focus-timely


