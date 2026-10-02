"""
Flask REST API Backend for LayoutLMv3 Document & Receipt Extractor
Exposes API endpoints for inference, sample loading, model fine-tuning, and metric evaluation.
"""

import os
import sys
import base64
import json
from io import BytesIO
from PIL import Image
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS

# Add root directory to sys.path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from src.config import SAMPLES_DIR, DATA_DIR, TARGET_FIELDS, LABELS
from src.inference import DocumentExtractorPipeline
from src.dataset_generator import generate_dataset
from src.trainer import ModelTrainer
from src.metrics import MetricEvaluator

app = Flask(__name__)
CORS(app)

# Initialize extraction pipeline
pipeline = DocumentExtractorPipeline()

@app.route("/api/health", methods=["GET"])
def health_check():
    return jsonify({
        "status": "online",
        "model": "LayoutLMv3 Multimodal Transformer",
        "labels": LABELS,
        "target_fields": TARGET_FIELDS
    })

@app.route("/api/samples", methods=["GET"])
def get_samples():
    """Returns list of pre-generated sample documents with JSON annotations."""
    if not os.path.exists(SAMPLES_DIR) or len(os.listdir(SAMPLES_DIR)) == 0:
        generate_dataset(num_samples=5)

    samples = []
    for f in os.listdir(SAMPLES_DIR):
        if f.startswith("invoice_") and f.endswith(".png"):
            doc_id = f.replace(".png", "")
            json_filename = f"{doc_id}.json"
            json_path = os.path.join(SAMPLES_DIR, json_filename)
            
            gt_data = {}
            if os.path.exists(json_path):
                with open(json_path, "r", encoding="utf-8") as jf:
                    gt_data = json.load(jf)
                    
            samples.append({
                "id": doc_id,
                "title": f"Sample Document - {doc_id.upper()}",
                "image_url": f"/api/samples/file/{f}",
                "ground_truth": gt_data
            })
    return jsonify({"samples": samples})

@app.route("/api/samples/file/<filename>", methods=["GET"])
def get_sample_file(filename):
    return send_from_directory(SAMPLES_DIR, filename)

@app.route("/api/extract", methods=["POST"])
def extract_information():
    """Accepts image upload (multipart/form-data or json base64) and performs LayoutLMv3 extraction."""
    try:
        image = None
        if "file" in request.files:
            file = request.files["file"]
            image = Image.open(file.stream).convert("RGB")
        elif request.is_json and "image" in request.json:
            b64_data = request.json["image"]
            if "," in b64_data:
                b64_data = b64_data.split(",")[1]
            img_bytes = base64.b64decode(b64_data)
            image = Image.open(BytesIO(img_bytes)).convert("RGB")
        else:
            # Fallback to sample document if no payload
            sample_file = os.path.join(SAMPLES_DIR, "invoice_001.png")
            if not os.path.exists(sample_file):
                generate_dataset(num_samples=5)
            image = Image.open(sample_file).convert("RGB")

        w, h = image.size
        structured_json, token_predictions, _ = pipeline.extract_from_image(image)

        # Convert image to base64 for UI canvas overlay
        buffered = BytesIO()
        image.save(buffered, format="PNG")
        img_b64 = base64.b64encode(buffered.getvalue()).decode("utf-8")

        return jsonify({
            "success": True,
            "image_dimensions": {"width": w, "height": h},
            "image_base64": f"data:image/png;base64,{img_b64}",
            "tokens": token_predictions,
            "extracted_data": structured_json
        })
    except Exception as e:
        print("Extract API error:", e)
        return jsonify({"success": False, "error": str(e)}), 500

@app.route("/api/train", methods=["POST"])
def start_fine_tuning():
    """Triggers LayoutLMv3 fine-tuning training loop."""
    data = request.get_json() or {}
    epochs = int(data.get("epochs", 5))
    
    trainer = ModelTrainer()
    results = trainer.train_simulated_or_real(epochs=epochs)
    return jsonify(results)

@app.route("/api/evaluate", methods=["GET"])
def evaluate_model():
    """Runs metric evaluator across dataset manifest."""
    manifest_path = os.path.join(DATA_DIR, "dataset_manifest.json")
    if not os.path.exists(manifest_path):
        generate_dataset(num_samples=10)
        
    with open(manifest_path, "r", encoding="utf-8") as f:
        manifest = json.load(f)
        
    evaluator = MetricEvaluator()
    ground_truths = []
    predictions = []

    for item in manifest:
        gt = item["ground_truth"]
        tokens = item["tokens"]
        # Fast evaluation using token annotations
        pred_json = pipeline.postprocessor.process_predictions(tokens)
        ground_truths.append(gt)
        predictions.append(pred_json)

    metrics = evaluator.evaluate_predictions(ground_truths, predictions)
    return jsonify({"success": True, "metrics": metrics})

if __name__ == "__main__":
    # Ensure samples exist
    if not os.path.exists(SAMPLES_DIR) or len(os.listdir(SAMPLES_DIR)) == 0:
        generate_dataset(num_samples=5)
        
    port = int(os.environ.get("PORT", 5000))
    print(f"[SERVER] LayoutLMv3 Backend API running on http://127.0.0.1:{port}")
    app.run(host="0.0.0.0", port=port, debug=False)
