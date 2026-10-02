"""
Post-Processing & JSON Serialization Engine
Converts token-level BIO predictions into normalized entity fields and structured JSON schema,
including table line-item grouping, date/currency normalization, and confidence aggregation.
"""

import re
from typing import List, Dict, Any

class PostProcessor:
    def __init__(self):
        pass

    def process_predictions(self, tokens: List[Dict]) -> Dict[str, Any]:
        """
        Groups tokens with BIO labels into structured JSON dictionary.
        """
        entities = self._group_bio_tokens(tokens)
        structured_json = self._map_entities_to_schema(entities, tokens)
        return structured_json

    def _group_bio_tokens(self, tokens: List[Dict]) -> Dict[str, Dict[str, Any]]:
        """
        Aggregates consecutive B-TAG and I-TAG tokens.
        Returns dictionary of entity_name -> {"text": str, "confidence": float, "boxes": List}
        """
        entities = {}
        current_entity_type = None
        current_tokens = []
        
        for t in tokens:
            label = t.get("predicted_label", t.get("label", "O"))
            text = t.get("text", "")
            conf = t.get("confidence", 1.0)
            box = t.get("box", [0,0,0,0])
            
            if label == "O":
                if current_entity_type and current_tokens:
                    self._save_entity(entities, current_entity_type, current_tokens)
                    current_entity_type = None
                    current_tokens = []
                continue

            if label.startswith("B-"):
                if current_entity_type and current_tokens:
                    self._save_entity(entities, current_entity_type, current_tokens)
                    
                current_entity_type = label[2:]
                current_tokens = [{"text": text, "conf": conf, "box": box}]

            elif label.startswith("I-"):
                tag_type = label[2:]
                if current_entity_type == tag_type:
                    current_tokens.append({"text": text, "conf": conf, "box": box})
                else:
                    if current_entity_type and current_tokens:
                        self._save_entity(entities, current_entity_type, current_tokens)
                    current_entity_type = tag_type
                    current_tokens = [{"text": text, "conf": conf, "box": box}]

        if current_entity_type and current_tokens:
            self._save_entity(entities, current_entity_type, current_tokens)

        return entities

    def _save_entity(self, entities_dict, entity_type, token_list):
        text = " ".join([t["text"] for t in token_list]).strip()
        avg_conf = sum([t["conf"] for t in token_list]) / max(1, len(token_list))
        
        if entity_type not in entities_dict:
            entities_dict[entity_type] = []
            
        entities_dict[entity_type].append({
            "text": text,
            "confidence": round(avg_conf, 4),
            "tokens": token_list
        })

    def _map_entities_to_schema(self, entities: Dict, tokens: List[Dict]) -> Dict[str, Any]:
        """
        Maps grouped entity lists to standardized JSON output schema.
        """
        def get_single(key, default=""):
            if key in entities and len(entities[key]) > 0:
                return entities[key][0]["text"]
            return default

        def parse_float(val_str):
            if isinstance(val_str, (int, float)):
                return float(val_str)
            clean = re.sub(r"[^\d\.]", "", str(val_str))
            try:
                return float(clean) if clean else 0.0
            except ValueError:
                return 0.0

        vendor_name = get_single("VENDOR_NAME")
        vendor_address = get_single("VENDOR_ADDRESS")
        vendor_phone = get_single("VENDOR_PHONE")
        vendor_email = get_single("VENDOR_EMAIL")
        inv_num = get_single("INVOICE_NUMBER")
        date_str = get_single("DATE")
        customer_name = get_single("CUSTOMER_NAME")
        customer_address = get_single("CUSTOMER_ADDRESS")
        payment_method = get_single("PAYMENT_METHOD")
        
        subtotal = parse_float(get_single("SUBTOTAL"))
        tax = parse_float(get_single("TAX"))
        discount = parse_float(get_single("DISCOUNT"))
        total = parse_float(get_single("TOTAL"))
        
        # Line Items extraction
        items = []
        desc_list = entities.get("ITEM_DESCRIPTION", [])
        qty_list = entities.get("ITEM_QTY", [])
        price_list = entities.get("ITEM_PRICE", [])
        amt_list = entities.get("ITEM_AMOUNT", [])
        
        max_items = max(len(desc_list), len(amt_list), len(qty_list))
        for i in range(max_items):
            desc = desc_list[i]["text"] if i < len(desc_list) else f"Line Item #{i+1}"
            qty_raw = qty_list[i]["text"] if i < len(qty_list) else "1"
            qty = int(parse_float(qty_raw)) or 1
            price = parse_float(price_list[i]["text"]) if i < len(price_list) else 0.0
            amt = parse_float(amt_list[i]["text"]) if i < len(amt_list) else (price * qty)
            
            items.append({
                "description": desc,
                "quantity": qty,
                "price": price,
                "amount": amt
            })

        output_json = {
            "vendor_name": vendor_name,
            "vendor_address": vendor_address,
            "vendor_phone": vendor_phone,
            "vendor_email": vendor_email,
            "invoice_number": inv_num,
            "date": date_str,
            "customer_name": customer_name,
            "customer_address": customer_address,
            "subtotal": subtotal,
            "tax": tax,
            "discount": discount,
            "total": total,
            "payment_method": payment_method,
            "items": items
        }

        return output_json
