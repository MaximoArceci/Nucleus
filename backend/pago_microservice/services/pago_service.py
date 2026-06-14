from fastapi import HTTPException, Request
from ..models.Pago import Pago
from .module_service import ModuleService
from datos_microservice.services.paciente_service import PacienteService
from datos_microservice.services.candidato_service import CandidatoService
from fastapi import Response
from asyncio import gather


class PagoService(ModuleService):
    def __init__(self):
        self.paciente_service = PacienteService()
        self.candidato_service = CandidatoService()
        super().__init__(Pago, "Pagos")

    async def create(self, data):

        if type(data) != self.model:
            data = self.model(**data)
        if await self.find_one({"id": data.id}):
            raise HTTPException(
                status_code=400, detail="Error, este ID ya ha sido utilizado")
        return await super().create(data)

    async def update(self, id, model, payload):
        if payload["role"] in ["Candidato", "Terapeuta", "Paciente"]:
            raise HTTPException(
                status_code=401, detail="No tienes permisos para realizar esta acción")

        if len(model["fecha"]) == 0:
            raise HTTPException(
                status_code=400, detail=f"El campo de la fecha no puede estar vacio")

        if model["total"] < 0:
            raise HTTPException(
                status_code=400, detail=f"El campo 'Total' no puede ser negativo")

        if model["cantFichas"] < 0:
            raise HTTPException(
                status_code=400, detail=f"El campo 'Cantidad de Fichas' no puede ser negativo")

        return await self.update_one(id, model)

    async def get_pagos_paciente(self, pacienteId, payload):
        role = payload["role"]
        if role == "Admin":
            pagos = await self.get_multiple()
            data = []
            for pago in pagos:
                if pago.pacienteId == pacienteId:
                    data.append(pago)
            return data
        else:
            raise HTTPException(
                status_code=401, detail="No tienes permisos para realizar esta acción")

    async def crear(self, model, payload):
        last_id = await self.get_last_id()
        event = self.model(**model.model_dump(), id=int(last_id)+1)

        role = payload["role"]

        if role == "Paciente":
            paciente = await self.paciente_service.get_one(event.pacienteId)

            paciente.cantFichas += event.cantFichas
            paciente.fichasTotales += event.cantFichas
            pacienteDict = paciente.dict()
            await self.paciente_service.update(paciente.id, pacienteDict, payload)

            await self.create(event.model_dump())

            return event

        elif role == "Candidato":
            candidato = await self.candidato_service.get_one(payload["id"])
            candidato.abonaReunion = True
            candidatoDict = candidato.dict()
            await self.candidato_service.update(payload["id"], candidatoDict, payload)
            return event
        else:
            raise HTTPException(
                status_code=401, detail="No tienes permisos para realizar esta acción")

    async def delete(self, id, payload):
        if payload["role"] in ["Candidato", "Terapeuta", "Paciente"]:
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
