from flask import Flask, render_template, request, redirect
import json
import os

app = Flask(__name__)

# На Vercel можно писать только в /tmp, локально — в текущую папку
if os.environ.get('VERCEL'):
    DATA_FILE = "/tmp/data.json"
    # При первом запуске на Vercel копируем дефолтный файл, если его нет
    if not os.path.exists(DATA_FILE) and os.path.exists("data.json"):
        import shutil
        shutil.copy("data.json", DATA_FILE)
else:
    DATA_FILE = "data.json"

def load_data():
    if not os.path.exists(DATA_FILE):
        return {"notes": [], "alarms": []}
    try:
        with open(DATA_FILE, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception:
        return {"notes": [], "alarms": []}

def save_data(data):
    try:
        with open(DATA_FILE, "w", encoding="utf-8") as f:
            json.dump(data, f, ensure_ascii=False, indent=4)
    except Exception as e:
        print(f"Ошибка сохранения: {e}")

@app.route('/')
def index():
    data = load_data()
    notes = data.get("notes", [])
    return render_template('index.html', notes=notes)

@app.route('/add_note', methods=['POST'])
def add_note():
    content = request.form.get('content')
    run_date = request.form.get('run_date')
    
    title = content[:20] + "..." if len(content) > 20 else content

    data = load_data()
    data['notes'].append({
        "title": title,
        "content": content,
        "priority": "Routine",
        "run_date": run_date
    })
    save_data(data)

    return redirect('/')

if __name__ == '__main__':
    app.run(debug=True)
