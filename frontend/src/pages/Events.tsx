import React from 'react'
import LoadingSpinner from '@/components/ui/LoadingSpinner'

const EventsPage: React.FC = () => {
  return (
    <div className="container-custom py-8">
      <div className="text-center">
        <LoadingSpinner size="lg" />
        <h1 className="text-2xl font-bold mt-4 text-gray-900 dark:text-white">
          Events Page
        </h1>
        <p className="text-gray-600 dark:text-gray-300 mt-2">
          Browse and discover upcoming events - Coming soon!
        </p>
      </div>
    </div>
  )
}

export default EventsPage