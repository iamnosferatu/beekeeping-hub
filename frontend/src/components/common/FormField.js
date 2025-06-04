// frontend/src/components/common/FormField.js
import React from "react";
import { Form, Col, ProgressBar } from "react-bootstrap";
import PropTypes from "prop-types";

/**
 * FormField Component
 *
 * A flexible form field component that reduces Form.Group boilerplate.
 * Supports various input types, validation, character counting, and more.
 *
 * @component
 * @example
 * // Basic text input
 * <FormField
 *   name="email"
 *   label="Email Address"
 *   type="email"
 *   value={email}
 *   onChange={(e) => setEmail(e.target.value)}
 *   required
 * />
 *
 * @example
 * // Textarea with character count
 * <FormField
 *   name="bio"
 *   label="Bio"
 *   type="textarea"
 *   value={bio}
 *   onChange={(e) => setBio(e.target.value)}
 *   maxLength={500}
 *   showCharCount
 *   rows={4}
 * />
 *
 * @example
 * // Select with options
 * <FormField
 *   name="role"
 *   label="Role"
 *   type="select"
 *   value={role}
 *   onChange={(e) => setRole(e.target.value)}
 *   options={[
 *     { value: 'user', label: 'User' },
 *     { value: 'admin', label: 'Admin' }
 *   ]}
 * />
 */
const FormField = ({
  // Field properties
  name,
  label,
  type = "text",
  value,
  onChange,
  onBlur,
  
  // Layout properties
  controlId,
  className,
  groupClassName,
  labelClassName,
  col, // For responsive column sizing
  
  // Validation properties
  required = false,
  isInvalid = false,
  isValid = false,
  error,
  validFeedback,
  validated,
  
  // Field attributes
  placeholder,
  disabled = false,
  readOnly = false,
  autoComplete,
  autoFocus = false,
  
  // Type-specific properties
  options = [], // For select/radio/checkbox
  rows = 3, // For textarea
  min, // For number/date inputs
  max, // For number/date inputs
  step, // For number inputs
  minLength,
  maxLength,
  pattern,
  accept, // For file inputs
  multiple = false, // For file/select inputs
  
  // Character count properties
  showCharCount = false,
  charCountMin,
  charCountMax,
  currentCharCount,
  
  // Additional content
  helpText,
  prepend,
  append,
  children, // For custom content after the field
  
  // Bootstrap variants
  size,
  plaintext = false,
  
  // Custom props to pass to Form.Control
  ...rest
}) => {
  // Calculate character count if not provided
  const charCount = currentCharCount !== undefined ? currentCharCount : 
    (typeof value === 'string' ? value.length : 0);
  
  // Determine character count color
  const getCharCountColor = () => {
    if (!charCountMax) return 'muted';
    const percentage = (charCount / charCountMax) * 100;
    if (percentage >= 100) return 'danger';
    if (percentage >= 90) return 'danger';
    if (percentage >= 75) return 'warning';
    if (charCountMin && charCount < charCountMin) return 'danger';
    return 'muted';
  };
  
  // Determine progress bar variant
  const getProgressVariant = () => {
    if (!charCountMax) return 'info';
    const percentage = (charCount / charCountMax) * 100;
    if (percentage >= 90) return 'danger';
    if (percentage >= 75) return 'warning';
    return 'info';
  };
  
  // Render the input field based on type
  const renderField = () => {
    const commonProps = {
      name,
      value,
      onChange,
      onBlur,
      disabled,
      readOnly,
      required,
      isInvalid: isInvalid || !!error,
      isValid,
      placeholder,
      autoComplete,
      autoFocus,
      size,
      plaintext,
      ...rest
    };
    
    switch (type) {
      case 'textarea':
        return (
          <Form.Control
            as="textarea"
            rows={rows}
            maxLength={maxLength}
            {...commonProps}
          />
        );
        
      case 'select':
        return (
          <Form.Control
            as="select"
            multiple={multiple}
            {...commonProps}
          >
            {placeholder && <option value="">{placeholder}</option>}
            {options.map((option, index) => (
              <option 
                key={option.value || index} 
                value={option.value}
                disabled={option.disabled}
              >
                {option.label}
              </option>
            ))}
          </Form.Control>
        );
        
      case 'checkbox':
      case 'radio':
        return options.length > 0 ? (
          // Multiple checkboxes/radios
          <div>
            {options.map((option, index) => (
              <Form.Check
                key={option.value || index}
                type={type}
                id={`${name}-${option.value}`}
                name={name}
                label={option.label}
                value={option.value}
                checked={type === 'checkbox' ? 
                  (Array.isArray(value) ? value.includes(option.value) : value === option.value) :
                  value === option.value
                }
                onChange={onChange}
                disabled={disabled || option.disabled}
                isInvalid={isInvalid || !!error}
                className={index < options.length - 1 ? 'mb-2' : ''}
              />
            ))}
          </div>
        ) : (
          // Single checkbox
          <Form.Check
            type="checkbox"
            id={controlId || name}
            label={placeholder || label}
            checked={!!value}
            {...commonProps}
          />
        );
        
      case 'switch':
        return (
          <Form.Check
            type="switch"
            id={controlId || name}
            label={placeholder}
            checked={!!value}
            {...commonProps}
          />
        );
        
      case 'file':
        return (
          <Form.Control
            type="file"
            accept={accept}
            multiple={multiple}
            {...commonProps}
          />
        );
        
      case 'range':
        return (
          <>
            <Form.Control
              type="range"
              min={min}
              max={max}
              step={step}
              {...commonProps}
            />
            {value && <div className="text-center mt-1">{value}</div>}
          </>
        );
        
      default:
        // text, email, password, number, date, etc.
        return (
          <Form.Control
            type={type}
            min={min}
            max={max}
            step={step}
            minLength={minLength}
            maxLength={maxLength}
            pattern={pattern}
            {...commonProps}
          />
        );
    }
  };
  
  // Main form group content
  const formGroupContent = (
    <Form.Group 
      className={groupClassName || 'mb-3'} 
      controlId={controlId || name}
    >
      {/* Label */}
      {label && type !== 'checkbox' && type !== 'switch' && (
        <Form.Label className={labelClassName}>
          {label}
          {required && <span className="text-danger ms-1">*</span>}
        </Form.Label>
      )}
      
      {/* Help text above field */}
      {helpText && (
        <Form.Text className="d-block mb-2 text-muted">
          {helpText}
        </Form.Text>
      )}
      
      {/* Input with optional prepend/append */}
      {prepend || append ? (
        <div className="input-group">
          {prepend && <span className="input-group-text">{prepend}</span>}
          {renderField()}
          {append && <span className="input-group-text">{append}</span>}
        </div>
      ) : (
        renderField()
      )}
      
      {/* Character count and validation feedback container */}
      <div className="d-flex justify-content-between align-items-start mt-1">
        {/* Validation feedback */}
        {(error || validFeedback) && (
          <div className="flex-grow-1">
            {error && (
              <Form.Control.Feedback type="invalid" className="d-block">
                {error}
              </Form.Control.Feedback>
            )}
            {validFeedback && isValid && (
              <Form.Control.Feedback type="valid" className="d-block">
                {validFeedback}
              </Form.Control.Feedback>
            )}
          </div>
        )}
        
        {/* Character count */}
        {showCharCount && (type === 'text' || type === 'textarea' || type === 'email') && (
          <small className={`text-${getCharCountColor()} ${error ? 'ms-2' : ''}`}>
            {charCount}
            {charCountMax && `/${charCountMax}`}
            {charCountMin && charCount < charCountMin && 
              ` (min ${charCountMin})`
            }
          </small>
        )}
      </div>
      
      {/* Character count progress bar */}
      {showCharCount && charCountMax && charCount > 0 && (
        <ProgressBar 
          variant={getProgressVariant()} 
          now={(charCount / charCountMax) * 100} 
          className="mt-1" 
          style={{ height: '3px' }}
        />
      )}
      
      {/* Additional custom content */}
      {children}
    </Form.Group>
  );
  
  // Wrap in column if specified
  if (col) {
    const colProps = typeof col === 'object' ? col : { md: col };
    return <Col {...colProps}>{formGroupContent}</Col>;
  }
  
  return formGroupContent;
};

FormField.propTypes = {
  // Required props
  name: PropTypes.string.isRequired,
  value: PropTypes.any,
  onChange: PropTypes.func.isRequired,
  
  // Common props
  label: PropTypes.string,
  type: PropTypes.oneOf([
    'text', 'email', 'password', 'number', 'tel', 'url',
    'date', 'datetime-local', 'time', 'month', 'week',
    'textarea', 'select', 'checkbox', 'radio', 'switch',
    'file', 'color', 'range', 'search'
  ]),
  placeholder: PropTypes.string,
  required: PropTypes.bool,
  disabled: PropTypes.bool,
  readOnly: PropTypes.bool,
  
  // Validation
  isInvalid: PropTypes.bool,
  isValid: PropTypes.bool,
  error: PropTypes.string,
  validFeedback: PropTypes.string,
  
  // Layout
  col: PropTypes.oneOfType([
    PropTypes.number,
    PropTypes.object
  ]),
  className: PropTypes.string,
  groupClassName: PropTypes.string,
  
  // Type-specific
  options: PropTypes.arrayOf(PropTypes.shape({
    value: PropTypes.any.isRequired,
    label: PropTypes.string.isRequired,
    disabled: PropTypes.bool
  })),
  rows: PropTypes.number,
  
  // Character count
  showCharCount: PropTypes.bool,
  charCountMin: PropTypes.number,
  charCountMax: PropTypes.number,
  currentCharCount: PropTypes.number,
  
  // Additional content
  helpText: PropTypes.string,
  prepend: PropTypes.node,
  append: PropTypes.node,
  children: PropTypes.node
};

export default FormField;