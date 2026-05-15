import {useMemo, useState } from "react";
import { usePuzzle } from "../context/PuzzleContext";
import { ArrowLeft, Crown, Medal, Trophy } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function LeaderboardPage() {
    const { records, personalBests } = usePuzzle();
    const [activeTab, setActiveTab] = useState(3);
    const navigate = useNavigate();

    const myBest = personalBests[activeTab] || 0;

    const { top10, myRank } = useMemo(() => {
        const sorted = records.filter(r => r.size === activeTab && r.step > 0).sort((a, b) => a.step - b.step);
        const top10 = sorted.slice(0, 10);
        let rank = "—";
        if (myBest > 0) {
            const idx = sorted.findIndex(r => r.step >= myBest);
            const r = idx === -1 ? sorted.length : idx + 1;
            rank = r > 10 ? "10+" : `${r}`;
        }
        return { top10, myRank: rank };
    }, [records, activeTab, myBest]);

    const RANK_ICONS = [
        <Crown key="1" size={22} className="text-yellow-400 fill-yellow-300" />,
        <Medal key="2" size={22} className="text-slate-400 fill-slate-200" />,
        <Medal key="3" size={22} className="text-amber-600 fill-amber-200" />,
    ];

    return (
        <div className="flex flex-col w-full max-w-md mx-auto px-4 py-6 min-h-screen">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <button
                    onClick={() => navigate("/")}
                    className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white py-2 px-3 rounded-xl border border-white/20 transition-all text-xs sm:text-sm font-bold"
                >
                    <ArrowLeft size={16} />
                    Quay lại
                </button>
                <div className="flex items-center gap-2">
                    <Trophy size={24} className="text-yellow-300" />
                    <h1 className="text-sm sm:text-xl font-black text-white tracking-tight uppercase">Bảng Xếp Hạng</h1>
                </div>
                <div className="w-20" />
            </div>

            {/* Tab */}
            <div className="flex gap-1.5 bg-white/10 p-1.5 rounded-2xl border border-white/20 mb-5">
                {[2, 3, 4].map(t => (
                    <button
                        key={t}
                        onClick={() => setActiveTab(t)}
                        className={`flex-1 py-2.5 rounded-xl font-black text-sm transition-all duration-300 ${activeTab === t ? "bg-white text-indigo-600 shadow-lg" : "text-white/60 hover:text-white"
                            }`}
                    >{t}×{t}</button>
                ))}
            </div>

            {/* Board */}
            <div className="flex-1 bg-white/5 backdrop-blur rounded-3xl border border-white/20 overflow-hidden shadow-2xl">
                {/* Column headers */}
                <div className="grid grid-cols-12 px-5 py-3.5 bg-white/5 border-b border-white/10 text-[10px] font-black uppercase tracking-widest text-white/30">
                    <span className="col-span-2 text-center">Rank</span>
                    <span className="col-span-6">Tên</span>
                    <span className="col-span-4 text-right">Bước</span>
                </div>

                {/* Rows */}
                <div className="divide-y divide-white/5" style={{ maxHeight: 400, overflowY: "auto" }}>
                    {top10.length === 0 ? (
                        <div className="flex flex-col items-center py-20 text-white/20">
                            <Trophy size={40} className="mb-3 opacity-30" />
                            <p className="font-medium text-sm">Chưa có kỷ lục nào</p>
                        </div>
                    ) : (
                        top10.map((rec, idx) => {
                            const rank = idx + 1;
                            return (
                                <div key={idx} className={`grid grid-cols-12 px-5 py-4 items-center transition-colors hover:bg-white/5 ${rank <= 3 ? "bg-white/[0.03]" : ""}`}>
                                    <div className="col-span-2 flex justify-center">
                                        {rank <= 3 ? RANK_ICONS[rank - 1] : (
                                            <span className="text-sm font-black text-white/40">#{rank}</span>
                                        )}
                                    </div>
                                    <div className="col-span-6">
                                        <span className={`font-bold truncate block text-sm ${rank === 1 ? "text-yellow-300" : rank <= 3 ? "text-white" : "text-white/70"}`}>
                                            {rec.name}
                                        </span>
                                    </div>
                                    <div className="col-span-4 text-right">
                                        <span className={`font-black text-lg ${rank === 1 ? "text-yellow-300" : rank <= 3 ? "text-white" : "text-white/60"}`}>
                                            {rec.step}
                                        </span>
                                        <span className="ml-1 text-[9px] text-white/30 uppercase font-bold">bước</span>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>

                {/* My rank footer */}
                <div className="bg-gradient-to-r from-violet-600/80 to-indigo-600/80 backdrop-blur border-t border-white/20 px-5 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div>
                            <div className="text-white/50 text-[9px] font-black uppercase tracking-widest">Hạng của bạn</div>
                            <div className="text-2xl font-black text-white">{myRank === "—" ? "—" : `#${myRank}`}</div>
                        </div>
                        <div className="h-8 w-px bg-white/20" />
                        <div>
                            <div className="text-white font-bold text-sm">Kỷ lục cá nhân</div>
                            <div className="text-white/50 text-xs">Màn {activeTab}×{activeTab}</div>
                        </div>
                    </div>
                    <div>
                        <span className="text-2xl font-black text-yellow-300">{myBest || "—"}</span>
                        {myBest > 0 && <span className="ml-1 text-[9px] text-white/40 uppercase font-bold">bước</span>}
                    </div>
                </div>
            </div>
        </div>
    );
}