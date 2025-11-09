'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

export default function Leaderboard() {
  const [captains, setCaptains] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchLeaderboard()
  }, [])

  const fetchLeaderboard = async () => {
    try {
      const { data, error } = await supabase
        .from('captains_leaderboard')
        .select('*')
        .order('total_points', { ascending: false })
        .limit(10)

      if (error) {
        console.error('Error fetching leaderboard:', error)
        return
      }

      setCaptains(data || [])
      setLoading(false)
    } catch (err) {
      console.error('Error:', err)
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-blue-400 via-blue-500 to-blue-700">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 left-0 w-full h-full bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxkZWZzPjxwYXR0ZXJuIGlkPSJ3YXZlcyIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSIgd2lkdGg9IjEwMCIgaGVpZ2h0PSI1MCI+PHBhdGggZD0iTTAgMjVRMjUgMCA1MCAyNVQxMDAgMjUiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS13aWR0aD0iMiIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCN3YXZlcykiLz48L3N2Zz4=')] animate-wave"></div>
        </div>
      </div>

      {/* Randomly floating boats */}
      <div className="floating-boats">
        <div className="boat boat-1">🚢💕</div>
        <div className="boat boat-2">🚢💕</div>
        <div className="boat boat-3">🚢💕</div>
        <div className="boat boat-4">🚢💕</div>
        <div className="boat boat-5">🚢💕</div>
        <div className="boat boat-6">🚢💕</div>
        <div className="boat boat-7">🚢💕</div>
        <div className="boat boat-8">🚢💕</div>
        <div className="boat boat-9">🚢💕</div>
        <div className="boat boat-10">🚢💕</div>
      </div>

      <style jsx>{`
        .floating-boats {
          position: fixed;
          inset: 0;
          pointer-events: none;
          z-index: 1;
        }

        .boat {
          position: absolute;
          font-size: 2rem;
          filter: drop-shadow(0 0 8px rgba(255, 182, 193, 0.4));
        }

        .boat-1 {
          animation: float1 35s ease-in-out infinite;
        }
        .boat-2 {
          animation: float2 40s ease-in-out infinite;
        }
        .boat-3 {
          animation: float3 38s ease-in-out infinite;
        }
        .boat-4 {
          animation: float4 45s ease-in-out infinite;
        }
        .boat-5 {
          animation: float5 37s ease-in-out infinite;
        }
        .boat-6 {
          animation: float6 42s ease-in-out infinite;
        }
        .boat-7 {
          animation: float7 39s ease-in-out infinite;
        }
        .boat-8 {
          animation: float8 44s ease-in-out infinite;
        }
        .boat-9 {
          animation: float9 48s ease-in-out infinite;
        }
        .boat-10 {
          animation: float10 36s ease-in-out infinite;
        }

        @keyframes float1 {
          0%, 100% { transform: translate(10vw, 15vh) rotate(-5deg); }
          25% { transform: translate(70vw, 25vh) rotate(10deg); }
          50% { transform: translate(60vw, 70vh) rotate(-8deg); }
          75% { transform: translate(25vw, 55vh) rotate(5deg); }
        }

        @keyframes float2 {
          0%, 100% { transform: translate(80vw, 20vh) rotate(8deg); }
          25% { transform: translate(30vw, 40vh) rotate(-12deg); }
          50% { transform: translate(15vw, 65vh) rotate(6deg); }
          75% { transform: translate(65vw, 50vh) rotate(-4deg); }
        }

        @keyframes float3 {
          0%, 100% { transform: translate(45vw, 10vh) rotate(-6deg); }
          25% { transform: translate(20vw, 45vh) rotate(9deg); }
          50% { transform: translate(75vw, 60vh) rotate(-10deg); }
          75% { transform: translate(50vw, 30vh) rotate(7deg); }
        }

        @keyframes float4 {
          0%, 100% { transform: translate(25vw, 70vh) rotate(5deg); }
          25% { transform: translate(70vw, 35vh) rotate(-7deg); }
          50% { transform: translate(40vw, 15vh) rotate(11deg); }
          75% { transform: translate(10vw, 50vh) rotate(-9deg); }
        }

        @keyframes float5 {
          0%, 100% { transform: translate(65vw, 65vh) rotate(-8deg); }
          25% { transform: translate(15vw, 25vh) rotate(6deg); }
          50% { transform: translate(55vw, 40vh) rotate(-5deg); }
          75% { transform: translate(80vw, 55vh) rotate(10deg); }
        }

        @keyframes float6 {
          0%, 100% { transform: translate(35vw, 55vh) rotate(7deg); }
          25% { transform: translate(75vw, 15vh) rotate(-11deg); }
          50% { transform: translate(20vw, 35vh) rotate(8deg); }
          75% { transform: translate(60vw, 75vh) rotate(-6deg); }
        }

        @keyframes float7 {
          0%, 100% { transform: translate(50vw, 45vh) rotate(-10deg); }
          25% { transform: translate(10vw, 60vh) rotate(5deg); }
          50% { transform: translate(70vw, 20vh) rotate(-7deg); }
          75% { transform: translate(30vw, 70vh) rotate(9deg); }
        }

        @keyframes float8 {
          0%, 100% { transform: translate(15vw, 40vh) rotate(6deg); }
          25% { transform: translate(65vw, 55vh) rotate(-9deg); }
          50% { transform: translate(45vw, 25vh) rotate(12deg); }
          75% { transform: translate(75vw, 70vh) rotate(-5deg); }
        }

        @keyframes float9 {
          0%, 100% { transform: translate(70vw, 50vh) rotate(-7deg); }
          25% { transform: translate(25vw, 20vh) rotate(8deg); }
          50% { transform: translate(55vw, 65vh) rotate(-11deg); }
          75% { transform: translate(40vw, 35vh) rotate(6deg); }
        }

        @keyframes float10 {
          0%, 100% { transform: translate(40vw, 60vh) rotate(9deg); }
          25% { transform: translate(80vw, 30vh) rotate(-6deg); }
          50% { transform: translate(30vw, 10vh) rotate(10deg); }
          75% { transform: translate(20vw, 75vh) rotate(-8deg); }
        }

        @media (max-width: 768px) {
          .boat {
            font-size: 1.5rem;
          }
        }
      `}</style>

      <div className="relative z-10 max-w-4xl mx-auto p-8">
        <a href="/ship" className="inline-block mb-6 text-white hover:text-blue-100 transition font-medium">
          ← Back to Shipping
        </a>

        <div className="text-center mb-8">
          <h1 className="text-6xl font-bold mb-4 text-white drop-shadow-lg">🏆 Top Captains</h1>
          <p className="text-xl text-blue-100">The best matchmakers at Princeton</p>
        </div>

        {loading ? (
          <div className="text-center text-white text-2xl">Loading leaderboard...</div>
        ) : captains.length === 0 ? (
          <div className="p-8 bg-white bg-opacity-95 rounded-3xl shadow-2xl border-2 border-blue-300 text-center">
            <p className="text-xl text-gray-700">No captains yet! Be the first to ship someone and earn points! ⚓</p>
          </div>
        ) : (
          <div className="space-y-4">
            {captains.map((captain, index) => (
              <div 
                key={captain.id}
                className={`p-6 bg-white bg-opacity-95 rounded-3xl shadow-2xl border-2 transition hover:scale-105 ${
                  index === 0 ? 'border-yellow-400 bg-gradient-to-r from-yellow-50 to-white' :
                  index === 1 ? 'border-gray-400 bg-gradient-to-r from-gray-50 to-white' :
                  index === 2 ? 'border-orange-400 bg-gradient-to-r from-orange-50 to-white' :
                  'border-blue-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="text-4xl font-bold text-gray-300">
                      {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-gray-800">{captain.name}</h3>
                      <p className="text-sm text-gray-600">
                        {captain.dating_matches} dating • {captain.friend_matches} friends
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-4xl font-bold text-blue-600">{captain.total_points}</p>
                    <p className="text-sm text-gray-600">points</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-8 p-6 bg-white bg-opacity-95 rounded-3xl shadow-2xl border-2 border-yellow-400 text-center">
          <h2 className="text-2xl font-bold mb-4 text-gray-800">🎁 Top Captains Earn Free Food!</h2>
          <p className="text-gray-700">Compete to become the #1 Captain and win prizes!</p>
          <p className="text-sm text-gray-600 mt-2">Dating match = 10 points • Friend match = 5 points</p>
        </div>
      </div>
    </div>
  )
}