from fastapi import HTTPException
from ..models.Cobro import Cobro
from .module_service import ModuleService
from datos_microservice.services.terapeuta_service import TerapeutaService
from fastapi import Response
from asyncio import gather

class CobroService(ModuleService):
    def __init__(self):
        self.terapeuta_service = TerapeutaService()
        super().__init__(Cobro, "Cobros")

    async def create(self, data):

        if type(data) != self.model:
            data = self.model(**data)
        if await self.find_one({"id": data.id}):
            raise HTTPException(
                status_code=400, detail="Error, este ID ya ha sido utilizado")
        return await super().create(data)

    async def update(self, id, model, payload):
        if payload["role"] in ["Candidato", "Terapeuta", "Paciente"]:
            raise HTTPException(status_code=401, detail="No tienes permisos para realizar esta acción")

        if len(model["fecha"]) == 0:
            raise HTTPException(
                status_code=400, detail=f"El campo de la fecha no puede estar vacio")
        
        if model["total"] < 0:
            raise HTTPException(
                status_code=400, detail=f"El campo 'Total' no puede ser negativo")
        
        return await self.update_one(id, model)
        
    async def get_cobros_terapeuta(self, terapeutaId, payload):
        role = payload["role"]
        if role in ["Admin", "Terapeuta"]:
            pagos = await self.get_multiple()
            data=[]
            for pago in pagos:
                if pago.terapeutaId == terapeutaId:
                    data.append(pago)
            return data
        else:
            raise HTTPException(
                status_code=401, detail="No tienes permisos para realizar esta acción")
        
    async def crear(self, model, payload):
        last_id = await self.get_last_id()
        event = self.model(**model.model_dump(), id=int(last_id)+1)
        
        role = payload["role"]

        if role == "Terapeuta":
            terapeuta = await self.terapeuta_service.get_one(event.terapeutaId)       
            if event.total > terapeuta.montoAcumulado:
                raise HTTPException(
                    status_code=400, detail="No tienes suficiente dinero para realizar esta acción")
            terapeuta.montoAcumulado -= event.total
            terapeutaDict = terapeuta.dict()
            await self.terapeuta_service.update(terapeuta.id, terapeutaDict, payload)

            await self.create(event.model_dump())
        
            return event
        else:
            raise HTTPException(
                status_code=401, detail="No tienes permisos para realizar esta acción")
    
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
            
        if payload["role"] in ["Candidato", "Paciente", "Terapeuta"]:
            raise HTTPException(status_code=401, detail="No tienes permisos para realizar esta acción")
        
        return await gather(*[format(element) for element in await self.get_multiple()])

    async def get_uno(self, id, payload):
        if payload["role"] in ["Candidato", "Paciente", "Terapeuta"]:
            raise HTTPException(status_code=401, detail="No tienes permisos para realizar esta acción")
        
        data = await self.get_one(id)
        if type(data) == ValueError:
            return Response(data.args[0], 400)
        else:
            return data