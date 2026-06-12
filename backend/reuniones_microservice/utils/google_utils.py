import os.path
import datetime as dt

from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from google.auth.transport.requests import Request
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError
from db.database import get_database
from google.apps import meet_v2
from fastapi import HTTPException
import json
import pytz
from datetime import datetime


class GoogleCalendarManager:
    def __init__(self):
        self.db = get_database().db
        self.collection = self.db["tokens"]

    async def create_event(self, email_usuario, model, codigoMeet, attendee):
        try:
            token_data = self.collection.find_one({"email": email_usuario})
            if not token_data:
                print("No se encontró el token para el usuario")
                return
            creds = Credentials.from_authorized_user_info(token_data["creds"])

            if not creds.valid:
                if creds.expired and creds.refresh_token:
                    creds.refresh(Request())
                    creds_dict = json.loads(creds.to_json())

                    self.collection.update_one(
                        {"email": email_usuario},
                        {"$set": {"creds": creds_dict}},
                        upsert=True
                    )
                else:
                    print("No se puede usar el token, no es válido")
                    return
        except Exception:
            print("Ocurrió un error al crear la reunión de Google Meet")
            return

        try:
            service = build("calendar", "v3", credentials=creds)

            start_time = model.start.replace(tzinfo=None).replace(second=0, microsecond=0)
            end_time = model.end.replace(tzinfo=None).replace(second=0, microsecond=0)

            print("Start time:", start_time)
            print("End time:", end_time)
            
            reunion = {
                "summary": model.title,
                "description": model.description + " \nLink de reunion: " + codigoMeet,
                "start": {"dateTime": start_time.isoformat() + "Z", "timeZone": "UTC"},
                "end": {"dateTime": end_time.isoformat() + "Z", "timeZone": "UTC"},
                "attendees": [{"email": attendee}],
            }

            print(json.dumps(reunion, indent=4))
            try:
                event_result = service.events().insert(
                    calendarId="primary", body=reunion).execute()

                print("Event with description created:", event_result)
            except Exception as e:
                print(f"Error: {e}")

        except Exception as e:
            raise HTTPException(
                status_code=500, detail=f"Error al crear el evento: {str(e)}")

        except Exception:
            print("Ocurrió un error al crear la reunión de Google Meet")
            return

    async def crear_meet_v2(self, email_usuario: str):
        try:
            token_data = self.collection.find_one({"email": email_usuario})
            if not token_data:
                print("No se encontró el token para el usuario")
                return None
            creds = Credentials.from_authorized_user_info(token_data["creds"])

            if not creds.valid:
                if creds.expired and creds.refresh_token:
                    creds.refresh(Request())
                    creds_dict = json.loads(creds.to_json())

                    self.collection.update_one(
                        {"email": email_usuario},
                        {"$set": {"creds": creds_dict}},
                        upsert=True
                    )
                else:
                    print("No se puede usar el token, no es válido")
                    return None

            client = meet_v2.SpacesServiceClient(credentials=creds)
            request = meet_v2.CreateSpaceRequest()
            response = client.create_space(request=request)

            return response.meeting_uri

        except Exception:
            print("Ocurrió un error al crear la reunión de Google Meet")
            return None
