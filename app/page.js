'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

export default function Home() {
  const [user, setUser] = useState(null)
  const [datingOptedIn, setDatingOptedIn] = useState(true)
  const [friendsOptedIn, setFriendsOptedIn] = useState(true)
  const [loading, setLoading] = useState(false)
  const [fishingNotification, setFishingNotification] = useState(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        loadOptInStatus(session.user.email)
        checkFishingStatus(session.user.email)
      }
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        loadOptInStatus(session.user.email)
        checkFishingStatus(session.user.email)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const loadOptInStatus = async (email) => {
    try {
      // Check dating table
      const { data: datingData } = await supabase
        .from('dating')
        .select('opted_out')
        .eq('email', email)
        .maybeSingle()

      if (datingData) {
        // If opted_out is true, then opted_in is false (inverse)
        setDatingOptedIn(!datingData.opted_out)
      }

      // Check friends table
      const { data: friendsData } = await supabase
        .from('friends')
        .select('opted_out')
        .eq('email', email)
        .maybeSingle()

      if (friendsData) {
        // If opted_out is true, then opted_in is false (inverse)
        setFriendsOptedIn(!friendsData.opted_out)
      }
    } catch (err) {
      console.error('Error loading opt-in status:', err)
    }
  }

  const checkFishingStatus = async (email) => {
    try {
      const { data, error } = await supabase
        .from('secret_admirers')
        .select('*')
        .eq('crush_email', email)
        .eq('drop_day_id', 'drop_1')

      if (data && data.length > 0) {
        setFishingNotification(data.length)
      }
    } catch (err) {
      console.error('Error checking fishing status:', err)
    }
  }

  const toggleDatingOptIn = async () => {
    if (!user) {
      alert('Please log in first!')
      return
    }

    setLoading(true)
    try {
      // If currently opted in, we're opting out (set opted_out to true)
      // If currently opted out, we're opting in (set opted_out to false)
      const newOptedOut = datingOptedIn // If opted in, opt out (true). If opted out, opt in (false)
      
      const { error } = await supabase
        .from('dating')
        .update({ opted_out: newOptedOut })
        .eq('email', user.email)

      if (error) {
        alert('Error: ' + error.message)
      } else {
        setDatingOptedIn(!datingOptedIn)
        alert(datingOptedIn 
          ? '❌ Opted out of dating matching!' 
          : '✅ Opted in for dating matching!')
      }
    } catch (err) {
      alert('Error: ' + err.message)
    }
    setLoading(false)
  }

  const toggleFriendsOptIn = async () => {
    if (!user) {
      alert('Please log in first!')
      return
    }

    setLoading(true)
    try {
      // If currently opted in, we're opting out (set opted_out to true)
      // If currently opted out, we're opting in (set opted_out to false)
      const newOptedOut = friendsOptedIn // If opted in, opt out (true). If opted out, opt in (false)
      
      const { error } = await supabase
        .from('friends')
        .update({ opted_out: newOptedOut })
        .eq('email', user.email)

      if (error) {
        alert('Error: ' + error.message)
      } else {
        setFriendsOptedIn(!friendsOptedIn)
        alert(friendsOptedIn 
          ? '❌ Opted out of friend matching!' 
          : '✅ Opted in for friend matching!')
      }
    } catch (err) {
      alert('Error: ' + err.message)
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-black to-black text-white">
      <div className="max-w-4xl mx-auto px-8 py-16">
        <div className="text-center mb-16">
          <h1 className="text-7xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            UniMatch
          </h1>
          <p className="text-2xl text-gray-300 mb-2">
            Princeton's Bi-Weekly Matching Platform
          </p>
          <p className="text-lg text-gray-400">
            For dating, friends, and study buddies
          </p>
        </div>

        {/* Fishing Notification Banner */}
        {fishingNotification && fishingNotification > 0 && (
          <div className="mb-8 p-6 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-3xl shadow-2xl border-2 border-cyan-300 animate-pulse">
            <div className="text-center">
              <h2 className="text-3xl font-bold mb-2 text-white">
                🎣 Someone's Fishing for You!
              </h2>
              <p className="text-xl text-cyan-100 mb-4">
                {fishingNotification} {fishingNotification === 1 ? 'person has' : 'people have'} cast their line... will you bite?
              </p>
              <p className="text-sm text-cyan-200">
                Take the survey to potentially match with your secret admirer! 🤫
              </p>
            </div>
          </div>
        )}

        <div className="space-y-6 mb-12">
          <a 
            href="/login"
            className="block bg-gradient-to-r from-purple-500 to-indigo-600 text-white px-10 py-6 rounded-2xl text-2xl font-bold hover:from-purple-600 hover:to-indigo-700 transition-all transform hover:scale-105 shadow-xl text-center"
          >
            📝 Take the Survey
          </a>

          <div className="grid grid-cols-2 gap-4">
            <a 
              href="/ship"
              className="block bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-8 py-5 rounded-2xl text-xl font-bold hover:from-cyan-600 hover:to-blue-700 transition-all transform hover:scale-105 shadow-xl text-center"
            >
              <div className="text-3xl mb-2">🚢</div>
              <div>Ship Friends</div>
            </a>

            <a 
              href="/fishing"
              className="relative block bg-gradient-to-r from-teal-500 to-cyan-600 text-white px-8 py-5 rounded-2xl text-xl font-bold hover:from-teal-600 hover:to-cyan-700 transition-all transform hover:scale-105 shadow-xl text-center"
            >
              {fishingNotification && fishingNotification > 0 && (
                <div className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold animate-bounce">
                  {fishingNotification}
                </div>
              )}
              <div className="text-3xl mb-2">🎣</div>
              <div>Shoot Shot</div>
            </a>
          </div>

          <div className="text-center text-gray-400 text-sm mb-4">View your matches:</div>

          <div className="grid grid-cols-2 gap-4">
            <a 
              href="/results?type=dating"
              className="block bg-gradient-to-r from-pink-500 to-rose-600 text-white px-8 py-6 rounded-2xl text-xl font-bold hover:from-pink-600 hover:to-rose-700 transition-all transform hover:scale-105 shadow-xl text-center"
            >
              <div className="text-3xl mb-2">💕</div>
              <div>Dating Match</div>
            </a>

            <a 
              href="/results?type=friends"
              className="block bg-gradient-to-r from-blue-500 to-cyan-600 text-white px-8 py-6 rounded-2xl text-xl font-bold hover:from-blue-600 hover:to-cyan-700 transition-all transform hover:scale-105 shadow-xl text-center"
            >
              <div className="text-3xl mb-2">🤝</div>
              <div>Friend Match</div>
            </a>
          </div>
        </div>

        <div className="bg-gray-900 bg-opacity-50 rounded-3xl p-8 mb-8 backdrop-blur">
          <h2 className="text-3xl font-bold mb-6 text-center">How It Works</h2>
          <div className="grid md:grid-cols-4 gap-6 text-center">
            <div>
              <div className="text-5xl mb-3">📝</div>
              <h3 className="text-xl font-semibold mb-2">1. Take Survey</h3>
              <p className="text-gray-400">Answer questions about yourself and your preferences</p>
            </div>
            <div>
              <div className="text-5xl mb-3">🚢</div>
              <h3 className="text-xl font-semibold mb-2">2. Ship Friends</h3>
              <p className="text-gray-400">Play matchmaker and earn points on the leaderboard</p>
            </div>
            <div>
              <div className="text-5xl mb-3">🎣</div>
              <h3 className="text-xl font-semibold mb-2">3. Shoot Your Shot</h3>
              <p className="text-gray-400">Let someone know anonymously that you're interested</p>
            </div>
            <div>
              <div className="text-5xl mb-3">🤖</div>
              <h3 className="text-xl font-semibold mb-2">4. Get Matched</h3>
              <p className="text-gray-400">Our algorithm finds your best match every 2 weeks</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-blue-900 to-cyan-900 bg-opacity-50 rounded-3xl p-8 mb-8 backdrop-blur border-2 border-cyan-500">
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-3">🏆 Captain Leaderboard</h2>
            <p className="text-gray-300 mb-4">
              Top shippers earn prizes! Ship your friends and climb the ranks.
            </p>
            <a 
              href="/ship/leaderboard"
              className="inline-block bg-white text-blue-600 px-6 py-3 rounded-xl font-semibold hover:bg-blue-50 transition"
            >
              View Leaderboard →
            </a>
          </div>
        </div>

        {/* Next Drop & Opt-In */}
        <div className="text-center space-y-4">
          <p className="text-gray-400 text-lg">
            Next Drop: <span className="font-semibold text-white">TBD</span>
          </p>

          {user && (
            <div className="inline-block bg-gray-800 bg-opacity-50 rounded-2xl p-6 backdrop-blur">
              <h3 className="text-xl font-semibold mb-4 text-white">Matching Preferences</h3>
              <p className="text-sm text-gray-400 mb-4">Check the boxes to opt-in for matching</p>
              
              {/* Dating Opt-in */}
              <div className="mb-4">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={datingOptedIn}
                    onChange={toggleDatingOptIn}
                    disabled={loading}
                    className="w-5 h-5 mr-3"
                  />
                  <span className="text-white text-lg">
                    💕 Include me in dating matching
                  </span>
                </label>
                <p className="text-sm text-gray-400 mt-1 ml-8">
                  {datingOptedIn 
                    ? '✅ You\'ll be matched for dating in future drops' 
                    : '❌ You won\'t be matched for dating'}
                </p>
              </div>

              {/* Friends Opt-in */}
              <div>
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={friendsOptedIn}
                    onChange={toggleFriendsOptIn}
                    disabled={loading}
                    className="w-5 h-5 mr-3"
                  />
                  <span className="text-white text-lg">
                    🤝 Include me in friend matching
                  </span>
                </label>
                <p className="text-sm text-gray-400 mt-1 ml-8">
                  {friendsOptedIn 
                    ? '✅ You\'ll be matched for friends in future drops' 
                    : '❌ You won\'t be matched for friends'}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}