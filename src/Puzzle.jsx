import { Trophy, Shuffle, Star } from "lucide-react";
import { Link } from "react-router-dom";
import { useMemo, memo } from "react";
import { usePuzzle } from "./context/PuzzleContext";



// ─────────────────────────────────────────────
// TILE COLORS by number
// ─────────────────────────────────────────────
const TILE_COLORS = [
    "from-violet-500 to-purple-600",
    "from-blue-500 to-cyan-500",
    "from-emerald-500 to-teal-500",
    "from-orange-400 to-amber-500",
    "from-pink-500 to-rose-500",
    "from-indigo-500 to-blue-600",
    "from-fuchsia-500 to-pink-500",
    "from-lime-500 to-green-500",
    "from-red-500 to-orange-500",
    "from-sky-500 to-indigo-500",
    "from-yellow-400 to-orange-400",
    "from-teal-500 to-cyan-400",
    "from-purple-500 to-fuchsia-600",
    "from-green-500 to-emerald-600",
    "from-rose-500 to-pink-600",
    "from-cyan-500 to-sky-500",
];

// ─────────────────────────────────────────────
// Memoized Tile Component
// ─────────────────────────────────────────────
const Tile = memo(function Tile({ item, index, size, isWin, color, handleClick }) {
    const i = Math.floor(index / size);
    const j = index % size;

    if (item === 0) {
        return <div className="rounded-xl bg-white/5 border border-white/5 w-full h-full" />;
    }

    return (
        <button
            onClick={() => handleClick(i, j)}
            className={`rounded-xl bg-gradient-to-br ${color} flex items-center justify-center font-black text-white shadow-lg
                active:scale-95 hover:brightness-110 transition-all duration-150 select-none w-full h-full
                ${isWin ? "cursor-default animate-pulse" : "cursor-pointer"}
                ${size === 4 ? "text-lg" : size === 2 ? "text-4xl" : "text-2xl"}
            `}
        >
            {item}
        </button>
    );
});

// ─────────────────────────────────────────────
export default function Puzzle() {
    const { size, board, isWin, isLoading, step, personalBests, handleChangeSize, handleShuffle, handleClick } = usePuzzle();
    const pb = personalBests[size] || 0;

    // Memoize tiles rendering to prevent unnecessary recalculations
    const tiles = useMemo(() => {
        return board.flat().map((item, index) => {
            const color = isWin
                ? "from-emerald-400 to-teal-500"
                : TILE_COLORS[(item - 1) % TILE_COLORS.length];

            return (
                <Tile
                    key={`${index}-${item}`}
                    item={item}
                    index={index}
                    size={size}
                    isWin={isWin}
                    color={color}
                    handleClick={handleClick}
                />
            );
        });
    }, [board, size, isWin, handleClick]);

    return (
        <div className="flex flex-col items-center w-full max-w-md mx-auto px-4 py-6 min-h-screen">
            {/* Header */}
            <div className="w-full flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-black tracking-tight text-white drop-shadow-lg">
                        <span className="text-yellow-300">N</span>-Puzzle
                    </h1>
                    <p className="text-white/50 text-xs font-medium tracking-widest uppercase mt-0.5">Slide to solve</p>
                </div>
                <Link to="/ranking">
                    <button
                        className="flex items-center gap-2 bg-white/10 hover:bg-white/20 backdrop-blur text-white font-bold py-2 px-4 rounded-2xl border border-white/20 transition-all text-sm shadow-lg"
                    >
                        <Trophy size={16} className="text-yellow-300" />
                        <span>BXH</span>
                    </button>

                </Link>
            </div>

            {/* Size selector */}
            <div className={`flex gap-2 mb-6 bg-slate-900/40 backdrop-blur-md p-1.5 rounded-2xl border border-white/10 w-full transition-opacity duration-300 ${isLoading ? "opacity-50 pointer-events-none" : ""}`}>
                {[2, 3, 4].map(s => (
                    <button
                        key={s}
                        onClick={() => handleChangeSize(s)}
                        disabled={isLoading}
                        className={`flex-1 py-2.5 rounded-xl font-black text-sm transition-all duration-300 ${size === s
                            ? "bg-white text-indigo-600 shadow-xl scale-[1.02]"
                            : "text-white/80 hover:text-white bg-white/5 hover:bg-white/20 active:bg-white/30"
                            } ${isLoading ? "cursor-not-allowed opacity-60" : "cursor-pointer"}`}
                    >
                        {s}×{s}
                    </button>
                ))}
            </div>

            {/* Stats row */}
            <div className="flex gap-3 w-full mb-5">
                <div className="flex-1 bg-white/10 backdrop-blur rounded-2xl p-3 border border-white/20 text-center">
                    <div className="text-white/50 text-[10px] font-black uppercase tracking-wider mb-1">Bước</div>
                    <div className="text-2xl font-black text-white">{step}</div>
                </div>
                <div className="flex-1 bg-white/10 backdrop-blur rounded-2xl p-3 border border-white/20 text-center">
                    <div className="text-white/50 text-[10px] font-black uppercase tracking-wider mb-1">Kỷ lục</div>
                    <div className="text-2xl font-black text-yellow-300">{pb || "—"}</div>
                </div>
                <div className="flex-1 bg-white/10 backdrop-blur rounded-2xl p-3 border border-white/20 text-center">
                    <div className="text-white/50 text-[10px] font-black uppercase tracking-wider mb-1">Trạng thái</div>
                    <div className="text-lg font-black">{isWin ? "🎉" : isLoading ? "⏳" : "🎮"}</div>
                </div>
            </div>

            {/* Board */}
            <div className="relative w-full aspect-square max-w-[360px]">
                {/* Glow behind board */}
                <div className="absolute inset-0 bg-gradient-to-br from-violet-500/30 to-cyan-500/30 rounded-3xl blur-xl scale-105" />

                <div
                    style={{
                        gridTemplateColumns: `repeat(${size}, minmax(0, 1fr))`,
                        gridTemplateRows: `repeat(${size}, minmax(0, 1fr))`
                    }}
                    className="relative grid gap-2 w-full h-full bg-white/5 backdrop-blur-sm p-3 rounded-3xl border border-white/20 shadow-2xl"
                >
                    {/* Loading overlay */}
                    {isLoading && (
                        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center rounded-3xl z-20">
                            <div className="flex gap-1.5 mb-3">
                                {[0, 1, 2].map(i => (
                                    <div
                                        key={i}
                                        className="w-2.5 h-2.5 bg-white rounded-full animate-bounce"
                                        style={{ animationDelay: `${i * 0.15}s` }}
                                    />
                                ))}
                            </div>
                            <p className="text-white/80 text-xs font-black uppercase tracking-widest">Đang xáo trộn...</p>
                        </div>
                    )}

                    {tiles}
                </div>
            </div>

            {/* Win message - Fixed height to prevent CLS */}
            <div className="h-12 flex items-center justify-center mt-4">
                {isWin && (
                    <div className="flex items-center gap-2 text-emerald-300 font-black text-lg animate-bounce">
                        <Star size={18} className="fill-current" />
                        Xuất sắc! Giải trong {step} bước!
                        <Star size={18} className="fill-current" />
                    </div>
                )}
            </div>

            {/* Shuffle button */}
            <button
                onClick={handleShuffle}
                className="mt-3 w-full max-w-[360px] flex items-center justify-center gap-2 bg-gradient-to-r from-violet-500 to-indigo-600 hover:from-violet-600 hover:to-indigo-700 text-white font-black py-4 rounded-2xl shadow-xl transition-all active:scale-95 text-base tracking-wide"
                style={{ boxShadow: "0 8px 25px rgba(99,102,241,0.4)" }}
            >
                <Shuffle size={18} />
                Xáo Trộn Mới
            </button>

            <footer className="mt-auto pt-8 text-white/20 text-xs font-medium text-center">
                © 2026 Hoang Ngoc Nguyen
            </footer>
        </div>
    );
}



// ─────────────────────────────────────────────
// MODAL
// ─────────────────────────────────────────────
export function RecordModal() {
    const { modal, setModal, handleSaveRecord, size, step } = usePuzzle();
    if (!modal.open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/70 backdrop-blur-md"
                onClick={() => setModal(m => ({ ...m, open: false }))}
            />

            {/* Card */}
            <div className="relative bg-gradient-to-br from-slate-800 to-slate-900 border border-white/20 rounded-3xl p-7 max-w-sm w-full shadow-2xl text-center">
                {/* Glow */}
                <div className="absolute inset-0 bg-gradient-to-br from-violet-500/10 to-yellow-500/10 rounded-3xl" />

                <div className="relative">
                    <div className="text-5xl mb-3 animate-bounce">👑</div>
                    <h3 className="text-xl font-black text-yellow-300 mb-1 uppercase tracking-wide">Lọt Top Kỷ Lục!</h3>
                    <p className="text-white/60 text-sm mb-5 leading-relaxed">
                        Bạn giải màn <span className="text-white font-bold">{size}×{size}</span> trong{" "}
                        <span className="text-emerald-400 font-black">{step} bước</span>.
                        Để lại tên của bạn!
                    </p>

                    <input
                        type="text"
                        className="w-full bg-white/10 border border-white/20 rounded-2xl px-4 py-3 text-white text-center font-bold text-base focus:outline-none focus:border-violet-400 focus:bg-white/15 transition-all mb-4 placeholder-white/30"
                        placeholder="Nhập biệt danh..."
                        value={modal.inputName}
                        onChange={e => setModal(m => ({ ...m, inputName: e.target.value }))}
                        onKeyDown={e => e.key === "Enter" && handleSaveRecord()}
                        maxLength={15}
                        autoFocus
                    />

                    <div className="flex gap-3">
                        <button
                            className="flex-1 bg-white/10 hover:bg-white/20 text-white/70 py-3 rounded-2xl font-bold transition-all border border-white/10 text-sm"
                            onClick={() => setModal(m => ({ ...m, open: false }))}
                        >
                            Bỏ qua
                        </button>
                        <button
                            className="flex-2 flex-grow-[2] bg-gradient-to-r from-yellow-400 to-amber-500 hover:from-yellow-300 hover:to-amber-400 text-slate-900 py-3 rounded-2xl font-black transition-all shadow-lg text-sm"
                            style={{ boxShadow: "0 6px 20px rgba(251,191,36,0.35)" }}
                            onClick={handleSaveRecord}
                        >
                            🏆 Ghi Danh
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}