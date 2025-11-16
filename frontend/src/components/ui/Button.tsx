import React, { ButtonHTMLAttributes, forwardRef } from 'react'
import { clsx } from 'clsx'
import LoadingSpinner from './LoadingSpinner'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'outline' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  icon?: React.ReactNode
  iconPosition?: 'left' | 'right'
  fullWidth?: boolean
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      className = '',
      variant = 'primary',
      size = 'md',
      loading = false,
      disabled,
      icon,
      iconPosition = 'left',
      fullWidth = false,
      ...props
    },
    ref
  ) => {
    const baseClasses = 'inline-flex items-center justify-center font-medium rounded-md border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed'

    const variantClasses = {
      primary: 'bg-primary-600 text-white border-transparent hover:bg-primary-700 focus:ring-primary-500 active:bg-primary-800 disabled:bg-primary-400',
      secondary: 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50 focus:ring-primary-500 dark:bg-gray-800 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-700',
      success: 'bg-success-600 text-white border-transparent hover:bg-success-700 focus:ring-success-500 active:bg-success-800 disabled:bg-success-400',
      warning: 'bg-warning-600 text-white border-transparent hover:bg-warning-700 focus:ring-warning-500 active:bg-warning-800 disabled:bg-warning-400',
      error: 'bg-error-600 text-white border-transparent hover:bg-error-700 focus:ring-error-500 active:bg-error-800 disabled:bg-error-400',
      outline: 'bg-transparent text-primary-600 border-primary-600 hover:bg-primary-50 focus:ring-primary-500 dark:text-primary-400 dark:border-primary-400 dark:hover:bg-primary-900/20 disabled:text-primary-400',
      ghost: 'bg-transparent text-gray-600 border-transparent hover:bg-gray-100 focus:ring-primary-500 dark:text-gray-400 dark:hover:bg-gray-800 disabled:text-gray-400'
    }

    const sizeClasses = {
      sm: 'px-3 py-1.5 text-xs',
      md: 'px-4 py-2 text-sm',
      lg: 'px-6 py-3 text-base'
    }

    const widthClass = fullWidth ? 'w-full' : ''

    const classes = clsx(
      baseClasses,
      variantClasses[variant],
      sizeClasses[size],
      widthClass,
      className
    )

    const renderIcon = () => {
      if (loading) {
        return <LoadingSpinner size="sm" color={variant === 'ghost' || variant === 'outline' ? 'primary' : 'white'} />
      }

      return icon
    }

    return (
      <button
        ref={ref}
        className={classes}
        disabled={disabled || loading}
        {...props}
      >
        {icon && iconPosition === 'left' && (
          <span className={children ? 'mr-2' : ''}>
            {renderIcon()}
          </span>
        )}
        {loading ? (
          <span className="opacity-0">{children}</span>
        ) : (
          children
        )}
        {icon && iconPosition === 'right' && (
          <span className={children ? 'ml-2' : ''}>
            {renderIcon()}
          </span>
        )}
      </button>
    )
  }
)

Button.displayName = 'Button'

export default Button