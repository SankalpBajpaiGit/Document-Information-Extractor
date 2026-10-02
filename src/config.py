"""
Configuration file for LayoutLMv3 Document & Receipt Information Extractor
Contains BIO label definitions, field mappings, dataset split ratios, and default hyperparameters.
"""

import os
from typing import List, Dict

# Standard BIO Entity Labels used by LayoutLMv3 Token Classification
LABELS: List[str] = [
    "O",
    "B-HEADER", "I-HEADER",
    "B-VENDOR_NAME", "I-VENDOR_NAME",
    "B-VENDOR_ADDRESS", "I-VENDOR_ADDRESS",
    "B-VENDOR_PHONE", "I-VENDOR_PHONE",
    "B-VENDOR_EMAIL", "I-VENDOR_EMAIL",
    "B-INVOICE_NUMBER", "I-INVOICE_NUMBER",
    "B-DATE", "I-DATE",
    "B-CUSTOMER_NAME", "I-CUSTOMER_NAME",
    "B-CUSTOMER_ADDRESS", "I-CUSTOMER_ADDRESS",
    "B-SUBTOTAL", "I-SUBTOTAL",
    "B-TAX", "I-TAX",
    "B-DISCOUNT", "I-DISCOUNT",
    "B-TOTAL", "I-TOTAL",
    "B-PAYMENT_METHOD", "I-PAYMENT_METHOD",
    "B-ITEM_DESCRIPTION", "I-ITEM_DESCRIPTION",
    "B-ITEM_QTY", "I-ITEM_QTY",
    "B-ITEM_PRICE", "I-ITEM_PRICE",
    "B-ITEM_AMOUNT", "I-ITEM_AMOUNT",
]

# ID to Label and Label to ID Mappings
LABEL2ID: Dict[str, int] = {label: i for i, label in enumerate(LABELS)}
ID2LABEL: Dict[int, str] = {i: label for i, label in enumerate(LABELS)}
NUM_LABELS: int = len(LABELS)

# Target JSON Extraction Schema Keys
TARGET_FIELDS = [
    "vendor_name",
    "vendor_address",
    "vendor_phone",
    "vendor_email",
    "invoice_number",
    "date",
    "customer_name",
    "customer_address",
    "subtotal",
    "tax",
    "discount",
    "total",
    "payment_method",
    "items"
]

# Model Hyperparameters as specified in Project Report Section 17.2 & 10.1
DEFAULT_HYPERPARAMETERS = {
    "model_name": "microsoft/layoutlmv3-base",
    "learning_rate": 2e-5,
    "batch_size": 4,
    "epochs": 5,
    "optimizer": "AdamW",
    "weight_decay": 0.01,
    "max_seq_length": 512,
    "image_size": (224, 224),
    "train_split": 0.80,
    "val_split": 0.10,
    "test_split": 0.10,
}

# Directories
BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
DATA_DIR = os.path.join(BASE_DIR, "data")
OUTPUT_DIR = os.path.join(BASE_DIR, "models", "layoutlmv3_finetuned")
SAMPLES_DIR = os.path.join(BASE_DIR, "backend", "samples")

os.makedirs(DATA_DIR, exist_ok=True)
os.makedirs(OUTPUT_DIR, exist_ok=True)
os.makedirs(SAMPLES_DIR, exist_ok=True)
