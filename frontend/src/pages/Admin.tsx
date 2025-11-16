import React from 'react'
import { useAuth } from '@/context/AuthContext'
import LoadingSpinner from '@/components/ui/LoadingSpinner'

const AdminPage: React.FC = () => {
  const { user } = useAuth()

  return (
    <div className="container-custom py-8">
      <div className="text-center">
        <LoadingSpinner size="lg" />
        <h1 className="text-2xl font-bold mt-4 text-gray-900 dark:text-white">
          Admin Dashboard
        </h1>
        <p className="text-gray-600 dark:text-gray-300 mt-2">
          System administration panel - Coming soon!
        </p>
        {user && (
          <div className="mt-4 text-sm text-gray-500 dark:text-gray-400">
            <p>Admin: {user.firstName} {user.lastName}</p>
            <p>Email: {user.email}</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default AdminPage