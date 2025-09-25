from typing import Optional
from sqlalchemy.orm import Session
from models.patient import Patient
from schemas.patient import PatientCreate, PatientUpdate
from sqlalchemy import desc

def get_patients_filtered(db: Session, nama: Optional[str], tanggal_kunjungan: Optional[str]):
    query = db.query(Patient)

    if nama:
        query = query.filter(Patient.nama.ilike(f"%{nama}%"))
    if tanggal_kunjungan:
        query = query.filter(Patient.tanggal_kunjungan == tanggal_kunjungan)

    return query.order_by(desc(Patient.id)).all()

def get_patient(db: Session, patient_id: int):  # ✅ int
    return db.query(Patient).filter(Patient.id == patient_id).first()

def create_patient(db: Session, patient: PatientCreate):
    db_patient = Patient(**patient.dict())  # id auto-increment, jangan isi manual
    db.add(db_patient)
    db.commit()
    db.refresh(db_patient)
    return db_patient

def update_patient(db: Session, patient_id: int, patient: PatientUpdate):
    db_patient = db.query(Patient).filter(Patient.id == patient_id).first()
    if db_patient:
        for key, value in patient.dict().items():
            setattr(db_patient, key, value)
        db.commit()
        db.refresh(db_patient)
    return db_patient

def delete_patient(db: Session, patient_id: int):
    db_patient = db.query(Patient).filter(Patient.id == patient_id).first()
    if db_patient:
        db.delete(db_patient)
        db.commit()
    return db_patient
