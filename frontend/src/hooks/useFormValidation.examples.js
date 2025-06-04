/**
 * useFormValidation Hook - Usage Examples
 * This file demonstrates how to refactor existing forms to use the useFormValidation hook
 */

import React, { useContext } from 'react';
import { Form, Button, Alert } from 'react-bootstrap';
import useFormValidation, { commonValidations } from './useFormValidation';
import AuthContext from '../contexts/AuthContext';

// Example 1: Refactored Login Form (Before: LoginPage.js)
export const LoginFormExample = () => {
  const { login } = useContext(AuthContext);
  
  const {
    values,
    errors,
    touched,
    validated,
    isSubmitting,
    handleChange,
    handleSubmit,
    getFieldProps
  } = useFormValidation(
    // Initial values
    {
      email: '',
      password: '',
      rememberMe: false
    },
    // Validation rules
    {
      email: commonValidations.email,
      password: commonValidations.password
    },
    // Submit handler
    async (formData) => {
      await login(formData.email, formData.password, formData.rememberMe);
    }
  );

  return (
    <Form noValidate validated={validated} onSubmit={handleSubmit}>
      <Form.Group className="mb-3">
        <Form.Label>Email</Form.Label>
        <Form.Control
          type="email"
          placeholder="Enter your email"
          {...getFieldProps('email')}
          required
        />
        <Form.Control.Feedback type="invalid">
          {errors.email}
        </Form.Control.Feedback>
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label>Password</Form.Label>
        <Form.Control
          type="password"
          placeholder="Enter your password"
          {...getFieldProps('password')}
          required
        />
        <Form.Control.Feedback type="invalid">
          {errors.password}
        </Form.Control.Feedback>
      </Form.Group>

      <Form.Check
        type="checkbox"
        label="Remember me"
        {...getFieldProps('rememberMe')}
        className="mb-3"
      />

      <Button
        variant="primary"
        type="submit"
        disabled={isSubmitting}
        className="w-100"
      >
        {isSubmitting ? 'Logging in...' : 'Login'}
      </Button>
    </Form>
  );
};

// Example 2: Refactored Register Form (Before: RegisterPage.js)
export const RegisterFormExample = () => {
  const { register } = useContext(AuthContext);
  
  const {
    values,
    errors,
    validated,
    isSubmitting,
    handleSubmit,
    getFieldProps
  } = useFormValidation(
    // Initial values
    {
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
      firstName: '',
      lastName: ''
    },
    // Validation rules
    {
      username: commonValidations.username,
      email: commonValidations.email,
      password: commonValidations.password,
      confirmPassword: commonValidations.confirmPassword,
      firstName: [
        { type: 'required', message: 'First name is required' }
      ],
      lastName: [
        { type: 'required', message: 'Last name is required' }
      ]
    },
    // Submit handler
    async (formData) => {
      const { confirmPassword, ...registrationData } = formData;
      await register(registrationData);
    }
  );

  return (
    <Form noValidate validated={validated} onSubmit={handleSubmit}>
      <Form.Group className="mb-3">
        <Form.Label>Username</Form.Label>
        <Form.Control
          type="text"
          {...getFieldProps('username')}
          required
        />
        <Form.Control.Feedback type="invalid">
          {errors.username}
        </Form.Control.Feedback>
      </Form.Group>

      {/* Other form fields... */}

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Creating Account...' : 'Register'}
      </Button>
    </Form>
  );
};

// Example 3: Refactored Contact Form (Before: ContactPage.js)
export const ContactFormExample = () => {
  const {
    values,
    errors,
    validated,
    isSubmitting,
    handleSubmit,
    getFieldProps,
    resetForm
  } = useFormValidation(
    // Initial values
    {
      name: '',
      email: '',
      subject: '',
      message: ''
    },
    // Validation rules
    {
      name: commonValidations.name,
      email: commonValidations.email,
      subject: commonValidations.subject,
      message: commonValidations.message
    },
    // Submit handler
    async (formData) => {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      if (response.ok) {
        resetForm(); // Reset form on success
      }
    }
  );

  return (
    <Form noValidate validated={validated} onSubmit={handleSubmit}>
      {/* Form fields with getFieldProps */}
    </Form>
  );
};

// Example 4: Custom Validation Example
export const CustomValidationExample = () => {
  const {
    values,
    errors,
    handleSubmit,
    getFieldProps
  } = useFormValidation(
    // Initial values
    { 
      password: '',
      confirmPassword: '',
      agreeToTerms: false
    },
    // Validation rules with custom validators
    {
      password: [
        { type: 'required' },
        { type: 'minLength', min: 8 },
        {
          type: 'custom',
          validator: (value) => {
            // Custom password strength validation
            if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(value)) {
              return 'Password must contain uppercase, lowercase, and numbers';
            }
            return null;
          }
        }
      ],
      confirmPassword: commonValidations.confirmPassword,
      agreeToTerms: [
        {
          type: 'custom',
          validator: (value) => !value ? 'You must agree to the terms' : null
        }
      ]
    },
    async (formData) => {
      // Handle submission
    }
  );

  return (
    <Form onSubmit={handleSubmit}>
      {/* Form implementation */}
    </Form>
  );
};

// Example 5: Using with Dynamic Form Fields
export const DynamicFormExample = () => {
  const {
    values,
    errors,
    setFieldValue,
    setFieldError,
    handleSubmit,
    validateField
  } = useFormValidation(
    { tags: [] },
    {
      tags: [
        {
          type: 'custom',
          validator: (value) => {
            if (!value || value.length === 0) {
              return 'At least one tag is required';
            }
            return null;
          }
        }
      ]
    },
    async (formData) => {
      // Submit handler
    }
  );

  const addTag = (tag) => {
    const newTags = [...values.tags, tag];
    setFieldValue('tags', newTags);
    // Clear error when tags are added
    if (errors.tags) {
      setFieldError('tags', null);
    }
  };

  return (
    <div>
      {/* Dynamic form implementation */}
    </div>
  );
};

// Example 6: Migration Guide for Existing Forms
/*
BEFORE (Old Pattern):
```javascript
const [email, setEmail] = useState('');
const [password, setPassword] = useState('');
const [validated, setValidated] = useState(false);

const handleSubmit = async (e) => {
  e.preventDefault();
  const form = e.currentTarget;
  if (form.checkValidity() === false) {
    e.stopPropagation();
    setValidated(true);
    return;
  }
  // Submit logic
};
```

AFTER (With useFormValidation):
```javascript
const { values, validated, handleSubmit, getFieldProps } = useFormValidation(
  { email: '', password: '' },
  {
    email: commonValidations.email,
    password: commonValidations.password
  },
  async (formData) => {
    // Submit logic
  }
);
```
*/