import subprocess
import sys
import os

if __name__ == "__main__":
    print("================================================")
    print("       EcoTrackr API Service Bootstrapper       ")
    print("================================================")
    
    try:
        import uvicorn
        import fastapi
        import sqlalchemy
    except ImportError as e:
        print(f"Missing dependency: {e.name}. Installing backend/requirements.txt...")
        try:
            subprocess.check_call([sys.executable, "-m", "pip", "install", "-r", "requirements.txt"])
            print("Successfully installed all backend packages.")
        except Exception as err:
            print(f"Error installing dependencies: {err}")
            print("Please run: pip install -r requirements.txt manually.")
            sys.exit(1)
            
    import uvicorn
    print("\n[EcoTrackr] Starting FastAPI application on http://127.0.0.1:8000")
    print("[EcoTrackr] API docs available at http://127.0.0.1:8000/docs")
    uvicorn.run("app.main:app", host="127.0.0.1", port=8000, reload=True)
