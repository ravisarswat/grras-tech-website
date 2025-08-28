"""
Railway startup script for GRRAS Solutions
"""
import os
import sys
from pathlib import Path

# Add backend directory to Python path
backend_dir = Path(__file__).parent / "backend"
sys.path.insert(0, str(backend_dir))

# Change to backend directory
os.chdir(str(backend_dir))

# Import and run the server
from server import app

if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get('PORT', 8001))
    print(f"Starting GRRAS Solutions API on port {port}")
    uvicorn.run(app, host="0.0.0.0", port=port)