import { useState } from 'react';
import { useForm } from '@tanstack/react-form';
import { Link, useNavigate } from 'react-router-dom';
import { handleApiError } from '../../../shared/api/handleApiError';
import { Button } from '../../../shared/ui/Button';
import { Card } from '../../../shared/ui/Card';
import { Input } from '../../../shared/ui/Input';
import { useAuthStore } from '../../../store/authStore';

export function LoginPage() {
  const navigate = useNavigate();
  const login = useAuthStore((s) => s.login);
  const [errorServidor, setErrorServidor] = useState<string | null>(null);

  const form = useForm({
    defaultValues: {
      username: '',
      password: '',
    },
    onSubmit: async ({ value }) => {
      setErrorServidor(null);
      try {
        const user = await login(value.username.trim(), value.password);
        navigate(user.role === 'admin' ? '/admin/resumen' : '/');
      } catch (err) {
        setErrorServidor(handleApiError(err, 'No se pudo iniciar sesión'));
      }
    },
  });

  return (
    <div className="max-w-md mx-auto py-8">
      <Card className="p-6 sm:p-8">
        <h1 className="text-2xl font-bold text-slate-900 mb-1">Iniciar sesión</h1>
        <p className="text-sm text-slate-500 mb-6">
          Ingresá con tu cuenta para hacer pedidos o administrar el catálogo.
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
                !value.trim() ? 'Ingresá tu nombre de usuario' : undefined,
            }}
          >
            {(field) => {
              const firstErr = field.state.meta.errors.find(Boolean);
              return (
                <Input
                  id="username"
                  label="Usuario"
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
            name="password"
            validators={{
              onChange: ({ value }) => (!value ? 'Ingresá tu contraseña' : undefined),
            }}
          >
            {(field) => {
              const firstErr = field.state.meta.errors.find(Boolean);
              return (
                <Input
                  id="password"
                  type="password"
                  label="Contraseña"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder="••••••••"
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
                {isSubmitting ? 'Ingresando...' : 'Ingresar'}
              </Button>
            )}
          </form.Subscribe>
        </form>

        <p className="mt-6 text-center text-sm text-slate-600">
          ¿Todavía no tenés cuenta?{' '}
          <Link to="/register" className="font-semibold text-amber-600 hover:underline">
            Registrate acá
          </Link>
        </p>
      </Card>
    </div>
  );
}
