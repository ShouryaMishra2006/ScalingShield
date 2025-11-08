# test_embedder.py
from sentence_transformers import SentenceTransformer
model = SentenceTransformer("all-MiniLM-L6-v2")
print("Model loaded ✅")
print(model.encode(["hello world"]))
