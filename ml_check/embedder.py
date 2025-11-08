from typing import List
import numpy as np

try:
    from sentence_transformers import SentenceTransformer
except Exception:
    SentenceTransformer = None

from config import EMBEDDING_MODEL, EMBED_DIM


class LogEmbedder:
    """
    Wraps a SentenceTransformer; returns L2-normalized embeddings (for cosine via dot product).
    """
    def __init__(self, model_name: str = EMBEDDING_MODEL):
        if SentenceTransformer is None:
            raise ImportError(
                "sentence-transformers not available. Please `pip install sentence-transformers`."
            )
        self.model = SentenceTransformer(model_name)

    def encode(self, texts: List[str]) -> np.ndarray:
        vecs = self.model.encode(texts, convert_to_numpy=True, normalize_embeddings=True)
        # Safety: ensure correct shape
        if vecs.ndim == 1:
            vecs = vecs.reshape(1, -1)
        assert vecs.shape[1] == EMBED_DIM, f"Expected dim {EMBED_DIM}, got {vecs.shape[1]}"
        return vecs

    def encode_one(self, text: str) -> np.ndarray:
        return self.encode([text])[0]
