let currentDayElement = null;
let currentDate = new Date(2026, 8, 1); // Сентябрь 2026

// Структура заметки теперь хранит текст и цвет: { text: "...", color: "green/orange/red" }
const notesStorage = {};

const monthsNames = [
    "Январь", "Февраль", "Март", "Апрель", "Май", "Июнь",
    "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь"
];

function switchTab(tabId, element) {
    document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.menu-item').forEach(m => m.classList.remove('active'));
    
    document.getElementById(tabId).classList.add('active');
    if (element) {
        element.classList.add('active');
    }
}

// Календарь
function renderCalendar() {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    document.getElementById('month-year-display').innerText = `${monthsNames[month]} ${year}`;

    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const grid = document.getElementById('cal-grid');
    grid.innerHTML = '';

    const today = new Date();
    const isCurrentMonthYear = (today.getFullYear() === year && today.getMonth() === month);
    const todayDate = today.getDate();

    for (let i = 1; i <= daysInMonth; i++) {
        const dateKey = `${year}-${month}-${i}`;
        const noteObj = notesStorage[dateKey];

        let noteTextHTML = "Нет задач";
        let noteClass = "note-label empty";

        if (noteObj && noteObj.text) {
            noteTextHTML = noteObj.text;
            noteClass = `note-label ${noteObj.color || 'green'}`;
        }

        const isToday = isCurrentMonthYear && (i === todayDate);
        const todayClass = isToday ? 'today-cell' : '';

        grid.innerHTML += `
            <div class="calendar-day ${todayClass}" onclick="openModal(${i}, '${dateKey}', this)">
                <strong>${i}</strong>
                <span class="${noteClass}">${noteTextHTML}</span>
            </div>`;
    }
}

function changeMonth(direction) {
    currentDate.setMonth(currentDate.getMonth() + direction);
    renderCalendar();
}

// Навигация стрелочками клавиатуры в календаре
document.addEventListener('keydown', (e) => {
    const calendarPanel = document.getElementById('calendar');
    const modal = document.getElementById('note-modal');
    const schedModal = document.getElementById('schedule-modal');
    
    if (calendarPanel.classList.contains('active') && !modal.classList.contains('active') && !schedModal.classList.contains('active')) {
        if (e.key === 'ArrowLeft') changeMonth(-1);
        else if (e.key === 'ArrowRight') changeMonth(1);
    }
});

function openModal(dayNum, dateKey, element) {
    currentDayElement = { element, dateKey };
    document.getElementById('modal-title').innerText = `${dayNum} ${monthsNames[currentDate.getMonth()]} ${currentDate.getFullYear()}`;
    
    const noteObj = notesStorage[dateKey] || { text: "", color: "green" };
    document.getElementById('note-text').value = noteObj.text;

    // Выставляем нужную радиокнопку цвета
    const colorRadio = document.querySelector(`input[name="note-color"][value="${noteObj.color || 'green'}"]`);
    if (colorRadio) colorRadio.checked = true;

    document.getElementById('note-modal').classList.add('active');
}

function closeModal() {
    document.getElementById('note-modal').classList.remove('active');
}

function saveNote() {
    if (currentDayElement) {
        const text = document.getElementById('note-text').value.trim();
        const selectedColor = document.querySelector('input[name="note-color"]:checked').value;
        const { element, dateKey } = currentDayElement;
        const noteSpan = element.querySelector('.note-label');
        
        if (text) {
            notesStorage[dateKey] = { text: text, color: selectedColor };
            noteSpan.innerText = text;
            noteSpan.className = `note-label ${selectedColor}`;
            
            // Если заметка красная (важная), можно выводить консольное уведомление или делать акцент
            if (selectedColor === 'red') {
                console.warn(`🔥 Важное событие (${dateKey}): ${text}`);
            }
        } else {
            delete notesStorage[dateKey];
            noteSpan.innerText = "Нет задач";
            noteSpan.className = "note-label empty";
        }
    }
    closeModal();
}

// Закрытие любых модальных окон при клике на фоновую область мимо содержимого
document.querySelectorAll('.modal').forEach(modal => {
    modal.addEventListener('click', (event) => {
        if (event.target === modal) {
            modal.classList.remove('active');
        }
    });
});

renderCalendar();

// Расписание
let scheduleData = [
    { day: "Понедельник", lessons: [ {time: "09:00 - 10:30", name: "Инженерная графика", room: "Ауд. 304"}, {time: "10:40 - 12:10", name: "Высшая математика", room: "Ауд. 512"} ] },
    { day: "Вторник", lessons: [ {time: "09:00 - 10:30", name: "Материаловедение", room: "Ауд. 201"}, {time: "10:40 - 12:10", name: "Физика", room: "Ауд. 405"} ] },
    { day: "Среда", lessons: [ {time: "11:30 - 13:00", name: "Программирование", room: "ПК-комната"}, {time: "13:30 - 15:00", name: "Электротехника", room: "Ауд. 108"} ] },
    { day: "Четверг", lessons: [ {time: "09:00 - 10:30", name: "Детали машин", room: "Ауд. 316"} ] },
    { day: "Пятница", lessons: [ {time: "09:00 - 10:30", name: "Метрология", room: "Ауд. 220"}, {time: "10:40 - 12:10", name: "Физкультура", room: "Спортзал"} ] }
];

let editingItem = null;

function renderSchedule() {
    const scheduleList = document.getElementById('schedule-list');
    scheduleList.innerHTML = '';

    scheduleData.forEach((item, dIndex) => {
        let lessonsHTML = item.lessons.map((l, lIndex) => `
            <div class="lesson-item">
                <span class="lesson-time">${l.time}</span>
                <span class="lesson-name"><b>${l.name}</b></span>
                <span class="lesson-room">${l.room}</span>
                <div class="lesson-actions">
                    <button class="action-btn" title="Редактировать" onclick="openEditScheduleModal(${dIndex}, ${lIndex})">✏️</button>
                    <button class="action-btn delete-btn" title="Удалить" onclick="deleteScheduleItem(${dIndex}, ${lIndex})">🗑️</button>
                </div>
            </div>
        `).join('');

        scheduleList.innerHTML += `
            <div class="schedule-day-card">
                <div class="schedule-day-title">${item.day}</div>
                ${lessonsHTML}
            </div>
        `;
    });
    updateSubjectsDatalist();
}

function updateSubjectsDatalist() {
    const datalist = document.getElementById('subjects-list');
    datalist.innerHTML = '';
    const subjects = new Set();
    scheduleData.forEach(d => d.lessons.forEach(l => subjects.add(l.name)));
    subjects.forEach(sub => {
        datalist.innerHTML += `<option value="${sub}">`;
    });
}

function openScheduleModal() {
    editingItem = null;
    document.getElementById('sched-modal-title').innerText = "Добавить занятие";
    document.getElementById('sched-day').disabled = false;
    document.getElementById('sched-time').value = '';
    document.getElementById('sched-name').value = '';
    document.getElementById('sched-room').value = '';
    document.getElementById('schedule-modal').classList.add('active');
}

function openEditScheduleModal(dIndex, lIndex) {
    editingItem = { dIndex, lIndex };
    const lesson = scheduleData[dIndex].lessons[lIndex];
    const dayName = scheduleData[dIndex].day;

    document.getElementById('sched-modal-title').innerText = "Редактировать занятие";
    document.getElementById('sched-day').value = dayName;
    document.getElementById('sched-day').disabled = true;
    document.getElementById('sched-time').value = lesson.time;
    document.getElementById('sched-name').value = lesson.name;
    document.getElementById('sched-room').value = lesson.room === "—" ? "" : lesson.room;

    document.getElementById('schedule-modal').classList.add('active');
}

function closeScheduleModal() {
    document.getElementById('schedule-modal').classList.remove('active');
    editingItem = null;
}

function saveScheduleItem() {
    const day = document.getElementById('sched-day').value;
    const time = document.getElementById('sched-time').value.trim();
    const name = document.getElementById('sched-name').value.trim();
    const room = document.getElementById('sched-room').value.trim();

    if (!time || !name) {
        alert('Заполните время и название дисциплины!');
        return;
    }

    if (editingItem !== null) {
        const { dIndex, lIndex } = editingItem;
        scheduleData[dIndex].lessons[lIndex] = { time, name, room: room || "—" };
    } else {
        let dayObj = scheduleData.find(d => d.day === day);
        if (!dayObj) {
            dayObj = { day: day, lessons: [] };
            scheduleData.push(dayObj);
        }
        dayObj.lessons.push({ time, name, room: room || "—" });
    }

    renderSchedule();
    closeScheduleModal();
}

function deleteScheduleItem(dIndex, lIndex) {
    scheduleData[dIndex].lessons.splice(lIndex, 1);
    if (scheduleData[dIndex].lessons.length === 0) {
        scheduleData.splice(dIndex, 1);
    }
    renderSchedule();
}

renderSchedule();

function loadBackground(event) {
    const file = event.target.files[0];
    if (file) {
        const videoURL = URL.createObjectURL(file);
        const bgSource = document.getElementById('bg-source');
        const bgVideo = document.getElementById('bg-video');
        
        bgSource.src = videoURL;
        bgVideo.load();
        bgVideo.play();

        document.getElementById('file-info').innerHTML = `Активный файл: <b style="color:#8f94fb;">${file.name}</b>`;
    }
}

function updateBlur(value) {
    document.getElementById('blur-value').innerText = value;
    document.querySelectorAll('.panel').forEach(panel => {
        panel.style.backdropFilter = `blur(${value}px)`;
        panel.style.webkitBackdropFilter = `blur(${value}px)`;
    });
}