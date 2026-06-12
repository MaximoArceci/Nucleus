from fastapi import Depends
from ..utils.jwt_utils import JWTUtils
from ..models.ReunionInicial import ReunionInicial, ReunionInicialCreate
from ..services.reunion_inicial_service import ReunionInicialService
from .model_router import ModelRouter
from typing import List

jwt = JWTUtils()


class ReunionInicialRouter(ModelRouter):
    def __init__(self):

        self.reunion_inicial_service = ReunionInicialService()
        super().__init__(ReunionInicial, ReunionInicialService(), ReunionInicialCreate)
        self.routes()

    def routes(self):

        @self.router.get("/reuniones_by_user")
        async def get_reuniones_by_user(payload: str = Depends(jwt.get_current_user)):
            return await self.reunion_inicial_service.get_reuniones_by_user(payload)
        
        @self.router.patch("/reuniones_all")
        async def get_reuniones_all(data: dict, payload: str = Depends(jwt.get_current_user)):
            return await self.reunion_inicial_service.get_reuniones_all(payload, data)
        
        self.model_routes(exclude=[1,2,3,4,5])

        @self.router.patch("/{id}")
        async def update_one(model: dict, payload: str = Depends(jwt.get_current_user)):
            return await self.reunion_inicial_service.update(model, payload)
        
        @self.router.post("/")
        async def create(model: self.createModel, payload: str = Depends(jwt.get_current_user)):
            return await self.reunion_inicial_service.crear(model, payload) 
        
        @self.router.delete("/")
        async def delete_one(id: int, model: self.createModel, payload: str = Depends(jwt.get_current_user)):
            return await self.reunion_inicial_service.delete(id, payload, model)
        
        @self.router.get("/", response_model=List[self.model])
        async def get_multiple(payload: str = Depends(jwt.get_current_user)):
            return await self.reunion_inicial_service.get_todos(payload)

        @self.router.get("/{id}", response_model=self.model)
        async def get_one(id: int, payload: str = Depends(jwt.get_current_user)):
            return await self.reunion_inicial_service.get_uno(id, payload)