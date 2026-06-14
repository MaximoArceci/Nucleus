from fastapi import Depends
from ..utils.jwt_utils import JWTUtils
from .model_router import ModelRouter
from ..models.Pago import Pago, PagoCreate
from ..services.pago_service import PagoService
from typing import List

jwt = JWTUtils()


class PagoRouter(ModelRouter):
    def __init__(self):

        self.pago_service = PagoService()
        super().__init__(Pago, PagoService(), PagoCreate)
        self.routes()

    def routes(self):

        @self.router.get("/pagos_paciente")
        async def get_pagos_paciente(pacienteId: int, payload: str = Depends(jwt.get_current_user)):
            return await self.pago_service.get_pagos_paciente(pacienteId, payload)

        self.model_routes(exclude=[1, 2, 3, 4, 5])

        @self.router.patch("/{id}", response_model=self.model)
        async def update_one(id: int, model: dict, payload: str = Depends(jwt.get_current_user)):
            return await self.pago_service.update(id, model, payload)

        @self.router.post("/", response_model=self.model)
        async def create(model: self.createModel, payload: str = Depends(jwt.get_current_user)):
            return await self.pago_service.crear(model, payload)

        @self.router.delete("/", response_model=self.model)
        async def delete_one(id: int, payload: str = Depends(jwt.get_current_user)):
            return await self.pago_service.delete(id, payload)

        @self.router.get("/", response_model=List[self.model])
        async def get_multiple(payload: str = Depends(jwt.get_current_user)):
            return await self.pago_service.get_todos(payload)

        @self.router.get("/{id}", response_model=self.model)
        async def get_one(id: int, payload: str = Depends(jwt.get_current_user)):
            return await self.pago_service.get_uno(id, payload)
