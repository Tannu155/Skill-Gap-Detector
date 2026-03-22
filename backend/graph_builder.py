from neo4j_connection import get_neo4j_session

def build_skill_graph():
    session = get_neo4j_session()

    # Define roles and their required skills
    roles = {
        "Data Analyst": [
            {"skill": "Python",     "level": "Intermediate"},
            {"skill": "SQL",        "level": "Intermediate"},
            {"skill": "Excel",      "level": "Basic"},
            {"skill": "Statistics", "level": "Intermediate"},
        ],
        "Web Developer": [
            {"skill": "HTML",       "level": "Advanced"},
            {"skill": "CSS",        "level": "Intermediate"},
            {"skill": "JavaScript", "level": "Advanced"},
            {"skill": "React",      "level": "Intermediate"},
        ],
        "ML Engineer": [
            {"skill": "Python",        "level": "Advanced"},
            {"skill": "Machine Learning","level": "Advanced"},
            {"skill": "Statistics",    "level": "Advanced"},
            {"skill": "Deep Learning", "level": "Intermediate"},
        ],
    }

    for role, skills in roles.items():
        # Create Role node
        session.run("MERGE (r:Role {name: $role})", role=role)

        for s in skills:
            # Create Skill node
            session.run("MERGE (sk:Skill {name: $skill})", skill=s["skill"])

            # Create REQUIRES relationship
            session.run("""
                MATCH (r:Role {name: $role})
                MATCH (sk:Skill {name: $skill})
                MERGE (r)-[:REQUIRES {level: $level}]->(sk)
            """, role=role, skill=s["skill"], level=s["level"])

    session.close()
    print("Skill graph built successfully!")

if __name__ == "__main__":
    build_skill_graph()
