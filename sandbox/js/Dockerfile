FROM node:20-alpine

WORKDIR /app
COPY runner.sh .

RUN adduser -D sandbox && chown -R sandbox /app
USER sandbox

ENTRYPOINT ["sh", "runner.sh"]
