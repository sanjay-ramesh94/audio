import { LayoutDashboard, History, Settings, Upload, LogOut, ChevronRight } from 'lucide-react';
import { cn } from '../lib/utils';

interface SidebarProps {
    activeTab: string;
    setActiveTab: (tab: string) => void;
}

export function Sidebar({ activeTab, setActiveTab }: SidebarProps) {
    const menuItems = [
        { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
        { id: 'upload', icon: Upload, label: 'New Recording' },
        { id: 'history', icon: History, label: 'History' },
        { id: 'settings', icon: Settings, label: 'Settings' },
    ];

    return (
        <aside className="w-64 h-full bg-slate-900/50 backdrop-blur-xl border-r border-slate-800 flex flex-col p-6 space-y-8">
            <div className="flex items-center space-x-3 px-2">
                <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
                    <Upload className="text-white w-6 h-6" />
                </div>
                <div>
                    <h1 className="text-xl font-bold text-white tracking-tight">Antigravity</h1>
                    <p className="text-[10px] uppercase tracking-widest text-slate-500 font-semibold">Intelligence</p>
                </div>
            </div>

            <nav className="flex-1 space-y-2">
                {menuItems.map((item) => (
                    <button
                        key={item.id}
                        onClick={() => setActiveTab(item.id)}
                        className={cn(
                            "w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-300 group",
                            activeTab === item.id
                                ? "bg-indigo-600/10 text-indigo-400 border border-indigo-500/20 shadow-[0_0_20px_rgba(79,70,229,0.05)]"
                                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 border border-transparent"
                        )}
                    >
                        <div className="flex items-center space-x-3">
                            <item.icon className={cn("w-5 h-5", activeTab === item.id ? "text-indigo-400" : "text-slate-500")} />
                            <span className="font-medium">{item.label}</span>
                        </div>
                        {activeTab === item.id && (
                            <ChevronRight className="w-4 h-4 text-indigo-400 animate-in fade-in slide-in-from-left-2" />
                        )}
                    </button>
                ))}
            </nav>

            <div className="pt-6 border-t border-slate-800">
                <button className="w-full flex items-center space-x-3 px-4 py-3 text-slate-400 hover:text-red-400 hover:bg-red-500/5 rounded-xl transition-all group">
                    <LogOut className="w-5 h-5 group-hover:rotate-180 transition-transform duration-500" />
                    <span className="font-medium">Sign Out</span>
                </button>
            </div>
        </aside>
    );
}
