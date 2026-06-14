from fastapi import Depends
from typing import List
from ..models.Reunion import Reunion, ReunionCreate
from ..services.reunion_service import ReunionService
from ..utils.jwt_utils import JWTUtils
from .model_router import ModelRouter

jwt = JWTUtils()


class ReunionRouter(ModelRouter):
    def __init__(self):
        self.reunion_service = ReunionService()
        super().__init__(Reunion, ReunionService(), ReunionCreate)
        self.routes()

    def routes(self):
        self.model_routes(exclude=[1, 2, 3, 4, 5])

        @self.router.get("/reuniones_by_user")
        async def get_reuniones_by_user(payload: dict = Depends(jwt.get_current_user)):
            return await self.reunion_service.get_reuniones_by_user(payload)

        @self.router.post("/", response_model=self.model)
        async def create(model: self.createModel, payload: dict = Depends(jwt.get_current_user)):
            return await self.reunion_service.crear(model, payload)

        @self.router.patch("/{id}", response_model=self.model)
        async def update_one(id: int, model: dict, payload: dict = Depends(jwt.get_current_user)):
            return await self.reunion_service.update(id, model, payload)

        @self.router.delete("/", response_model=self.model)
        async def delete_one(id: int, payload: dict = Depends(jwt.get_current_user)):
            return await self.reunion_service.delete(id, payload)

        @self.router.get("/", response_model=List[self.model])
        async def get_multiple(payload: dict = Depends(jwt.get_current_user)):
            return await self.reunion_service.get_todos(payload)

        @self.router.get("/{id}", response_model=self.model)
        async def get_one(id: int, payload: dict = Depends(jwt.get_current_user)):
            return await self.reunion_service.get_one(id)
