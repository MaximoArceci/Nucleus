from .module_service import ModuleService
from ..utils.jwt_utils import JWTUtils
from fastapi.responses import Response

jwt = JWTUtils()

class LoginService(ModuleService):
    def __init__(self, model, collection_name):
        
        super().__init__(model, collection_name)

    async def is_register(self, email: str):

        try:
            data = await self.get_multiple({"email": email})
        except:
            return "Error, usuario no registradoooo"
        return data

    async def register(self, data):

        return await self.create(data)

    async def login(self, email: str):

        user = await self.is_register(email)
        if len(user) == 0:
            return Response("Error, usuario no registrado", 410)
        try:
            user = user[0]
        except:
            return Response("Error, usuario sin role", 400)
        else:
            data = [{
                "user": user,
                "access_token": jwt.write_token(user)
            }]
            return data
