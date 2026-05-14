import { doc, getDoc, setDoc } from 'firebase/firestore'
import { db } from '../config/firebase-client'
import type { SavedShippingAddress, ShippingData } from '../types'

type UserAddressDoc = {
  shippingAddresses?: SavedShippingAddress[]
}

const normalizeShippingData = (data: ShippingData): ShippingData => ({
  fullName: data.fullName.trim(),
  phone: data.phone.replace(/\D/g, ''),
  street: data.street.trim(),
  apartment: (data.apartment || '').trim(),
  city: data.city.trim(),
  state: data.state.trim(),
  postalCode: data.postalCode.replace(/\D/g, ''),
  shippingMethod: data.shippingMethod,
})

const isSameAddress = (a: ShippingData, b: ShippingData) => {
  return (
    a.fullName === b.fullName &&
    a.phone === b.phone &&
    a.street === b.street &&
    (a.apartment || '') === (b.apartment || '') &&
    a.city === b.city &&
    a.state === b.state &&
    a.postalCode === b.postalCode
  )
}

const buildAddressLabel = (shippingData: ShippingData) => {
  return `${shippingData.street}, ${shippingData.city}`
}

export const addressService = {
  async getUserAddresses(userId: string): Promise<SavedShippingAddress[]> {
    try {
      const userRef = doc(db, 'users', userId)
      const userSnapshot = await getDoc(userRef)

      if (!userSnapshot.exists()) {
        return []
      }

      const userData = userSnapshot.data() as UserAddressDoc
      const addresses = Array.isArray(userData.shippingAddresses)
        ? userData.shippingAddresses
        : []

      return addresses.sort((a, b) => {
        const aTime = new Date(a.updatedAt || 0).getTime()
        const bTime = new Date(b.updatedAt || 0).getTime()
        return bTime - aTime
      })
    } catch (error) {
      console.error('❌ Error obteniendo direcciones del usuario:', error)
      return []
    }
  },

  async saveUserAddress(userId: string, shippingData: ShippingData): Promise<SavedShippingAddress> {
    const cleanShippingData = normalizeShippingData(shippingData)
    const userRef = doc(db, 'users', userId)
    const userSnapshot = await getDoc(userRef)

    const userData = userSnapshot.exists() ? (userSnapshot.data() as UserAddressDoc) : {}
    const addresses = Array.isArray(userData.shippingAddresses)
      ? [...userData.shippingAddresses]
      : []

    const now = new Date().toISOString()
    const existingIndex = addresses.findIndex((address) =>
      isSameAddress(address.shippingData, cleanShippingData)
    )

    let savedAddress: SavedShippingAddress

    if (existingIndex >= 0) {
      const current = addresses[existingIndex]
      savedAddress = {
        ...current,
        shippingData: cleanShippingData,
        label: buildAddressLabel(cleanShippingData),
        updatedAt: now,
      }
      addresses[existingIndex] = savedAddress
    } else {
      savedAddress = {
        id: `addr-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        label: buildAddressLabel(cleanShippingData),
        shippingData: cleanShippingData,
        createdAt: now,
        updatedAt: now,
      }
      addresses.push(savedAddress)
    }

    await setDoc(
      userRef,
      {
        shippingAddresses: addresses,
        updatedAt: now,
      },
      { merge: true }
    )

    return savedAddress
  },

  async updateUserAddress(
    userId: string,
    addressId: string,
    shippingData: ShippingData
  ): Promise<SavedShippingAddress | null> {
    const cleanShippingData = normalizeShippingData(shippingData)
    const userRef = doc(db, 'users', userId)
    const userSnapshot = await getDoc(userRef)

    if (!userSnapshot.exists()) {
      return null
    }

    const userData = userSnapshot.data() as UserAddressDoc
    const addresses = Array.isArray(userData.shippingAddresses)
      ? [...userData.shippingAddresses]
      : []

    const index = addresses.findIndex((address) => address.id === addressId)
    if (index < 0) {
      return null
    }

    const now = new Date().toISOString()
    const updatedAddress: SavedShippingAddress = {
      ...addresses[index],
      label: buildAddressLabel(cleanShippingData),
      shippingData: cleanShippingData,
      updatedAt: now,
    }

    addresses[index] = updatedAddress

    await setDoc(
      userRef,
      {
        shippingAddresses: addresses,
        updatedAt: now,
      },
      { merge: true }
    )

    return updatedAddress
  },

  async deleteUserAddress(userId: string, addressId: string): Promise<boolean> {
    const userRef = doc(db, 'users', userId)
    const userSnapshot = await getDoc(userRef)

    if (!userSnapshot.exists()) {
      return false
    }

    const userData = userSnapshot.data() as UserAddressDoc
    const addresses = Array.isArray(userData.shippingAddresses)
      ? [...userData.shippingAddresses]
      : []

    const filteredAddresses = addresses.filter((address) => address.id !== addressId)
    if (filteredAddresses.length === addresses.length) {
      return false
    }

    await setDoc(
      userRef,
      {
        shippingAddresses: filteredAddresses,
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    )

    return true
  },
}
