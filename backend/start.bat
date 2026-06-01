@echo off
echo Installing dependencies...
pip install -r requirements.txt

echo.
echo Starting Lawyer Bhai AI Backend...
echo API docs: http://localhost:8000/docs
echo.
uvicorn main:app --reload --port 8000
