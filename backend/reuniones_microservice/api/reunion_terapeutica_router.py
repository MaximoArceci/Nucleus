from fastapi import Depends
from ..models.ReunionTerapeutica import ReunionTerapeutica, ReunionTerapeuticaCreate
from ..services.reunion_terapeutica_service import ReunionTerapeuticaService
from ..utils.jwt_utils import JWTUtils
from .model_router import ModelRouter
from typing import List

jwt = JWTUtils()


class ReunionTerapeuticaRouter(ModelRouter):
    def __init__(self):

        self.reunion_terapeutica_service = ReunionTerapeuticaService()
        super().__init__(ReunionTerapeutica, ReunionTerapeuticaService(), ReunionTerapeuticaCreate)
        self.routes()

    def routes(self):

        @self.router.get("/reuniones_by_user")
        async def get_reuniones_by_user(payload: str = Depends(jwt.get_current_user)):
            return await self.reunion_terapeutica_service.get_reuniones_by_user(payload)

        self.model_routes(exclude=[1, 4])

        @self.router.patch("/{id}", response_model=self.model)
        async def update_one(id: int, model: dict, payload: str = Depends(jwt.get_current_user)):
            return await self.reunion_terapeutica_service.update(id, model, payload)
        
        @self.router.post("/", response_model=self.model)
        async def create(model: self.createModel, payload: str = Depends(jwt.get_current_user)):
            return await self.reunion_terapeutica_service.crear(model, payload)
        
        @self.router.delete("/", response_model=self.model)
        async def delete_one(id: int, payload: str = Depends(jwt.get_current_user)):
            return await self.reunion_terapeutica_service.delete(id, payload)
        
        @self.router.get("/", response_model=List[self.model])
        async def get_multiple(payload: str = Depends(jwt.get_current_user)):
            return await self.reunion_terapeutica_service.get_todos(payload)

        @self.router.get("/{id}", response_model=self.model)
        async def get_one(id: int, payload: str = Depends(jwt.get_current_user)):
            return await self.reunion_terapeutica_service.get_uno(id, payload)