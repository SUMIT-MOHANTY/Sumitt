import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const LoginForm = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [validationErrors, setValidationErrors] = useState({});
  const [formSubmitted, setFormSubmitted] = useState(false);

  const { login, loading, error: authError } = useAuth();
  const navigate = useNavigate();

  const validateForm = () => {
    const errors = {};

    // Email validation
    if (!formData.email) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Email is invalid';
    }

    // Password validation
    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }

    return errors;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear validation error when user starts typing
    if (validationErrors[name]) {
      setValidationErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormSubmitted(true);

    // Validate form
    const errors = validateForm();
    setValidationErrors(errors);

    // If no errors, proceed with login
    if (Object.keys(errors).length === 0) {
      try {
        const success = await login(formData.email, formData.password);
        if (success) {
          // Redirect to dashboard or home page after successful login
          navigate('/dashboard');
        }
      } catch (error) {
        console.error('Login submission error:', error);
        // Auth error will be handled by the AuthContext
      }
    }
  };

  return (
    <div className="login-form-container">
      <h2>Login to Your Account</h2>

      {authError && <div className="alert alert-danger">{authError}</div>}

      <form onSubmit={handleSubmit} noValidate>
        <div className="form-group">
          <label htmlFor="email">Email Address</label>
          <input
            type="email"
            id="email"
            name="email"
            className={`form-control ${formSubmitted && validationErrors.email ? 'is-invalid' : ''}`}
            value={formData.email}
            onChange={handleChange}
            placeholder="Enter your email"
            disabled={loading}
          />
          {formSubmitted && validationErrors.email && (
            <div className="invalid-feedback">{validationErrors.email}</div>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            name="password"
            className={`form-control ${formSubmitted && validationErrors.password ? 'is-invalid' : ''}`}
            value={formData.password}
            onChange={handleChange}
            placeholder="Enter your password"
            disabled={loading}
          />
          {formSubmitted && validationErrors.password && (
            <div className="invalid-feedback">{validationErrors.password}</div>
          )}
        </div>

        <div className="form-group form-check">
          <input type="checkbox" className="form-check-input" id="rememberMe" />
          <label className="form-check-label" htmlFor="rememberMe">Remember me</label>
        </div>

        <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>

      <div className="login-links">
        <p>
          <Link to="/forgot-password">Forgot Password?</Link>
        </p>
        <p>
          Don't have an account? <Link to="/register">Sign Up</Link>
        </p>
      </div>
    </div>
  );
};

export default LoginForm;
