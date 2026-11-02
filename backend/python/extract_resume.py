#!/usr/bin/env python3
"""
DRDO RAC Expert Relevance System — Resume Extraction Module
Extracts plain text and structured profile information from PDF resumes using pypdf.
"""

import sys
import json
import re
from pathlib import Path

try:
    from pypdf import PdfReader
except ImportError:
    PdfReader = None


EMAIL_REGEX = re.compile(r'[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+')
PHONE_REGEX = re.compile(r'(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}')
YEAR_PATTERN = re.compile(r'\b(19\d{2}|20\d{2})\b')
EXPERIENCE_YEARS_REGEX = re.compile(
    r'(\d+)\+?\s*(?:years?|yrs?)(?:\s+of)?(?:\s+experience)?',
    re.IGNORECASE
)

COMMON_DEGREES = [
    'Ph.D.', 'PhD', 'Doctor of Philosophy',
    'M.Tech', 'M.Tech.', 'Master of Technology',
    'M.E.', 'M.E', 'Master of Engineering',
    'M.S.', 'M.S', 'Master of Science',
    'B.Tech', 'B.Tech.', 'Bachelor of Technology',
    'B.E.', 'B.E', 'Bachelor of Engineering',
    'B.S.', 'B.Sc.', 'M.Sc.', 'MCA'
]

COMMON_DESIGNATIONS = [
    'Senior Scientist', 'Lead Scientist', 'Distinguished Scientist', 'Scientist',
    'Principal Researcher', 'Research Scientist', 'Research Fellow',
    'Professor', 'Associate Professor', 'Assistant Professor',
    'Technical Director', 'Director', 'Project Lead', 'Technical Lead',
    'Senior Engineer', 'Principal Engineer', 'Software Engineer', 'Systems Engineer',
    'Data Scientist', 'AI Researcher', 'Robotics Engineer'
]

COMMON_SKILLS = [
    'Python', 'C++', 'C', 'Java', 'Rust', 'MATLAB', 'R', 'Go',
    'TensorFlow', 'PyTorch', 'Keras', 'Scikit-learn', 'OpenCV', 'ROS', 'ROS2',
    'Machine Learning', 'Deep Learning', 'Computer Vision', 'Natural Language Processing',
    'NLP', 'Large Language Models', 'LLMs', 'Transformers', 'Reinforcement Learning',
    'Autonomous Systems', 'Robotics', 'Sensor Fusion', 'SLAM', 'Embedded Systems',
    'Signal Processing', 'Image Processing', 'Cryptography', 'Cyber Security',
    'Linux', 'Docker', 'Kubernetes', 'CUDA', 'SQL', 'MongoDB', 'PostgreSQL'
]

COMMON_RESEARCH_AREAS = [
    'Autonomous Systems', 'Artificial Intelligence', 'Neural Networks', 'Perception',
    'Human-Robot Interaction', 'UAV Navigation', 'Sensor Fusion', 'Threat Intelligence',
    'Secure AI', 'Radar Systems', 'Edge Computing', 'Robotics', 'Deep Learning',
    'Computer Vision', 'Natural Language Processing', 'Cyber Security', 'Signal Processing',
    'Medical Imaging', 'Representation Learning', 'Language Models', 'Information Retrieval',
    'Threat Detection', 'Embedded AI', 'Cognitive Systems'
]


def extract_text_from_pdf(pdf_path: str) -> str:
    """Extracts raw text from all pages of the given PDF file."""
    if not PdfReader:
        raise RuntimeError("pypdf is not installed. Please install pypdf via pip.")

    path = Path(pdf_path)
    if not path.is_file():
        raise FileNotFoundError(f"PDF file not found: {pdf_path}")

    reader = PdfReader(str(path))
    full_text = []

    for page in reader.pages:
        page_text = page.extract_text()
        if page_text:
            full_text.append(page_text)

    return "\n".join(full_text).strip()


def parse_resume_text(text: str, kind: str = "expert") -> dict:
    """
    Parses resume text and extracts structured candidate or expert attributes.
    Does not invent or hallucinate missing information.
    """
    lines = [line.strip() for line in text.splitlines() if line.strip()]

    # Extract email
    email_match = EMAIL_REGEX.search(text)
    email = email_match.group(0) if email_match else ""

    # Extract full name (heuristically from top non-header lines)
    full_name = ""
    for line in lines[:8]:
        # Skip lines that look like emails, urls, or phone numbers
        if '@' in line or 'http' in line or len(line) < 3 or len(line) > 50:
            continue
        if re.search(r'\b(curriculum|resume|cv|profile)\b', line, re.I):
            continue
        # Candidates for name
        if re.match(r'^[A-Z][A-Za-z.\s\'-]+$', line) and not any(deg.lower() in line.lower() for deg in COMMON_DEGREES):
            full_name = line.strip()
            break

    # Extract education
    education = ""
    for deg in COMMON_DEGREES:
        pattern = re.compile(r'\b' + re.escape(deg) + r'(?:\s+in\s+[\w\s&]+)?', re.IGNORECASE)
        match = pattern.search(text)
        if match:
            education = match.group(0).strip()
            break

    # Extract designation (experts)
    designation = ""
    for des in COMMON_DESIGNATIONS:
        if re.search(r'\b' + re.escape(des) + r'\b', text, re.IGNORECASE):
            designation = des
            break

    # Extract organization
    organization = ""
    if re.search(r'\b(?:DRDO|Defence Research and Development Organisation)\b', text, re.I):
        organization = "Defence Research and Development Organisation (DRDO)"
    elif re.search(r'\bIIT\b', text):
        organization = "Indian Institute of Technology"
    else:
        org_pattern = re.compile(
            r'(?<!@)\b(?:at|organization|organisation|company|institute|lab|laboratory|university)\s*[:\-]?\s*([A-Za-z0-9\s,&.-]{4,50})',
            re.IGNORECASE
        )
        org_match = org_pattern.search(text)
        if org_match:
            candidate_org = org_match.group(1).split('\n')[0].strip()
            if len(candidate_org) >= 3:
                organization = candidate_org

    # Extract experience years
    experience_years = 0
    exp_match = EXPERIENCE_YEARS_REGEX.search(text)
    if exp_match:
        try:
            experience_years = int(exp_match.group(1))
        except ValueError:
            pass
    else:
        # Heuristic from graduation year
        years = [int(y) for y in YEAR_PATTERN.findall(text) if 1970 <= int(y) <= 2026]
        if len(years) >= 2:
            span = max(years) - min(years)
            if 0 <= span <= 45:
                experience_years = min(span, 35)

    # Extract technical skills
    technical_skills = []
    for skill in COMMON_SKILLS:
        if re.search(r'\b' + re.escape(skill) + r'\b', text, re.IGNORECASE):
            if skill not in technical_skills:
                technical_skills.append(skill)

    # Extract research areas
    research_areas = []
    for area in COMMON_RESEARCH_AREAS:
        if re.search(r'\b' + re.escape(area) + r'\b', text, re.IGNORECASE):
            if area not in research_areas:
                research_areas.append(area)

    # Extract specialization
    specialization = ""
    spec_match = re.search(r'specializ(?:ation|ed in)\s*[:\-]?\s*([^\n\r.]+)', text, re.I)
    if spec_match:
        specialization = spec_match.group(1).strip()
    elif research_areas:
        specialization = research_areas[0]
    elif technical_skills:
        specialization = technical_skills[0]

    # Extract projects
    projects = []
    project_lines = re.findall(r'(?:Project|System|Platform)\s*[:\-]\s*([^\n\r.]+)', text, re.I)
    for p in project_lines:
        clean_p = p.strip()
        if len(clean_p) > 5 and clean_p not in projects:
            projects.append(clean_p)

    # Extract publications (for experts)
    publications = []
    pub_lines = re.findall(r'(?:Publication|Paper|Journal|Conference)\s*[:\-]\s*([^\n\r.]+)', text, re.I)
    for pub in pub_lines:
        clean_pub = pub.strip()
        if len(clean_pub) > 5 and clean_pub not in publications:
            publications.append(clean_pub)

    result = {
        "fullName": full_name,
        "email": email,
        "education": education,
        "specialization": specialization,
        "technicalSkills": technical_skills,
        "researchAreas": research_areas,
        "experienceYears": experience_years,
        "projects": projects
    }

    if kind == "expert":
        result["designation"] = designation
        result["organization"] = organization
        result["publications"] = publications

    return result


def main():
    if len(sys.argv) < 2:
        print(json.dumps({
            "success": False,
            "error": "Usage: python extract_resume.py <pdf_path> [kind: expert|candidate]"
        }))
        sys.exit(1)

    pdf_path = sys.argv[1]
    kind = sys.argv[2] if len(sys.argv) > 2 else "expert"

    try:
        raw_text = extract_text_from_pdf(pdf_path)
        if not raw_text.strip():
            print(json.dumps({
                "success": False,
                "error": "No extractable text found in the PDF. The file may be scanned or empty."
            }))
            sys.exit(0)

        extracted_data = parse_resume_text(raw_text, kind=kind)

        print(json.dumps({
            "success": True,
            "rawText": raw_text,
            "data": extracted_data
        }))
    except Exception as e:
        print(json.dumps({
            "success": False,
            "error": str(e)
        }))
        sys.exit(1)


if __name__ == "__main__":
    main()
