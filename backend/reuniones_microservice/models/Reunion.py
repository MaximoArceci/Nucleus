from datetime import datetime
from pydantic import BaseModel, FieldValidationInfo, field_validator
from fastapi import HTTPException

PARTICIPANT_MODES = {"volunteers", "areas", "all"}


class ReunionCreate(BaseModel):
    organizerId: int
    title: str
    description: str = ""
    start: datetime
    end: datetime
    link: str = ""
    allDay: bool = False
    color: str = "#6f6dc7"
    textColor: str = "#ffffff"
    participantMode: str
    participantVolunteerIds: list[int] = []
    participantAreaIds: list[int] = []

    @field_validator("title")
    def validate_title(cls, value):
        if len(value.strip()) == 0:
            raise HTTPException(status_code=400, detail="El titulo de la reunion no puede estar vacio")
        return value.strip()

    @field_validator("participantMode")
    def validate_participant_mode(cls, value):
        if value not in PARTICIPANT_MODES:
            raise HTTPException(status_code=400, detail="participantMode debe ser volunteers, areas o all")
        return value

    @field_validator("participantVolunteerIds", "participantAreaIds")
    def unique_ids(cls, value, info: FieldValidationInfo):
        return sorted(set(value))

    @field_validator("end")
    def validate_end(cls, value, info: FieldValidationInfo):
        start = info.data.get("start")
        if start and value <= start:
            raise HTTPException(status_code=400, detail="La fecha de fin debe ser posterior al inicio")
        return value

    class Config:
        from_attributes = True


class Reunion(ReunionCreate):
    id: int

    class Config:
        from_attributes = True
