from .login_service import LoginService
from ..models.Candidato import Candidato
from fastapi import HTTPException
import re
from asyncio import gather
from fastapi.responses import Response

class CandidatoService(LoginService):
    def __init__(self):
        super().__init__(Candidato, "Candidato")

    async def create(self, data):
        from .paciente_service import PacienteService
        from .terapeuta_service import TerapeutaService
        from .administrador_service import AdministradorService
        self.paciente_service = PacienteService()
        self.terapeuta_service = TerapeutaService()
        self.administrador_service = AdministradorService()

        if type(data) != self.model:
            data = self.model(**data)
        if await self.find_one({"id": data.id}):
            raise HTTPException(
                status_code=400, detail="Error, este ID ya ha sido utilizado")
        if await self.find_one({"email": data.email}):
            raise HTTPException(
                status_code=400, detail="Error, este email ya ha sido utilizado")
        if await self.paciente_service.find_one({"email": data.email}):
            raise HTTPException(
                status_code=400, detail="Error, este email ya ha sido registrado como paciente")
        if await self.terapeuta_service.find_one({"email": data.email}):
            raise HTTPException(
                status_code=400, detail="Error, este email ya ha sido registrado como terapeuta")
        if await self.administrador_service.find_one({"email": data.email}):
            raise HTTPException(
                status_code=400, detail="Error, este email ya ha sido registrado como administrador")
        return await super().create(data)

    async def update(self, id, model, payload):
        if payload["role"] in ["Paciente"]:
            raise HTTPException(status_code=401, detail="No tienes permisos para realizar esta acción")

        if len(model["username"]) == 0:
            raise HTTPException(
                status_code=400, detail=f"El campo 'Username' no puede estar vacio")

        if len(model["email"]) == 0:
            raise HTTPException(
                status_code=400, detail=f"El campo 'Email' no puede estar vacio")
        if not re.match(r'^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$', model["email"]):
            raise HTTPException(status_code=400, detail="Email invalido")

        if not isinstance(model["abonaReunion"], bool):
            raise HTTPException(
                status_code=400, detail=f"El campo 'Reunion Abonada' debe ser un verdadero o falso")

        return await self.update_one(id, model)

    async def crear(self, model):
        last_id = await self.get_last_id()
        event = self.model(**model.model_dump(), id=int(last_id)+1)

        await self.create(event.model_dump())
        return event

    async def delete(self, id, payload):
        if payload["role"] in ["Candidato", "Paciente"]:
            raise HTTPException(status_code=401, detail="No tienes permisos para realizar esta acción")
        from reuniones_microservice.services.reunion_inicial_service import ReunionInicialService
        from reuniones_microservice.services.reunion_administracion_service import ReunionAdministracionService
        reunion_inicial_service = ReunionInicialService()
        reunion_administracion_service = ReunionAdministracionService()
        reuniones = await reunion_inicial_service.get_multiple()
        reuniones_administracion = await reunion_administracion_service.get_multiple()
        for reunion in reuniones:
            if reunion.guestId == id:
                await reunion_inicial_service.delete_one(reunion.id)
        for reunion in reuniones_administracion:
            if reunion.guestId == id and reunion.tipoGuest == "Candidato":
                await reunion_administracion_service.delete_one(reunion.id)
        return await self.delete_one(id)

    async def get_todos(self, payload):
        async def format(data):
            if type(data) != self.model:
                data.pop("_id")
                return self.model(**data)
            else:
                return data
            
        if payload["role"] in ["Candidato", "Paciente"]:
            raise HTTPException(status_code=401, detail="No tienes permisos para realizar esta acción")
        
        return await gather(*[format(element) for element in await self.get_multiple()])

    async def get_uno(self, id, payload):
        if payload["role"] in ["Candidato", "Paciente"]:
            raise HTTPException(status_code=401, detail="No tienes permisos para realizar esta acción")
        
        data = await self.get_one(id)
        if type(data) == ValueError:
            return Response(data.args[0], 400)
        else:
            return data
        
    async def get_pacientes_candidatos(self, payload):
        if payload["role"] in ["Candidato", "Paciente"]:
            raise HTTPException(status_code=401, detail="No tienes permisos para realizar esta acción")
        from .paciente_service import PacienteService
        from .terapeuta_service import TerapeutaService

        paciente_service = PacienteService()
        terapeuta_service = TerapeutaService()
        if payload["role"] == "Admin":
            usuarios = []
            candidatos = await self.get_todos(payload)
            pacientes = await paciente_service.get_todos(payload)
            usuarios.extend(candidatos)
            usuarios.extend(pacientes)
            return usuarios

        if payload["role"] == "Terapeuta":
            terapeuta = await terapeuta_service.get_uno(payload["id"], payload)
            pacientes = await paciente_service.get_todos(payload)
            data = []
            for paciente in pacientes:
                if paciente.id in terapeuta.pacientes:
                    data.append(paciente)
            return data