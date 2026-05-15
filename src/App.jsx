import { Route, Routes } from 'react-router-dom'
import './App.css'
import Puzzle, { RecordModal } from './Puzzle'
import { PuzzleProvider } from './context/PuzzleContext'
import LeaderboardPage from './page/Leaderboard'

function App() {
  return (
    <PuzzleProvider>
      {/* Bao bọc toàn bộ bằng div background */}
      <div className="min-h-screen max-w-xl mx-auto bg-gradient-to-br from-slate-900 via-indigo-950 to-violet-950 relative overflow-hidden">

        {/* Các Orbs trang trí */}
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-violet-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[-5%] w-[400px] h-[400px] bg-cyan-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-[40%] right-[20%] w-[200px] h-[200px] bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />

        {/* Nội dung thay đổi theo URL nằm ở đây */}
        <div className="relative z-10"> {/* Thêm z-10 để nội dung nổi lên trên background */}
          <Routes>
            <Route path="/" element={
              <>
                <Puzzle />
                <RecordModal /> {/* Modal thường đi kèm với trang Puzzle */}
              </>
            } />
            <Route path="/ranking" element={<LeaderboardPage />} />
          </Routes>
        </div>

      </div>
    </PuzzleProvider>
  )
}

export default App
