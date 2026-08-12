import { useState, useRef, useEffect } from 'react';

function CustomDatePicker({ onDateChange }) {
    // Ngày hiện tại (chặn tương lai)
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Mốc giới hạn nhỏ nhất: 01/01/2010
    const minDate = new Date(2010, 0, 1);
    minDate.setHours(0, 0, 0, 0);

    const [selectedDate, setSelectedDate] = useState(today);
    const [viewDate, setViewDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (containerRef.current && !containerRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const months = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    const handlePrevMonth = () => {
        const prev = new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1);
        if (prev >= new Date(2010, 0, 1)) {
            setViewDate(prev);
        }
    };

    const handleNextMonth = () => {
        const next = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1);
        if (next <= new Date(today.getFullYear(), today.getMonth(), 1)) {
            setViewDate(next);
        }
    };

    const handleSelectDate = (dateObj) => {
        const targetDate = new Date(dateObj.getFullYear(), dateObj.getMonth(), dateObj.getDate());
        targetDate.setHours(0, 0, 0, 0);

        if (targetDate < minDate) {
            alert("⚠️ Hệ thống chỉ hỗ trợ tra cứu từ ngày 01/01/2010 trở đi!");
            return;
        }
        if (targetDate > today) {
            alert("⚠️ Không thể chọn ngày trong tương lai!");
            return;
        }

        setSelectedDate(targetDate);
        setViewDate(new Date(targetDate.getFullYear(), targetDate.getMonth(), 1));
        setIsOpen(false);

        if (onDateChange) {
            const yyyy = targetDate.getFullYear();
            const mm = String(targetDate.getMonth() + 1).padStart(2, '0');
            const dd = String(targetDate.getDate()).padStart(2, '0');
            onDateChange(`${yyyy}-${mm}-${dd}`);
        }
    };

    const handleSelectToday = () => {
        handleSelectDate(today);
    };

    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();

    const firstDayOfWeek = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();

    const calendarSlots = [];

    // Tháng trước
    for (let i = firstDayOfWeek - 1; i >= 0; i--) {
        const dayNum = daysInPrevMonth - i;
        calendarSlots.push({
            date: new Date(year, month - 1, dayNum),
            dayNum: dayNum,
            isCurrentMonth: false
        });
    }

    // Tháng hiện tại
    for (let d = 1; d <= daysInMonth; d++) {
        calendarSlots.push({
            date: new Date(year, month, d),
            dayNum: d,
            isCurrentMonth: true
        });
    }

    // Tháng sau
    const totalSlots = calendarSlots.length > 35 ? 42 : 35;
    const remainingSlots = totalSlots - calendarSlots.length;
    for (let d = 1; d <= remainingSlots; d++) {
        calendarSlots.push({
            date: new Date(year, month + 1, d),
            dayNum: d,
            isCurrentMonth: false
        });
    }

    const formatInputText = (d) => `${d.getMonth() + 1} / ${d.getDate()} /${d.getFullYear()}`;

    return (
        <div className="position-relative d-inline-block" ref={containerRef}>
            <style>{`
                .picker-input {
                    border: 1px solid #767676;
                    background: #fff;
                    padding: 3px 8px;
                    font-size: 13px;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    width: 130px;
                    user-select: none;
                }
                .calendar-popup {
                    position: absolute;
                    top: 100%;
                    left: 0;
                    margin-top: 2px;
                    width: 220px;
                    background: #ffffff;
                    border: 1px solid #999;
                    box-shadow: 2px 2px 6px rgba(0,0,0,0.2);
                    z-index: 9999;
                    font-family: Arial, sans-serif;
                    font-size: 12px;
                    padding: 4px;
                }
                .cal-header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    background: #f0f0f0;
                    border: 1px solid #ccc;
                    padding: 2px 4px;
                    font-weight: bold;
                }
                .cal-btn {
                    border: 1px solid #999;
                    background: #e1e1e1;
                    cursor: pointer;
                    padding: 0 5px;
                    font-size: 10px;
                    line-height: 14px;
                }
                .cal-btn:disabled {
                    opacity: 0.3;
                    cursor: not-allowed;
                }
                .cal-grid {
                    display: grid;
                    grid-template-columns: repeat(7, 1fr);
                    text-align: center;
                    margin-top: 4px;
                }
                .cal-day-header {
                    color: #888;
                    font-size: 10px;
                    padding: 2px 0;
                }
                .cal-cell {
                    padding: 3px 0;
                    cursor: pointer;
                    color: #000;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    height: 24px;
                    user-select: none;
                }
                .cal-cell.other-month {
                    color: #aaa;
                }
                /* Ngày tương lai sẽ bị mờ và không bấm được */
                .cal-cell.disabled {
                    color: #e0e0e0 !important;
                    cursor: not-allowed;
                    background-color: #fafafa;
                }
                .cal-cell.selected {
                    border: 1px solid red;
                    border-radius: 50%;
                    font-weight: bold;
                }
                .cal-cell.today-highlight:not(.selected) {
                    background-color: #e6f3ff;
                    border-radius: 50%;
                }
                .cal-footer {
                    margin-top: 4px;
                    border-top: 1px solid #ddd;
                    padding-top: 4px;
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    cursor: pointer;
                    font-size: 11px;
                }
                .cal-footer:hover {
                    color: #0066cc;
                }
                .today-icon {
                    width: 12px;
                    height: 12px;
                    border: 1px solid red;
                    border-radius: 50%;
                    display: inline-block;
                }
            `}</style>

            <div className="picker-input" onClick={() => setIsOpen(!isOpen)}>
                <span>{formatInputText(selectedDate)}</span>
                <span style={{ fontSize: '9px' }}>▼</span>
            </div>

            {isOpen && (
                <div className="calendar-popup">
                    <div className="cal-header">
                        <button
                            className="cal-btn"
                            onClick={handlePrevMonth}
                            disabled={viewDate <= new Date(2010, 0, 1)}
                        >
                            ◄
                        </button>
                        <span>{months[month]} {year}</span>
                        <button
                            className="cal-btn"
                            onClick={handleNextMonth}
                            disabled={viewDate >= new Date(today.getFullYear(), today.getMonth(), 1)}
                        >
                            ►
                        </button>
                    </div>

                    <div className="cal-grid">
                        <div className="cal-day-header">Sun</div>
                        <div className="cal-day-header">Mon</div>
                        <div className="cal-day-header">Tue</div>
                        <div className="cal-day-header">Wed</div>
                        <div className="cal-day-header">Thu</div>
                        <div className="cal-day-header">Fri</div>
                        <div className="cal-day-header">Sat</div>

                        {calendarSlots.map((item, idx) => {
                            const itemDate = new Date(item.date.getFullYear(), item.date.getMonth(), item.date.getDate());
                            itemDate.setHours(0, 0, 0, 0);

                            const isSelected =
                                itemDate.getDate() === selectedDate.getDate() &&
                                itemDate.getMonth() === selectedDate.getMonth() &&
                                itemDate.getFullYear() === selectedDate.getFullYear();

                            const isToday =
                                itemDate.getDate() === today.getDate() &&
                                itemDate.getMonth() === today.getMonth() &&
                                itemDate.getFullYear() === today.getFullYear();

                            // CHỈ vô hiệu hóa (mờ hẳn) nếu là ngày TƯƠNG LAI hoặc trước 2010
                            const isDisabled = itemDate < minDate || itemDate > today;

                            return (
                                <div
                                    key={idx}
                                    className={`cal-cell 
                                        ${!item.isCurrentMonth ? 'other-month' : ''} 
                                        ${isSelected ? 'selected' : ''} 
                                        ${isToday && !isSelected ? 'today-highlight' : ''}
                                        ${isDisabled ? 'disabled' : ''}
                                    `}
                                    onClick={() => !isDisabled && handleSelectDate(item.date)}
                                >
                                    {item.dayNum}
                                </div>
                            );
                        })}
                    </div>

                    <div className="cal-footer" onClick={handleSelectToday}>
                        <span className="today-icon"></span>
                        <span>Today: {today.getMonth() + 1}/{today.getDate()}/{today.getFullYear()}</span>
                    </div>
                </div>
            )}
        </div>
    );
}

export default CustomDatePicker;
