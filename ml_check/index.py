from typing import Tuple, Optional, List
import numpy as np
from collections import deque
import time

from config import EMBED_DIM, MAX_INDEX_SIZE, REBUILD_EVERY, K_NEIGHBORS, MIN_NEIGHBORS

# FAISS can be absent in some environments; we hard-require it here as requested.
import faiss


def _build_faiss_index(dim: int) -> faiss.Index:
    # Cosine distance via normalized vectors + IndexFlatIP
    return faiss.IndexFlatIP(dim)


class RollingFaissIndex:
    """
    Keeps only the most recent MAX_INDEX_SIZE normalized embeddings.
    When capacity is exceeded, drops oldest entries and periodically rebuilds FAISS to purge them.

    - add(vec, id): adds normalized vector and id
    - search(vec, k): returns (scores, ids) with inner-product similarities
    """
    def __init__(self,
                 dim: int = EMBED_DIM,
                 max_size: int = MAX_INDEX_SIZE,
                 rebuild_every: int = REBUILD_EVERY):
        self.dim = dim
        self.max_size = max_size
        self.rebuild_every = rebuild_every

        self._id_queue: deque[int] = deque(maxlen=max_size)
        self._vec_queue: deque[np.ndarray] = deque(maxlen=max_size)

        self._faiss: faiss.Index = _build_faiss_index(dim)
        self._id_map: List[int] = []  # position -> id
        self._adds_since_rebuild = 0

    @property
    def size(self) -> int:
        return len(self._id_queue)

    def _rebuild(self) -> None:
        start = time.time()
        self._faiss = _build_faiss_index(self.dim)
        if self.size > 0:
            mat = np.vstack(self._vec_queue).astype(np.float32, copy=False)
            self._faiss.add(mat)
            self._id_map = list(self._id_queue)
        else:
            self._id_map = []
        self._adds_since_rebuild = 0
        _ = time.time() - start  # can log if needed

    def add(self, vec: np.ndarray, id_: int) -> None:
        """
        vec must be L2-normalized shape (dim,)
        """
        if vec.ndim != 1 or vec.shape[0] != self.dim:
            raise ValueError(f"Vector must be shape ({self.dim},), got {vec.shape}")

        # Detect overflow: if deque is full, appending will evict oldest silently.
        will_evict = (self.size == self.max_size)

        self._id_queue.append(id_)
        self._vec_queue.append(vec.astype(np.float32, copy=False))
        self._adds_since_rebuild += 1

        # Fast path: if not evicting, we can incremental-add to FAISS.
        if not will_evict:
            self._faiss.add(vec.reshape(1, -1).astype(np.float32))
            self._id_map.append(id_)
            return

        # If we evicted, FAISS still holds old vectors—mark dirty and rebuild periodically.
        if self._adds_since_rebuild >= self.rebuild_every:
            self._rebuild()

    def ensure_built(self):
        if self._faiss.ntotal != self.size:
            # If we got out of sync (e.g., after many evictions), hard rebuild.
            self._rebuild()

    def search(self, vec: np.ndarray, k: int = K_NEIGHBORS) -> Tuple[np.ndarray, np.ndarray]:
        """
        Returns (sims, ids). If not enough vectors present, returns as many as available.
        """
        self.ensure_built()
        if self.size == 0:
            return np.array([]), np.array([], dtype=int)

        k_eff = min(k, self.size)
        D, I = self._faiss.search(vec.astype(np.float32).reshape(1, -1), k_eff)
        sims = D[0]  # inner products (cosine similarities since normalized)
        idxs = I[0]
        ids = np.array([self._id_map[i] for i in idxs], dtype=int)
        return sims, ids
