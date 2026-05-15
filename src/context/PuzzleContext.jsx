import { useCallback, useEffect, useState, createContext, useContext} from "react";

// ─────────────────────────────────────────────
// CONSTANTS & HELPERS
// ─────────────────────────────────────────────
const API_URL = "https://script.google.com/macros/s/AKfycbzNqjEpeOlb5rqiXFxDmtp8TlVDNtLau03DzLwM6jx5dYNkMB4Ifq7yB3VnUNwWTJIUxg/exec";

const createBoard = (size) => {
  const board = [];
  let count = 1;
  for (let i = 0; i < size; i++) {
    const row = [];
    for (let j = 0; j < size; j++) { row.push(count++); }
    board.push(row);
  }
  board[size - 1][size - 1] = 0;
  return board;
};

const findEmpty = (board) => {
  for (let r = 0; r < board.length; r++)
    for (let c = 0; c < board[r].length; c++)
      if (board[r][c] === 0) return { row: r, col: c };
};

const checkWin = (board) => {
  const flat = board.flat();
  for (let i = 0; i < flat.length - 1; i++) if (flat[i] !== i + 1) return false;
  return flat[flat.length - 1] === 0;
};

const isSolvable = (board) => {
  const size = board.length;
  const flat = board.flat().filter(x => x !== 0);
  let count = 0;
  for (let i = 0; i < flat.length; i++)
    for (let j = i + 1; j < flat.length; j++)
      if (flat[j] < flat[i]) count++;
  if (size % 2 === 1) return count % 2 === 0;
  const emptyRow = findEmpty(board).row + 1;
  return (count % 2 === 0 && emptyRow % 2 === 0) || (count % 2 === 1 && emptyRow % 2 === 1);
};

// ─────────────────────────────────────────────
// CONTEXT
// ─────────────────────────────────────────────
const PuzzleContext = createContext(null);

const DEFAULT_RECORDS = [
  { size: 2, name: "Chưa có", step: 0 },
  { size: 3, name: "Chưa có", step: 0 },
  { size: 4, name: "Chưa có", step: 0 },
];

export const PuzzleProvider = ({ children }) =>{
  const [page, setPage] = useState("game"); // "game" | "leaderboard"
  const [size, setSize] = useState(3);
  const [board, setBoard] = useState(() => createBoard(3));
  const [isWin, setIsWin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [step, setStep] = useState(0);
  const [records, setRecords] = useState(DEFAULT_RECORDS);
  const [personalBests, setPersonalBests] = useState(() => {
    try { return JSON.parse(localStorage.getItem("puzzle_personal_bests")) || { 2: 0, 3: 0, 4: 0 }; }
    catch { return { 2: 0, 3: 0, 4: 0 }; }
  });

  // Modal state
  const [modal, setModal] = useState({ open: false, inputName: "", submitting: false });
  // Track whether modal has been shown for current win (prevent re-trigger)
  const [modalShownForWin, setModalShownForWin] = useState(false);
  // Saved player name for auto-fill
  const [savedName, setSavedName] = useState(() => localStorage.getItem("puzzle_player_name") || "");

  // Fetch records on mount
  useEffect(() => {
    fetch(API_URL).then(r => r.json()).then(d => {
      if (d.status === "success") setRecords(d.records);
    }).catch(() => {});
  }, []);

  // Shuffle logic (unchanged from original)
  const doShuffle = useCallback((currentBoard) => {
    let newBoard;
    const s = currentBoard.length;
    do {
      const flat = currentBoard.flat();
      for (let i = flat.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [flat[i], flat[j]] = [flat[j], flat[i]];
      }
      newBoard = [];
      for (let r = 0; r < s; r++) newBoard.push(flat.slice(r * s, r * s + s));
    } while (!isSolvable(newBoard) || checkWin(newBoard));
    return newBoard;
  }, []);

  const startGame = useCallback((newSize = size) => {
    setIsLoading(true);
    setIsWin(false);
    setStep(0);
    setModalShownForWin(false);
    setModal({ open: false, inputName: "", submitting: false });
    const fresh = createBoard(newSize);
    setTimeout(() => {
      setBoard(doShuffle(fresh));
      setIsLoading(false);
    }, 1800);
  }, [size, doShuffle]);

  const handleChangeSize = useCallback((s) => {
    setSize(s);
    setBoard(createBoard(s));
    setIsLoading(true);
    setIsWin(false);
    setStep(0);
    setModalShownForWin(false);
    setModal({ open: false, inputName: "", submitting: false });
    const fresh = createBoard(s);
    setTimeout(() => {
      setBoard(doShuffle(fresh));
      setIsLoading(false);
    }, 1800);
  }, [doShuffle]);

  // Init on mount
  useEffect(() => { startGame(3); }, []);

  const handleShuffle = useCallback(() => {
    setIsLoading(true);
    setIsWin(false);
    setStep(0);
    setModalShownForWin(false);
    setModal(m => ({ ...m, open: false }));
    setTimeout(() => {
      setBoard(prev => doShuffle(prev));
      setIsLoading(false);
    }, 1800);
  }, [doShuffle]);

  const handleClick = useCallback((i, j) => {
    if (isWin || isLoading) return;
    const empty = findEmpty(board);
    const isAdjacent =
      (i === empty.row - 1 && j === empty.col) ||
      (i === empty.row + 1 && j === empty.col) ||
      (i === empty.row && j === empty.col - 1) ||
      (i === empty.row && j === empty.col + 1);
    if (!isAdjacent) return;

    setStep(prev => prev + 1);
    setBoard(prev => {
      const nb = prev.map(r => [...r]);
      nb[empty.row][empty.col] = nb[i][j];
      nb[i][j] = 0;
      if (checkWin(nb)) setIsWin(true);
      return nb;
    });
  }, [isWin, isLoading, board]);

  // Modal trigger — only once per win, only if top 10
  useEffect(() => {
    if (!isWin || step === 0 || modalShownForWin) return;

    // Update personal best
    const currentBest = personalBests[size] || 0;
    if (step < currentBest || currentBest === 0) {
      const updated = { ...personalBests, [size]: step };
      setPersonalBests(updated);
      localStorage.setItem("puzzle_personal_bests", JSON.stringify(updated));
    }

    // Check top 10
    const forSize = records.filter(r => r.size === size && r.step > 0).sort((a, b) => a.step - b.step);
    const isTop10 = forSize.length < 10 || step < forSize[forSize.length - 1].step;

    if (isTop10) {
      setModalShownForWin(true);
      setModal({ open: true, inputName: savedName, submitting: false });
    } else {
      setModalShownForWin(true);
    }
  }, [isWin]);

  const handleSaveRecord = async () => {
    const name = modal.inputName.trim();
    if (!name) return;

    // Optimistic update — insert into local records immediately
    const newRecord = { size, name, step };
    setRecords(prev => {
      const updated = [...prev, newRecord];
      return updated;
    });

    localStorage.setItem("puzzle_player_name", name);
    setSavedName(name);
    setModal(m => ({ ...m, open: false, submitting: true }));

    try {
      await fetch(API_URL, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ size, playerName: name, step }),
      });
      // Re-sync after POST
      fetch(API_URL).then(r => r.json()).then(d => {
        if (d.status === "success") setRecords(d.records);
      }).catch(() => {});
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <PuzzleContext.Provider value={{
      page, setPage,
      size, board, isWin, isLoading, step,
      records, personalBests, modal, setModal,
      handleChangeSize, handleShuffle, handleClick, handleSaveRecord,
    }}>
      {children}
    </PuzzleContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export const usePuzzle = () => {
  const context = useContext(PuzzleContext);
  if (!context) return null; // Hoặc throw error để debug dễ hơn
  return context;
};