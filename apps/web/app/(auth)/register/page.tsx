'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { registerSchema, RegisterFormData } from '@/features/auth/validation/auth.schema';
import { useAuth } from '@/features/auth/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { FieldError } from '@/components/feedback/field-error';
import { ErrorMessage } from '@/components/feedback/error-message';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ROUTES } from '@/lib/routes';
import { toast } from 'sonner';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { ApiError } from '@/lib/errors/api-error';

export default function RegisterPage() {
  const { register: registerAccount, isRegistering } = useAuth();
  const router = useRouter();
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormData) => {
    setGlobalError(null);
    try {
      const { email, password, firstName, lastName } = data;
      await registerAccount({ email, password, firstName, lastName });
      toast.success('Account created successfully');
      router.push(ROUTES.AUTH.LOGIN);
    } catch (error) {
      if (error instanceof ApiError) {
        if (error.details) {
          Object.entries(error.details).forEach(([field, messages]) => {
            setError(field as keyof RegisterFormData, { type: 'server', message: messages[0] });
          });
        } else {
          setGlobalError(error.message);
        }
      } else {
        setGlobalError('An unexpected error occurred. Please try again.');
      }
    }
  };

  return (
    <Card className="w-full max-w-md shadow-lg border-muted/60 bg-background">
      <CardHeader className="space-y-2 text-center pb-6">
        <CardTitle className="text-3xl font-bold tracking-tight">Create an account</CardTitle>
        <CardDescription className="text-muted-foreground text-sm">
          Enter your details to get started
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {globalError && <ErrorMessage message={globalError} />}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name</Label>
              <Input
                id="firstName"
                placeholder="John"
                {...register('firstName')}
                className={errors.firstName ? 'border-destructive focus-visible:ring-destructive' : ''}
                disabled={isRegistering}
              />
              <FieldError message={errors.firstName?.message} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name</Label>
              <Input
                id="lastName"
                placeholder="Doe"
                {...register('lastName')}
                className={errors.lastName ? 'border-destructive focus-visible:ring-destructive' : ''}
                disabled={isRegistering}
              />
              <FieldError message={errors.lastName?.message} />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="name@example.com"
              {...register('email')}
              className={errors.email ? 'border-destructive focus-visible:ring-destructive' : ''}
              disabled={isRegistering}
            />
            <FieldError message={errors.email?.message} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                {...register('password')}
                className={errors.password ? 'border-destructive focus-visible:ring-destructive pr-10' : 'pr-10'}
                disabled={isRegistering}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground focus:outline-none"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            <FieldError message={errors.password?.message} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="••••••••"
                {...register('confirmPassword')}
                className={errors.confirmPassword ? 'border-destructive focus-visible:ring-destructive pr-10' : 'pr-10'}
                disabled={isRegistering}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground focus:outline-none"
                tabIndex={-1}
              >
                {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            <FieldError message={errors.confirmPassword?.message} />
          </div>

          <Button type="submit" className="w-full h-11 text-base" disabled={isRegistering}>
            {isRegistering ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Creating account...
              </>
            ) : (
              'Create account'
            )}
          </Button>
        </form>
      </CardContent>
      
      <CardFooter className="flex flex-col items-center justify-center space-y-4 pt-4 border-t">
        <div className="text-sm text-muted-foreground">
          Already have an account?{' '}
          <Link href={ROUTES.AUTH.LOGIN} className="text-primary font-medium hover:underline hover:text-primary/90 transition-colors">
            Sign in
          </Link>
        </div>
      </CardFooter>
    </Card>
  );
}
