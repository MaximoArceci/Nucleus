import re
from pydantic import BaseModel, field_validator, EmailStr, FieldValidationInfo
from fastapi import HTTPException

class CandidatoCreate(BaseModel):
    username: str
    email: EmailStr
    abonaReunion: bool = False
    role: str = "Candidato"
    imagen: str
    tipoFicha: str = "Inicial"

    @field_validator("username")
    def validate_username(cls, value, info: FieldValidationInfo):
        if len(value) == 0:
            raise HTTPException(
                status_code=400, detail=f"El campo {info.field_name} no puede estar vacio")
        return value

    @field_validator("email")
    def validate_email(cls, value, info: FieldValidationInfo):
        if len(str(value)) == 0:
            raise HTTPException(
                status_code=400, detail=f"El campo {info.field_name} no puede estar vacio")
        if not re.match(r'^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$', value):
            raise HTTPException(status_code=400, detail="email invalido")
        return value

    @field_validator("abonaReunion")
    def validate_boolean(cls, value, info: FieldValidationInfo):
        if not isinstance(value, bool):
            raise HTTPException(
                status_code=400, detail=f"El campo {info.field_name} debe ser un verdadero o falso")
        return value

    class Config:
        from_attributes = True

class Candidato(CandidatoCreate):
    id: int

    class Config:
        from_attributes = True
