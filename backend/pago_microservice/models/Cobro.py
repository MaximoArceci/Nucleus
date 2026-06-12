from pydantic import BaseModel, field_validator
from datetime import datetime
from fastapi import HTTPException

class CobroCreate(BaseModel):
    terapeutaId: int
    total: float
    fecha: datetime

    class Config:
        from_attributes = True

class Cobro(CobroCreate):
    id: int

    @field_validator("fecha", mode="before")
    def validate_fecha(cls, value):
        if len(str(value)) == 0:
            raise HTTPException(
                status_code=400, detail=f"El campo de la fecha no puede estar vacio")
        return value
    
    @field_validator("total")
    def validate_numerico(cls, value):
        if value < 0:
            raise HTTPException(
                status_code=400, detail=f"El campo total no puede ser negativo")
        return value

    class Config:
        from_attributes = True
