import requests
import os

path: str = "C:\\Users\\K\\Downloads\\rishit_cv_updated.pdf"

job_description = """
Join our innovative team as a Frontend Developer, helping to create cutting-edge web applications.'re looking for a dynamic individual to bring our projects to life, ensuring an engaging user experience.


Responsibilities:

    Develop user features with HTML, CSS, and JavaScript.
    Implement responsive web design principles.
    Utilize frameworks like Angular.js and React.js for efficient.
    Collaborate with cross-functional teams to ensure project success.
    Maintain and improve website optimization.


Requirements:

    Bachelor's degree in Computer Science or related field.
    1-3 years of experience in front-end development.
    Freshers with internship certificates are welcome.
    Proficiency in CSS, JavaScript, HTML5, and Typescript. Experience with frameworks/libraries (React, Angular).
    Familiarity with version control tools (Git, SVN).
    Strong problem-solving skills and attention to detail.
    Excited to work in a fast-paced environment and push the boundaries of web design? Join us!
"""
# r= requests.get("http://localhost:8000/output")
# print(r)
r = requests.post("http://localhost:8000/upload", files={"resume":open(path, 'rb')}, data={"job_description": job_description})