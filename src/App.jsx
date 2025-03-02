import React, { useState, useEffect } from 'react';
import { Calendar, Sun, Moon, CheckCircle, XCircle, Menu } from 'lucide-react';

const App = () => {
  const defaultDate = new Date(2025, 1, 1); // February 1, 2025
  const [currentMonth, setCurrentMonth] = useState(defaultDate);
  const [darkMode, setDarkMode] = useState(true);
  const [mobileMonthsOpen, setMobileMonthsOpen] = useState(false);
  
  // Predefined penalty data with individual compliance status
  const penaltyData = {
    'week-2025-02-03': { // Feb 3-7
      penalties: {
        edjay: ['2025-02-03', '2025-02-04'],
        nicole: ['2025-02-03', '2025-02-06']
      },
      compliance: {
        edjay: true,
        nicole: true
      },
      description: "Both completed their penalties"
    },
    'week-2025-02-10': { // Feb 10-14
      penalties: {
        edjay: ['2025-02-10', '2025-02-11', '2025-02-12', '2025-02-13', '2025-02-14'],
        nicole: ['2025-02-10', '2025-02-11', '2025-02-12', '2025-02-13', '2025-02-14']
      },
      compliance: {
        edjay: false,
        nicole: false
      },
      description: "Neither completed their penalties (100 pesos owed)"
    },
    'week-2025-02-17': { // Feb 17-21
      penalties: {
        edjay: ['2025-02-17', '2025-02-18', '2025-02-21'],
        nicole: ['2025-02-17', '2025-02-18', '2025-02-19', '2025-02-20', '2025-02-21']
      },
      compliance: {
        edjay: true,
        nicole: true
      },
      description: "Both completed their penalties"
    },
    'week-2025-02-24': {
      penalties: {
        edjay: ['2025-02-24', '2025-02-25', '2025-02-26', '2025-02-27', '2025-02-28'],
        nicole: ['2025-02-25', '2025-02-26', '2025-02-27', '2025-02-28']
      },
      compliance: {
        edjay: true,
        nicole: true
      },
      description: "Both completed their penalties"
    }
  };
  
  // Flatten penalty dates for calendar display
  const flattenPenaltyDates = () => {
    const flatDates = {
      edjay: {},
      nicole: {}
    };
    
    Object.values(penaltyData).forEach(weekData => {
      Object.entries(weekData.penalties).forEach(([participant, dates]) => {
        dates.forEach(date => {
          flatDates[participant][date] = true;
        });
      });
    });
    
    return flatDates;
  };
  
  const penaltyDates = flattenPenaltyDates();
  
  // Check system preference on load
  useEffect(() => {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    setDarkMode(prefersDark);
    
    // Listen for changes in color scheme preference
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e) => setDarkMode(e.matches);
    mediaQuery.addEventListener('change', handleChange);
    
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);
  
  // Challenge configuration based on the contract
  const challenge = {
    startDate: new Date('2025-01-20'),
    endDate: new Date('2025-08-31'),
    penaltyStart: new Date('2025-02-03'),
    participants: {
      edjay: {
        name: 'Edjay',
        target: 4
      },
      nicole: {
        name: 'Nicole',
        target: 3
      }
    }
  };
  
  // Calculate penalty amount based on month
  const getPenaltyAmount = (month) => {
    // Months are 0-indexed in JS Date, so February is 1
    const penaltyMap = {
      1: 1, // February: 1 km
      2: 1.5, // March: 1.5 km
      3: 2, // April: 2 km
      4: 2.5, // May: 2.5 km
      5: 3, // June: 3 km
      6: 3.5, // July: 3.5 km
      7: 4 // August: 4 km
    };
    
    return penaltyMap[month] || 1;
  };
  
  // Calculate monetary penalty based on month
  const getMonetaryPenalty = (month) => {
    // Months are 0-indexed in JS Date, so February is 1
    const penaltyMap = {
      1: 10, // February: 10 pesos
      2: 15, // March: 15 pesos
      3: 20, // April: 20 pesos
      4: 25, // May: 25 pesos
      5: 30, // June: 30 pesos
      6: 35, // July: 35 pesos
      7: 40 // August: 40 pesos
    };
    
    return penaltyMap[month] || 10;
  };
  
  // Calendar functionality
  const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  
  const getDaysInMonth = (year, month) => {
    return new Date(year, month + 1, 0).getDate();
  };
  
  const getFirstDayOfMonth = (year, month) => {
    return new Date(year, month, 1).getDay();
  };
  
  // Get week key from date
  const getWeekKey = (dateStr) => {
    const date = new Date(dateStr);
    const day = date.getDay();
    const diff = date.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is Sunday
    const monday = new Date(date.setDate(diff));
    return `week-${monday.toISOString().split('T')[0]}`;
  };
  
  // Check if a date is a weekend
  const isWeekend = (date) => {
    const day = date.getDay();
    return day === 0 || day === 6; // 0 is Sunday, 6 is Saturday
  };
  
  // Count penalties for the current month
  const countMonthlyPenalties = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth() + 1;
    const monthPrefix = `${year}-${month.toString().padStart(2, '0')}`;
    
    let edjayCount = 0;
    let nicoleCount = 0;
    
    Object.keys(penaltyDates.edjay).forEach(date => {
      if (date.startsWith(monthPrefix)) {
        edjayCount++;
      }
    });
    
    Object.keys(penaltyDates.nicole).forEach(date => {
      if (date.startsWith(monthPrefix)) {
        nicoleCount++;
      }
    });
    
    return { edjay: edjayCount, nicole: nicoleCount };
  };
  
  const monthlyPenalties = countMonthlyPenalties();
  
  // Count total owed for penalties not completed
  const calculateOwedAmount = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const penalty = getMonetaryPenalty(month);
    
    let total = 0;
    Object.entries(penaltyData).forEach(([weekKey, data]) => {
      const weekDate = new Date(weekKey.replace('week-', ''));
      if (weekDate.getMonth() === month && weekDate.getFullYear() === year) {
        if (!data.compliance.edjay) {
          total += penalty * data.penalties.edjay.length;
        }
        if (!data.compliance.nicole) {
          total += penalty * data.penalties.nicole.length;
        }
      }
    });
    
    return total;
  };
  
  // Get weekly summary for penalties
  const getWeeklySummary = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth() + 1;
    const monthPrefix = `${year}-${month.toString().padStart(2, '0')}`;
    
    // Filter to only show current month's weeks
    const currentMonthWeeks = Object.entries(penaltyData).filter(([weekKey, data]) => {
      // Check if any penalty date in this week belongs to current month
      for (const participant in data.penalties) {
        for (const date of data.penalties[participant]) {
          if (date.startsWith(monthPrefix)) {
            return true;
          }
        }
      }
      return false;
    });
    
    return currentMonthWeeks;
  };
  
  // Check if a date has a penalty for a participant and get week compliance
  const getPenaltyStatusForDate = (dateStr, participant) => {
    if (!penaltyDates[participant][dateStr]) {
      return null; // No penalty on this date
    }
    
    const weekKey = getWeekKey(dateStr);
    const weekData = penaltyData[weekKey];
    
    if (!weekData) {
      return null;
    }
    
    return {
      hasPenalty: true,
      completed: weekData.compliance[participant] // Whether the penalty was completed
    };
  };
  
  const renderCalendarDays = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const daysInMonth = getDaysInMonth(year, month);
    const firstDayOfMonth = getFirstDayOfMonth(year, month);
    
    const days = [];
    const rows = Math.ceil((daysInMonth + firstDayOfMonth) / 7);
    
    for (let row = 0; row < rows; row++) {
      const week = [];
      for (let col = 0; col < 7; col++) {
        const dayIndex = row * 7 + col;
        const dayNumber = dayIndex - firstDayOfMonth + 1;
        
        if (dayNumber > 0 && dayNumber <= daysInMonth) {
          const currentDate = new Date(year, month, dayNumber);
          const dateStr = `${year}-${(month + 1).toString().padStart(2, '0')}-${dayNumber.toString().padStart(2, '0')}`;
          const isAfterStartDate = currentDate >= challenge.startDate;
          const isBeforeEndDate = currentDate <= challenge.endDate;
          const isWeekendDay = isWeekend(currentDate);
          
          if (isAfterStartDate && isBeforeEndDate) {
            // Date is within the challenge period
            if (isWeekendDay) {
              // Weekend cells - show compliance status
              const prevWeek = new Date(currentDate);
              prevWeek.setDate(prevWeek.getDate() - (isWeekendDay ? (currentDate.getDay() === 0 ? 1 : 2) : 0));
              const weekKey = `week-${prevWeek.toISOString().split('T')[0].slice(0, 10)}`;
              const weekData = penaltyData[weekKey];
              
              if (weekData) {
                week.push(
                  <div key={`day-${dayNumber}`} className="p-1">
                    <div className={`${cardBg} rounded-md p-1 sm:p-2 shadow-sm border-2 border-dashed ${borderColor}`}>
                      <div className={`text-center mb-1 ${textColor} text-xs sm:text-base`}>{dayNumber}</div>
                      <div className="text-xs text-center text-gray-400 mb-1 hidden sm:block">Weekend</div>
                      <div className="grid grid-cols-2 gap-1">
                        <div className="flex flex-col items-center">
                          <div className="text-xs hidden sm:block">{challenge.participants.edjay.name}</div>
                          <div className="text-xs block sm:hidden">E</div>
                          {weekData.compliance.edjay ? 
                            <CheckCircle size={12} className="text-green-500 mt-1" /> : 
                            <XCircle size={12} className="text-red-500 mt-1" />
                          }
                        </div>
                        <div className="flex flex-col items-center">
                          <div className="text-xs hidden sm:block">{challenge.participants.nicole.name}</div>
                          <div className="text-xs block sm:hidden">N</div>
                          {weekData.compliance.nicole ? 
                            <CheckCircle size={12} className="text-green-500 mt-1" /> : 
                            <XCircle size={12} className="text-red-500 mt-1" />
                          }
                        </div>
                      </div>
                    </div>
                  </div>
                );
              } else {
                // Weekend with no penalties due
                week.push(
                  <div key={`day-${dayNumber}`} className="p-1">
                    <div className={`${cardBg} rounded-md p-1 sm:p-2 shadow-sm border-2 border-dashed ${borderColor}`}>
                      <div className={`text-center mb-1 sm:mb-2 ${textColor} text-xs sm:text-base`}>{dayNumber}</div>
                      <div className="text-xs text-center italic text-gray-500 truncate">Weekend</div>
                    </div>
                  </div>
                );
              }
            } else {
              // Weekday cells
              const edjayMissed = penaltyDates.edjay[dateStr];
              const nicoleMissed = penaltyDates.nicole[dateStr];
              
              // Get compliance status
              const edjayStatus = getPenaltyStatusForDate(dateStr, 'edjay');
              const nicoleStatus = getPenaltyStatusForDate(dateStr, 'nicole');
              
              week.push(
                <div key={`day-${dayNumber}`} className="p-1">
                  <div className={`${cardBg} rounded-md p-1 sm:p-2 shadow-sm`}>
                    <div className={`text-center mb-1 sm:mb-2 ${textColor} text-xs sm:text-base`}>{dayNumber}</div>
                    <div className="grid gap-1">
                      <div className={`text-xs text-center rounded py-1 ${edjayMissed ? edjayFailureColor : edjaySuccessColor} flex items-center justify-center`}>
                        <span className="hidden sm:inline">{challenge.participants.edjay.name}</span>
                        <span className="inline sm:hidden">Ej</span>
                        {edjayStatus && (
                          <span className="ml-1">
                            {edjayStatus.completed ? 
                              <CheckCircle size={10} className="text-green-300" /> : 
                              <XCircle size={10} className="text-red-300" />
                            }
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="mt-1 grid gap-1">
                      <div className={`text-xs text-center rounded py-1 ${nicoleMissed ? nicoleFailureColor : nicoleSuccessColor} flex items-center justify-center`}>
                        <span className="hidden sm:inline">{challenge.participants.nicole.name}</span>
                        <span className="inline sm:hidden">Nic</span>
                        {nicoleStatus && (
                          <span className="ml-1">
                            {nicoleStatus.completed ? 
                              <CheckCircle size={10} className="text-green-300" /> : 
                              <XCircle size={10} className="text-red-300" />
                            }
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            }
          } else {
            // Date is outside the challenge period
            week.push(
              <div key={`day-${dayNumber}`} className="p-1">
                <div className={`${inactiveBg} rounded-md p-1 sm:p-2 opacity-50`}>
                  <div className={`text-center mb-1 sm:mb-2 ${textColor} text-xs sm:text-base`}>{dayNumber}</div>
                  <div className="h-8 sm:h-12"></div>
                </div>
              </div>
            );
          }
        } else {
          week.push(<div key={`empty-${dayIndex}`} className="p-1"></div>);
        }
      }
      days.push(
        <div key={`row-${row}`} className="grid grid-cols-7 gap-1">
          {week}
        </div>
      );
    }
    
    return days;
  };
  
  // Color theme based on system preference
  const bgColor = darkMode ? 'bg-gray-900' : 'bg-gray-100';
  const textColor = darkMode ? 'text-white' : 'text-gray-900';
  const cardBg = darkMode ? 'bg-gray-800' : 'bg-white';
  const inactiveBg = darkMode ? 'bg-gray-700' : 'bg-gray-300';
  const accentColor = 'bg-yellow-500';
  const accentText = 'text-black';
  const borderColor = darkMode ? 'border-gray-600' : 'border-gray-400';
  
  // Custom colors for participant status
  // Success colors (completed their water goal)
  const edjaySuccessColor = darkMode ? 'bg-green-600' : 'bg-green-500';
  const nicoleSuccessColor = darkMode ? 'bg-green-600' : 'bg-green-500';
  
  // Failure colors (penalty - missed their water goal)
  const edjayFailureColor = darkMode ? 'bg-red-600' : 'bg-red-500';
  const nicoleFailureColor = darkMode ? 'bg-red-600' : 'bg-red-500';

  return (
    <div className={`${bgColor} ${textColor} min-h-screen w-full transition-colors duration-200`}>
      <div className="container mx-auto px-2 sm:px-4 py-3 sm:py-6">
        <div className="flex justify-between items-center mb-4 sm:mb-6">
          <h1 className="text-xl sm:text-4xl font-bold w-full text-center mb-2 sm:mb-5">
            HYDRATION CHALLENGE
          </h1>
          <button 
            onClick={() => setDarkMode(!darkMode)} 
            className={`p-2 rounded-full ${darkMode ? 'bg-gray-700' : 'bg-gray-200'} `}
            aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
          >
            {darkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>
        </div>
        
        {/* Month Navigation - Mobile Dropdown */}
        <div className="md:hidden mb-4 relative">
          <button 
            onClick={() => setMobileMonthsOpen(!mobileMonthsOpen)} 
            className={`flex items-center justify-between w-full px-4 py-2 ${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-md shadow`}
          >
            <span>{months[currentMonth.getMonth()]} {currentMonth.getFullYear()}</span>
            <Menu size={18} />
          </button>
          
          {mobileMonthsOpen && (
            <div className={`absolute top-full left-0 right-0 mt-1 z-10 ${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-md shadow-lg`}>
              {[0, 1, 2, 3, 4, 5, 6, 7].map((monthOffset) => (
                <button 
                  key={monthOffset}
                  onClick={() => {
                    setCurrentMonth(new Date(2025, monthOffset, 1));
                    setMobileMonthsOpen(false);
                  }}
                  className={`block w-full text-left px-4 py-2 ${currentMonth.getMonth() === monthOffset ? 'bg-yellow-500 text-black' : ''}`}
                >
                  {months[monthOffset]} 2025
                </button>
              ))}
            </div>
          )}
        </div>
        
        {/* Month Navigation - Desktop */}
        <div className="hidden md:flex justify-center mb-8 gap-2 flex-wrap">
          {[0, 1, 2, 3, 4, 5, 6, 7].map((monthOffset) => {
            const monthDate = new Date(2025, monthOffset, 1);
            const isCurrentMonth = monthDate.getMonth() === currentMonth.getMonth();
            
            return (
              <button 
                key={monthOffset}
                onClick={() => setCurrentMonth(new Date(2025, monthOffset, 1))}
                className={`px-4 py-2 ${isCurrentMonth ? accentColor + ' ' + accentText : (darkMode ? 'bg-gray-700 text-white' : 'bg-gray-300 text-gray-900')} rounded-md mb-2`}
              >
                {months[monthOffset]} 2025
              </button>
            );
          })}
        </div>
        
        <div className="grid md:grid-cols-3 gap-4 sm:gap-6">
          <div className="md:col-span-2 order-2 md:order-1">
            {/* Month Display - Desktop */}
            <div className="hidden md:flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">
                {months[currentMonth.getMonth()]} {currentMonth.getFullYear()}
              </h2>
            </div>
            
            {/* Days of Week */}
            <div className="grid grid-cols-7 gap-1 mb-2 text-center text-xs sm:text-base">
              {["S", "M", "T", "W", "Th", "F", "S"].map((day, index) => (
                <div key={index} className="font-bold">{day}</div>
              ))}
            </div>
            
            {/* Calendar Grid */}
            <div className="mb-4 sm:mb-6">
              {renderCalendarDays()}
            </div>
            
            {/* Color Legend */}
            <div className={`${cardBg} rounded-lg p-3 sm:p-4 shadow-md mb-4 sm:mb-6`}>
              <h3 className="text-base sm:text-lg font-bold mb-2">Legend:</h3>
              <div className="grid grid-cols-2 gap-y-2 text-xs sm:text-sm">
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 sm:w-4 sm:h-4 rounded ${edjaySuccessColor}`}></div>
                  <span>Target Achieved</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 sm:w-4 sm:h-4 rounded ${edjayFailureColor}`}></div>
                  <span>Target Missed</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle size={14} className="text-green-500" />
                  <span>Penalty Completed</span>
                </div>
                <div className="flex items-center gap-2">
                  <XCircle size={14} className="text-red-500" />
                  <span>Penalty Not Completed</span>
                </div>
                <div className="flex items-center gap-2 col-span-2">
                  <div className="w-3 h-3 sm:w-4 sm:h-4 border-2 border-dashed border-gray-400 rounded"></div>
                  <span>Weekend (Penalties due)</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="space-y-4 sm:space-y-6 order-1 md:order-2">
            {/* Penalty Counter */}
            <div className={`${cardBg} rounded-lg p-3 sm:p-4 shadow-md`}>
              <h2 className="text-center text-lg sm:text-xl font-bold mb-3 sm:mb-4">Monthly Penalty Counter</h2>
              <div className="grid grid-cols-3 gap-2 sm:gap-4 text-center mb-3 sm:mb-4">
                <div>
                  <h3 className="text-sm sm:text-base">{challenge.participants.edjay.name}</h3>
                  <div className="text-xl sm:text-2xl font-bold text-yellow-500">{monthlyPenalties.edjay}</div>
                </div>
                <div>
                  <h3 className="text-sm sm:text-base">{challenge.participants.nicole.name}</h3>
                  <div className="text-xl sm:text-2xl font-bold text-yellow-500">{monthlyPenalties.nicole}</div>
                </div>
                <div>
                  <h3 className="text-sm sm:text-base">Total</h3>
                  <div className="text-xl sm:text-2xl font-bold text-yellow-500">{monthlyPenalties.edjay + monthlyPenalties.nicole}</div>
                </div>
              </div>
              <div className="text-center p-2 sm:p-3 rounded-lg bg-opacity-25 bg-yellow-500 text-sm sm:text-base">
                <p>Monthly Penalty</p>
                <p className="text-xl sm:text-2xl font-bold">{getMonetaryPenalty(currentMonth.getMonth())} Pesos/Missed Day</p>
              </div>
              {calculateOwedAmount() > 0 && (
                <div className="mt-2 sm:mt-3 text-center p-2 sm:p-3 rounded-lg bg-opacity-25 bg-red-500 text-sm sm:text-base">
                  <p>Amount Owed (Uncompleted Penalties)</p>
                  <p className="text-xl sm:text-2xl font-bold">{calculateOwedAmount()} Pesos</p>
                </div>
              )}
            </div>
            
            {/* Weekly Summary */}
            <div className={`${cardBg} rounded-lg p-3 sm:p-4 shadow-md`}>
              <h3 className="text-lg sm:text-xl font-bold mb-2 sm:mb-3">Weekly Summaries</h3>
              <div className="max-h-64 overflow-y-auto pr-1">
                <div className="space-y-2 sm:space-y-3">
                  {getWeeklySummary().length > 0 ? (
                    getWeeklySummary().map(([weekKey, data]) => {
                      // Get start/end dates of the week
                      const weekStart = new Date(weekKey.replace('week-', ''));
                      const weekEnd = new Date(weekStart);
                      weekEnd.setDate(weekEnd.getDate() + 4); // Show Monday-Friday
                      
                      const startStr = `${weekStart.getDate()} ${months[weekStart.getMonth()]}`;
                      const endStr = `${weekEnd.getDate()} ${months[weekEnd.getMonth()]}`;
                      
                      const bothCompleted = data.compliance.edjay && data.compliance.nicole;
                      const noneCompleted = !data.compliance.edjay && !data.compliance.nicole;
                      
                      let bgColor = 'bg-yellow-600 bg-opacity-20'; // Mixed compliance
                      if (bothCompleted) bgColor = 'bg-green-500 bg-opacity-20';
                      if (noneCompleted) bgColor = 'bg-red-500 bg-opacity-20';
                      
                      return (
                        <div key={weekKey} className={`p-2 sm:p-3 rounded-lg ${bgColor}`}>
                          <div className="flex justify-between items-center mb-1">
                            <h4 className="font-bold text-sm sm:text-base">{startStr} - {endStr}</h4>
                          </div>
                          <p className="text-xs sm:text-sm opacity-80 truncate">{data.description}</p>
                          <div className="mt-2 grid grid-cols-2 gap-2">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-semibold">{challenge.participants.edjay.name}:</span>
                              <div className="flex items-center">
                                <span className="text-xs mr-1">{data.penalties.edjay.length} penalties</span>
                                {data.compliance.edjay ? 
                                  <CheckCircle size={14} className="text-green-500" /> : 
                                  <XCircle size={14} className="text-red-500" />
                                }
                              </div>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-semibold">{challenge.participants.nicole.name}:</span>
                              <div className="flex items-center">
                                <span className="text-xs mr-1">{data.penalties.nicole.length} penalties</span>
                                {data.compliance.nicole ? 
                                  <CheckCircle size={14} className="text-green-500" /> : 
                                  <XCircle size={14} className="text-red-500" />
                                }
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-center p-4 text-gray-400 text-sm">No penalty data for this month</div>
                  )}
                </div>
              </div>
            </div>
            
            {/* Rules - Collapsible on mobile, always open on desktop */}
            <div className={`${cardBg} rounded-lg p-3 sm:p-4 shadow-md`}>
              <div className="block md:hidden">
                <details>
                  <summary className="text-lg font-bold mb-1 cursor-pointer">
                    Rules:
                  </summary>
                  <ol className="list-decimal pl-4 space-y-1 text-xs mt-2">
                    <li>Edjay needs to drink 4L of water daily.</li>
                    <li>Nicole needs to drink 3L of water daily.</li>
                    <li>Participants must report their water intake at the end of each day via video or picture.</li>
                    <li>Penalty for missing water target: {getPenaltyAmount(currentMonth.getMonth())}km jog/walk on weekend.</li>
                    <li>Failure to complete exercise: {getMonetaryPenalty(currentMonth.getMonth())} pesos per missed day.</li>
                    <li>Challenge runs from January 20, 2025 to August 31, 2025.</li>
                    <li>Penalty enforcement begins February 3, 2025.</li>
                  </ol>
                </details>
              </div>
              <div className="hidden md:block">
                <h3 className="text-xl font-bold mb-3">Rules:</h3>
                <ol className="list-decimal pl-5 space-y-2 text-sm">
                  <li>Edjay needs to drink 4L of water daily.</li>
                  <li>Nicole needs to drink 3L of water daily.</li>
                  <li>Participants must report their water intake at the end of each day via video or picture.</li>
                  <li>Penalty for missing water target: {getPenaltyAmount(currentMonth.getMonth())}km jog/walk on weekend.</li>
                  <li>Failure to complete exercise: {getMonetaryPenalty(currentMonth.getMonth())} pesos per missed day.</li>
                  <li>Challenge runs from January 20, 2025 to August 31, 2025.</li>
                  <li>Penalty enforcement begins February 3, 2025.</li>
                </ol>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;