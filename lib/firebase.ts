import { initializeApp, getApps, getApp } from "firebase/app"
import { 
  getAuth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut as firebaseSignOut,
  onAuthStateChanged,
  setPersistence,
  browserLocalPersistence,
  browserSessionPersistence,
  type User as FirebaseUser
} from "firebase/auth"
import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  getDoc,
  enableIndexedDbPersistence,
  initializeFirestore,
  CACHE_SIZE_UNLIMITED
} from "firebase/firestore"
import { 
  getStorage, 
  ref, 
  uploadBytes, 
  getDownloadURL,
  deleteObject
} from "firebase/storage"

const firebaseConfig = {
  apiKey: "AIzaSyBiQvqio4AWHXqQtOOkv9HjFzCpX2mo0aU",
  authDomain: "dorodango-1273d.firebaseapp.com",
  projectId: "dorodango-1273d",
  storageBucket: "dorodango-1273d.firebasestorage.app",
  messagingSenderId: "630158417956",
  appId: "1:630158417956:web:bb0f006eec3df8cb3ef8b1",
  measurementId: "G-JRFPLZQWPN"
}

// Initialize Firebase - prevent reinitialization in development
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp()

// Initialize Firestore with settings for caching
const db = initializeFirestore(app, {
  cacheSizeBytes: CACHE_SIZE_UNLIMITED
})

// Initialize Storage
const storage = getStorage(app)

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

// Initialize Auth with local persistence (persists across page refreshes)
export const auth = getAuth(app)

// Set auth persistence to local - this ensures Firebase remembers the user
// even after page refresh/browser restart
if (typeof window !== 'undefined') {
  setPersistence(auth, browserLocalPersistence).catch((err) => {
    console.warn('Failed to set auth persistence:', err)
  })
}

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

// Storage helper functions for product images
export const storageHelpers = {
  // Upload an image to Firebase Storage
  uploadImage: async (file: File, productId: number, index: number): Promise<string> => {
    const storageRef = ref(storage, `products/${productId}/image_${index}`)
    await uploadBytes(storageRef, file)
    return await getDownloadURL(storageRef)
  },

  // Upload multiple images (max 4)
  uploadImages: async (files: File[], productId: number): Promise<string[]> => {
    const urls: string[] = []
    for (let i = 0; i < Math.min(files.length, 4); i++) {
      const url = await storageHelpers.uploadImage(files[i], productId, i)
      urls.push(url)
    }
    return urls
  },

  // Delete an image from Firebase Storage
  deleteImage: async (imageUrl: string): Promise<void> => {
    try {
      const imageRef = ref(storage, imageUrl)
      await deleteObject(imageRef)
    } catch (error) {
      console.warn('Failed to delete image:', error)
    }
  },

  // Delete all images for a product
  deleteProductImages: async (productId: number): Promise<void> => {
    try {
      // Note: In production, you'd want to list all files in the folder and delete them
      // For now, this is a placeholder
      console.log(`Would delete images for product ${productId}`)
    } catch (error) {
      console.warn('Failed to delete product images:', error)
    }
  }
}

export { storage }
export default app
