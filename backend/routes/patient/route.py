from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from db.database import SessionLocal
from schemas.patient import (
    PatientCreate,
    PatientUpdate,
    PatientResponse,
    PatientsResponse,
)
from services.patient_service import (
    get_patients,
    get_patient,
    create_patient,
    update_patient,
    delete_patient,
)

router = APIRouter(prefix="/patient", tags=["Patient"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.get("/", response_model=PatientsResponse)
def read_patients(db: Session = Depends(get_db)):
    patients = get_patients(db)
    return {"message": "Daftar pasien berhasil diambil", "data": patients}


@router.get("/{patient_id}", response_model=PatientResponse)
def read_patient(patient_id: int, db: Session = Depends(get_db)):  # ✅ int
    patient = get_patient(db, patient_id)
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    return {"message": f"Get patient {patient.nama} successfully", "data": patient}


@router.post("/", response_model=PatientResponse, status_code=201)
def create_new_patient(patient: PatientCreate, db: Session = Depends(get_db)):
    new_patient = create_patient(db, patient)
    return {"message": "Pasien berhasil ditambahkan", "data": new_patient}


@router.put("/{patient_id}", response_model=PatientResponse)
def update_existing_patient(
    patient_id: int, patient: PatientUpdate, db: Session = Depends(get_db)  # ✅ int
):
    updated = update_patient(db, patient_id, patient)
    if not updated:
        raise HTTPException(status_code=404, detail="Patient not found")
    return {"message": "Pasien berhasil diperbarui", "data": updated}


@router.delete("/{patient_id}", response_model=PatientResponse)
def delete_existing_patient(patient_id: int, db: Session = Depends(get_db)):  # ✅ int
    deleted = delete_patient(db, patient_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Patient not found")
    return {"message": "Pasien berhasil dihapus", "data": deleted}
