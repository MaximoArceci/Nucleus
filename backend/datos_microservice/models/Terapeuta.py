import re
from pydantic import BaseModel, field_validator, EmailStr, FieldValidationInfo
from fastapi import HTTPException

class TerapeutaCreate(BaseModel):
    nombre: str
    username: str
    email: EmailStr
    fichasCobradas: int
    fichasPendientes: int
    telefono: str
    role: str = "Terapeuta"
    pacientes: list[int]
    imagen: str

    @field_validator("nombre", "username")
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
        if value.split("@")[1] != "gmail.com":
            raise HTTPException(
                status_code=400, detail="Solo se permiten correos de gmail")
        return value

    @field_validator("telefono")
    def validate_telefono(cls, value, info: FieldValidationInfo):
        pattern = re.compile(r'^\+?[1-9]\d{1,14}$')
        if len(value) == 0:
            raise HTTPException(
                status_code=400, detail=f"El campo {info.field_name} no puede estar vacio")
        if not pattern.match(value):
            raise HTTPException(status_code=400, detail="telefono invalido")
        return value

    @field_validator("fichasCobradas", "fichasPendientes")
    def validate_fichas(cls, value, info: FieldValidationInfo):
        if value < 0:
            raise HTTPException(
                status_code=400, detail=f"El campo {info.field_name} no puede ser negativo")
        return value

    @field_validator("pacientes")
    def validate_pacientes(cls, value):
        value = list(set(value))
        return value
    
    class Config:
        from_attributes = True

class Terapeuta(TerapeutaCreate):
    id: int

    class Config:
        from_attributes = True
