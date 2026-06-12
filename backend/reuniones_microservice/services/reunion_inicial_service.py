from fastapi import HTTPException
from reuniones_microservice.models import ReunionTerapeutica
from .module_service import ModuleService
from ..models.ReunionInicial import ReunionInicial
from datetime import datetime
from fastapi import Response
from asyncio import gather
from googleapiclient.discovery import build
from google.oauth2.service_account import Credentials
from datetime import timedelta
import json
import uuid
from .reunion_terapeutica_service import ReunionTerapeuticaService
import pytz
from google.apps import meet_v2
import os
from google.auth.transport.requests import Request
from google_auth_oauthlib.flow import InstalledAppFlow
from ..utils import google_utils
from datos_microservice.services.candidato_service import CandidatoService


class ReunionInicialService(ModuleService):
    def __init__(self):
        self.reunion_terapeutica_service = ReunionTerapeuticaService()
        self.candidato_service = CandidatoService()
        super().__init__(ReunionInicial, "ReunionesIniciales")

    async def create(self, data):

        if type(data) != self.model:
            data = self.model(**data)
        if await self.find_one({"id": data.id}):
            raise HTTPException(
                status_code=400, detail="Error, este ID ya ha sido utilizado")
        if await self.find_one({"guestId": data.guestId, "start": data.start}):
            raise HTTPException(
                status_code=400, detail="Error, el candidato ya tiene una sesión asignado para esa fecha y horario. Pruebe cambiando el horario y/o la fecha")
        if await self.find_one({"ownerId": data.ownerId, "start": data.start}):
            raise HTTPException(
                status_code=400, detail="Error, el admin ya tiene una sesión asignado para esa fecha y horario. Pruebe cambiando el horario y/o la fecha")
        return await super().create(data)

    async def update(self, evento, payload):
        from .reunion_administracion_service import ReunionAdministracionService
        reunion_administracion_service = ReunionAdministracionService()

        if payload["role"] in ["Candidato", "Paciente"]:
            raise HTTPException(
                status_code=401, detail="No tienes permisos para realizar esta acción")

        id = int(evento["eventId"])

        model = {}
        model["title"] = evento["update"]["title"]
        model["description"] = evento["update"]["description"]
        model["color"] = evento["update"]["color"]
        model["textColor"] = evento["update"]["textColor"]
        model["allDay"] = evento["update"]["allDay"]
        model["start"] = evento["update"]["start"]
        model["end"] = evento["update"]["end"]
        model["link"] = evento["update"]["link"]
        model["guestId"] = evento["update"]["guestId"]
        model["ownerId"] = evento["update"]["ownerId"]
        model["tipoGuest"] = evento["update"]["tipoGuest"]

        if payload["role"] == "Terapeuta":
            await self.reunion_terapeutica_service.update(id, model, payload)
            reu = await self.get_reuniones_by_user(payload)
            return reu

        if model["tipoGuest"] in ["Terapeuta", "Paciente"]:
            await reunion_administracion_service.update(id, model, payload)
            reu = await self.get_reuniones_by_user(payload)
            return reu

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

        if model["tipoGuest"] not in ["Candidato", "Terapeuta", "Paciente"]:
            raise HTTPException(
                status_code=400, detail=f"El campo 'Tipo de usuario' debe ser 'Candidato', 'Terapeuta' o 'Paciente'")

        # turno_actual = await self.get_one(id)
        # start_datetime = datetime.fromisoformat(str(turno_actual.start))

        # if await self.find_one({"guestId": model["guestId"], "start": model["start"]}) and start_datetime.isoformat() != model["start"]:
        #     raise HTTPException(
        #         status_code=400, detail="Este candidato ya tiene una sesión asignado en este horario")
        # if await self.find_one({"ownerId": model["ownerId"], "start": model["start"]}) and start_datetime.isoformat() != model["start"]:
        #     raise HTTPException(
        #         status_code=400, detail="Este admin ya tiene una sesión asignado en este horario")

        await self.update_one(id, model)
        reuniones = await self.get_reuniones_by_user(payload)
        return reuniones

    async def get_reuniones_by_user(self, payload):
        from .reunion_administracion_service import ReunionAdministracionService
        reunion_administracion_service = ReunionAdministracionService()

        if payload["role"] == "Paciente":
            data = []
            reu1 = await self.reunion_terapeutica_service.get_reuniones_by_user(payload)
            reu2 = await reunion_administracion_service.get_reuniones_by_user(payload)
            data.extend(reu1)
            data.extend(reu2)
            return {"events": data}

        if payload["role"] == "Terapeuta":
            data = []
            reu1 = await self.reunion_terapeutica_service.get_reuniones_by_user(payload)
            reu2 = await reunion_administracion_service.get_reuniones_by_user(payload)
            data.extend(reu1)
            data.extend(reu2)
            return {"events": data}

        data = []
        reuniones = await self.get_multiple()

        if payload["role"] == "Candidato":
            for reunion in reuniones:
                if reunion.guestId == payload["id"]:
                    data.append(reunion)
            reu1 = await reunion_administracion_service.get_reuniones_by_user(payload)
            data.extend(reu1)
            return {"events": data}

        for reunion in reuniones:
            if reunion.ownerId == payload["id"]:
                data.append(reunion)
        reu1 = await reunion_administracion_service.get_reuniones_by_user(payload)
        data.extend(reu1)
        return {"events": data}

    async def crear(self, model, payload):
        from .reunion_administracion_service import ReunionAdministracionService
        reunion_administracion_service = ReunionAdministracionService()

        if payload["role"] in ["Candidato", "Paciente"]:
            raise HTTPException(
                status_code=401, detail="No tienes permisos para realizar esta acción")

        if str(model.start)[:16] < str(datetime.now())[:16]:
            raise HTTPException(
                status_code=400, detail=f"La fecha y el horario de la reunion no puede ser anterior a la fecha y horario actual")

        if str(model.end)[:16] < str(datetime.now())[:16]:
            raise HTTPException(
                status_code=400, detail=f"La fecha y el horario de la reunion no puede ser anterior a la fecha y horario actual")

        if payload["role"] == "Terapeuta":
            await self.reunion_terapeutica_service.crear(model, payload)
            reu = await self.get_reuniones_by_user(payload)
            return reu["events"]

        if model.tipoGuest in ["Terapeuta", "Paciente"]:
            await reunion_administracion_service.crear(model, payload)
            reu = await self.get_reuniones_by_user(payload)
            return reu["events"]

        last_id = await self.get_last_id()
        event = self.model(**model.model_dump(), id=int(last_id)+1)

        event.color = "#6f6dc7"

        codigoMeet = await google_utils.GoogleCalendarManager().crear_meet_v2(payload["email"])
        
        if codigoMeet != None:
            event.link = codigoMeet

        guest = await self.candidato_service.get_one(model.guestId)

        await self.create(event.model_dump())
        await google_utils.GoogleCalendarManager().create_event(payload["email"], model, codigoMeet, guest.email)

        eventos = await self.get_reuniones_by_user(payload)
        return eventos["events"]

    async def delete(self, id, payload, model):
        from .reunion_administracion_service import ReunionAdministracionService
        reunion_administracion_service = ReunionAdministracionService()

        if payload["role"] in ["Candidato", "Paciente"]:
            raise HTTPException(
                status_code=401, detail="No tienes permisos para realizar esta acción")

        if payload["role"] == "Terapeuta":
            await self.reunion_terapeutica_service.delete(id, payload)
            reu = await self.get_reuniones_by_user(payload)
            return reu["events"]

        if model.tipoGuest in ["Terapeuta", "Paciente"]:
            await reunion_administracion_service.delete(id, payload)
            reu = await self.get_reuniones_by_user(payload)
            return reu["events"]

        await self.delete_one(id)
        reuniones = await self.get_reuniones_by_user(payload)
        return reuniones["events"]

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

    async def get_reuniones_all(self, payload, data):
        from .reunion_administracion_service import ReunionAdministracionService
        reunion_administracion_service = ReunionAdministracionService()

        if payload["role"] in ["Candidato", "Paciente", "Terapeuta"]:
            raise HTTPException(
                status_code=401, detail="No tienes permisos para realizar esta acción")

        info = []
        reuniones_administracion = await reunion_administracion_service.get_multiple()
        if data["role"] == "Candidato":
            reuniones = await self.get_multiple()
            for reunion in reuniones:
                if reunion.guestId == data["Id"]:
                    info.append(reunion)
            for reunion in reuniones_administracion:
                if reunion.tipoGuest == "Candidato" and reunion.guestId == data["Id"]:
                    info.append(reunion)
        elif data["role"] == "Terapeuta":
            reuniones = await self.reunion_terapeutica_service.get_multiple()
            for reunion in reuniones:
                if reunion.ownerId == data["Id"]:
                    info.append(reunion)
            for reunion in reuniones_administracion:
                if reunion.tipoGuest == "Terapeuta" and reunion.guestId == data["Id"]:
                    info.append(reunion)
        elif data["role"] == "Paciente":
            reuniones = await self.reunion_terapeutica_service.get_multiple()
            for reunion in reuniones:
                if reunion.guestId == data["Id"]:
                    info.append(reunion)
            for reunion in reuniones_administracion:
                if reunion.tipoGuest == "Paciente" and reunion.guestId == data["Id"]:
                    info.append(reunion)
        return info