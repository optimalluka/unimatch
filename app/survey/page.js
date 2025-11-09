'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

export default function Survey() {
  const [user, setUser] = useState(null)
  const [email, setEmail] = useState('')
  const [linkSent, setLinkSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [loadingData, setLoadingData] = useState(true)
  
  const [lookingFor, setLookingFor] = useState('dating')
  const [profile, setProfile] = useState({ 
    name: '', 
    age: '', 
    email: '', 
    gender: '',
    height: 66,
    genderPreference: '',
    heightMin: 60,
    heightMax: 78,
    ageMin: 18,
    ageMax: 25,
    religion: '',
    hobbies: []
  })
  
  const defaultAnswers = {}
  const numQuestions = lookingFor === 'dating' ? 20 : 19
  for (let i = 0; i < numQuestions; i++) {
    defaultAnswers[i] = 3
  }
  const [answers, setAnswers] = useState(defaultAnswers)
  const [hasExistingResponse, setHasExistingResponse] = useState(false)

  const hobbiesList = [
    "Traveling", "Exercise", "Photography", "Cooking", "Dancing", "Hiking",
    "Attending concerts", "Painting/Drawing", "Yoga", "Playing sports", "Reading",
    "Volunteer/Charity work", "Watching movies/shows", "Anime", "Art appreciation",
    "Learning languages", "Board/Card games", "Crafting", "Running", "Reading the news",
    "Stargazing", "Comedy", "Partying", "Coding", "Baking", "Singing"
  ]

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

  const questions = lookingFor === 'dating' ? datingQuestions : friendQuestions

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user)
        setProfile(prev => ({ ...prev, email: session.user.email }))
        loadExistingResponses(session.user.email)
      } else {
        setLoadingData(false)
      }
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        setUser(session.user)
        setProfile(prev => ({ ...prev, email: session.user.email }))
        loadExistingResponses(session.user.email)
      } else if (event === 'SIGNED_OUT') {
        setUser(null)
        setLoadingData(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const loadExistingResponses = async (userEmail) => {
    setLoadingData(true)
    try {
      const { data, error } = await supabase
        .from('responses')
        .select('*')
        .eq('email', userEmail)
        .eq('looking_for', lookingFor)
        .maybeSingle()

      if (data && !error) {
        setHasExistingResponse(true)
        setProfile({
          name: data.name,
          age: data.age.toString(),
          email: data.email,
          gender: data.gender,
          height: data.height || 66,
          genderPreference: data.gender_preference || '',
          heightMin: data.height_min || 60,
          heightMax: data.height_max || 78,
          ageMin: data.age_min || 18,
          ageMax: data.age_max || 25,
          religion: data.religion || '',
          hobbies: data.hobbies || []
        })
        setAnswers(data.answers || defaultAnswers)
      } else {
        setProfile(prev => ({ ...prev, email: userEmail }))
        setHasExistingResponse(false)
      }
    } catch (err) {
      console.error('Error loading responses:', err)
      setProfile(prev => ({ ...prev, email: userEmail }))
    }
    setLoadingData(false)
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
        emailRedirectTo: `${window.location.origin}/survey`,
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
  }

  const heightToString = (inches) => {
    const feet = Math.floor(inches / 12)
    const remainingInches = inches % 12
    return `${feet}'${remainingInches}"`
  }

  const toggleHobby = (hobby) => {
    if (profile.hobbies.includes(hobby)) {
      setProfile({...profile, hobbies: profile.hobbies.filter(h => h !== hobby)})
    } else {
      setProfile({...profile, hobbies: [...profile.hobbies, hobby]})
    }
  }

  const handleLookingForChange = async (value) => {
    setLookingFor(value)
    const newAnswers = {}
    const numQ = value === 'dating' ? 20 : 19
    for (let i = 0; i < numQ; i++) {
      newAnswers[i] = 3
    }
    setAnswers(newAnswers)
    
    if (user) {
      await loadExistingResponses(user.email)
    }
  }

  const handleSubmit = async () => {
    if (!profile.name || !profile.age || !profile.email || !profile.gender) {
      alert('Please fill out all required fields!')
      return
    }

    if (!profile.genderPreference) {
      alert('Please select your gender preference!')
      return
    }

    if (profile.hobbies.length < 3) {
      alert('Please select at least 3 hobbies!')
      return
    }

    setLoading(true)
    
    try {
      const insertData = {
        name: profile.name,
        age: parseInt(profile.age),
        email: profile.email,
        gender: profile.gender,
        religion: profile.religion || 'none',
        hobbies: profile.hobbies,
        answers: answers,
        looking_for: lookingFor,
        gender_preference: profile.genderPreference
      }

      if (lookingFor === 'dating') {
        insertData.height = profile.height
        insertData.height_min = profile.heightMin
        insertData.height_max = profile.heightMax
        insertData.age_min = profile.ageMin
        insertData.age_max = profile.ageMax
      }

      if (hasExistingResponse) {
        const { error } = await supabase
          .from('responses')
          .update(insertData)
          .eq('email', profile.email)
          .eq('looking_for', lookingFor)

        if (error) {
          alert('Error updating: ' + error.message)
        } else {
          alert('✅ Response updated! Check back on Drop Day.')
        }
      } else {
        const { error } = await supabase
          .from('responses')
          .insert([insertData])

        if (error) {
          alert('Error saving: ' + error.message)
        } else {
          alert(`🎉 You're all set! Check back on Drop Day to meet your ${lookingFor === 'dating' ? 'match' : 'friend'}!`)
          setHasExistingResponse(true)
        }
      }
    } catch (err) {
      alert('Error: ' + err.message)
    }
    
    setLoading(false)
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-pink-50 to-purple-50 p-8">
        <div className="max-w-md mx-auto">
          <a href="/" className="inline-block mb-6 text-blue-600 hover:text-blue-800 transition font-medium">
            ← Back to Home
          </a>
          
          <h1 className="text-4xl font-bold mb-4 text-center bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Take the Survey ✨
          </h1>
          <p className="text-center text-gray-600 mb-8">Login with your Princeton email to begin</p>
          
          {!linkSent ? (
            <div className="p-6 bg-white rounded-3xl shadow-lg border-2 border-purple-100">
              <p className="mb-4 text-gray-700">Enter your Princeton email:</p>
              <input
                type="email"
                placeholder="your.email@princeton.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && sendMagicLink()}
                className="w-full p-3 mb-4 border-2 border-gray-200 rounded-2xl bg-white text-gray-800 focus:border-purple-400 focus:outline-none transition"
              />
              <button
                onClick={sendMagicLink}
                disabled={loading}
                className="w-full bg-gradient-to-r from-purple-500 to-indigo-600 text-white py-3 rounded-2xl font-semibold hover:from-purple-600 hover:to-indigo-700 disabled:from-gray-400 disabled:to-gray-500 transition"
              >
                {loading ? 'Sending...' : 'Send Login Link'}
              </button>
            </div>
          ) : (
            <div className="p-6 bg-white rounded-3xl shadow-lg border-2 border-purple-100 text-center">
              <h2 className="text-2xl font-bold mb-4 text-gray-800">📧 Check Your Email!</h2>
              <p className="text-gray-700">We sent a login link to <span className="font-semibold text-purple-600">{email}</span></p>
            </div>
          )}
        </div>
      </div>
    )
  }

  if (loadingData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-pink-50 to-purple-50 flex items-center justify-center">
        <div className="text-2xl text-gray-700">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-pink-50 to-purple-50">
      <div className="max-w-2xl mx-auto p-8">
        <div className="flex justify-between items-center mb-6">
          <a href="/" className="text-blue-600 hover:text-blue-800 transition font-medium">← Home</a>
          <button onClick={signOut} className="text-gray-600 hover:text-gray-800 transition">Sign Out</button>
        </div>
        
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold mb-3 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Find Your {lookingFor === 'dating' ? 'Match' : 'Friend'} ✨
          </h1>
          <p className="text-xl text-gray-700">
            {hasExistingResponse ? '✏️ Edit your response' : 'Let\'s get to know the real you'}
          </p>
        </div>

        <div className="mb-8 p-8 bg-white rounded-3xl shadow-lg border-2 border-blue-100">
          <h2 className="text-2xl font-bold mb-4 text-gray-800">I'm looking for...</h2>
          <div className="grid grid-cols-2 gap-4">
            <button type="button" onClick={() => handleLookingForChange('dating')}
              className={`p-6 rounded-2xl border-2 transition text-center ${
                lookingFor === 'dating' ? 'bg-pink-100 border-pink-400 text-pink-800' : 'bg-white border-gray-200 text-gray-700'
              }`}>
              <div className="text-4xl mb-2">💕</div>
              <div className="text-xl font-bold">Dating</div>
            </button>
            <button type="button" onClick={() => handleLookingForChange('friends')}
              className={`p-6 rounded-2xl border-2 transition text-center ${
                lookingFor === 'friends' ? 'bg-blue-100 border-blue-400 text-blue-800' : 'bg-white border-gray-200 text-gray-700'
              }`}>
              <div className="text-4xl mb-2">🤝</div>
              <div className="text-xl font-bold">Friends</div>
            </button>
          </div>
        </div>
        
        <div className="mb-8 p-8 bg-white rounded-3xl shadow-lg border-2 border-purple-100">
          <h2 className="text-3xl font-bold mb-6 text-gray-800">About You</h2>
          
          <input 
            placeholder="Your name" 
            value={profile.name}
            className="w-full p-4 mb-4 border-2 border-gray-200 rounded-2xl bg-white text-gray-800 placeholder-gray-400 focus:border-purple-400 focus:outline-none transition" 
            onChange={(e) => setProfile({...profile, name: e.target.value})} 
          />
          
          <input 
            placeholder="Age" 
            type="number"
            value={profile.age}
            className="w-full p-4 mb-4 border-2 border-gray-200 rounded-2xl bg-white text-gray-800 placeholder-gray-400 focus:border-purple-400 focus:outline-none transition" 
            onChange={(e) => setProfile({...profile, age: e.target.value})} 
          />
          
          <input 
            placeholder="Princeton email (@princeton.edu)" 
            type="email"
            value={profile.email}
            disabled
            className="w-full p-4 mb-4 border-2 border-gray-200 rounded-2xl bg-gray-100 text-gray-600 cursor-not-allowed" 
          />
          
          <select 
            className="w-full p-4 mb-4 border-2 border-gray-200 rounded-2xl bg-white text-gray-800 focus:border-purple-400 focus:outline-none transition"
            value={profile.gender}
            onChange={(e) => setProfile({...profile, gender: e.target.value})}
          >
            <option value="">Your gender</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="nonbinary">Non-binary</option>
          </select>

          {lookingFor === 'dating' && (
            <div className="mb-4">
              <label className="block mb-3 text-lg text-gray-700 font-medium">Your height: {heightToString(profile.height)}</label>
              <input 
                type="range" 
                min="48" 
                max="84" 
                value={profile.height}
                className="w-full h-3 bg-purple-200 rounded-full appearance-none cursor-pointer slider" 
                onChange={(e) => setProfile({...profile, height: parseInt(e.target.value)})} 
              />
              <div className="flex justify-between text-sm text-gray-500 mt-1">
                <span>4'0"</span>
                <span>7'0"</span>
              </div>
            </div>
          )}

          <select 
            className="w-full p-4 border-2 border-gray-200 rounded-2xl bg-white text-gray-800 focus:border-purple-400 focus:outline-none transition"
            value={profile.religion}
            onChange={(e) => setProfile({...profile, religion: e.target.value})}
          >
            <option value="">Religion (optional)</option>
            <option value="none">No religion</option>
            <option value="christian">Christian</option>
            <option value="muslim">Muslim</option>
            <option value="jewish">Jewish</option>
            <option value="hindu">Hindu</option>
            <option value="buddhist">Buddhist</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div className="mb-8 p-8 bg-white rounded-3xl shadow-lg border-2 border-purple-100">
          <h2 className="text-3xl font-bold mb-4 text-gray-800">Your Hobbies 🎨</h2>
          <p className="text-gray-600 mb-4">Select at least 3 (the more, the better for matching!)</p>
          
          <div className="grid grid-cols-2 gap-3">
            {hobbiesList.map((hobby) => (
              <button
                key={hobby}
                type="button"
                onClick={() => toggleHobby(hobby)}
                className={`p-3 rounded-xl border-2 transition text-left ${
                  profile.hobbies.includes(hobby)
                    ? 'bg-purple-100 border-purple-400 text-purple-800 font-semibold'
                    : 'bg-white border-gray-200 text-gray-700 hover:border-purple-200'
                }`}
              >
                {hobby}
              </button>
            ))}
          </div>
          
          <p className="text-sm text-gray-500 mt-4">
            Selected: {profile.hobbies.length} {profile.hobbies.length === 1 ? 'hobby' : 'hobbies'}
          </p>
        </div>

        <div className="mb-8 p-8 bg-white rounded-3xl shadow-lg border-2 border-pink-100">
          <h2 className="text-3xl font-bold mb-6 text-gray-800">
            {lookingFor === 'dating' ? 'Who You\'re Looking For 💕' : 'Friend Preferences 🤝'}
          </h2>
          
          <select 
            className="w-full p-4 mb-4 border-2 border-gray-200 rounded-2xl bg-white text-gray-800 focus:border-pink-400 focus:outline-none transition"
            value={profile.genderPreference}
            onChange={(e) => setProfile({...profile, genderPreference: e.target.value})}
          >
            <option value="">
              {lookingFor === 'dating' ? 'Interested in...' : 'Preferred friend gender...'}
            </option>
            <option value="male">{lookingFor === 'dating' ? 'Men' : 'Male friends'}</option>
            <option value="female">{lookingFor === 'dating' ? 'Women' : 'Female friends'}</option>
            <option value="any">{lookingFor === 'dating' ? 'Everyone' : 'Any gender'}</option>
          </select>

          {lookingFor === 'dating' && (
            <>
              <div className="mb-4">
                <label className="block mb-3 text-lg text-gray-700 font-medium">Age range: {profile.ageMin} - {profile.ageMax}</label>
                <div className="flex gap-4">
                  <input 
                    type="number" 
                    min="18" 
                    max="30"
                    value={profile.ageMin}
                    className="w-1/2 p-4 border-2 border-gray-200 rounded-2xl bg-white text-gray-800 focus:border-pink-400 focus:outline-none transition" 
                    onChange={(e) => setProfile({...profile, ageMin: parseInt(e.target.value)})} 
                  />
                  <input 
                    type="number" 
                    min="18" 
                    max="30"
                    value={profile.ageMax}
                    className="w-1/2 p-4 border-2 border-gray-200 rounded-2xl bg-white text-gray-800 focus:border-pink-400 focus:outline-none transition" 
                    onChange={(e) => setProfile({...profile, ageMax: parseInt(e.target.value)})} 
                  />
                </div>
              </div>

              <div className="mb-4">
                <label className="block mb-3 text-lg text-gray-700 font-medium">Height range: {heightToString(profile.heightMin)} - {heightToString(profile.heightMax)}</label>
                <div className="flex gap-4 items-center">
                  <div className="w-1/2">
                    <input 
                      type="range" 
                      min="48" 
                      max="84" 
                      value={profile.heightMin}
                      className="w-full h-3 bg-pink-200 rounded-full appearance-none cursor-pointer" 
                      onChange={(e) => setProfile({...profile, heightMin: parseInt(e.target.value)})} 
                    />
                  </div>
                  <span className="text-gray-500">to</span>
                  <div className="w-1/2">
                    <input 
                      type="range" 
                      min="48" 
                      max="84" 
                      value={profile.heightMax}
                      className="w-full h-3 bg-pink-200 rounded-full appearance-none cursor-pointer" 
                      onChange={(e) => setProfile({...profile, heightMax: parseInt(e.target.value)})} 
                    />
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        <div className="mb-8">
          <div className="text-center mb-6">
            <h2 className="text-3xl font-bold text-gray-800">Now the fun part! 🎯</h2>
            <p className="text-gray-600 text-lg">Be honest - there are no wrong answers</p>
          </div>
          
          {questions.map((q, i) => (
            <div key={i} className="p-6 bg-white rounded-3xl shadow-md border-2 border-gray-100 mb-4 hover:border-purple-200 transition">
              <p className="mb-4 text-lg text-gray-800 font-medium">{q}</p>
              <div className="flex justify-between text-sm text-gray-600 mb-3">
                <span>Strongly Disagree</span>
                <span>Strongly Agree</span>
              </div>
              <input 
                type="range" 
                min="1" 
                max="5" 
                value={answers[i]}
                className="w-full h-3 bg-gray-200 rounded-full appearance-none cursor-pointer" 
                onChange={(e) => setAnswers({...answers, [i]: parseInt(e.target.value)})} 
              />
              <div className="flex justify-between text-sm text-gray-500 mt-2">
                <span>1</span>
                <span>2</span>
                <span>3</span>
                <span>4</span>
                <span>5</span>
              </div>
            </div>
          ))}
        </div>

        <button 
          onClick={handleSubmit} 
          disabled={loading}
          className="w-full py-6 bg-gradient-to-r from-pink-500 to-purple-600 text-white text-2xl font-bold rounded-3xl hover:from-pink-600 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 transition-all transform hover:scale-105 shadow-xl"
        >
          {loading ? 'Saving...' : hasExistingResponse ? '✏️ Update Response' : `✨ Find My ${lookingFor === 'dating' ? 'Match' : 'Friend'} ✨`}
        </button>
      </div>
    </div>
  )
}