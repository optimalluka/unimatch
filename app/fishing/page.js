'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

export default function Fishing() {
  const [user, setUser] = useState(null)
  const [email, setEmail] = useState('')
  const [linkSent, setLinkSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  
  const [shot, setShot] = useState({
    crushEmail: '',
    matchType: 'dating'
  })
  
  const [myShot, setMyShot] = useState(null)
  const [hasShot, setHasShot] = useState(false)
  const [mutualMatch, setMutualMatch] = useState(null)
  
  const DROP_DAY_ID = 'drop_1'

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        loadMyShot(session.user.email)
      }
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        loadMyShot(session.user.email)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const loadMyShot = async (userEmail) => {
    try {
      // Load my shot
      const { data, error } = await supabase
        .from('secret_admirers')
        .select('*')
        .eq('admirer_email', userEmail)
        .eq('drop_day_id', DROP_DAY_ID)
        .maybeSingle()

      if (error && error.code !== 'PGRST116') {
        console.error('Error loading shot:', error)
        return
      }

      if (data) {
        setMyShot(data)
        setHasShot(true)
        
        // Check if there's a mutual match
        await checkMutualMatch(userEmail, data.crush_email, data.match_type)
      } else {
        setMyShot(null)
        setHasShot(false)
        setMutualMatch(null)
      }
    } catch (err) {
      console.error('Error:', err)
    }
  }

  const checkMutualMatch = async (myEmail, crushEmail, matchType) => {
    try {
      // Check if crush also shot their shot at me
      const { data, error } = await supabase
        .from('secret_admirers')
        .select('*')
        .eq('admirer_email', crushEmail)
        .eq('crush_email', myEmail)
        .eq('match_type', matchType)
        .eq('drop_day_id', DROP_DAY_ID)
        .maybeSingle()

      if (error && error.code !== 'PGRST116') {
        console.error('Error checking mutual match:', error)
        return
      }

      if (data) {
        setMutualMatch(data)
      } else {
        setMutualMatch(null)
      }
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
        emailRedirectTo: `${window.location.origin}/fishing`,
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
    setMyShot(null)
    setMutualMatch(null)
  }

  const handleShootShot = async () => {
    if (!shot.crushEmail.endsWith('@princeton.edu')) {
      alert('Please enter a valid @princeton.edu email!')
      return
    }

    if (shot.crushEmail === user.email) {
      alert('You cannot shoot your shot at yourself! 😅')
      return
    }

    if (hasShot) {
      alert('You\'ve already shot your shot for this Drop Day! Check back in 2 weeks.')
      return
    }

    setSubmitting(true)

    try {
      // Create the secret admirer entry
      const { error } = await supabase
        .from('secret_admirers')
        .insert([{
          admirer_email: user.email,
          crush_email: shot.crushEmail,
          match_type: shot.matchType,
          drop_day_id: DROP_DAY_ID,
          notified: false
        }])

      if (error) {
        alert('Error: ' + error.message)
        console.error('Shot error:', error)
      } else {
        // TODO: Send email notification to crush
        console.log(`Should notify ${shot.crushEmail} that someone's fishing for them!`)
        
        alert('🎣 Shot fired! They\'ll get a notification that someone\'s fishing...')
        
        // Reset form
        setShot({
          crushEmail: '',
          matchType: 'dating'
        })
        
        // Reload shot
        await loadMyShot(user.email)
      }
    } catch (err) {
      alert('Error: ' + err.message)
      console.error('Error:', err)
    }

    setSubmitting(false)
  }

  const handleDeleteShot = async () => {
    if (!myShot) return
    
    if (mutualMatch) {
      alert('You can\'t delete your shot - you have a mutual match! 🎉')
      return
    }
    
    if (!confirm('Are you sure you want to delete your shot? You can shoot again after deleting.')) {
      return
    }

    setLoading(true)
    try {
      const { error } = await supabase
        .from('secret_admirers')
        .delete()
        .eq('id', myShot.id)

      if (error) {
        alert('Error deleting: ' + error.message)
      } else {
        alert('🎣 Shot deleted! You can shoot again.')
        setMyShot(null)
        setHasShot(false)
        setMutualMatch(null)
      }
    } catch (err) {
      alert('Error: ' + err.message)
    }
    setLoading(false)
  }

  // Login screen
  if (!user) {
    return (
      <div className="min-h-screen relative overflow-hidden bg-gradient-to-b from-cyan-900 via-blue-900 to-indigo-900">
        {/* Fishing Rod Animation */}
        <div className="absolute top-10 right-10 text-6xl animate-bounce">
          🎣
        </div>
        
        <div className="relative z-10 max-w-md mx-auto p-8">
          <a href="/" className="inline-block mb-6 text-cyan-300 hover:text-white transition font-medium">
            ← Back to Home
          </a>
          
          <div className="text-center mb-8">
            <h1 className="text-6xl font-bold mb-4 text-white drop-shadow-lg">
              🎣 Someone's Fishing
            </h1>
            <p className="text-2xl text-cyan-200 mb-2">Will You Bite?</p>
            <p className="text-lg text-cyan-300">Shoot your shot anonymously!</p>
          </div>
          
          {!linkSent ? (
            <div className="p-6 bg-white bg-opacity-95 rounded-3xl shadow-2xl border-2 border-cyan-400">
              <p className="mb-4 text-gray-700">
                Enter your Princeton email to cast your line:
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
                className="w-full p-3 mb-4 border-2 border-gray-200 rounded-2xl bg-white text-gray-800 focus:border-cyan-400 focus:outline-none transition"
              />
              <button
                onClick={sendMagicLink}
                disabled={loading}
                className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white py-3 rounded-2xl font-semibold hover:from-cyan-600 hover:to-blue-700 disabled:from-gray-400 disabled:to-gray-500 transition"
              >
                {loading ? 'Sending...' : 'Send Login Link 🎣'}
              </button>
            </div>
          ) : (
            <div className="p-6 bg-white bg-opacity-95 rounded-3xl shadow-2xl border-2 border-cyan-400 text-center">
              <h2 className="text-2xl font-bold mb-4 text-gray-800">📧 Check Your Email!</h2>
              <p className="text-gray-700 mb-4">
                We sent a login link to <span className="font-semibold text-cyan-600">{email}</span>
              </p>
              <div className="bg-cyan-50 border-2 border-cyan-200 rounded-xl p-4 text-left">
                <p className="text-sm text-gray-700 font-semibold mb-2">🎣 Ready to fish!</p>
                <p className="text-sm text-gray-600">
                  Click the link in your email to start shooting your shot!
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    )
  }

  // Main interface
  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-b from-cyan-900 via-blue-900 to-indigo-900">
      {/* Floating Fish */}
      <div className="absolute top-20 left-10 text-4xl animate-pulse">🐟</div>
      <div className="absolute top-40 right-20 text-3xl animate-bounce" style={{animationDelay: '1s'}}>🐠</div>
      <div className="absolute bottom-40 left-20 text-3xl animate-pulse" style={{animationDelay: '2s'}}>🐡</div>
      
      <div className="relative z-10 max-w-4xl mx-auto p-8">
        <div className="flex justify-between items-center mb-6">
          <a href="/" className="text-cyan-300 hover:text-white transition font-medium">
            ← Home
          </a>
          <button onClick={signOut} className="text-cyan-300 hover:text-white transition">
            Sign Out
          </button>
        </div>

        <div className="text-center mb-8">
          <h1 className="text-6xl font-bold mb-4 text-white drop-shadow-lg">
            🎣 Fishing Dock
          </h1>
          <p className="text-xl text-cyan-200">
            {hasShot ? (mutualMatch ? '💕 MUTUAL MATCH!' : '✅ Shot Taken!') : 'Shot Available: 1/1'}
          </p>
          <p className="text-sm text-cyan-300 mt-2">Your identity stays secret! 🤫</p>
        </div>

        {/* Shoot Your Shot Form */}
        {!hasShot && (
          <div className="mb-8 p-8 bg-white bg-opacity-95 rounded-3xl shadow-2xl border-2 border-cyan-400">
            <h2 className="text-3xl font-bold mb-6 text-gray-800">🎣 Shoot Your Shot</h2>
            
            <input
              type="email"
              placeholder="Crush's Email (@princeton.edu)"
              value={shot.crushEmail}
              onChange={(e) => setShot({...shot, crushEmail: e.target.value})}
              className="w-full p-4 mb-4 border-2 border-gray-200 rounded-2xl bg-white text-gray-800 focus:border-cyan-400 focus:outline-none transition"
            />

            <div className="mb-6">
              <p className="mb-3 text-gray-700 font-medium">Fishing for:</p>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setShot({...shot, matchType: 'dating'})}
                  className={`p-4 rounded-2xl border-2 transition text-center ${
                    shot.matchType === 'dating'
                      ? 'bg-pink-100 border-pink-400 text-pink-800'
                      : 'bg-white border-gray-200 text-gray-700 hover:border-pink-200'
                  }`}
                >
                  <div className="text-3xl mb-2">💕</div>
                  <div className="font-bold">Dating</div>
                </button>
                <button
                  type="button"
                  onClick={() => setShot({...shot, matchType: 'friends'})}
                  className={`p-4 rounded-2xl border-2 transition text-center ${
                    shot.matchType === 'friends'
                      ? 'bg-blue-100 border-blue-400 text-blue-800'
                      : 'bg-white border-gray-200 text-gray-700 hover:border-blue-200'
                  }`}
                >
                  <div className="text-3xl mb-2">🤝</div>
                  <div className="font-bold">Friends</div>
                </button>
              </div>
            </div>

            <div className="bg-yellow-50 border-2 border-yellow-300 rounded-xl p-4 mb-4">
              <p className="text-sm text-gray-700">
                <strong>🤫 Anonymous:</strong> They'll get a notification that "someone's fishing" but 
                <strong> your identity stays SECRET!</strong> If you BOTH shoot your shot at each other, you'll see a mutual match here!
              </p>
            </div>

            <button
              onClick={handleShootShot}
              disabled={submitting}
              className="w-full py-4 bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-xl font-bold rounded-2xl hover:from-cyan-600 hover:to-blue-700 disabled:from-gray-400 disabled:to-gray-500 transition shadow-lg"
            >
              {submitting ? 'Casting...' : '🎣 Cast Your Line!'}
            </button>
          </div>
        )}

        {/* My Shot */}
        {hasShot && myShot && (
          <div className="p-8 bg-white bg-opacity-95 rounded-3xl shadow-2xl border-2 border-cyan-400">
            <h2 className="text-3xl font-bold mb-6 text-gray-800">🎣 Your Fishing Line</h2>
            <p className="text-sm text-gray-600 mb-4">Only you can see this - your secret is safe! 🤫</p>
            
            <div className="p-6 rounded-2xl border-2 bg-gradient-to-r from-cyan-50 to-blue-50 border-cyan-300 mb-4">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <p className="font-semibold text-gray-800 text-lg">
                    🎣 {myShot.crush_email}
                  </p>
                  <p className="text-sm text-gray-600">
                    {myShot.match_type === 'dating' ? '💕 Dating' : '🤝 Friends'}
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-cyan-600 font-bold">
                    {mutualMatch ? '💕 MATCHED!' : myShot.notified ? '✅ Notified' : '⏳ Pending'}
                  </span>
                </div>
              </div>
              
              {mutualMatch ? (
                <div className="bg-green-50 border-2 border-green-300 rounded-xl p-4">
                  <p className="text-green-800 font-bold text-center text-lg mb-2">
                    🎉 IT'S A MUTUAL MATCH! 
                  </p>
                  <p className="text-green-700 text-center">
                    You both shot your shot at each other! Time to reach out! 💕
                  </p>
                </div>
              ) : (
                <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
                  <p className="text-sm text-gray-700 text-center">
                    ⏳ Waiting to see if they shoot their shot at you...
                  </p>
                  <p className="text-xs text-gray-500 text-center mt-2">
                    If they do, you'll see a mutual match notification here!
                  </p>
                </div>
              )}
            </div>

            {!mutualMatch && (
              <button
                onClick={handleDeleteShot}
                disabled={loading}
                className="w-full py-3 bg-red-500 text-white font-semibold rounded-2xl hover:bg-red-600 disabled:bg-gray-400 transition"
              >
                🗑️ Delete Shot (Change Your Mind)
              </button>
            )}
            
            {mutualMatch && (
              <div className="text-center text-gray-600 text-sm mt-4">
                Can't delete - you have a mutual match! 🎉
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}