'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

export default function Ship() {
  const [user, setUser] = useState(null)
  const [email, setEmail] = useState('')
  const [linkSent, setLinkSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  
  const [ship, setShip] = useState({
    person1Email: '',
    person2Email: '',
    matchType: 'dating'
  })
  
  const [myShips, setMyShips] = useState([])
  const [shipsRemaining, setShipsRemaining] = useState(2)
  
  const DROP_DAY_ID = 'drop_1'

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        loadMyShips(session.user.email)
      }
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        loadMyShips(session.user.email)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const loadMyShips = async (userEmail) => {
    try {
      const { data, error } = await supabase
        .from('ships')
        .select('*')
        .eq('cupid_email', userEmail)
        .eq('drop_day_id', DROP_DAY_ID)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error loading ships:', error)
        return
      }

      setMyShips(data || [])
      setShipsRemaining(2 - (data?.length || 0))
    } catch (err) {
      console.error('Error:', err)
    }
  }

  const sendMagicLink = async () => {
    if (!email.endsWith('@princeton.edu')) {
      alert('Please use a @princeton.edu email address!')
      return
    }

    setLoading(true)
    const { error } = await supabase.auth.signInWithOtp({
      email: email,
      options: {
        emailRedirectTo: `${window.location.origin}/ship`,
        shouldCreateUser: true
      }
    })

    if (error) {
      alert('Error: ' + error.message)
    } else {
      setLinkSent(true)
    }
    setLoading(false)
  }

  const signOut = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setMyShips([])
  }

  const handleSubmitShip = async () => {
    if (!ship.person1Email.endsWith('@princeton.edu') || !ship.person2Email.endsWith('@princeton.edu')) {
      alert('Both emails must be @princeton.edu addresses!')
      return
    }

    if (ship.person1Email === ship.person2Email) {
      alert('You cannot ship someone with themselves!')
      return
    }

    if (ship.person1Email === user.email || ship.person2Email === user.email) {
      alert('You cannot ship yourself! Just take the survey instead 😊')
      return
    }

    if (shipsRemaining <= 0) {
      alert('You\'ve used all your ships for this Drop Day! Check back in 2 weeks.')
      return
    }

    setSubmitting(true)

    try {
      const { data: existingShip } = await supabase
        .from('ships')
        .select('*')
        .or(`and(person1_email.eq.${ship.person1Email},person2_email.eq.${ship.person2Email}),and(person1_email.eq.${ship.person2Email},person2_email.eq.${ship.person1Email})`)
        .eq('match_type', ship.matchType)
        .eq('drop_day_id', DROP_DAY_ID)

      if (existingShip && existingShip.length > 0) {
        alert('Someone already shipped this pair! Great minds think alike 🚢')
        setSubmitting(false)
        return
      }

      const { error } = await supabase
        .from('ships')
        .insert([{
          cupid_email: user.email,
          cupid_name: user.email.split('@')[0],
          person1_email: ship.person1Email,
          person2_email: ship.person2Email,
          match_type: ship.matchType,
          drop_day_id: DROP_DAY_ID,
          matched: false,
          points_awarded: 0
        }])

      if (error) {
        alert('Error creating ship: ' + error.message)
        console.error('Ship error:', error)
      } else {
        await notifyShippedPerson(ship.person1Email, ship.matchType)
        await notifyShippedPerson(ship.person2Email, ship.matchType)

        alert('⚓ Ship created! Check back on Drop Day to see if they match!')
        
        setShip({
          person1Email: '',
          person2Email: '',
          matchType: 'dating'
        })
        
        loadMyShips(user.email)
      }
    } catch (err) {
      alert('Error: ' + err.message)
      console.error('Error:', err)
    }

    setSubmitting(false)
  }

  const notifyShippedPerson = async (email, matchType) => {
    try {
      const { data: existing } = await supabase
        .from('shipped_notifications')
        .select('*')
        .eq('email', email)
        .eq('drop_day_id', DROP_DAY_ID)
        .eq('match_type', matchType)
        .maybeSingle()

      if (!existing) {
        await supabase
          .from('shipped_notifications')
          .insert([{
            email: email,
            match_type: matchType,
            drop_day_id: DROP_DAY_ID,
            notified: false
          }])
        
        console.log(`Should notify ${email} that they were shipped for ${matchType}`)
      }
    } catch (err) {
      console.error('Error notifying shipped person:', err)
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-blue-400 via-blue-500 to-blue-700">
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-0 left-0 w-full h-full bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxkZWZzPjxwYXR0ZXJuIGlkPSJ3YXZlcyIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSIgd2lkdGg9IjEwMCIgaGVpZ2h0PSI1MCI+PHBhdGggZD0iTTAgMjVRMjUgMCA1MCAyNVQxMDAgMjUiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS13aWR0aD0iMiIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCN3YXZlcykiLz48L3N2Zz4=')] animate-wave"></div>
          </div>
        </div>

        {/* Floating Heart Boats - CHANGED TO 2 */}
        <div className="heart-boats-container">
          {[...Array(2)].map((_, i) => (
            <div 
              key={i} 
              className="floating-boat"
              style={{
                animationDelay: `${i * 6}s`,
                left: `${20 + i * 40}%`
              }}
            >
              🚢💕
            </div>
          ))}
        </div>

        <style jsx>{`
          .heart-boats-container {
            position: fixed;
            bottom: 0;
            left: 0;
            width: 100%;
            height: 200px;
            pointer-events: none;
            z-index: 1;
          }

          .floating-boat {
            position: absolute;
            bottom: 0;
            font-size: 2rem;
            animation: heartFloat 12s ease-in-out infinite;
            opacity: 0.8;
          }

          @keyframes heartFloat {
            0% {
              transform: translate(0, 0) rotate(0deg);
              opacity: 0;
            }
            10% {
              opacity: 0.8;
            }
            25% {
              transform: translate(20vw, -50px) rotate(5deg);
            }
            50% {
              transform: translate(40vw, -100px) rotate(-5deg);
            }
            75% {
              transform: translate(60vw, -50px) rotate(5deg);
            }
            90% {
              opacity: 0.8;
            }
            100% {
              transform: translate(80vw, 0) rotate(0deg);
              opacity: 0;
            }
          }

          @media (max-width: 768px) {
            .floating-boat {
              font-size: 1.5rem;
            }
          }
        `}</style>

        <div className="relative z-10 max-w-md mx-auto p-8">
          <a href="/" className="inline-block mb-6 text-white hover:text-blue-100 transition font-medium">
            ← Back to Home
          </a>
          
          <div className="text-center mb-8">
            <h1 className="text-6xl font-bold mb-4 text-white drop-shadow-lg">
              🚢 Set Sail
            </h1>
            <p className="text-2xl text-blue-100 mb-2">Ocean of Love</p>
            <p className="text-lg text-blue-200">Ship your friends together!</p>
          </div>
          
          {!linkSent ? (
            <div className="p-6 bg-white bg-opacity-95 rounded-3xl shadow-2xl border-2 border-blue-300">
              <p className="mb-4 text-gray-700">
                Enter your Princeton email to start shipping:
              </p>
              <input
                type="email"
                placeholder="your.email@princeton.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    sendMagicLink()
                  }
                }}
                className="w-full p-3 mb-4 border-2 border-gray-200 rounded-2xl bg-white text-gray-800 focus:border-blue-400 focus:outline-none transition"
              />
              <button
                onClick={sendMagicLink}
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-500 to-cyan-600 text-white py-3 rounded-2xl font-semibold hover:from-blue-600 hover:to-cyan-700 disabled:from-gray-400 disabled:to-gray-500 transition"
              >
                {loading ? 'Sending...' : 'Send Login Link ⚓'}
              </button>
            </div>
          ) : (
            <div className="p-6 bg-white bg-opacity-95 rounded-3xl shadow-2xl border-2 border-blue-300 text-center">
              <h2 className="text-2xl font-bold mb-4 text-gray-800">📧 Check Your Email!</h2>
              <p className="text-gray-700 mb-4">
                We sent a login link to <span className="font-semibold text-blue-600">{email}</span>
              </p>
              <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4 text-left">
                <p className="text-sm text-gray-700 font-semibold mb-2">⚓ Ahoy Captain!</p>
                <p className="text-sm text-gray-600">
                  Click the link in your email to board the ship and start matchmaking!
                </p>
              </div>
              <button
                onClick={() => {
                  setLinkSent(false)
                  setEmail('')
                }}
                className="mt-4 text-blue-600 hover:underline text-sm"
              >
                Use a different email
              </button>
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-blue-400 via-blue-500 to-blue-700">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 left-0 w-full h-full bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxkZWZzPjxwYXR0ZXJuIGlkPSJ3YXZlcyIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSIgd2lkdGg9IjEwMCIgaGVpZ2h0PSI1MCI+PHBhdGggZD0iTTAgMjVRMjUgMCA1MCAyNVQxMDAgMjUiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS13aWR0aD0iMiIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCN3YXZlcykiLz48L3N2Zz4=')] animate-wave"></div>
        </div>
      </div>

      {/* Floating Heart Boats - CHANGED TO 2 */}
      <div className="heart-boats-container">
        {[...Array(2)].map((_, i) => (
          <div 
            key={i} 
            className="floating-boat"
            style={{
              animationDelay: `${i * 6}s`,
              left: `${20 + i * 40}%`
            }}
          >
            🚢💕
          </div>
        ))}
      </div>

      <style jsx>{`
        .heart-boats-container {
          position: fixed;
          bottom: 0;
          left: 0;
          width: 100%;
          height: 200px;
          pointer-events: none;
          z-index: 1;
        }

        .floating-boat {
          position: absolute;
          bottom: 0;
          font-size: 2rem;
          animation: heartFloat 12s ease-in-out infinite;
          opacity: 0.8;
        }

        @keyframes heartFloat {
          0% {
            transform: translate(0, 0) rotate(0deg);
            opacity: 0;
          }
          10% {
            opacity: 0.8;
          }
          25% {
            transform: translate(20vw, -50px) rotate(5deg);
          }
          50% {
            transform: translate(40vw, -100px) rotate(-5deg);
          }
          75% {
            transform: translate(60vw, -50px) rotate(5deg);
          }
          90% {
            opacity: 0.8;
          }
          100% {
            transform: translate(80vw, 0) rotate(0deg);
            opacity: 0;
          }
        }

        @media (max-width: 768px) {
          .floating-boat {
            font-size: 1.5rem;
          }
        }
      `}</style>

      <div className="relative z-10 max-w-4xl mx-auto p-8">
        <div className="flex justify-between items-center mb-6">
          <a href="/" className="text-white hover:text-blue-100 transition font-medium">
            ← Home
          </a>
          <button onClick={signOut} className="text-white hover:text-blue-100 transition">
            Sign Out
          </button>
        </div>

        <div className="text-center mb-8">
          <h1 className="text-6xl font-bold mb-4 text-white drop-shadow-lg">
            🚢 Captain's Deck
          </h1>
          <p className="text-xl text-blue-100">
            Ships Remaining: <span className="font-bold text-2xl">{shipsRemaining}/2</span>
          </p>
          <a 
            href="/ship/leaderboard"
            className="inline-block mt-4 text-blue-100 hover:text-white transition underline"
          >
            View Leaderboard 🏆
          </a>
        </div>

        {shipsRemaining > 0 && (
          <div className="mb-8 p-8 bg-white bg-opacity-95 rounded-3xl shadow-2xl border-2 border-blue-300">
            <h2 className="text-3xl font-bold mb-6 text-gray-800">⚓ Create a Ship</h2>
            
            <input
              type="email"
              placeholder="Person 1 Email (@princeton.edu)"
              value={ship.person1Email}
              onChange={(e) => setShip({...ship, person1Email: e.target.value})}
              className="w-full p-4 mb-4 border-2 border-gray-200 rounded-2xl bg-white text-gray-800 focus:border-blue-400 focus:outline-none transition"
            />

            <input
              type="email"
              placeholder="Person 2 Email (@princeton.edu)"
              value={ship.person2Email}
              onChange={(e) => setShip({...ship, person2Email: e.target.value})}
              className="w-full p-4 mb-4 border-2 border-gray-200 rounded-2xl bg-white text-gray-800 focus:border-blue-400 focus:outline-none transition"
            />

            <div className="mb-6">
              <p className="mb-3 text-gray-700 font-medium">Ship them for:</p>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setShip({...ship, matchType: 'dating'})}
                  className={`p-4 rounded-2xl border-2 transition text-center ${
                    ship.matchType === 'dating'
                      ? 'bg-pink-100 border-pink-400 text-pink-800'
                      : 'bg-white border-gray-200 text-gray-700 hover:border-pink-200'
                  }`}
                >
                  <div className="text-3xl mb-2">💕</div>
                  <div className="font-bold">Dating</div>
                </button>
                <button
                  type="button"
                  onClick={() => setShip({...ship, matchType: 'friends'})}
                  className={`p-4 rounded-2xl border-2 transition text-center ${
                    ship.matchType === 'friends'
                      ? 'bg-blue-100 border-blue-400 text-blue-800'
                      : 'bg-white border-gray-200 text-gray-700 hover:border-blue-200'
                  }`}
                >
                  <div className="text-3xl mb-2">🤝</div>
                  <div className="font-bold">Friends</div>
                </button>
              </div>
            </div>

            <button
              onClick={handleSubmitShip}
              disabled={submitting}
              className="w-full py-4 bg-gradient-to-r from-blue-500 to-cyan-600 text-white text-xl font-bold rounded-2xl hover:from-blue-600 hover:to-cyan-700 disabled:from-gray-400 disabled:to-gray-500 transition shadow-lg"
            >
              {submitting ? 'Setting Sail...' : '⚓ Launch Ship!'}
            </button>
          </div>
        )}

        {shipsRemaining === 0 && (
          <div className="mb-8 p-8 bg-white bg-opacity-95 rounded-3xl shadow-2xl border-2 border-yellow-400 text-center">
            <h2 className="text-2xl font-bold mb-4 text-gray-800">🚢 All Ships Launched!</h2>
            <p className="text-gray-700">
              You've used all your ships for this Drop Day. Check back in 2 weeks for the next drop!
            </p>
          </div>
        )}

        {myShips.length > 0 && (
          <div className="p-8 bg-white bg-opacity-95 rounded-3xl shadow-2xl border-2 border-blue-300">
            <h2 className="text-3xl font-bold mb-6 text-gray-800">⚓ My Ships</h2>
            <div className="space-y-4">
              {myShips.map((s) => (
                <div key={s.id} className={`p-4 rounded-2xl border-2 ${
                  s.matched 
                    ? 'bg-green-50 border-green-400' 
                    : 'bg-gray-50 border-gray-300'
                }`}>
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-semibold text-gray-800">
                        {s.person1_email} + {s.person2_email}
                      </p>
                      <p className="text-sm text-gray-600">
                        {s.match_type === 'dating' ? '💕 Dating' : '🤝 Friends'}
                      </p>
                    </div>
                    <div className="text-right">
                      {s.matched ? (
                        <span className="text-green-600 font-bold">✅ Matched! +{s.points_awarded} pts</span>
                      ) : (
                        <span className="text-gray-500">⏳ Pending</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}