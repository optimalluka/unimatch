'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

// Placeholder quests - replace with Jiya's ideas when you get them
const QUESTS = [
  {
    id: 'ice-breaker',
    title: "Ice Breaker",
    description: "Meet your match for the first time",
    points: 10,
    icon: "🤝",
    type: "meetup",
    requirement: 1
  },
  {
    id: 'second-round',
    title: "Second Round",
    description: "Hang out with your match a second time",
    points: 15,
    icon: "🔄",
    type: "meetup",
    requirement: 2
  },
  {
    id: 'triple-threat',
    title: "Triple Threat",
    description: "Meet up 3 times with the same match",
    points: 25,
    icon: "🔥",
    type: "meetup",
    requirement: 3
  },
  {
    id: 'social-butterfly',
    title: "Social Butterfly",
    description: "Get matched in 3 consecutive drops",
    points: 30,
    icon: "🦋",
    type: "participation",
    requirement: 3
  },
  {
    id: 'cupid-arrow',
    title: "Cupid's Arrow",
    description: "Ship 5 friends successfully",
    points: 20,
    icon: "💘",
    type: "shipping",
    requirement: 5
  }
]

export default function Quests() {
  const [user, setUser] = useState(null)
  const [completedQuests, setCompletedQuests] = useState([])
  const [totalPoints, setTotalPoints] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadQuestProgress()
  }, [])

  const loadQuestProgress = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      setLoading(false)
      return
    }

    setUser(session.user)

    // Load from friends table
    const { data } = await supabase
      .from('friends')
      .select('completed_quests, quest_points')
      .eq('email', session.user.email)
      .maybeSingle()

    if (data) {
      setCompletedQuests(data.completed_quests || [])
      setTotalPoints(data.quest_points || 0)
    }
    
    setLoading(false)
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
          <h1 className="text-4xl mb-4">Please log in to view quests!</h1>
          <a href="/login" className="text-blue-400 hover:text-white">Log in →</a>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-900 via-purple-800 to-black text-white p-8">
      <div className="max-w-4xl mx-auto">
        <a href="/" className="inline-block mb-6 text-purple-300 hover:text-white transition">
          ← Back to Home
        </a>

        <div className="flex justify-between items-center mb-8">
          <h1 className="text-5xl font-bold">Quests</h1>
          <div className="bg-yellow-500 text-black px-6 py-3 rounded-full font-bold text-xl">
            ⭐ {totalPoints} Points
          </div>
        </div>

        <p className="text-gray-300 mb-8">
          Complete quests to earn points and climb the leaderboard!
        </p>

        <div className="space-y-4">
          {QUESTS.map((quest) => {
            const isCompleted = completedQuests.includes(quest.id)

            return (
              <div 
                key={quest.id}
                className={`
                  p-6 rounded-xl border-2 transition-all
                  ${isCompleted 
                    ? 'bg-green-900 bg-opacity-30 border-green-500' 
                    : 'bg-gray-800 bg-opacity-50 border-purple-500'
                  }
                `}
              >
                <div className="flex items-start gap-4">
                  <div className="text-5xl">{quest.icon}</div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-2xl font-bold">{quest.title}</h3>
                      <div className={`
                        px-4 py-1 rounded-full font-semibold
                        ${isCompleted ? 'bg-green-500 text-white' : 'bg-yellow-500 text-black'}
                      `}>
                        {isCompleted ? '✓ Complete' : `+${quest.points} pts`}
                      </div>
                    </div>
                    <p className="text-gray-300 mb-3">{quest.description}</p>
                    <div className="text-sm text-gray-400">
                      Type: <span className="text-purple-300">{quest.type}</span>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        <div className="mt-8 bg-purple-900 bg-opacity-30 rounded-xl p-6 border-2 border-purple-500">
          <h3 className="text-xl font-bold mb-2">💡 How to Complete Quests</h3>
          <ul className="space-y-2 text-gray-300">
            <li>• <strong>Meetup quests:</strong> Use the "I'm Here" button when you meet your match</li>
            <li>• <strong>Shipping quests:</strong> Successfully ship friends using the Ship feature</li>
            <li>• <strong>Participation quests:</strong> Keep taking surveys and getting matched!</li>
          </ul>
        </div>
      </div>
    </div>
  )
}