# api/main.py
from fastapi import FastAPI
from .database import engine, Base
from . import models
from .routers import auth, devices, rooms, relays
from .mqtt_client import start_mqtt

app = FastAPI(title="Synetra Home Automation API")

# create tables
Base.metadata.create_all(bind=engine)

# include routers
app.include_router(auth.router)
app.include_router(devices.router)
app.include_router(rooms.router)
app.include_router(relays.router)

@app.on_event("startup")
def startup_event():
    print("Starting mqtt client...")
    start_mqtt()
