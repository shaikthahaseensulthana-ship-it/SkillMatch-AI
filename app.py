from flask import Flask, request, jsonify
from flask_cors import CORS
import re

app = Flask(__name__)
CORS(app)

# Demo-only in-memory storage; resets when the server restarts.
users = {}
profiles = {}

SKILL_KEYWORDS = [
    "java", "python", "javascript", "react", "html", "css", "bootstrap",
    "spring boot", "rest api", "sql", "mysql", "flask", "django", "git",
    "github", "node.js", "communication", "problem solving", "data structures",
    "machine learning", "nlp", "excel", "c++", "c"
]

SAMPLE_JOBS = [
    {"id": 1, "title": "Java Developer Intern", "company": "Sample Tech",
     "location": "Remote", "skills": ["java", "sql", "git", "rest api"]},
    {"id": 2, "title": "Frontend Developer Intern", "company": "Web Studio",
     "location": "Remote", "skills": ["html", "css", "javascript", "react"]},
    {"id": 3, "title": "Python Developer Intern", "company": "Data Works",
     "location": "Hybrid", "skills": ["python", "flask", "sql", "git"]},
    {"id": 4, "title": "Full Stack Developer Intern", "company": "Build Labs",
     "location": "Remote", "skills": ["javascript", "react", "java", "rest api", "sql"]},
    {"id": 5, "title": "AI/NLP Intern", "company": "Insight AI",
     "location": "Remote", "skills": ["python", "machine learning", "nlp", "sql"]}
]

def extract_skills(text):
    text = text.lower()
    found = []
    for skill in SKILL_KEYWORDS:
        pattern = r"(?<![a-z0-9+#.])" + re.escape(skill) + r"(?![a-z0-9+#.])"
        if re.search(pattern, text):
            found.append(skill)
    return sorted(set(found))

@app.get("/")
def home():
    return jsonify({"message": "SkillMatch AI API is running", "status": "ok"})

@app.post("/api/register")
def register():
    data = request.get_json(silent=True) or {}
    name = str(data.get("name", "")).strip()
    email = str(data.get("email", "")).strip().lower()
    password = str(data.get("password", ""))
    if not name or not email or not password:
        return jsonify({"error": "Name, email, and password are required."}), 400
    if email in users:
        return jsonify({"error": "This email is already registered."}), 409
    # Insecure demo only. Never store plaintext passwords in a real application.
    users[email] = {"name": name, "password": password}
    return jsonify({"message": "Demo account created. You can now sign in."}), 201

@app.post("/api/login")
def login():
    data = request.get_json(silent=True) or {}
    email = str(data.get("email", "")).strip().lower()
    password = str(data.get("password", ""))
    user = users.get(email)
    if not user or user["password"] != password:
        return jsonify({"error": "Invalid email/password. Register first in this demo."}), 401
    return jsonify({"message": "Signed in successfully.",
                    "user": {"name": user["name"], "email": email}})

@app.get("/api/profile/<path:email>")
def get_profile(email):
    email = email.lower()
    if email not in users:
        return jsonify({"error": "Profile not found."}), 404
    return jsonify({"name": users[email]["name"], "email": email})

@app.put("/api/profile/<path:email>")
def update_profile(email):
    email = email.lower()
    if email not in users:
        return jsonify({"error": "Profile not found."}), 404
    data = request.get_json(silent=True) or {}
    if "name" in data:
        users[email]["name"] = str(data["name"]).strip()
    return jsonify({"message": "Profile updated.",
                    "profile": {"name": users[email]["name"], "email": email}})

@app.post("/api/resume/analyze")
def analyze_resume():
    data = request.get_json(silent=True) or {}
    resume_text = str(data.get("resumeText", "")).strip()
    if not resume_text:
        return jsonify({"error": "Paste resume text before analyzing."}), 400
    skills = extract_skills(resume_text)
    matches = []
    for job in SAMPLE_JOBS:
        matched = sorted(set(skills).intersection(job["skills"]))
        missing = sorted(set(job["skills"]) - set(skills))
        percent = round(len(matched) / len(job["skills"]) * 100) if job["skills"] else 0
        matches.append({**job, "matchedSkills": matched, "missingSkills": missing,
                        "matchPercentage": percent})
    matches.sort(key=lambda job: job["matchPercentage"], reverse=True)
    return jsonify({"skills": skills, "jobs": matches})

@app.get("/api/jobs")
def get_jobs():
    return jsonify(SAMPLE_JOBS)

@app.get("/api/dashboard")
def dashboard():
    return jsonify({"sampleJobCount": len(SAMPLE_JOBS),
                    "modules": ["Profile", "Resume Skill Extraction",
                                "Job Matching", "Skill Gap Analysis", "Sample Jobs"]})

if __name__ == "__main__":
    app.run(debug=True, port=5000)
