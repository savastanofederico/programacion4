import { useState } from 'react';
import { useForm } from '@tanstack/react-form';
import { Link, useNavigate } from 'react-router-dom';
import { handleApiError } from '../../../shared/api/handleApiError';
import { Button } from '../../../shared/ui/Button';
import { Card } from '../../../shared/ui/Card';
import { Input } from '../../../shared/ui/Input';
import { useAuthStore } from '../../../store/authStore';
import { registerApi } from '../api/auth';

export function RegisterPage() {
  const navigate = useNavigate();
  const login = useAuthStore((s) => s.login);
  const [errorServidor, setErrorServidor] = useState<string | null>(null);

  const form = useForm({
    defaultValues: {
      username: '',
      full_name: '',
      email: '',
      password: '',
    },
    onSubmit: async ({ value }) => {
      setErrorServidor(null);
      try {
        await registerApi({
          username: value.username.trim(),
          full_name: value.full_name.trim(),
          email: value.email.trim(),
          password: value.password,
        });
        await login(value.username.trim(), value.password);
        navigate('/');
      } catch (err) {
        setErrorServidor(handleApiError(err, 'No se pudo completar el registro'));
      }
    },
  });

  return (
    <div className="max-w-md mx-auto py-8">
      <Card className="p-6 sm:p-8">
        <h1 className="text-2xl font-bold text-slate-900 mb-1">Crear cuenta</h1>
        <p className="text-sm text-slate-500 mb-6">
          Registrate para confirmar pedidos y seguir su estado en tiempo real.
        </p>

        {errorServidor && (
          <div className="mb-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700 font-medium">
            {errorServidor}
          </div>
        )}

        <form
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            void form.handleSubmit();
          }}
          className="space-y-4"
        >
          <form.Field
            name="username"
            validators={{
              onChange: ({ value }) =>
                value.trim().length < 3 ? 'Mínimo 3 caracteres' : undefined,
            }}
          >
            {(field) => {
              const firstErr = field.state.meta.errors.find(Boolean);
              return (
                <Input
                  id="reg-username"
                  label="Nombre de usuario"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder="Ej: Fede"
                  error={firstErr ? String(firstErr) : undefined}
                />
              );
            }}
          </form.Field>

          <form.Field
            name="full_name"
            validators={{
              onChange: ({ value }) =>
                value.trim().length < 2 ? 'Ingresá tu nombre completo' : undefined,
            }}
          >
            {(field) => {
              const firstErr = field.state.meta.errors.find(Boolean);
              return (
                <Input
                  id="reg-fullname"
                  label="Nombre completo"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder="Ej: Federico Savastano"
                  error={firstErr ? String(firstErr) : undefined}
                />
              );
            }}
          </form.Field>

          <form.Field
            name="email"
            validators={{
              onChange: ({ value }) =>
                !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())
                  ? 'Ingresá un email válido'
                  : undefined,
            }}
          >
            {(field) => {
              const firstErr = field.state.meta.errors.find(Boolean);
              return (
                <Input
                  id="reg-email"
                  type="email"
                  label="Email"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder="fede@ejemplo.com"
                  error={firstErr ? String(firstErr) : undefined}
                />
              );
            }}
          </form.Field>

          <form.Field
            name="password"
            validators={{
              onChange: ({ value }) =>
                value.length < 8 ? 'La contraseña debe tener al menos 8 caracteres' : undefined,
            }}
          >
            {(field) => {
              const firstErr = field.state.meta.errors.find(Boolean);
              return (
                <Input
                  id="reg-password"
                  type="password"
                  label="Contraseña"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder="Mínimo 8 caracteres"
                  error={firstErr ? String(firstErr) : undefined}
                />
              );
            }}
          </form.Field>

          <form.Subscribe selector={(state) => [state.canSubmit, state.isSubmitting]}>
            {([canSubmit, isSubmitting]) => (
              <Button
                type="submit"
                disabled={!canSubmit || isSubmitting}
                className="w-full py-2.5"
              >
                {isSubmitting ? 'Registrando...' : 'Crear cuenta'}
              </Button>
            )}
          </form.Subscribe>
        </form>

        <p className="mt-6 text-center text-sm text-slate-600">
          ¿Ya tenés cuenta?{' '}
          <Link to="/login" className="font-semibold text-amber-600 hover:underline">
            Iniciar sesión
          </Link>
        </p>
      </Card>
    </div>
  );
}
