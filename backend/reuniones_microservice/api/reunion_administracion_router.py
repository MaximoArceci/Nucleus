from fastapi import Depends
from ..utils.jwt_utils import JWTUtils
from .model_router import ModelRouter
from typing import List
from ..models.ReunionAdministracion import ReunionAdministracion, ReunionAdministracionCreate
from ..services.reunion_administracion_service import ReunionAdministracionService


jwt = JWTUtils()


class ReunionAdministracionRouter(ModelRouter):
    def __init__(self):

        self.reunion_administracion_service = ReunionAdministracionService()
        super().__init__(ReunionAdministracion, ReunionAdministracionService(), ReunionAdministracionCreate)
        self.routes()

    def routes(self):

        self.model_routes(exclude=[1, 4])

        @self.router.patch("/{id}", response_model=self.model)
        async def update_one(id: int, model: dict, payload: str = Depends(jwt.get_current_user)):
            return await self.reunion_administracion_service.update(id, model, payload)
        
        @self.router.post("/", response_model=self.model)
        async def create(model: self.createModel, payload: str = Depends(jwt.get_current_user)):
            return await self.reunion_administracion_service.crear(model, payload)
        
        @self.router.delete("/", response_model=self.model)
        async def delete_one(id: int, payload: str = Depends(jwt.get_current_user)):
            return await self.reunion_administracion_service.delete(id, payload)
        
        @self.router.get("/", response_model=List[self.model])
        async def get_multiple(payload: str = Depends(jwt.get_current_user)):
            return await self.reunion_administracion_service.get_todos(payload)

        @self.router.get("/{id}", response_model=self.model)
        async def get_one(id: int, payload: str = Depends(jwt.get_current_user)):
            return await self.reunion_administracion_service.get_uno(id, payload)
        
        @self.router.post("/solicitar_reunion")
        async def solicitar_reunion(motivo: str, payload: str = Depends(jwt.get_current_user)):
            return await self.reunion_administracion_service.solicitar_reunion(motivo, payload)