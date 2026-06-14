from fastapi import APIRouter, Depends
from datos_microservice.utils.jwt_utils import JWTUtils
from .models.Document import Document, DocumentCreate
from .services.document_service import DocumentService

router = APIRouter()
jwt = JWTUtils()
document_service = DocumentService()


@router.get("/", response_model=list[Document])
async def get_documents(payload: dict = Depends(jwt.get_current_user)):
    return await document_service.get_todos(payload)


@router.get("/area/{area_id}", response_model=list[Document])
async def get_documents_by_area(area_id: int, payload: dict = Depends(jwt.get_current_user)):
    return await document_service.get_by_area(area_id, payload)


@router.post("/", response_model=Document)
async def create_document(model: DocumentCreate, payload: dict = Depends(jwt.get_current_user)):
    return await document_service.crear(model, payload)


@router.patch("/{id}", response_model=Document)
async def update_document(id: int, model: dict, payload: dict = Depends(jwt.get_current_user)):
    return await document_service.update_document(id, model, payload)


@router.delete("/{id}", response_model=Document)
async def delete_document(id: int, payload: dict = Depends(jwt.get_current_user)):
    return await document_service.update_document(id, {"archived": True}, payload)
