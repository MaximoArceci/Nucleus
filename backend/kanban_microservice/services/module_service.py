from asyncio import gather
from pymongo import DESCENDING
from db.database import get_database


class ModuleService:
    def __init__(self, model, collection_name):
        self.model = model
        self.db = get_database().db
        self.collection = self.db[collection_name]

    async def create(self, data):
        if type(data) != self.model:
            data = self.model(**data)
        inserted = self.collection.insert_one(data.model_dump())
        if inserted:
            return data

    async def get_multiple(self, search=None, limit=0, skip=0):
        cursor = self.collection.find(filter=search or {}).skip(skip).limit(limit)

        async def format(data):
            data.pop("_id")
            return self.model(**data)

        return await gather(*[format(data) for data in cursor])

    async def get_one(self, id: int):
        data = self.collection.find_one({"id": id})
        if not data:
            return ValueError("ID not found")
        data.pop("_id")
        return self.model(**data)

    async def update_one(self, id: int, data: dict):
        self.collection.update_one({"id": id}, {"$set": data})
        return await self.get_one(id)

    async def delete_one(self, id: int):
        data = await self.get_one(id)
        self.collection.delete_one({"id": id})
        return data

    async def get_last_id(self):
        item = self.collection.find().sort("id", DESCENDING).limit(1)
        item = next(item, None)
        return 0 if item is None else item["id"]
