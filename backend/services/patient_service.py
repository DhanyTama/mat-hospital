import csv
from datetime import date
from io import StringIO
from typing import Optional
from sqlalchemy.orm import Session
from models.patient import Patient
from schemas.patient import PatientCreate, PatientImportRequest, PatientUpdate
from sqlalchemy import desc

def get_patients_filtered(db: Session, nama: Optional[str], tanggal_kunjungan: Optional[str]):
    query = db.query(Patient)

    if nama:
        query = query.filter(Patient.nama.ilike(f"%{nama}%"))
    if tanggal_kunjungan:
        query = query.filter(Patient.tanggal_kunjungan == tanggal_kunjungan)

    return query.order_by(desc(Patient.id)).all()

def get_patient(db: Session, patient_id: int):
    return db.query(Patient).filter(Patient.id == patient_id).first()

def create_patient(db: Session, patient: PatientCreate, doctor_name: str):
    db_patient = Patient(**patient.dict(exclude={"dokter"}), dokter=doctor_name)
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

def import_patients(db: Session, patients_data: PatientImportRequest, doctor_name: str):
    imported_count = 0
    
    default_data = {
        "tanggal_lahir": date(1900, 1, 1),
        "diagnosis": "Belum terdiagnosis",
        "tindakan": "Belum ada tindakan",
        "dokter": doctor_name,
    }
    
    for item in patients_data.patients:
        patient_data = item.dict()
        patient_data.update(default_data) 
        
        db_patient = Patient(**patient_data)
        
        db.add(db_patient)
        imported_count += 1

    try:
        db.commit()
    except Exception as e:
        db.rollback()
        raise e 
        
    return {"imported_count": imported_count}

def export_patients_to_csv(db: Session, nama: Optional[str], tanggal_kunjungan: Optional[str]):
    patients = get_patients_filtered(db, nama, tanggal_kunjungan)
    
    if not patients:
        return None

    fieldnames = [
        "Nama Pasien", 
        "Tanggal Kunjungan", 
        "Tanggal Lahir", 
        "Diagnosis", 
        "Tindakan", 
        "Dokter Penanggung Jawab"
    ]
    
    output = StringIO()
    writer = csv.DictWriter(output, fieldnames=fieldnames)

    writer.writeheader()
    
    for p in patients:
        writer.writerow({
            "Nama Pasien": p.nama,
            "Tanggal Kunjungan": p.tanggal_kunjungan.strftime('%Y-%m-%d') if p.tanggal_kunjungan else '',
            "Tanggal Lahir": p.tanggal_lahir.strftime('%Y-%m-%d') if p.tanggal_lahir else '',
            "Diagnosis": p.diagnosis,
            "Tindakan": p.tindakan,
            "Dokter Penanggung Jawab": p.dokter,
        })
        
    return output.getvalue()
