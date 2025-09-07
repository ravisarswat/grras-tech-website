import requests
import json

BASE_URL = "https://grras-layout-fix.preview.emergentagent.com/api"

# Get admin token
response = requests.post(f"{BASE_URL}/admin/login", json={"password": "grras@admin2024"})
token = response.json()['token']
headers = {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}

# Get content
response = requests.get(f"{BASE_URL}/content")
content = response.json()['content']

# Find and fix DO280
for course in content['courses']:
    if 'DO280' in course.get('title', ''):
        course['level'] = 'Professional Level'
        print(f"Fixed: {course['title']} -> {course['level']}")

# Save
requests.post(f"{BASE_URL}/content", headers=headers, json={"content": content, "isDraft": False})

# Force sync
requests.post(f"{BASE_URL}/admin/force-sync", headers=headers)

print("DONE - Check website now")