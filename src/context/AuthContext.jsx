/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from 'firebase/auth'
import { doc, serverTimestamp, setDoc } from 'firebase/firestore'
import { auth, db } from '../firebase.js'

const AuthContext = createContext(null)

export function useAuth() {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }

  return context
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    return onAuthStateChanged(auth, (user) => {
      setCurrentUser(user)
      setLoading(false)
    })
  }, [])

  async function register(email, password, name) {
    const credential = await createUserWithEmailAndPassword(auth, email, password)
    await updateProfile(credential.user, { displayName: name })
    setCurrentUser(credential.user)

    try {
      await setDoc(doc(db, 'users', credential.user.uid), {
        name,
        email,
        createdAt: serverTimestamp(),
        totalXP: 0,
        rank: 'Spark',
        streak: 0,
        masteries: {
          mrVoltXP: 0,
          lunaXP: 0,
          mariXP: 0,
        },
        achievements: [],
      })
    } catch (error) {
      const profileError = new Error(
        'Your account was created and signed in, but the profile could not be saved to Firestore. Check your Firestore rules and try again.',
      )
      profileError.code = 'firestore/profile-write-failed'
      profileError.cause = error
      throw profileError
    }

    return credential
  }

  function login(email, password) {
    return signInWithEmailAndPassword(auth, email, password)
  }

  function logout() {
    return signOut(auth)
  }

  const value = useMemo(
    () => ({ currentUser, loading, register, login, logout }),
    [currentUser, loading],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
