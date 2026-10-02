"""
CLI Script to run end-to-end information extraction on a single document image
"""

import sys
import os
import json
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from src.inference import DocumentExtractorPipeline
from src.config import SAMPLES_DIR

if __name__ == "__main__":
    if len(sys.argv) > 1:
        img_path = sys.argv[1]
    else:
        # Default sample image
        img_path = os.path.join(SAMPLES_DIR, "invoice_001.png")
        if not os.path.exists(img_path):
            from src.dataset_generator import generate_dataset
            generate_dataset(num_samples=5)
            
    print(f"[INFERENCE] Running LayoutLMv3 Extraction on: {img_path}")
    pipeline = DocumentExtractorPipeline()
    extracted_json, predicted_tokens, (w, h) = pipeline.extract_from_image(img_path)
    
    print("\n================ EXTRACTED STRUCTURED JSON ================")
    print(json.dumps(extracted_json, indent=2))
    print("===========================================================")
