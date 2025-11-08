# Global knobs for your pipeline

EMBEDDING_MODEL = "sentence-transformers/all-MiniLM-L6-v2"

# FAISS / memory
EMBED_DIM = 384            # all-MiniLM-L6-v2 output size
FAISS_METRIC = "cosine"    # we implement cosine via normalized vectors + inner product
MAX_INDEX_SIZE = 100_000   # max recent logs to keep in FAISS
REBUILD_EVERY = 5_000      # after this many adds since last rebuild, rebuild to drop evicted ids

# Nearest neighbors
K_NEIGHBORS = 20           # top-k to compute local mean distance
MIN_NEIGHBORS = 5          # if fewer available, degrade gracefully

# Sliding window for context
WINDOW_SIZE = 1000         # recent N logs used for "global" context
MIN_WINDOW_FOR_MEAN = 50

# Scoring weights
W_NEIGHBOR = 0.6
W_WINDOW   = 0.4

# Threshold (tune later)
ALERT_THRESHOLD = 0.65     # higher -> more anomalies

# Safety
CLIP_SIM_LOWER = -1.0
CLIP_SIM_UPPER = 1.0
