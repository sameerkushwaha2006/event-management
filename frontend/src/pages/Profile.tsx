import React from 'react'
import { useAuth } from '@/context/AuthContext'
import LoadingSpinner from '@/components/ui/LoadingSpinner'

const ProfilePage: React.FC = () => {
  const { user } = useAuth()

  return (
    <div className="container-custom py-8">
      <div className="text-center">
        <LoadingSpinner size="lg" />
        <h1 className="text-2xl font-bold mt-4 text-gray-900 dark:text-white">
          Profile Page
        </h1>
        <p className="text-gray-600 dark:text-gray-300 mt-2">
          Manage your profile and settings - Coming soon!
        </p>
        {user && (
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
            Current user: {user.firstName} {user.lastName} ({user.email})
          </p>
        )}
      </div>
    </div>
  )
}

export default ProfilePage