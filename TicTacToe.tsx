"use client"
import { useCallback, useEffect, useState } from "react"
import { useAppContext } from "./context/AppContext"
import { useTheme } from "./platform"

const emptyBoard = Array(9).fill(null)

function calculateWinner(squares: (string | null)[]) {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8], // Rows
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8], // Cols
    [0, 4, 8],
    [2, 4, 6], // Diags
  ]
  for (let [a, b, c] of lines) {
    if (
      squares[a as number] &&
      squares[a as number] === squares[b as number] &&
      squares[a as number] === squares[c as number]
    ) {
      return squares[a as number]
    }
  }
  return null
}

// Simple AI: win, block, or random
function aiMove(board: (string | null)[]): number | null {
  // Try to win
  for (let i = 0; i < 9; i++) {
    if (!board[i]) {
      const copy = [...board]
      copy[i] = "O"
      if (calculateWinner(copy) === "O") return i
    }
  }
  // Try to block X
  for (let i = 0; i < 9; i++) {
    if (!board[i]) {
      const copy = [...board]
      copy[i] = "X"
      if (calculateWinner(copy) === "X") return i
    }
  }
  // Otherwise random
  const empties = board
    .map((cell, idx) => (cell ? null : idx))
    .filter((i) => i !== null) as number[]
  if (empties.length === 0) return null
  return empties[Math.floor(Math.random() * empties.length)] || null
}

export default function TicTacToe({ onClose }: { onClose: () => void }) {
  const { playNotification } = useTheme()
  const { t } = useAppContext()
  const [board, setBoard] = useState<(string | null)[]>(() => [...emptyBoard])
  const [xIsNext, setXIsNext] = useState(true)
  const [isAiThinking, setIsAiThinking] = useState(false)

  const winner = calculateWinner(board)
  const isDraw = !winner && board.every(Boolean)

  const makeAiMove = useCallback(() => {
    if (isAiThinking) return // Prevent multiple AI moves

    setIsAiThinking(true)
    const move = aiMove(board)

    if (move !== null) {
      setTimeout(() => {
        setBoard((prev) => {
          const next = [...prev]
          next[move] = "O"
          return next
        })
        setXIsNext(true)
        setIsAiThinking(false)
      }, 500)
    } else {
      setIsAiThinking(false)
    }
  }, [board, isAiThinking])

  // AI move effect - only trigger when it's AI's turn
  useEffect(() => {
    if (!xIsNext && !winner && !isDraw && !isAiThinking) {
      makeAiMove()
    }
  }, [xIsNext, winner, isDraw, makeAiMove, isAiThinking])

  const handleClick = useCallback(
    (index: number) => {
      playNotification()
      if (board[index] || winner || !xIsNext || isAiThinking) return

      setBoard((prev) => {
        const next = [...prev]
        next[index] = "X"
        return next
      })
      setXIsNext(false)
    },
    [board, winner, xIsNext, isAiThinking],
  )

  const reset = useCallback(() => {
    setBoard([...emptyBoard])
    setXIsNext(true)
    setIsAiThinking(false)
  }, [])

  return (
    <div style={{ textAlign: "center" }}>
      <h3>{t("Tic-Tac-Toe vs AI")}</h3>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 40px)",
          gap: "8px",
          justifyContent: "center",
          margin: "16px 0",
        }}
      >
        {board.map((cell, i) => (
          <button
            key={i}
            onClick={() => handleClick(i)}
            disabled={
              !xIsNext || isAiThinking || Boolean(cell) || Boolean(winner)
            }
            style={{
              width: 40,
              height: 40,
              fontSize: 18,
              fontWeight: "bold",
              background: "var(--background)",
              color: cell === "X" ? "var(--accent-1)" : "var(--shade-7)",
              textAlign: "center",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: "1px solid var(--shade-2)",
              cursor:
                cell || winner || !xIsNext || isAiThinking
                  ? "not-allowed"
                  : "pointer",
              opacity: 1,
            }}
          >
            {cell}
          </button>
        ))}
      </div>
      <div>
        {winner && (
          <div>
            {t("Winner")}: {winner}!
          </div>
        )}
        {isDraw && !winner && <div>{t("Draw")}!</div>}
        {!winner && !isDraw && (
          <div style={{ fontSize: 12 }}>
            {isAiThinking
              ? t("AI is thinking...")
              : t(`Next: ${xIsNext ? "You (X)" : "AI (O)"}`)}
          </div>
        )}
      </div>
      <div style={{ display: "flex", justifyContent: "center", gap: 8 }}>
        <button
          className="inverted"
          onClick={reset}
          style={{ marginTop: 12 }}
          disabled={isAiThinking}
        >
          {t("Reset")}
        </button>
        <button
          className="inverted"
          onClick={onClose}
          style={{ marginTop: 12 }}
        >
          {t("Close")}
        </button>
      </div>
    </div>
  )
}
