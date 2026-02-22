import { initializeApp, getApps, getApp } from "firebase/app"
import { 
  getAuth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut as firebaseSignOut,
  onAuthStateChanged,
  type User as FirebaseUser
} from "firebase/auth"
import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  getDoc,
  addDoc,
  serverTimestamp,
  enableIndexedDbPersistence,
  initializeFirestore,
  CACHE_SIZE_UNLIMITED
} from "firebase/firestore"

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
}

// Initialize Firebase - prevent reinitialization in development
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp()

// Initialize Firestore with settings for caching
const db = initializeFirestore(app, {
  cacheSizeBytes: CACHE_SIZE_UNLIMITED
})

// Enable Firestore offline persistence (caching)
if (typeof window !== 'undefined') {
  enableIndexedDbPersistence(db).catch((err) => {
    if (err.code === 'failed-precondition') {
      console.warn('Firestore persistence failed: multiple tabs open')
    } else if (err.code === 'unimplemented') {
      console.warn('Firestore persistence not available in this browser')
    }
  })
}

// Initialize Auth
export const auth = getAuth(app)

// Export db for use in other files
export { db }

// Auth helper functions
export const firebaseAuth = {
  // Register new user with email/password
  register: async (email: string, password: string) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      return { user: userCredential.user, error: null }
    } catch (error: any) {
      return { user: null, error: error.message }
    }
  },

  // Sign in with email/password
  login: async (email: string, password: string) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password)
      return { user: userCredential.user, error: null }
    } catch (error: any) {
      return { user: null, error: error.message }
    }
  },

  // Sign out
  logout: async () => {
    try {
      await firebaseSignOut(auth)
      return { error: null }
    } catch (error: any) {
      return { error: error.message }
    }
  },

  // Listen to auth state changes
  onAuthStateChanged: (callback: (user: FirebaseUser | null) => void) => {
    return onAuthStateChanged(auth, callback)
  },

  // Get current user
  getCurrentUser: () => {
    return auth.currentUser
  }
}

// Firestore helper functions for user profiles
export const userProfile = {
  // Create or update user profile in Firestore
  setProfile: async (uid: string, data: { name: string; email: string }) => {
    try {
      await setDoc(doc(db, 'users', uid), {
        ...data,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }, { merge: true })
      return { error: null }
    } catch (error: any) {
      return { error: error.message }
    }
  },

  // Get user profile from Firestore
  getProfile: async (uid: string) => {
    try {
      const docSnap = await getDoc(doc(db, 'users', uid))
      if (docSnap.exists()) {
        return { data: docSnap.data(), error: null }
      }
      return { data: null, error: 'User not found' }
    } catch (error: any) {
      return { data: null, error: error.message }
    }
  }
}

// Products collection helper
export const productsCollection = {
  // Get products reference
  ref: () => collection(db, 'products')
}

export default app
