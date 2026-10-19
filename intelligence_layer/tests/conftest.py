import os

# Deterministic colour-analyzer tests must not depend on trained weights present on disk.
os.environ["HARVESTLINK_DISABLE_TRAINED_MODELS"] = "1"
