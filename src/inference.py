"""
End-to-End Information Extraction Pipeline
Connects OCR Engine -> LayoutLMv3 Model -> PostProcessor -> Structured JSON.
"""

from typing import Union, Dict, Any, Tuple
from PIL import Image

from src.ocr_engine import OCREngine
from src.layoutlmv3_model import DocumentUnderstandingModel
from src.postprocessor import PostProcessor

class DocumentExtractorPipeline:
    def __init__(self):
        self.ocr = OCREngine()
        self.model = DocumentUnderstandingModel()
        self.postprocessor = PostProcessor()

    def extract_from_image(self, image_input: Union[str, Image.Image]) -> Tuple[Dict[str, Any], list, Tuple[int, int]]:
        """
        Runs complete end-to-end extraction from document image to JSON schema.
        Returns: (structured_json, token_predictions_with_boxes, (width, height))
        """
        # Step 1: OCR & Layout Bounding Box Extraction
        tokens, (w, h) = self.ocr.process_image(image_input)

        if isinstance(image_input, str):
            image = Image.open(image_input).convert("RGB")
        else:
            image = image_input.convert("RGB")

        # Step 2: LayoutLMv3 Token Classification
        predicted_tokens = self.model.predict_tokens(image, tokens)

        # Step 3: Post-processing & JSON Aggregation
        structured_json = self.postprocessor.process_predictions(predicted_tokens)

        return structured_json, predicted_tokens, (w, h)
