import React, { useState } from 'react';
import './CalendarTab.css';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const CalendarTab = ({ tasks = [], milestones = [], onTaskClick }) => {
    const [currentDate, setCurrentDate] = useState(new Date());

    const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
    const getFirstDayOfMonth = (year, month) => new Date(year, month, 1).getDay(); // 0 is Sunday

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    const daysInMonth = getDaysInMonth(year, month);
    let firstDay = getFirstDayOfMonth(year, month);
    // Adjust to make Monday first day of week (optional, but standard in some regions)
    firstDay = firstDay === 0 ? 6 : firstDay - 1; 

    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    const dayNames = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

    const handlePrevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
    const handleNextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

    // Create days array
    const blanks = Array(firstDay).fill(null);
    const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
    const totalSlots = [...blanks, ...days];
    // Fill the rest of the row to make a perfect grid
    const remainingSlots = 7 - (totalSlots.length % 7);
    if (remainingSlots < 7) {
        totalSlots.push(...Array(remainingSlots).fill(null));
    }

    // Map tasks and milestones to days
    const itemsByDay = {}; 
    
    tasks.forEach(task => {
        if (task.deadlineAt) {
            const taskDate = new Date(task.deadlineAt);
            if (taskDate.getFullYear() === year && taskDate.getMonth() === month) {
                const day = taskDate.getDate();
                if (!itemsByDay[day]) itemsByDay[day] = [];
                itemsByDay[day].push({ type: 'task', data: task });
            }
        }
    });

    milestones.forEach(ms => {
        if (ms.dueDate) {
            const msDate = new Date(ms.dueDate);
            if (msDate.getFullYear() === year && msDate.getMonth() === month) {
                const day = msDate.getDate();
                if (!itemsByDay[day]) itemsByDay[day] = [];
                itemsByDay[day].push({ type: 'milestone', data: ms });
            }
        }
    });

    const getStatusColor = (status) => {
        switch (status) {
            case 'DONE': return '#10B981';
            case 'IN_PROGRESS': return '#3B82F6';
            case 'PENDING': return '#F59E0B';
            default: return '#6B7280';
        }
    };

    return (
        <div className="calendar-tab">
            <div className="calendar-header">
                <h2>{monthNames[month]} {year}</h2>
                <div className="calendar-nav">
                    <button onClick={handlePrevMonth} className="btn-icon"><ChevronLeft size={20} /></button>
                    <button onClick={() => setCurrentDate(new Date())} className="btn-secondary" style={{ padding: '4px 12px' }}>Today</button>
                    <button onClick={handleNextMonth} className="btn-icon"><ChevronRight size={20} /></button>
                </div>
            </div>
            
            <div className="calendar-grid">
                {dayNames.map(d => (
                    <div key={d} className="calendar-day-header">{d}</div>
                ))}
                
                {totalSlots.map((day, index) => {
                    const isToday = day === new Date().getDate() && month === new Date().getMonth() && year === new Date().getFullYear();
                    const items = day ? (itemsByDay[day] || []) : [];
                    
                    return (
                        <div key={index} className={`calendar-cell ${day ? 'active-cell' : 'empty-cell'} ${isToday ? 'today' : ''}`}>
                            {day && <span className="day-number">{day}</span>}
                            <div className="cell-items">
                                {items.map((item, i) => (
                                    item.type === 'task' ? (
                                        <div 
                                            key={`t-${item.data.id}`} 
                                            className="cal-item task-item"
                                            style={{ borderLeftColor: getStatusColor(item.data.status) }}
                                            onClick={() => onTaskClick && onTaskClick(item.data)}
                                        >
                                            {item.data.title}
                                        </div>
                                    ) : (
                                        <div 
                                            key={`m-${item.data.id}`} 
                                            className="cal-item milestone-item"
                                        >
                                            ★ {item.data.title}
                                        </div>
                                    )
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default CalendarTab;
