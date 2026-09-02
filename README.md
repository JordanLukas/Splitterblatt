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

## Hosting

The app is a fully static site — any static host works. This repo is set up for **GitHub Pages**:

1. Repo → **Settings → Pages** → Source: *Deploy from a branch*, branch `main`, folder `/ (root)`.
2. The app is then live at `https://<user>.github.io/<repo>/`.
3. Every path in the app is relative, so it also runs from a sub-path or a plain local file server (`python -m http.server` etc.).

### Updates and the service worker

[`sw.js`](sw.js) serves `index.html` **network-first**: while the device is online it always loads the latest deployed version, and only falls back to the cached copy when offline. Icons, fonts and the Lobby's CDN libraries are cached cache-first. So a normal deploy reaches every device on its next online launch — no cache-busting needed.

If a device ever seems stuck on an old build, use **⚙ Settings → "App-Cache leeren & neu laden"** in the app (keeps all characters and settings), or bump `CACHE` in `sw.js`.

## Settings (⚙, top right)

- **Debug-Protokoll** — logs every Lobby connection step (ICE gathering, Firebase room, data channel, timeouts) into the bottom log. Turn it on before reporting a connection problem.
- **Backup** — export/import the full state (all characters + settings) as JSON. The export also contains your uploaded Firebase config, so treat the backup file as private.
- **Lobby-Verbindung (Firebase)** — upload / replace / remove the Firebase config (also reachable from the Lobby panel).
- **Cache & Speicher** — clear the PWA cache, or wipe all local data on this device (with confirmation).

## Multiplayer Lobby setup (optional)

The Lobby feature lets multiple devices see a shared, live combat overview. It uses [Firebase Realtime Database](https://firebase.google.com/) purely to help two devices find each other (a temporary "room code" exchange) — the actual connection runs directly between devices afterward, and no character or session data ever passes through Firebase.
Each device that wants to use the Lobby needs its own copy of the Firebase config uploaded once (⚙ Settings → *Lobby-Verbindung*, or the Lobby panel). One player creates a lobby and shares the generated room code; others join with that code.

The WebRTC connection is peer-to-peer with a public STUN server and **no TURN relay**, so it is designed for devices **on the same local network / table**. Cross-network play (e.g. two households on mobile data) often fails at NAT traversal — the debug log will then show `0 via STUN` / a stuck `connecting` state.

### Realtime Database rules

The Lobby only ever needs a short-lived `rooms/<code>` node for the WebRTC handshake. Lock the database down to exactly that in Firebase Console → Realtime Database → **Rules**:

```json
{
  "rules": {
    "rooms": {
      "$code": {
        ".read": true,
        ".write": true,
        ".validate": "newData.hasChild('offer') || newData.hasChild('answer')"
      }
    }
  }
}
```

Rooms are removed automatically once the connection is established, when the host leaves the Lobby, and on tab close (`onDisconnect`). The handshake payload contains local network addresses (normal for WebRTC), so anyone with the 6-character code can read it during the few seconds a room is open — treat room codes as single-use.

## License

See [LICENSE](LICENSE) (Apache 2.0) for this project's own code. Splittermond itself is a separate, commercially licensed game system — this tool does not include or redistribute any of its copyrighted rules text.
