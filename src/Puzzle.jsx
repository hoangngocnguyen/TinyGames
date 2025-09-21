import { useCallback, useEffect, useState } from "react";

const createBoard = (size) => {
    const board = [];
    let count = 1;
    for (let i = 0; i < size; i++) {
        let row = [];
        for (let j = 0; j < size; j++) {
            row.push(count);
            count++;
        }
        board.push(row)
    }
    board[size - 1][size - 1] = 0
    return board
}

export default function Puzzle() {
    const [size, setSize] = useState(3)
    const [board, setBoard] = useState(() => createBoard(size));
    const initialBoard = createBoard(size)

    const [isWin, SetIsWin] = useState(false);

    const [isLoadingGame, setLoadingGame] = useState(true)



    const [step, setStep] = useState(0)
    const [record, setRecord] = useState(0)


    //////////// 1. Các hàm phụ trợ ////////////
    // Hoán vị 2 ô
    const swap = (board, i0, j0, i, j) => {
        board[i0][j0] = board[i][j];
        board[i][j] = 0;
    };
    // Hàm tìm vị trí ô trống
    const findEmty = (board) => {
        for (let r = 0; r < board.length; r++) {
            for (let c = 0; c < board[r].length; c++) {
                if (board[r][c] === 0) {
                    return {row: r, col: c}
                }
            }
        }
    }

    // Kiểm tra xem board có thể giải được không, tổng số nghịch đảo chẵn
    const isSolvable = (board) => {
        const size = board.length;  // Đảm bảo size đúng, thay vì dùng state

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

        // console.log("count", count, "size", size);
        
        // Xét riêng loại 3x3, 5x5 -  4x4, 6x6...

        // Nếu size lẻ, chỉ cần count chẵn
        if (size % 2 === 1) {
            return count % 2 === 0
        } else {
            // Nếu size chẵn, xét trường hợp hàng của ô trống (tính từ 1 xuống)
            const emptyRow = findEmty(board).row + 1;
            // console.log("emptyRow", emptyRow);
            
            return (count % 2 === 0 && emptyRow % 2 === 0) || (count % 2 === 1 && emptyRow % 2 === 1);
            
        }
    }

    // Kiểm tra chiến thắng
    const checkWin = (board) => {
        const target = initialBoard.flat()
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
            } while (!isSolvable(newBoard) || checkWin(newBoard))

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
            const empty = findEmty(board);


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

    // Xử lý khi thay đổi size: cập nhật board, xáo lại (lần đầu + các lần change)
    useEffect(() => {
        setBoard(() => createBoard(size))
        setLoadingGame(true)
        setTimeout(() => {
            handleShuffle()
            setLoadingGame(false)
        }, 2000)
    }, [size, handleShuffle])


    return (
        <div className="mx-auto bg-white p-6 rounded-lg shadow-lg max-w-[700px] flex flex-col">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
                {/* Trò chơi */}
                <div className="flex flex-col items-center">
                    <h1 className="text-3xl font-bold mb-3 text-blue-700">8-Puzzle</h1>

                    <div className="text-gray-500 text-[14px]">Chọn màn chơi</div>
                    <div className="flex mt-1 justify-center w-full gap-2 text-[16px] text-white font-medium ">
                        <div className="bg-blue-500 py-1 px-5 rounded cursor-pointer" onClick={() => setSize(2)}>2x2</div>
                        <div className="bg-blue-500 py-1 px-5 rounded cursor-pointer" onClick={() => setSize(3)}>3x3</div>
                        <div className="bg-blue-500 py-1 px-5 rounded cursor-pointer" onClick={() => setSize(4)}>4x4</div>
                    </div>
                    <div className="h-[60px] flex items-center justify-center">
                        {isWin && (
                            <div className="text-black text-[24px] font-semibold">
                                🎉 Bạn đã chiến thắng! 🎉
                            </div>
                        )}
                    </div>

                    <div className="text-[20px] text-green-600 font-medium py-2">
                        Số bước: {step}
                    </div>

                    <div className={`grid grid-cols-${size} gap-2 text-white w-[200px] h-[200px]  md:w-[300px] md:h-[300px] relative`}>
                        {/* Cover xáo sau x giây */}
                        {isLoadingGame && (
                            <div className="absolute top-0 left-0 right-0 bottom-0 bg-slate-500 opacity-70 flex items-center justify-center">
                                <div className="text-white text-[24px] font-semibold">
                                    Xáo trộn...
                                </div>
                            </div>
                        )}
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
                                        className={`bg-blue-600 rounded flex items-center justify-center text-[24px] cursor-pointer ${isWin ? "bg-green-600" : ""
                                            }`}
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
                    <h2 className="text-2xl font-bold mb-4 text-yellow-700">
                        Kỷ lục bước nhảy
                    </h2>
                    <div className="text-[32px] text-green-600 font-extrabold">{record}</div>
                </div>
            </div>

            {/* Footer copyright */}
            <footer className="mt-10 text-center text-sm text-gray-500">
                &copy; 2025 Hoang Ngoc Nguyen. All rights reserved.
            </footer>
        </div>


    );
}
