from fastapi import APIRouter, Depends
from datos_microservice.utils.jwt_utils import JWTUtils
from ..models.KanbanBoard import KanbanBoard, KanbanBoardCreate
from ..models.KanbanColumn import KanbanColumn, KanbanColumnCreate
from ..models.KanbanCard import KanbanCard, KanbanCardCreate
from ..services.kanban_board_service import KanbanBoardService
from ..services.kanban_column_service import KanbanColumnService
from ..services.kanban_card_service import KanbanCardService

router = APIRouter()
jwt = JWTUtils()

board_service = KanbanBoardService()
column_service = KanbanColumnService()
card_service = KanbanCardService()


@router.get("/boards", response_model=list[KanbanBoard])
async def get_boards(payload: dict = Depends(jwt.get_current_user)):
    return await board_service.get_todos(payload)


@router.post("/boards", response_model=KanbanBoard)
async def create_board(model: KanbanBoardCreate, payload: dict = Depends(jwt.get_current_user)):
    return await board_service.crear(model, payload)


@router.patch("/boards/{id}", response_model=KanbanBoard)
async def update_board(id: int, model: dict, payload: dict = Depends(jwt.get_current_user)):
    return await board_service.update_one(id, model)


@router.delete("/boards/{id}", response_model=KanbanBoard)
async def delete_board(id: int, payload: dict = Depends(jwt.get_current_user)):
    return await board_service.delete_one(id)


@router.get("/boards/{board_id}/columns", response_model=list[KanbanColumn])
async def get_columns(board_id: int, payload: dict = Depends(jwt.get_current_user)):
    return await column_service.get_by_board(board_id)


@router.post("/columns", response_model=KanbanColumn)
async def create_column(model: KanbanColumnCreate, payload: dict = Depends(jwt.get_current_user)):
    return await column_service.crear(model, payload)


@router.patch("/columns/{id}", response_model=KanbanColumn)
async def update_column(id: int, model: dict, payload: dict = Depends(jwt.get_current_user)):
    return await column_service.update_one(id, model)


@router.delete("/columns/{id}", response_model=KanbanColumn)
async def delete_column(id: int, payload: dict = Depends(jwt.get_current_user)):
    return await column_service.delete_one(id)


@router.get("/boards/{board_id}/cards", response_model=list[KanbanCard])
async def get_cards(board_id: int, payload: dict = Depends(jwt.get_current_user)):
    return await card_service.get_by_board(board_id, payload)


@router.post("/cards", response_model=KanbanCard)
async def create_card(model: KanbanCardCreate, payload: dict = Depends(jwt.get_current_user)):
    return await card_service.crear(model, payload)


@router.patch("/cards/{id}", response_model=KanbanCard)
async def update_card(id: int, model: dict, payload: dict = Depends(jwt.get_current_user)):
    return await card_service.update_one(id, model)


@router.delete("/cards/{id}", response_model=KanbanCard)
async def delete_card(id: int, payload: dict = Depends(jwt.get_current_user)):
    return await card_service.delete_one(id)


@router.get("/boards/{board_id}/full")
async def get_full_board(board_id: int, payload: dict = Depends(jwt.get_current_user)):
    board = await board_service.get_one(board_id)
    columns = await column_service.get_by_board(board_id)
    cards = await card_service.get_by_board(board_id, payload)
    return {"board": board, "columns": columns, "cards": cards}
