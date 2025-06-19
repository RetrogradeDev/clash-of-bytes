FROM python:3.12-alpine

WORKDIR /app

# Copy runner script
COPY runner.py .

# Prevent writing to FS
RUN adduser -D sandbox && chown -R sandbox /app
USER sandbox

ENTRYPOINT ["python", "runner.py"]
