from asyncio import gather
from fastapi import HTTPException
from fastapi.responses import Response
from .module_service import ModuleService
from ..models.Area import Area


class AreaService(ModuleService):
    def __init__(self):
        super().__init__(Area, "Areas")

    async def create(self, data):
        if type(data) != self.model:
            data = self.model(**data)
        if await self.find_one({"id": data.id}):
            raise HTTPException(status_code=400, detail="Error, este ID ya ha sido utilizado")
        if await self.find_one({"slug": data.slug}):
            raise HTTPException(status_code=400, detail="Error, este slug ya ha sido utilizado")
        return await super().create(data)

    async def crear(self, model, payload):
        if payload["role"] != "Admin":
            raise HTTPException(status_code=401, detail="No tienes permisos para crear areas")
        last_id = await self.get_last_id()
        area = self.model(**model.model_dump(), id=int(last_id) + 1)
        return await self.create(area.model_dump())

    async def validate_area_ids(self, area_ids: list[int]) -> list[int]:
        normalized = sorted(set(area_ids))
        for area_id in normalized:
            area = await self.get_one(area_id)
            if type(area) == ValueError:
                raise HTTPException(status_code=400, detail=f"Area inexistente: {area_id}")
        return normalized

    async def get_todos(self):
        async def format(data):
            if type(data) != self.model:
                data.pop("_id")
                return self.model(**data)
            return data

        return await gather(*[format(element) for element in await self.get_multiple()])

    async def get_uno(self, id):
        data = await self.get_one(id)
        if type(data) == ValueError:
            return Response(data.args[0], 400)
        return data
