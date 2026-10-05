import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import Sidebar from '../../components/layout/Sidebar/Sidebar.jsx';
import Header from '../../components/layout/Header/Header.jsx';
import CreateEventModal from './components/CreateEventModal.jsx';
import EventDetailsModal from './components/EventDetailsModal.jsx';
import { getMonthlyEvents } from '../../api/calendar.js';
import './Calendar.css';

const CalendarPage = () => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [events, setEvents] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth(); // 0-11
    
    // Convert 0-11 JS month to 1-12 Backend month
    const loadEvents = async () => {
        setIsLoading(true);
        try {
            const data = await getMonthlyEvents(year, month + 1);
            setEvents(data);
        } catch (err) {
            console.error("Failed to load events", err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadEvents();
    }, [year, month]);

    const handlePrevMonth = () => {
        setCurrentDate(new Date(year, month - 1, 1));
    };

    const handleNextMonth = () => {
        setCurrentDate(new Date(year, month + 1, 1));
    };

    const handleToday = () => {
        setCurrentDate(new Date());
    };

    const monthNames = ["January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"];

    const generateCalendarGrid = () => {
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const firstDay = new Date(year, month, 1).getDay(); 
        
        // Convert to Monday-first (0 = Mon, 6 = Sun)
        const startOffset = firstDay === 0 ? 6 : firstDay - 1;
        const daysInPrevMonth = new Date(year, month, 0).getDate();
        
        const grid = [];
        
        for (let i = startOffset - 1; i >= 0; i--) {
            grid.push({
                day: daysInPrevMonth - i,
                isCurrentMonth: false,
                fullDate: new Date(year, month - 1, daysInPrevMonth - i)
            });
        }
        
        for (let i = 1; i <= daysInMonth; i++) {
            grid.push({
                day: i,
                isCurrentMonth: true,
                fullDate: new Date(year, month, i)
            });
        }
        
        const remainingDays = 42 - grid.length;
        for (let i = 1; i <= remainingDays; i++) {
            grid.push({
                day: i,
                isCurrentMonth: false,
                fullDate: new Date(year, month + 1, i)
            });
        }
        
        return grid;
    };

    const gridDays = generateCalendarGrid();
    const todayStr = new Date().toDateString();

    return (
        <div className="dashboard-layout">
            <Sidebar />
            <main className="dashboard-main">
                <Header title="Calendar" subtitle="Manage your schedule and upcoming deadlines" />
                <div className="dashboard-content calendar-content">
                    
                    <div className="calendar-toolbar">
                        <div className="calendar-navigation">
                            <button className="icon-btn" onClick={handlePrevMonth}><ChevronLeft size={20} /></button>
                            <h2>{monthNames[month]} {year}</h2>
                            <button className="icon-btn" onClick={handleNextMonth}><ChevronRight size={20} /></button>
                        </div>
                        <div className="calendar-actions">
                            <button className="btn-secondary" onClick={handleToday}>Today</button>
                            <button className="btn-primary" onClick={() => setIsModalOpen(true)}>
                                <Plus size={16} style={{marginRight: '8px'}} /> New Event
                            </button>
                        </div>
                    </div>

                    <div className="calendar-container">
                        <div className="calendar-header-row">
                            <div>Mon</div>
                            <div>Tue</div>
                            <div>Wed</div>
                            <div>Thu</div>
                            <div>Fri</div>
                            <div>Sat</div>
                            <div>Sun</div>
                        </div>
                        
                        <div className="calendar-grid">
                            {gridDays.map((cell, index) => {
                                const isToday = cell.fullDate.toDateString() === todayStr;
                                
                                // Find events that happen on this day
                                const dayEvents = events.filter(e => {
                                    const eventDate = new Date(e.starTime);
                                    return eventDate.toDateString() === cell.fullDate.toDateString();
                                });

                                return (
                                    <div key={index} className={`calendar-day ${!cell.isCurrentMonth ? 'other-month' : ''} ${isToday ? 'today' : ''}`}>
                                        <div className="day-number">{cell.day}</div>
                                        <div className="day-events">
                                            {dayEvents.map(event => (
                                                <div 
                                                    key={event.id} 
                                                    className={`event-chip event-${event.displayType?.toLowerCase() || 'general'}`} 
                                                    title={event.title}
                                                    onClick={() => setSelectedEvent(event)}
                                                    style={{cursor: 'pointer'}}
                                                >
                                                    {event.title}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                </div>
            </main>
            {isModalOpen && (
                <CreateEventModal 
                    onClose={() => setIsModalOpen(false)}
                    onEventCreated={() => {
                        loadEvents();
                    }}
                />
            )}
            {selectedEvent && (
                <EventDetailsModal 
                    event={selectedEvent}
                    onClose={() => setSelectedEvent(null)}
                    onDelete={async (id) => {
                        try {
                            if (selectedEvent.sourceType !== 'EVENT') {
                                alert("You cannot delete tasks or milestones from the calendar.");
                                return;
                            }
                            const { deleteEvent } = await import('../../api/calendar.js');
                            await deleteEvent(id);
                            setSelectedEvent(null);
                            loadEvents();
                        } catch(e) {
                            alert("Failed to delete event. You might not have the required permissions.");
                        }
                    }}
                />
            )}
        </div>
    );
};

export default CalendarPage;
