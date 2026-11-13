import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { AlertCircle, Eye, EyeOff, Lock, Mail } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import LoadingSpinner from '../components/shared/LoadingSpinner';

const schema = yup.object({
  email: yup.string().email('Enter a valid email').required('Email is required'),
  password: yup.string().min(6, 'At least 6 characters').required('Password is required'),
});

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated, error, clearError, isLoading: authLoading } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [loginError, setLoginError] = useState(null);
  const [showPassword, setShowPassword] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: yupResolver(schema),
    defaultValues: { email: '', password: '' },
  });

  const from = location.state?.from?.pathname || '/';

  useEffect(() => {
    if (!authLoading && isAuthenticated) navigate(from, { replace: true });
  }, [authLoading, isAuthenticated, navigate, from]);

  // Clear any old error when leaving the page. Run once on purpose.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => () => clearError(), []);

  const onSubmit = async (data) => {
    setIsLoading(true);
    setLoginError(null);
    const result = await login(data.email, data.password);
    if (!result.success) setLoginError(result.error);
    setIsLoading(false);
  };

  if (authLoading) {
    return (
      <div className="grid min-h-screen place-items-center bg-porcelain">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <main className="relative grid min-h-screen place-items-center overflow-hidden bg-porcelain px-4 py-10">
      {/* soft decorative shapes, echoing the portfolio's marigold and dusk-blue objects */}
      <div aria-hidden="true" className="pointer-events-none absolute -right-24 -top-24 size-96 rounded-full bg-marigold/25 blur-3xl" />
      <div aria-hidden="true" className="pointer-events-none absolute -bottom-20 -left-16 size-72 rounded-full bg-dusk/10 blur-3xl" />

      <div className="relative w-full max-w-md fade-in">
        <div className="mb-8 text-center">
          <span className="mx-auto mb-5 grid size-14 place-items-center rounded-2xl bg-marigold font-display text-2xl font-bold text-ink">SK</span>
          <h1 className="text-4xl font-semibold">Portfolio CMS</h1>
          <p className="mt-2 text-gray-600">Sign in to manage your portfolio content.</p>
        </div>

        <div className="card p-8">
          <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-5">
            {(loginError || error) && (
              <div role="alert" className="alert alert-error items-center">
                <AlertCircle size={16} className="shrink-0" />
                <span>{loginError || error}</span>
              </div>
            )}

            <Input
              label="Email address"
              type="email"
              autoComplete="email"
              placeholder="admin@portfolio.com"
              icon={Mail}
              disabled={isLoading}
              error={errors.email?.message}
              {...register('email')}
            />

            <div className="relative">
              <Input
                label="Password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                placeholder="••••••••"
                icon={Lock}
                disabled={isLoading}
                error={errors.password?.message}
                {...register('password')}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                className="absolute right-3 top-[34px] grid size-7 place-items-center rounded-full text-gray-500 hover:text-ink"
              >
                {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>

            <Button type="submit" variant="primary" size="lg" isLoading={isLoading} className="w-full">
              {isLoading ? 'Signing in…' : 'Sign in'}
            </Button>
          </form>
        </div>

        <p className="mt-6 text-center text-xs text-gray-500">
          © {new Date().getFullYear()} Soham Koli · Private admin area
        </p>
      </div>
    </main>
  );
};

export default Login;
