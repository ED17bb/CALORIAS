import React, { useState, useEffect, useMemo } from 'react';
import { 
  Activity, 
  Utensils, 
  Plus, 
  Trash2, 
  ChevronRight, 
  Flame, 
  User, 
  ArrowLeft,
  Search,
  Calendar as CalendarIcon,
  Target,
  CheckCircle2,
  Save,
  Scale,
  PieChart
} from 'lucide-react';

// --- INTERFACES ---
interface FoodItemDB {
  name: string;
  unit: string;
  calPerUnit: number;
  stdPortion?: number; // Cantidad que representa una "porción estándar" (ej. 150g)
  isCustom?: boolean;
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

    // 2. Configurar Tailwind
    const script = document.createElement('script');
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

    // 3. Estilos Base
    document.body.style.backgroundColor = '#09090b';
    document.body.style.color = 'white';
    document.body.style.fontFamily = "'Inter', sans-serif";

    // 4. Meta Tags
    const setMetaTags = () => {
      let metaTheme = document.querySelector("meta[name='theme-color']") as HTMLMetaElement;
      if (!metaTheme) {
        metaTheme = document.createElement('meta');
        metaTheme.name = 'theme-color';
        document.head.appendChild(metaTheme);
      }
      metaTheme.content = '#09090b';
    };
    setMetaTags();
    
    document.title = "CaloTrack - Ernesto Edition";

  }, []);

  return null;
};

// --- BASE DE DATOS INICIAL CON PORCIONES ESTÁNDAR ---
const COMMON_FOODS: FoodItemDB[] = [
  // --- ARGENTINA 🇦🇷 ---
  { name: 'Milanesa de Carne (Frita)', unit: 'unidad', calPerUnit: 350, stdPortion: 1 },
  { name: 'Milanesa de Pollo (Horno)', unit: 'unidad', calPerUnit: 220, stdPortion: 1 },
  { name: 'Choripán (Clásico)', unit: 'unidad', calPerUnit: 450, stdPortion: 1 },
  { name: 'Empanada Argentina (Carne)', unit: 'unidad', calPerUnit: 280, stdPortion: 1 },
  { name: 'Empanada JyQ (Frita)', unit: 'unidad', calPerUnit: 310, stdPortion: 1 },
  { name: 'Medialuna (Manteca)', unit: 'unidad', calPerUnit: 180, stdPortion: 1 },
  { name: 'Medialuna (Grasa)', unit: 'unidad', calPerUnit: 140, stdPortion: 1 },
  { name: 'Alfajor de Chocolate (Simple)', unit: 'unidad', calPerUnit: 250, stdPortion: 1 },
  { name: 'Alfajor Triple', unit: 'unidad', calPerUnit: 450, stdPortion: 1 },
  { name: 'Dulce de Leche', unit: 'cucharada', calPerUnit: 60, stdPortion: 1 },
  { name: 'Provoleta (Rodaja)', unit: 'unidad', calPerUnit: 300, stdPortion: 1 },
  { name: 'Matambre a la Pizza', unit: 'porción', calPerUnit: 420, stdPortion: 1 },
  { name: 'Locro Criollo', unit: 'plato', calPerUnit: 550, stdPortion: 1 },
  { name: 'Fainá', unit: 'porción', calPerUnit: 180, stdPortion: 1 },
  { name: 'Sándwich de Miga (Simple)', unit: 'unidad', calPerUnit: 150, stdPortion: 1 },

  // --- VENEZUELA 🇻🇪 ---
  { name: 'Arepa Viuda (Sola)', unit: 'unidad', calPerUnit: 280, stdPortion: 1 },
  { name: 'Arepa Reina Pepiada', unit: 'unidad', calPerUnit: 550, stdPortion: 1 },
  { name: 'Arepa Pelúa (Carne/Queso)', unit: 'unidad', calPerUnit: 520, stdPortion: 1 },
  { name: 'Arepa Sifrina', unit: 'unidad', calPerUnit: 580, stdPortion: 1 },
  { name: 'Pabellón Criollo (Plato)', unit: 'plato', calPerUnit: 750, stdPortion: 1 },
  { name: 'Cachapa con Queso', unit: 'unidad', calPerUnit: 450, stdPortion: 1 },
  { name: 'Tequeño (Frito)', unit: 'unidad', calPerUnit: 320, stdPortion: 1 },
  { name: 'Hallaca', unit: 'unidad', calPerUnit: 600, stdPortion: 1 },
  { name: 'Pan de Jamón', unit: 'rebanada', calPerUnit: 280, stdPortion: 1 },
  { name: 'Tajadas (Plátano Frito)', unit: 'porción', calPerUnit: 200, stdPortion: 1 },
  { name: 'Pastelito Andino', unit: 'unidad', calPerUnit: 220, stdPortion: 1 },
  { name: 'Empanada Venezolana (Carne Mechada)', unit: 'unidad', calPerUnit: 350, stdPortion: 1 },
  { name: 'Patacón (Relleno)', unit: 'unidad', calPerUnit: 650, stdPortion: 1 },

  // --- PROTEÍNAS GENERALES ---
  { name: 'Pechuga de Pollo (Cocida)', unit: 'g', calPerUnit: 1.65, stdPortion: 150 },
  { name: 'Carne de Res (Magra)', unit: 'g', calPerUnit: 2.50, stdPortion: 150 },
  { name: 'Carne Molida (5%)', unit: 'g', calPerUnit: 1.37, stdPortion: 150 },
  { name: 'Chuleta de Cerdo', unit: 'g', calPerUnit: 2.31, stdPortion: 150 },
  { name: 'Pescado Blanco', unit: 'g', calPerUnit: 0.96, stdPortion: 200 },
  { name: 'Salmón (Cocido)', unit: 'g', calPerUnit: 2.08, stdPortion: 150 },
  { name: 'Atún en Agua', unit: 'g', calPerUnit: 1.16, stdPortion: 120 },
  { name: 'Huevo (Hervido)', unit: 'unidad', calPerUnit: 78, stdPortion: 2 },
  { name: 'Huevo Frito', unit: 'unidad', calPerUnit: 90, stdPortion: 2 },
  { name: 'Claras de Huevo', unit: 'unidad', calPerUnit: 17, stdPortion: 5 },
  { name: 'Jamón de Pavo', unit: 'rebanada', calPerUnit: 30, stdPortion: 3 },
  
  // --- CARBOHIDRATOS ---
  { name: 'Arroz Blanco', unit: 'g', calPerUnit: 1.30, stdPortion: 150 },
  { name: 'Arroz Integral', unit: 'g', calPerUnit: 1.11, stdPortion: 150 },
  { name: 'Pasta / Espagueti', unit: 'g', calPerUnit: 1.31, stdPortion: 150 },
  { name: 'Pan Blanco', unit: 'rebanada', calPerUnit: 67, stdPortion: 2 },
  { name: 'Pan Integral', unit: 'rebanada', calPerUnit: 80, stdPortion: 2 },
  { name: 'Avena', unit: 'g', calPerUnit: 3.89, stdPortion: 40 },
  { name: 'Papa (Hervida)', unit: 'g', calPerUnit: 0.87, stdPortion: 200 },
  { name: 'Batata / Camote', unit: 'g', calPerUnit: 0.86, stdPortion: 200 },
  { name: 'Frijoles / Caraotas', unit: 'g', calPerUnit: 1.32, stdPortion: 150 },
  
  // --- GRASAS ---
  { name: 'Aceite de Oliva', unit: 'cucharada', calPerUnit: 119, stdPortion: 1 },
  { name: 'Mantequilla', unit: 'cucharada', calPerUnit: 102, stdPortion: 1 },
  { name: 'Palta / Aguacate', unit: 'g', calPerUnit: 1.60, stdPortion: 50 },
  { name: 'Maní / Cacahuates', unit: 'g', calPerUnit: 5.67, stdPortion: 30 },
  { name: 'Almendras', unit: 'g', calPerUnit: 5.79, stdPortion: 30 },
  { name: 'Queso Mozzarella', unit: 'g', calPerUnit: 2.80, stdPortion: 30 },
  
  // --- FRUTAS Y VERDURAS ---
  { name: 'Manzana', unit: 'unidad', calPerUnit: 95, stdPortion: 1 },
  { name: 'Banana / Cambur', unit: 'unidad', calPerUnit: 105, stdPortion: 1 },
  { name: 'Naranja', unit: 'unidad', calPerUnit: 62, stdPortion: 1 },
  { name: 'Fresas', unit: 'g', calPerUnit: 0.32, stdPortion: 150 },
  { name: 'Tomate', unit: 'g', calPerUnit: 0.18, stdPortion: 100 },
  { name: 'Lechuga', unit: 'g', calPerUnit: 0.15, stdPortion: 50 },
  
  // --- OTROS SNACKS ---
  { name: 'Pizza (Muzzarella)', unit: 'porción', calPerUnit: 280, stdPortion: 2 },
  { name: 'Hamburguesa (Simple)', unit: 'unidad', calPerUnit: 500, stdPortion: 1 },
  { name: 'Papas Fritas', unit: 'porción', calPerUnit: 365, stdPortion: 1 },
  { name: 'Cerveza (Lata)', unit: 'unidad', calPerUnit: 153, stdPortion: 1 },
  { name: 'Coca-Cola (Vaso)', unit: 'unidad', calPerUnit: 140, stdPortion: 1 },
  { name: 'Café con Leche', unit: 'taza', calPerUnit: 80, stdPortion: 1 },
  { name: 'Fernet con Coca', unit: 'vaso', calPerUnit: 280, stdPortion: 1 },
];

// --- UTILIDADES ---
const getTodayStr = (): string => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

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
    
    const year = nextDay.getFullYear();
    const month = String(nextDay.getMonth() + 1).padStart(2, '0');
    const day = String(nextDay.getDate()).padStart(2, '0');
    week.push(`${year}-${month}-${day}`);
  }
  return week;
};

// --- COMPONENTES UI ---

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

      <div className="mb-12 text-center z-10">
        <div className="w-32 h-32 mx-auto flex items-center justify-center mb-6 bg-zinc-900 rounded-full shadow-2xl shadow-emerald-500/10 border border-zinc-800">
           <Flame size={64} className="text-emerald-500" />
        </div>
        <h1 className="text-5xl font-extrabold text-white mb-2 tracking-tight">QUE CALOR IA</h1>
        <p className="text-zinc-400 text-lg">Anota todo lo que comes, dale</p>
      </div>

      <div className="w-full max-w-sm space-y-4 z-10">
        <Button onClick={() => onNavigate('setup')} variant="secondary" className="bg-zinc-900 border-zinc-800">
          <User size={24} className="text-emerald-500" />
          Configurar Perfil
        </Button>

        <Button onClick={() => onNavigate('dailylog')} variant="primary">
          <Utensils size={24} />
          Registro de Hoy
        </Button>

        <Button onClick={() => onNavigate('calendar')} variant="secondary" className="bg-zinc-900 border-zinc-800">
          <CalendarIcon size={24} className="text-zinc-400" />
          Calendario
        </Button>
        
        <Button onClick={() => onNavigate('goals')} variant="outline">
          <Target size={24} />
          Objetivo Semanal
        </Button>
      </div>

      <p className="mt-12 text-zinc-600 text-sm z-10">v2.5.1 • Ernesto Edition</p>
    </div>
  );
};

// 2. Objetivo Semanal
interface WeeklyGoalProps {
  user: UserData | null;
  allLogs: LogsMap;
}

const WeeklyGoalView: React.FC<WeeklyGoalProps> = ({ user, allLogs }) => {
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
  const dayLabels = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];

  return (
    <div className="min-h-screen bg-zinc-950 p-6 flex flex-col max-w-lg mx-auto">
       <div className="flex items-center gap-4 mb-8">
        <button onClick={() => window.history.back()} className="p-2 bg-zinc-900 rounded-full text-zinc-400 hover:text-white transition-colors">
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
              const dayHeight = Math.min((dayData.total / (dailyTarget * 1.2)) * 100, 100);
              const isOver = dayData.total > dailyTarget;
              const isToday = dayData.date === getTodayStr();
              
              return (
                <div key={idx} className="flex flex-col items-center gap-2 h-full justify-end">
                  <div className="w-full relative bg-zinc-950 rounded-t-lg h-full flex items-end overflow-hidden">
                    <div 
                      className={`w-full rounded-t-sm transition-all ${isOver ? 'bg-red-500/80' : 'bg-emerald-500/80'} ${dayData.total === 0 ? 'bg-transparent' : ''}`}
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

      <div className="bg-zinc-900/50 border border-zinc-800 p-4 rounded-xl flex items-center gap-4">
        <div className="p-3 bg-zinc-800 rounded-full text-emerald-500">
          <CheckCircle2 size={24} />
        </div>
        <div>
          <h4 className="font-bold text-white">Objetivo Diario</h4>
          <p className="text-sm text-zinc-400">{dailyTarget.toLocaleString()} kcal para {user?.goal === 'lose' ? 'perder peso' : user?.goal === 'gain' ? 'ganar masa' : 'mantenerte'}.</p>
        </div>
      </div>
    </div>
  );
};

// 3. Calendario
interface CalendarProps {
  onSelectDate: (date: string) => void;
}

const CalendarView: React.FC<CalendarProps> = ({ onSelectDate }) => {
  const [currentDate] = useState(new Date());
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, month, 1).getDay(); 
  const startDay = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1; 
  const today = new Date();
  const isCurrentMonth = today.getMonth() === month && today.getFullYear() === year;

  const handleDayClick = (day: number) => {
    const mStr = String(month + 1).padStart(2, '0');
    const dStr = String(day).padStart(2, '0');
    const dateStr = `${year}-${mStr}-${dStr}`;
    onSelectDate(dateStr);
  };

  const monthNames = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];

  return (
    <div className="min-h-screen bg-zinc-950 p-6 flex flex-col max-w-lg mx-auto">
      <div className="flex items-center justify-between mb-8">
        <button onClick={() => window.history.back()} className="p-2 bg-zinc-900 rounded-full text-zinc-400 hover:text-white transition-colors">
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
          <button onClick={() => window.history.back()} className="p-2 bg-zinc-900 rounded-full text-zinc-400 hover:text-white transition-colors">
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
  foodDatabase: FoodItemDB[]; // Recibe la DB dinámica
  onSaveNewFood: (newFood: FoodItemDB) => void; // Función para guardar en DB
}

const AddFoodModal: React.FC<AddFoodProps> = ({ onClose, onAdd, foodDatabase, onSaveNewFood }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFood, setSelectedFood] = useState<FoodItemDB | null>(null);
  
  // Default es 'portions'
  const [measureMode, setMeasureMode] = useState<'portions' | 'exact'>('portions');
  const [amount, setAmount] = useState(''); // Para modo exacto
  const [portions, setPortions] = useState(1); // Para modo porciones

  const [mode, setMode] = useState<'search' | 'manual'>('search');

  // Estado para el modo manual extendido
  const [manualName, setManualName] = useState('');
  const [manualTotalCals, setManualTotalCals] = useState('');
  const [manualAmount, setManualAmount] = useState('');
  const [manualUnit, setManualUnit] = useState('');
  const [saveToDB, setSaveToDB] = useState(false);

  const filteredFoods = useMemo(() => {
    const normalizeText = (text: string) => {
      return text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
    };
    const term = normalizeText(searchTerm);
    return foodDatabase.filter(f => normalizeText(f.name).includes(term));
  }, [searchTerm, foodDatabase]);

  const handleAddSearch = () => {
    if (!selectedFood) return;

    let finalAmount = 0;
    let finalCals = 0;

    if (measureMode === 'exact' && amount) {
      finalAmount = parseFloat(amount);
      finalCals = Math.round(selectedFood.calPerUnit * finalAmount);
    } else if (measureMode === 'portions') {
      const stdPortion = selectedFood.stdPortion || (selectedFood.unit === 'g' || selectedFood.unit === 'ml' ? 100 : 1);
      finalAmount = stdPortion * portions;
      finalCals = Math.round(selectedFood.calPerUnit * finalAmount);
    }

    if (finalAmount > 0) {
      onAdd({ 
        name: selectedFood.name, 
        amount: finalAmount, 
        unit: selectedFood.unit, 
        calories: finalCals 
      });
      onClose();
    }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualName || !manualTotalCals) return;

    const totalCals = parseInt(manualTotalCals);
    // Si no pone cantidad, asumimos 1 porción
    const finalAmount = manualAmount ? parseFloat(manualAmount) : 1;
    const finalUnit = manualUnit || 'porción';

    // Agregar al log de hoy
    onAdd({
      name: manualName,
      amount: finalAmount,
      unit: finalUnit,
      calories: totalCals
    });

    // Guardar en la base de datos si el usuario quiere
    if (saveToDB) {
      const calPerUnit = totalCals / finalAmount;
      onSaveNewFood({
        name: manualName,
        unit: finalUnit,
        calPerUnit: parseFloat(calPerUnit.toFixed(2)),
        // Si guarda manual, asumimos que esa cantidad es una "porción estándar" para futuras referencias
        stdPortion: finalAmount, 
        isCustom: true
      });
    }

    onClose();
  };

  // Reset al cambiar de alimento
  useEffect(() => {
    setAmount('');
    setPortions(1);
    setMeasureMode('portions'); 
  }, [selectedFood]);

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
                    <input autoFocus placeholder="Buscar (ej. Arepa, Milanesa...)" className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-10 pr-4 py-3 text-white focus:ring-2 focus:ring-emerald-500/50 outline-none" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                  </div>
                  <div className="space-y-2 max-h-[250px] overflow-y-auto custom-scrollbar">
                    {filteredFoods.map((food, idx) => (
                      <button key={idx} onClick={() => setSelectedFood(food)} className="w-full text-left p-3 rounded-xl hover:bg-zinc-800 flex justify-between items-center group transition-colors">
                        <div className="flex flex-col">
                          <span className="text-zinc-200 font-medium">{food.name}</span>
                          {food.isCustom && <span className="text-[10px] text-emerald-500/80 uppercase font-bold tracking-wider">Guardado por ti</span>}
                        </div>
                        <span className="text-xs text-zinc-500 group-hover:text-emerald-400">{food.calPerUnit} cal/{food.unit}</span>
                      </button>
                    ))}
                    {filteredFoods.length === 0 && (
                       <div className="text-center text-zinc-500 py-4 text-sm">
                         No encontrado. ¿Prueba en Manual?
                       </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="animate-fade-in">
                  <div className="flex items-center gap-2 mb-6 text-zinc-400 cursor-pointer hover:text-white" onClick={() => setSelectedFood(null)}><ArrowLeft size={16} /> Volver a buscar</div>
                  
                  <h3 className="text-xl font-bold text-white mb-1">{selectedFood.name}</h3>
                  <p className="text-emerald-400 text-sm mb-6">{selectedFood.calPerUnit} cal por {selectedFood.unit}</p>

                  <div className="bg-zinc-950 rounded-xl p-1 flex mb-6 border border-zinc-800">
                     <button 
                      onClick={() => setMeasureMode('portions')}
                      className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 ${measureMode === 'portions' ? 'bg-zinc-800 text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-300'}`}
                    >
                      <PieChart size={16} /> Porciones
                    </button>
                    <button 
                      onClick={() => setMeasureMode('exact')}
                      className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 ${measureMode === 'exact' ? 'bg-zinc-800 text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-300'}`}
                    >
                      <Scale size={16} /> Medida Exacta
                    </button>
                  </div>

                  {measureMode === 'exact' ? (
                     <Input label={`Cantidad (${selectedFood.unit})`} type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0" autoFocus />
                  ) : (
                    <div className="mb-4">
                      <label className="block text-xs font-medium text-zinc-400 mb-1 uppercase tracking-wider">Número de Porciones</label>
                      <select 
                        value={portions} 
                        onChange={(e) => setPortions(parseInt(e.target.value))}
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-emerald-500/50 outline-none appearance-none"
                      >
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                          <option key={num} value={num}>{num} {num === 1 ? 'Porción' : 'Porciones'}</option>
                        ))}
                      </select>
                      <p className="mt-2 text-xs text-zinc-500 flex items-center gap-1">
                        <Activity size={12} />
                        1 porción estándar ≈ <span className="text-zinc-300 font-bold">{selectedFood.stdPortion || (selectedFood.unit === 'g' ? 100 : 1)}{selectedFood.unit}</span>
                      </p>
                    </div>
                  )}

                  <div className="mt-4 p-4 bg-zinc-950 rounded-xl mb-6 flex justify-between items-center border border-zinc-800">
                    <span className="text-zinc-400">Total Calorías:</span>
                    <span className="text-2xl font-bold text-white">
                      {measureMode === 'exact' 
                        ? (amount ? Math.round(selectedFood.calPerUnit * parseFloat(amount)) : 0)
                        : Math.round(selectedFood.calPerUnit * (selectedFood.stdPortion || (selectedFood.unit === 'g' ? 100 : 1)) * portions)
                      }
                    </span>
                  </div>
                  <Button onClick={handleAddSearch}>Agregar</Button>
                </div>
              )}
            </>
          ) : (
             <form onSubmit={handleManualSubmit} className="animate-fade-in flex flex-col h-full">
               <div className="space-y-3">
                 <Input 
                    label="Nombre del Alimento" 
                    value={manualName} 
                    onChange={e => setManualName(e.target.value)} 
                    required 
                    placeholder="Ej. Sándwich Casero" 
                 />
                 
                 <Input 
                    label="Calorías Totales (lo que vas a comer)" 
                    value={manualTotalCals} 
                    onChange={e => setManualTotalCals(e.target.value)} 
                    type="number" 
                    required 
                    placeholder="Ej. 450" 
                 />

                 <div className="p-4 bg-zinc-950/50 rounded-xl border border-zinc-800 space-y-3">
                    <p className="text-xs font-bold text-emerald-500 uppercase flex items-center gap-2">
                       <Save size={12} /> Opcional: Guardar en Base de Datos
                    </p>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-zinc-500 mb-1">Cantidad</label>
                        <input 
                          className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                          placeholder="Ej. 100 o 1"
                          type="number"
                          value={manualAmount}
                          onChange={e => setManualAmount(e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-zinc-500 mb-1">Unidad</label>
                        <input 
                          className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                          placeholder="Ej. g, ml, pieza"
                          value={manualUnit}
                          onChange={e => setManualUnit(e.target.value)}
                        />
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3 pt-1">
                      <input 
                        type="checkbox" 
                        id="saveDB" 
                        checked={saveToDB} 
                        onChange={e => setSaveToDB(e.target.checked)}
                        className="w-5 h-5 rounded border-zinc-700 bg-zinc-900 text-emerald-500 focus:ring-emerald-500"
                      />
                      <label htmlFor="saveDB" className="text-sm text-zinc-300 cursor-pointer select-none">
                        Guardar en mis alimentos frecuentes
                      </label>
                    </div>
                    {saveToDB && (
                      <p className="text-[10px] text-zinc-500 leading-tight">
                        Se guardará como: <span className="text-zinc-300">{manualName}</span> con <span className="text-zinc-300">{(manualTotalCals && manualAmount) ? (parseInt(manualTotalCals) / parseFloat(manualAmount)).toFixed(2) : '?'} cal</span> por <span className="text-zinc-300">{manualUnit || 'unidad'}</span>.
                      </p>
                    )}
                 </div>
               </div>
               
               <div className="mt-6">
                 <Button type="submit">Agregar Alimento</Button>
               </div>
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
  foodDatabase: FoodItemDB[]; // Pasamos la DB
  onSaveNewFood: (newFood: FoodItemDB) => void; // Pasamos la función de guardar
}

const DailyLogView: React.FC<DailyLogProps> = ({ user, log, dateStr, onAddFood, onDeleteFood, onBack, foodDatabase, onSaveNewFood }) => {
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

  // Formato de fecha
  const [y, m, d] = dateStr.split('-');
  const dateObj = new Date(parseInt(y), parseInt(m) - 1, parseInt(d));
  const dateDisplay = dateObj.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' });

  return (
    <div className="min-h-screen bg-zinc-950 pb-24 relative overflow-hidden max-w-lg mx-auto">
      <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-zinc-900 to-zinc-950 -z-10" />

      {/* Header */}
      <div className="px-4 pt-8 pb-4 flex items-center gap-4">
        <button onClick={() => window.history.back()} className="p-2 bg-zinc-900/50 rounded-full text-zinc-200 border border-zinc-800 transition-colors hover:bg-zinc-800">
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
                  <button onClick={() => onDeleteFood(index)} className="p-2 text-zinc-600 hover:text-red-400 rounded-lg transition-colors"><Trash2 size={16} /></button>
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

      {showAddModal && (
        <AddFoodModal 
          onClose={() => setShowAddModal(false)} 
          onAdd={onAddFood} 
          foodDatabase={foodDatabase} 
          onSaveNewFood={onSaveNewFood}
        />
      )}
    </div>
  );
};

// --- COMPONENTE RAÍZ ---
export default function App() {
  const [view, setView] = useState('loading'); 
  const [userData, setUserData] = useState<UserData | null>(null);
  const [allLogs, setAllLogs] = useState<LogsMap>({});
  const [selectedDate, setSelectedDate] = useState(getTodayStr());

  // ESTADO NUEVO: Base de datos de alimentos dinámica
  const [foodDatabase, setFoodDatabase] = useState<FoodItemDB[]>(COMMON_FOODS);

  // CAMBIO 2: MANEJO DE NAVEGACIÓN (HISTORIAL)
  useEffect(() => {
    // Reemplaza el estado inicial para que 'home' sea el base
    window.history.replaceState({ view: 'home' }, '');

    const onPopState = (event: PopStateEvent) => {
      if (event.state && event.state.view) {
        setView(event.state.view);
        if (event.state.date) {
           setSelectedDate(event.state.date);
        }
      } else {
        // Si no hay estado (ej. página inicial), vamos a home
        setView('home');
      }
    };

    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  // Función wrapper para navegar guardando historial
  const handleNavigate = (screen: string, date?: string) => {
    setView(screen);
    if (date) setSelectedDate(date);
    window.history.pushState({ view: screen, date: date || selectedDate }, '');
  };

  // Cargar datos
  useEffect(() => {
    const savedUser = localStorage.getItem('calotrack_user');
    const savedAllLogs = localStorage.getItem('calotrack_all_logs');
    
    // Cargar alimentos personalizados
    const savedCustomFoods = localStorage.getItem('calotrack_custom_foods');
    let mergedFoods = [...COMMON_FOODS];
    if (savedCustomFoods) {
      const customFoods = JSON.parse(savedCustomFoods);
      mergedFoods = [...COMMON_FOODS, ...customFoods];
    }
    setFoodDatabase(mergedFoods);
    
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
    handleNavigate('home');
  };

  // NUEVA FUNCIÓN: Guardar nuevo alimento
  const handleSaveNewFood = (newFood: FoodItemDB) => {
    const updatedDB = [...foodDatabase, newFood];
    setFoodDatabase(updatedDB);
    
    // Guardamos SOLO los customs en localStorage para no duplicar COMMON_FOODS
    const customFoods = updatedDB.filter(f => f.isCustom);
    localStorage.setItem('calotrack_custom_foods', JSON.stringify(customFoods));
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
      <StyleInjector />
      
      {view === 'home' && (
        <HomeScreen 
          onNavigate={(screen) => {
             if (screen === 'dailylog') handleNavigate(screen, getTodayStr());
             else handleNavigate(screen);
          }} 
        />
      )}

      {view === 'setup' && (
        <UserSetup 
          userData={userData}
          onSave={handleSaveUser}
          onBack={userData ? () => window.history.back() : null}
        />
      )}

      {view === 'calendar' && (
        <CalendarView 
          onSelectDate={(date) => {
            handleNavigate('dailylog', date);
          }}
        />
      )}
      
      {view === 'dailylog' && (
        <DailyLogView 
          user={userData} 
          log={currentLog}
          dateStr={selectedDate}
          onAddFood={handleAddFood} 
          onDeleteFood={handleDeleteFood}
          onBack={() => window.history.back()}
          foodDatabase={foodDatabase}
          onSaveNewFood={handleSaveNewFood}
        />
      )}

      {view === 'goals' && (
        <WeeklyGoalView 
          user={userData} 
          allLogs={allLogs} 
        />
      )}
    </div>
  );
}