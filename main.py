"""
Document / Receipt Information Extractor - Main System Entrypoint
Supports starting backend API server, running evaluation metrics, model fine-tuning, or full web demo.
"""

import sys
import os
import subprocess
import argparse

def run_server():
    print("[SERVER] Starting Flask REST API Backend on http://127.0.0.1:5000 ...")
    app_path = os.path.join(os.path.dirname(__file__), "backend", "app.py")
    subprocess.run([sys.executable, app_path])

def run_evaluation():
    print("[EVAL] Running LayoutLMv3 Evaluation Metrics Suite...")
    eval_path = os.path.join(os.path.dirname(__file__), "scripts", "evaluate_model.py")
    subprocess.run([sys.executable, eval_path])

def run_training():
    print("[TRAIN] Launching LayoutLMv3 Fine-Tuning Script...")
    train_path = os.path.join(os.path.dirname(__file__), "scripts", "train_model.py")
    subprocess.run([sys.executable, train_path])

def run_inference(image_path):
    print(f"[INFERENCE] Running Information Extraction on {image_path}...")
    inf_path = os.path.join(os.path.dirname(__file__), "scripts", "run_inference.py")
    subprocess.run([sys.executable, inf_path, image_path])

def run_demo():
    print("==========================================================================")
    print("🚀 Document / Receipt Information Extractor Using LayoutLMv3")
    print("==========================================================================")
    print("Starting Flask Backend API on http://127.0.0.1:5000 ...")
    print("Starting Vite Web Frontend on http://localhost:3000 ...")
    print("==========================================================================")
    
    backend_proc = subprocess.Popen([sys.executable, os.path.join("backend", "app.py")])
    frontend_proc = subprocess.Popen(["npm", "run", "dev"], cwd=os.path.join(".", "frontend"), shell=True)

    try:
        backend_proc.wait()
        frontend_proc.wait()
    except KeyboardInterrupt:
        print("\nStopping services...")
        backend_proc.terminate()
        frontend_proc.terminate()

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="LayoutLMv3 Document Information Extractor Runner")
    parser.add_argument("--server", action="store_true", help="Start REST API backend server")
    parser.add_argument("--evaluate", action="store_true", help="Run model evaluation on dataset")
    parser.add_argument("--train", action="store_true", help="Run LayoutLMv3 fine-tuning")
    parser.add_argument("--image", type=str, help="Path to document image for single extraction")
    parser.add_argument("--demo", action="store_true", help="Launch backend server and frontend web app")

    args = parser.parse_args()

    if args.server:
        run_server()
    elif args.evaluate:
        run_evaluation()
    elif args.train:
        run_training()
    elif args.image:
        run_inference(args.image)
    else:
        # Default action: run server or demo
        run_demo()
