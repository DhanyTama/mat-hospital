from datetime import date
from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import StreamingResponse
from sqlalchemy import func
from sqlalchemy.orm import Session
from utils.auth import get_current_user
from models.patient import Patient
from db.database import SessionLocal
from schemas.patient import (
    PatientCreate,
    PatientImportRequest,
    PatientUpdate,
    PatientResponse,
    PatientsResponse,
)
from services.patient_service import (
    export_patients_to_csv,
    get_patient,
    create_patient,
    get_patients_filtered,
    import_patients,
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
def read_patients(
    nama: str | None = Query(None, description="Filter by patient name"),
    tanggal_kunjungan: str | None = Query(None, description="Filter by visit date (YYYY-MM-DD)"),
    db: Session = Depends(get_db)
):
    patients = get_patients_filtered(db, nama, tanggal_kunjungan)

    total = db.query(func.count()).select_from(Patient).scalar()
    total_today = db.query(func.count()).select_from(Patient).filter(
        func.date(Patient.tanggal_kunjungan) == date.today()
    ).scalar()

    return {
        "message": "Daftar pasien berhasil diambil",
        "data": {
            "total": total,
            "total_today": total_today,
            "patients": patients
        }
    }
    
    
@router.post("/import", status_code=201)
def import_new_patients(
    patients: PatientImportRequest, 
    db: Session = Depends(get_db),
    username: str = Depends(get_current_user)
):
    try:
        doctor_name = username
        result = import_patients(db, patients, doctor_name)
        return {
            "message": f"{result['imported_count']} pasien berhasil diimpor.",
            "data": result
        }
    except Exception as e:
        raise HTTPException(
            status_code=500, 
            detail=f"Gagal mengimpor data pasien: {e}"
        )
        

@router.get("/export", tags=["Patient"], description="Export data pasien ke format CSV")
def export_patients(
    nama: str | None = Query(None, description="Filter by patient name"),
    tanggal_kunjungan: str | None = Query(None, description="Filter by visit date (YYYY-MM-DD)"),
    db: Session = Depends(get_db),
    username: str = Depends(get_current_user)
):
    csv_data = export_patients_to_csv(db, nama, tanggal_kunjungan)
    
    if not csv_data:
        raise HTTPException(status_code=404, detail="Tidak ada data pasien yang ditemukan untuk diekspor.")

    def iter_csv():
        yield csv_data

    today = date.today().strftime('%Y-%m-%d')
    filename = f"laporan_pasien_{today}.csv"

    return StreamingResponse(
        iter([csv_data]),
        media_type="text/csv",
        headers={
            "Content-Disposition": f"attachment; filename={filename}",
            "Access-Control-Expose-Headers": "Content-Disposition"
        }
    )


@router.get("/{patient_id}", response_model=PatientResponse)
def read_patient(patient_id: int, db: Session = Depends(get_db)):
    patient = get_patient(db, patient_id)
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    return {"message": f"Get patient {patient.nama} successfully", "data": patient}


@router.post("/", response_model=PatientResponse, status_code=201)
def create_new_patient(
    patient: PatientCreate, 
    db: Session = Depends(get_db),
    username: str = Depends(get_current_user)
):
    new_patient = create_patient(db, patient, doctor_name=username)
    return {"message": "Pasien berhasil ditambahkan", "data": new_patient}


@router.put("/{patient_id}", response_model=PatientResponse)
def update_existing_patient(
    patient_id: int, patient: PatientUpdate, db: Session = Depends(get_db)
):
    updated = update_patient(db, patient_id, patient)
    if not updated:
        raise HTTPException(status_code=404, detail="Patient not found")
    return {"message": "Pasien berhasil diperbarui", "data": updated}


@router.delete("/{patient_id}", response_model=PatientResponse)
def delete_existing_patient(patient_id: int, db: Session = Depends(get_db)):
    deleted = delete_patient(db, patient_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Patient not found")
    return {"message": "Pasien berhasil dihapus", "data": deleted}
