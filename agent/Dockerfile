FROM debian:stable-slim
RUN apt-get update && apt-get install -y curl jq procps net-tools iproute2 && rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY watch-vm-linux.sh .
RUN chmod +x watch-vm-linux.sh
CMD ["./watch-vm-linux.sh", "http://monitor:4200/api/telemetry", "5"]
