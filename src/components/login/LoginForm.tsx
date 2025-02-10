import React, { useState } from 'react';

const LoginForm: React.FC = () => {
  const [isSignUp, setIsSignUp] = useState(false);

  const toggleSignUp = () => {
    setIsSignUp(!isSignUp);
  };

  return (
    <div className="flex items-start justify-center min-h-screen">
      <div className="bg-white p-8 rounded-lg shadow-lg w-96 max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center">{isSignUp ? 'Sign Up' : 'Login'}</h2>
        <form>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
              Email
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="email"
              type="email"
              placeholder="Email"
            />
          </div>
          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
              Senha
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline"
              id="password"
              type="password"
              placeholder="Senha"
            />
          </div>
          {isSignUp && (
            <div className="transition-all duration-500 ease-in-out">
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="confirmPassword">
                  Confirmar Senha
                </label>
                <input
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  id="confirmPassword"
                  type="password"
                  placeholder="Confirmar Senha"
                />
              </div>
              <div className="mb-6">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="name">
                  Nome
                </label>
                <input
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline"
                  id="name"
                  placeholder="Fulano da Silva"
                />
              </div>
            </div>
          )}
          <div className="flex items-center justify-between">
            <button
              className="bg-primary text-secondary-color cursor-pointer hover:bg-green-900 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              type="button"
            >
              {isSignUp ? 'Cadastrar' : 'Entrar'}
            </button>
            <button
              className="inline-block align-baseline font-bold text-sm text-green-800 cursor-pointer hover:text-green-800 w-52 ml-3"
              type="button"
              onClick={toggleSignUp}
            >
              {isSignUp ? 'Já tem uma conta? Entrar' : 'Precisa de uma conta? Cadastre-se'}
            </button>
          </div>
        </form>
        <div className="mt-6 text-center">
          <button
            className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            type="button"
          >
            Continue com Google
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
