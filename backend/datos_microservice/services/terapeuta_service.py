from .login_service import LoginService
from ..models.Terapeuta import Terapeuta
from fastapi import HTTPException
import re
from asyncio import gather
from fastapi.responses import Response
from .candidato_service import CandidatoService


class TerapeutaService(LoginService):
    def __init__(self):
        self.candidato_service = CandidatoService()
        super().__init__(Terapeuta, "Terapeutas")

    async def create(self, data):
        from .administrador_service import AdministradorService
        from .paciente_service import PacienteService
        self.paciente_service = PacienteService()
        self.administrador_service = AdministradorService()

        if type(data) != self.model:
            data = self.model(**data)
        if await self.find_one({"id": data.id}):
            raise HTTPException(
                status_code=400, detail="Error, este ID ya ha sido utilizado")
        if await self.find_one({"email": data.email}):
            raise HTTPException(
                status_code=400, detail="Error, este email ya ha sido utilizado")
        if await self.find_one({"telefono": data.telefono}):
            raise HTTPException(
                status_code=400, detail="Error, este telefono ya ha sido utilizado")
        if await self.candidato_service.find_one({"email": data.email}):
            raise HTTPException(
                status_code=400, detail="Error, este email ya ha sido registrado como candidato")
        if await self.paciente_service.find_one({"email": data.email}):
            raise HTTPException(
                status_code=400, detail="Error, este email ya ha sido registrado como paciente")
        if await self.administrador_service.find_one({"email": data.email}):
            raise HTTPException(
                status_code=400, detail="Error, este email ya ha sido registrado como administrador")
        return await super().create(data)

    async def update(self, id, model, payload):
        if payload["role"] in ["Candidato", "Paciente"]:
            raise HTTPException(
                status_code=401, detail="No tienes permisos para realizar esta acción")

        if len(model["nombre"]) < 2:
            raise HTTPException(
                status_code=400, detail=f"El campo 'Nombre' debe tener al menos 2 caracteres")
        if not all(char.isalpha() or char in (" ", "-", "'") for char in model["nombre"]):
            raise HTTPException(
                status_code=400, detail="El campo 'Nombre' solo puede contener letras, espacios, apostrofes y guiones")
        if "  " in model["nombre"]:
            raise HTTPException(
                status_code=400, detail="El campo 'Nombre' no puede contener dos espacios seguidos")
        model["nombre"] = model["nombre"].strip()
        model["nombre"] = model["nombre"].lower().title()

        if len(model["username"]) < 2:
            raise HTTPException(
                status_code=400, detail=f"El campo 'Username' debe tener al menos 2 caracteres")
        if not all(char.isalpha() or char in (" ", "-", "'") for char in model["username"]):
            raise HTTPException(
                status_code=400, detail="El campo 'Username' solo puede contener letras, espacios, apostrofes y guiones")
        if "  " in model["username"]:
            raise HTTPException(
                status_code=400, detail="El campo 'Username' no puede contener dos espacios seguidos")
        model["username"] = model["username"].strip()
        model["username"] = model["username"].lower().title()

        if len(model["email"]) == 0:
            raise HTTPException(
                status_code=400, detail=f"El campo 'Email' no puede estar vacio")
        if not re.match(r'^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$', model["email"]):
            raise HTTPException(status_code=400, detail="Email invalido")

        if len(model["telefono"]) == 0:
            raise HTTPException(
                status_code=400, detail=f"El campo 'Telefono' no puede estar vacio")
        pattern = re.compile(r'^\+?[1-9]\d{1,14}$')
        if not pattern.match(model["telefono"]):
            raise HTTPException(
                status_code=400, detail="Telefono invalido")

        if model["fichasCobradas"] < 0:
            raise HTTPException(
                status_code=400, detail=f"El campo 'Fichas Cobradas' no puede ser negativo")

        if model["fichasPendientes"] < 0:
            raise HTTPException(
                status_code=400, detail=f"El campo 'Fichas Pendientes' no puede ser negativo")

        return await self.update_one(id, model)

    async def crear(self, model, payload):
        if payload["role"] in ["Candidato", "Terapeuta", "Paciente"]:
            raise HTTPException(
                status_code=401, detail="No tienes permisos para realizar esta acción")

        last_id = await self.get_last_id()
        event = self.model(**model.model_dump(), id=int(last_id)+1)

        await self.create(event.model_dump())
        return event

    async def delete(self, id, payload):
        if payload["role"] in ["Candidato", "Terapeuta", "Paciente"]:
            raise HTTPException(
                status_code=401, detail="No tienes permisos para realizar esta acción")
        from reuniones_microservice.services.reunion_terapeutica_service import ReunionTerapeuticaService
        from reuniones_microservice.services.reunion_administracion_service import ReunionAdministracionService

        reunion_terapeutica_service = ReunionTerapeuticaService()
        reunion_administracion_service = ReunionAdministracionService()

        reuniones = await reunion_terapeutica_service.get_multiple()
        for reunion in reuniones:
            if reunion.ownerId == id:
                await reunion_terapeutica_service.delete_one(reunion.id)

        reuniones_administracion = await reunion_administracion_service.get_multiple()
        for reunion in reuniones_administracion:
            if reunion.guestId == id and reunion.tipoGuest == "Terapeuta":
                await reunion_administracion_service.delete_one(reunion.id)

        return await self.delete_one(id)

    async def get_todos(self, payload):
        from .paciente_service import PacienteService
        self.paciente_service = PacienteService()

        async def format(data):
            if type(data) != self.model:
                data.pop("_id")
                return self.model(**data)
            else:
                return data

        if payload["role"] in ["Candidato", "Paciente"]:
            raise HTTPException(
                status_code=401, detail="No tienes permisos para realizar esta acción")
        data = await gather(*[format(element) for element in await self.get_multiple()])
        for tera in data:
            pacientes = []
            for paci in tera.pacientes:
                paci = await self.paciente_service.get_one(paci)
                if type(paci) != ValueError:
                    pacientes.append(paci)
                    tera.pacientes = pacientes
        return data

    async def get_uno(self, id, payload):
        if payload["role"] in ["Candidato", "Paciente"]:
            raise HTTPException(
                status_code=401, detail="No tienes permisos para realizar esta acción")

        data = await self.get_one(id)
        if type(data) == ValueError:
            return Response(data.args[0], 400)
        else:
            return data
