from pipeline import RealtimeAnomalyPipeline

if __name__ == "__main__":
    pipe = RealtimeAnomalyPipeline()

    demo_logs = [
        "GET /health 200 OK",
        "GET /api/users 200 OK",
        "POST /api/login 401 Unauthorized",
        "DB timeout on pool-1 after 5s",
        "DB timeout on pool-1 after 5s",
        "DB timeout on pool-1 after 5s",
        "GET /health 200 OK",
        "Connection reset by peer from 10.1.2.3",
        "OOM killer invoked on pod orders-7bcd",
    ]

    for line in demo_logs:
        out = pipe.process(line)
        print(f"[{out['id']:04d}] score={out['anomaly_score']:.3f} "
              f"(neighbor={out['neighbor_score']:.3f}, window={out['window_score']:.3f}) "
              f"{'ANOMALY' if out['is_anomaly'] else ''} :: {line}")
