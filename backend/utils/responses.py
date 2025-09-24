from typing import Any
from fastapi.responses import JSONResponse

def success_response(message: str, data: Any = None, status_code: int = 200):
    return JSONResponse(
        status_code=status_code,
        content={
            "success": True,
            "message": message,
            "data": data
        }
    )

def error_response(message: str, status_code: int = 400, data=None):
    return JSONResponse(
        status_code=status_code,
        content={
            "success": False,
            "message": message,
            "data": data,
        }
    )
