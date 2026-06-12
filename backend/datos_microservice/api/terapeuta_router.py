from .login_router import LoginRouter
from ..models.Terapeuta import Terapeuta, TerapeutaCreate
from ..services.terapeuta_service import TerapeutaService
from fastapi import Depends
from ..utils.jwt_utils import JWTUtils
from typing import List

jwt = JWTUtils()


class TerapeutaRouter(LoginRouter):
    def __init__(self):

        self.terapeuta_service = TerapeutaService()
        super().__init__(Terapeuta, TerapeutaService(), TerapeutaCreate)
        self.routes()

    def routes(self):

        self.model_routes(exclude=[1,2,3,4,5])

        @self.router.patch("/{id}", response_model=self.model)
        async def update_one(id: int, model: dict, payload: str = Depends(jwt.get_current_user)):
            return await self.terapeuta_service.update(id, model, payload)

        @self.router.post("/", response_model=self.model)
        async def create(model: self.createModel, payload: str = Depends(jwt.get_current_user)):
            return await self.terapeuta_service.crear(model, payload) 
        
        @self.router.delete("/", response_model=self.model)
        async def delete_one(id: int, payload: str = Depends(jwt.get_current_user)):
            return await self.terapeuta_service.delete(id, payload)
        
        @self.router.get("/", response_model=List[self.model])
        async def get_multiple(payload: str = Depends(jwt.get_current_user)):
            return await self.terapeuta_service.get_todos(payload)

        @self.router.get("/{id}", response_model=self.model)
        async def get_one(id: int, payload: str = Depends(jwt.get_current_user)):
            return await self.terapeuta_service.get_uno(id, payload)
        
        self.login_routes()
