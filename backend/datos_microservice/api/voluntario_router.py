from fastapi import Depends
from typing import List
from .login_router import LoginRouter
from ..models.Voluntario import Voluntario, VoluntarioCreate
from ..services.voluntario_service import VoluntarioService
from ..utils.jwt_utils import JWTUtils

jwt = JWTUtils()


class VoluntarioRouter(LoginRouter):
    def __init__(self):
        self.voluntario_service = VoluntarioService()
        super().__init__(Voluntario, VoluntarioService(), VoluntarioCreate)
        self.routes()

    def routes(self):
        self.model_routes(exclude=[1, 2, 3, 4, 5])

        @self.router.post("/")
        async def create(model: self.createModel):
            return await self.voluntario_service.crear(model)

        @self.router.patch("/{id}", response_model=self.model)
        async def update_one(id: int, model: dict, payload: str = Depends(jwt.get_current_user)):
            return await self.voluntario_service.update(id, model, payload)

        @self.router.delete("/", response_model=self.model)
        async def delete_one(id: int, payload: str = Depends(jwt.get_current_user)):
            return await self.voluntario_service.delete(id, payload)

        @self.router.get("/", response_model=List[self.model])
        async def get_multiple(payload: str = Depends(jwt.get_current_user)):
            return await self.voluntario_service.get_todos(payload)

        @self.router.get("/{id}", response_model=self.model)
        async def get_one(id: int, payload: str = Depends(jwt.get_current_user)):
            return await self.voluntario_service.get_uno(id, payload)

        self.login_routes()
