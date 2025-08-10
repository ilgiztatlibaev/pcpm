import React, { useMemo, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { Search, Settings, Plus, Download, Upload, ChartPie, LayoutDashboard, Table as TableIcon } from "lucide-react";

const Button = ({ className = "", children, ...props }) => (
  <button className={`px-3 py-2 rounded-2xl shadow-sm text-sm hover:shadow transition ${className}`} {...props}>{children}</button>
);
const Card = ({ className = "", children }) => <div className={`rounded-2xl shadow-sm bg-white border border-slate-200 ${className}`}>{children}</div>;
const CardHeader = ({ children }) => <div className="p-4 border-b border-slate-100">{children}</div>;
const CardContent = ({ children, className = "" }) => <div className={`p-4 ${className}`}>{children}</div>;
const Input = (props) => <input className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-sky-400" {...props} />;
const Select = ({ value, onChange, children }) => <select className="px-3 py-2 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-sky-400" value={value} onChange={onChange}>{children}</select>;
const Badge = ({ children, intent = "default" }) => {
  const map = { default:"bg-slate-100 text-slate-700", green:"bg-emerald-100 text-emerald-700", blue:"bg-sky-100 text-sky-700", amber:"bg-amber-100 text-amber-800", violet:"bg-violet-100 text-violet-700" };
  return <span className={`text-xs px-2 py-1 rounded-lg ${map[intent] || map.default}`}>{children}</span>;
};

const demo = [
  { id:1, sub:"Облако A", name:"Сервер 2U", goal:"Расширение кластера", qtyPlan:20, qtyOrdered:20, qtyShipped:12, unitPrice:3200, currency:"USD", initiator:"Иванов", paid:18000, month:3 },
  { id:2, sub:"Облако A", name:"Лицензия Kubernetes", goal:"Подписка", qtyPlan:1, qtyOrdered:1, qtyShipped:1, unitPrice:900000, currency:"RUB", initiator:"Петров", paid:900000, month:2 },
  { id:3, sub:"Облако B", name:"SSD 3.84TB", goal:"Хранилище", qtyPlan:60, qtyOrdered:40, qtyShipped:0, unitPrice:260, currency:"USD", initiator:"Сидорова", paid:0, month:4 },
  { id:4, sub:"Сеть", name:"Коммутатор 48p", goal:"ToR", qtyPlan:8, qtyOrdered:8, qtyShipped:8, unitPrice:1800, currency:"USD", initiator:"Иванов", paid:14400, month:1 },
  { id:5, sub:"Безопасность", name:"NGFW лицензии", goal:"Подписка", qtyPlan:4, qtyOrdered:0, qtyShipped:0, unitPrice:240000, currency:"RUB", initiator:"Орлова", paid:0, month:5 },
  { id:6, sub:"Облако B", name:"Сервер 1U", goal:"Нод расчёта", qtyPlan:0, qtyOrdered:0, qtyShipped:0, unitPrice:2200, currency:"USD", initiator:"Петров", paid:0, month:6 },
  { id:7, sub:"Сеть", name:"Оптика 10G", goal:"Линк", qtyPlan:120, qtyOrdered:60, qtyShipped:60, unitPrice:45, currency:"USD", initiator:"Ли", paid:2700, month:2 },
  { id:8, sub:"ДЦ", name:"Стойка 42U", goal:"Инфраструктура", qtyPlan:2, qtyOrdered:2, qtyShipped:2, unitPrice:210000, currency:"RUB", initiator:"Мартынов", paid:420000, month:1 },
];

const usdToRub = 92;
const toRUB = (x, cur) => (cur === "USD" ? x * usdToRub : x);
const computeStatus = ({ qtyPlan, qtyOrdered, qtyShipped }) => {
  if (qtyPlan === 0) return { label:"TBD", color:"amber" };
  if (qtyShipped >= qtyPlan) return { label:"Отгружено полностью", color:"green" };
  if (qtyShipped > 0 && qtyShipped < qtyPlan) return { label:"Отгружено частично", color:"violet" };
  if (qtyOrdered > 0) return { label:"В закупке", color:"blue" };
  return { label:"Планируется", color:"default" };
};
const money = (n) => new Intl.NumberFormat("ru-RU").format(Math.round(n));
const Progress = ({ value }) => (<div className="w-full h-2 rounded-full bg-slate-100"><div className="h-2 rounded-full bg-sky-400" style={{ width: `${Math.min(100, Math.max(0, value))}%` }} /></div>);

export default function UIProcurementMachine(){
  const [currencyUI, setCurrencyUI] = useState("RUB");
  const [tab, setTab] = useState("plan");
  const [query, setQuery] = useState("");
  const [subFilter, setSubFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const enriched = useMemo(()=> demo.map(d => {
    const status = computeStatus(d);
    const total = d.unitPrice * d.qtyPlan;
    const totalUI = currencyUI === "RUB" ? toRUB(total, d.currency) : (d.currency === "USD" ? total : total / usdToRub);
    const paidUI  = currencyUI === "RUB" ? toRUB(d.paid, d.currency)   : (d.currency === "USD" ? d.paid  : d.paid  / usdToRub);
    return { ...d, status, totalUI, paidUI };
  }), [currencyUI]);

  const filtered = useMemo(()=> enriched.filter(r => {
    const bySearch = (r.name+" "+r.goal+" "+r.sub+" "+r.initiator).toLowerCase().includes(query.toLowerCase());
    const bySub = subFilter === "all" || r.sub === subFilter;
    const byStatus = statusFilter === "all" || r.status.label === statusFilter;
    return bySearch && bySub && byStatus;
  }), [enriched, query, subFilter, statusFilter]);

  const plannedPositions = enriched.filter(r=>r.qtyPlan>0).length;
  const inProc        = enriched.filter(r=>r.status.label==="В закупке").length;
  const shippedFull   = enriched.filter(r=>r.status.label==="Отгружено полностью").length;
  const shippedPart   = enriched.filter(r=>r.status.label==="Отгружено частично").length;
  const planSum = enriched.reduce((a,r)=>a+r.totalUI,0);
  const paidSum = enriched.reduce((a,r)=>a+r.paidUI,0);
  const spendProgress = planSum ? Math.min(100,(paidSum/planSum)*100) : 0;

  const subprojects = ["all", ...Array.from(new Set(enriched.map(r=>r.sub)))];
  const statuses    = ["all", ...Array.from(new Set(enriched.map(r=>r.status.label)))];

  const monthly = useMemo(()=> {
    const m = Array.from({length:6},(_,i)=>i+1);
    return m.map(mm=>{
      const rows = enriched.filter(r=>r.month===mm);
      return { month:`М${mm}`, План: rows.reduce((a,b)=>a+b.totalUI,0), Оплачено: rows.reduce((a,b)=>a+b.paidUI,0) };
    });
  },[enriched]);

  const pieData = useMemo(()=>{
    const map = new Map();
    enriched.forEach(r=> map.set(r.sub, (map.get(r.sub)||0) + r.totalUI));
    return Array.from(map.entries()).map(([name,value])=>({name,value}));
  },[enriched]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 text-slate-800">
      <div className="sticky top-0 z-10 backdrop-blur supports-[backdrop-filter]:bg-white/70 bg-white/60 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-3">
          <div className="flex items-center gap-2 text-sky-600 font-semibold">
            <ChartPie className="w-5 h-5" /><span>Public Cloud Procurement Machine</span>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <Select value={currencyUI} onChange={(e)=>setCurrencyUI(e.target.value)}>
              <option value="RUB">RUB</option><option value="USD">USD</option>
            </Select>
            <Button className="bg-slate-900 text-white hidden sm:inline-flex"><Upload className="w-4 h-4 mr-2" />Импорт</Button>
            <Button className="bg-white border border-slate-200"><Download className="w-4 h-4 mr-2" />Экспорт</Button>
            <Button className="bg-white border border-slate-200"><Settings className="w-4 h-4 mr-2" />Настройки</Button>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 pb-2">
          <div className="flex gap-2">
            <TabButton icon={<LayoutDashboard className="w-4 h-4" />} active={tab==='dashboard'} onClick={()=>setTab('dashboard')}>Дашборд</TabButton>
            <TabButton icon={<TableIcon className="w-4 h-4" />} active={tab==='plan'} onClick={()=>setTab('plan')}>План-график</TabButton>
            <TabButton icon={<ChartPie className="w-4 h-4" />} active={tab==='reports'} onClick={()=>setTab('reports')}>Отчёты</TabButton>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 py-6">
        {tab==='dashboard' && <DashboardView plannedPositions={plannedPositions} inProc={inProc} shippedFull={shippedFull} shippedPart={shippedPart} planSum={planSum} paidSum={paidSum} spendProgress={spendProgress} currencyUI={currencyUI} monthly={monthly} pieData={pieData} />}
        {tab==='plan' && <PlanView data={filtered} query={query} setQuery={setQuery} subFilter={subFilter} setSubFilter={setSubFilter} statusFilter={statusFilter} setStatusFilter={setStatusFilter} subprojects={subprojects} statuses={statuses} currencyUI={currencyUI} />}
        {tab==='reports' && <ReportsView monthly={monthly} currencyUI={currencyUI} pieData={pieData} />}
      </main>
    </div>
  );
}

const TabButton = ({ active, children, icon, onClick }) => (
  <button onClick={onClick} className={`flex items-center gap-2 px-3 py-2 rounded-xl border ${active ? "bg-slate-900 text-white border-slate-900" : "bg-white text-slate-700 border-slate-200"}`}>{icon}{children}</button>
);

function DashboardView({ plannedPositions, inProc, shippedFull, shippedPart, planSum, paidSum, spendProgress, currencyUI, monthly, pieData }){
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <Card className="lg:col-span-2">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div><div className="text-sm text-slate-500">Запланировано позиций</div><div className="text-2xl font-semibold">{plannedPositions}</div></div>
            <div className="text-right"><div className="text-sm text-slate-500">В закупке</div><div className="text-2xl font-semibold">{inProc}</div></div>
            <div className="text-right hidden sm:block"><div className="text-sm text-slate-500">Отгружено полностью</div><div className="text-2xl font-semibold">{shippedFull}</div></div>
            <div className="text-right hidden sm:block"><div className="text-sm text-slate-500">Отгружено частично</div><div className="text-2xl font-semibold">{shippedPart}</div></div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="flex items-end justify-between mb-2">
                <div><div className="text-sm text-slate-500">План затрат</div><div className="text-xl font-semibold">{money(planSum)} {currencyUI}</div></div>
                <div className="text-right"><div className="text-sm text-slate-500">Оплачено</div><div className="text-xl font-semibold">{money(paidSum)} {currencyUI}</div></div>
              </div>
              <Progress value={spendProgress} />
              <div className="text-xs text-slate-500 mt-1">Прогресс оплаты: {spendProgress.toFixed(0)}%</div>
              <div className="h-64 mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthly}><XAxis dataKey="month" /><YAxis /><Tooltip /><Bar dataKey="План" /><Bar dataKey="Оплачено" /></BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div>
              <div className="text-sm text-slate-500 mb-2">Доля бюджета по субпроектам</div>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart><Pie data={pieData} dataKey="value" nameKey="name" outerRadius={100} label>{pieData.map((_, i) => <Cell key={i} />)}</Pie><Tooltip /></PieChart>
                </ResponsiveContainer>
              </div>
              <div className="grid grid-cols-2 gap-2 mt-2">
                {pieData.map(p => (<div key={p.name} className="flex items-center justify-between text-sm bg-slate-50 p-2 rounded-xl"><span>{p.name}</span><span className="font-medium">{money(p.value)} {currencyUI}</span></div>))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><div className="font-medium">Быстрые действия</div></CardHeader>
        <CardContent>
          <div className="flex flex-col gap-2">
            <Button className="bg-sky-600 text-white"><Plus className="w-4 h-4 mr-2" />Новая позиция</Button>
            <Button className="bg-white border border-slate-200"><Upload className="w-4 h-4 mr-2" />Импорт из Excel</Button>
            <Button className="bg-white border border-slate-200"><Download className="w-4 h-4 mr-2" />Выгрузить отчёт (PDF)</Button>
          </div>
          <div className="mt-4 text-xs text-slate-500">*Действия демонстрационные.</div>
        </CardContent>
      </Card>
    </div>
  );
}

function PlanView({ data, query, setQuery, subFilter, setSubFilter, statusFilter, setStatusFilter, subprojects, statuses, currencyUI }){
  return (
    <div className="space-y-4">
      <Card><CardContent>
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <Input placeholder="Поиск по названию, цели, инициатору…" value={query} onChange={(e)=>setQuery(e.target.value)} style={{ paddingLeft: 36 }} />
          </div>
          <div className="flex gap-2">
            <Select value={subFilter} onChange={(e)=>setSubFilter(e.target.value)}>{subprojects.map(s => <option key={s} value={s}>{s==="all"?"Все субпроекты":s}</option>)}</Select>
            <Select value={statusFilter} onChange={(e)=>setStatusFilter(e.target.value)}>{statuses.map(s => <option key={s} value={s}>{s==="all"?"Все статусы":s}</option>)}</Select>
          </div>
        </div>
      </CardContent></Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="font-medium">План-график</div>
            <Button className="bg-slate-900 text-white"><Plus className="w-4 h-4 mr-2" />Добавить позицию</Button>
          </div>
        </CardHeader>
        <CardContent className="overflow-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-slate-500">
                <th className="py-2 pr-4">Субпроект</th><th className="py-2 pr-4">Наименование</th><th className="py-2 pr-4">Цель</th>
                <th className="py-2 pr-4">Кол-во (план)</th><th className="py-2 pr-4">Заказано</th><th className="py-2 pr-4">Отгружено</th>
                <th className="py-2 pr-4">Статус</th><th className="py-2 pr-4">Сумма ({currencyUI})</th><th className="py-2 pr-4">Оплачено ({currencyUI})</th>
              </tr>
            </thead>
            <tbody>
              {data.map(r=>(
                <tr key={r.id} className="border-t border-slate-100 hover:bg-slate-50">
                  <td className="py-2 pr-4 whitespace-nowrap">{r.sub}</td>
                  <td className="py-2 pr-4 min-w-[200px]">{r.name}</td>
                  <td className="py-2 pr-4 min-w-[200px] text-slate-600">{r.goal}</td>
                  <td className="py-2 pr-4">{r.qtyPlan}</td>
                  <td className="py-2 pr-4">{r.qtyOrdered}</td>
                  <td className="py-2 pr-4">{r.qtyShipped}</td>
                  <td className="py-2 pr-4"><Badge intent={r.status.color}>{r.status.label}</Badge></td>
                  <td className="py-2 pr-4 font-medium">{money(r.totalUI)}</td>
                  <td className="py-2 pr-4 text-slate-700">{money(r.paidUI)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><div className="font-medium">Пояснения к статусам</div></CardHeader>
        <CardContent>
          <ul className="text-sm space-y-1 list-disc pl-5 text-slate-700">
            <li><b>TBD</b> — planned_qty = 0</li>
            <li><b>Планируется</b> — planned_qty &gt; 0, без заказов/отгрузок</li>
            <li><b>В закупке</b> — ordered_qty &gt; 0</li>
            <li><b>Отгружено частично</b> — 0 &lt; shipped_qty &lt; planned_qty</li>
            <li><b>Отгружено полностью</b> — shipped_qty ≥ planned_qty</li>
            <li><b>Оплачено</b> — сумма, не влияет на статус</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}

function ReportsView({ monthly, currencyUI, pieData }){
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <Card className="lg:col-span-2">
        <CardHeader><div className="flex items-center justify-between"><div className="font-medium">Динамика затрат по месяцам</div><Button className="bg-white border border-slate-200"><Download className="w-4 h-4 mr-2" />Скачать отчёт</Button></div></CardHeader>
        <CardContent>
          <div className="h-80"><ResponsiveContainer width="100%" height="100%"><BarChart data={monthly}><XAxis dataKey="month" /><YAxis /><Tooltip /><Bar dataKey="План" /><Bar dataKey="Оплачено" /></BarChart></ResponsiveContainer></div>
          <div className="text-xs text-slate-500 mt-2">Валюта интерфейса: {currencyUI}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader><div className="font-medium">Структура бюджета по субпроектам</div></CardHeader>
        <CardContent>
          <div className="h-64"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={pieData} dataKey="value" nameKey="name" outerRadius={100} label>{pieData.map((_, i) => <Cell key={i} />)}</Pie><Tooltip /></PieChart></ResponsiveContainer></div>
          <div className="text-xs text-slate-500">Клик по сектору — перейти к фильтру (в проде).</div>
        </CardContent>
      </Card>
    </div>
  );
}
