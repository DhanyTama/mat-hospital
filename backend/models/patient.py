import uuid
from sqlalchemy import Column, String, DateTime, Integer
from db.database import Base

class Patient(Base):
    __tablename__ = "patients"

    id = Column(Integer, primary_key=True, autoincrement=True)
    nama = Column(String)
    tanggal_lahir = Column(DateTime)
    tanggal_kunjungan = Column(DateTime)
    diagnosis = Column(String)
    tindakan = Column(String)
    dokter = Column(String)