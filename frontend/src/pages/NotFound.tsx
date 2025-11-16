import React from 'react'
import { Link } from 'react-router-dom'
import Button from '@/components/ui/Button'

const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-md w-full text-center">
        <div className="mb-8">
          <h1 className="text-9xl font-bold text-primary-600 dark:text-primary-400">404</h1>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mt-4 mb-2">
            Page not found
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
            Sorry, we couldn't find the page you're looking for.
          </p>
        </div>

        <div className="space-y-4">
          <Link to="/">
            <Button fullWidth>
              Go back home
            </Button>
          </Link>

          <Link to="/events">
            <Button variant="outline" fullWidth>
              Browse events
            </Button>
          </Link>
        </div>

        <div className="mt-12">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            If you think this is an error, please contact our support team.
          </p>
        </div>
      </div>
    </div>
  )
}

export default NotFoundPage