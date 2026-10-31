# Stitches src/ into one self-contained page: index.html (served by GitHub Pages, uploadable to itch.io).
# Usage: python build.py
from pathlib import Path

root = Path(__file__).parent
src = root / "src"
head = (src / "head.html").read_text(encoding="utf-8")
parts = ["audio.js", "art.js", "engine.js", "game.js", "story.js"]
script = "\n".join((src / p).read_text(encoding="utf-8").replace("'use strict';", "") for p in parts)

cut = head.index("</style>") + len("</style>")
page = (
    "<!doctype html>\n<html lang=\"en\">\n<head>\n<meta charset=\"utf-8\">\n"
    "<meta name=\"viewport\" content=\"width=device-width, initial-scale=1, viewport-fit=cover\">\n"
    + head[:cut]
    + "\n</head>\n<body>\n"
    + head[cut:]
    + "\n<script>\n'use strict';\n"
    + script
    + "\n</script>\n</body>\n</html>\n"
)
(root / "index.html").write_text(page, encoding="utf-8")
print("built index.html,", len(page), "bytes")
