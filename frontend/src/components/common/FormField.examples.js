// frontend/src/components/common/FormField.examples.js
import React, { useState } from "react";
import { Container, Row, Form, Button, Card } from "react-bootstrap";
import FormField from "./FormField";

/**
 * FormField Usage Examples
 * 
 * This file demonstrates various use cases for the FormField component
 */

export const FormFieldExamples = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    username: '',
    bio: '',
    role: '',
    interests: [],
    newsletter: false,
    experience: 5,
    avatar: null,
    color: '#007bff'
  });
  
  const [errors, setErrors] = useState({});
  
  const handleChange = (field) => (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormData(prev => ({ ...prev, [field]: value }));
  };
  
  const roleOptions = [
    { value: '', label: 'Select a role' },
    { value: 'user', label: 'User' },
    { value: 'author', label: 'Author' },
    { value: 'admin', label: 'Admin' }
  ];
  
  const interestOptions = [
    { value: 'beekeeping', label: 'Beekeeping' },
    { value: 'gardening', label: 'Gardening' },
    { value: 'sustainability', label: 'Sustainability' },
    { value: 'honey', label: 'Honey Production' }
  ];
  
  return (
    <Container className="py-4">
      <h1>FormField Component Examples</h1>
      
      <Card className="mb-4">
        <Card.Header>
          <h3>Basic Input Fields</h3>
        </Card.Header>
        <Card.Body>
          <Form>
            {/* Simple text input */}
            <FormField
              name="username"
              label="Username"
              type="text"
              value={formData.username}
              onChange={handleChange('username')}
              placeholder="Enter your username"
              required
              helpText="Choose a unique username (3-20 characters)"
              minLength={3}
              maxLength={20}
            />
            
            {/* Email input with validation */}
            <FormField
              name="email"
              label="Email Address"
              type="email"
              value={formData.email}
              onChange={handleChange('email')}
              placeholder="user@example.com"
              required
              error={errors.email}
              autoComplete="email"
            />
            
            {/* Password with prepend icon */}
            <FormField
              name="password"
              label="Password"
              type="password"
              value={formData.password}
              onChange={handleChange('password')}
              placeholder="Enter password"
              required
              minLength={8}
              prepend={<i className="bi bi-lock"></i>}
              helpText="Minimum 8 characters"
            />
          </Form>
        </Card.Body>
      </Card>
      
      <Card className="mb-4">
        <Card.Header>
          <h3>Textarea with Character Count</h3>
        </Card.Header>
        <Card.Body>
          <Form>
            <FormField
              name="bio"
              label="Bio"
              type="textarea"
              value={formData.bio}
              onChange={handleChange('bio')}
              placeholder="Tell us about yourself..."
              rows={4}
              showCharCount
              charCountMin={50}
              charCountMax={500}
              helpText="Write a brief bio (50-500 characters)"
            />
          </Form>
        </Card.Body>
      </Card>
      
      <Card className="mb-4">
        <Card.Header>
          <h3>Select and Options</h3>
        </Card.Header>
        <Card.Body>
          <Form>
            {/* Select dropdown */}
            <FormField
              name="role"
              label="User Role"
              type="select"
              value={formData.role}
              onChange={handleChange('role')}
              options={roleOptions}
              required
            />
            
            {/* Checkbox group */}
            <FormField
              name="interests"
              label="Areas of Interest"
              type="checkbox"
              value={formData.interests}
              onChange={(e) => {
                const value = e.target.value;
                setFormData(prev => ({
                  ...prev,
                  interests: prev.interests.includes(value)
                    ? prev.interests.filter(v => v !== value)
                    : [...prev.interests, value]
                }));
              }}
              options={interestOptions}
            />
            
            {/* Single checkbox */}
            <FormField
              name="newsletter"
              type="checkbox"
              value={formData.newsletter}
              onChange={handleChange('newsletter')}
              placeholder="Subscribe to newsletter"
            />
            
            {/* Switch */}
            <FormField
              name="notifications"
              type="switch"
              value={formData.notifications}
              onChange={handleChange('notifications')}
              placeholder="Enable email notifications"
            />
          </Form>
        </Card.Body>
      </Card>
      
      <Card className="mb-4">
        <Card.Header>
          <h3>Special Input Types</h3>
        </Card.Header>
        <Card.Body>
          <Form>
            {/* Number input */}
            <FormField
              name="experience"
              label="Years of Experience"
              type="number"
              value={formData.experience}
              onChange={handleChange('experience')}
              min={0}
              max={50}
              step={1}
            />
            
            {/* Range slider */}
            <FormField
              name="skill"
              label="Skill Level"
              type="range"
              value={formData.skill}
              onChange={handleChange('skill')}
              min={1}
              max={10}
              step={1}
            />
            
            {/* File upload */}
            <FormField
              name="avatar"
              label="Profile Picture"
              type="file"
              onChange={handleChange('avatar')}
              accept="image/*"
              helpText="Upload a profile picture (JPG, PNG, GIF)"
            />
            
            {/* Color picker */}
            <FormField
              name="color"
              label="Favorite Color"
              type="color"
              value={formData.color}
              onChange={handleChange('color')}
            />
          </Form>
        </Card.Body>
      </Card>
      
      <Card className="mb-4">
        <Card.Header>
          <h3>Responsive Layout</h3>
        </Card.Header>
        <Card.Body>
          <Form>
            <Row>
              {/* Using col prop for responsive layout */}
              <FormField
                col={6}
                name="firstName"
                label="First Name"
                value={formData.firstName}
                onChange={handleChange('firstName')}
                required
              />
              
              <FormField
                col={6}
                name="lastName"
                label="Last Name"
                value={formData.lastName}
                onChange={handleChange('lastName')}
                required
              />
              
              <FormField
                col={{ sm: 12, md: 8 }}
                name="address"
                label="Address"
                value={formData.address}
                onChange={handleChange('address')}
              />
              
              <FormField
                col={{ sm: 12, md: 4 }}
                name="zipCode"
                label="ZIP Code"
                value={formData.zipCode}
                onChange={handleChange('zipCode')}
                pattern="[0-9]{5}"
              />
            </Row>
          </Form>
        </Card.Body>
      </Card>
      
      <Card className="mb-4">
        <Card.Header>
          <h3>Validation States</h3>
        </Card.Header>
        <Card.Body>
          <Form>
            {/* Invalid state */}
            <FormField
              name="invalidField"
              label="Invalid Field"
              value=""
              onChange={() => {}}
              isInvalid
              error="This field has an error"
            />
            
            {/* Valid state */}
            <FormField
              name="validField"
              label="Valid Field"
              value="Valid input"
              onChange={() => {}}
              isValid
              validFeedback="Looks good!"
            />
            
            {/* Disabled state */}
            <FormField
              name="disabledField"
              label="Disabled Field"
              value="Cannot edit"
              onChange={() => {}}
              disabled
            />
            
            {/* Read-only state */}
            <FormField
              name="readOnlyField"
              label="Read-only Field"
              value="Read only value"
              onChange={() => {}}
              readOnly
            />
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
};

/**
 * Migration Examples
 * 
 * Shows how to migrate from Form.Group to FormField
 */

// BEFORE - Traditional Form.Group
export const BeforeFormGroup = () => {
  const [email, setEmail] = useState('');
  const [bio, setBio] = useState('');
  
  return (
    <Form>
      {/* Email field - BEFORE */}
      <Form.Group className="mb-3" controlId="email">
        <Form.Label>Email address</Form.Label>
        <Form.Control
          type="email"
          placeholder="Enter email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <Form.Control.Feedback type="invalid">
          Please provide a valid email.
        </Form.Control.Feedback>
      </Form.Group>
      
      {/* Textarea with character count - BEFORE */}
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
    </Form>
  );
};

// AFTER - Using FormField
export const AfterFormField = () => {
  const [email, setEmail] = useState('');
  const [bio, setBio] = useState('');
  
  return (
    <Form>
      {/* Email field - AFTER */}
      <FormField
        name="email"
        label="Email address"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Enter email"
        required
        error={!email ? "Please provide a valid email." : ""}
      />
      
      {/* Textarea with character count - AFTER */}
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
    </Form>
  );
};