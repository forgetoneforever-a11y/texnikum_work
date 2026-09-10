from flask import Flask, render_template, request, redirect
import json
import os

app = Flask(__name__)
DATA_FILE = "data.json"

def load_data():
    if not os.path.exists(DATA_FILE):
        return {"notes": [], "alarms": []}
    with open(DATA_FILE, "r", encoding="utf-8") as f:
        return json.load(f)

def save_data(data):
    with open(DATA_FILE, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=4)

@app.route('/')
def index():
    data = load_data()
    notes = data.get("notes", [])
    return render_template('index.html', notes=notes)

@app.route('/add_note', methods=['POST'])
def add_note():
    content = request.form.get('content')
    run_date = request.form.get('run_date') # Дата из календаря
    
    # Автоматически делаем заголовок из первых слов заметки
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
