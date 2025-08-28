#!/usr/bin/env python3
"""
Railway entry point for GRRAS Solutions Training Institute
This file tells Railway this is a Python project and how to start it
"""

import os
import sys

# Add backend to Python path
sys.path.append(os.path.join(os.path.dirname(__file__), 'backend'))

# Import the FastAPI app from backend
from backend.server import app

if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get('PORT', 8001))
    uvicorn.run(app, host="0.0.0.0", port=port)