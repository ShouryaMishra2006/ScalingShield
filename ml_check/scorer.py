import numpy as np
from typing import Dict, Any

from config import (
    W_NEIGHBOR, W_WINDOW,
    MIN_NEIGHBORS,
    CLIP_SIM_LOWER, CLIP_SIM_UPPER,
)


def _clip_sim(s: np.ndarray) -> np.ndarray:
    return np.clip(s, CLIP_SIM_LOWER, CLIP_SIM_UPPER)


def neighbor_distance_score(neighbor_sims: np.ndarray) -> float:
    """
    Convert neighbor similarities (cosine) to a distance-like anomaly score.
    Higher = more anomalous.

    Strategy: take 1 - mean(sim) over available neighbors.
    """
    if neighbor_sims.size == 0:
        return 1.0  # no neighbors -> treat as very unusual
    sims = _clip_sim(neighbor_sims)
    k = neighbor_sims.size
    if k < MIN_NEIGHBORS:
        # penalize if too few neighbors (less confidence)
        weight = 1.0 + (MIN_NEIGHBORS - k) / MIN_NEIGHBORS
    else:
        weight = 1.0
    base = 1.0 - float(np.mean(sims))
    return float(base * weight)


def window_deviation_score(vec: np.ndarray, window_mean: np.ndarray | None) -> float:
    """
    1 - cosine(vec, mean). If mean isn't available (too few in window), return neutral 0.5.
    """
    if window_mean is None:
        return 0.5
    # both are normalized
    sim = float(np.dot(vec, window_mean))
    sim = max(min(sim, CLIP_SIM_UPPER), CLIP_SIM_LOWER)
    return 1.0 - sim


def combine_scores(neighbor_s: float, window_s: float) -> float:
    # Weighted sum; clamp to [0, 1.5] (can exceed 1 slightly if both disagree)
    s = W_NEIGHBOR * neighbor_s + W_WINDOW * window_s
    return float(max(0.0, min(1.5, s)))


def score_breakdown(vec: np.ndarray,
                    neighbor_sims: np.ndarray,
                    window_mean_vec: np.ndarray | None) -> Dict[str, Any]:
    ns = neighbor_distance_score(neighbor_sims)
    ws = window_deviation_score(vec, window_mean_vec)
    total = combine_scores(ns, ws)
    return {
        "neighbor_score": ns,
        "window_score": ws,
        "anomaly_score": total
    }
