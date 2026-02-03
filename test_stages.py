import requests
import json

try:
    response = requests.post(
        'http://localhost:5003/api/project-stages',
        headers={'Content-Type': 'application/json'},
        json={'title': 'Weather App', 'description': 'A simple weather app'}
    )
    print(f"Status: {response.status_code}")
    print(response.text)
except Exception as e:
    print(f"Error: {e}")
