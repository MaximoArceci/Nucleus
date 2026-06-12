import re
from pydantic import BaseModel, field_validator, EmailStr, FieldValidationInfo
from fastapi import HTTPException

class AdministradorCreate(BaseModel):
    username: str
    email: EmailStr
    role: str = "Admin"
    imagen: str

    @field_validator("username")
    def validate_nombre_apellido(cls, value, info: FieldValidationInfo):
        if len(value) == 0:
            raise HTTPException(
                status_code=400, detail=f"El campo {info.field_name} no puede estar vacio")
        if len(value) < 2:
            raise HTTPException(
                status_code=400, detail=f"El campo {info.field_name} debe tener al menos 2 caracteres")
        if not all(char.isalpha() or char in (" ", "-", "'") for char in value):
            raise HTTPException(
                status_code=400, detail=f"El campo {info.field_name} solo puede contener letras, espacios, apostrofes y guiones")
        if "  " in value:
            raise HTTPException(
                status_code=400, detail=f"El campo {info.field_name} no puede contener dos espacios seguidos")
        value = value.strip()
        value = value.lower().title()
        return value

    @field_validator("email")
    def validate_email(cls, value, info: FieldValidationInfo):
        if len(str(value)) == 0:
            raise HTTPException(
                status_code=400, detail=f"El campo {info.field_name} no puede estar vacio")
        if not re.match(r'^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$', value):
            raise HTTPException(status_code=400, detail="email invalido")
        return value

    class Config:
        from_attributes = True

class Administrador(AdministradorCreate):
    id: int

    class Config:
        from_attributes = True
