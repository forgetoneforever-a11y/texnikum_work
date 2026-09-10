from aiogram.types import InlineKeyboardMarkup, InlineKeyboardButton

# --- 1. Функция создания главного меню (в одну функцию, по ТЗ) ---
def show_main_menu():
    keyboard = InlineKeyboardMarkup(row_width=1)
    keyboard.add(
        InlineKeyboardButton("📌 Добавить заметку", callback_data="menu_add_note"),
        InlineKeyboardButton("⏰ Будильник", callback_data="menu_alarm"),
        InlineKeyboardButton("📋 Мои заметки", callback_data="menu_my_notes"),
        InlineKeyboardButton("❓ Помощь", callback_data="menu_help")
    )
    return keyboard

# --- 2. Вывод меню по команде /start ---
@dp.message_handler(commands=['start'])
async def cmd_start(message: types.Message):
    # Добавляем вызов меню везде, где требуется по ТЗ (в приветственное сообщение)
    await message.answer(
        "Привет! Я твой персональный помощник. Выбери нужное действие в меню ниже:",
        reply_markup=show_main_menu()
    )

# --- 3. Обработка нажатий на инлайн-кнопки главного меню ---
@dp.callback_query_handler(lambda c: c.data.startswith('menu_'))
async def process_menu_callback(callback_query: types.CallbackQuery):
    code = callback_query.data
    await bot.answer_callback_query(callback_query.id)

    if code == "menu_add_note":
        await bot.send_message(
            callback_query.from_user.id, 
            "✍️ Введите текст вашей новой заметки:"
        )
        # Здесь ваша существующая логика ожидания состояния для добавления заметки (например, FSM)

    elif code == "menu_alarm":
        # Подменю вариантов будильника в колонку
        alarm_kb = InlineKeyboardMarkup(row_width=1)
        alarm_kb.add(
            InlineKeyboardButton("⏱ Через 5 мин", callback_data="alarm_5m"),
            InlineKeyboardButton("⏳ Через час", callback_data="alarm_1h"),
            InlineKeyboardButton("🌅 Завтра в 8:00", callback_data="alarm_tomorrow_8"),
            InlineKeyboardButton("◀️ Назад в меню", callback_data="menu_back")
        )
        await bot.edit_message_text(
            "Выберите время для будильника:",
            chat_id=callback_query.message.chat.id,
            message_id=callback_query.message.message_id,
            reply_markup=alarm_kb
        )

    elif code == "menu_my_notes":
        # Логика вывода списка заметок (с кнопками «Удалить» и «Редактировать» для каждой)
        notes = [] # Здесь ваш источник данных (например, база данных или словарь)
        
        if not notes:
            notes_kb = InlineKeyboardMarkup().add(InlineKeyboardButton("◀️ Назад в меню", callback_data="menu_back"))
            await bot.edit_message_text(
                "У вас пока нет сохраненных заметок.",
                chat_id=callback_query.message.chat.id,
                message_id=callback_query.message.message_id,
                reply_markup=notes_kb
            )
            return

        notes_kb = InlineKeyboardMarkup(row_width=2)
        for idx, note in enumerate(notes):
            # Для каждой заметки добавляем текст/номер и кнопки «Удалить» и «Редактировать»
            notes_kb.add(
                InlineKeyboardButton(f"✏️ Ред. #{idx+1}", callback_data=f"note_edit_{idx}"),
                InlineKeyboardButton(f"🗑 Удал. #{idx+1}", callback_data=f"note_del_{idx}")
            )
        notes_kb.add(InlineKeyboardButton("◀️ Назад в меню", callback_data="menu_back"))

        await bot.edit_message_text(
            "📋 Ваши заметки:",
            chat_id=callback_query.message.chat.id,
            message_id=callback_query.message.message_id,
            reply_markup=notes_kb
        )

    elif code == "menu_help":
        help_kb = InlineKeyboardMarkup().add(InlineKeyboardButton("◀️ Назад в меню", callback_data="menu_back"))
        await bot.edit_message_text(
            "ℹ️ Этот бот помогает управлять заметками, устанавливать будильники и организовывать расписание.\n"
            "Используйте кнопки ниже для навигации.",
            chat_id=callback_query.message.chat.id,
            message_id=callback_query.message.message_id,
            reply_markup=help_kb
        )

    elif code == "menu_back":
        await bot.edit_message_text(
            "Главное меню:",
            chat_id=callback_query.message.chat.id,
            message_id=callback_query.message.message_id,
            reply_markup=show_main_menu()
        )

# --- 4. Обработка подменю будильника (через callback_query_handler) ---
@dp.callback_query_handler(lambda c: c.data.startswith('alarm_'))
async def process_alarm_callback(callback_query: types.CallbackQuery):
    await bot.answer_callback_query(callback_query.id)
    action = callback_query.data
    
    response_text = ""
    if action == "alarm_5m":
        response_text = "✅ Будильник установлен через 5 минут."
    elif action == "alarm_1h":
        response_text = "✅ Будильник установлен через 1 час."
    elif action == "alarm_tomorrow_8":
        response_text = "✅ Будильник установлен на завтра в 8:00."

    back_kb = InlineKeyboardMarkup().add(InlineKeyboardButton("◀️ Главное меню", callback_data="menu_back"))
    await bot.edit_message_text(
        response_text,
        chat_id=callback_query.message.chat.id,
        message_id=callback_query.message.message_id,
        reply_markup=back_kb
    )

# Пример интеграции меню в текстовые сообщения с напоминаниями (где это необходимо)
async def send_reminder_notification(user_id, reminder_text):
    await bot.send_message(
        user_id, 
        f"🔔 Напоминание: {reminder_text}", 
        reply_markup=show_main_menu()
    )
