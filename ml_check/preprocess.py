import re

_whitespace = re.compile(r"\s+")

def clean_log(text: str) -> str:
    """
    Very light normalization; keep it simple so semantics remain.
    """
    if text is None:
        return ""
    t = text.strip()
    # collapse whitespace
    t = _whitespace.sub(" ", t)
    # (optional) lowercase; keep tokens readable
    t = t.lower()
    return t
