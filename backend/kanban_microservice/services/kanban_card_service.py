from fastapi import HTTPException
from .module_service import ModuleService
from ..models.KanbanCard import KanbanCard
from datos_microservice.services.area_service import AreaService


class KanbanCardService(ModuleService):
    def __init__(self):
        self.area_service = AreaService()
        super().__init__(KanbanCard, "KanbanCards")

    async def crear(self, model, payload):
        await self.area_service.validate_area_ids([model.areaId])
        if payload["role"] != "Admin" and model.areaId not in payload.get("areaIds", []):
            raise HTTPException(status_code=401, detail="No tienes permisos para crear tarjetas en esta area")
        last_id = await self.get_last_id()
        card = self.model(**model.model_dump(), id=int(last_id) + 1)
        return await self.create(card)

    async def get_by_board(self, board_id: int, payload):
        cards = await self.get_multiple({"boardId": board_id})
        if payload["role"] == "Admin":
            return cards
        area_ids = payload.get("areaIds", [])
        return [card for card in cards if card.areaId in area_ids]
