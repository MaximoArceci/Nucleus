from datetime import datetime, timedelta
from main_constants import JWT_SECRET, JWT_ALGORITHM
import jwt
from fastapi import HTTPException, FastAPI, Depends
from jose import JWTError
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

app = FastAPI()
security = HTTPBearer()
SUPERUSER_EMAILS = {"maxiarceci@gmail.com"}


def apply_superuser_permissions(payload):
    email = str(payload.get("email", "")).lower()
    if email in SUPERUSER_EMAILS:
        return {**payload, "role": "Admin"}
    return payload

class JWTUtils:
    def __init__(self):

        self.secret_key = JWT_SECRET
        self.algorithm = JWT_ALGORITHM
        self.token_lifetime = 60

    @staticmethod
    async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):

        token = credentials.credentials
        try:
            payload = jwt.decode(token, key=JWT_SECRET,
                                 algorithms=[JWT_ALGORITHM])
            user_email = payload.get("email")
            if user_email is None:
                raise HTTPException(
                    status_code=401, detail="Invalid authentication credentials")
            return apply_superuser_permissions(payload)
        except JWTError:
            raise HTTPException(
                status_code=401, detail="Invalid authorization credentials")

    def expire_date(self):

        time = datetime.now() + timedelta(minutes=self.token_lifetime)
        return time.timestamp()

    def write_token(self, data):

        if type(data) != dict:
            data = data.model_dump()
        token = {
            **apply_superuser_permissions(data),
            "exp": self.expire_date()
        }
        algorithm = JWT_ALGORITHM
        return jwt.encode(token, self.secret_key, algorithm=algorithm)

    def validate_token(self, token):

        try:
            payload = jwt.decode(token, key=self.secret_key,
                                 algorithms=JWT_ALGORITHM)
            if payload["exp"] > datetime.now().timestamp():
                return payload
            else:
                raise HTTPException(status_code=400, detail="Invalid Token")
        except Exception:
            raise HTTPException(status_code=400, detail="Invalid Token")
