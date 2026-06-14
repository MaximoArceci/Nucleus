from google_auth_oauthlib.flow import Flow
from fastapi import APIRouter, Request
from db.database import get_database
import json
import os
import requests
from fastapi import HTTPException
from fastapi.responses import RedirectResponse
from urllib.parse import urlencode

router = APIRouter()

SCOPES = ['openid', 'https://www.googleapis.com/auth/meetings.space.created',
          'https://www.googleapis.com/auth/userinfo.email', 'https://www.googleapis.com/auth/calendar', 'https://www.googleapis.com/auth/userinfo.profile']
CLIENT_SECRET_FILE = "/app/config/credentials.json"
REDIRECT_URI = os.getenv("GOOGLE_REDIRECT_URI", "http://localhost:8080/reuniones/auth/auth/callback")
FRONTEND_URL = os.getenv("BASE_URL", "http://localhost:5173")

if REDIRECT_URI.startswith("http://localhost") or REDIRECT_URI.startswith("http://127.0.0.1"):
    os.environ.setdefault("OAUTHLIB_INSECURE_TRANSPORT", "1")

db = get_database().db
collection = db["tokens"]


def get_flow():
    return Flow.from_client_secrets_file(
        CLIENT_SECRET_FILE, scopes=SCOPES, redirect_uri=REDIRECT_URI
    )


@router.get("/auth")
async def auth_google():
    flow = get_flow()  # Crear nuevo Flow

    auth_url, _ = flow.authorization_url(
        access_type="offline",  # Debe ser exactamente "offline"
        include_granted_scopes="true",
        prompt="consent",  # Solicitar consentimiento explícito
    )

    return {"auth_url": auth_url}

GOOGLE_USER_INFO_URL = "https://www.googleapis.com/oauth2/v2/userinfo"


@router.get("/auth/callback")
async def auth_callback(request: Request):
    flow = get_flow()  # Crear nuevo Flow

    authorization_response = str(request.url)
    if REDIRECT_URI.startswith("https://"):
        authorization_response = authorization_response.replace("http://", "https://", 1)

    try:
        # Intercambiar el código de autorización por un token de acceso
        flow.fetch_token(authorization_response=authorization_response)
        creds = flow.credentials

        # 🔹 Obtener el email del usuario desde Google
        headers = {"Authorization": f"Bearer {creds.token}"}
        user_info_response = requests.get(
            GOOGLE_USER_INFO_URL, headers=headers)

        if user_info_response.status_code != 200:
            raise HTTPException(
                status_code=400, detail="Credenciales no válidas. Autentica nuevamente.")

        user_info = user_info_response.json()
        email_usuario = user_info.get("email")
        nombre_usuario = user_info.get("name")

        if not email_usuario:
            raise HTTPException(
                status_code=400, detail="No se pudo obtener el email del usuario.")

        # Convertir a diccionario antes de guardar
        creds_dict = {
            "token": creds.token,
            "refresh_token": creds.refresh_token,
            "token_uri": creds.token_uri,
            "client_id": creds.client_id,
            "client_secret": creds.client_secret,
            "scopes": creds.scopes
        }
        # Guardar en MongoDB
        collection.update_one(
            {"email": email_usuario},
            {"$set": {"creds": creds_dict}},
            upsert=True
        )

        params = urlencode({
            "email": email_usuario,
            "picture": user_info.get("picture"),
            "name": nombre_usuario
        })

        return RedirectResponse(url=f"{FRONTEND_URL}/home?{params}")

    except Exception as e:
        raise HTTPException(
            status_code=400, detail=f"Error en la autenticación. Intenta nuevamente." + str(e))
