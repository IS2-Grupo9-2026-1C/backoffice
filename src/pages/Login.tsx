import { FormEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '@/components/Button';

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    navigate('/users');
  }

  const inputClass =
    'rounded-[10px] border border-gray-200 bg-gray-100 px-4 py-3 text-base text-gray-900 outline-none';

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-6">
      <div className="w-full max-w-[420px] rounded-2xl border border-gray-200 bg-white p-8 shadow-[0_1px_3px_rgba(17,24,39,0.04),0_4px_12px_rgba(17,24,39,0.04)]">
        <div className="mb-8">
          <div className="mb-1 flex items-center gap-2">
            <img src="/bazaar.svg" alt="Bazaar" className="block h-8 w-auto" />
            <span className="text-2xl font-bold text-[#453de0]">Admin</span>
          </div>
          <p className="m-0 text-base text-gray-500">Iniciá sesión para continuar</p>
        </div>

        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold text-gray-900" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@email.com"
              autoComplete="email"
              className={inputClass}
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold text-gray-900" htmlFor="password">
              Contraseña
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete="current-password"
              className={inputClass}
            />
          </div>

          <Button type="submit" variant="primary" fullWidth className="mt-2">
            Ingresar
          </Button>
        </form>
      </div>
    </div>
  );
}
