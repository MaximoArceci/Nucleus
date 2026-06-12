from .login_router import LoginRouter
from ..models.Candidato import Candidato, CandidatoCreate
from ..services.candidato_service import CandidatoService
from fastapi import Depends
from ..utils.jwt_utils import JWTUtils
from typing import List

jwt = JWTUtils()


class CandidatoRouter(LoginRouter):
    def __init__(self):

        self.candidato_service = CandidatoService()
        super().__init__(Candidato, CandidatoService(), CandidatoCreate)
        self.routes()

    def routes(self):

        self.model_routes(exclude=[1,2,3,4,5])

        @self.router.patch("/{id}", response_model=self.model)
        async def update_one(id: int, model: dict, payload: str = Depends(jwt.get_current_user)):
            return await self.candidato_service.update(id, model, payload)

        @self.router.post("/", response_model=self.model)
        async def create(model: self.createModel):
            return await self.candidato_service.crear(model) 
        
        @self.router.delete("/", response_model=self.model)
        async def delete_one(id: int, payload: str = Depends(jwt.get_current_user)):
            return await self.candidato_service.delete(id, payload)
        
        @self.router.get("/", response_model=List[self.model])
        async def get_multiple(payload: str = Depends(jwt.get_current_user)):
            return await self.candidato_service.get_todos(payload)

        @self.router.get("/{id}", response_model=self.model)
        async def get_one(id: int, payload: str = Depends(jwt.get_current_user)):
            return await self.candidato_service.get_uno(id, payload)

        @self.router.get("")
        async def get_pacientes_candidatos(payload: str = Depends(jwt.get_current_user)):
            return await self.candidato_service.get_pacientes_candidatos(payload)
        
        self.login_routes()
