"""
Synthetic Document & Receipt Dataset Generator for LayoutLMv3
Generates high-resolution invoice/receipt image canvases along with word-level 
bounding box coordinates (0-1000 normalized) and BIO entity annotations in CORD/FUNSD format.
"""

import os
import sys
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
import json
import random
from PIL import Image, ImageDraw, ImageFont
from src.config import SAMPLES_DIR, DATA_DIR

# Sample data dictionary for generator
VENDORS = [
    {"name": "ABC Electronics Pvt. Ltd.", "address": "101 Tech Park, Sector 62, Noida, UP", "phone": "+91-9876543210", "email": "billing@abcelectronics.com"},
    {"name": "Global Retail Corp", "address": "45 Market Street, Suite 300, New York, NY", "phone": "+1-800-555-0199", "email": "support@globalretail.com"},
    {"name": "Apex Supermarket", "address": "12 Grand Trunk Road, Bengaluru, KA", "phone": "+91-8080808080", "email": "receipts@apexsuper.com"},
    {"name": "TechCraft Solutions", "address": "78 Innovation Way, San Jose, CA", "phone": "+1-408-555-9012", "email": "invoices@techcraft.io"},
    {"name": "Apex Hypermarket & Mart", "address": "Plot 88 Cyber City, Gurugram, HR", "phone": "+91-9911223344", "email": "info@apexhyper.in"}
]

CUSTOMERS = [
    {"name": "Rahul Sharma", "address": "Flat 402, Green Valley Apartments, New Delhi"},
    {"name": "Sarah Jenkins", "address": "742 Evergreen Terrace, Springfield, OR"},
    {"name": "Prajot Shrivastava", "address": "Block B-12, Manipal Campus, Udupi, KA"},
    {"name": "Kabir Sidana", "address": "Villa 19, Palm Meadows, Chandigarh"},
    {"name": "Sankalp Bajpai", "address": "Sector 14, Indiranagar, Lucknow, UP"}
]

ITEMS_CATALOG = [
    {"desc": "Laptop Stand Ergonomic", "price": 2500},
    {"desc": "Wireless Mechanical Keyboard", "price": 4500},
    {"desc": "Full HD 27-inch Monitor", "price": 18500},
    {"desc": "USB-C Multiport Adapter", "price": 1800},
    {"desc": "Noise Cancelling Headphones", "price": 12000},
    {"desc": "Optical Gaming Mouse", "price": 1500},
    {"desc": "Smart Watch Series 7", "price": 22000},
    {"desc": "High Speed HDMI Cable 2m", "price": 600}
]

PAYMENT_METHODS = ["Credit Card (Visa ****4821)", "UPI Direct Transfer", "Cash on Delivery", "Net Banking (HDFC)", "MasterCard ****9902"]

def draw_text_with_bbox(draw, position, text, font, fill="black"):
    """
    Draws text on canvas and returns word bounding boxes in (x0, y0, x1, y1) format.
    """
    x, y = position
    words = text.split()
    word_boxes = []
    
    current_x = x
    for word in words:
        # Measure word dimensions using font.getbbox or fallback
        try:
            bbox = font.getbbox(word)
            w = bbox[2] - bbox[0]
            h = bbox[3] - bbox[1]
        except AttributeError:
            w, h = draw.textsize(word, font=font)
            
        w_box = (current_x, y, current_x + w, y + h + 4)
        draw.text((current_x, y), word, font=font, fill=fill)
        word_boxes.append({"text": word, "box": w_box})
        
        # Space width
        try:
            space_w = font.getbbox(" ")[2] - font.getbbox(" ")[0]
        except AttributeError:
            space_w = 6
        current_x += w + space_w
        
    return word_boxes

def generate_invoice_document(doc_id=1, width=800, height=1100):
    """
    Generates a realistic invoice image and returns structured annotations with 0-1000 normalized 2D boxes.
    """
    random.seed(doc_id * 1000 + 42)
    image = Image.new("RGB", (width, height), color=(255, 255, 255))
    draw = ImageDraw.Draw(image)
    
    # Try loading default font or PIL basic font
    try:
        font_large = ImageFont.truetype("arial.ttf", 24)
        font_header = ImageFont.truetype("arial.ttf", 16)
        font_body = ImageFont.truetype("arial.ttf", 13)
        font_bold = ImageFont.truetype("arialbd.ttf", 14)
    except IOError:
        font_large = font_header = font_body = font_bold = ImageFont.load_default()

    vendor = VENDORS[(doc_id - 1) % len(VENDORS)]
    customer = CUSTOMERS[(doc_id - 1) % len(CUSTOMERS)]
    inv_num = f"INV-{2024000 + doc_id}"
    inv_date = f"{random.randint(1, 28):02d}/{random.randint(1, 12):02d}/2026"
    pay_method = random.choice(PAYMENT_METHODS)
    
    all_tokens = [] # {"text": str, "box": [x0, y0, x1, y1], "label": str}
    
    def add_field(text, label, pos, font, fill="black"):
        word_boxes = draw_text_with_bbox(draw, pos, text, font, fill)
        for idx, wb in enumerate(word_boxes):
            bio_tag = f"B-{label}" if idx == 0 else f"I-{label}"
            all_tokens.append({"text": wb["text"], "box": list(wb["box"]), "label": bio_tag})

    def add_static(text, pos, font, fill="#555555"):
        word_boxes = draw_text_with_bbox(draw, pos, text, font, fill)
        for wb in word_boxes:
            all_tokens.append({"text": wb["text"], "box": list(wb["box"]), "label": "O"})

    # Header section
    add_static("TAX INVOICE", (50, 40), font_large, fill="#1e3a8a")
    draw.line([(50, 75), (750, 75)], fill="#1e3a8a", width=2)
    
    # Vendor info
    add_field(vendor["name"], "VENDOR_NAME", (50, 90), font_header, fill="#111827")
    add_field(vendor["address"], "VENDOR_ADDRESS", (50, 115), font_body, fill="#374151")
    add_field(f"Phone: {vendor['phone']}", "VENDOR_PHONE", (50, 135), font_body, fill="#374151")
    add_field(f"Email: {vendor['email']}", "VENDOR_EMAIL", (50, 155), font_body, fill="#374151")
    
    # Invoice metadata right aligned
    add_static("Invoice No:", (520, 90), font_bold, fill="#111827")
    add_field(inv_num, "INVOICE_NUMBER", (620, 90), font_bold, fill="#1d4ed8")
    
    add_static("Date:", (520, 115), font_body, fill="#111827")
    add_field(inv_date, "DATE", (620, 115), font_body, fill="#111827")
    
    add_static("Payment:", (520, 135), font_body, fill="#111827")
    add_field(pay_method, "PAYMENT_METHOD", (620, 135), font_body, fill="#374151")

    # Billed To
    draw.rectangle([(50, 190), (750, 250)], outline="#cbd5e1", fill="#f8fafc")
    add_static("Billed To / Customer Details:", (60, 195), font_bold, fill="#475569")
    add_field(customer["name"], "CUSTOMER_NAME", (60, 215), font_body, fill="#0f172a")
    add_field(customer["address"], "CUSTOMER_ADDRESS", (60, 232), font_body, fill="#475569")
    
    # Table Header
    draw.rectangle([(50, 270), (750, 300)], fill="#1e293b")
    add_static("Item Description", (60, 277), font_bold, fill="#ffffff")
    add_static("Qty", (450, 277), font_bold, fill="#ffffff")
    add_static("Price ($)", (540, 277), font_bold, fill="#ffffff")
    add_static("Amount ($)", (650, 277), font_bold, fill="#ffffff")
    
    # Selected Items
    items_count = random.randint(2, 4)
    selected_items = random.sample(ITEMS_CATALOG, items_count)
    
    curr_y = 315
    subtotal = 0
    
    parsed_items = []
    for item in selected_items:
        qty = random.randint(1, 3)
        amt = item["price"] * qty
        subtotal += amt
        
        add_field(item["desc"], "ITEM_DESCRIPTION", (60, curr_y), font_body)
        add_field(str(qty), "ITEM_QTY", (460, curr_y), font_body)
        add_field(f"{item['price']:.2f}", "ITEM_PRICE", (540, curr_y), font_body)
        add_field(f"{amt:.2f}", "ITEM_AMOUNT", (650, curr_y), font_body)
        
        parsed_items.append({"description": item["desc"], "quantity": qty, "price": item["price"], "amount": amt})
        
        draw.line([(50, curr_y + 22), (750, curr_y + 22)], fill="#e2e8f0", width=1)
        curr_y += 30
        
    tax = round(subtotal * 0.18, 2)
    discount = 0.0
    total = round(subtotal + tax - discount, 2)
    
    curr_y += 20
    # Totals Summary
    draw.rectangle([(450, curr_y), (750, curr_y + 110)], fill="#f1f5f9", outline="#cbd5e1")
    
    add_static("Subtotal:", (460, curr_y + 10), font_body, fill="#334155")
    add_field(f"{subtotal:.2f}", "SUBTOTAL", (650, curr_y + 10), font_body, fill="#334155")
    
    add_static("GST/Tax (18%):", (460, curr_y + 35), font_body, fill="#334155")
    add_field(f"{tax:.2f}", "TAX", (650, curr_y + 35), font_body, fill="#334155")
    
    add_static("Total Amount:", (460, curr_y + 70), font_bold, fill="#0f172a")
    add_field(f"${total:.2f}", "TOTAL", (640, curr_y + 70), font_large, fill="#166534")

    # Footer note
    add_static("Thank you for your business! For queries contact support.", (200, height - 50), font_body, fill="#94a3b8")
    
    # Normalize bounding boxes to [0, 1000] scale as required by LayoutLMv3
    normalized_tokens = []
    for t in all_tokens:
        box = t["box"]
        norm_box = [
            int((box[0] / width) * 1000),
            int((box[1] / height) * 1000),
            int((box[2] / width) * 1000),
            int((box[3] / height) * 1000),
        ]
        # Ensure x1 > x0 and y1 > y0
        norm_box[2] = max(norm_box[0] + 1, norm_box[2])
        norm_box[3] = max(norm_box[1] + 1, norm_box[3])
        
        normalized_tokens.append({
            "text": t["text"],
            "box": norm_box,
            "original_box": box,
            "label": t["label"]
        })
        
    ground_truth_json = {
        "doc_id": f"doc_{doc_id:03d}",
        "vendor_name": vendor["name"],
        "vendor_address": vendor["address"],
        "vendor_phone": vendor["phone"],
        "vendor_email": vendor["email"],
        "invoice_number": inv_num,
        "date": inv_date,
        "customer_name": customer["name"],
        "customer_address": customer["address"],
        "subtotal": subtotal,
        "tax": tax,
        "total": total,
        "payment_method": pay_method,
        "items": parsed_items
    }
    
    return image, normalized_tokens, ground_truth_json

def generate_dataset(num_samples=10, save_dir=DATA_DIR, samples_dir=SAMPLES_DIR):
    """
    Generates dataset images and JSON annotation manifests.
    """
    os.makedirs(save_dir, exist_ok=True)
    os.makedirs(samples_dir, exist_ok=True)
    
    dataset_manifest = []
    
    for i in range(1, num_samples + 1):
        img, tokens, gt_json = generate_invoice_document(doc_id=i)
        
        img_filename = f"invoice_{i:03d}.png"
        img_path = os.path.join(save_dir, img_filename)
        img.save(img_path)
        
        # Save a copy to backend/samples for web application demo
        if i <= 5:
            img.save(os.path.join(samples_dir, img_filename))
            with open(os.path.join(samples_dir, f"invoice_{i:03d}.json"), "w", encoding="utf-8") as f:
                json.dump(gt_json, f, indent=2)
                
        annotation = {
            "id": f"inv_{i:03d}",
            "image_path": img_path,
            "tokens": tokens,
            "ground_truth": gt_json
        }
        
        dataset_manifest.append(annotation)
        
    manifest_path = os.path.join(save_dir, "dataset_manifest.json")
    with open(manifest_path, "w", encoding="utf-8") as f:
        json.dump(dataset_manifest, f, indent=2)
        
    print(f"[SUCCESS] Generated {num_samples} document samples in {save_dir}")
    print(f"Manifest written to {manifest_path}")
    return manifest_path

if __name__ == "__main__":
    generate_dataset(num_samples=15)
