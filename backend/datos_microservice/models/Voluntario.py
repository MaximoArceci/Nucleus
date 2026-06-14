import re
from pydantic import BaseModel, EmailStr, FieldValidationInfo, field_validator
from fastapi import HTTPException


class VoluntarioCreate(BaseModel):
    username: str
    email: EmailStr
    areaIds: list[int] = []
    role: str = "Volunteer"
    imagen: str = ""
    activo: bool = True

    @field_validator("username")
    def validate_username(cls, value, info: FieldValidationInfo):
        if len(value.strip()) == 0:
            raise HTTPException(status_code=400, detail=f"El campo {info.field_name} no puede estar vacio")
        return value.strip()

    @field_validator("email")
    def validate_email(cls, value, info: FieldValidationInfo):
        if len(str(value)) == 0:
            raise HTTPException(status_code=400, detail=f"El campo {info.field_name} no puede estar vacio")
        if not re.match(r"^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$", value):
            raise HTTPException(status_code=400, detail="email invalido")
        return value

    @field_validator("areaIds")
    def validate_area_ids_shape(cls, value):
        return sorted(set(value))

    class Config:
        from_attributes = True


class Voluntario(VoluntarioCreate):
    id: int

    class Config:
        from_attributes = True
