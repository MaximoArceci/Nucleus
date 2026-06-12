from pydantic import BaseModel, field_validator, FieldValidationInfo
from datetime import datetime
from fastapi import HTTPException


class ReunionAdministracionCreate(BaseModel):
    ownerId: int
    guestId: int
    tipoGuest: str
    link: str
    allDay: bool
    color: str
    description: str
    end: datetime
    start: datetime
    textColor: str
    title: str

    class Config:
        from_attributes = True


class ReunionAdministracion(ReunionAdministracionCreate):
    id: int

    @field_validator("start", "end", mode="before")
    def validate_fecha(cls, value, info: FieldValidationInfo):
        if len(str(value)) == 0:
            raise HTTPException(
                status_code=400, detail=f"El campo de la fecha y el horario no puede estar vacio")
        return value

    @field_validator("tipoGuest")
    def validate_tipoUsuario(cls, value, info: FieldValidationInfo):
        if value not in ["Candidato", "Terapeuta", "Paciente"]:
            raise HTTPException(
                status_code=400, detail=f"El campo 'Tipo de usuario' debe ser 'Candidato', 'Terapeuta' o 'Paciente'")
        return value

    @field_validator("title")
    def validate_descripcion(cls, value, info: FieldValidationInfo):
        if len(value) == 0:
            raise HTTPException(
                status_code=400, detail=f"El campo 'Titulo' no puede estar vacio")
        return value

    @field_validator("start", "end", mode="before")
    @classmethod
    def parse_datetime(cls, value):
        if isinstance(value, str) and value.endswith("Z"):
            return value.replace("Z", "+00:00")
        return value

    class Config:
        from_attributes = True
