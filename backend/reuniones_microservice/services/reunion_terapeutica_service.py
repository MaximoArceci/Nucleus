from fastapi import HTTPException
from ..models.ReunionTerapeutica import ReunionTerapeutica
from datos_microservice.services.paciente_service import PacienteService
from datos_microservice.services.terapeuta_service import TerapeutaService
from .module_service import ModuleService
from fastapi import Response
from asyncio import gather
from datetime import datetime, timedelta
from reuniones_microservice.utils import google_utils


class ReunionTerapeuticaService(ModuleService):
    def __init__(self):
        self.paciente_service = PacienteService()
        self.terapeuta_service = TerapeutaService()
        super().__init__(ReunionTerapeutica, "ReunionesTerapeuticas")

    async def create(self, data):

        if type(data) != self.model:
            data = self.model(**data)
        if await self.find_one({"id": data.id}):
            raise HTTPException(
                status_code=400, detail="Error, este ID ya ha sido utilizado")
        if await self.find_one({"guestId": data.guestId, "start": data.start}):
            raise HTTPException(
                status_code=400, detail="Error, el paciente ya tiene una sesión asignado para esa fecha y horario. Pruebe cambiando el horario y/o la fecha")
        if await self.find_one({"ownerId": data.ownerId, "start": data.start}):
            raise HTTPException(
                status_code=400, detail="Error, el terapeuta ya tiene una sesión asignado para esa fecha y horario. Pruebe cambiando el horario y/o la fecha")
        return await super().create(data)

    async def update(self, id, model, payload):
        if payload["role"] in ["Candidato", "Paciente"]:
            raise HTTPException(
                status_code=401, detail="No tienes permisos para realizar esta acción")

        if len(str(model["start"])) == 0:
            raise HTTPException(
                status_code=400, detail=f"El campo de la fecha y el horario no puede estar vacio")

        if len(str(model["end"])) == 0:
            raise HTTPException(
                status_code=400, detail=f"El campo de la fecha y el horario no puede estar vacio")

        if len(model["title"]) == 0:
            raise HTTPException(
                status_code=400, detail=f"El campo del titulo no puede estar vacio")

        if str(model["start"])[:16] < str(datetime.now())[:16]:
            raise HTTPException(
                status_code=400, detail=f"La fecha y el horario de la reunion no puede ser anterior a la fecha y horario actual")

        if str(model["end"])[:16] < str(datetime.now())[:16]:
            raise HTTPException(
                status_code=400, detail=f"La fecha y el horario de la reunion no puede ser anterior a la fecha y horario actual")

        turno_actual = await self.get_one(id)

        if datetime.fromisoformat(str(turno_actual.start)).replace(tzinfo=None) - datetime.now() < timedelta(days=2):
            raise HTTPException(
                status_code=400, detail="No puedes modificar la sesión si quedan menos de 48 horas para que comience")

        if model["tipoGuest"] not in ["Candidato", "Terapeuta", "Paciente"]:
            raise HTTPException(
                status_code=400, detail=f"El campo 'Tipo de usuario' debe ser 'Candidato', 'Terapeuta' o 'Paciente'")

        # turno_actual = await self.get_one(id)
        # start_datetime = datetime.fromisoformat(str(turno_actual.start))

        # if await self.find_one({"guestId": model["guestId"], "start": model["start"]}) and start_datetime.isoformat() != model["start"]:
        #     raise HTTPException(
        #         status_code=400, detail="Este paciente ya tiene una sesión asignado en este horario")
        # if await self.find_one({"ownerId": model["ownerId"], "start": model["start"]}) and start_datetime.isoformat() != model["start"]:
        #     raise HTTPException(
        #         status_code=400, detail="Este terapeuta ya tiene una sesión asignado en este horario")
        
        return await self.update_one(id, model)

    async def get_reuniones_by_user(self, payload):
        if payload["role"] in ["Candidato"]:
            raise HTTPException(
                status_code=401, detail="No tienes permisos para realizar esta acción")

        role = payload["role"]
        data = []
        reuniones = await self.get_multiple()
        for reunion in reuniones:
            if role == "Paciente" and reunion.guestId == payload["id"]:
                data.append(reunion)
            elif role == "Terapeuta" and reunion.ownerId == payload["id"]:
                data.append(reunion)
        return data

    async def crear(self, model, payload):
        last_id = await self.get_last_id()
        event = self.model(**model.model_dump(), id=int(last_id)+1)
        role = payload["role"]
        if role == "Terapeuta":

            paciente = await self.paciente_service.get_one(event.guestId)

            codigoMeet = await google_utils.GoogleCalendarManager().crear_meet_v2(payload["email"])
            
            if codigoMeet != None:
                event.link = codigoMeet     
                   
            await google_utils.GoogleCalendarManager().create_event(payload["email"], model, codigoMeet, paciente.email)

            if paciente.cantFichas == 0:
                raise HTTPException(
                    status_code=400, detail="Error, el paciente no tiene fichas disponibles")

            await self.create(event.model_dump())

            paciente.cantFichas -= 1
            pacienteDict = paciente.dict()
            await self.paciente_service.update(paciente.id, pacienteDict, payload)

            terapeuta = await self.terapeuta_service.get_one(event.ownerId)
            terapeuta.fichasPendientes += 1
            terapeutaDict = terapeuta.dict()
            await self.terapeuta_service.update(terapeuta.id, terapeutaDict, payload)
            return event

        else:
            raise HTTPException(
                status_code=401, detail="No tienes permisos para realizar esta acción")

    async def delete(self, id, payload):
        if payload["role"] in ["Candidato", "Paciente"]:
            raise HTTPException(
                status_code=401, detail="No tienes permisos para realizar esta acción")

        reunion = await self.get_one(id)
        if reunion.start - datetime.now() < timedelta(days=2):
            raise HTTPException(
                status_code=400, detail="No puedes eliminar la sesión si quedan menos de 48 horas para que comience")
        if reunion.start > datetime.now():
            paciente = await self.paciente_service.get_one(reunion.guestId)
            paciente.cantFichas += 1
            pacienteDict = paciente.dict()
            await self.paciente_service.update(paciente.id, pacienteDict, payload)

            terapeuta = await self.terapeuta_service.get_one(reunion.ownerId)
            terapeuta.fichasPendientes -= 1
            terapeutaDict = terapeuta.dict()
            await self.terapeuta_service.update(terapeuta.id, terapeutaDict, payload)
        return await self.delete_one(id)

    async def get_todos(self, payload):
        async def format(data):
            if type(data) != self.model:
                data.pop("_id")
                return self.model(**data)
            else:
                return data

        if payload["role"] in ["Candidato", "Paciente", "Terapeuta"]:
            raise HTTPException(
                status_code=401, detail="No tienes permisos para realizar esta acción")

        return await gather(*[format(element) for element in await self.get_multiple()])

    async def get_uno(self, id, payload):
        if payload["role"] in ["Candidato", "Paciente", "Terapeuta"]:
            raise HTTPException(
                status_code=401, detail="No tienes permisos para realizar esta acción")

        data = await self.get_one(id)
        if type(data) == ValueError:
            return Response(data.args[0], 400)
        else:
            return data
