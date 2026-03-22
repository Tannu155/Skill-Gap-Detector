from neo4j import GraphDatabase
from dotenv import load_dotenv
import os

load_dotenv()

NEO4J_URL = os.getenv("NEO4J_URL")
NEO4J_USER = os.getenv("NEO4J_USER")
NEO4J_PASSWORD = os.getenv("NEO4J_PASSWORD")

driver = GraphDatabase.driver(
    NEO4J_URL,
    auth=(NEO4J_USER, NEO4J_PASSWORD)
)

def get_neo4j_session():
    return driver.session(database="neo4j")

def close_driver():
    driver.close()