import { forwardRef, HTMLAttributes, ReactNode } from 'react';
import { cn } from '../../utils/cn';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  variant?: 'default' | 'hover' | 'interactive';
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ children, className, variant = 'default', ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'card',
          variant === 'hover' && 'hover:border-blue-200',
          variant === 'interactive' && 'hover:border-blue-300 hover:translate-y-[-2px] cursor-pointer',
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';

export const CardHeader = forwardRef<
  HTMLDivElement,
  HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('p-6 pb-4 border-b border-gray-100', className)}
    {...props}
  />
));

CardHeader.displayName = 'CardHeader';

export const CardTitle = forwardRef<
  HTMLHeadingElement,
  HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn('text-xl font-semibold tracking-tight', className)}
    {...props}
  />
));

CardTitle.displayName = 'CardTitle';

export const CardDescription = forwardRef<
  HTMLParagraphElement,
  HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn('text-sm text-gray-500', className)}
    {...props}
  />
));

CardDescription.displayName = 'CardDescription';

export const CardContent = forwardRef<
  HTMLDivElement,
  HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn('p-6 pt-4', className)} {...props} />
));

CardContent.displayName = 'CardContent';

export const CardFooter = forwardRef<
  HTMLDivElement,
  HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('p-6 pt-0 flex items-center', className)}
    {...props}
  />
));

CardFooter.displayName = 'CardFooter';