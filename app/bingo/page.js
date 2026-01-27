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
  ["You meet your opp", "Complains like it's a sport", "Someone loses their ID", "Sorry I have a midterm tomorrow", "Roommate horror story"]
]

export default function Bingo() {
  const [user, setUser] = useState(null)
  const [completedSquares, setCompletedSquares] = useState([])
  const [totalPoints, setTotalPoints] = useState(0)
  const [loading, setLoading] = useState(true)
  const [signingIn, setSigningIn] = useState(false)

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
      .select('bingo_squares, points')
      .eq('email', session.user.email)
      .maybeSingle()

    if (data) {
      setCompletedSquares(data.bingo_squares || [])
      setTotalPoints(data.points || 0)
    }
    setLoading(false)
  }

  const toggleSquare = async (square) => {
    if (square === "FREE" || !user) return

    const wasCompleted = completedSquares.includes(square)
    const newCompleted = wasCompleted
      ? completedSquares.filter(s => s !== square)
      : [...completedSquares, square]

    setCompletedSquares(newCompleted)

    // Calculate points change
    let pointsChange = wasCompleted ? -1 : 1

    // Check for bingos
    const bingosAfter = getAllBingos(newCompleted)
    const bingosBefore = getAllBingos(completedSquares)
    const newBingos = bingosAfter.filter(b => !bingosBefore.includes(b))
    const lostBingos = bingosBefore.filter(b => !bingosAfter.includes(b))
    
    pointsChange += (newBingos.length * 10) - (lostBingos.length * 10)

    const newTotalPoints = Math.max(0, totalPoints + pointsChange)
    setTotalPoints(newTotalPoints)

    // Save to database
    await supabase
      .from('friends')
      .update({ 
        bingo_squares: newCompleted,
        points: newTotalPoints
      })
      .eq('email', user.email)

    // Also update leaderboard table
    const { data: leaderboardData, error: leaderboardError } = await supabase
      .from('leaderboard')
      .upsert({
        userid: user.email,  // ← FIXED (lowercase)
        name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Anonymous',
        points: newTotalPoints
      }, {
        onConflict: 'userid'  // ← FIXED (lowercase)
      })

    if (leaderboardError) {
      console.error('Leaderboard update error:', leaderboardError)
    }

    if (newBingos.length > 0) {
      alert(`🎉 BINGO! You completed ${newBingos[0]}! +10 points!`)
    }
  }

  const getAllBingos = (completed) => {
    const bingos = []
    const squares = [...completed, "FREE"]
    
    // Check rows
    BINGO_SQUARES.forEach((row, idx) => {
      if (row.every(square => squares.includes(square))) {
        bingos.push(`Row ${idx + 1}`)
      }
    })

    // Check columns
    for (let col = 0; col < 5; col++) {
      const column = BINGO_SQUARES.map(row => row[col])
      if (column.every(square => squares.includes(square))) {
        bingos.push(`Column ${col + 1}`)
      }
    }

    // Check diagonals
    const diagonal1 = [BINGO_SQUARES[0][0], BINGO_SQUARES[1][1], BINGO_SQUARES[2][2], BINGO_SQUARES[3][3], BINGO_SQUARES[4][4]]
    const diagonal2 = [BINGO_SQUARES[0][4], BINGO_SQUARES[1][3], BINGO_SQUARES[2][2], BINGO_SQUARES[3][1], BINGO_SQUARES[4][0]]
    
    if (diagonal1.every(square => squares.includes(square))) {
      bingos.push('Diagonal ↘')
    }
    if (diagonal2.every(square => squares.includes(square))) {
      bingos.push('Diagonal ↙')
    }

    return bingos
  }

  const signInWithGoogle = async () => {
    setSigningIn(true)
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/bingo`,
        queryParams: {
          hd: 'princeton.edu'
        }
      }
    })

    if (error) {
      console.error('Error signing in:', error)
      alert('Error signing in. Please try again.')
      setSigningIn(false)
    }
  }

  const checkProgress = () => {
    return completedSquares.length + 1
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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-pink-50 to-purple-50 p-8">
        <div className="max-w-md mx-auto">
          <a href="/" className="inline-block mb-6 text-blue-600 hover:text-blue-800 transition font-medium">
            ← Back to Home
          </a>
          
          <h1 className="text-4xl font-bold mb-4 text-center bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            2026 Bingo 🎲
          </h1>
          <p className="text-center text-gray-600 mb-8">Sign in with Google to play</p>
          
          <div className="p-6 bg-white rounded-3xl shadow-lg border-2 border-purple-100">
            <button
              onClick={signInWithGoogle}
              disabled={signingIn}
              className="w-full bg-white text-black px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition flex items-center justify-center gap-3 disabled:opacity-50 border-2 border-gray-300"
            >
              <svg className="w-6 h-6" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              {signingIn ? 'Signing in...' : 'Sign in with Google'}
            </button>
            <p className="text-sm text-gray-500 mt-4 text-center">
              Princeton students only (@princeton.edu)
            </p>
          </div>
        </div>
      </div>
    )
  }

  const hasBingo = getAllBingos(completedSquares).length > 0

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-900 via-blue-800 to-black text-white p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <a href="/" className="inline-block mb-6 text-blue-300 hover:text-white transition">
          ← Back to Home
        </a>

        <h1 className="text-4xl md:text-6xl font-bold text-center mb-2">2026 UNIMATCH</h1>
        <h2 className="text-5xl md:text-7xl font-bold text-center mb-6" style={{fontFamily: 'cursive', fontStyle: 'italic'}}>Bingo</h2>
        
        <div className="flex justify-center items-center gap-8 mb-4">
          <p className="text-xl text-gray-200">
            {checkProgress()}/25 squares
          </p>
          <div className="bg-yellow-500 text-black px-6 py-2 rounded-full font-bold text-xl">
            ⭐ {totalPoints} points
          </div>
        </div>

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

        <div className="text-center mb-4">
          <p className="text-gray-300 text-sm mb-2">Points System:</p>
          <p className="text-gray-400 text-xs">+1 point per square • +10 bonus for each BINGO (5 in a row)</p>
        </div>

        <p className="text-center text-sm md:text-base text-gray-300 italic px-4">
          I'M SORRY IF YOU COMPLETE THIS BEFORE THE END OF THE YEAR.
        </p>
      </div>
    </div>
  )
}