from pymongo import MongoClient
from pymongo.database import Database
from fastapi import HTTPException
from main_constants import MONGO_URI, MONGO_DB_NAME

class DatabaseConnection:
    def __init__(self):
        self.client = None
        self.db = None

    def connect(self):
        if not self.client:
            kwargs = {}
            if MONGO_URI.startswith("mongodb+srv://"):
                kwargs = {"tls": True, "tlsAllowInvalidCertificates": True}
            self.client = MongoClient(host=MONGO_URI, **kwargs)
            self.db = self.client[MONGO_DB_NAME]

    def get_database(self) -> Database:
        if self.db != None:
            return self
        raise HTTPException(status_code=500, detail="Database not connected")


database = DatabaseConnection()
database.connect()


def get_database() -> Database:
    return database.get_database()
