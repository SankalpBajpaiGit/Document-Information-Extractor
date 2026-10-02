"""
CLI Script to fine-tune LayoutLMv3 model
"""

import sys
import os
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from src.trainer import ModelTrainer

if __name__ == "__main__":
    epochs = 5
    if len(sys.argv) > 1:
        epochs = int(sys.argv[1])
        
    trainer = ModelTrainer()
    results = trainer.train_simulated_or_real(epochs=epochs)
    print("\nTraining summary:", results)
