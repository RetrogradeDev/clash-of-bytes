PORT="$1"

kill -9 $(lsof -ti ":$PORT") 2>/dev/null
git pull

# Check if bun is installed
if ! command -v bun &> /dev/null; then
    echo "bun is not installed. Please install bun to continue."
    exit 1
fi

# Check if docker is installed
if ! command -v docker &> /dev/null; then
    echo "docker is not installed. Please install docker to continue."
    exit 1
fi

bun x prisma generate

# Setup sandbox docker images
cd sandbox/py
docker build -t my-python-runner .
cd ../js
docker build -t my-javascript-runner .

cd ..

bun install --production
bun run build
bun run start --port "$PORT"