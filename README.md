# Clash of Bytes

**Clash of Bytes** is a fun, competitive coding platform where users can create and solve challenges in two exciting modes:
- ⚡ **Speed Mode**: Compete for fastest execution time (measured on our backend using Docker)
- ✂️ **Char Mode**: Solve the problem using the fewest characters

Each day, a community-submitted challenge is featured. Users can create puzzles, vote on them, submit creative solutions, and climb the leaderboard.


## Features

-  Submit your own coding puzzles (with input/output & test cases)
-  Solve puzzles directly in the browser with the Monaco editor
-  Solutions are executed safely on the backend inside Docker containers
-  Automatic execution time tracking (for Speed Mode)
-  Code character counting (for Char Mode)
-  Voting system for puzzles and solutions
-  Daily featured challenge


## Tech Stack

| Layer          | Tech                                                                                         |
| -------------- | -------------------------------------------------------------------------------------------- |
| Frontend       | [Next.js](https://nextjs.org/) + [Monaco Editor](https://microsoft.github.io/monaco-editor/) |
| Backend        | Next.js Actions + Docker container runner                                                    |
| Database       | PostgreSQL via [Prisma](https://www.prisma.io/) ORM                                          |
| Code Execution | Dockerized runtimes                                                                          |


## Getting Started

### 1. Clone the repo

```bash
git clone https://github.com/programordie2/clash-of-bytes.git
cd clash-of-bytes
````

### 2. Install dependencies

```bash
bun install
```

Or use `yarn` or `npm` if you prefer.


### 3. Set up your environment

Rename the `.env.example` to `.env` file in the root and fill out the required environment variables.
See the comments in the file for details.
Note: you will need a PostgreSQL database, if you haven't installed one yet, check out this guide: [PostgreSQL Installation Guide](https://www.w3schools.com/postgresql/postgresql_install.php).


### 4. Setup database

```bash
bun prisma push db
```


### 5. Setup Docker sandbox
Make sure you have Docker installed and running. The code execution is sandboxed using Docker containers.
To install docker, follow the instructions on the [official Docker website](https://docs.docker.com/get-docker/).

```bash
cd sandbox
cd py
docker build -t my-python-runner .
cd ../js
docker build -t my-javascript-runner .
```


### 6. Start the dev server

```bash
bun dev
```

Open [http://localhost:3000](http://localhost:3000)


## Dockerized Code Execution

The backend runs submitted code securely inside a Docker container. Currently supports:

* Python 3
* JavaScript (Node.js)

Execution is isolated per test case per request using short-lived containers. Each puzzle defines input/output test cases, and the runner compares results and tracks performance metrics.


## Submitting a Puzzle

Each puzzle must include:

* A title and description
* Example input/output
* At least one test cases


## Competitive Modes

| Mode        | Description                         |
| ----------- | ----------------------------------- |
| Speed       | Solutions ranked by execution time  |
| Least Chars | Solutions ranked by character count |


## Security Notes

* All code execution is done inside tightly sandboxed Docker containers
* No code is executed directly in the main app process


## Roadmap

* [ ] Puzzle discussion threads
* [ ] AI puzzle quality checker


## Contributing

Pull requests welcome! If you'd like to submit your own challenge logic or improve the code execution runner, feel free to fork and go wild.


## License

MIT: use it, fork it, remix it.
