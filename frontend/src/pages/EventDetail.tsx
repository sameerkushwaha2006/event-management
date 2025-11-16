import React from 'react'
import LoadingSpinner from '@/components/ui/LoadingSpinner'

const EventDetailPage: React.FC = () => {
  return (
    <div className="container-custom py-8">
      <div className="text-center">
        <LoadingSpinner size="lg" />
        <h1 className="text-2xl font-bold mt-4 text-gray-900 dark:text-white">
          Event Details Page
        </h1>
        <p className="text-gray-600 dark:text-gray-300 mt-2">
          View event information and register - Coming soon!
        </p>
      </div>
    </div>
  )
}

export default EventDetailPage