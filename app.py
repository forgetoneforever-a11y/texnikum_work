from flask import Flask, render_template, request, redirect
import json
import os

app = Flask(__name__)

if os.environ.get('VERCEL'):
    DATA_FILE = "/tmp/data.json"
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

# Страница расписания (главная)
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

@app.route('/add_note', methods=['POST'])
def add_note():
    content = request.form.get('content')
    run_date = request.form.get('run_date', '2026-09-10 12:00:00')
    
    title = content[:25] + "..." if len(content) > 25 else content

    data = load_data()
    data['notes'].append({
        "title": title,
        "content": content,
        "priority": "Routine",
        "run_date": run_date
    })
    save_data(data)

    # Возвращаем пользователя туда, откуда он отправил форму
    return redirect(request.referrer or '/')

if __name__ == '__main__':
    app.run(debug=True)
