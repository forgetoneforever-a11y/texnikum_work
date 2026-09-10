from flask import Flask, render_template, request, redirect
import json
import os
import shutil

app = Flask(__name__)

# Обработка путей для Vercel (read-only файловая система -> /tmp)
if os.environ.get('VERCEL'):
    DATA_FILE = "/tmp/data.json"
    if not os.path.exists(DATA_FILE) and os.path.exists("data.json"):
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

# Страница расписания (Главная)
@app.route('/')
def schedule():
    data = load_data()
    notes = data.get("notes", [])
    return render_template('schedule.html', notes=notes)

# Страница календаря
@app.route('/calendar')
def calendar():
    data = load_data()
    notes = data.get("notes", [])
    return render_template('calendar.html', notes=notes)

# Добавление задачи/занятия
@app.route('/add_note', methods=['POST'])
def add_note():
    content = request.form.get('content')
    run_date = request.form.get('run_date', '2026-09-10 12:00:00')
    
    # Форматируем дату из datetime-local под нужный вид (YYYY-MM-DD HH:MM:SS)
    if 'T' in run_date:
        run_date = run_date.replace('T', ' ') + ':00' if len(run_date) == 16 else run_date.replace('T', ' ')

    title = content[:25] + "..." if len(content) > 25 else content

    data = load_data()
    data['notes'].append({
        "title": title,
        "content": content,
        "priority": "Routine",
        "run_date": run_date
    })
    save_data(data)

    return redirect(request.referrer or '/')

if __name__ == '__main__':
    app.run(debug=True)
