from fastapi import APIRouter, HTTPException
from ..services.googleOauth_service import jwt_to_google_token, exchange_id_token_for_access_token
from main_constants import CLIENT_ID, CLIENT_SECRET
from fastapi import Depends
from ..utils.jwt_utils import JWTUtils

router = APIRouter()
jwt = JWTUtils()

@router.post("/exchange-token")
def exchange_token(jwt: str, payload: str = Depends(jwt.get_current_user)):
    #google_token = jwt_to_google_token(jwt, CLIENT_ID, CLIENT_SECRET)
    google_token = exchange_id_token_for_access_token(jwt)
    if isinstance(google_token, str):
        return {"google_token": google_token}
    else:
        raise HTTPException(status_code=400, detail=google_token)
