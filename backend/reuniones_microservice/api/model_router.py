from fastapi import APIRouter, Response
from typing import List
from ..utils.jwt_utils import JWTUtils
from asyncio import gather

class ModelRouter:
    def __init__(self, model, service, createModel=None):

        self.model = model
        self.createModel = createModel
        self.router = APIRouter()
        self.services = service
        self.jwt = JWTUtils()
        # self.model_routes()

    def model_routes(self, exclude: list = []):

        if not 1 in exclude:
            @self.router.post("/create_full_data", response_model=self.model)
            async def create_with_full(model: self.model):
                return await self.services.create(model)

            if self.createModel:
                @self.router.post("/", response_model=self.model)
                async def create(model: self.createModel):
                    last_id = await self.services.get_last_id()
                    event = self.model(**model.model_dump(), id=int(last_id)+1)
                    await self.services.create(event.model_dump())
                    return event

        if not 2 in exclude:
            @self.router.get("/", response_model=List[self.model])
            async def get_multiple():
                async def format(data):
                    if type(data) != self.model:
                        data.pop("_id")
                        return self.model(**data)
                    else:
                        return data
                return await gather(*[format(element) for element in await self.services.get_multiple()])

        if not 3 in exclude:
            @self.router.get("/{id}", response_model=self.model)
            async def get_one(id: int):
                data = await self.services.get_one(id)
                if type(data) == ValueError:
                    return Response(data.args[0], 400)
                else:
                    return data

        if not 4 in exclude:
            @self.router.patch("/{id}", response_model=self.model)
            async def update_one(id: int, model: dict):
                return await self.services.update_one(id, model)

        if not 5 in exclude:
            @self.router.delete("/", response_model=self.model)
            async def delete_one(id: int):
                return await self.services.delete_one(id)
