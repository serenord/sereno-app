import RegisterForm from '@/components/auth/RegisterForm'

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-extrabold text-blue-900 tracking-tight sm:text-5xl">
            Bienvenido a Sereno
          </h1>
          <p className="mt-4 text-xl text-gray-600">
            Regístrate para comenzar a gestionar el cuidado de tus seres queridos con total paz mental.
          </p>
        </div>
        
        <RegisterForm />
      </div>
    </div>
  )
}
