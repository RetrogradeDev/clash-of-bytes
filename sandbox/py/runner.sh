#!/bin/sh

# Read the code from stdin into a variable
code=$(cat)

# Timeout in seconds
TIMEOUT=20

echo "$code" | timeout "$TIMEOUT" python -c "$(cat)"

# Kill self just to be safe
kill $$
