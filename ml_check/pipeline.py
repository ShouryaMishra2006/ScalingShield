import itertools
from typing import Dict, Any

import numpy as np

from preprocess import clean_log
from embedder import LogEmbedder
from index import RollingFaissIndex
from window import SlidingWindow
from scorer import score_breakdown
from config import K_NEIGHBORS, ALERT_THRESHOLD


class RealtimeAnomalyPipeline:
    """
    Usage:
        pipe = RealtimeAnomalyPipeline()
        result = pipe.process("connection reset by peer ...")
        print(result["anomaly_score"])
    """
    def __init__(self):
        self._embedder = LogEmbedder()
        self._index = RollingFaissIndex()
        self._window = SlidingWindow()
        self._id_seq = itertools.count(1)

    def process(self, raw_log: str) -> Dict[str, Any]:
        """
        Ingest one log line, return a dict with scores and flags.

        Returns:
        {
          "id": int,
          "clean": str,
          "anomaly_score": float,
          "neighbor_score": float,
          "window_score": float,
          "is_anomaly": bool,
          "k_used": int
        }
        """
        clean = clean_log(raw_log)
        vec = self._embedder.encode_one(clean).astype(np.float32)

        # Query neighbors BEFORE adding this log (avoid trivial self-hit)
        sims, ids = self._index.search(vec, k=K_NEIGHBORS)

        # Window mean
        wmean = self._window.mean()

        # Scoring
        breakdown = score_breakdown(vec, sims, wmean)
        score = breakdown["anomaly_score"]

        # Now commit this log to memory
        id_ = next(self._id_seq)
        self._index.add(vec, id_)
        self._window.push(vec)

        result = {
            "id": id_,
            "clean": clean,
            **breakdown,
            "is_anomaly": bool(score >= ALERT_THRESHOLD),
            "k_used": int(sims.size),
        }
        return result
