"""
CLI Script to evaluate LayoutLMv3 model predictions on dataset test partition
"""

import sys
import os
import json
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from src.config import DATA_DIR
from src.inference import DocumentExtractorPipeline
from src.metrics import MetricEvaluator

if __name__ == "__main__":
    manifest_path = os.path.join(DATA_DIR, "dataset_manifest.json")
    if not os.path.exists(manifest_path):
        from src.dataset_generator import generate_dataset
        generate_dataset(num_samples=15)
        
    with open(manifest_path, "r", encoding="utf-8") as f:
        manifest = json.load(f)
        
    pipeline = DocumentExtractorPipeline()
    evaluator = MetricEvaluator()
    
    ground_truths = []
    predictions = []
    
    print(f"Evaluating {len(manifest)} test documents using LayoutLMv3 Extraction Pipeline...")
    for item in manifest:
        img_path = os.path.abspath(item["image_path"])
        gt = item["ground_truth"]
        
        extracted_json, _, _ = pipeline.extract_from_image(img_path)
        
        ground_truths.append(gt)
        predictions.append(extracted_json)
        
    metrics = evaluator.evaluate_predictions(ground_truths, predictions)
    evaluator.print_report(metrics)
