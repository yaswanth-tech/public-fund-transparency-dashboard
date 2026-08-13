import sys
import os
from fastapi import FastAPI

backend_path = os.path.join(os.path.dirname(__file__), '..', 'backend')
if backend_path not in sys.path:
    sys.path.insert(0, backend_path)

from main import app as backend_app

app = FastAPI()
app.mount("/api", backend_app)
app.mount("/", backend_app)
