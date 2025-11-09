'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
import Groq from 'groq-sdk'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

const groq = new Groq({
  apiKey: process.env.NEXT_PUBLIC_GROQ_API_KEY,
  dangerouslyAllowBrowser: true
})

export default function Admin() {
  const [datingResponses, setDatingResponses] = useState([])
  const [friendResponses, setFriendResponses] = useState([])
  const [datingMatches, setDatingMatches] = useState([])
  const [friendMatches, setFriendMatches] = useState([])
  const [loading, setLoading] = useState(true)
  const [matchingDating, setMatchingDating] = useState(false)
  const [matchingFriends, setMatchingFriends] = useState(false)
  
  const DROP_DAY_ID = 'drop_1' // Change this each drop

  const datingQuestions = [
    "I find deep 2 a.m. talks more romantic than fancy dinners.",
    "I overanalyze texts like it's a crime scene.",
    "I value honesty even when it's inconvenient.",
    "I enjoy staying home more than going out.",
    "I am chill with my partner smoking or doing drugs.",
    "I am more interested in finding a long-term commitment than casual dating.",
    "My friends would describe me as an empathetic person.",
    "I want to make an impact, not just an income.",
    "I'm more drawn to emotional depth than physical perfection.",
    "I need frequent reassurance that I'm loved.",
    "I think arguing over what to order is just foreplay with extra steps.",
    "My faith guides how I live my life.",
    "My work goals come before almost everything else right now.",
    "I prefer talking through problems immediately rather than letting them stew.",
    "I prefer explaining things face-to-face rather than over text.",
    "I like to be dominated in the bedroom.",
    "I believe our choices shape our destiny more than fate alone.",
    "I try to notice when people need help, even if they don't ask.",
    "I enjoy exploring ideas that scare or confuse me.",
    "I think keeping promises, even small ones, is sacred."
  ]

  const friendQuestions = [
    "I often end up being the 'therapist friend.'",
    "When I get overwhelmed, I tend to disappear for a bit.",
    "I'm drawn to people who are passionate about something, anything.",
    "Unrealistic optimism triggers me.",
    "I believe being misunderstood hurts more than being disliked.",
    "I prefer spontaneous plans over perfectly organized ones.",
    "I'd rather spend an hour people-watching than in small talk.",
    "I get drained by constant socializing.",
    "I'd rather have one soul-level friend than a dozen surface ones.",
    "I replay conversations in my head long after they've ended.",
    "I've learned that vulnerability is a strength, not a risk.",
    "I appreciate people who ask how I really am and wait for the real answer.",
    "I can find comfort in awkward silences.",
    "I can admit when I am wrong.",
    "I'm usually the one who convinces everyone to go out, even when we said we'd stay in.",
    "I somehow always end up in charge of the aux.",
    "I believe every meal should end with dessert.",
    "I'll 100% take candid photos of everyone having fun.",
    "I show my affection through compliments."
  ]

  useEffect(() => {
    fetchResponses()
  }, [])

  const fetchResponses = async () => {
    try {
      const { data, error } = await supabase
        .from('responses')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error:', error)
        return
      }

      const dating = data.filter(r => r.looking_for === 'dating')
      const friends = data.filter(r => r.looking_for === 'friends')

      setDatingResponses(dating)
      setFriendResponses(friends)
      setLoading(false)
    } catch (err) {
      console.error('Error:', err)
      setLoading(false)
    }
  }

  const generateDateIdeas = async (user1, user2, lookingFor) => {
    try {
      const hobbies1 = typeof user1.hobbies === 'string' ? JSON.parse(user1.hobbies) : (user1.hobbies || [])
      const hobbies2 = typeof user2.hobbies === 'string' ? JSON.parse(user2.hobbies) : (user2.hobbies || [])
      
      const sharedHobbies = hobbies1.filter(h => hobbies2.includes(h))
      
      const questions = lookingFor === 'dating' ? datingQuestions : friendQuestions
      const sharedInterests = []
      for (let i = 0; i < questions.length; i++) {
        const ans1 = user1.answers[i]
        const ans2 = user2.answers[i]
        
        if (ans1 !== undefined && ans2 !== undefined) {
          if ((ans1 >= 4 && ans2 >= 4) || (ans1 <= 2 && ans2 <= 2)) {
            sharedInterests.push({
              question: questions[i],
              level: ans1
            })
          }
        }
      }

      const activityType = lookingFor === 'dating' ? 'date' : 'hangout'
      const prompt = `You are helping two Princeton students plan their first ${activityType}. Based on their shared hobbies and compatibility, suggest 4 creative, specific ${activityType} ideas.

SHARED HOBBIES:
${sharedHobbies.length > 0 ? sharedHobbies.join(', ') : 'No shared hobbies'}

User 1's hobbies: ${hobbies1.join(', ') || 'None listed'}
User 2's hobbies: ${hobbies2.join(', ') || 'None listed'}

Their shared personality traits:
${sharedInterests.slice(0, 5).map(s => `- ${s.question} (they ${s.level >= 4 ? 'agree' : 'disagree'})`).join('\n')}

Context:
- Location: Princeton, NJ campus and nearby town
- Budget: College students (free to $30)
- Season: Fall/Winter
- Type: ${lookingFor === 'dating' ? 'Romantic date' : 'Platonic friendship activity'}

Provide exactly 4 ${activityType} ideas. Format as a numbered list with just the idea (no explanations). Keep each idea to 12 words or less.`

      const completion = await groq.chat.completions.create({
        messages: [{ role: 'user', content: prompt }],
        model: 'llama-3.3-70b-versatile',
        temperature: 0.7,
        max_tokens: 300
      })

      const ideas = completion.choices[0]?.message?.content || 'No ideas generated'
      return ideas

    } catch (error) {
      console.error('Error generating ideas:', error)
      return `Error generating ideas. Here are some defaults:\n1. Coffee at Small World\n2. Walk around campus\n3. Study at Firestone\n4. Dinner at Hoagie Haven`
    }
  }

  const calculateCompatibility = (answers1, answers2) => {
    let score = 0
    const numQuestions = Math.max(Object.keys(answers1 || {}).length, Object.keys(answers2 || {}).length)
    
    for (let i = 0; i < numQuestions; i++) {
      const ans1 = answers1[i]
      const ans2 = answers2[i]
      
      if (ans1 !== undefined && ans2 !== undefined) {
        if (ans1 === ans2) {
          score += 1
        } else if (Math.abs(ans1 - ans2) === 1) {
          score += 0.5
        }
      }
    }
    
    return score
  }

  const calculateHobbyBonus = (user1, user2) => {
    try {
      const hobbies1 = typeof user1.hobbies === 'string' ? JSON.parse(user1.hobbies) : (user1.hobbies || [])
      const hobbies2 = typeof user2.hobbies === 'string' ? JSON.parse(user2.hobbies) : (user2.hobbies || [])
      
      const sharedHobbies = hobbies1.filter(h => hobbies2.includes(h))
      
      return Math.min(sharedHobbies.length * 0.5, 5)
    } catch (err) {
      console.error('Error calculating hobby bonus:', err)
      return 0
    }
  }

  // NEW: Calculate shipping bonus with diminishing returns
  const calculateShippingBonus = (ships) => {
    if (!ships || ships.length === 0) return 0
    
    // First ship: +2 points
    // Second ship: +1 point  
    // Third+ ships: +0.5 points each
    let bonus = 0
    ships.forEach((ship, index) => {
      if (index === 0) bonus += 2
      else if (index === 1) bonus += 1
      else bonus += 0.5
    })
    
    return Math.min(bonus, 5) // Cap at +5 total
  }

  // NEW: Check if two users are shipped together
  const checkShips = async (email1, email2, matchType) => {
    try {
      const { data, error } = await supabase
        .from('ships')
        .select('*')
        .eq('match_type', matchType)
        .eq('drop_day_id', DROP_DAY_ID)
        .eq('matched', false)
        .or(`and(person1_email.eq.${email1},person2_email.eq.${email2}),and(person1_email.eq.${email2},person2_email.eq.${email1})`)

      if (error) {
        console.error('Error checking ships:', error)
        return []
      }

      return data || []
    } catch (err) {
      console.error('Error:', err)
      return []
    }
  }

  // NEW: Award points to captains and update leaderboard
  const awardShippingPoints = async (ships, matchType) => {
    const pointsPerMatch = matchType === 'dating' ? 10 : 5

    for (const ship of ships) {
      try {
        // Mark ship as matched
        await supabase
          .from('ships')
          .update({ matched: true, points_awarded: pointsPerMatch })
          .eq('id', ship.id)

        // Update or create captain in leaderboard
        const { data: existingCaptain } = await supabase
          .from('captains_leaderboard')
          .select('*')
          .eq('email', ship.cupid_email)
          .single()

        if (existingCaptain) {
          // Update existing captain
          await supabase
            .from('captains_leaderboard')
            .update({
              total_points: existingCaptain.total_points + pointsPerMatch,
              dating_matches: matchType === 'dating' ? existingCaptain.dating_matches + 1 : existingCaptain.dating_matches,
              friend_matches: matchType === 'friends' ? existingCaptain.friend_matches + 1 : existingCaptain.friend_matches,
              last_updated: new Date().toISOString()
            })
            .eq('email', ship.cupid_email)
        } else {
          // Create new captain
          await supabase
            .from('captains_leaderboard')
            .insert([{
              email: ship.cupid_email,
              name: ship.cupid_name,
              total_points: pointsPerMatch,
              dating_matches: matchType === 'dating' ? 1 : 0,
              friend_matches: matchType === 'friends' ? 1 : 0
            }])
        }

        console.log(`⚓ Awarded ${pointsPerMatch} points to ${ship.cupid_name} for ${matchType} match!`)
      } catch (err) {
        console.error('Error awarding points:', err)
      }
    }
  }

  const isCompatibleDating = (user1, user2) => {
    if (user1.gender_preference !== 'any' && user1.gender_preference !== user2.gender) {
      return false
    }
    if (user2.gender_preference !== 'any' && user2.gender_preference !== user1.gender) {
      return false
    }

    if (user2.age < user1.age_min || user2.age > user1.age_max) {
      return false
    }
    if (user1.age < user2.age_min || user1.age > user2.age_max) {
      return false
    }

    return true
  }

  const runDatingMatching = async () => {
    setMatchingDating(true)
    
    const unmatchedUsers = [...datingResponses]
    const matchPairs = []
    
    while (unmatchedUsers.length >= 2) {
      const user1 = unmatchedUsers.shift()
      
      const compatibleUsers = []
      
      for (let index = 0; index < unmatchedUsers.length; index++) {
        const user2 = unmatchedUsers[index]
        
        if (isCompatibleDating(user1, user2)) {
          const baseScore = calculateCompatibility(user1.answers, user2.answers)
          const hobbyBonus = calculateHobbyBonus(user1, user2)
          
          // NEW: Check if they're shipped and calculate shipping bonus
          const ships = await checkShips(user1.email, user2.email, 'dating')
          const shippingBonus = calculateShippingBonus(ships)
          
          const totalScore = baseScore + hobbyBonus + shippingBonus
          
          compatibleUsers.push({ 
            user2, 
            score: totalScore, 
            baseScore, 
            hobbyBonus, 
            shippingBonus,
            ships,
            index 
          })
        }
      }

      if (compatibleUsers.length === 0) {
        console.log(`No compatible match found for ${user1.name}`)
        continue
      }

      compatibleUsers.sort((a, b) => b.score - a.score)
      const bestMatch = compatibleUsers[0]
      
      unmatchedUsers.splice(bestMatch.index, 1)
      
      console.log(`Generating date ideas for ${user1.name} and ${bestMatch.user2.name}...`)
      const dateIdeas = await generateDateIdeas(user1, bestMatch.user2, 'dating')
      
      // Dating: 20 questions + 5 hobby bonus + 5 shipping bonus = 30 max
      const matchPair = {
        user1: user1,
        user2: bestMatch.user2,
        score: bestMatch.score,
        percentage: Math.round((bestMatch.score / 30) * 100),
        dateIdeas: dateIdeas,
        hobbyBonus: bestMatch.hobbyBonus,
        shippingBonus: bestMatch.shippingBonus,
        ships: bestMatch.ships,
        lookingFor: 'dating'
      }
      
      matchPairs.push(matchPair)
      
      await saveMatchToDatabase(matchPair)
      
      // NEW: Award points to captains if this pair was shipped
      if (bestMatch.ships && bestMatch.ships.length > 0) {
        await awardShippingPoints(bestMatch.ships, 'dating')
      }
    }
    
    setDatingMatches(matchPairs)
    setMatchingDating(false)
    
    alert(`✅ Dating matching complete! Created ${matchPairs.length} matches.`)
  }

  const runFriendMatching = async () => {
    setMatchingFriends(true)
    
    const unmatchedUsers = [...friendResponses]
    const matchPairs = []
    
    while (unmatchedUsers.length >= 2) {
      const user1 = unmatchedUsers.shift()
      
      const compatibleUsers = []
      
      for (let index = 0; index < unmatchedUsers.length; index++) {
        const user2 = unmatchedUsers[index]
        
        const baseScore = calculateCompatibility(user1.answers, user2.answers)
        const hobbyBonus = calculateHobbyBonus(user1, user2)
        
        // NEW: Check if they're shipped
        const ships = await checkShips(user1.email, user2.email, 'friends')
        const shippingBonus = calculateShippingBonus(ships)
        
        const totalScore = baseScore + hobbyBonus + shippingBonus
        
        compatibleUsers.push({ 
          user2, 
          score: totalScore, 
          baseScore, 
          hobbyBonus, 
          shippingBonus,
          ships,
          index 
        })
      }

      if (compatibleUsers.length === 0) {
        console.log(`No compatible friend found for ${user1.name}`)
        continue
      }

      compatibleUsers.sort((a, b) => b.score - a.score)
      const bestMatch = compatibleUsers[0]
      
      unmatchedUsers.splice(bestMatch.index, 1)
      
      console.log(`Generating hangout ideas for ${user1.name} and ${bestMatch.user2.name}...`)
      const hangoutIdeas = await generateDateIdeas(user1, bestMatch.user2, 'friends')
      
      // Friends: 19 questions + 5 hobby bonus + 5 shipping bonus = 29 max
      const matchPair = {
        user1: user1,
        user2: bestMatch.user2,
        score: bestMatch.score,
        percentage: Math.round((bestMatch.score / 29) * 100),
        dateIdeas: hangoutIdeas,
        hobbyBonus: bestMatch.hobbyBonus,
        shippingBonus: bestMatch.shippingBonus,
        ships: bestMatch.ships,
        lookingFor: 'friends'
      }
      
      matchPairs.push(matchPair)
      
      await saveMatchToDatabase(matchPair)
      
      // NEW: Award points to captains
      if (bestMatch.ships && bestMatch.ships.length > 0) {
        await awardShippingPoints(bestMatch.ships, 'friends')
      }
    }
    
    setFriendMatches(matchPairs)
    setMatchingFriends(false)
    
    alert(`✅ Friend matching complete! Created ${matchPairs.length} matches.`)
  }

  const saveMatchToDatabase = async (matchPair) => {
    try {
      const shippedBy = matchPair.ships ? matchPair.ships.map(s => s.cupid_name) : []
      
      const { error } = await supabase
        .from('matches')
        .insert([
          {
            user1_email: matchPair.user1.email,
            user2_email: matchPair.user2.email,
            user1_name: matchPair.user1.name,
            user2_name: matchPair.user2.name,
            compatibility_score: matchPair.score,
            compatibility_percentage: matchPair.percentage,
            date_ideas: matchPair.dateIdeas,
            looking_for: matchPair.lookingFor,
            shipping_bonus: matchPair.shippingBonus || 0,
            shipped_by: shippedBy
          }
        ])

      if (error) {
        console.error('Error saving match:', error)
      }
    } catch (err) {
      console.error('Error:', err)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-2xl">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-6xl mx-auto">
        <a href="/" className="inline-block mb-6 text-blue-400 hover:text-white transition">
          ← Back to Home
        </a>
        
        <h1 className="text-4xl font-bold mb-8">Admin - Drop Day Matching</h1>
        
        {/* Dating Section */}
        <div className="mb-8 p-6 bg-pink-900 bg-opacity-30 rounded-lg border-2 border-pink-500">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-3xl mb-2 font-bold">💕 Dating Matches</h2>
              <p className="text-gray-300">
                Total submissions: {datingResponses.length}
              </p>
            </div>
            <button
              onClick={runDatingMatching}
              disabled={datingResponses.length < 2 || matchingDating}
              className="bg-pink-600 text-white px-8 py-4 rounded-lg text-xl font-semibold hover:bg-pink-700 disabled:bg-gray-600"
            >
              {matchingDating ? 'Matching...' : '💘 Run Dating Matches'}
            </button>
          </div>
        </div>

        {/* Friends Section */}
        <div className="mb-8 p-6 bg-blue-900 bg-opacity-30 rounded-lg border-2 border-blue-500">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-3xl mb-2 font-bold">🤝 Friend Matches</h2>
              <p className="text-gray-300">
                Total submissions: {friendResponses.length}
              </p>
            </div>
            <button
              onClick={runFriendMatching}
              disabled={friendResponses.length < 2 || matchingFriends}
              className="bg-blue-600 text-white px-8 py-4 rounded-lg text-xl font-semibold hover:bg-blue-700 disabled:bg-gray-600"
            >
              {matchingFriends ? 'Matching...' : '🤝 Run Friend Matches'}
            </button>
          </div>
        </div>

        {/* All Dating Submissions */}
        <div className="mb-8">
          <h2 className="text-2xl mb-4">💕 Dating Submissions ({datingResponses.length})</h2>
          <div className="space-y-2">
            {datingResponses.map((resp) => {
              const hobbies = typeof resp.hobbies === 'string' ? JSON.parse(resp.hobbies) : (resp.hobbies || [])
              return (
                <div key={resp.id} className="p-4 bg-pink-900 bg-opacity-20 rounded border border-pink-500">
                  <div className="flex justify-between mb-2">
                    <div>
                      <span className="font-semibold text-lg">{resp.name}</span>
                      <span className="text-gray-400 ml-4">{resp.email}</span>
                    </div>
                    <div className="text-gray-400">
                      {resp.age} • {resp.gender}
                    </div>
                  </div>
                  <div className="text-sm text-gray-400">
                    Looking for: {resp.gender_preference} • 
                    Religion: {resp.religion || 'none'}
                  </div>
                  <div className="text-sm text-pink-300 mt-1">
                    Hobbies: {hobbies.join(', ') || 'None'}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* All Friend Submissions */}
        <div className="mb-8">
          <h2 className="text-2xl mb-4">🤝 Friend Submissions ({friendResponses.length})</h2>
          <div className="space-y-2">
            {friendResponses.map((resp) => {
              const hobbies = typeof resp.hobbies === 'string' ? JSON.parse(resp.hobbies) : (resp.hobbies || [])
              return (
                <div key={resp.id} className="p-4 bg-blue-900 bg-opacity-20 rounded border border-blue-500">
                  <div className="flex justify-between mb-2">
                    <div>
                      <span className="font-semibold text-lg">{resp.name}</span>
                      <span className="text-gray-400 ml-4">{resp.email}</span>
                    </div>
                    <div className="text-gray-400">
                      {resp.age} • {resp.gender}
                    </div>
                  </div>
                  <div className="text-sm text-blue-300 mt-1">
                    Hobbies: {hobbies.join(', ') || 'None'}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Dating Match Results */}
        {datingMatches.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl mb-4">💕 Dating Match Results ({datingMatches.length} pairs)</h2>
            <div className="space-y-4">
              {datingMatches.map((match, index) => (
                <div key={index} className="p-6 bg-pink-900 bg-opacity-20 rounded border-2 border-pink-500">
                  <div className="flex justify-between items-center mb-4">
                    <div>
                      <h3 className="text-2xl font-semibold mb-2">
                        {match.user1.name} ❤️ {match.user2.name}
                      </h3>
                      <p className="text-gray-400">
                        {match.user1.email} ↔️ {match.user2.email}
                      </p>
                      <p className="text-sm text-pink-300 mt-1">
                        Base: {(match.score - match.hobbyBonus - match.shippingBonus).toFixed(1)} + 
                        Hobby: {match.hobbyBonus} + 
                        Shipping: {match.shippingBonus} = 
                        {match.score.toFixed(1)} points
                      </p>
                      {match.ships && match.ships.length > 0 && (
                        <p className="text-sm text-yellow-300 mt-1">
                          ⚓ Shipped by: {match.ships.map(s => s.cupid_name).join(', ')}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <div className="text-4xl font-bold text-pink-400">
                        {match.percentage}%
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-4 p-4 bg-gray-800 rounded">
                    <h4 className="font-semibold text-lg mb-2">💡 Date Ideas:</h4>
                    <pre className="text-gray-300 whitespace-pre-wrap font-sans">{match.dateIdeas}</pre>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Friend Match Results */}
        {friendMatches.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl mb-4">🤝 Friend Match Results ({friendMatches.length} pairs)</h2>
            <div className="space-y-4">
              {friendMatches.map((match, index) => (
                <div key={index} className="p-6 bg-blue-900 bg-opacity-20 rounded border-2 border-blue-500">
                  <div className="flex justify-between items-center mb-4">
                    <div>
                      <h3 className="text-2xl font-semibold mb-2">
                        {match.user1.name} 🤝 {match.user2.name}
                      </h3>
                      <p className="text-gray-400">
                        {match.user1.email} ↔️ {match.user2.email}
                      </p>
                      <p className="text-sm text-blue-300 mt-1">
                        Base: {(match.score - match.hobbyBonus - match.shippingBonus).toFixed(1)} + 
                        Hobby: {match.hobbyBonus} + 
                        Shipping: {match.shippingBonus} = 
                        {match.score.toFixed(1)} points
                      </p>
                      {match.ships && match.ships.length > 0 && (
                        <p className="text-sm text-yellow-300 mt-1">
                          ⚓ Shipped by: {match.ships.map(s => s.cupid_name).join(', ')}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <div className="text-4xl font-bold text-blue-400">
                        {match.percentage}%
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-4 p-4 bg-gray-800 rounded">
                    <h4 className="font-semibold text-lg mb-2">💡 Hangout Ideas:</h4>
                    <pre className="text-gray-300 whitespace-pre-wrap font-sans">{match.dateIdeas}</pre>
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