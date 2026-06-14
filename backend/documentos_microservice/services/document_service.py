from datetime import datetime
from fastapi import HTTPException
from kanban_microservice.services.module_service import ModuleService
from datos_microservice.services.area_service import AreaService
from ..models.Document import Document


class DocumentService(ModuleService):
    def __init__(self):
        self.area_service = AreaService()
        super().__init__(Document, "Documents")

    async def crear(self, model, payload):
        await self.area_service.validate_area_ids([model.areaId])
        if payload["role"] != "Admin" and model.areaId not in payload.get("areaIds", []):
            raise HTTPException(status_code=401, detail="No tienes permisos para crear documentos en esta area")
        last_id = await self.get_last_id()
        document_data = model.model_dump()
        document_data["updatedBy"] = payload.get("id", document_data.get("updatedBy", 0))
        document_data["updatedAt"] = datetime.utcnow()
        document = self.model(**document_data, id=int(last_id) + 1)
        return await self.create(document)

    async def update_document(self, id: int, data: dict, payload):
        current = await self.get_one(id)
        if type(current) == ValueError:
            raise HTTPException(status_code=404, detail="Documento inexistente")
        area_id = data.get("areaId", current.areaId)
        await self.area_service.validate_area_ids([area_id])
        if payload["role"] != "Admin" and area_id not in payload.get("areaIds", []):
            raise HTTPException(status_code=401, detail="No tienes permisos para editar documentos en esta area")
        data["updatedAt"] = datetime.utcnow()
        data["updatedBy"] = payload.get("id", data.get("updatedBy", current.updatedBy))
        return await self.update_one(id, data)

    async def get_todos(self, payload):
        if payload["role"] == "Admin":
            return await self.get_multiple({"archived": False})
        return await self.get_multiple({"archived": False, "areaId": {"$in": payload.get("areaIds", [])}})

    async def get_by_area(self, area_id: int, payload):
        if payload["role"] != "Admin" and area_id not in payload.get("areaIds", []):
            raise HTTPException(status_code=401, detail="No tienes permisos para ver documentos de esta area")
        return await self.get_multiple({"archived": False, "areaId": area_id})
