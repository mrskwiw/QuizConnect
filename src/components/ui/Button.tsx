import { forwardRef, ButtonHTMLAttributes, ReactNode } from 'react';
import { cn } from '../../utils/cn';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'accent' | 'success' | 'danger' | 'ghost' | 'link';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  icon?: ReactNode;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({
    children,
    className,
    variant = 'primary',
    size = 'md',
    isLoading = false,
    icon,
    iconPosition = 'left',
    fullWidth = false,
    disabled,
    ...props
  }, ref) => {
    const sizeClasses = {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-4 py-2',
      lg: 'px-6 py-3 text-lg'
    };
    
    const variantClasses = {
      primary: 'btn-primary',
      secondary: 'btn-secondary',
      accent: 'btn-accent',
      success: 'btn-success',
      danger: 'btn-danger',
      ghost: 'bg-transparent hover:bg-gray-100 text-gray-700',
      link: 'bg-transparent p-0 text-blue-600 hover:text-blue-800 hover:underline'
    };

    return (
      <button
        ref={ref}
        className={cn(
          'btn',
          variantClasses[variant],
          sizeClasses[size],
          fullWidth && 'w-full',
          (disabled || isLoading) && 'opacity-70 cursor-not-allowed',
          className
        )}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading && (
          <Loader2 className="mr-2 h-4 w-4 animate-spin\" aria-hidden="true" />
        )}
        {icon && iconPosition === 'left' && !isLoading && (
          <span className="mr-2">{icon}</span>
        )}
        {children}
        {icon && iconPosition === 'right' && (
          <span className="ml-2">{icon}</span>
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';