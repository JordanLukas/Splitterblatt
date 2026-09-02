# Splitterbogen

A single-file web app (HTML/CSS/JS, no build step, no backend required) for running **Splittermond** tabletop sessions at the table — character sheet, dice checks, combat with tick-based initiative, spellcasting, and buffs/debuffs, all in one place. Optionally installable as a real app (PWA) and shareable with other players' devices in real time.

This is a personal/fan-made tool and is **not affiliated with or endorsed by Uhrwerk Verlag**, the publisher of Splittermond. It does not include any of the official rulebook text — you bring your own character data and rules knowledge.

## Features

- **Character sheet** — attributes, skills, weapons, spells, masteries, resources, equipment, all editable, plus direct import from Genesis (JSON export) or Genesis XML.
- **Dice checks** — roll your own physical dice, enter the results; the app computes the total, success/failure, degrees of success, fumbles, and triumphs. Supports standard, safety, and risk roll modes.
- **Combat** — tick-based initiative tracking, attacks, active defense, maneuvers, spellcasting in combat, and a shared combat overview across multiple of your own characters.
- **Buffs/Debuffs (Zustände)** — temporary modifiers that automatically apply to relevant rolls, with full transparency on what contributed to a result.
- **Session log** — a running, collapsible log of everything rolled and every action taken.
- **Multiplayer Lobby (optional)** — connect multiple players' devices directly to each other (WebRTC, peer-to-peer) to share a live combat/tick overview. Requires a free Firebase project for the initial handshake only; no game data is stored on any server.

## Getting started

1. Open the app (see [Hosting](#hosting) below for how it's deployed) in your browser.
2. Go to the **Charaktere** tab and either create a character manually or import one via a Genesis export.
3. Switch to the **Bogen** tab — this is your main view during play.
4. Use the ⚔ button (bottom left) to start combat when needed.

### Installing as an app (PWA)

Once hosted over `https://`, open the URL in your mobile browser and use "Add to Home Screen" (iOS Safari) or the install prompt (Android Chrome). This gives you a real app icon, full-screen launch, and offline access to the app itself (an internet connection is still required for the optional Lobby feature).

## Multiplayer Lobby setup (optional)

The Lobby feature lets multiple devices see a shared, live combat overview. It uses [Firebase Realtime Database](https://firebase.google.com/) purely to help two devices find each other (a temporary "room code" exchange) — the actual connection runs directly between devices afterward, and no character or session data ever passes through Firebase.
Each device that wants to use the Lobby needs its own copy of the Firebase config uploaded once. One player creates a lobby and shares the generated room code; others join with that code.

## License

See [LICENSE](LICENSE) (Apache 2.0) for this project's own code. Splittermond itself is a separate, commercially licensed game system — this tool does not include or redistribute any of its copyrighted rules text.
