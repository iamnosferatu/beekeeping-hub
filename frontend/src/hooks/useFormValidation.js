import { useState, useCallback, useRef } from 'react';

/**
 * Custom hook for form validation
 * Eliminates duplicate validation logic across forms
 * 
 * @param {Object} initialValues - Initial form values
 * @param {Object} validationRules - Validation rules for each field
 * @param {Function} onSubmit - Callback function when form is valid
 * @returns {Object} Form state and handlers
 */
const useFormValidation = (initialValues = {}, validationRules = {}, onSubmit) => {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validated, setValidated] = useState(false);
  const formRef = useRef(null);

  /**
   * Common validation functions
   */
  const validators = {
    required: (value, message = 'This field is required') => {
      if (!value || (typeof value === 'string' && !value.trim())) {
        return message;
      }
      return null;
    },

    email: (value, message = 'Please enter a valid email address') => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) {
        return message;
      }
      return null;
    },

    minLength: (min) => (value, message) => {
      const defaultMessage = `Must be at least ${min} characters`;
      if (!value || value.length < min) {
        return message || defaultMessage;
      }
      return null;
    },

    maxLength: (max) => (value, message) => {
      const defaultMessage = `Must be no more than ${max} characters`;
      if (value && value.length > max) {
        return message || defaultMessage;
      }
      return null;
    },

    match: (fieldName) => (value, message) => {
      const defaultMessage = `Must match ${fieldName}`;
      if (value !== values[fieldName]) {
        return message || defaultMessage;
      }
      return null;
    },

    pattern: (regex) => (value, message = 'Invalid format') => {
      if (!regex.test(value)) {
        return message;
      }
      return null;
    },

    custom: (validatorFn) => validatorFn
  };

  /**
   * Validate a single field
   */
  const validateField = useCallback((name, value) => {
    const rules = validationRules[name];
    if (!rules) return null;

    const fieldErrors = [];
    
    for (const rule of rules) {
      let error = null;

      if (typeof rule === 'function') {
        // Custom validation function
        error = rule(value, values);
      } else if (typeof rule === 'object') {
        // Rule object with type and options
        const { type, ...options } = rule;
        
        switch (type) {
          case 'required':
            error = validators.required(value, options.message);
            break;
          case 'email':
            error = validators.email(value, options.message);
            break;
          case 'minLength':
            error = validators.minLength(options.min)(value, options.message);
            break;
          case 'maxLength':
            error = validators.maxLength(options.max)(value, options.message);
            break;
          case 'match':
            error = validators.match(options.field)(value, options.message);
            break;
          case 'pattern':
            error = validators.pattern(options.regex)(value, options.message);
            break;
          case 'custom':
            error = validators.custom(options.validator)(value, values);
            break;
          default:
            console.warn(`Unknown validation type: ${type}`);
        }
      }

      if (error) {
        fieldErrors.push(error);
      }
    }

    return fieldErrors.length > 0 ? fieldErrors[0] : null;
  }, [validationRules, values]);

  /**
   * Validate all fields
   */
  const validateForm = useCallback(() => {
    const newErrors = {};
    let isValid = true;

    Object.keys(validationRules).forEach(fieldName => {
      const error = validateField(fieldName, values[fieldName]);
      if (error) {
        newErrors[fieldName] = error;
        isValid = false;
      }
    });

    setErrors(newErrors);
    return isValid;
  }, [validationRules, values, validateField]);

  /**
   * Handle input change
   */
  const handleChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    const fieldValue = type === 'checkbox' ? checked : value;
    
    setValues(prev => ({ ...prev, [name]: fieldValue }));
    
    // Clear error when user types
    if (errors[name] && touched[name]) {
      const error = validateField(name, fieldValue);
      setErrors(prev => ({ ...prev, [name]: error }));
    }
  }, [errors, touched, validateField]);

  /**
   * Handle input blur
   */
  const handleBlur = useCallback((e) => {
    const { name, value } = e.target;
    
    setTouched(prev => ({ ...prev, [name]: true }));
    
    // Validate field on blur
    const error = validateField(name, value);
    setErrors(prev => ({ ...prev, [name]: error }));
  }, [validateField]);

  /**
   * Handle form submission
   */
  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    setValidated(true);
    
    // Mark all fields as touched
    const allTouched = {};
    Object.keys(values).forEach(key => {
      allTouched[key] = true;
    });
    setTouched(allTouched);
    
    // Validate form
    const isValid = validateForm();
    
    // Check HTML5 validation if form ref is provided
    if (formRef.current && !formRef.current.checkValidity()) {
      return;
    }
    
    if (!isValid) {
      return;
    }
    
    // Submit form
    setIsSubmitting(true);
    try {
      await onSubmit(values);
    } finally {
      setIsSubmitting(false);
    }
  }, [values, validateForm, onSubmit]);

  /**
   * Reset form to initial state
   */
  const resetForm = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
    setValidated(false);
    setIsSubmitting(false);
  }, [initialValues]);

  /**
   * Set field value programmatically
   */
  const setFieldValue = useCallback((name, value) => {
    setValues(prev => ({ ...prev, [name]: value }));
  }, []);

  /**
   * Set field error programmatically
   */
  const setFieldError = useCallback((name, error) => {
    setErrors(prev => ({ ...prev, [name]: error }));
    setTouched(prev => ({ ...prev, [name]: true }));
  }, []);

  /**
   * Get field props for form controls
   */
  const getFieldProps = useCallback((name) => ({
    name,
    value: values[name] || '',
    onChange: handleChange,
    onBlur: handleBlur,
    isInvalid: touched[name] && !!errors[name],
    isValid: touched[name] && !errors[name] && values[name]
  }), [values, errors, touched, handleChange, handleBlur]);

  return {
    // Form state
    values,
    errors,
    touched,
    isSubmitting,
    validated,
    
    // Form handlers
    handleChange,
    handleBlur,
    handleSubmit,
    resetForm,
    
    // Helper functions
    setFieldValue,
    setFieldError,
    getFieldProps,
    setValues,
    validateForm,
    validateField,
    
    // Form ref
    formRef
  };
};

/**
 * Predefined validation rules for common fields
 */
export const commonValidations = {
  email: [
    { type: 'required', message: 'Email is required' },
    { type: 'email', message: 'Please enter a valid email address' }
  ],
  
  password: [
    { type: 'required', message: 'Password is required' },
    { type: 'minLength', min: 6, message: 'Password must be at least 6 characters' }
  ],
  
  confirmPassword: [
    { type: 'required', message: 'Please confirm your password' },
    { type: 'match', field: 'password', message: 'Passwords do not match' }
  ],
  
  username: [
    { type: 'required', message: 'Username is required' },
    { type: 'minLength', min: 3, message: 'Username must be at least 3 characters' },
    { type: 'pattern', regex: /^[a-zA-Z0-9_-]+$/, message: 'Username can only contain letters, numbers, hyphens and underscores' }
  ],
  
  name: [
    { type: 'required', message: 'Name is required' },
    { type: 'minLength', min: 2, message: 'Name must be at least 2 characters' }
  ],
  
  subject: [
    { type: 'required', message: 'Subject is required' },
    { type: 'minLength', min: 5, message: 'Subject must be at least 5 characters' }
  ],
  
  message: [
    { type: 'required', message: 'Message is required' },
    { type: 'minLength', min: 10, message: 'Message must be at least 10 characters' }
  ]
};

export default useFormValidation;