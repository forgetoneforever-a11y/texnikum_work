import json
import os
from aiogram import Bot, Dispatcher, executor, types
from apscheduler.schedulers.asyncio import AsyncIOScheduler

TOKEN = "ТВОЙ_ТОКЕН_БОТА"
bot = Bot(token=TOKEN)
dp = Dispatcher(bot)
scheduler = AsyncIOScheduler()

# Функция для чтения заметок из data.json
def load_data():
    if not os.path.exists("data.json"):
        return {"notes": [], "alarms": []}
    with open("data.json", "r", encoding="utf-8") as f:
        return json.load(f)

# Пример команды в боте, чтобы посмотреть заметки с сайта
@dp.message_handler(commands=['notes', 'my_notes'])
async def show_notes(message: types.Message):
    data = load_data()
    notes = data.get("notes", [])
    
    if not notes:
        await message.answer("У тебя пока нет сохраненных заметок.")
        return
        
    response = "📝 **Твои заметки:**\n\n"
    for note in notes:
        # Учитываем твою цветовую приоритетную индикацию
        priority = note.get('priority', 'Routine')
        emoji = "🟢" if priority == "Routine" else "🟠" if priority == "Medium" else "🔴"
        response += f"{emoji} {note.get('title')} — {note.get('content')}\n"
        
    await message.answer(response, parse_mode="Markdown")

if __name__ == '__main__':
    scheduler.start()
    executor.start_polling(dp, skip_updates=True)
