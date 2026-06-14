from fastapi import HTTPException
from .reunion_inicial_service import ReunionInicialService
from .reunion_terapeutica_service import ReunionTerapeuticaService
from ..models.ReunionAdministracion import ReunionAdministracion
from .module_service import ModuleService
from fastapi import Response
from asyncio import gather
from datetime import datetime, timedelta
from reuniones_microservice.utils import google_utils
from datos_microservice.services.paciente_service import PacienteService
from datos_microservice.services.terapeuta_service import TerapeutaService


class ReunionAdministracionService(ModuleService):
    def __init__(self):
        self.reunion_inicial_service = ReunionInicialService()
        self.reunion_terapeutica_service = ReunionTerapeuticaService()
        self.terapeuta_service = TerapeutaService()
        self.paciente_service = PacienteService()

        super().__init__(ReunionAdministracion, "ReunionesAdministracion")

    async def create(self, data):

        if type(data) != self.model:
            data = self.model(**data)
        if await self.find_one({"id": data.id}):
            raise HTTPException(
                status_code=400, detail="Error, este ID ya ha sido utilizado")
        if data.tipoGuest == "Paciente":
            if await self.reunion_terapeutica_service.find_one({"guestId": data.guestId, "start": data.start}):
                raise HTTPException(
                    status_code=400, detail="Error, el paciente ya tiene una sesión asignado para esa fecha y horario. Pruebe cambiando el horario y/o la fecha")
        if data.tipoGuest == "Terapeuta":
            if await self.reunion_terapeutica_service.find_one({"ownerId": data.guestId, "start": data.start}):
                raise HTTPException(
                    status_code=400, detail="Error, el terapeuta ya tiene una sesión asignado para esa fecha y horario. Pruebe cambiando el horario y/o la fecha")
        if data.tipoGuest == "Candidato":
            if await self.reunion_inicial_service.find_one({"guestId": data.guestId, "start": data.start}):
                raise HTTPException(
                    status_code=400, detail="Error, el candidato ya tiene una sesión asignado para esa fecha y horario. Pruebe cambiando el horario y/o la fecha")
        if await self.find_one({"ownerId": data.ownerId, "start": data.start}):
            raise HTTPException(
                status_code=400, detail="Error, ya tiene una sesión asignado para esa fecha y horario. Pruebe cambiando el horario y/o la fecha")
        if await self.reunion_inicial_service.find_one({"ownerId": data.ownerId, "start": data.start}):
            raise HTTPException(
                status_code=400, detail="Error, ya tiene una sesión asignado para esa fecha y horario. Pruebe cambiando el horario y/o la fecha")
        return await super().create(data)

    async def update(self, id, model, payload):
        if payload["role"] in ["Candidato", "Paciente", "Terapeuta"]:
            raise HTTPException(
                status_code=401, detail="No tienes permisos para realizar esta acción")

        if model["tipoGuest"] not in ["Candidato", "Terapeuta", "Paciente"]:
            raise HTTPException(
                status_code=400, detail=f"El campo 'Tipo de usuario' debe ser 'Candidato', 'Terapeuta' o 'Paciente'")

        if len(model["title"]) == 0:
            raise HTTPException(
                status_code=400, detail=f"El campo 'Titulo' no puede estar vacio")

        # turno_actual = await self.get_one(id)
        # model_start = datetime.strptime(model["start"], "%Y-%m-%dT%H:%M:%S")

        # if model["tipoGuest"] == "Paciente":
        #     if await self.reunion_terapeutica_service.find_one({"guestId": model["guestId"], "start": model["start"]}) and turno_actual.start != model_start:
        #         raise HTTPException(
        #             status_code=400, detail="Error, el paciente ya tiene una sesión asignado para esa fecha y horario. Pruebe cambiando el horario y/o la fecha")
        # if model["tipoGuest"] == "Terapeuta":
        #     if await self.reunion_terapeutica_service.find_one({"ownerId": model["guestId"], "start": model["start"]}) and turno_actual.start != model_start:
        #         raise HTTPException(
        #             status_code=400, detail="Error, el terapeuta ya tiene una sesión asignado para esa fecha y horario. Pruebe cambiando el horario y/o la fecha")
        # if model["tipoGuest"] == "Candidato":
        #     if await self.reunion_inicial_service.find_one({"guestId": model["guestId"], "start": model["start"]}) and turno_actual.start != model_start:
        #         raise HTTPException(
        #             status_code=400, detail="Error, el candidato ya tiene una sesión asignado para esa fecha y horario. Pruebe cambiando el horario y/o la fecha")
        # if await self.find_one({"ownerId": model["ownerId"], "start": model["start"]}) and turno_actual.start != model_start:
        #     raise HTTPException(
        #     status_code=400, detail="Error, ya tiene una sesión asignado para esa fecha y horario. Pruebe cambiando el horario y/o la fecha")
        # if await self.reunion_inicial_service.find_one({"ownerId": model["ownerId"], "start": model["start"]}) and turno_actual.start != model_start:
        #     raise HTTPException(
        #         status_code=400, detail="Error, ya tiene una sesión asignado para esa fecha y horario. Pruebe cambiando el horario y/o la fecha")

        if len(str(model["start"])) == 0:
            raise HTTPException(
                status_code=400, detail=f"El campo de la fecha y el horario no puede estar vacio")

        if len(str(model["end"])) == 0:
            raise HTTPException(
                status_code=400, detail=f"El campo de la fecha y el horario no puede estar vacio")

        return await self.update_one(id, model)

    async def crear(self, model, payload):
        last_id = await self.get_last_id()
        event = self.model(**model.model_dump(), id=int(last_id)+1)
        event.color = "#6f6dc7"

        if model.tipoGuest == "Paciente":
            guest = await self.paciente_service.get_one(model.guestId)
        elif model.tipoGuest == "Terapeuta":
            guest = await self.terapeuta_service.get_one(model.guestId)

        codigoMeet = await google_utils.GoogleCalendarManager().crear_meet_v2(payload["email"])
        await google_utils.GoogleCalendarManager().create_event(payload["email"], model, codigoMeet, guest.email)
        
        if codigoMeet != None:
            event.link = codigoMeet
            
        role = payload["role"]
        if role == "Admin":
            await self.create(event.model_dump())
            return event
        else:
            raise HTTPException(
                status_code=401, detail="No tienes permisos para realizar esta acción")

    async def delete(self, id, payload):
        if payload["role"] in ["Candidato", "Paciente", "Terapeuta"]:
            raise HTTPException(
                status_code=401, detail="No tienes permisos para realizar esta acción")

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

    async def solicitar_reunion(self, motivo, payload):
        if payload["role"] in ["Admin"]:
            raise HTTPException(
                status_code=401, detail="Eres administrador, no puedes solicitar reuniones con administracion")
        return {
            "detail": "Solicitud registrada. El envio por SMTP esta desactivado temporalmente.",
            "motivo": motivo,
            "solicitante": payload["email"],
            "role": payload["role"],
        }

    async def get_reuniones_by_user(self, payload):
        reuniones = await self.get_multiple()
        role = payload["role"]
        data = []
        for reunion in reuniones:
            if role == "Paciente" and reunion.guestId == payload["id"] and reunion.tipoGuest == "Paciente":
                data.append(reunion)
            elif role == "Terapeuta" and reunion.guestId == payload["id"] and reunion.tipoGuest == "Terapeuta":
                data.append(reunion)
            elif role == "Candidato" and reunion.guestId == payload["id"] and reunion.tipoGuest == "Candidato":
                data.append(reunion)
            elif role == "Admin" and reunion.ownerId == payload["id"]:
                data.append(reunion)
        return data
