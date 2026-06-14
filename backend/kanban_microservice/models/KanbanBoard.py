from pydantic import BaseModel, field_validator
from fastapi import HTTPException


class KanbanBoardCreate(BaseModel):
    name: str
    areaId: int
    createdBy: int
    archived: bool = False

    @field_validator("name")
    def validate_name(cls, value):
        if len(value.strip()) == 0:
            raise HTTPException(status_code=400, detail="El nombre del tablero no puede estar vacio")
        return value.strip()

    class Config:
        from_attributes = True


class KanbanBoard(KanbanBoardCreate):
    id: int

    class Config:
        from_attributes = True
