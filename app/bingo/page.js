'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

const BINGO_SQUARES = [
  // Row 1
  ["Shows up 12 min late (no apology)", "Mutual agreement to never speak of it again", "Pulls on door that clearly says PUSH", "Jokes that do NOT land", "Brings up a CRAZY political take"],
  // Row 2
  ["Food Poisoning", "Former situationship sighting", "Trips and face plants on the ground", "Accidentally likes old Instagram post", "Accidentally overshares personal lore"],
  // Row 3
  ["Regrets outfit choice deeply", "Checks Canvas mid-conversation", "FREE", "You forgot their name", "Mentions finance/consulting/quant/IB again"],
  // Row 4
  ["Someone cries a little (or a lot)", "Sends text meant for someone else", "Confidently walks the wrong way", "Shows up already tipsy", "Card declines"],
  // Row 5
  ["Tomar clases de reposteria", "Complains like it's a sport", "Someone loses their ID", "Sorry I have a midterm tomorrow", "Roommate horror story"]
]

export default function Bingo() {
  const [user, setUser] = useState(null)
  const [completedSquares, setCompletedSquares] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadBingoProgress()
  }, [])

  const loadBingoProgress = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      setLoading(false)
      return
    }

    setUser(session.user)

    const { data } = await supabase
      .from('friends')
      .select('bingo_squares')
      .eq('email', session.user.email)
      .maybeSingle()

    if (data?.bingo_squares) {
      setCompletedSquares(data.bingo_squares)
    }
    setLoading(false)
  }

  const toggleSquare = async (square) => {
    if (square === "FREE" || !user) return

    const newCompleted = completedSquares.includes(square)
      ? completedSquares.filter(s => s !== square)
      : [...completedSquares, square]

    setCompletedSquares(newCompleted)

    await supabase
      .from('friends')
      .update({ bingo_squares: newCompleted })
      .eq('email', user.email)
  }

  const checkProgress = () => {
    return completedSquares.length + 1
  }

  const checkForBingo = () => {
    const completed = [...completedSquares, "FREE"]
    
    for (let row of BINGO_SQUARES) {
      if (row.every(square => completed.includes(square))) {
        return true
      }
    }

    for (let col = 0; col < 5; col++) {
      const column = BINGO_SQUARES.map(row => row[col])
      if (column.every(square => completed.includes(square))) {
        return true
      }
    }

    const diagonal1 = [BINGO_SQUARES[0][0], BINGO_SQUARES[1][1], BINGO_SQUARES[2][2], BINGO_SQUARES[3][3], BINGO_SQUARES[4][4]]
    const diagonal2 = [BINGO_SQUARES[0][4], BINGO_SQUARES[1][3], BINGO_SQUARES[2][2], BINGO_SQUARES[3][1], BINGO_SQUARES[4][0]]
    
    if (diagonal1.every(square => completed.includes(square)) || 
        diagonal2.every(square => completed.includes(square))) {
      return true
    }

    return false
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-2xl">Loading...</div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl mb-4">Please log in to play Bingo!</h1>
          <a href="/login" className="text-blue-400 hover:text-white">Log in →</a>
        </div>
      </div>
    )
  }

  const hasBingo = checkForBingo()

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-900 via-blue-800 to-black text-white p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <a href="/" className="inline-block mb-6 text-blue-300 hover:text-white transition">
          ← Back to Home
        </a>

        <h1 className="text-4xl md:text-6xl font-bold text-center mb-2">2026 UNIMATCH</h1>
        <h2 className="text-5xl md:text-7xl font-bold text-center mb-6" style={{fontFamily: 'cursive', fontStyle: 'italic'}}>Bingo</h2>
        
        <p className="text-center text-xl text-gray-200 mb-4">
          Complete 5 in a row to win! ({checkProgress()}/25 squares)
        </p>

        {hasBingo && (
          <div className="mb-6 p-6 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-3xl text-center animate-pulse">
            <h2 className="text-4xl font-bold text-black">🎉 BINGO! 🎉</h2>
            <p className="text-lg text-black mt-2">You completed a row! Congratulations!</p>
          </div>
        )}

        {/* Bingo Card - FIXED ALIGNMENT */}
        <div className="flex justify-center mb-8">
          <div 
            className="relative shadow-2xl"
            style={{
              width: 'fit-content',
              backgroundColor: '#E8DCC8',
              borderRadius: '50px',
              padding: '50px',
              border: '20px solid #E8DCC8'
            }}
          >
            {/* Decorative star */}
            <div 
              className="absolute"
              style={{
                top: '25px',
                left: '35px',
                fontSize: '40px',
                color: '#2563EB',
                zIndex: 10
              }}
            >
              ✦
            </div>

            {/* 5x5 Grid */}
            <div 
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(5, 150px)',
                gridTemplateRows: 'repeat(5, 150px)',
                gap: '10px'
              }}
            >
              {BINGO_SQUARES.flat().map((square, index) => {
                const isCompleted = square === "FREE" || completedSquares.includes(square)
                const isFree = square === "FREE"
                
                return (
                  <button
                    key={index}
                    onClick={() => toggleSquare(square)}
                    disabled={isFree}
                    className="transition-all duration-200 hover:scale-105"
                    style={{
                      width: '150px',
                      height: '150px',
                      backgroundColor: isCompleted ? '#2563EB' : '#FFFFFF',
                      color: isCompleted ? '#FFFFFF' : '#1E3A8A',
                      border: '3px solid #1E40AF',
                      borderRadius: '12px',
                      padding: '12px',
                      cursor: isFree ? 'default' : 'pointer',
                      fontSize: '0.75rem',
                      fontWeight: '600',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      textAlign: 'center',
                      lineHeight: '1.2',
                      boxShadow: isCompleted ? '0 4px 12px rgba(37, 99, 235, 0.4)' : '0 2px 4px rgba(0,0,0,0.1)'
                    }}
                  >
                    <span style={{ fontSize: isFree ? '0.85rem' : '0.75rem' }}>
                      {square}
                    </span>
                    {isCompleted && !isFree && (
                      <span style={{ fontSize: '2rem', marginTop: '8px' }}>✓</span>
                    )}
                    {isFree && (
                      <span style={{ fontSize: '2rem', marginTop: '4px' }}>😊</span>
                    )}
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        <p className="text-center text-sm md:text-base text-gray-300 italic px-4">
          I'M SORRY IF YOU COMPLETE THIS BEFORE THE END OF THE YEAR.
        </p>
      </div>
    </div>
  )
}