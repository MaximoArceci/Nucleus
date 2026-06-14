from pydantic import BaseModel, field_validator
from fastapi import HTTPException


class KanbanColumnCreate(BaseModel):
    boardId: int
    title: str
    position: int = 0

    @field_validator("title")
    def validate_title(cls, value):
        if len(value.strip()) == 0:
            raise HTTPException(status_code=400, detail="El titulo de la columna no puede estar vacio")
        return value.strip()

    @field_validator("position")
    def validate_position(cls, value):
        if value < 0:
            raise HTTPException(status_code=400, detail="La posicion no puede ser negativa")
        return value

    class Config:
        from_attributes = True


class KanbanColumn(KanbanColumnCreate):
    id: int

    class Config:
        from_attributes = True
