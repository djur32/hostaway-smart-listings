#!/bin/bash
# Headless screenshot of a prototype route, safe for parallel agents (own Chrome profile per run; killed after the shot).
# Usage: tools/shot.sh <route e.g. /property/neukolln/ch/airbnb/listing?tips=1> <out.png> [width] [height]
R="$1"; OUT="$2"; W="${3:-1440}"; H="${4:-1000}"
PROFILE=$(mktemp -d); rm -f "$OUT"
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless=new --disable-gpu --hide-scrollbars --no-first-run --user-data-dir="$PROFILE" \
  --window-size="$W,$H" --virtual-time-budget=4000 --screenshot="$OUT" "http://localhost:5174$R" >/dev/null 2>&1 &
PID=$!
for i in $(seq 1 60); do [ -s "$OUT" ] && sleep 1 && break; sleep 0.5; done
kill $PID 2>/dev/null; pkill -f "user-data-dir=$PROFILE" 2>/dev/null; rm -rf "$PROFILE"
[ -s "$OUT" ] && echo "$OUT" || echo "FAILED $R"
