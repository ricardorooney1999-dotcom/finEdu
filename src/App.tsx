import { FormEvent, useEffect, useMemo, useState } from 'react';
import type { LucideIcon } from 'lucide-react';
import {
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  BriefcaseBusiness,
  Calculator,
  Check,
  ChevronRight,
  CircleDollarSign,
  Clock3,
  CreditCard,
  GraduationCap,
  Landmark,
  Lightbulb,
  Menu,
  PiggyBank,
  Plus,
  ScanLine,
  ShieldCheck,
  Sparkles,
  Target,
  Trash2,
  TrendingUp,
  UserRound,
  WalletCards,
  X,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';

type View = 'overview' | 'diagnostico' | 'movimientos' | 'presupuesto' | 'simuladores' | 'aprende';
type TransactionKind = 'income' | 'expense';
type Profile = 'Joven' | 'Emprendedor' | 'MIPYME';
type Transaction = { id: string; kind: TransactionKind; description: string; category: string; amount: number; occurred_on: string; created_at?: string };

const demoTransactions: Transaction[] = [
  { id: '1', kind: 'income', description: 'Sueldo mensual', category: 'Ingresos', amount: 6500000, occurred_on: '2026-10-01' },
  { id: '2', kind: 'expense', description: 'Alquiler departamento', category: 'Vivienda', amount: 1800000, occurred_on: '2026-10-03' },
  { id: '3', kind: 'expense', description: 'Supermercado', category: 'Alimentos', amount: 645000, occurred_on: '2026-10-08' },
  { id: '4', kind: 'expense', description: 'Cuota préstamo', category: 'Deudas', amount: 420000, occurred_on: '2026-10-10' },
  { id: '5', kind: 'income', description: 'Venta freelance', category: 'Ingresos', amount: 980000, occurred_on: '2026-10-12' },
];

const categories = ['Vivienda', 'Alimentos', 'Transporte', 'Deudas', 'Inversión', 'Educación', 'Otros'];
const navItems: { id: View; label: string; icon: LucideIcon; caption: string }[] = [
  { id: 'overview', label: 'Resumen', icon: ScanLine, caption: 'Tu panorama financiero' },
  { id: 'diagnostico', label: 'Mi perfil', icon: UserRound, caption: 'Diagnóstico personalizado' },
  { id: 'movimientos', label: 'Movimientos', icon: WalletCards, caption: 'Ingresos y gastos' },
  { id: 'presupuesto', label: 'Presupuesto', icon: Target, caption: 'Plan mensual' },
  { id: 'simuladores', label: 'Simuladores', icon: Calculator, caption: 'Decisiones con datos' },
  { id: 'aprende', label: 'Aprende', icon: GraduationCap, caption: 'Píldoras prácticas' },
];

const formatGs = (value: number) => `Gs. ${Math.round(value).toLocaleString('es-PY')}`;
const shortDate = (value: string) => new Date(`${value}T12:00:00`).toLocaleDateString('es-PY', { day: '2-digit', month: 'short' });

function App() {
  const [view, setView] = useState<View>('overview');
  const [mobileOpen, setMobileOpen] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>(demoTransactions);
  const [toast, setToast] = useState('');
  const [profile, setProfile] = useState<Profile>('Joven');
  const [answers, setAnswers] = useState<number[]>([0, 0, 0, 0]);
  const [diagnosisDone, setDiagnosisDone] = useState(false);

  useEffect(() => {
    const loadTransactions = async () => {
      const { data, error } = await supabase.from('finedupy_transactions').select('*').order('occurred_on', { ascending: false });
      if (!error && data && data.length > 0) setTransactions(data as Transaction[]);
    };
    void loadTransactions();
  }, []);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(''), 2800);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const income = useMemo(() => transactions.filter((item) => item.kind === 'income').reduce((sum, item) => sum + item.amount, 0), [transactions]);
  const expenses = useMemo(() => transactions.filter((item) => item.kind === 'expense').reduce((sum, item) => sum + item.amount, 0), [transactions]);
  const balance = income - expenses;
  const expenseByCategory = useMemo(() => categories.map((category) => ({ category, amount: transactions.filter((item) => item.kind === 'expense' && item.category === category).reduce((sum, item) => sum + item.amount, 0) })).filter((item) => item.amount > 0), [transactions]);
  const score = diagnosisDone ? Math.round((answers.reduce((sum, answer) => sum + answer, 0) / 12) * 100) : 50;

  const selectView = (next: View) => { setView(next); setMobileOpen(false); };
  const addTransaction = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const entry = { kind: form.get('kind') as TransactionKind, description: String(form.get('description')), category: String(form.get('category')), amount: Number(form.get('amount')), occurred_on: String(form.get('occurred_on')) };
    if (!entry.description || !entry.amount || entry.amount < 1) return;
    const optimistic: Transaction = { ...entry, id: crypto.randomUUID() };
    setTransactions((current) => [optimistic, ...current]);
    event.currentTarget.reset();
    setToast('Movimiento agregado a tu resumen');
    const { error } = await supabase.from('finedupy_transactions').insert(entry);
    if (error) setToast('Guardado localmente para esta sesión');
  };
  const removeTransaction = async (id: string) => {
    setTransactions((current) => current.filter((item) => item.id !== id));
    await supabase.from('finedupy_transactions').delete().eq('id', id);
    setToast('Movimiento eliminado');
  };

  return (
    <div className="app-shell">
      <aside className={`sidebar ${mobileOpen ? 'sidebar-open' : ''}`}>
        <div className="brand"><div className="brand-mark"><Sparkles size={19} /></div><div><strong>FINEDUPY</strong><span>Decisiones que transforman</span></div><button className="icon-button mobile-close" onClick={() => setMobileOpen(false)} aria-label="Cerrar menú"><X size={20} /></button></div>
        <div className="workspace"><div className="avatar">MC</div><div><span className="eyebrow">Mi espacio</span><strong>María Carla</strong></div><ChevronRight size={16} className="muted-icon" /></div>
        <nav>{navItems.map(({ id, label, icon: Icon, caption }) => <button key={id} className={`nav-item ${view === id ? 'active' : ''}`} onClick={() => selectView(id)}><Icon size={19} /><span><strong>{label}</strong><small>{caption}</small></span>{view === id && <span className="active-dot" />}</button>)}</nav>
        <div className="sidebar-bottom"><div className="tip-mini"><Lightbulb size={18} /><div><strong>Tip del día</strong><p>Separar tus gastos fijos te ayuda a decidir con claridad.</p></div></div><div className="secure-note"><ShieldCheck size={15} /> Tus datos están protegidos</div></div>
      </aside>
      <div className="mobile-backdrop" onClick={() => setMobileOpen(false)} />
      <main className="main-content">
        <header className="topbar"><button className="icon-button mobile-menu" onClick={() => setMobileOpen(true)} aria-label="Abrir menú"><Menu size={21} /></button><div className="breadcrumb"><span>Mi espacio</span><ChevronRight size={14} /><strong>{navItems.find((item) => item.id === view)?.label}</strong></div><div className="topbar-actions"><div className="month-chip"><Clock3 size={15} /> Octubre 2026</div><div className="user-badge">MC</div></div></header>
        <div className="page-content">
          {view === 'overview' && <Overview income={income} expenses={expenses} balance={balance} transactions={transactions} expenseByCategory={expenseByCategory} healthScore={score} onNavigate={selectView} />}
          {view === 'diagnostico' && <Diagnosis profile={profile} setProfile={setProfile} answers={answers} setAnswers={setAnswers} done={diagnosisDone} setDone={setDiagnosisDone} score={score} />}
          {view === 'movimientos' && <Transactions transactions={transactions} income={income} expenses={expenses} onAdd={addTransaction} onRemove={removeTransaction} />}
          {view === 'presupuesto' && <Budget income={income} expenses={expenses} transactions={transactions} onNotify={setToast} />}
          {view === 'simuladores' && <Simulators />}
          {view === 'aprende' && <Learn profile={profile} score={score} onNavigate={selectView} />}
        </div>
      </main>
      {toast && <div className="toast"><Check size={17} /> {toast}</div>}
    </div>
  );
}

function PageIntro({ eyebrow, title, description, action }: { eyebrow: string; title: string; description: string; action?: React.ReactNode }) { return <div className="page-intro"><div><span className="eyebrow teal">{eyebrow}</span><h1>{title}</h1><p>{description}</p></div>{action}</div>; }
function StatCard({ label, value, change, icon: Icon, tone }: { label: string; value: string; change: string; icon: LucideIcon; tone: 'teal' | 'blue' | 'amber' }) { return <div className="stat-card"><div className={`stat-icon ${tone}`}><Icon size={20} /></div><div className="stat-copy"><span>{label}</span><strong>{value}</strong><small className={change.startsWith('+') ? 'positive' : ''}>{change}</small></div></div>; }

function Overview({ income, expenses, balance, transactions, expenseByCategory, healthScore, onNavigate }: { income: number; expenses: number; balance: number; transactions: Transaction[]; expenseByCategory: { category: string; amount: number }[]; healthScore: number; onNavigate: (view: View) => void }) {
  const maxExpense = Math.max(...expenseByCategory.map((item) => item.amount), 1);
  return <>
    <PageIntro eyebrow="Buenos días, María Carla" title="Tu dinero, más claro." description="Una vista simple para aprender, organizar y tomar mejores decisiones financieras." action={<button className="button primary" onClick={() => onNavigate('movimientos')}><Plus size={17} /> Agregar movimiento</button>} />
    <div className="stats-grid"><StatCard label="Saldo disponible" value={formatGs(balance)} change="+8,4% vs. mes anterior" icon={WalletCards} tone="teal" /><StatCard label="Ingresos del mes" value={formatGs(income)} change="+12,1% este mes" icon={ArrowUpRight} tone="blue" /><StatCard label="Gastos del mes" value={formatGs(expenses)} change="Dentro de tu presupuesto" icon={ArrowDownRight} tone="amber" /></div>
    <div className="content-grid overview-grid"><section className="card health-card"><div className="section-heading"><div><span className="eyebrow">Tu indicador</span><h2>Salud financiera</h2></div><button className="text-button" onClick={() => onNavigate('diagnostico')}>Ver diagnóstico <ArrowRight size={15} /></button></div><div className="health-content"><div className="score-ring" style={{ background: `conic-gradient(#1bb3a3 0 ${healthScore}%, #e7eff2 ${healthScore}% 100%)` }}><div><strong>{healthScore}</strong><span>/100</span></div></div><div><span className="status-pill good">Buen punto de partida</span><h3>Vas por buen camino</h3><p>Tu balance mensual es positivo. El próximo paso es convertir parte de este saldo en una meta concreta.</p><button className="link-button" onClick={() => onNavigate('presupuesto')}>Planificar mi mes <ChevronRight size={15} /></button></div></div><div className="health-scale"><span><i className="dot teal-dot" /> Excelente</span><span><i className="dot green-dot" /> Saludable</span><span><i className="dot gray-dot" /> A mejorar</span></div></section><section className="card goal-card"><div className="goal-orb"><Target size={22} /></div><span className="eyebrow">Meta sugerida</span><h2>Fondo de tranquilidad</h2><p>Construye un respaldo de 3 meses de gastos para sentirte más seguro.</p><div className="goal-value"><strong>{formatGs(3200000)}</strong><span>de {formatGs(6000000)}</span></div><div className="progress"><span style={{ width: '53%' }} /></div><div className="goal-footer"><span>53% completado</span><button className="icon-button" onClick={() => onNavigate('presupuesto')} aria-label="Abrir presupuesto"><ArrowRight size={17} /></button></div></section></div>
    <div className="content-grid lower-grid"><section className="card"><div className="section-heading"><div><span className="eyebrow">Actividad reciente</span><h2>Últimos movimientos</h2></div><button className="text-button" onClick={() => onNavigate('movimientos')}>Ver todos <ArrowRight size={15} /></button></div><div className="transaction-list">{transactions.length ? transactions.slice(0, 4).map((item) => <TransactionRow key={item.id} item={item} />) : <EmptyState title="Todavía no hay movimientos" text="Registrá tu primer ingreso o gasto para comenzar a ver tu panorama." actionLabel="Registrar movimiento" onAction={() => onNavigate('movimientos')} />}</div></section><section className="card distribution-card"><div className="section-heading"><div><span className="eyebrow">Este mes</span><h2>Distribución de gastos</h2></div><button className="icon-button" onClick={() => onNavigate('movimientos')} aria-label="Ver movimientos"><ChevronRight size={17} /></button></div><div className="bars">{expenseByCategory.length ? expenseByCategory.slice(0, 4).map((item) => <div className="bar-row" key={item.category}><div><span>{item.category}</span><strong>{formatGs(item.amount)}</strong></div><div className="bar-track"><span style={{ width: `${(item.amount / maxExpense) * 100}%` }} /></div></div>) : <EmptyState title="Sin gastos registrados" text="Tu distribución aparecerá cuando agregues un gasto." actionLabel="Agregar gasto" onAction={() => onNavigate('movimientos')} />}</div></section></div>
  </>;
}

function TransactionRow({ item, onRemove }: { item: Transaction; onRemove?: (id: string) => void }) { return <div className="transaction-row"><div className={`movement-icon ${item.kind}`} >{item.kind === 'income' ? <ArrowDownRight size={17} /> : <ArrowUpRight size={17} />}</div><div className="movement-info"><strong>{item.description}</strong><span>{item.category} · {shortDate(item.occurred_on)}</span></div><strong className={`movement-amount ${item.kind}`}>{item.kind === 'income' ? '+' : '-'}{formatGs(item.amount)}</strong>{onRemove && <button className="icon-button delete-button" onClick={() => onRemove(item.id)} aria-label="Eliminar movimiento"><Trash2 size={16} /></button>}</div>; }
function EmptyState({ title, text, actionLabel, onAction }: { title: string; text: string; actionLabel: string; onAction: () => void }) { return <div className="empty-state"><div className="empty-icon"><WalletCards size={20} /></div><strong>{title}</strong><p>{text}</p><button className="text-button" onClick={onAction}>{actionLabel} <ArrowRight size={15} /></button></div>; }

function Diagnosis({ profile, setProfile, answers, setAnswers, done, setDone, score }: { profile: Profile; setProfile: (profile: Profile) => void; answers: number[]; setAnswers: (answers: number[]) => void; done: boolean; setDone: (done: boolean) => void; score: number }) {
  const questions = ['¿Llevas un registro de tus gastos?', '¿Tienes una meta de ahorro definida?', '¿Conoces cuánto pagas en deudas al mes?', '¿Separás tus gastos personales de los del negocio?'];
  const options = ['Todavía no', 'A veces', 'Sí, siempre'];
  return <><PageIntro eyebrow="Conocerte es el primer paso" title="Tu perfil financiero" description="Respondé estas preguntas para recibir recomendaciones hechas para tu realidad." /><section className="card diagnosis-card"><div className="profile-picker"><div className="section-heading"><div><span className="eyebrow">01 / Tu contexto</span><h2>¿Con qué perfil te identificás?</h2></div></div><div className="profile-options">{(['Joven', 'Emprendedor', 'MIPYME'] as Profile[]).map((item) => <button key={item} className={`profile-option ${profile === item ? 'selected' : ''}`} onClick={() => setProfile(item)}>{item === 'Joven' ? <UserRound size={21} /> : item === 'Emprendedor' ? <BriefcaseBusiness size={21} /> : <Landmark size={21} />}<strong>{item}</strong><span>{item === 'Joven' ? 'Ordená tu futuro' : item === 'Emprendedor' ? 'Crecé con claridad' : 'Gestioná mejor'}</span>{profile === item && <Check size={16} />}</button>)}</div></div><div className="diagnosis-test"><div className="section-heading"><div><span className="eyebrow">02 / Hábitos</span><h2>Diagnóstico rápido</h2></div><span className="step-count">4 preguntas</span></div>{questions.map((question, index) => <div className="question" key={question}><strong><span>0{index + 1}</span>{question}</strong><div className="answer-options">{options.map((option, optionIndex) => <button key={option} className={answers[index] === optionIndex + 1 ? 'selected' : ''} onClick={() => { const next = [...answers]; next[index] = optionIndex + 1; setAnswers(next); }}>{option}</button>)}</div></div>)}<button className="button primary full-button" onClick={() => setDone(true)}>Ver mi resultado <ArrowRight size={17} /></button>{done && <div className="diagnosis-result"><div className="result-score"><strong>{score}</strong><span>/100</span></div><div><span className="status-pill good">Perfil {profile}</span><h3>{score >= 75 ? 'Excelente base para crecer' : 'Hay oportunidades para avanzar'}</h3><p>{score >= 75 ? 'Tus hábitos ya están creando una buena relación con el dinero. Enfocate en automatizar tu ahorro y proteger tus metas.' : 'Empezá por registrar tus gastos durante 30 días. Con datos claros, cada decisión se vuelve más fácil.'}</p></div></div>}</div></section></>;
}

function Transactions({ transactions, income, expenses, onAdd, onRemove }: { transactions: Transaction[]; income: number; expenses: number; onAdd: (event: FormEvent<HTMLFormElement>) => void; onRemove: (id: string) => void }) { return <><PageIntro eyebrow="Cada guaraní cuenta" title="Tus movimientos" description="Registrá ingresos y gastos para entender hacia dónde va tu dinero." /><div className="movement-summary"><div><span>Saldo disponible</span><strong>{formatGs(income - expenses)}</strong></div><div><span>Ingresos</span><strong className="income-text">{formatGs(income)}</strong></div><div><span>Gastos</span><strong className="expense-text">{formatGs(expenses)}</strong></div></div><div className="content-grid transactions-grid"><section className="card form-card"><div className="section-heading"><div><span className="eyebrow">Nuevo registro</span><h2>Agregar movimiento</h2></div><CircleDollarSign size={24} className="heading-icon" /></div><form onSubmit={onAdd}><label>Tipo de movimiento<select name="kind" defaultValue="expense"><option value="expense">Gasto</option><option value="income">Ingreso</option></select></label><label>Descripción<input name="description" placeholder="Ej. Compra de supermercado" required /></label><label>Monto en Guaraníes<div className="input-with-prefix"><span>Gs.</span><input name="amount" type="number" min="1" placeholder="0" required /></div></label><label>Categoría<select name="category" defaultValue="Alimentos">{categories.map((category) => <option key={category}>{category}</option>)}</select></label><label>Fecha<input name="occurred_on" type="date" defaultValue="2026-10-22" /></label><button className="button primary full-button" type="submit"><Plus size={17} /> Guardar movimiento</button></form></section><section className="card"><div className="section-heading"><div><span className="eyebrow">Historial</span><h2>Movimientos recientes</h2></div><span className="count-badge">{transactions.length}</span></div><div className="transaction-list all-transactions">{transactions.length ? transactions.map((item) => <TransactionRow item={item} onRemove={onRemove} key={item.id} />) : <EmptyState title="Tu historial está vacío" text="Comenzá registrando tu primer movimiento para ordenar tus finanzas." actionLabel="Completá el formulario" onAction={() => document.querySelector<HTMLInputElement>('input[name=description]')?.focus()} />}</div></section></div></> }

function Budget({ income, expenses, transactions, onNotify }: { income: number; expenses: number; transactions: Transaction[]; onNotify: (message: string) => void }) { const [budgetItems, setBudgetItems] = useState([{ category: 'Vivienda', limit: 2000000 }, { category: 'Alimentos', limit: 900000 }, { category: 'Transporte', limit: 450000 }, { category: 'Deudas', limit: 600000 }, { category: 'Inversión', limit: 750000 }]); const [showAdd, setShowAdd] = useState(false); const total = budgetItems.reduce((sum, item) => sum + item.limit, 0); const usedPercent = total ? Math.round((expenses / total) * 100) : 0; const addBudget = (event: FormEvent<HTMLFormElement>) => { event.preventDefault(); const form = new FormData(event.currentTarget); const category = String(form.get('category')); const limit = Number(form.get('limit')); if (!category || !limit) return; setBudgetItems((current) => [...current, { category, limit }]); setShowAdd(false); onNotify('Categoría agregada al presupuesto'); }; return <><PageIntro eyebrow="Planificá con intención" title="Presupuesto personal" description="Definí límites realistas y usá tus ingresos como una herramienta para avanzar." action={<button className="button secondary" onClick={() => setShowAdd((current) => !current)}><Plus size={17} /> Nueva categoría</button>} />{showAdd && <form className="budget-add card" onSubmit={addBudget}><label>Nombre de categoría<input name="category" placeholder="Ej. Salud" required /></label><label>Tope mensual<div className="input-with-prefix"><span>Gs.</span><input name="limit" type="number" min="1" placeholder="0" required /></div></label><button className="button primary" type="submit">Guardar tope</button></form>}<div className="budget-hero card"><div><span className="eyebrow">Presupuesto de octubre</span><h2>Tu plan está <span className="teal-text">{usedPercent > 100 ? 'bajo presión' : 'en equilibrio'}</span></h2><p>Estás usando el {usedPercent}% del presupuesto mensual proyectado.</p></div><div className="budget-ring" style={{ background: `radial-gradient(white 58%, transparent 59%), conic-gradient(#1db2a2 0 ${Math.min(usedPercent, 100)}%, #dcefeb ${Math.min(usedPercent, 100)}% 100%)` }}><strong>{usedPercent}%</strong><span>utilizado</span></div><div className="budget-figures"><div><span>Planificado</span><strong>{formatGs(total)}</strong></div><div><span>Gastos reales</span><strong>{formatGs(expenses)}</strong></div><div><span>Ingresos</span><strong>{formatGs(income)}</strong></div></div></div><section className="card budget-list"><div className="section-heading"><div><span className="eyebrow">Control mensual</span><h2>Topes por categoría</h2></div><span className={`status-pill ${usedPercent > 100 ? 'danger' : 'good'}`}>{usedPercent > 100 ? 'Revisar gastos' : 'Sin alertas'}</span></div>{budgetItems.map((item) => { const spent = transactions.filter((transaction) => transaction.kind === 'expense' && transaction.category === item.category).reduce((sum, transaction) => sum + transaction.amount, 0); const percent = Math.min((spent / item.limit) * 100, 100); return <div className="budget-row" key={item.category}><div className="budget-label"><strong>{item.category}</strong><span>{formatGs(spent)} de {formatGs(item.limit)}</span></div><div className="progress budget-progress"><span className={percent > 85 ? 'danger' : percent > 65 ? 'warning' : ''} style={{ width: `${percent}%` }} /></div><strong className={percent > 85 ? 'expense-text' : ''}>{Math.round(percent)}%</strong></div>})}<div className="budget-note"><Lightbulb size={18} /><span>Tu regla 50/30/20 sugerida: necesidades, gustos y ahorro. Este mes todavía tenés margen para aumentar tu fondo de tranquilidad.</span></div></section></> }

function Simulators() { const [tab, setTab] = useState<'ahorro' | 'prestamo' | 'formalizacion'>('ahorro'); const [principal, setPrincipal] = useState(1500000); const [monthly, setMonthly] = useState(500000); const [months, setMonths] = useState(12); const [rate, setRate] = useState(8); const [loan, setLoan] = useState(12000000); const [loanMonths, setLoanMonths] = useState(24); const monthlyRate = rate / 100 / 12; const savings = principal * Math.pow(1 + monthlyRate, months) + monthly * ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate); const payment = loan * (monthlyRate * Math.pow(1 + monthlyRate, loanMonths)) / (Math.pow(1 + monthlyRate, loanMonths) - 1); const tabs = [{ id: 'ahorro', label: 'Ahorro', icon: PiggyBank }, { id: 'prestamo', label: 'Préstamo', icon: CreditCard }, { id: 'formalizacion', label: 'Formalización EAS', icon: Landmark }]; return <><PageIntro eyebrow="Probá escenarios" title="Simuladores financieros" description="Tomá decisiones con números claros, en Guaraníes y adaptados a Paraguay." /><div className="sim-tabs">{tabs.map(({ id, label, icon: Icon }) => <button key={id} className={tab === id ? 'active' : ''} onClick={() => setTab(id as typeof tab)}><Icon size={17} /> {label}</button>)}</div>{tab === 'ahorro' && <SimulatorCard title="¿Cuánto puede crecer tu ahorro?" description="Simulá un plazo fijo con interés compuesto y aportes mensuales constantes."><div className="sim-layout"><div className="sim-form"><MoneyField label="Capital inicial" value={principal} onChange={setPrincipal} /><MoneyField label="Aporte mensual" value={monthly} onChange={setMonthly} /><RangeField label="Plazo" value={months} min={3} max={60} suffix="meses" onChange={setMonths} /><RangeField label="Tasa anual estimada" value={rate} min={1} max={20} suffix="%" onChange={setRate} /></div><ResultPanel label="Capital proyectado" value={formatGs(savings)} accent="teal" details={[['Total aportado', formatGs(principal + monthly * months)], ['Interés ganado', formatGs(savings - principal - monthly * months)], ['Tasa aplicada', `${rate}% anual`]]}/></div></SimulatorCard>}{tab === 'prestamo' && <SimulatorCard title="Calculá tu cuota estimada" description="Conocé el impacto mensual de un préstamo antes de tomar una decisión."><div className="sim-layout"><div className="sim-form"><MoneyField label="Capital solicitado" value={loan} onChange={setLoan} /><RangeField label="Plazo" value={loanMonths} min={6} max={60} suffix="meses" onChange={setLoanMonths} /><RangeField label="Tasa anual hipotética" value={rate} min={5} max={35} suffix="%" onChange={setRate} /></div><ResultPanel label="Cuota mensual estimada" value={formatGs(payment)} accent="blue" details={[['Total a devolver', formatGs(payment * loanMonths)], ['Intereses estimados', formatGs(payment * loanMonths - loan)], ['Tasa aplicada', `${rate}% anual`]]}/></div></SimulatorCard>}{tab === 'formalizacion' && <SimulatorCard title="Formalizar tu negocio" description="Referencia del pitch: USD 1.200 convertidos a Gs. 7.680.000 con un tipo de cambio de Gs. 6.400."><div className="formal-grid"><div className="formal-highlight"><Landmark size={25} /><span>Referencia del pitch</span><strong>Gs. 7.680.000</strong><small>USD 1.200 × tipo de cambio referencial Gs. 6.400</small></div><div className="cost-list"><CostLine label="Constitución y registros" value={formatGs(3200000)} /><CostLine label="Asesoría contable inicial" value={formatGs(1800000)} /><CostLine label="Gestiones y publicaciones" value={formatGs(1100000)} /><CostLine label="Margen administrativo" value={formatGs(1580000)} /><div className="cost-total"><span>Estimación total</span><strong>{formatGs(7680000)}</strong></div></div></div><div className="disclaimer"><ShieldCheck size={17} /> Estimación educativa. Los costos reales pueden variar según el caso y los aranceles vigentes.</div></SimulatorCard>}</> }
function MoneyField({ label, value, onChange }: { label: string; value: number; onChange: (value: number) => void }) { return <label>{label}<div className="input-with-prefix"><span>Gs.</span><input type="number" value={value} onChange={(event) => onChange(Number(event.target.value))} /></div></label>; }
function RangeField({ label, value, min, max, suffix, onChange }: { label: string; value: number; min: number; max: number; suffix: string; onChange: (value: number) => void }) { return <label>{label}<div className="range-value"><strong>{value} {suffix}</strong></div><input className="range-input" type="range" min={min} max={max} value={value} onChange={(event) => onChange(Number(event.target.value))} /></label>; }
function SimulatorCard({ title, description, children }: { title: string; description: string; children: React.ReactNode }) { return <section className="card simulator-card"><div className="simulator-heading"><div><span className="eyebrow">Simulador activo</span><h2>{title}</h2><p>{description}</p></div><div className="calculator-icon"><Calculator size={23} /></div></div>{children}</section>; }
function ResultPanel({ label, value, accent, details }: { label: string; value: string; accent: 'teal' | 'blue'; details: [string, string][] }) { return <div className={`result-panel ${accent}`}><span>{label}</span><strong>{value}</strong><div className="result-details">{details.map(([label, value]) => <div key={label}><span>{label}</span><b>{value}</b></div>)}</div><div className="result-mark"><TrendingUp size={18} /> Resultado estimado</div></div>; }
function CostLine({ label, value }: { label: string; value: string }) { return <div className="cost-line"><span>{label}</span><strong>{value}</strong></div>; }

function Learn({ profile, score, onNavigate }: { profile: Profile; score: number; onNavigate: (view: View) => void }) { const [selectedLesson, setSelectedLesson] = useState<string | null>(null); const lessons = [{ title: 'El mapa de tus gastos', category: 'Organizá', time: '4 min', color: 'teal', text: 'Aprendé a clasificar tus gastos y encontrá oportunidades sin dejar de disfrutar.', detail: 'Durante 30 días, anotá cada gasto y separalo entre necesidades, gustos y metas. Ese mapa es la base de un presupuesto realista.', icon: WalletCards }, { title: 'Ahorro con propósito', category: 'Crecé', time: '5 min', color: 'blue', text: 'Convertí una intención en una meta alcanzable con aportes pequeños y constantes.', detail: 'Elegí una meta concreta, dividila por los meses disponibles y automatizá el aporte el día que recibís tus ingresos.', icon: PiggyBank }, { title: 'Formalizá con confianza', category: 'Emprendé', time: '6 min', color: 'amber', text: 'Una guía simple sobre EAS, orden tributario y los siguientes pasos para tu negocio.', detail: 'La EAS puede ayudarte a separar las finanzas del negocio de las personales. Revisá siempre los requisitos y costos vigentes antes de iniciar.', icon: BriefcaseBusiness }]; const recommendation = profile === 'Joven' ? 'Ahorro con propósito' : profile === 'Emprendedor' ? 'El mapa de tus gastos' : 'Formalizá con confianza'; const activeLesson = lessons.find((lesson) => lesson.title === selectedLesson); return <><PageIntro eyebrow="Ruta educativa" title="Aprendé para decidir mejor" description="Píldoras cortas, prácticas y pensadas para la realidad de Paraguay." action={<button className="button secondary" onClick={() => onNavigate('diagnostico')}><Target size={17} /> Actualizar mi ruta</button>} /><div className="learn-banner"><div className="learn-banner-icon"><BookOpen size={23} /></div><div><span className="eyebrow">Ruta para {profile}</span><h2>{recommendation} es tu próximo paso</h2><p>Tu diagnóstico actual es de {score}/100. Seguí aprendiendo con contenidos aplicables a tu día a día.</p></div><div className="learn-progress"><strong>33%</strong><div className="progress"><span style={{ width: '33%' }} /></div></div></div><div className="section-heading section-heading-spaced"><div><span className="eyebrow">Recomendado para vos</span><h2>Empezá por acá</h2></div></div><div className="lesson-grid">{lessons.map(({ title, category, time, color, text, icon: Icon }) => <article className={`lesson-card ${title === recommendation ? 'recommended' : ''}`} key={title}><div className={`lesson-icon ${color}`}><Icon size={22} /></div><div className="lesson-meta"><span>{title === recommendation ? 'Siguiente recomendado' : category}</span><small><Clock3 size={13} /> {time}</small></div><h3>{title}</h3><p>{text}</p><button className="lesson-link" onClick={() => setSelectedLesson(title)}>Comenzar módulo <ArrowRight size={15} /></button></article>)}</div>{activeLesson && <div className="lesson-detail"><div><span className="eyebrow">Módulo abierto</span><h3>{activeLesson.title}</h3><p>{activeLesson.detail}</p></div><button className="button secondary" onClick={() => setSelectedLesson(null)}>Cerrar</button></div>}<div className="micro-tip"><Lightbulb size={20} /><div><strong>Tip paraguayo</strong><span>Si tus ingresos cambian mes a mes, armá tu presupuesto usando el promedio de los últimos tres meses.</span></div></div></> }

export default App;
