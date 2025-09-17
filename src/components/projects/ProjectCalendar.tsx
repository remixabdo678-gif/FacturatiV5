import React, { useState } from 'react';
import { Project, Task } from '../../contexts/DataContext';
import { 
  Calendar, 
  ChevronLeft, 
  ChevronRight,
  Clock,
  AlertTriangle,
  CheckCircle,
  Target,
  Filter
} from 'lucide-react';

interface ProjectCalendarProps {
  projects: Project[];
  tasks: Task[];
}

export default function ProjectCalendar({ projects, tasks }: ProjectCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'month' | 'week'>('month');
  const [showProjects, setShowProjects] = useState(true);
  const [showTasks, setShowTasks] = useState(true);

  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();

  // Générer les jours du mois
  const getDaysInMonth = () => {
    const firstDay = new Date(currentYear, currentMonth, 1);
    const lastDay = new Date(currentYear, currentMonth + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    // Jours du mois précédent
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      const date = new Date(currentYear, currentMonth, -i);
      days.push({ date, isCurrentMonth: false });
    }
    
    // Jours du mois actuel
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentYear, currentMonth, day);
      days.push({ date, isCurrentMonth: true });
    }
    
    // Jours du mois suivant pour compléter la grille
    const remainingDays = 42 - days.length;
    for (let day = 1; day <= remainingDays; day++) {
      const date = new Date(currentYear, currentMonth + 1, day);
      days.push({ date, isCurrentMonth: false });
    }
    
    return days;
  };

  const getEventsForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    const events = [];

    if (showProjects) {
      // Projets qui commencent ce jour
      const startingProjects = projects.filter(project => 
        project.startDate === dateStr
      );
      startingProjects.forEach(project => {
        events.push({
          type: 'project_start',
          title: `🚀 ${project.name}`,
          project,
          color: 'bg-blue-500'
        });
      });

      // Projets qui se terminent ce jour
      const endingProjects = projects.filter(project => 
        project.endDate === dateStr
      );
      endingProjects.forEach(project => {
        events.push({
          type: 'project_end',
          title: `🏁 ${project.name}`,
          project,
          color: project.status === 'completed' ? 'bg-green-500' : 'bg-red-500'
        });
      });
    }

    if (showTasks) {
      // Tâches avec deadline ce jour
      const dueTasks = tasks.filter(task => 
        task.deadline === dateStr
      );
      dueTasks.forEach(task => {
        const isOverdue = date < new Date() && task.status !== 'completed';
        events.push({
          type: 'task_due',
          title: `📋 ${task.title}`,
          task,
          color: isOverdue ? 'bg-red-500' : 
                 task.status === 'completed' ? 'bg-green-500' : 
                 task.priority === 'high' ? 'bg-orange-500' : 'bg-blue-500'
        });
      });
    }

    return events;
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    if (direction === 'prev') {
      newDate.setMonth(currentMonth - 1);
    } else {
      newDate.setMonth(currentMonth + 1);
    }
    setCurrentDate(newDate);
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const days = getDaysInMonth();
  const monthNames = [
    'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
  ];
  const dayNames = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];

  return (
    <div className="space-y-6">
      {/* Header du calendrier */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 transition-colors duration-300">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigateMonth('prev')}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors duration-300"
            >
              <ChevronLeft className="w-5 h-5 text-gray-600 dark:text-gray-300" />
            </button>
            
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 transition-colors duration-300">
              {monthNames[currentMonth]} {currentYear}
            </h2>
            
            <button
              onClick={() => navigateMonth('next')}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors duration-300"
            >
              <ChevronRight className="w-5 h-5 text-gray-600 dark:text-gray-300" />
            </button>
            
            <button
              onClick={goToToday}
              className="px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm transition-colors"
            >
              Aujourd'hui
            </button>
          </div>

          <div className="flex items-center space-x-4">
            {/* Filtres d'affichage */}
            <div className="flex items-center space-x-3">
              <label className="flex items-center space-x-2 text-gray-700 dark:text-gray-300">
                <input
                  type="checkbox"
                  checked={showProjects}
                  onChange={(e) => setShowProjects(e.target.checked)}
                  className="rounded border-gray-300 dark:border-gray-600 text-purple-600 focus:ring-purple-500"
                />
                <span className="text-sm">Projets</span>
              </label>
              <label className="flex items-center space-x-2 text-gray-700 dark:text-gray-300">
                <input
                  type="checkbox"
                  checked={showTasks}
                  onChange={(e) => setShowTasks(e.target.checked)}
                  className="rounded border-gray-300 dark:border-gray-600 text-purple-600 focus:ring-purple-500"
                />
                <span className="text-sm">Tâches</span>
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Calendrier */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden transition-colors duration-300">
        {/* En-têtes des jours */}
        <div className="grid grid-cols-7 bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-700 transition-colors duration-300">
          {dayNames.map((day) => (
            <div key={day} className="p-4 text-center text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors duration-300">
              {day}
            </div>
          ))}
        </div>

        {/* Grille du calendrier */}
        <div className="grid grid-cols-7">
          {days.map((day, index) => {
            const events = getEventsForDate(day.date);
            const isToday = day.date.toDateString() === new Date().toDateString();
            
            return (
              <div
                key={index}
                className={`min-h-32 p-2 border-r border-b border-gray-200 ${
                  day.isCurrentMonth ? 'bg-white dark:bg-gray-800' : 'bg-gray-50 dark:bg-gray-700'
                } ${isToday ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-300 dark:border-blue-600' : ''} transition-colors duration-300`}
              >
                {/* Numéro du jour */}
                <div className={`text-sm font-medium mb-2 ${
                  day.isCurrentMonth ? 'text-gray-900 dark:text-gray-100' : 'text-gray-400 dark:text-gray-500'
                } ${isToday ? 'text-blue-600 dark:text-blue-400 font-bold' : ''} transition-colors duration-300`}>
                  {day.date.getDate()}
                </div>

                {/* Événements */}
                <div className="space-y-1">
                  {events.slice(0, 3).map((event, eventIndex) => (
                    <div
                      key={eventIndex}
                      className={`${event.color} text-white text-xs p-1 rounded truncate cursor-pointer hover:opacity-80 transition-opacity`}
                      title={event.title}
                    >
                      {event.title}
                    </div>
                  ))}
                  
                  {events.length > 3 && (
                    <div className="text-xs text-gray-500 dark:text-gray-400 text-center transition-colors duration-300">
                      +{events.length - 3} autre{events.length - 3 > 1 ? 's' : ''}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Légende */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 transition-colors duration-300">
        <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-4 transition-colors duration-300">Légende du Calendrier</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 transition-colors duration-300">Types d'événements</h5>
            <div className="space-y-2">
              <div className="flex items-center space-x-3">
                <div className="w-4 h-4 bg-blue-500 rounded" />
                <span className="text-sm text-gray-600 dark:text-gray-300 transition-colors duration-300">🚀 Début de projet</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-4 h-4 bg-green-500 rounded" />
                <span className="text-sm text-gray-600 dark:text-gray-300 transition-colors duration-300">🏁 Fin de projet (terminé)</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-4 h-4 bg-red-500 rounded" />
                <span className="text-sm text-gray-600 dark:text-gray-300 transition-colors duration-300">⚠️ Deadline ou retard</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-4 h-4 bg-orange-500 rounded" />
                <span className="text-sm text-gray-600 dark:text-gray-300 transition-colors duration-300">📋 Tâche prioritaire</span>
              </div>
            </div>
          </div>
          
          <div>
            <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 transition-colors duration-300">Navigation</h5>
            <div className="text-sm text-gray-600 dark:text-gray-300 space-y-1 transition-colors duration-300">
              <p>• Utilisez les flèches pour naviguer entre les mois</p>
              <p>• Cliquez sur "Aujourd'hui" pour revenir au mois actuel</p>
              <p>• Survolez les événements pour voir les détails</p>
              <p>• Utilisez les filtres pour masquer projets ou tâches</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}