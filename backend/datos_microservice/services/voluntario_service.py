from asyncio import gather
from fastapi import HTTPException
from fastapi.responses import Response
from .login_service import LoginService
from ..models.Voluntario import Voluntario
from .area_service import AreaService


class VoluntarioService(LoginService):
    def __init__(self):
        self.area_service = AreaService()
        super().__init__(Voluntario, "Voluntarios")

    async def create(self, data):
        if type(data) != self.model:
            data = self.model(**data)
        data.areaIds = await self.area_service.validate_area_ids(data.areaIds)
        if await self.find_one({"id": data.id}):
            raise HTTPException(status_code=400, detail="Error, este ID ya ha sido utilizado")
        if await self.find_one({"email": data.email}):
            raise HTTPException(status_code=400, detail="Error, este email ya ha sido utilizado")
        return await super().create(data)

    async def crear(self, model):
        existing = await self.find_one({"email": model.email})
        if existing:
            return await self.login(model.email)

        last_id = await self.get_last_id()
        voluntario = self.model(**model.model_dump(), id=int(last_id) + 1)
        await self.create(voluntario.model_dump())
        return await self.login(voluntario.email)

    async def update(self, id, model, payload):
        if payload["role"] != "Admin" and payload["id"] != id:
            raise HTTPException(status_code=401, detail="No tienes permisos para realizar esta accion")
        if "areaIds" in model:
            model["areaIds"] = await self.area_service.validate_area_ids(model["areaIds"])
        return await self.update_one(id, model)

    async def delete(self, id, payload):
        if payload["role"] != "Admin":
            raise HTTPException(status_code=401, detail="No tienes permisos para realizar esta accion")
        return await self.delete_one(id)

    async def get_todos(self, payload):
        async def format(data):
            if type(data) != self.model:
                data.pop("_id")
                return self.model(**data)
            return data

        return await gather(*[format(element) for element in await self.get_multiple()])

    async def get_uno(self, id, payload):
        data = await self.get_one(id)
        if type(data) == ValueError:
            return Response(data.args[0], 400)
        return data
