from pydantic import BaseModel
from datetime import date
from typing import List, Optional


class PatientBase(BaseModel):
    nama: str
    tanggal_lahir: date
    tanggal_kunjungan: date
    diagnosis: str
    tindakan: str
    dokter: str


class PatientCreate(PatientBase):
    pass


class PatientUpdate(PatientBase):
    pass


class Patient(PatientBase):
    id: int

    class Config:
        orm_mode = True


class PatientResponse(BaseModel):
    message: str
    data: Optional[Patient]

    class Config:
        orm_mode = True


class PatientsResponse(BaseModel):
    message: str
    data: List[Patient]

    class Config:
        orm_mode = True
