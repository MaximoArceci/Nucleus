from pydantic import BaseModel, field_validator, FieldValidationInfo
from datetime import datetime
from fastapi import HTTPException

class PagoCreate(BaseModel):
    pacienteId: int
    total: float
    cantFichas: int
    fecha: datetime

    class Config:
        from_attributes = True

class Pago(PagoCreate):
    id: int

    @field_validator("fecha", mode="before")
    def validate_fecha(cls, value):
        if len(str(value)) == 0:
            raise HTTPException(
                status_code=400, detail=f"El campo de la fecha no puede estar vacio")
        return value
    
    @field_validator("total", "cantFichas")
    def validate_numerico(cls, value, info: FieldValidationInfo):
        if value < 0:
            raise HTTPException(
                status_code=400, detail=f"El campo {info.field} no puede ser negativo")
        return value

    class Config:
        from_attributes = True
