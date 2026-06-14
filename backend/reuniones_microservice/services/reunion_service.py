from fastapi import HTTPException
from .module_service import ModuleService
from ..models.Reunion import Reunion
from ..utils import google_utils
from datos_microservice.services.area_service import AreaService
from datos_microservice.services.voluntario_service import VoluntarioService


class ReunionService(ModuleService):
    def __init__(self):
        self.area_service = AreaService()
        self.voluntario_service = VoluntarioService()
        super().__init__(Reunion, "Reuniones")

    async def _validate_participants(self, model):
        if model.participantMode == "volunteers":
            if not model.participantVolunteerIds:
                raise HTTPException(status_code=400, detail="Debe seleccionar al menos un voluntario")
            for volunteer_id in model.participantVolunteerIds:
                volunteer = await self.voluntario_service.get_one(volunteer_id)
                if type(volunteer) == ValueError:
                    raise HTTPException(status_code=400, detail=f"Voluntario inexistente: {volunteer_id}")
            model.participantAreaIds = []

        if model.participantMode == "areas":
            if not model.participantAreaIds:
                raise HTTPException(status_code=400, detail="Debe seleccionar al menos un area")
            model.participantAreaIds = await self.area_service.validate_area_ids(model.participantAreaIds)
            model.participantVolunteerIds = []

        if model.participantMode == "all":
            model.participantVolunteerIds = []
            model.participantAreaIds = []

        return model

    async def _attendee_emails(self, model):
        volunteers = []
        if model.participantMode == "volunteers":
            for volunteer_id in model.participantVolunteerIds:
                volunteer = await self.voluntario_service.get_one(volunteer_id)
                if type(volunteer) != ValueError:
                    volunteers.append(volunteer)
        elif model.participantMode == "areas":
            all_volunteers = await self.voluntario_service.get_multiple()
            volunteers = [
                volunteer for volunteer in all_volunteers
                if set(volunteer.areaIds).intersection(set(model.participantAreaIds))
            ]
        elif model.participantMode == "all":
            volunteers = await self.voluntario_service.get_multiple()

        return sorted(set(volunteer.email for volunteer in volunteers))

    async def crear(self, model, payload):
        if payload["role"] != "Admin" and model.organizerId != payload["id"]:
            raise HTTPException(status_code=401, detail="No tienes permisos para crear esta reunion")

        model = await self._validate_participants(model)
        last_id = await self.get_last_id()
        reunion = self.model(**model.model_dump(), id=int(last_id) + 1)

        codigo_meet = await google_utils.GoogleCalendarManager().crear_meet_v2(payload["email"])
        if codigo_meet:
            reunion.link = codigo_meet
            attendee_emails = await self._attendee_emails(reunion)
            await google_utils.GoogleCalendarManager().create_event_with_attendees(
                payload["email"],
                reunion,
                codigo_meet,
                attendee_emails,
            )

        return await self.create(reunion)

    async def update(self, id, model, payload):
        current = await self.get_one(id)
        if type(current) == ValueError:
            raise HTTPException(status_code=404, detail="Reunion inexistente")
        if payload["role"] != "Admin" and current.organizerId != payload["id"]:
            raise HTTPException(status_code=401, detail="No tienes permisos para editar esta reunion")
        return await self.update_one(id, model)

    async def delete(self, id, payload):
        current = await self.get_one(id)
        if type(current) == ValueError:
            raise HTTPException(status_code=404, detail="Reunion inexistente")
        if payload["role"] != "Admin" and current.organizerId != payload["id"]:
            raise HTTPException(status_code=401, detail="No tienes permisos para eliminar esta reunion")
        return await self.delete_one(id)

    async def get_todos(self, payload):
        if payload["role"] == "Admin":
            return await self.get_multiple()
        return (await self.get_reuniones_by_user(payload))["events"]

    async def get_reuniones_by_user(self, payload):
        reuniones = await self.get_multiple()
        user_id = payload["id"]
        area_ids = set(payload.get("areaIds", []))
        visible = []

        for reunion in reuniones:
            if reunion.organizerId == user_id:
                visible.append(reunion)
            elif reunion.participantMode == "all":
                visible.append(reunion)
            elif reunion.participantMode == "volunteers" and user_id in reunion.participantVolunteerIds:
                visible.append(reunion)
            elif reunion.participantMode == "areas" and area_ids.intersection(set(reunion.participantAreaIds)):
                visible.append(reunion)

        return {"events": visible}
