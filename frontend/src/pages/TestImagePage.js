import React from 'react';
import { Container, Card } from 'react-bootstrap';
import { ASSETS_URL } from '../config';

const TestImagePage = () => {
  const testImagePath = '/uploads/articles/article-1748603461778-700896463.jpg';
  const fullImageUrl = `${ASSETS_URL}${testImagePath}`;

  return (
    <Container className="py-5">
      <h1>Test Image Display</h1>
      
      <Card className="mb-4">
        <Card.Header>Image URLs</Card.Header>
        <Card.Body>
          <p><strong>Test Image Path:</strong> {testImagePath}</p>
          <p><strong>ASSETS_URL:</strong> {ASSETS_URL}</p>
          <p><strong>Full Image URL:</strong> {fullImageUrl}</p>
        </Card.Body>
      </Card>

      <Card className="mb-4">
        <Card.Header>Direct Image Display</Card.Header>
        <Card.Body>
          <img 
            src={fullImageUrl} 
            alt="Test uploaded image" 
            style={{ maxWidth: '100%', height: 'auto' }}
            onError={(e) => console.error('Image load error:', e)}
            onLoad={() => console.log('Image loaded successfully')}
          />
        </Card.Body>
      </Card>

      <Card>
        <Card.Header>Image in Markdown</Card.Header>
        <Card.Body>
          <div dangerouslySetInnerHTML={{ 
            __html: `<img src="${fullImageUrl}" alt="Test image in HTML" style="max-width: 100%;" />` 
          }} />
        </Card.Body>
      </Card>
    </Container>
  );
};

export default TestImagePage;