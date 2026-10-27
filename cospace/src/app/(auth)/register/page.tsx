import React, { Suspense } from "react";
import RegisterForm from "@/components/auth/RegisterForm";

export default function RegisterPage(): React.JSX.Element {
  return (
    <Suspense fallback={<div className="p-8 text-center text-sm text-gray-500">Cargando formulario...</div>}>
      <RegisterForm />
    </Suspense>
  );
}
