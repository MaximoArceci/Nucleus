from .login_service import LoginService
from ..models.Administrador import Administrador
from fastapi import HTTPException
import re
from asyncio import gather
from fastapi.responses import Response
from .candidato_service import CandidatoService
from .paciente_service import PacienteService
from .terapeuta_service import TerapeutaService

class AdministradorService(LoginService):
    def __init__(self):
        self.candidato_service = CandidatoService()
        self.paciente_service = PacienteService()
        self.terapeuta_service = TerapeutaService()
        super().__init__(Administrador, "Administradores")

    async def create(self, data):

        if type(data) != self.model:
            data = self.model(**data)
        if await self.find_one({"id": data.id}):
            raise HTTPException(
                status_code=400, detail="Error, este ID ya ha sido utilizado")
        if await self.find_one({"email": data.email}):
            raise HTTPException(
                status_code=400, detail="Error, este email ya ha sido utilizado")
        if await self.candidato_service.find_one({"email": data.email}):
            raise HTTPException(
                status_code=400, detail="Error, este email ya ha sido registrado como candidato")
        if await self.paciente_service.find_one({"email": data.email}):
            raise HTTPException(
                status_code=400, detail="Error, este email ya ha sido registrado como paciente")
        if await self.terapeuta_service.find_one({"email": data.email}):
            raise HTTPException(
                status_code=400, detail="Error, este email ya ha sido registrado como terapeuta")
        return await super().create(data)

    async def update(self, id, model, payload):
        if payload["role"] in ["Candidato", "Terapeuta", "Paciente"]:
            raise HTTPException(status_code=401, detail="No tienes permisos para realizar esta acción")

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

        return await self.update_one(id, model)
    
    async def crear(self, model, payload):
        if payload["role"] in ["Candidato", "Terapeuta", "Paciente"]:
            raise HTTPException(status_code=401, detail="No tienes permisos para realizar esta acción")

        last_id = await self.get_last_id()
        event = self.model(**model.model_dump(), id=int(last_id)+1)

        await self.create(event.model_dump())
        return event

    async def delete(self, id, payload):
        if payload["role"] in ["Candidato", "Terapeuta", "Paciente"]:
            raise HTTPException(status_code=401, detail="No tienes permisos para realizar esta acción")
        
        return await self.delete_one(id)

    async def get_todos(self, payload):
        async def format(data):
            if type(data) != self.model:
                data.pop("_id")
                return self.model(**data)
            else:
                return data
            
        if payload["role"] in ["Candidato", "Terapeuta", "Paciente"]:
            raise HTTPException(status_code=401, detail="No tienes permisos para realizar esta acción")
        
        return await gather(*[format(element) for element in await self.get_multiple()])

    async def get_uno(self, id, payload):
        if payload["role"] in ["Candidato", "Terapeuta", "Paciente"]:
            raise HTTPException(status_code=401, detail="No tienes permisos para realizar esta acción")
        
        data = await self.get_one(id)
        if type(data) == ValueError:
            return Response(data.args[0], 400)
        else:
            return data
        
    async def get_all_users(self, payload):
        from .voluntario_service import VoluntarioService
        voluntario_service = VoluntarioService()

        if payload["role"] in ["Candidato", "Terapeuta", "Paciente"]:
            raise HTTPException(status_code=401, detail="No tienes permisos para realizar esta acción")
        
        users =[]
        candidatos = await self.candidato_service.get_multiple()
        pacientes = await self.paciente_service.get_multiple()
        terapeutas = await self.terapeuta_service.get_multiple()
        voluntarios = await voluntario_service.get_multiple()
        users.append(candidatos)
        users.append(pacientes)
        users.append(terapeutas)
        users.append(voluntarios)
        return users
