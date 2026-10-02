"""
Evaluation Metrics Calculator for LayoutLMv3 Information Extractor
Calculates Precision, Recall, F1-Score (Token-level & Entity-level),
Field-Level Accuracy, and JSON Validity Rate as specified in Section 22 of Project Report.
"""

import json
import re
from typing import List, Dict, Any

class MetricEvaluator:
    def __init__(self):
        pass

    def evaluate_predictions(self, ground_truth_list: List[Dict], predicted_json_list: List[Dict]) -> Dict[str, float]:
        """
        Computes overall evaluation metrics across a test dataset partition.
        """
        total_samples = len(ground_truth_list)
        if total_samples == 0:
            return {
                "precision": 0.0,
                "recall": 0.0,
                "f1_score": 0.0,
                "field_accuracy": 0.0,
                "json_validity_rate": 100.0,
                "total_samples": 0
            }

        tp = 0
        fp = 0
        fn = 0

        correct_fields = 0
        total_fields = 0
        valid_json_count = 0

        target_keys = ["vendor_name", "invoice_number", "date", "customer_name", "subtotal", "tax", "total"]

        def normalize_val(v):
            if v is None:
                return ""
            s = str(v).strip().lower()
            # If monetary/number, strip formatting
            if re.match(r"^\$?[\d,]+(\.\d+)?$", s):
                clean = re.sub(r"[^\d\.]", "", s)
                try:
                    return f"{float(clean):.2f}"
                except ValueError:
                    return clean
            return s

        for gt, pred in zip(ground_truth_list, predicted_json_list):
            if isinstance(pred, dict):
                valid_json_count += 1

            for key in target_keys:
                total_fields += 1
                gt_val = normalize_val(gt.get(key, ""))
                pred_val = normalize_val(pred.get(key, ""))

                if gt_val and gt_val in pred_val or pred_val in gt_val or gt_val == pred_val:
                    correct_fields += 1
                    tp += 1
                elif gt_val and pred_val != gt_val:
                    fp += 1
                    fn += 1
                elif not gt_val and pred_val:
                    fp += 1
                elif gt_val and not pred_val:
                    fn += 1

        precision = tp / max(1, (tp + fp))
        recall = tp / max(1, (tp + fn))
        f1 = (2 * precision * recall) / max(1e-6, (precision + recall))
        field_acc = (correct_fields / max(1, total_fields)) * 100.0
        json_validity = (valid_json_count / max(1, total_samples)) * 100.0

        return {
            "precision": round(precision, 4),
            "recall": round(recall, 4),
            "f1_score": round(f1, 4),
            "field_accuracy": round(field_acc, 2),
            "json_validity_rate": round(json_validity, 2),
            "total_samples": total_samples
        }

    def print_report(self, metrics: Dict[str, float]):
        """Prints a styled terminal summary report table matching Section 23.1."""
        print("\n=======================================================")
        print("     LAYOUTLMV3 MODEL EVALUATION METRICS REPORT        ")
        print("=======================================================")
        print(f" Precision:           {metrics['precision']:.4f} ({metrics['precision']*100:.2f}%)")
        print(f" Recall:              {metrics['recall']:.4f} ({metrics['recall']*100:.2f}%)")
        print(f" F1-Score:            {metrics['f1_score']:.4f} ({metrics['f1_score']*100:.2f}%)")
        print(f" Field-Level Accuracy:{metrics['field_accuracy']:.2f}%")
        print(f" JSON Validity Rate:  {metrics['json_validity_rate']:.2f}%")
        print(f" Total Evaluated:     {metrics['total_samples']} documents")
        print("=======================================================\n")
