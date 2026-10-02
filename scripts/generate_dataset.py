"""
CLI Script to generate synthetic annotated invoice/receipt dataset
"""

import sys
import os
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from src.dataset_generator import generate_dataset

if __name__ == "__main__":
    num = 15
    if len(sys.argv) > 1:
        num = int(sys.argv[1])
    print(f"Generating dataset with {num} annotated document images...")
    generate_dataset(num_samples=num)
