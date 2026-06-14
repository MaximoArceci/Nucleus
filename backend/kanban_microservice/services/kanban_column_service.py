from .module_service import ModuleService
from ..models.KanbanColumn import KanbanColumn


class KanbanColumnService(ModuleService):
    def __init__(self):
        super().__init__(KanbanColumn, "KanbanColumns")

    async def crear(self, model, payload):
        last_id = await self.get_last_id()
        column = self.model(**model.model_dump(), id=int(last_id) + 1)
        return await self.create(column)

    async def get_by_board(self, board_id: int):
        return await self.get_multiple({"boardId": board_id})
