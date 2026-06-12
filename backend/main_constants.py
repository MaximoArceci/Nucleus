from os import getenv

HOST_APP, PORT_APP = "0.0.0.0", 80

TEST = getenv("TEST")

JWT_SECRET = getenv("JWT_SECRET")
JWT_ALGORITHM = getenv("JWT_ALGORITHM")

MONGO_URI = str(getenv("DATABASE_URL"))
MONGO_DB_NAME = str(getenv("DATABASE_NAME"))

CLIENT_ID = getenv("client_id")
CLIENT_SECRET = getenv("client_secret")

SMTP_PASSWORD = getenv("SMTP_PASSWORD")

STRIPE_SECRET_KEY = getenv("STRIPE_SECRET_KEY")
