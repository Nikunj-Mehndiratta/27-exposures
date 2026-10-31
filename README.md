# 27 Exposures

A first-person horror game that runs in the browser. Made for [Hack Club Scare](https://scare.hackclub.com).

**[Play it here](https://nikunj-mehndiratta.github.io/27-exposures/)** — headphones on, lights off.

> October 31st, 2:51 AM. The night after Grandma's funeral, the power went out.
> Your phone is dead. The front door is deadbolted from the inside.
> Her key is in her bedroom, at the end of the hall.
> All you have is the disposable camera from her kitchen drawer.
> 27 exposures.

## How it plays

- **You can only see when the flash fires.** Each photo freezes on screen, then fades into an afterimage. Between flashes the house is dark, and your eyes slowly adjust (until the next flash ruins your night vision).
- **It can't move while it's being looked at.** It only moves in the dark, between your photos.
- **The camera is your only weapon.** Flash it in the face up close and it backs off. Every shot costs film, you have to wind the film after each one, and the flash needs time to recharge.
- **Listen.** Its footsteps and breathing come from where it actually is, the grandfather clock stops ticking when it's near, and it hears you run.
- When you make it out, the roll gets developed.

## Controls

| Action | Keyboard / mouse | Touch |
| --- | --- | --- |
| Move | WASD or arrow keys | Left stick |
| Look | Mouse (click to capture it) | Drag |
| Take a photo | Click or Space | FLASH |
| Wind the film | R or mouse wheel | WIND |
| Pick up / unlock | E (hold at the door) | USE |
| Run (it hears you) | Shift | — |

Gentle mode on the title screen dims the flash, softens the scream and turns off screen shake.

## How it's built

No libraries, no image files, no audio files. Everything is drawn and synthesized at runtime:

- `src/engine.js` — the house map and a raycaster that renders at 256×144, with the camera-flash lighting model, eyeshine and moonlit windows.
- `src/art.js` — every wall texture, sprite and the jumpscare face, painted with canvas calls on startup.
- `src/audio.js` — Web Audio synthesis: positional footsteps and breathing, the flash's charging whine, the scream.
- `src/game.js` — input, the camera, the creature's pathfinding.
- `src/story.js` — scripted scares, the hunt, the ending.
- `src/head.html` — page markup and styles.

`index.html` is generated. After editing anything in `src/`, rebuild it:

```bash
python build.py
```

Then open `index.html` in a browser, or serve the folder with `python -m http.server`.

---

Built with Claude (Anthropic) as a coding assistant.
