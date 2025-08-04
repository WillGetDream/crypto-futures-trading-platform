import React from 'react';
import { SignIn, SignUp, useUser } from '@clerk/clerk-react';

const ClerkAuth: React.FC = () => {
  const { isSignedIn, user } = useUser();

  if (isSignedIn) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            欢迎回来, {user?.firstName || user?.emailAddresses[0]?.emailAddress}!
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            你已成功登录
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          登录到你的账户
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          或者{' '}
          <a href="#" className="font-medium text-indigo-600 hover:text-indigo-500">
            注册新账户
          </a>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <SignIn 
            appearance={{
              elements: {
                formButtonPrimary: 'bg-indigo-600 hover:bg-indigo-700 text-white',
                card: 'bg-white',
                headerTitle: 'text-gray-900',
                headerSubtitle: 'text-gray-600',
                socialButtonsBlockButton: 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50',
                formFieldInput: 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-500',
                footerActionLink: 'text-indigo-600 hover:text-indigo-500'
              }
            }}
          />
        </div>
      </div>
    </div>
  );
};

export { ClerkAuth }; 