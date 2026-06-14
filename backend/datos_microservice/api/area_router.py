from fastapi import Depends
from typing import List
from .model_router import ModelRouter
from ..models.Area import Area, AreaCreate
from ..services.area_service import AreaService
from ..utils.jwt_utils import JWTUtils

jwt = JWTUtils()


class AreaRouter(ModelRouter):
    def __init__(self):
        self.area_service = AreaService()
        super().__init__(Area, AreaService(), AreaCreate)
        self.routes()

    def routes(self):
        self.model_routes(exclude=[1, 2, 3, 4, 5])

        @self.router.post("/", response_model=self.model)
        async def create(model: self.createModel, payload: dict = Depends(jwt.get_current_user)):
            return await self.area_service.crear(model, payload)

        @self.router.get("/", response_model=List[self.model])
        async def get_multiple():
            return await self.area_service.get_todos()

        @self.router.get("/{id}", response_model=self.model)
        async def get_one(id: int):
            return await self.area_service.get_uno(id)

        @self.router.patch("/{id}", response_model=self.model)
        async def update_one(id: int, model: dict, payload: dict = Depends(jwt.get_current_user)):
            return await self.area_service.update_one(id, model)

        @self.router.delete("/", response_model=self.model)
        async def delete_one(id: int, payload: dict = Depends(jwt.get_current_user)):
            return await self.area_service.delete_one(id)
