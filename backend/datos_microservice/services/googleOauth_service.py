import requests
from main_constants import CLIENT_ID, CLIENT_SECRET
from fastapi import HTTPException

GOOGLE_TOKEN_ENDPOINT = "https://oauth2.googleapis.com/token"

def jwt_to_google_token(jwt_token: str, client_id: str, client_secret: str):

    payload = {
        "grant_type": "urn:ietf:params:oauth:grant-type:jwt-bearer",
        "assertion": jwt_token,
        "client_id": client_id,
        "client_secret": client_secret
    }

    response = requests.post(GOOGLE_TOKEN_ENDPOINT, data=payload)

    if response.status_code == 200:
        return response.json().get("access_token")
    else:
        return response.json()


def exchange_id_token_for_access_token(id_token_str: str):
    url = "https://oauth2.googleapis.com/token"
    data = {
        "client_id": CLIENT_ID,
        "client_secret": CLIENT_SECRET,
        "grant_type": "authorization_code",
        "code": id_token_str,
        "redirect_uri": "http://localhost"
    }
    response = requests.post(url, data=data)
    
    if response.status_code == 200:
        return response.json()
    else:
        raise HTTPException(status_code=400, detail=response.json())