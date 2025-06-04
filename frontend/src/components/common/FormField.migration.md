# FormField Migration Guide

This guide shows how to migrate from traditional Form.Group to the new FormField component.

## Benefits of FormField

1. **Less Boilerplate**: Reduces 10-15 lines of code to 3-5 lines per field
2. **Consistent Styling**: Ensures all forms follow the same patterns
3. **Built-in Features**: Character counting, validation feedback, responsive layouts
4. **Type Safety**: PropTypes validation prevents common mistakes
5. **Accessibility**: Proper ARIA labels and form associations

## Basic Migration Examples

### Simple Text Input

**BEFORE:**
```jsx
<Form.Group className="mb-3" controlId="username">
  <Form.Label>Username</Form.Label>
  <Form.Control
    type="text"
    placeholder="Enter username"
    value={username}
    onChange={(e) => setUsername(e.target.value)}
    required
  />
  <Form.Control.Feedback type="invalid">
    Please provide a username.
  </Form.Control.Feedback>
</Form.Group>
```

**AFTER:**
```jsx
<FormField
  name="username"
  label="Username"
  type="text"
  value={username}
  onChange={(e) => setUsername(e.target.value)}
  placeholder="Enter username"
  required
  error={errors.username}
/>
```

### Textarea with Character Count

**BEFORE:**
```jsx
<Form.Group className="mb-3">
  <Form.Label>Bio</Form.Label>
  <Form.Text className="d-block mb-2 text-muted">
    Tell us about yourself (50-500 characters)
  </Form.Text>
  <Form.Control
    as="textarea"
    rows={4}
    value={bio}
    onChange={(e) => setBio(e.target.value)}
    maxLength={500}
  />
  <div className="d-flex justify-content-between mt-1">
    <Form.Control.Feedback type="invalid">
      Bio must be at least 50 characters
    </Form.Control.Feedback>
    <small className={bio.length < 50 ? 'text-danger' : 'text-muted'}>
      {bio.length}/500
    </small>
  </div>
</Form.Group>
```

**AFTER:**
```jsx
<FormField
  name="bio"
  label="Bio"
  type="textarea"
  value={bio}
  onChange={(e) => setBio(e.target.value)}
  rows={4}
  showCharCount
  charCountMin={50}
  charCountMax={500}
  helpText="Tell us about yourself (50-500 characters)"
  error={bio.length < 50 ? "Bio must be at least 50 characters" : ""}
/>
```

### Select Dropdown

**BEFORE:**
```jsx
<Form.Group className="mb-3" controlId="role">
  <Form.Label>Role</Form.Label>
  <Form.Select
    value={role}
    onChange={(e) => setRole(e.target.value)}
    required
  >
    <option value="">Select a role</option>
    <option value="user">User</option>
    <option value="author">Author</option>
    <option value="admin">Admin</option>
  </Form.Select>
  <Form.Control.Feedback type="invalid">
    Please select a role.
  </Form.Control.Feedback>
</Form.Group>
```

**AFTER:**
```jsx
<FormField
  name="role"
  label="Role"
  type="select"
  value={role}
  onChange={(e) => setRole(e.target.value)}
  required
  options={[
    { value: '', label: 'Select a role' },
    { value: 'user', label: 'User' },
    { value: 'author', label: 'Author' },
    { value: 'admin', label: 'Admin' }
  ]}
  error={errors.role}
/>
```

### Responsive Layout

**BEFORE:**
```jsx
<Row>
  <Col md={6}>
    <Form.Group className="mb-3">
      <Form.Label>First Name</Form.Label>
      <Form.Control
        type="text"
        value={firstName}
        onChange={(e) => setFirstName(e.target.value)}
        required
      />
    </Form.Group>
  </Col>
  <Col md={6}>
    <Form.Group className="mb-3">
      <Form.Label>Last Name</Form.Label>
      <Form.Control
        type="text"
        value={lastName}
        onChange={(e) => setLastName(e.target.value)}
        required
      />
    </Form.Group>
  </Col>
</Row>
```

**AFTER:**
```jsx
<Row>
  <FormField
    col={6}
    name="firstName"
    label="First Name"
    value={firstName}
    onChange={(e) => setFirstName(e.target.value)}
    required
  />
  
  <FormField
    col={6}
    name="lastName"
    label="Last Name"
    value={lastName}
    onChange={(e) => setLastName(e.target.value)}
    required
  />
</Row>
```

## Advanced Features

### Input with Prepend/Append

```jsx
<FormField
  name="price"
  label="Price"
  type="number"
  value={price}
  onChange={handleChange}
  prepend="$"
  append=".00"
  min={0}
  step={0.01}
/>
```

### Checkbox Group

```jsx
<FormField
  name="interests"
  label="Areas of Interest"
  type="checkbox"
  value={selectedInterests}
  onChange={(e) => {
    const value = e.target.value;
    setSelectedInterests(prev =>
      prev.includes(value)
        ? prev.filter(v => v !== value)
        : [...prev, value]
    );
  }}
  options={[
    { value: 'beekeeping', label: 'Beekeeping' },
    { value: 'gardening', label: 'Gardening' },
    { value: 'sustainability', label: 'Sustainability' }
  ]}
/>
```

### File Upload

```jsx
<FormField
  name="avatar"
  label="Profile Picture"
  type="file"
  onChange={(e) => setAvatar(e.target.files[0])}
  accept="image/*"
  helpText="Max file size: 5MB"
/>
```

### Custom Validation

```jsx
<FormField
  name="email"
  label="Email"
  type="email"
  value={email}
  onChange={(e) => setEmail(e.target.value)}
  isInvalid={!isValidEmail(email) && email.length > 0}
  error={!isValidEmail(email) && email.length > 0 ? "Invalid email format" : ""}
  isValid={isValidEmail(email)}
  validFeedback="Email looks good!"
/>
```

## Migration Checklist

When migrating a form:

1. [ ] Import FormField component
2. [ ] Replace Form.Group with FormField
3. [ ] Move Form.Label content to `label` prop
4. [ ] Move Form.Control props to FormField props
5. [ ] Convert Form.Control.Feedback to `error` prop
6. [ ] Add `name` prop (required)
7. [ ] For select/radio/checkbox, convert options to array format
8. [ ] For responsive layouts, use `col` prop instead of wrapping Col
9. [ ] Add character counting if needed with `showCharCount`
10. [ ] Add help text with `helpText` prop

## Common Patterns

### Form with useFormValidation Hook

```jsx
import { useFormValidation } from '../hooks';
import FormField from '../components/common/FormField';

const MyForm = () => {
  const { values, errors, touched, getFieldProps } = useFormValidation(
    { email: '', password: '' },
    {
      email: { required: true, email: true },
      password: { required: true, minLength: 8 }
    }
  );
  
  return (
    <Form>
      <FormField
        label="Email"
        type="email"
        {...getFieldProps('email')}
        error={touched.email && errors.email}
      />
      
      <FormField
        label="Password"
        type="password"
        {...getFieldProps('password')}
        error={touched.password && errors.password}
      />
    </Form>
  );
};
```

### Dynamic Form Fields

```jsx
const fields = [
  { name: 'title', label: 'Title', type: 'text', required: true },
  { name: 'description', label: 'Description', type: 'textarea', rows: 4 },
  { name: 'category', label: 'Category', type: 'select', options: categories }
];

return (
  <Form>
    {fields.map(field => (
      <FormField
        key={field.name}
        {...field}
        value={formData[field.name]}
        onChange={(e) => updateField(field.name, e.target.value)}
        error={errors[field.name]}
      />
    ))}
  </Form>
);
```

## Tips

1. **Always provide a `name` prop** - It's required and used for form control IDs
2. **Use `col` prop for responsive layouts** - Cleaner than wrapping in Col components
3. **Leverage `showCharCount` for textareas** - Users appreciate knowing limits
4. **Use `helpText` for instructions** - Better than separate Form.Text components
5. **Pass validation state consistently** - Use `error` for messages, `isInvalid` for styling
6. **Consider using with useFormValidation hook** - They work great together