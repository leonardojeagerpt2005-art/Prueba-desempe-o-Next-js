import React, { Suspense } from "react";
import LoginForm from "@/components/auth/LoginForm";

export default function LoginPage(): React.JSX.Element {
  return (
    <Suspense fallback={<div className="p-8 text-center text-sm text-gray-500">Cargando formulario...</div>}>
      <LoginForm />
    </Suspense>
  );
}
