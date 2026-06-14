from fastapi import HTTPException
from .module_service import ModuleService
from ..models.KanbanBoard import KanbanBoard
from datos_microservice.services.area_service import AreaService


class KanbanBoardService(ModuleService):
    def __init__(self):
        self.area_service = AreaService()
        super().__init__(KanbanBoard, "KanbanBoards")

    async def crear(self, model, payload):
        await self.area_service.validate_area_ids([model.areaId])
        if payload["role"] != "Admin" and model.areaId not in payload.get("areaIds", []):
            raise HTTPException(status_code=401, detail="No tienes permisos para crear tableros en esta area")
        last_id = await self.get_last_id()
        board = self.model(**model.model_dump(), id=int(last_id) + 1)
        return await self.create(board)

    async def get_todos(self, payload):
        if payload["role"] == "Admin":
            return await self.get_multiple()
        return await self.get_multiple({"areaId": {"$in": payload.get("areaIds", [])}})
