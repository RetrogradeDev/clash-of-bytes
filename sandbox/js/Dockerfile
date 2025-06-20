FROM node:20-alpine

WORKDIR /app
COPY runner.js .

RUN adduser -D sandbox && chown -R sandbox /app
USER sandbox

ENTRYPOINT ["node", "runner.js"]
