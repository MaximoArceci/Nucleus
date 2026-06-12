from .login_router import LoginRouter
from ..models.Administrador import Administrador, AdministradorCreate
from ..services.administrador_service import AdministradorService
from fastapi import Depends
from ..utils.jwt_utils import JWTUtils
from typing import List

jwt = JWTUtils()


class AdministradorRouter(LoginRouter):
    def __init__(self):

        self.administrador_service = AdministradorService()
        super().__init__(Administrador, AdministradorService(), AdministradorCreate)
        self.routes()

    def routes(self):

        @self.router.get("/allUsers")
        async def allUsers(payload: str = Depends(jwt.get_current_user)):
            return await self.administrador_service.get_all_users(payload)

        self.model_routes(exclude=[1,2,3,4,5])

        @self.router.patch("/{id}", response_model=self.model)
        async def update_one(id: int, model: dict, payload: str = Depends(jwt.get_current_user)):
            return await self.administrador_service.update(id, model, payload)
        
        @self.router.post("/", response_model=self.model)
        async def create(model: self.createModel, payload: str = Depends(jwt.get_current_user)):
            return await self.administrador_service.crear(model, payload) 
        
        @self.router.delete("/", response_model=self.model)
        async def delete_one(id: int, payload: str = Depends(jwt.get_current_user)):
            return await self.administrador_service.delete(id, payload)
        
        @self.router.get("/", response_model=List[self.model])
        async def get_multiple(payload: str = Depends(jwt.get_current_user)):
            return await self.administrador_service.get_todos(payload)

        @self.router.get("/{id}", response_model=self.model)
        async def get_one(id: int, payload: str = Depends(jwt.get_current_user)):
            return await self.administrador_service.get_uno(id, payload)

        self.login_routes()
