'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Activity, CheckCircle2, Circle, Plus, Trash2, LogOut, Target, Utensils, Brain, Moon, Dumbbell, FileText, Scale, TrendingUp, Smile, Meh, Frown, Heart, Flame, Coffee, Sun } from 'lucide-react';

type TabType = 'overview' | 'tasks' | 'habits' | 'goals' | 'diet' | 'mood' | 'sleep' | 'exercise' | 'notes' | 'weight';

interface Task { id: string; user_id: string; title: string; description?: string; priority: 'low' | 'medium' | 'high'; completed: boolean; created_at: string; }
interface Habit { id: string; user_id: string; name: string; description?: string; frequency: string; created_at: string; }
interface HabitLog { id: string; user_id: string; habit_id: string; date: string; completed: boolean; }
interface Goal { id: string; user_id: string; title: string; target_value: number; current_value: number; unit: string; completed: boolean; created_at: string; }
interface Meal { id: string; user_id: string; name: string; meal_type: string; calories: number; date: string; created_at: string; }
interface MoodLog { id: string; user_id: string; mood: string; score: number; notes?: string; date: string; created_at: string; }
interface SleepLog { id: string; user_id: string; hours: number; quality: number; date: string; created_at: string; }
interface ExerciseLog { id: string; user_id: string; exercise: string; duration: number; date: string; created_at: string; }
interface Note { id: string; user_id: string; title: string; content: string; created_at: string; }
interface WeightLog { id: string; user_id: string; weight: number; date: string; created_at: string; }

export default function DashboardPage() {
  const { user, loading, signOut, supabase } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [tasks, setTasks] = useState<Task[]>([]);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [habitLogs, setHabitLogs] = useState<HabitLog[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [meals, setMeals] = useState<Meal[]>([]);
  const [moods, setMoods] = useState<MoodLog[]>([]);
  const [sleepLogs, setSleepLogs] = useState<SleepLog[]>([]);
  const [exercises, setExercises] = useState<ExerciseLog[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [weights, setWeights] = useState<WeightLog[]>([]);
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    if (!loading && !user) router.push('/');
  }, [user, loading, router]);

  useEffect(() => {
    if (user) fetchAllData();
  }, [user]);

  const fetchAllData = async () => {
    if (!user) return;
    setDataLoading(true);
    const days7 = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const days30 = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    const queries = [
      { setter: setTasks, q: supabase.from('tasks').select('*').eq('user_id', user.id).order('created_at', { ascending: false }) },
      { setter: setHabits, q: supabase.from('habits').select('*').eq('user_id', user.id).order('created_at', { ascending: false }) },
      { setter: setHabitLogs, q: supabase.from('habit_logs').select('*').eq('user_id', user.id).gte('date', days7) },
      { setter: setGoals, q: supabase.from('goals').select('*').eq('user_id', user.id).order('created_at', { ascending: false }) },
      { setter: setMeals, q: supabase.from('meals').select('*').eq('user_id', user.id).gte('date', days7) },
      { setter: setMoods, q: supabase.from('mood_logs').select('*').eq('user_id', user.id).gte('date', days7) },
      { setter: setSleepLogs, q: supabase.from('sleep_logs').select('*').eq('user_id', user.id).gte('date', days7) },
      { setter: setExercises, q: supabase.from('exercise_logs').select('*').eq('user_id', user.id).gte('date', days7) },
      { setter: setNotes, q: supabase.from('notes').select('*').eq('user_id', user.id).order('created_at', { ascending: false }) },
      { setter: setWeights, q: supabase.from('weight_logs').select('*').eq('user_id', user.id).gte('date', days30) },
    ];

    for (const { setter, q } of queries) {
      const { data } = await q;
      if (data) setter(data);
    }
    setDataLoading(false);
  };

  if (loading || dataLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Activity className="w-12 h-12 text-primary animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  const today = new Date().toISOString().split('T')[0];
  const stats = {
    tasksCompleted: tasks.filter(t => t.completed).length,
    totalTasks: tasks.length,
    habitsToday: habits.filter(h => habitLogs.find(l => l.habit_id === h.id && l.date === today && l.completed)).length,
    totalHabits: habits.length,
    goalsProgress: goals.filter(g => g.completed).length,
    totalGoals: goals.length,
    caloriesToday: meals.filter(m => m.date === today).reduce((sum, m) => sum + (m.calories || 0), 0),
    avgMood: moods.length > 0 ? (moods.reduce((sum, m) => sum + m.score, 0) / moods.length).toFixed(1) : 'N/A',
    sleepAvg: sleepLogs.length > 0 ? (sleepLogs.reduce((sum, s) => sum + s.hours, 0) / sleepLogs.length).toFixed(1) : 'N/A',
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Activity },
    { id: 'tasks', label: 'Tasks', icon: CheckCircle2 },
    { id: 'habits', label: 'Habits', icon: Target },
    { id: 'goals', label: 'Goals', icon: TrendingUp },
    { id: 'diet', label: 'Diet', icon: Utensils },
    { id: 'mood', label: 'Mood', icon: Brain },
    { id: 'sleep', label: 'Sleep', icon: Moon },
    { id: 'exercise', label: 'Exercise', icon: Dumbbell },
    { id: 'notes', label: 'Notes', icon: FileText },
    { id: 'weight', label: 'Weight', icon: Scale },
  ] as const;

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card shadow-sm sticky top-0 z-50 border-b border-border">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-primary p-2.5 rounded-xl"><Activity className="w-5 h-5 text-primary-foreground" /></div>
              <div>
                <h1 className="text-xl font-bold text-card-foreground">Life Tracker</h1>
                <p className="text-sm text-muted-foreground">Welcome, {user.email}</p>
              </div>
            </div>
            <button onClick={async () => { await signOut(); router.push('/'); }} className="flex items-center gap-2 px-4 py-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition">
              <LogOut className="w-4 h-4" /> Sign Out
            </button>
          </div>
        </div>
      </header>

      <nav className="bg-card border-b border-border overflow-x-auto">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex gap-1">
            {tabs.map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition ${activeTab === tab.id ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}>
                <tab.icon className="w-4 h-4" />{tab.label}
              </button>
            ))}
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 py-6">
        {activeTab === 'overview' && <OverviewTab stats={stats} />}
        {activeTab === 'tasks' && <TasksTab tasks={tasks} setTasks={setTasks} userId={user.id} supabase={supabase} />}
        {activeTab === 'habits' && <HabitsTab habits={habits} habitLogs={habitLogs} setHabits={setHabits} setHabitLogs={setHabitLogs} userId={user.id} supabase={supabase} />}
        {activeTab === 'goals' && <GoalsTab goals={goals} setGoals={setGoals} userId={user.id} supabase={supabase} />}
        {activeTab === 'diet' && <DietTab meals={meals} setMeals={setMeals} userId={user.id} supabase={supabase} />}
        {activeTab === 'mood' && <MoodTab moods={moods} setMoods={setMoods} userId={user.id} supabase={supabase} />}
        {activeTab === 'sleep' && <SleepTab sleepLogs={sleepLogs} setSleepLogs={setSleepLogs} userId={user.id} supabase={supabase} />}
        {activeTab === 'exercise' && <ExerciseTab exercises={exercises} setExercises={setExercises} userId={user.id} supabase={supabase} />}
        {activeTab === 'notes' && <NotesTab notes={notes} setNotes={setNotes} userId={user.id} supabase={supabase} />}
        {activeTab === 'weight' && <WeightTab weights={weights} setWeights={setWeights} userId={user.id} supabase={supabase} />}
      </main>
    </div>
  );
}

function OverviewTab({ stats }: { stats: any }) {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-foreground">Your Progress Overview</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        <StatCard icon={CheckCircle2} label="Tasks Completed" value={`${stats.tasksCompleted}/${stats.totalTasks}`} color="coral" />
        <StatCard icon={Target} label="Habits Today" value={`${stats.habitsToday}/${stats.totalHabits}`} color="teal" />
        <StatCard icon={TrendingUp} label="Goals Achieved" value={`${stats.goalsProgress}/${stats.totalGoals}`} color="primary" />
        <StatCard icon={Flame} label="Calories Today" value={stats.caloriesToday.toString()} color="orange" />
        <StatCard icon={Brain} label="Avg Mood" value={stats.avgMood} color="pink" />
        <StatCard icon={Moon} label="Avg Sleep" value={`${stats.sleepAvg}h`} color="secondary" />
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color }: { icon: any; label: string; value: string; color: string }) {
  const colors: Record<string, string> = { coral: 'bg-primary/10 text-primary', teal: 'bg-secondary/10 text-secondary', primary: 'bg-primary/10 text-primary', orange: 'bg-orange-100 text-orange-500', pink: 'bg-pink-100 text-pink-500', secondary: 'bg-secondary/10 text-secondary' };
  return (
    <div className="bg-card rounded-xl p-6 shadow-sm border border-border card-hover">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${colors[color]}`}><Icon className="w-6 h-6" /></div>
      <p className="text-3xl font-bold text-foreground">{value}</p>
      <p className="text-muted-foreground text-sm mt-1">{label}</p>
    </div>
  );
}

function TasksTab({ tasks, setTasks, userId, supabase }: any) {
  const [newTask, setNewTask] = useState({ title: '', priority: 'medium' });
  const addTask = async () => {
    if (!newTask.title.trim()) return;
    const { data } = await supabase.from('tasks').insert({ user_id: userId, title: newTask.title, priority: newTask.priority, completed: false }).select().single();
    if (data) setTasks([data, ...tasks]);
    setNewTask({ title: '', priority: 'medium' });
  };
  const toggleTask = async (task: Task) => {
    await supabase.from('tasks').update({ completed: !task.completed }).eq('id', task.id);
    setTasks(tasks.map(t => t.id === task.id ? { ...t, completed: !t.completed } : t));
  };
  const deleteTask = async (id: string) => { await supabase.from('tasks').delete().eq('id', id); setTasks(tasks.filter(t => t.id !== id)); };
  const priorityColors: Record<string, string> = { low: 'border-l-green-500', medium: 'border-l-yellow-500', high: 'border-l-red-500' };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-foreground">Tasks</h2>
      <div className="bg-card rounded-xl p-4 shadow-sm border border-border space-y-3">
        <input type="text" placeholder="Task title..." value={newTask.title} onChange={e => setNewTask({ ...newTask, title: e.target.value })} className="w-full px-4 py-2.5 border border-input rounded-lg bg-background" />
        <div className="flex gap-3">
          <select value={newTask.priority} onChange={e => setNewTask({ ...newTask, priority: e.target.value })} className="px-4 py-2.5 border border-input rounded-lg bg-background">
            <option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option>
          </select>
          <button onClick={addTask} className="flex-1 bg-primary text-primary-foreground py-2.5 rounded-lg hover:opacity-90 transition flex items-center justify-center gap-2">
            <Plus className="w-4 h-4" /> Add Task
          </button>
        </div>
      </div>
      <div className="space-y-2">
        {tasks.map(task => (
          <div key={task.id} className={`bg-card rounded-xl p-4 shadow-sm border border-border border-l-4 ${priorityColors[task.priority]} flex items-center gap-4 card-hover`}>
            <button onClick={() => toggleTask(task)}>{task.completed ? <CheckCircle2 className="w-6 h-6 text-green-500" /> : <Circle className="w-6 h-6 text-muted-foreground" />}</button>
            <div className="flex-1"><p className={`font-medium ${task.completed ? 'line-through text-muted-foreground' : 'text-foreground'}`}>{task.title}</p></div>
            <button onClick={() => deleteTask(task.id)} className="text-muted-foreground hover:text-destructive"><Trash2 className="w-5 h-5" /></button>
          </div>
        ))}
        {tasks.length === 0 && <div className="text-center py-12 text-muted-foreground"><CheckCircle2 className="w-12 h-12 mx-auto mb-3 opacity-50" /><p>No tasks yet!</p></div>}
      </div>
    </div>
  );
}

function HabitsTab({ habits, habitLogs, setHabits, setHabitLogs, userId, supabase }: any) {
  const [newHabit, setNewHabit] = useState({ name: '' });
  const today = new Date().toISOString().split('T')[0];
  const addHabit = async () => {
    if (!newHabit.name.trim()) return;
    const { data } = await supabase.from('habits').insert({ user_id: userId, name: newHabit.name, frequency: 'daily' }).select().single();
    if (data) setHabits([data, ...habits]);
    setNewHabit({ name: '' });
  };
  const toggleHabit = async (habit: Habit) => {
    const existing = habitLogs.find(l => l.habit_id === habit.id && l.date === today);
    if (existing) {
      await supabase.from('habit_logs').update({ completed: !existing.completed }).eq('id', existing.id);
      setHabitLogs(habitLogs.map(l => l.id === existing.id ? { ...l, completed: !l.completed } : l));
    } else {
      const { data } = await supabase.from('habit_logs').insert({ user_id: userId, habit_id: habit.id, completed: true, date: today }).select().single();
      if (data) setHabitLogs([...habitLogs, data]);
    }
  };
  const deleteHabit = async (id: string) => { await supabase.from('habits').delete().eq('id', id); setHabits(habits.filter(h => h.id !== id)); };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-foreground">Daily Habits</h2>
      <div className="bg-card rounded-xl p-4 shadow-sm border border-border space-y-3">
        <input type="text" placeholder="Habit name..." value={newHabit.name} onChange={e => setNewHabit({ ...newHabit, name: e.target.value })} className="w-full px-4 py-2.5 border border-input rounded-lg bg-background" />
        <button onClick={addHabit} className="w-full bg-secondary text-secondary-foreground py-2.5 rounded-lg hover:opacity-90 transition flex items-center justify-center gap-2">
          <Plus className="w-4 h-4" /> Add Habit
        </button>
      </div>
      <div className="space-y-2">
        {habits.map(habit => {
          const isCompleted = habitLogs.find(l => l.habit_id === habit.id && l.date === today)?.completed;
          return (
            <div key={habit.id} className="bg-card rounded-xl p-4 shadow-sm border border-border flex items-center gap-4 card-hover">
              <button onClick={() => toggleHabit(habit)}>{isCompleted ? <CheckCircle2 className="w-6 h-6 text-green-500" /> : <Circle className="w-6 h-6 text-muted-foreground" />}</button>
              <div className="flex-1"><p className={`font-medium ${isCompleted ? 'text-muted-foreground' : 'text-foreground'}`}>{habit.name}</p></div>
              <button onClick={() => deleteHabit(habit.id)} className="text-muted-foreground hover:text-destructive"><Trash2 className="w-5 h-5" /></button>
            </div>
          );
        })}
        {habits.length === 0 && <div className="text-center py-12 text-muted-foreground"><Target className="w-12 h-12 mx-auto mb-3 opacity-50" /><p>No habits yet!</p></div>}
      </div>
    </div>
  );
}

function GoalsTab({ goals, setGoals, userId, supabase }: any) {
  const [newGoal, setNewGoal] = useState({ title: '', target: 0, unit: '' });
  const addGoal = async () => {
    if (!newGoal.title.trim()) return;
    const { data } = await supabase.from('goals').insert({ user_id: userId, title: newGoal.title, target_value: newGoal.target, current_value: 0, unit: newGoal.unit, completed: false }).select().single();
    if (data) setGoals([data, ...goals]);
    setNewGoal({ title: '', target: 0, unit: '' });
  };
  const updateProgress = async (goal: Goal, inc: number) => {
    const newVal = (goal.current_value || 0) + inc;
    const completed = newVal >= goal.target_value;
    await supabase.from('goals').update({ current_value: newVal, completed }).eq('id', goal.id);
    setGoals(goals.map(g => g.id === goal.id ? { ...g, current_value: newVal, completed } : g));
  };
  const deleteGoal = async (id: string) => { await supabase.from('goals').delete().eq('id', id); setGoals(goals.filter(g => g.id !== id)); };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-foreground">Goals</h2>
      <div className="bg-card rounded-xl p-4 shadow-sm border border-border space-y-3">
        <input type="text" placeholder="Goal title..." value={newGoal.title} onChange={e => setNewGoal({ ...newGoal, title: e.target.value })} className="w-full px-4 py-2.5 border border-input rounded-lg bg-background" />
        <div className="flex gap-3">
          <input type="number" placeholder="Target" value={newGoal.target || ''} onChange={e => setNewGoal({ ...newGoal, target: Number(e.target.value) })} className="flex-1 px-4 py-2.5 border border-input rounded-lg bg-background" />
          <input type="text" placeholder="Unit" value={newGoal.unit} onChange={e => setNewGoal({ ...newGoal, unit: e.target.value })} className="flex-1 px-4 py-2.5 border border-input rounded-lg bg-background" />
        </div>
        <button onClick={addGoal} className="w-full bg-primary text-primary-foreground py-2.5 rounded-lg hover:opacity-90 transition flex items-center justify-center gap-2">
          <Plus className="w-4 h-4" /> Add Goal
        </button>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {goals.map(goal => {
          const progress = goal.target_value ? Math.min(100, Math.round((goal.current_value / goal.target_value) * 100)) : 0;
          return (
            <div key={goal.id} className="bg-card rounded-xl p-4 shadow-sm border border-border card-hover">
              <div className="flex justify-between items-start mb-3">
                <h3 className={`font-semibold ${goal.completed ? 'line-through text-muted-foreground' : 'text-foreground'}`}>{goal.title}</h3>
                <button onClick={() => deleteGoal(goal.id)} className="text-muted-foreground hover:text-destructive"><Trash2 className="w-4 h-4" /></button>
              </div>
              <div className="mb-3">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-muted-foreground">{goal.current_value} / {goal.target_value} {goal.unit}</span>
                  <span className={goal.completed ? 'text-green-500' : 'text-primary'}>{progress}%</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div className={`h-full transition-all ${goal.completed ? 'bg-green-500' : 'bg-primary'}`} style={{ width: `${progress}%` }} />
                </div>
              </div>
              {!goal.completed && (
                <div className="flex gap-2">
                  <button onClick={() => updateProgress(goal, -1)} className="flex-1 py-1.5 text-sm bg-muted rounded hover:bg-muted/80">-1</button>
                  <button onClick={() => updateProgress(goal, 1)} className="flex-1 py-1.5 text-sm bg-secondary/10 text-secondary rounded hover:bg-secondary/20">+1</button>
                  <button onClick={() => updateProgress(goal, 5)} className="flex-1 py-1.5 text-sm bg-primary text-primary-foreground rounded hover:opacity-90">+5</button>
                </div>
              )}
            </div>
          );
        })}
      </div>
      {goals.length === 0 && <div className="text-center py-12 text-muted-foreground"><TrendingUp className="w-12 h-12 mx-auto mb-3 opacity-50" /><p>Set your goals!</p></div>}
    </div>
  );
}

function DietTab({ meals, setMeals, userId, supabase }: any) {
  const [newMeal, setNewMeal] = useState({ name: '', type: 'breakfast', calories: 0 });
  const today = new Date().toISOString().split('T')[0];
  const addMeal = async () => {
    if (!newMeal.name.trim()) return;
    const { data } = await supabase.from('meals').insert({ user_id: userId, name: newMeal.name, meal_type: newMeal.type, calories: newMeal.calories, date: today }).select().single();
    if (data) setMeals([data, ...meals]);
    setNewMeal({ name: '', type: 'breakfast', calories: 0 });
  };
  const deleteMeal = async (id: string) => { await supabase.from('meals').delete().eq('id', id); setMeals(meals.filter(m => m.id !== id)); };
  const totalCal = meals.filter(m => m.date === today).reduce((sum, m) => sum + (m.calories || 0), 0);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-foreground">Diet Tracking</h2>
      <div className="bg-card rounded-xl p-4 shadow-sm border border-border space-y-3">
        <input type="text" placeholder="Food name..." value={newMeal.name} onChange={e => setNewMeal({ ...newMeal, name: e.target.value })} className="w-full px-4 py-2.5 border border-input rounded-lg bg-background" />
        <div className="flex gap-3">
          <select value={newMeal.type} onChange={e => setNewMeal({ ...newMeal, type: e.target.value })} className="flex-1 px-4 py-2.5 border border-input rounded-lg bg-background">
            <option value="breakfast">Breakfast</option><option value="lunch">Lunch</option><option value="dinner">Dinner</option><option value="snack">Snack</option>
          </select>
          <input type="number" placeholder="Calories" value={newMeal.calories || ''} onChange={e => setNewMeal({ ...newMeal, calories: Number(e.target.value) })} className="flex-1 px-4 py-2.5 border border-input rounded-lg bg-background" />
        </div>
        <button onClick={addMeal} className="w-full bg-secondary text-secondary-foreground py-2.5 rounded-lg hover:opacity-90 transition flex items-center justify-center gap-2">
          <Plus className="w-4 h-4" /> Add Meal
        </button>
      </div>
      <div className="bg-gradient-to-r from-primary to-orange-400 rounded-xl p-6 text-white">
        <p className="text-sm opacity-90">Today's Calories</p>
        <p className="text-4xl font-bold">{totalCal}</p>
        <p className="text-sm opacity-90 mt-1">kcal</p>
      </div>
      <div className="space-y-2">
        {meals.filter(m => m.date === today).map(meal => (
          <div key={meal.id} className="bg-card rounded-xl p-4 shadow-sm border border-border flex items-center justify-between card-hover">
            <div><p className="font-medium text-foreground">{meal.name}</p><p className="text-sm text-muted-foreground">{meal.calories} kcal</p></div>
            <button onClick={() => deleteMeal(meal.id)} className="text-muted-foreground hover:text-destructive"><Trash2 className="w-5 h-5" /></button>
          </div>
        ))}
        {meals.filter(m => m.date === today).length === 0 && <div className="text-center py-12 text-muted-foreground"><Utensils className="w-12 h-12 mx-auto mb-3 opacity-50" /><p>Log your meals!</p></div>}
      </div>
    </div>
  );
}

function MoodTab({ moods, setMoods, userId, supabase }: any) {
  const [newMood, setNewMood] = useState({ mood: 'okay', notes: '' });
  const today = new Date().toISOString().split('T')[0];
  const moodOptions = [
    { value: 'great', label: 'Great', icon: Smile, color: 'text-green-500', score: 5 },
    { value: 'good', label: 'Good', icon: Heart, color: 'text-blue-500', score: 4 },
    { value: 'okay', label: 'Okay', icon: Meh, color: 'text-yellow-500', score: 3 },
    { value: 'bad', label: 'Bad', icon: Frown, color: 'text-orange-500', score: 2 },
    { value: 'terrible', label: 'Terrible', icon: Frown, color: 'text-red-500', score: 1 },
  ];
  const addMood = async () => {
    const opt = moodOptions.find(m => m.value === newMood.mood);
    const { data } = await supabase.from('mood_logs').insert({ user_id: userId, mood: newMood.mood, score: opt?.score || 3, notes: newMood.notes, date: today }).select().single();
    if (data) setMoods([data, ...moods]);
    setNewMood({ mood: 'okay', notes: '' });
  };
  const deleteMood = async (id: string) => { await supabase.from('mood_logs').delete().eq('id', id); setMoods(moods.filter(m => m.id !== id)); };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-foreground">Mood Tracking</h2>
      <div className="bg-card rounded-xl p-4 shadow-sm border border-border space-y-3">
        <p className="font-medium text-foreground">How are you feeling?</p>
        <div className="flex justify-between">
          {moodOptions.map(opt => {
            const Icon = opt.icon;
            return (
              <button key={opt.value} onClick={() => setNewMood({ ...newMood, mood: opt.value })}
                className={`flex flex-col items-center p-3 rounded-xl transition ${newMood.mood === opt.value ? 'bg-primary/10 ring-2 ring-primary' : 'hover:bg-muted'}`}>
                <Icon className={`w-8 h-8 ${opt.color}`} /><span className="text-xs mt-1 text-muted-foreground">{opt.label}</span>
              </button>
            );
          })}
        </div>
        <textarea placeholder="Notes (optional)..." value={newMood.notes} onChange={e => setNewMood({ ...newMood, notes: e.target.value })} className="w-full px-4 py-2.5 border border-input rounded-lg bg-background resize-none" rows={2} />
        <button onClick={addMood} className="w-full bg-primary text-primary-foreground py-2.5 rounded-lg hover:opacity-90 transition">Log Mood</button>
      </div>
      <div className="space-y-2">
        {moods.map(mood => {
          const opt = moodOptions.find(m => m.value === mood.mood);
          const Icon = opt?.icon || Meh;
          return (
            <div key={mood.id} className="bg-card rounded-xl p-4 shadow-sm border border-border flex items-center gap-4 card-hover">
              <Icon className={`w-8 h-8 ${opt?.color}`} />
              <div className="flex-1"><p className="font-medium text-foreground capitalize">{mood.mood}</p><p className="text-sm text-muted-foreground">{mood.date}</p></div>
              <button onClick={() => deleteMood(mood.id)} className="text-muted-foreground hover:text-destructive"><Trash2 className="w-5 h-5" /></button>
            </div>
          );
        })}
        {moods.length === 0 && <div className="text-center py-12 text-muted-foreground"><Brain className="w-12 h-12 mx-auto mb-3 opacity-50" /><p>Track your mood!</p></div>}
      </div>
    </div>
  );
}

function SleepTab({ sleepLogs, setSleepLogs, userId, supabase }: any) {
  const [newSleep, setNewSleep] = useState({ hours: 7, quality: 3 });
  const today = new Date().toISOString().split('T')[0];
  const addSleep = async () => {
    const { data } = await supabase.from('sleep_logs').insert({ user_id: userId, hours: newSleep.hours, quality: newSleep.quality, date: today }).select().single();
    if (data) setSleepLogs([data, ...sleepLogs]);
  };
  const deleteSleep = async (id: string) => { await supabase.from('sleep_logs').delete().eq('id', id); setSleepLogs(sleepLogs.filter(s => s.id !== id)); };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-foreground">Sleep Tracking</h2>
      <div className="bg-card rounded-xl p-4 shadow-sm border border-border space-y-4">
        <div>
          <label className="block font-medium text-foreground mb-2">Hours Slept</label>
          <input type="range" min="1" max="12" step="0.5" value={newSleep.hours} onChange={e => setNewSleep({ ...newSleep, hours: Number(e.target.value) })} className="w-full accent-primary" />
          <div className="text-center text-3xl font-bold text-primary">{newSleep.hours}h</div>
        </div>
        <div>
          <label className="block font-medium text-foreground mb-2">Quality</label>
          <div className="flex justify-between">
            {[1,2,3,4,5].map(q => (
              <button key={q} onClick={() => setNewSleep({ ...newSleep, quality: q })} className={`w-12 h-12 rounded-lg flex items-center justify-center text-lg font-bold transition ${newSleep.quality === q ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/80'}`}>{q}</button>
            ))}
          </div>
        </div>
        <button onClick={addSleep} className="w-full bg-secondary text-secondary-foreground py-2.5 rounded-lg hover:opacity-90 transition">Log Sleep</button>
      </div>
      <div className="space-y-2">
        {sleepLogs.map(log => (
          <div key={log.id} className="bg-card rounded-xl p-4 shadow-sm border border-border flex items-center gap-4 card-hover">
            <Moon className="w-8 h-8 text-secondary" />
            <div className="flex-1"><p className="font-medium text-foreground">{log.hours} hours</p><p className="text-sm text-muted-foreground">Quality: {log.quality}/5 - {log.date}</p></div>
            <button onClick={() => deleteSleep(log.id)} className="text-muted-foreground hover:text-destructive"><Trash2 className="w-5 h-5" /></button>
          </div>
        ))}
        {sleepLogs.length === 0 && <div className="text-center py-12 text-muted-foreground"><Moon className="w-12 h-12 mx-auto mb-3 opacity-50" /><p>Log your sleep!</p></div>}
      </div>
    </div>
  );
}

function ExerciseTab({ exercises, setExercises, userId, supabase }: any) {
  const [newEx, setNewEx] = useState({ name: '', duration: 30 });
  const today = new Date().toISOString().split('T')[0];
  const addExercise = async () => {
    if (!newEx.name.trim()) return;
    const { data } = await supabase.from('exercise_logs').insert({ user_id: userId, exercise: newEx.name, duration: newEx.duration, date: today }).select().single();
    if (data) setExercises([data, ...exercises]);
    setNewEx({ name: '', duration: 30 });
  };
  const deleteExercise = async (id: string) => { await supabase.from('exercise_logs').delete().eq('id', id); setExercises(exercises.filter(e => e.id !== id)); };
  const totalMin = exercises.filter(e => e.date === today).reduce((sum, e) => sum + e.duration, 0);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-foreground">Exercise Tracking</h2>
      <div className="bg-card rounded-xl p-4 shadow-sm border border-border space-y-3">
        <input type="text" placeholder="Exercise name..." value={newEx.name} onChange={e => setNewEx({ ...newEx, name: e.target.value })} className="w-full px-4 py-2.5 border border-input rounded-lg bg-background" />
        <div>
          <label className="block font-medium text-foreground mb-2">Duration (minutes)</label>
          <input type="range" min="5" max="120" step="5" value={newEx.duration} onChange={e => setNewEx({ ...newEx, duration: Number(e.target.value) })} className="w-full accent-primary" />
          <div className="text-center text-3xl font-bold text-primary">{newEx.duration} min</div>
        </div>
        <button onClick={addExercise} className="w-full bg-secondary text-secondary-foreground py-2.5 rounded-lg hover:opacity-90 transition flex items-center justify-center gap-2">
          <Plus className="w-4 h-4" /> Log Exercise
        </button>
      </div>
      <div className="bg-gradient-to-r from-secondary to-green-400 rounded-xl p-6 text-white">
        <p className="text-sm opacity-90">Today's Exercise</p>
        <p className="text-4xl font-bold">{totalMin}</p>
        <p className="text-sm opacity-90 mt-1">minutes</p>
      </div>
      <div className="space-y-2">
        {exercises.map(ex => (
          <div key={ex.id} className="bg-card rounded-xl p-4 shadow-sm border border-border flex items-center gap-4 card-hover">
            <Dumbbell className="w-8 h-8 text-secondary" />
            <div className="flex-1"><p className="font-medium text-foreground">{ex.exercise}</p><p className="text-sm text-muted-foreground">{ex.duration} min - {ex.date}</p></div>
            <button onClick={() => deleteExercise(ex.id)} className="text-muted-foreground hover:text-destructive"><Trash2 className="w-5 h-5" /></button>
          </div>
        ))}
        {exercises.length === 0 && <div className="text-center py-12 text-muted-foreground"><Dumbbell className="w-12 h-12 mx-auto mb-3 opacity-50" /><p>Log your workouts!</p></div>}
      </div>
    </div>
  );
}

function NotesTab({ notes, setNotes, userId, supabase }: any) {
  const [newNote, setNewNote] = useState({ title: '', content: '' });
  const addNote = async () => {
    if (!newNote.title.trim() || !newNote.content.trim()) return;
    const { data } = await supabase.from('notes').insert({ user_id: userId, title: newNote.title, content: newNote.content }).select().single();
    if (data) setNotes([data, ...notes]);
    setNewNote({ title: '', content: '' });
  };
  const deleteNote = async (id: string) => { await supabase.from('notes').delete().eq('id', id); setNotes(notes.filter(n => n.id !== id)); };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-foreground">Notes</h2>
      <div className="bg-card rounded-xl p-4 shadow-sm border border-border space-y-3">
        <input type="text" placeholder="Note title..." value={newNote.title} onChange={e => setNewNote({ ...newNote, title: e.target.value })} className="w-full px-4 py-2.5 border border-input rounded-lg bg-background" />
        <textarea placeholder="Write your thoughts..." value={newNote.content} onChange={e => setNewNote({ ...newNote, content: e.target.value })} className="w-full px-4 py-2.5 border border-input rounded-lg bg-background resize-none" rows={4} />
        <button onClick={addNote} className="w-full bg-primary text-primary-foreground py-2.5 rounded-lg hover:opacity-90 transition flex items-center justify-center gap-2">
          <Plus className="w-4 h-4" /> Add Note
        </button>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {notes.map(note => (
          <div key={note.id} className="bg-card rounded-xl p-4 shadow-sm border border-border card-hover">
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-semibold text-foreground">{note.title}</h3>
              <button onClick={() => deleteNote(note.id)} className="text-muted-foreground hover:text-destructive"><Trash2 className="w-4 h-4" /></button>
            </div>
            <p className="text-muted-foreground text-sm whitespace-pre-wrap">{note.content}</p>
          </div>
        ))}
      </div>
      {notes.length === 0 && <div className="text-center py-12 text-muted-foreground"><FileText className="w-12 h-12 mx-auto mb-3 opacity-50" /><p>Create notes!</p></div>}
    </div>
  );
}

function WeightTab({ weights, setWeights, userId, supabase }: any) {
  const [newWeight, setNewWeight] = useState({ weight: 0 });
  const addWeight = async () => {
    if (!newWeight.weight || newWeight.weight <= 0) return;
    const today = new Date().toISOString().split('T')[0];
    const { data } = await supabase.from('weight_logs').insert({ user_id: userId, weight: newWeight.weight, date: today }).select().single();
    if (data) setWeights([data, ...weights]);
    setNewWeight({ weight: 0 });
  };
  const deleteWeight = async (id: string) => { await supabase.from('weight_logs').delete().eq('id', id); setWeights(weights.filter(w => w.id !== id)); };
  const latest = weights.length > 0 ? weights[0].weight : null;
  const avg = weights.length > 0 ? (weights.reduce((sum, w) => sum + w.weight, 0) / weights.length).toFixed(1) : null;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-foreground">Weight Tracking</h2>
      <div className="bg-card rounded-xl p-4 shadow-sm border border-border space-y-3">
        <input type="number" step="0.1" placeholder="Weight (kg)..." value={newWeight.weight || ''} onChange={e => setNewWeight({ weight: Number(e.target.value) })} className="w-full px-4 py-3 border border-input rounded-lg bg-background text-2xl text-center" />
        <button onClick={addWeight} className="w-full bg-secondary text-secondary-foreground py-2.5 rounded-lg hover:opacity-90 transition flex items-center justify-center gap-2">
          <Plus className="w-4 h-4" /> Log Weight
        </button>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-primary rounded-xl p-6 text-primary-foreground"><p className="text-sm opacity-90">Current</p><p className="text-4xl font-bold">{latest || '--'}</p><p className="text-sm opacity-90 mt-1">kg</p></div>
        <div className="bg-secondary rounded-xl p-6 text-secondary-foreground"><p className="text-sm opacity-90">Average</p><p className="text-4xl font-bold">{avg || '--'}</p><p className="text-sm opacity-90 mt-1">kg</p></div>
      </div>
      <div className="space-y-2">
        {weights.map(w => (
          <div key={w.id} className="bg-card rounded-xl p-4 shadow-sm border border-border flex items-center gap-4 card-hover">
            <Scale className="w-8 h-8 text-secondary" />
            <div className="flex-1"><p className="font-medium text-foreground">{w.weight} kg</p><p className="text-sm text-muted-foreground">{w.date}</p></div>
            <button onClick={() => deleteWeight(w.id)} className="text-muted-foreground hover:text-destructive"><Trash2 className="w-5 h-5" /></button>
          </div>
        ))}
        {weights.length === 0 && <div className="text-center py-12 text-muted-foreground"><Scale className="w-12 h-12 mx-auto mb-3 opacity-50" /><p>Track your weight!</p></div>}
      </div>
    </div>
  );
}
