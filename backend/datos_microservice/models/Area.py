from pydantic import BaseModel, FieldValidationInfo, field_validator
from fastapi import HTTPException


class AreaCreate(BaseModel):
    name: str
    slug: str
    description: str = ""
    active: bool = True

    @field_validator("name", "slug")
    def validate_text(cls, value, info: FieldValidationInfo):
        value = value.strip()
        if len(value) == 0:
            raise HTTPException(status_code=400, detail=f"El campo {info.field_name} no puede estar vacio")
        return value.lower() if info.field_name == "slug" else value

    class Config:
        from_attributes = True


class Area(AreaCreate):
    id: int

    class Config:
        from_attributes = True
