from fastapi import Depends
from ..utils.jwt_utils import JWTUtils
from .model_router import ModelRouter
from ..models.Cobro import Cobro, CobroCreate
from ..services.cobro_service import CobroService
from typing import List

jwt = JWTUtils()


class CobroRouter(ModelRouter):
    def __init__(self):

        self.cobro_service = CobroService()
        super().__init__(Cobro, CobroService(), CobroCreate)
        self.routes()

    def routes(self):

        @self.router.get("/cobros_terapeuta")
        async def get_cobros_terapeuta(terapeutaId: int, payload: str = Depends(jwt.get_current_user)):
            return await self.cobro_service.get_cobros_terapeuta(terapeutaId, payload)
        
        self.model_routes(exclude=[1, 2, 3, 4, 5])

        @self.router.patch("/{id}", response_model=self.model)
        async def update_one(id: int, model: dict, payload: str = Depends(jwt.get_current_user)):
            return await self.cobro_service.update(id, model, payload)

        @self.router.post("/", response_model=self.model)
        async def create(model: self.createModel, payload: str = Depends(jwt.get_current_user)):
            return await self.cobro_service.crear(model, payload)       
        
        @self.router.delete("/", response_model=self.model)
        async def delete_one(id: int, payload: str = Depends(jwt.get_current_user)):
            return await self.cobro_service.delete(id, payload)

        @self.router.get("/", response_model=List[self.model])
        async def get_multiple(payload: str = Depends(jwt.get_current_user)):
            return await self.cobro_service.get_todos(payload)

        @self.router.get("/{id}", response_model=self.model)
        async def get_one(id: int, payload: str = Depends(jwt.get_current_user)):
            return await self.cobro_service.get_uno(id, payload)