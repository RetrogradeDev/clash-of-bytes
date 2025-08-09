#!/bin/sh

# Read the code from stdin into a variable
code=$(cat)

# Timeout in seconds
TIMEOUT=5

echo "$code" | timeout "$TIMEOUT" node -e "$(cat)"

# Kill self just to be safe
kill $$
