import React from 'react';
import RegisterForm from '../components/auth/RegisterForm';

const RegisterPage = () => {
  const handleRegistrationSuccess = (user) => {
    console.log('User registered successfully:', user);
    // Redirect or show success message
  };

  return (
    <div className="register-page">
      <div className="container">
        <RegisterForm onSuccess={handleRegistrationSuccess} />
      </div>
    </div>
  );
};

export default RegisterPage;
