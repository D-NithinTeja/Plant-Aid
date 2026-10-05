import base64
import io
import os
import sys

# Ensure backend root is in Python path for absolute imports
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

# Handle ZeroGPU environment if active
try:
    import spaces
except Exception:
    spaces = None

from fastapi.middleware.cors import CORSMiddleware
from fastapi.openapi.docs import get_swagger_ui_html
from fastapi.openapi.utils import get_openapi
import gradio as gr
from PIL import Image

from app.main import app as fastapi_app
from scripts.download_model import ensure_model

# Stream and verify model weights on startup if not cached
ensure_model()

# ZeroGPU decorator requirement (runs as no-op so no GPU quota is burned)
if spaces is not None:
    @spaces.GPU(duration=1)
    def _noop():
        return ""

def predict_leaf(image):
    if image is None:
        return "Please upload an image.", None
    from app.services.ml_engine import ml_engine
    img_byte_arr = io.BytesIO()
    image.save(img_byte_arr, format="PNG")
    result = ml_engine.predict(img_byte_arr.getvalue())

    disease = result.get("disease_name", "Unknown")
    conf = result.get("confidence", 0.0)
    uncertain = result.get("uncertain", False)
    species = result.get("plant_species", "Groundnut (Arachis hypogaea)")

    summary = f"""### Analysis Result
- **Condition / Disease**: {disease}
- **Confidence**: {conf:.1%}
- **Calibrated Status**: {'⚠️ High Uncertainty (Verification Recommended)' if uncertain else '✅ Confident Detection'}
- **Foliage Category**: {species}
"""
    heatmap_img = None
    if result.get("heatmap_base64"):
        try:
            heatmap_bytes = base64.b64decode(result["heatmap_base64"])
            heatmap_img = Image.open(io.BytesIO(heatmap_bytes))
        except Exception:
            heatmap_img = None

    return summary, heatmap_img

with gr.Blocks(title="Plant-Aid Production Backend & API") as demo:
    gr.Markdown("# 🌿 Plant-Aid Production Backend & Inference API")
    gr.Markdown(
        "Real-Time Groundnut Foliage Pathology Identification & Treatment Recommendation API.\n\n"
        "- **Interactive API Docs (Swagger)**: [/docs](/docs)\n"
        "- **Health Check**: [/health](/health)\n"
        "- **Active Infrastructure**: Hugging Face Spaces (ZeroGPU / 16 GB RAM • PyTorch • Neon PostgreSQL • Neon S3)\n"
    )
    with gr.Tab("Quick Diagnostic Test"):
        gr.Markdown("Upload a plant leaf photo below to test model inference and Grad-CAM lesion heatmap generation:")
        with gr.Row():
            with gr.Column():
                input_img = gr.Image(type="pil", label="Upload Leaf Photo")
                test_btn = gr.Button("Analyze Leaf", variant="primary")
            with gr.Column():
                output_text = gr.Markdown(label="Diagnosis")
                output_heatmap = gr.Image(type="pil", label="Grad-CAM Lesion Heatmap")
        test_btn.click(fn=predict_leaf, inputs=input_img, outputs=[output_text, output_heatmap])

    if spaces is not None:
        dummy_btn = gr.Button(visible=False)
        dummy_btn.click(fn=_noop)

# Mount all FastAPI routes onto demo.app
demo.app.include_router(fastapi_app.router)

# Mount CORS middleware to allow Vercel and localhost requests
demo.app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount Swagger UI and OpenAPI documentation
@demo.app.get("/docs", include_in_schema=False)
async def custom_swagger_ui_html():
    return get_swagger_ui_html(openapi_url="/openapi.json", title="Plant-Aid Production API")

@demo.app.get("/openapi.json", include_in_schema=False)
async def get_open_api_endpoint():
    return get_openapi(
        title="Plant-Aid Production API",
        version="1.0.0",
        routes=demo.app.routes,
    )

# Re-expose app symbol for ASGI runners
app = demo.app

if __name__ == "__main__":
    demo.launch(server_name="0.0.0.0", server_port=int(os.getenv("PORT", "7860")))
