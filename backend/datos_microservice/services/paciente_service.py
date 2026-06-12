from .login_service import LoginService
from ..models.Paciente import Paciente
from fastapi import HTTPException
import re
from .candidato_service import CandidatoService
from asyncio import gather
from fastapi.responses import Response
from .terapeuta_service import TerapeutaService


class PacienteService(LoginService):
    def __init__(self):
        self.terapeuta_service = TerapeutaService()
        self.candidato_service = CandidatoService()
        super().__init__(Paciente, "Pacientes")

    async def create(self, data):
        from .administrador_service import AdministradorService
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
        if await self.terapeuta_service.find_one({"email": data.email}):
            raise HTTPException(
                status_code=400, detail="Error, este email ya ha sido registrado como terapeuta")
        if await self.administrador_service.find_one({"email": data.email}):
            raise HTTPException(
                status_code=400, detail="Error, este email ya ha sido registrado como administrador")
        return await super().create(data)

    async def update(self, id, model, payload):
        if payload["role"] in ["Candidato"]:
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

        if model["cantFichas"] < 0:
            raise HTTPException(
                status_code=400, detail=f"El campo 'Fichas' no puede ser negativo")

        if model["fichasTotales"] < 0:
            raise HTTPException(
                status_code=400, detail=f"El campo 'Fichas Totales' no puede ser negativo")

        if model["tipoFicha"] not in ["FICHA 1", "FICHA 2", "FICHA 3", "FICHA 4", "FICHA 5", "FICHA 6"]:
            raise HTTPException(
                status_code=400, detail=f"El campo 'Tipo de Ficha' solo puede ser 'FICHA 1', 'FICHA 2', 'FICHA 3', 'FICHA 4', 'FICHA 5' o 'FICHA 6'")

        return await self.update_one(id, model)

    async def crear(self, model, candidatoId, payload):
        if payload["role"] == "Admin":
            last_id = await self.get_last_id()
            event = self.model(**model.model_dump(), id=int(last_id)+1)

            candidato = await self.candidato_service.get_one(candidatoId)
            event.username = candidato.username
            event.email = candidato.email

            paciente = await self.create(event)
            await self.candidato_service.delete(candidatoId, payload)
            return paciente
        else:
            raise HTTPException(
                status_code=401, detail="No tienes permisos para realizar esta accion")

    async def delete(self, id, payload):
        if payload["role"] in ["Candidato", "Paciente"]:
            raise HTTPException(
                status_code=401, detail="No tienes permisos para realizar esta acción")
        from reuniones_microservice.services.reunion_terapeutica_service import ReunionTerapeuticaService
        from reuniones_microservice.services.reunion_administracion_service import ReunionAdministracionService
        from pago_microservice.services.pago_service import PagoService
        pago_service = PagoService()
        reunion_terapeutica_service = ReunionTerapeuticaService()
        reunion_administracion_service = ReunionAdministracionService()

        reuniones = await reunion_terapeutica_service.get_multiple()
        for reunion in reuniones:
            if reunion.guestId == id:
                await reunion_terapeutica_service.delete_one(reunion.id)

        reuniones_administracion = await reunion_administracion_service.get_multiple()
        for reunion in reuniones_administracion:
            if reunion.guestId == id and reunion.tipoGuest == "Paciente":
                await reunion_administracion_service.delete_one(reunion.id)

        pagos = await pago_service.get_multiple()
        for pago in pagos:
            if pago.pacienteId == id:
                await pago_service.delete_one(pago.id)

        terapeutas = await self.terapeuta_service.get_multiple()
        for terapeuta in terapeutas:
            if id in terapeuta.pacientes:
                terapeuta.pacientes.remove(id)
                terapeutaDict = terapeuta.model_dump()
                await self.terapeuta_service.update_one(terapeuta.id, terapeutaDict)
        return await self.delete_one(id)

    async def get_todos(self, payload):
        async def format(data):
            if type(data) != self.model:
                data.pop("_id")
                return self.model(**data)
            else:
                return data

        if payload["role"] in ["Candidato", "Paciente"]:
            raise HTTPException(
                status_code=401, detail="No tienes permisos para realizar esta acción")

        return await gather(*[format(element) for element in await self.get_multiple()])

    async def get_uno(self, id, payload):
        if payload["role"] in ["Candidato", "Paciente"]:
            raise HTTPException(
                status_code=401, detail="No tienes permisos para realizar esta acción")

        data = await self.get_one(id)
        if type(data) == ValueError:
            return Response(data.args[0], 400)
        else:
            return data
