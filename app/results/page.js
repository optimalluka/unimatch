'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
import { useSearchParams } from 'next/navigation'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

export default function Results() {
  const searchParams = useSearchParams()
  const matchType = searchParams.get('type') || 'dating'
  
  const [user, setUser] = useState(null)
  const [email, setEmail] = useState('')
  const [match, setMatch] = useState(null)
  const [loading, setLoading] = useState(false)
  const [linkSent, setLinkSent] = useState(false)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        findMatch(session.user.email)
      }
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        findMatch(session.user.email)
      }
    })

    return () => subscription.unsubscribe()
  }, [matchType])

  const sendMagicLink = async () => {
    setLoading(true)
    const { error } = await supabase.auth.signInWithOtp({
      email: email,
      options: {
        emailRedirectTo: `${window.location.origin}/results?type=${matchType}`
      }
    })

    if (error) {
      alert('Error: ' + error.message)
    } else {
      setLinkSent(true)
    }
    setLoading(false)
  }

  const findMatch = async (userEmail) => {
    setLoading(true)
    setNotFound(false)
    
    try {
      let { data, error } = await supabase
        .from('matches')
        .select('*')
        .eq('user1_email', userEmail)
        .eq('looking_for', matchType)
        .single()

      if (!data) {
        const result = await supabase
          .from('matches')
          .select('*')
          .eq('user2_email', userEmail)
          .eq('looking_for', matchType)
          .single()
        
        data = result.data
        error = result.error
      }

      if (error || !data) {
        setNotFound(true)
        setLoading(false)
        return
      }

      setMatch(data)
      setLoading(false)
    } catch (err) {
      console.error(err)
      setNotFound(true)
      setLoading(false)
    }
  }

  const signOut = async () => {
    await supabase.auth.signOut()
    setMatch(null)
    setUser(null)
  }

  const isDating = matchType === 'dating'
  const emoji = isDating ? '💕' : '🤝'
  const title = isDating ? 'Dating Match' : 'Friend Match'
  const gradientColors = isDating 
    ? 'from-pink-500 to-rose-600' 
    : 'from-blue-500 to-cyan-600'

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-pink-50 to-purple-50 p-8">
        <div className="max-w-md mx-auto">
          <a href="/" className="inline-block mb-6 text-blue-600 hover:text-blue-800 transition font-medium">
            ← Back to Home
          </a>
          
          <h1 className="text-4xl font-bold mb-8 text-center bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            {emoji} View Your {title}
          </h1>
          
          {!linkSent ? (
            <div className="p-6 bg-white rounded-3xl shadow-lg border-2 border-purple-100">
              <p className="mb-4 text-gray-700">
                Enter your Princeton email to receive a login link:
              </p>
              <input
                type="email"
                placeholder="your.email@princeton.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-3 mb-4 border-2 border-gray-200 rounded-2xl bg-white text-gray-800 focus:border-purple-400 focus:outline-none transition"
              />
              <button
                onClick={sendMagicLink}
                disabled={loading}
                className={`w-full bg-gradient-to-r ${gradientColors} text-white py-3 rounded-2xl font-semibold hover:opacity-90 disabled:from-gray-400 disabled:to-gray-500 transition`}
              >
                {loading ? 'Sending...' : 'Send Login Link'}
              </button>
            </div>
          ) : (
            <div className="p-6 bg-white rounded-3xl shadow-lg border-2 border-purple-100 text-center">
              <h2 className="text-2xl font-bold mb-4 text-gray-800">📧 Check Your Email!</h2>
              <p className="text-gray-700">
                We sent a login link to <span className="font-semibold text-purple-600">{email}</span>
              </p>
              <p className="text-gray-500 mt-4 text-sm">
                Click the link to view your {matchType} match.
              </p>
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-pink-50 to-purple-50 p-8">
      <div className="max-w-3xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <a href="/" className="text-blue-600 hover:text-blue-800 transition font-medium">
            ← Home
          </a>
          <button
            onClick={signOut}
            className="text-gray-600 hover:text-gray-800 transition"
          >
            Sign Out
          </button>
        </div>

        <h1 className="text-4xl font-bold mb-8 text-center bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          {emoji} Your {title}
        </h1>

        {loading && (
          <div className="text-center text-2xl text-gray-700">Loading...</div>
        )}

        {notFound && !loading && (
          <div className="p-8 bg-white rounded-3xl shadow-lg border-2 border-gray-100 text-center">
            <p className="text-2xl font-semibold text-gray-800 mb-2">No {matchType} match found yet.</p>
            <p className="text-gray-600">Check back after Drop Day!</p>
            <p className="text-gray-500 mt-4 text-sm">
              Looking for a different type? 
              <a href={`/results?type=${isDating ? 'friends' : 'dating'}`} className="text-blue-600 hover:underline ml-1">
                View {isDating ? 'Friend' : 'Dating'} Matches
              </a>
            </p>
          </div>
        )}

        {match && !loading && (
          <div className="space-y-6">
            <div className={`p-8 bg-white rounded-3xl shadow-lg border-2 ${isDating ? 'border-pink-200' : 'border-blue-200'}`}>
              <h2 className="text-3xl font-bold mb-6 text-center text-gray-800">
                {isDating ? '🎉 You Matched!' : '🎉 You Found a Friend!'}
              </h2>
              
              <div className="text-center mb-6">
                <p className={`text-6xl font-bold mb-2 ${isDating ? 'text-pink-500' : 'text-blue-500'}`}>
                  {match.compatibility_percentage}%
                </p>
                <p className="text-gray-600 text-lg">Compatible</p>
              </div>

              <div className={`mb-6 p-6 rounded-2xl ${isDating ? 'bg-gradient-to-r from-pink-50 to-rose-50' : 'bg-gradient-to-r from-blue-50 to-cyan-50'}`}>
                <p className="text-2xl mb-3 text-gray-800">
                  <span className="font-semibold">Your {isDating ? 'match' : 'friend'}:</span> {match.user1_email === user.email ? match.user2_name : match.user1_name}
                </p>
                <p className="text-gray-700 text-lg">
                  <span className="font-semibold">Email:</span> {match.user1_email === user.email ? match.user2_email : match.user1_email}
                </p>
              </div>

              <div className="text-center">
                <p className="text-gray-700 text-lg">Reach out and say hi! 👋</p>
              </div>
            </div>

            {match.date_ideas && (
              <div className={`p-8 bg-white rounded-3xl shadow-lg border-2 ${isDating ? 'border-pink-200' : 'border-blue-200'}`}>
                <h3 className="text-2xl font-bold mb-4 text-gray-800 flex items-center">
                  <span className="mr-2">💡</span> {isDating ? 'Date' : 'Hangout'} Ideas for You Two
                </h3>
                <div className={`rounded-2xl p-6 ${isDating ? 'bg-gradient-to-r from-pink-50 to-rose-50' : 'bg-gradient-to-r from-blue-50 to-cyan-50'}`}>
                  <pre className="text-gray-800 whitespace-pre-wrap font-sans text-lg leading-relaxed">
                    {match.date_ideas}
                  </pre>
                </div>
                <p className="text-gray-600 text-sm mt-4 text-center">
                  These ideas are personalized based on your shared interests and hobbies! ✨
                </p>
              </div>
            )}

            <div className="text-center">
              <a 
                href={`/results?type=${isDating ? 'friends' : 'dating'}`}
                className="text-blue-600 hover:underline"
              >
                View {isDating ? 'Friend' : 'Dating'} Matches Instead
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}