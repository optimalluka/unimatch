'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

export default function ConfirmMeetup() {
  const [user, setUser] = useState(null)
  const [matches, setMatches] = useState([])
  const [loading, setLoading] = useState(true)
  const [confirming, setConfirming] = useState(false)

  useEffect(() => {
    loadUser()
  }, [])

  const loadUser = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      setLoading(false)
      return
    }

    setUser(session.user)
    await loadMatches(session.user.email)
  }

  const loadMatches = async (email) => {
    try {
      // Get user's matches from matches table
      const { data: matchesData } = await supabase
        .from('matches')
        .select('*')
        .or(`user1_email.eq.${email},user2_email.eq.${email}`)
        .eq('looking_for', 'friends')
        .order('created_at', { ascending: false })

      if (matchesData) {
        // For each match, check if there's already a confirmation
        const matchesWithConfirmations = await Promise.all(
          matchesData.map(async (match) => {
            const { data: confirmation } = await supabase
              .from('meetup_confirmations')
              .select('*')
              .eq('match_id', match.id)
              .maybeSingle()

            return {
              ...match,
              confirmation,
              otherPersonEmail: match.user1_email === email ? match.user2_email : match.user1_email,
              otherPersonName: match.user1_email === email ? match.user2_name : match.user1_name,
              myEmail: email
            }
          })
        )

        setMatches(matchesWithConfirmations)
      }
    } catch (err) {
      console.error('Error loading matches:', err)
    }
    setLoading(false)
  }

  const confirmMeetup = async (match) => {
    if (!user) return

    setConfirming(true)

    try {
      const isUser1 = match.user1_email === user.email

      // Check if confirmation already exists
      if (match.confirmation) {
        // Update existing confirmation
        const updateData = isUser1 
          ? { user1_confirmed: true }
          : { user2_confirmed: true }

        const { data: updated } = await supabase
          .from('meetup_confirmations')
          .update(updateData)
          .eq('id', match.confirmation.id)
          .select()
          .single()

        // Check if both confirmed
        const bothConfirmed = isUser1 
          ? updated.user2_confirmed && true
          : updated.user1_confirmed && true

        if (bothConfirmed) {
          // Award points and update
          await supabase
            .from('meetup_confirmations')
            .update({ 
              both_confirmed: true,
              points_awarded: 10 
            })
            .eq('id', match.confirmation.id)

          // Award points to both users
          await awardPoints(match.user1_email, 10)
          await awardPoints(match.user2_email, 10)

          alert('🎉 Both confirmed! You each earned 10 points!')
        } else {
          alert('✅ Confirmed! Waiting for your match to confirm.')
        }
      } else {
        // Create new confirmation
        const { data: newConfirmation } = await supabase
          .from('meetup_confirmations')
          .insert([{
            match_id: match.id,
            user1_email: match.user1_email,
            user2_email: match.user2_email,
            user1_confirmed: isUser1,
            user2_confirmed: !isUser1,
            meetup_number: 1
          }])
          .select()
          .single()

        alert('✅ Confirmed! Waiting for your match to confirm.')
      }

      // Reload matches
      await loadMatches(user.email)
    } catch (err) {
      console.error('Error confirming meetup:', err)
      alert('Error confirming. Please try again.')
    }

    setConfirming(false)
  }

  const awardPoints = async (email, points) => {
    const { data: userData } = await supabase
      .from('friends')
      .select('quest_points')
      .eq('email', email)
      .maybeSingle()

    const currentPoints = userData?.quest_points || 0

    await supabase
      .from('friends')
      .update({ quest_points: currentPoints + points })
      .eq('email', email)
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
          <h1 className="text-4xl mb-4">Please log in</h1>
          <a href="/login" className="text-blue-400 hover:text-white">Log in →</a>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white p-8">
      <div className="max-w-4xl mx-auto">
        <a href="/" className="inline-block mb-6 text-blue-400 hover:text-white transition">
          ← Back to Home
        </a>

        <h1 className="text-5xl font-bold mb-4">I'm Here! 📍</h1>
        <p className="text-gray-300 mb-8">
          Confirm when you meet up with your match to earn points and unlock bingo squares!
        </p>

        {matches.length === 0 ? (
          <div className="bg-gray-800 rounded-lg p-8 text-center">
            <p className="text-xl text-gray-400">No matches yet! Take the survey to get matched.</p>
            <a href="/survey" className="inline-block mt-4 bg-blue-600 px-6 py-3 rounded-lg hover:bg-blue-700">
              Take Survey →
            </a>
          </div>
        ) : (
          <div className="space-y-4">
            {matches.map((match) => {
              const myConfirmed = match.myEmail === match.user1_email 
                ? match.confirmation?.user1_confirmed 
                : match.confirmation?.user2_confirmed
              
              const theirConfirmed = match.myEmail === match.user1_email
                ? match.confirmation?.user2_confirmed
                : match.confirmation?.user1_confirmed

              const bothConfirmed = match.confirmation?.both_confirmed

              return (
                <div key={match.id} className="bg-gray-800 rounded-lg p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-2xl font-bold">{match.otherPersonName}</h3>
                      <p className="text-gray-400">{match.otherPersonEmail}</p>
                      <p className="text-sm text-gray-500 mt-1">
                        Match created: {new Date(match.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-bold text-blue-400">
                        {match.compatibility_percentage}%
                      </div>
                    </div>
                  </div>

                  <div className="mb-4">
                    {bothConfirmed ? (
                      <div className="bg-green-600 text-white px-4 py-3 rounded-lg">
                        ✅ Both confirmed! You each earned 10 points!
                      </div>
                    ) : myConfirmed ? (
                      <div className="bg-yellow-600 text-white px-4 py-3 rounded-lg">
                        ⏳ Waiting for {match.otherPersonName} to confirm
                      </div>
                    ) : theirConfirmed ? (
                      <div className="bg-blue-600 text-white px-4 py-3 rounded-lg">
                        🔔 {match.otherPersonName} confirmed! Click below to confirm you met too.
                      </div>
                    ) : (
                      <div className="bg-gray-700 text-gray-300 px-4 py-3 rounded-lg">
                        💬 Neither of you have confirmed yet
                      </div>
                    )}
                  </div>

                  {!myConfirmed && (
                    <button
                      onClick={() => confirmMeetup(match)}
                      disabled={confirming}
                      className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {confirming ? 'Confirming...' : "✅ I'm Here! Confirm Meetup"}
                    </button>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}