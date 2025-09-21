import { useCallback, useEffect, useState } from "react";

export default function Puzzle() {
    const [board, setBoard] = useState([
        [1, 2, 3],
        [4, 5, 6],
        [7, 8, 0],
    ]);

    const [isWin, SetIsWin] = useState(false);


    const [step, setStep] = useState(0)
    const [record, setRecord] = useState(0)


    //////////// 1. Các hàm phụ trợ ////////////
    // Hoán vị 2 ô
    const swap = (board, i0, j0, i, j) => {
        board[i0][j0] = board[i][j];
        board[i][j] = 0;
    };

    // Kiểm tra xem board có thể giải được không, tổng số nghịch đảo chẵn
    const isSolvable = (board) => {
        // Làm phẳng 2D -> 1D, bỏ ô trống
        const flat = board.flat().filter(x => x !== 0);
        let count = 0;
        for (let i = 0; i < flat.length; i++) {
            for (let j = i + 1; j < flat.length; j++) {
                if (flat[j] < flat[i]) {
                    count += 1
                }
            }
        }
        if (count % 2 === 0) {
            return true
        }

        return false
    }

    // Kiểm tra chiến thắng
    const checkWin = (board) => {
        const target = [1, 2, 3, 4, 5, 6, 7, 8, 0];
        return board.flat().join() === target.join();
    };


    //////////// 2. Các hàm chức năng ////////////
    

    // Hoán đổi, cách thức là hoán vị trí => chọn ra vị trí ngẫu nhiên và hoán giá trị giữa 2 vị trí -> chưa gọi là xáo trộn
    const handleShuffle = useCallback(() => {
        setBoard((prevBoard) => {
            let newBoard = []
            const size = prevBoard.length

            do {
                // Làm phẳng thành 1D
                const flatBoard = prevBoard.flat();

                for (let i = flatBoard.length - 1; i > 0; i--) {
                    const j = Math.floor(Math.random() * (i + 1));
                    [flatBoard[i], flatBoard[j]] = [flatBoard[j], flatBoard[i]];
                }

                // Dựng lại thành 2D
                newBoard = []
                for (let r = 0; r < size; r++) {
                    const row = flatBoard.slice(r * size, r * size + size);
                    newBoard.push(row)
                }
            } while (!isSolvable(newBoard))

            setStep(0)
            SetIsWin(checkWin(newBoard));

            return newBoard;
        });
    }, []);

    // Cập nhật kỷ lục
    useEffect(() => {
        if (isWin) {
            setRecord(prevRecord => {
                return step < prevRecord || prevRecord === 0 ? step : prevRecord
            });
        }
    }, [isWin, step]); // thêm step vào dependency để effect chạy đúng


    // Xử lý khi click vào 1 ô
    const handleClick = (i, j) => {
        // Khi win thì dừng việc di chuyển các ô
        if (!isWin) {
            // Tìm vị trí ô trống
            const empty = { row: -1, col: -1 };
            for (let r = 0; r < board.length; r++) {
                for (let c = 0; c < board[r].length; c++) {
                    if (board[r][c] === 0) {
                        empty.row = r;
                        empty.col = c;
                        break;
                    }
                }
            }

            // Xác định được vị trí click so với ô trống: trên, dưới, trái, phải của ô trống???

            if (
                (i === empty.row - 1 && j === empty.col) ||
                (i === empty.row + 1 && j === empty.col) ||
                (i === empty.row && j === empty.col - 1) ||
                (i === empty.row && j === empty.col + 1)
            ) {

                // Tăng bước nhảy
                setStep((prev) => prev + 1)

                // Swap giá trị
                setBoard((prevBoard) => {
                    const newBoard = prevBoard.map((row) => [...row]);
                    swap(newBoard, empty.row, empty.col, i, j);

                    // Tranh thủ có newBoard để check win
                    SetIsWin(checkWin(newBoard))
                    return newBoard;
                });

            }
        }

    };


    const [isLoadingGame, setLoadingGame] = useState(true)
    // Lần đầu, hiển thị các mảnh ghép theo thứ tự rồi xáo nó
    useEffect(() => {
        setTimeout(() => {
            handleShuffle()
            setLoadingGame(false)
        }, 2000)
    }, [handleShuffle])


    return (
        <div className="mx-auto bg-white p-6 rounded-lg shadow-lg max-w-[700px]">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 ">
                {/* Trò chơi */}
                <div className="flex flex-col items-center">
                    <h1 className="text-3xl font-bold mb-3 text-blue-700">8-Puzzle</h1>
                    <div className="h-[60px] flex items-center justify-center">
                        {isWin && (
                            <div className="text-black text-[24px] font-semibold">🎉 Bạn đã chiến thắng! 🎉</div>
                        )}
                    </div>

                    <div className="text-[20px] text-green-600 font-medium py-2">Số bước: {step}</div>

                    <div className="grid grid-cols-3 gap-2 text-white w-[300px] h-[300px] relative">
                        {/* cover xáo sau x giây*/}
                        {isLoadingGame && <div className="absolute top-0 left-0 right-0 bottom-0 bg-slate-500 opacity-70  flex items-center justify-center">
                            <div className="text-white text-[24px] font-semibold ">Xáo trộn...</div>
                            </div>}
                        {board.map((row, i) =>
                            row.map((item, j) => {
                                if (item === 0) {
                                    return (
                                        <div
                                            className="bg-gray-400 rounded flex items-center justify-center text-[24px]"
                                            key={`${i}${j}`}
                                        ></div>
                                    );
                                }
                                return (
                                    <div
                                        className={`bg-blue-600 rounded flex items-center justify-center text-[24px] cursor-pointer ${isWin ? "bg-green-600" : ""}`}
                                        key={`${i}${j}`}
                                        onClick={() => handleClick(i, j)}
                                    >
                                        {item}
                                    </div>
                                );
                            })
                        )}
                    </div>

                    <div
                        className="bg-blue-600 w-max px-6 py-2 rounded mt-4 cursor-pointer text-white font-semibold hover:bg-blue-700 transition"
                        onClick={handleShuffle}
                    >
                        Xáo trộn
                    </div>
                </div>

                {/* Kỷ lục */}
                <div className="flex flex-col items-center justify-center bg-gray-100 p-6 rounded-lg shadow-md md:mt-0 mt-6">
                    <h2 className="text-2xl font-bold mb-4 text-yellow-700">Kỷ lục bước nhảy</h2>
                    <div className="text-[32px] text-green-600 font-extrabold">{record}</div>
                </div>
            </div>
        </div>

    );
}
