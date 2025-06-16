import { cn } from '../../utils/cn';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const LoadingSpinner = ({ size = 'md', className }: LoadingSpinnerProps) => {
  const sizeClasses = {
    sm: 'h-4 w-4 border-2',
    md: 'h-8 w-8 border-3',
    lg: 'h-12 w-12 border-4'
  };

  return (
    <div className={cn('relative', className)}>
      <div
        className={cn(
          'rounded-full border-blue-300 border-solid opacity-30 animate-spin',
          sizeClasses[size]
        )}
      />
      <div
        className={cn(
          'absolute top-0 left-0 rounded-full border-blue-600 border-t-transparent border-solid animate-spin',
          sizeClasses[size]
        )}
      />
    </div>
  );
};