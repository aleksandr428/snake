import os
import sqlite3
from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel

app = FastAPI()

class ScoreIn(BaseModel):
    name: str
    score: int 

    
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

DB_PATH = os.path.json(os.path.dirname(__file__), "scores.db")

def get_connection():
    return sqlite3.connect(DB_PATH)

def init_db():
    con = get_connection()
    con.execute(
        """
        CREATE TABLE IF NOT EXISTS scores (
             id INTEGER PRIMARY KEY AUTOINCREMENT,
             name TEXT NOT NULL UNIQUE COLLATE NOCASE,
             score INTEGER NOT NULL
        )
        """
    )

init_db()   



@app.post("/scores")
def save_score(data: ScoreIn):
    name = data.name.strip()
    with get_connection() as connection:
        connection.execute(         
            "INSERT INTO scores (name, score) VALUES (?, ?) ON CONFLICT(name) DO UPDATE SET score = MAX(score, excluded.score)", (name, data.score))

    return {"response": "ok"}

@app.get("/scores")
def read_score():
    with get_connection() as connection:
            result = connection.execute( 
                 "SELECT name, score FROM scores ORDER BY score DESC, name LIMIT 20").fetchall()
    return [{"name": n, "score": s} for n, s in result]

app.mount("/", StaticFiles(directory=os.path.join(BASE_DIR, "static"), html=True), name="static")