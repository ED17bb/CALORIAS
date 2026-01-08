import React, { useState, useEffect, useMemo } from 'react';
import { 
  Activity, 
  Utensils, 
  Plus, 
  Trash2, 
  ChevronRight, 
  User, 
  ArrowLeft,
  Search,
  Calendar as CalendarIcon,
  Target,
  History,
  CheckCircle2,
  XCircle
} from 'lucide-react';

// --- INTERFACES ---
interface FoodItemDB {
  name: string;
  unit: string;
  calPerUnit: number;
}

interface LogItem {
  name: string;
  amount: number;
  unit: string;
  calories: number;
}

interface UserData {
  weight: string;
  height: string;
  age: string;
  gender: string;
  activity: string;
  goal: string;
}

interface LogsMap {
  [date: string]: LogItem[];
}

// --- COMPONENTE DE ESTILOS Y CONFIGURACIÓN ---
const StyleInjector = () => {
  useEffect(() => {
    // 1. Cargar Fuente Inter
    if (!document.getElementById('font-inter')) {
      const link = document.createElement('link');
      link.id = 'font-inter';
      link.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap';
      link.rel = 'stylesheet';
      document.head.appendChild(link);
    }

    // 2. Cargar Tailwind CSS
    if (!document.getElementById('tailwind-script')) {
      const script = document.createElement('script');
      script.id = 'tailwind-script';
      script.src = "https://cdn.tailwindcss.com";
      script.onload = () => {
        const win = window as any;
        if (win.tailwind) {
          win.tailwind.config = {
            theme: {
              extend: {
                fontFamily: { sans: ['Inter', 'sans-serif'] },
                colors: {
                  zinc: {
                    50: '#fafafa', 100: '#f4f4f5', 200: '#e4e4e7', 300: '#d4d4d8', 400: '#a1a1aa',
                    500: '#71717a', 600: '#52525b', 700: '#3f3f46', 800: '#27272a', 900: '#18181b', 950: '#09090b',
                  },
                  emerald: { 400: '#34d399', 500: '#10b981' }
                }
              }
            }
          };
        }
      };
      document.head.appendChild(script);
    }

    // 3. Forzar fondo oscuro
    document.body.style.backgroundColor = '#09090b';
    document.body.style.color = 'white';
    document.body.style.fontFamily = "'Inter', sans-serif";

    // 4. CAMBIAR ICONO DE LA APP (FAVICON)
    const setFavicon = (url: string) => {
      let link = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
      if (!link) {
        link = document.createElement('link');
        link.rel = 'icon';
        document.getElementsByTagName('head')[0].appendChild(link);
      }
      link.href = url;
    };

    // --- PARTE 1: AQUÍ CAMBIAS EL ICONO DE LA PESTAÑA ---
    // Si tu archivo se llama 'mi-imagen.png', pon '/mi-imagen.png'
    setFavicon('/logo.png'); // <--- CAMBIA ESTO SI ES NECESARIO
    
    document.title = "CaloTrack - Ernesto Edition";

  }, []);

  return null;
};

// --- BASE DE DATOS ---
const COMMON_FOODS: FoodItemDB[] = [
  { name: 'Pechuga de Pollo (Cocida)', unit: 'g', calPerUnit: 1.65 },
  { name: 'Arroz Blanco (Cocido)', unit: 'g', calPerUnit: 1.30 },
  { name: 'Huevo Grande', unit: 'unidad', calPerUnit: 78 },
  { name: 'Palta / Aguacate', unit: 'g', calPerUnit: 1.60 },
  { name: 'Pan Integral', unit: 'rebanada', calPerUnit: 80 },
  { name: 'Manzana', unit: 'unidad', calPerUnit: 95 },
  { name: 'Banana', unit: 'unidad', calPerUnit: 105 },
  { name: 'Avena (Cruda)', unit: 'g', calPerUnit: 3.89 },
  { name: 'Leche Entera', unit: 'ml', calPerUnit: 0.61 },
  { name: 'Aceite de Oliva', unit: 'cucharada', calPerUnit: 119 },
  { name: 'Atún en Agua', unit: 'g', calPerUnit: 1.16 },
  { name: 'Papas (Hervidas)', unit: 'g', calPerUnit: 0.87 },
  { name: 'Carne de Res (Magra)', unit: 'g', calPerUnit: 2.50 },
  { name: 'Yogur Griego', unit: 'g', calPerUnit: 0.59 },
  { name: 'Almendras', unit: 'g', calPerUnit: 5.79 },
];

// --- UTILIDADES ---
const getTodayStr = (): string => new Date().toLocaleDateString('en-CA'); 

const getMonday = (d: Date): Date => {
  const date = new Date(d);
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(date.setDate(diff));
};

const getWeekDays = (mondayDate: Date): string[] => {
  const week: string[] = [];
  for (let i = 0; i < 7; i++) {
    const nextDay = new Date(mondayDate);
    nextDay.setDate(mondayDate.getDate() + i);
    week.push(nextDay.toLocaleDateString('en-CA'));
  }
  return week;
};

// --- COMPONENTES UI (Tipados) ---

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
}

const Button: React.FC<ButtonProps> = ({ children, onClick, variant = 'primary', className = '', ...props }) => {
  const baseStyle = "w-full py-4 rounded-2xl font-bold transition-all duration-200 active:scale-95 flex items-center justify-center gap-3 text-lg";
  const variants = {
    primary: "bg-emerald-500 hover:bg-emerald-400 text-zinc-950 shadow-lg shadow-emerald-500/20",
    secondary: "bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700",
    outline: "bg-transparent border-2 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10",
    ghost: "bg-transparent text-zinc-400 hover:text-zinc-200 py-2"
  };

  return (
    <button className={`${baseStyle} ${variants[variant]} ${className}`} onClick={onClick} {...props}>
      {children}
    </button>
  );
};

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

const Input: React.FC<InputProps> = ({ label, ...props }) => (
  <div className="mb-4">
    <label className="block text-xs font-medium text-zinc-400 mb-1 uppercase tracking-wider">{label}</label>
    <input 
      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-zinc-100 placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all"
      {...props}
    />
  </div>
);

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  options: { value: string; label: string }[];
}

const Select: React.FC<SelectProps> = ({ label, options, ...props }) => (
  <div className="mb-4">
    <label className="block text-xs font-medium text-zinc-400 mb-1 uppercase tracking-wider">{label}</label>
    <select 
      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 appearance-none"
      {...props}
    >
      {options.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
    </select>
  </div>
);

// --- PANTALLAS ---

// 1. Home
const HomeScreen = ({ onNavigate }: { onNavigate: (screen: string) => void }) => {
  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-emerald-900/10 to-transparent -z-10" />
      <div className="absolute -top-20 -right-20 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl" />
      <div className="absolute top-40 -left-20 w-40 h-40 bg-blue-500/10 rounded-full blur-3xl" />

      <div className="mb-12 text-center">
        {/* PARTE 2: AQUÍ CAMBIAS LA IMAGEN DEL MENÚ PRINCIPAL */}
        <div className="w-24 h-24 bg-emerald-500 rounded-3xl mx-auto flex items-center justify-center mb-6 shadow-2xl shadow-emerald-500/30 rotate-3 overflow-hidden p-2">
          <img 
            src="/logo.jpg"  // <--- CAMBIA ESTO SI ES NECESARIO
            alt="CaloTrack Logo" 
            className="w-full h-full object-contain" 
          />
        </div>
        <h1 className="text-5xl font-extrabold text-white mb-2 tracking-tight">Que CALORia</h1>
        <p className="text-zinc-400 text-lg">Tu control diario, simplificado.</p>
      </div>

      <div className="w-full max-w-sm space-y-4">
        {/* BOTÓN 1: CONFIGURAR PERFIL */}
        <Button onClick={() => onNavigate('setup')} variant="secondary" className="bg-zinc-900 border-zinc-800">
          <User size={24} className="text-emerald-500" />
          Configurar Perfil
        </Button>

        {/* BOTÓN 2: INGRESAR CALORÍAS */}
        <Button onClick={() => onNavigate('calendar')} variant="primary">
          <CalendarIcon size={24} />
          Ingresar Calorías
        </Button>
        
        {/* BOTÓN 3: OBJETIVO SEMANAL */}
        <Button onClick={() => onNavigate('goals')} variant="secondary" className="bg-zinc-900 border-zinc-800">
          <Target size={24} className="text-emerald-500" />
          Objetivo Semanal
        </Button>
      </div>

      <p className="mt-12 text-zinc-600 text-sm">v1.8.0 • Ernesto Edition (TS)</p>
    </div>
  );
};

// 2. Objetivo Semanal
interface WeeklyGoalProps {
  user: UserData | null;
  allLogs: LogsMap;
  onBack: () => void;
}

const WeeklyGoalView: React.FC<WeeklyGoalProps> = ({ user, allLogs, onBack }) => {
  const dailyTarget = useMemo(() => {
    if (!user) return 2000;
    let bmr;
    const weight = parseFloat(user.weight);
    const height = parseFloat(user.height);
    const age = parseFloat(user.age);
    if (user.gender === 'male') bmr = (10 * weight) + (6.25 * height) - (5 * age) + 5;
    else bmr = (10 * weight) + (6.25 * height) - (5 * age) - 161;
    const tdee = bmr * parseFloat(user.activity);
    let target = tdee;
    if (user.goal === 'lose') target = tdee - 500;
    if (user.goal === 'gain') target = tdee + 500;
    return Math.round(target);
  }, [user]);

  const weeklyTarget = dailyTarget * 7;
  const currentMonday = getMonday(new Date());
  const currentWeekDays = getWeekDays(currentMonday);
  
  let currentWeekConsumed = 0;
  const currentWeekData = currentWeekDays.map(dateStr => {
    const logs = allLogs[dateStr] || [];
    const dayTotal = logs.reduce((acc, item) => acc + item.calories, 0);
    currentWeekConsumed += dayTotal;
    return { date: dateStr, total: dayTotal };
  });

  const progressPercent = Math.min((currentWeekConsumed / weeklyTarget) * 100, 100);

  const historyWeeks = [];
  for (let i = 1; i <= 4; i++) {
    const pastMonday = new Date(currentMonday);
    pastMonday.setDate(currentMonday.getDate() - (i * 7));
    const pastWeekDays = getWeekDays(pastMonday);
    let weeklySum = 0;
    pastWeekDays.forEach(d => {
      const logs = allLogs[d] || [];
      weeklySum += logs.reduce((acc, item) => acc + item.calories, 0);
    });

    let status = 'neutral';
    if (weeklySum === 0) status = 'no_data';
    else if (user && user.goal === 'lose') status = weeklySum <= weeklyTarget ? 'success' : 'fail';
    else if (user && user.goal === 'gain') status = weeklySum >= weeklyTarget ? 'success' : 'fail';
    else status = (weeklySum >= weeklyTarget * 0.9 && weeklySum <= weeklyTarget * 1.1) ? 'success' : 'fail';

    historyWeeks.push({
      startDate: pastMonday,
      endDate: new Date(pastWeekDays[6]),
      total: weeklySum,
      target: weeklyTarget,
      status
    });
  }

  const dayLabels = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];

  return (
    <div className="min-h-screen bg-zinc-950 p-6 flex flex-col">
       <div className="flex items-center gap-4 mb-8">
        <button onClick={onBack} className="p-2 bg-zinc-900 rounded-full text-zinc-400 hover:text-white">
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-2xl font-bold text-white">Progreso Semanal</h1>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 shadow-xl mb-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-10">
          <Target size={100} className="text-emerald-500" />
        </div>
        
        <div className="relative z-10">
          <p className="text-zinc-400 text-sm font-medium uppercase tracking-wider mb-1">Semana Actual</p>
          <h2 className="text-white text-lg font-semibold mb-4">
            {currentMonday.getDate()} {currentMonday.toLocaleString('es-ES', { month: 'short' })} - {new Date(currentWeekDays[6]).getDate()} {new Date(currentWeekDays[6]).toLocaleString('es-ES', { month: 'short' })}
          </h2>

          <div className="flex items-end gap-2 mb-2">
            <span className="text-4xl font-bold text-white">{currentWeekConsumed.toLocaleString()}</span>
            <span className="text-zinc-500 mb-1">/ {weeklyTarget.toLocaleString()} kcal</span>
          </div>

          <div className="w-full bg-zinc-950 rounded-full h-4 mb-6 border border-zinc-800/50">
            <div 
              className={`h-full rounded-full transition-all duration-1000 ${currentWeekConsumed > weeklyTarget ? 'bg-red-500' : 'bg-emerald-500'}`} 
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          <div className="grid grid-cols-7 gap-2 h-24 items-end">
            {currentWeekData.map((dayData, idx) => {
              const dayHeight = Math.min((dayData.total / dailyTarget) * 100, 100);
              const isOver = dayData.total > dailyTarget;
              const isToday = dayData.date === getTodayStr();
              
              return (
                <div key={idx} className="flex flex-col items-center gap-2 h-full justify-end">
                  <div className="w-full relative bg-zinc-950 rounded-t-lg h-full flex items-end overflow-hidden">
                    <div 
                      className={`w-full transition-all ${isOver ? 'bg-red-500/80' : 'bg-emerald-500/80'} ${dayData.total === 0 ? 'bg-transparent' : ''}`}
                      style={{ height: `${dayHeight}%` }}
                    />
                  </div>
                  <span className={`text-xs font-bold ${isToday ? 'text-white' : 'text-zinc-600'}`}>{dayLabels[idx]}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <h3 className="text-zinc-400 font-bold mb-4 flex items-center gap-2">
        <History size={18} /> Semanas Anteriores
      </h3>
      
      <div className="space-y-3">
        {historyWeeks.map((week, idx) => (
          <div key={idx} className="bg-zinc-900/50 border border-zinc-800 p-4 rounded-xl flex items-center justify-between">
            <div>
              <p className="text-zinc-300 font-medium text-sm">
                {week.startDate.getDate()}/{week.startDate.getMonth()+1} - {week.endDate.getDate()}/{week.endDate.getMonth()+1}
              </p>
              {week.status !== 'no_data' ? (
                <p className="text-xs text-zinc-500 mt-1">
                  {week.total.toLocaleString()} / {week.target.toLocaleString()} kcal
                </p>
              ) : (
                <p className="text-xs text-zinc-600 italic mt-1">Sin registros</p>
              )}
            </div>
            
            <div className="flex items-center">
              {week.status === 'success' && <div className="text-emerald-500 flex items-center gap-1 bg-emerald-500/10 px-3 py-1 rounded-full"><CheckCircle2 size={16}/> <span className="text-xs font-bold">Logrado</span></div>}
              {week.status === 'fail' && <div className="text-red-500 flex items-center gap-1 bg-red-500/10 px-3 py-1 rounded-full"><XCircle size={16}/> <span className="text-xs font-bold">Fallido</span></div>}
              {week.status === 'neutral' && <span className="text-zinc-600">-</span>}
              {week.status === 'no_data' && <span className="text-zinc-700 text-xs">-</span>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// 3. Calendario
interface CalendarProps {
  onSelectDate: (date: string) => void;
  onBack: () => void;
}

const CalendarView: React.FC<CalendarProps> = ({ onSelectDate, onBack }) => {
  const [currentDate] = useState(new Date()); // Se eliminó setCurrentDate porque no se usaba
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, month, 1).getDay(); 
  const startDay = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1; 
  const today = new Date();
  const isCurrentMonth = today.getMonth() === month && today.getFullYear() === year;

  const handleDayClick = (day: number) => {
    const clickedDate = new Date(year, month, day);
    const offset = clickedDate.getTimezoneOffset();
    const dateLocal = new Date(clickedDate.getTime() - (offset*60*1000));
    const dateStr = dateLocal.toISOString().split('T')[0];
    onSelectDate(dateStr);
  };

  const monthNames = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];

  return (
    <div className="min-h-screen bg-zinc-950 p-6 flex flex-col">
      <div className="flex items-center justify-between mb-8">
        <button onClick={onBack} className="p-2 bg-zinc-900 rounded-full text-zinc-400 hover:text-white">
          <ArrowLeft size={24} />
        </button>
        <h2 className="text-2xl font-bold text-white capitalize">
          {monthNames[month]} <span className="text-emerald-500">{year}</span>
        </h2>
        <div className="w-10"></div>
      </div>

      <div className="grid grid-cols-7 gap-2 mb-4 text-center">
        {['L', 'M', 'M', 'J', 'V', 'S', 'D'].map((d, i) => (
          <div key={i} className="text-zinc-500 font-bold text-sm">{d}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-3 auto-rows-fr flex-1 content-start">
        {Array.from({ length: startDay }).map((_, i) => (
          <div key={`empty-${i}`} className="aspect-square" />
        ))}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1;
          const isToday = isCurrentMonth && day === today.getDate();
          return (
            <button
              key={day}
              onClick={() => handleDayClick(day)}
              className={`
                aspect-square rounded-2xl flex flex-col items-center justify-center relative transition-all
                ${isToday ? 'bg-emerald-500 text-zinc-950 shadow-lg shadow-emerald-500/20 scale-105 font-bold z-10' : 'bg-zinc-900 text-zinc-400 hover:bg-zinc-800'}
              `}
            >
              <span className="text-lg">{day}</span>
              {isToday && <span className="text-[10px] uppercase font-bold mt-1">Hoy</span>}
            </button>
          );
        })}
      </div>
      
      <div className="mt-auto pt-6 text-center text-zinc-500 text-sm">
        Toca un día para ver o editar el registro.
      </div>
    </div>
  );
};

// 4. Setup de Usuario
interface UserSetupProps {
  userData: UserData | null;
  onSave: (data: UserData) => void;
  onBack: (() => void) | null;
}

const UserSetup: React.FC<UserSetupProps> = ({ userData, onSave, onBack }) => {
  const [formData, setFormData] = useState<UserData>(userData || {
    weight: '',
    height: '',
    age: '',
    gender: 'male',
    activity: '1.2',
    goal: 'maintain'
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.weight || !formData.height || !formData.age) return;
    onSave(formData);
  };

  return (
    <div className="animate-fade-in p-6 max-w-md mx-auto min-h-screen flex flex-col">
      <div className="flex items-center gap-4 mb-8 pt-4">
        {onBack && (
          <button onClick={onBack} className="p-2 bg-zinc-900 rounded-full text-zinc-400 hover:text-white">
            <ArrowLeft size={20} />
          </button>
        )}
        <h1 className="text-2xl font-bold text-white">Configurar Perfil</h1>
      </div>

      <form onSubmit={handleSubmit} className="flex-1 flex flex-col justify-center">
        <div className="grid grid-cols-2 gap-4">
          <Input label="Peso (kg)" name="weight" type="number" value={formData.weight} onChange={handleChange} placeholder="70" />
          <Input label="Altura (cm)" name="height" type="number" value={formData.height} onChange={handleChange} placeholder="175" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Input label="Edad" name="age" type="number" value={formData.age} onChange={handleChange} placeholder="25" />
          <Select label="Género" name="gender" value={formData.gender} onChange={handleChange} options={[{ value: 'male', label: 'Hombre' }, { value: 'female', label: 'Mujer' }]} />
        </div>
        <Select label="Nivel de Actividad" name="activity" value={formData.activity} onChange={handleChange} options={[{ value: '1.2', label: 'Sedentario (Poco o nada)' }, { value: '1.375', label: 'Ligero (1-3 días/sem)' }, { value: '1.55', label: 'Moderado (3-5 días/sem)' }, { value: '1.725', label: 'Activo (6-7 días/sem)' }, { value: '1.9', label: 'Muy Activo (Físico intenso)' }]} />
        <Select label="Objetivo" name="goal" value={formData.goal} onChange={handleChange} options={[{ value: 'lose', label: 'Perder Peso (Déficit)' }, { value: 'maintain', label: 'Mantener Peso' }, { value: 'gain', label: 'Ganar Peso (Superávit)' }]} />
        <div className="mt-8">
          <Button type="submit">Guardar y Volver <ChevronRight size={20} /></Button>
        </div>
      </form>
    </div>
  );
};

// 5. Modal Agregar Comida
interface AddFoodProps {
  onClose: () => void;
  onAdd: (item: LogItem) => void;
}

const AddFoodModal: React.FC<AddFoodProps> = ({ onClose, onAdd }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFood, setSelectedFood] = useState<FoodItemDB | null>(null);
  const [amount, setAmount] = useState('');
  const [mode, setMode] = useState<'search' | 'manual'>('search');

  const filteredFoods = useMemo(() => {
    return COMMON_FOODS.filter(f => f.name.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [searchTerm]);

  const handleAdd = () => {
    if (selectedFood && amount) {
      const cals = Math.round(selectedFood.calPerUnit * parseFloat(amount));
      onAdd({ name: selectedFood.name, amount: parseFloat(amount), unit: selectedFood.unit, calories: cals });
      onClose();
    }
  };

  const handleManualAdd = (manualData: LogItem) => {
    onAdd(manualData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-zinc-900 w-full max-w-md rounded-3xl overflow-hidden border border-zinc-800 shadow-2xl animate-slide-up">
        <div className="p-4 border-b border-zinc-800 flex justify-between items-center bg-zinc-900/50">
          <h2 className="text-lg font-bold text-white">Agregar Alimento</h2>
          <button onClick={onClose} className="text-zinc-400 hover:text-white p-2">✕</button>
        </div>
        <div className="flex p-2 gap-2 bg-zinc-950/30">
          <button onClick={() => setMode('search')} className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${mode === 'search' ? 'bg-zinc-800 text-white' : 'text-zinc-500'}`}>Buscar</button>
          <button onClick={() => setMode('manual')} className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${mode === 'manual' ? 'bg-zinc-800 text-white' : 'text-zinc-500'}`}>Manual</button>
        </div>
        <div className="p-4 min-h-[300px]">
          {mode === 'search' ? (
            <>
              {!selectedFood ? (
                <>
                  <div className="relative mb-4">
                    <Search className="absolute left-3 top-3 text-zinc-500" size={20} />
                    <input autoFocus placeholder="Buscar (ej. Arroz...)" className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-10 pr-4 py-3 text-white focus:ring-2 focus:ring-emerald-500/50 outline-none" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                  </div>
                  <div className="space-y-2 max-h-[250px] overflow-y-auto custom-scrollbar">
                    {filteredFoods.map((food, idx) => (
                      <button key={idx} onClick={() => setSelectedFood(food)} className="w-full text-left p-3 rounded-xl hover:bg-zinc-800 flex justify-between items-center group transition-colors">
                        <span className="text-zinc-200">{food.name}</span>
                        <span className="text-xs text-zinc-500 group-hover:text-emerald-400">{food.calPerUnit} cal/{food.unit}</span>
                      </button>
                    ))}
                  </div>
                </>
              ) : (
                <div className="animate-fade-in">
                  <div className="flex items-center gap-2 mb-6 text-zinc-400 cursor-pointer hover:text-white" onClick={() => setSelectedFood(null)}><ArrowLeft size={16} /> Volver a buscar</div>
                  <h3 className="text-xl font-bold text-white mb-1">{selectedFood.name}</h3>
                  <p className="text-emerald-400 text-sm mb-6">{selectedFood.calPerUnit} cal por {selectedFood.unit}</p>
                  <Input label={`Cantidad (${selectedFood.unit})`} type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0" autoFocus />
                  <div className="mt-4 p-4 bg-zinc-950 rounded-xl mb-6 flex justify-between items-center border border-zinc-800">
                    <span className="text-zinc-400">Total Calorías:</span>
                    <span className="text-2xl font-bold text-white">{amount ? Math.round(selectedFood.calPerUnit * parseFloat(amount)) : 0}</span>
                  </div>
                  <Button onClick={handleAdd}>Agregar</Button>
                </div>
              )}
            </>
          ) : (
             <form onSubmit={(e) => { 
                e.preventDefault(); 
                const fd = new FormData(e.currentTarget); // Corregido para TS
                handleManualAdd({ 
                  name: fd.get('name') as string, 
                  amount: 1, 
                  unit: 'porción', 
                  calories: parseInt(fd.get('cals') as string) 
                }) 
              }} className="animate-fade-in">
               <Input label="Nombre" name="name" required placeholder="Ej. Hamburguesa" />
               <Input label="Calorías" name="cals" type="number" required placeholder="500" />
               <Button type="submit" className="mt-4">Guardar</Button>
             </form>
          )}
        </div>
      </div>
    </div>
  );
};

// 6. Vista Diaria (Daily Log)
interface DailyLogProps {
  user: UserData | null;
  log: LogItem[];
  dateStr: string;
  onAddFood: (item: LogItem) => void;
  onDeleteFood: (index: number) => void;
  onBack: () => void;
}

const DailyLogView: React.FC<DailyLogProps> = ({ user, log, dateStr, onAddFood, onDeleteFood, onBack }) => {
  const [showAddModal, setShowAddModal] = useState(false);

  const calculateTargets = () => {
    if (!user) return 2000;
    let bmr;
    const weight = parseFloat(user.weight);
    const height = parseFloat(user.height);
    const age = parseFloat(user.age);
    if (user.gender === 'male') bmr = (10 * weight) + (6.25 * height) - (5 * age) + 5;
    else bmr = (10 * weight) + (6.25 * height) - (5 * age) - 161;
    const tdee = bmr * parseFloat(user.activity);
    let target = tdee;
    if (user.goal === 'lose') target = tdee - 500;
    if (user.goal === 'gain') target = tdee + 500;
    return Math.round(target);
  };

  const targetCalories = useMemo(calculateTargets, [user]);
  const consumedCalories = useMemo(() => log.reduce((acc, curr) => acc + curr.calories, 0), [log]);
  const remainingCalories = targetCalories - consumedCalories;
  const progress = Math.min((consumedCalories / targetCalories) * 100, 100);

  const [y, m, d] = dateStr.split('-');
  const dateObj = new Date(parseInt(y), parseInt(m) - 1, parseInt(d));
  const dateDisplay = dateObj.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' });

  return (
    <div className="min-h-screen bg-zinc-950 pb-24 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-zinc-900 to-zinc-950 -z-10" />

      {/* Header */}
      <div className="px-4 pt-8 pb-4 flex items-center gap-4">
        <button onClick={onBack} className="p-2 bg-zinc-900/50 rounded-full text-zinc-200 border border-zinc-800">
          <ArrowLeft size={20} />
        </button>
        <div className="flex-1">
          <h2 className="text-lg font-bold text-white capitalize">{dateDisplay}</h2>
          <p className="text-zinc-400 text-xs">Registro diario</p>
        </div>
      </div>

      <div className="mx-4 mb-6">
        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 shadow-xl relative overflow-hidden">
          <div className="flex justify-between items-center z-10 relative">
            <div>
              <p className="text-zinc-400 text-sm font-medium uppercase tracking-wider mb-1">Restantes</p>
              <h2 className={`text-4xl font-bold ${remainingCalories < 0 ? 'text-red-400' : 'text-white'}`}>
                {remainingCalories}
                <span className="text-lg text-zinc-500 font-normal ml-1">kcal</span>
              </h2>
              <div className="mt-4 flex gap-6">
                <div>
                  <p className="text-xs text-zinc-500 mb-1 flex items-center gap-1"><Utensils size={10}/> Consumidas</p>
                  <p className="text-lg font-semibold text-white">{consumedCalories}</p>
                </div>
                <div>
                  <p className="text-xs text-zinc-500 mb-1 flex items-center gap-1"><Activity size={10}/> Meta</p>
                  <p className="text-lg font-semibold text-zinc-300">{targetCalories}</p>
                </div>
              </div>
            </div>
            
            <div className="relative w-24 h-24 flex items-center justify-center">
               <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                  <path className="text-zinc-800" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3" />
                  <path className={progress > 100 ? "text-red-500" : "text-emerald-500"} strokeDasharray={`${progress}, 100`} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center flex-col">
                  <Flame size={20} className={progress > 100 ? "text-red-500" : "text-emerald-500"} fill="currentColor" />
                </div>
            </div>
          </div>
        </div>
      </div>

      <div className="px-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-white">Comidas</h3>
          <span className="text-xs bg-zinc-800 text-zinc-400 px-2 py-1 rounded-lg">{log.length}</span>
        </div>
        <div className="space-y-3 pb-20">
          {log.length === 0 ? (
            <div className="text-center py-10 bg-zinc-900/50 rounded-3xl border border-zinc-800/50 border-dashed">
              <div className="w-12 h-12 bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-3">
                <Utensils className="text-zinc-600" />
              </div>
              <p className="text-zinc-500 text-sm">Sin registros hoy.</p>
              <button onClick={() => setShowAddModal(true)} className="text-emerald-500 text-sm mt-2 hover:underline">Agregar primera comida</button>
            </div>
          ) : (
            log.map((item, index) => (
              <div key={index} className="bg-zinc-900 border border-zinc-800 p-4 rounded-2xl flex justify-between items-center group">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-400">
                    {item.name.toLowerCase().includes('manzana') ? '🍎' : '🍽️'}
                  </div>
                  <div>
                    <h4 className="text-zinc-200 font-medium">{item.name}</h4>
                    <p className="text-xs text-zinc-500">{item.amount} {item.unit}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="font-bold text-white">{item.calories} <span className="text-xs font-normal text-zinc-500">kcal</span></span>
                  <button onClick={() => onDeleteFood(index)} className="p-2 text-zinc-600 hover:text-red-400 rounded-lg"><Trash2 size={16} /></button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="fixed bottom-6 left-0 w-full px-4 flex justify-center z-40 pointer-events-none">
         <button onClick={() => setShowAddModal(true)} className="pointer-events-auto bg-emerald-500 text-zinc-950 rounded-full px-6 py-4 shadow-lg shadow-emerald-500/30 flex items-center gap-2 font-bold hover:bg-emerald-400 transition-all active:scale-95">
            <Plus size={24} /> Agregar Alimento
          </button>
      </div>

      {showAddModal && <AddFoodModal onClose={() => setShowAddModal(false)} onAdd={onAddFood} />}
    </div>
  );
};

// --- COMPONENTE RAÍZ ---
export default function App() {
  const [view, setView] = useState('loading'); // loading, setup, home, calendar, dailylog, goals
  const [userData, setUserData] = useState<UserData | null>(null);
  const [allLogs, setAllLogs] = useState<LogsMap>({});
  const [selectedDate, setSelectedDate] = useState(getTodayStr());

  // Cargar datos
  useEffect(() => {
    const savedUser = localStorage.getItem('calotrack_user');
    const savedAllLogs = localStorage.getItem('calotrack_all_logs');
    
    // Migración simple para versión antigua
    const legacyLog = localStorage.getItem('calotrack_log');
    let initialLogs: LogsMap = {};

    if (savedAllLogs) {
      initialLogs = JSON.parse(savedAllLogs);
    } else if (legacyLog) {
      initialLogs[getTodayStr()] = JSON.parse(legacyLog);
    }

    setAllLogs(initialLogs);

    if (savedUser) {
      setUserData(JSON.parse(savedUser));
    }
    
    // CAMBIO: Siempre ir al HOME, tenga datos o no
    setView('home'); 

  }, []);

  // Guardar logs
  useEffect(() => {
    if (Object.keys(allLogs).length > 0) {
      localStorage.setItem('calotrack_all_logs', JSON.stringify(allLogs));
    }
  }, [allLogs]);

  const handleSaveUser = (data: UserData) => {
    setUserData(data);
    localStorage.setItem('calotrack_user', JSON.stringify(data));
    setView('home');
  };

  const currentLog = allLogs[selectedDate] || [];

  const handleAddFood = (foodItem: LogItem) => {
    setAllLogs(prev => ({
      ...prev,
      [selectedDate]: [foodItem, ...(prev[selectedDate] || [])]
    }));
  };

  const handleDeleteFood = (indexToDelete: number) => {
    setAllLogs(prev => ({
      ...prev,
      [selectedDate]: prev[selectedDate].filter((_, idx) => idx !== indexToDelete)
    }));
  };

  if (view === 'loading') return <div className="min-h-screen bg-zinc-950 flex items-center justify-center text-emerald-500"><Activity className="animate-bounce" /></div>;

  return (
    <div className="font-sans text-zinc-100 bg-zinc-950 min-h-screen selection:bg-emerald-500/30">
      <StyleInjector /> {/* Inyector automático de estilos y fuente */}
      
      {view === 'home' && (
        <HomeScreen 
          onNavigate={(screen) => setView(screen)} 
        />
      )}

      {view === 'setup' && (
        <UserSetup 
          userData={userData}
          onSave={handleSaveUser}
          onBack={userData ? () => setView('home') : null}
        />
      )}

      {view === 'calendar' && (
        <CalendarView 
          onSelectDate={(date) => {
            setSelectedDate(date);
            setView('dailylog');
          }}
          onBack={() => setView('home')}
        />
      )}
      
      {view === 'dailylog' && (
        <DailyLogView 
          user={userData} 
          log={currentLog}
          dateStr={selectedDate}
          onAddFood={handleAddFood} 
          onDeleteFood={handleDeleteFood}
          onBack={() => setView('calendar')}
        />
      )}

      {view === 'goals' && (
        <WeeklyGoalView 
          user={userData} 
          allLogs={allLogs} 
          onBack={() => setView('home')} 
        />
      )}
    </div>
  );
}