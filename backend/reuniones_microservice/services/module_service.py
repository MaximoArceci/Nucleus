from pymongo import DESCENDING
from asyncio import gather
from db.database import get_database

class ModuleService:
    def __init__(self, model, collection_name):
        self.model = model
        self.db = get_database().db
        self.collection = self.db[collection_name]

    async def create(self, data):
        inserted = self.collection.insert_one(data.model_dump())
        if inserted:
            return data

    async def find_one(self, filter: dict):
        try:
            data = self.collection.find_one(filter)
            if data == None:
                return False
        except:
            return ValueError("Filter not found")
        try:
            data = list(data)[0]
            data = self.model(**data)
        except:
            return ValueError("Error parsing data")

    async def get_multiple(self, search=None, limit=0, skip=0):
        if search is None:
            search = {}
        cursor = self.collection.find(filter=search).skip(skip).limit(limit)

        async def format(data):
            data.pop("_id")
            return self.model(**data)
        return await gather(*[format(data) for data in cursor])

    async def get_one(self, id: int):
        try:
            data = self.collection.find_one({"id": id})
        except:
            return ValueError("ID not found o no hay data")
        if data:
            try:
                return self.model(**data)
            except:
                return data
        elif data == None:
            return ValueError("Response NONE")
        else:
            return ValueError("ID not found o no hay data")

    async def update_one(self, id: int, data: dict):
        updated = self.collection.update_one({"id": id}, {"$set": data})

        if updated.modified_count == 0:
            return await self.get_one(id)
        elif updated.modified_count == 1:
            return await self.get_one(id)
        else:
            return ValueError("ID not found")

    async def delete_one(self, id: int):
        data = await self.get_one(id)
        deleted = self.collection.delete_one({"id": id})
        try:
            data = self.model(**data)
        except:
            return data
        return data

    async def get_last_id(self):
        item = self.collection.find().sort("id", DESCENDING).limit(1)
        item = next(item, None)
        if item == None:
            item = 0
        else:
            item = item["id"]
        return item

    async def check_data(self):
        for element in await self.get_multiple():
            try:
                self.model(**element)
            except:
                return f"La informacion de la tabla {self.collection} no corresponde con el modelo"

        return True

    async def modify_existant(self, data_to_add: dict):
        datas = []
        for data in self.collection.find():
            self.collection.update_one(
                {"id": data["id"]}, {"$set": data_to_add})

        for data in self.collection.find():
            data.pop("_id")
            datas.append(data)
        return datas
