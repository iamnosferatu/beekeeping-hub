# Error Handling Migration Guide

This guide shows how to migrate from various error handling patterns to the standardized useErrorDisplay hook and ErrorAlert component.

## Benefits of Standardization

1. **Consistent UI**: All errors look and behave the same way
2. **Less Boilerplate**: Reduce 20+ lines to 3-5 lines per error display
3. **Better UX**: Auto-dismiss, retry actions, error history
4. **Type-specific Icons**: Network, permission, validation errors have unique icons
5. **Accessibility**: Proper ARIA labels and keyboard navigation

## Common Migration Patterns

### Basic Error State

**BEFORE:**
```jsx
const [error, setError] = useState(null);
const [showError, setShowError] = useState(false);

// Setting error
setError("Something went wrong");
setShowError(true);

// Clearing error
setError(null);
setShowError(false);

// Display
{showError && error && (
  <Alert variant="danger" onClose={() => setShowError(false)} dismissible>
    {error}
  </Alert>
)}
```

**AFTER:**
```jsx
const { error, setError, clearError } = useErrorDisplay();

// Setting error
setError("Something went wrong");

// Display
<ErrorAlert error={error} onDismiss={clearError} />
```

### API Error Handling

**BEFORE:**
```jsx
const [loading, setLoading] = useState(false);
const [error, setError] = useState(null);

const fetchData = async () => {
  try {
    setLoading(true);
    setError(null);
    const response = await apiService.articles.getAll();
    // handle success
  } catch (err) {
    if (err.response) {
      setError(err.response.data.message || "Failed to fetch data");
    } else if (err.request) {
      setError("Network error. Please check your connection.");
    } else {
      setError("An unexpected error occurred");
    }
  } finally {
    setLoading(false);
  }
};

// Display
{error && (
  <Alert variant="danger" className="mb-3">
    <BsExclamationTriangle className="me-2" />
    {error}
  </Alert>
)}
```

**AFTER:**
```jsx
const { error, setApiError, clearError } = useApiErrorDisplay();
const [loading, setLoading] = useState(false);

const fetchData = async () => {
  try {
    setLoading(true);
    clearError();
    const response = await apiService.articles.getAll();
    // handle success
  } catch (err) {
    setApiError(err);
  } finally {
    setLoading(false);
  }
};

// Display
<ErrorAlert.presets.api 
  errorObject={error} 
  onDismiss={clearError}
  onRetry={fetchData}
/>
```

### Form Validation Errors

**BEFORE:**
```jsx
const [errors, setErrors] = useState({});

const validateForm = () => {
  const newErrors = {};
  
  if (!formData.email) {
    newErrors.email = "Email is required";
  }
  if (!formData.password) {
    newErrors.password = "Password is required";
  }
  
  setErrors(newErrors);
  return Object.keys(newErrors).length === 0;
};

// Display
{Object.keys(errors).length > 0 && (
  <Alert variant="danger">
    <ul className="mb-0">
      {Object.entries(errors).map(([field, error]) => (
        <li key={field}>{error}</li>
      ))}
    </ul>
  </Alert>
)}
```

**AFTER:**
```jsx
const { errors, setError, clearErrors } = useErrorDisplay({ maxErrors: 10 });

const validateForm = () => {
  clearErrors();
  let isValid = true;
  
  if (!formData.email) {
    setError({ 
      message: "Email is required", 
      type: "validation",
      metadata: { field: "email" }
    });
    isValid = false;
  }
  if (!formData.password) {
    setError({ 
      message: "Password is required", 
      type: "validation",
      metadata: { field: "password" }
    });
    isValid = false;
  }
  
  return isValid;
};

// Display
<ErrorAlert.presets.validation 
  errors={errors}
  dismissible={false}
/>
```

### Auto-dismiss Notifications

**BEFORE:**
```jsx
const [notification, setNotification] = useState(null);

const showNotification = (message) => {
  setNotification(message);
  setTimeout(() => {
    setNotification(null);
  }, 5000);
};

// Display
{notification && (
  <Alert variant="danger">
    {notification}
  </Alert>
)}
```

**AFTER:**
```jsx
const { error, setError } = useErrorDisplay({ 
  autoDismissTimeout: 5000 
});

// Display
<ErrorAlert error={error} />
```

### Error with Retry

**BEFORE:**
```jsx
const [error, setError] = useState(null);
const [retrying, setRetrying] = useState(false);

const operation = async () => {
  try {
    setError(null);
    // perform operation
  } catch (err) {
    setError(err.message);
  }
};

const retry = async () => {
  setRetrying(true);
  await operation();
  setRetrying(false);
};

// Display
{error && (
  <Alert variant="danger">
    <div className="d-flex justify-content-between align-items-center">
      <span>{error}</span>
      <Button 
        size="sm" 
        variant="outline-danger" 
        onClick={retry}
        disabled={retrying}
      >
        {retrying ? "Retrying..." : "Try Again"}
      </Button>
    </div>
  </Alert>
)}
```

**AFTER:**
```jsx
const { error, setError, withRetry } = useErrorDisplay();

const operation = withRetry(async () => {
  // perform operation
  // errors are automatically caught and displayed
});

// Display
<ErrorAlert 
  error={error} 
  onRetry={operation}
/>
```

## Advanced Patterns

### Multiple Error Sources

```jsx
const formErrors = useErrorDisplay({ maxErrors: 5 });
const apiErrors = useApiErrorDisplay({ autoDismissTimeout: 10000 });

// Display both
<>
  <ErrorAlert.presets.validation errors={formErrors.errors} />
  <ErrorAlert.presets.api errorObject={apiErrors.error} />
</>
```

### Custom Error Actions

```jsx
const { error, setError, clearError } = useErrorDisplay();

const handleAuthError = () => {
  setError({
    message: "Your session has expired",
    type: "auth",
    actions: [
      {
        label: "Login",
        onClick: () => navigate('/login'),
        variant: "primary"
      },
      {
        label: "Continue as Guest",
        onClick: clearError
      }
    ]
  });
};

// Display
<ErrorAlert errorObject={error} />
```

### Error Tracking

```jsx
const { error, errorHistory, setError } = useErrorDisplay({ 
  trackHistory: true 
});

// Log errors to analytics
useEffect(() => {
  if (error) {
    analytics.track('Error Displayed', {
      message: error.message,
      type: error.type,
      timestamp: error.timestamp
    });
  }
}, [error]);
```

## Component Integration Examples

### Login Page

```jsx
const LoginPage = () => {
  const { error, setError, clearError } = useErrorDisplay();
  const loginMutation = useLogin({
    onError: (err) => {
      if (err.response?.status === 401) {
        setError("Invalid email or password");
      } else {
        setError(err);
      }
    }
  });
  
  return (
    <Form>
      <ErrorAlert 
        error={error} 
        onDismiss={clearError}
      />
      {/* form fields */}
    </Form>
  );
};
```

### Data Table

```jsx
const DataTable = ({ fetchData }) => {
  const { error, setApiError, clearError } = useApiErrorDisplay();
  
  const loadData = async () => {
    try {
      clearError();
      await fetchData();
    } catch (err) {
      setApiError(err);
    }
  };
  
  return (
    <>
      <ErrorAlert.presets.api
        errorObject={error}
        onRetry={loadData}
        onDismiss={clearError}
      />
      {/* table content */}
    </>
  );
};
```

## Migration Checklist

When migrating error handling:

1. [ ] Remove error state variables (`useState`)
2. [ ] Replace with `useErrorDisplay` or `useApiErrorDisplay`
3. [ ] Update error setting logic to use `setError` or `setApiError`
4. [ ] Replace Alert components with `ErrorAlert`
5. [ ] Add retry functionality where appropriate
6. [ ] Consider auto-dismiss for non-critical errors
7. [ ] Use presets for common error types
8. [ ] Add error tracking if needed
9. [ ] Test error scenarios thoroughly
10. [ ] Update error messages to be user-friendly

## Best Practices

1. **Use appropriate presets**: `ErrorAlert.presets.api`, `.validation`, `.network`, etc.
2. **Provide retry actions**: Always offer retry for recoverable errors
3. **Clear previous errors**: Call `clearError()` before new operations
4. **Set meaningful error types**: Helps with icon selection and styling
5. **Track critical errors**: Use `trackHistory` for debugging
6. **Auto-dismiss info messages**: Don't keep non-critical messages forever
7. **Group related errors**: Use `maxErrors` for form validation
8. **Provide context**: Include error codes, timestamps for debugging
9. **Make errors actionable**: Tell users what they can do
10. **Test error states**: Ensure all error paths work correctly

## Tips

- Use `useApiErrorDisplay` for API calls - it handles response parsing
- Set `autoDismissTimeout` for temporary notifications
- Use `withRetry` wrapper for automatic error catching
- Leverage `errorHistory` for debugging production issues
- Create custom presets for your app's specific error types