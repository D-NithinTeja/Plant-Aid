import os
import sys

# Ensure backend root is in Python path for absolute imports
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

import gradio as gr
from app.main import app as fastapi_app
from scripts.download_model import ensure_model

# Stream and verify model weights on startup if not cached
ensure_model()

# Build a status UI for the Space web landing
with gr.Blocks(title="Plant-Aid Production API") as demo:
    gr.Markdown("# 🌿 Plant-Aid Production Backend")
    gr.Markdown(
        "Real-Time Groundnut Foliage Pathology Identification & Treatment Recommendation API.\n\n"
        "- **Interactive API Docs (Swagger)**: [/docs](/docs)\n"
        "- **Alternative Docs (ReDoc)**: [/redoc](/redoc)\n"
        "- **Active Infrastructure**: Hugging Face Spaces (16 GB RAM • PyTorch CPU • Neon PostgreSQL • Neon S3)\n"
    )

# Mount Gradio UI onto FastAPI at root or /ui
app = gr.mount_gradio_app(fastapi_app, demo, path="/")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=int(os.getenv("PORT", "7860")))
