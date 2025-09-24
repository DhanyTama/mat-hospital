from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from db.database import Base, engine
from routes.patient.route import router as patient_router
from routes.profile.route import profile_router
from routes.auth import router as auth_router
from utils.auth import get_current_user

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

Base.metadata.create_all(bind=engine)

app.include_router(auth_router, prefix="/api")

app.include_router(
    patient_router,
    prefix="/api",
    dependencies=[Depends(get_current_user)]
)

app.include_router(
    profile_router,
    prefix="/api",
    dependencies=[Depends(get_current_user)]
)
