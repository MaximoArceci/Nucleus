from .model_router import ModelRouter
import asyncio
from ..services.administrador_service import AdministradorService
from ..services.terapeuta_service import TerapeutaService
from ..services.paciente_service import PacienteService


class LoginRouter(ModelRouter):
    def __init__(self, model, service, createModel=None):

        super().__init__(model, service, createModel)
        self.login_routes()

    def login_routes(self):

        @self.router.get("/check_register/{email}")
        async def check_register(email: str):
            administradorS = AdministradorService()
            pacienteS = PacienteService()
            terapeutaS = TerapeutaService()

            admin, tera, paci = await asyncio.gather(
                administradorS.find_one({"email": email}),
                terapeutaS.find_one({"email": email}),
                pacienteS.find_one({"email": email})
            )
            if admin:
                return await administradorS.login(email)
            elif paci:
                return await pacienteS.login(email)
            elif tera:
                return await terapeutaS.login(email)
            return await self.services.login(email)