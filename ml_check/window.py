from collections import deque
import numpy as np
from typing import Optional

from config import WINDOW_SIZE, MIN_WINDOW_FOR_MEAN, EMBED_DIM


class SlidingWindow:
    """
    Maintains a rolling window of recent normalized embeddings, plus an online mean vector.
    """
    def __init__(self, capacity: int = WINDOW_SIZE, dim: int = EMBED_DIM):
        self.capacity = capacity
        self.dim = dim
        self._vecs = deque(maxlen=capacity)
        self._sum = np.zeros((dim,), dtype=np.float64)  # higher precision for accumulation

    def push(self, vec: np.ndarray) -> None:
        if vec.ndim != 1 or vec.shape[0] != self.dim:
            raise ValueError(f"Vector must be shape ({self.dim},), got {vec.shape}")
        if len(self._vecs) == self.capacity:
            # removing oldest from sum
            oldest = self._vecs[0]
            self._sum -= oldest
        self._vecs.append(vec)
        self._sum += vec

    def size(self) -> int:
        return len(self._vecs)

    def mean(self) -> Optional[np.ndarray]:
        n = self.size()
        if n < MIN_WINDOW_FOR_MEAN:
            return None
        m = (self._sum / n).astype(np.float32)
        # normalize mean to keep cosine interpretation stable
        norm = np.linalg.norm(m)
        if norm == 0:
            return None
        return (m / norm).astype(np.float32)
