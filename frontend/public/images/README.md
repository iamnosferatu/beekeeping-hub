# Public Images Directory

This directory contains static images that are served directly by the React application.

## How to Use Images from This Directory

### 1. In React Components (JSX)

```jsx
// Direct path (recommended)
<img src="/images/your-image.jpg" alt="Description" />

// As background image in inline styles
<div style={{ backgroundImage: 'url(/images/your-image.jpg)' }}>
  Content
</div>

// Using the utility (optional)
import { PUBLIC_IMAGES } from '../utils/publicAssets';
<img src={PUBLIC_IMAGES.heroBackground} alt="Hero" />
```

### 2. In CSS/SCSS Files

```scss
.hero-section {
  background-image: url('/images/hero-bg.jpg');
  background-size: cover;
  background-position: center;
}
```

### 3. Important Notes

- **DO NOT** include `public` in the path. Use `/images/...` not `/public/images/...`
- All paths should start with `/` to ensure they work from any route
- Images in this folder are included in the build and served statically
- For user-uploaded content (like avatars), use the backend upload system instead

## Image Organization

Suggested folder structure:
```
/public/images/
  /heroes/       - Hero section backgrounds
  /icons/        - SVG icons and small graphics
  /patterns/     - Background patterns
  /placeholders/ - Placeholder images
  logo.png       - Main logo
  favicon.ico    - Browser favicon
```

## Image Optimization Tips

1. **Use appropriate formats:**
   - JPG for photographs
   - PNG for images with transparency
   - SVG for icons and simple graphics
   - WebP for modern browsers (with fallbacks)

2. **Optimize file sizes:**
   - Compress images before adding them
   - Use tools like TinyPNG, ImageOptim, or Squoosh
   - Keep hero images under 500KB
   - Keep regular images under 200KB

3. **Use responsive images:**
   ```jsx
   <img 
     src="/images/hero-mobile.jpg"
     srcSet="/images/hero-tablet.jpg 768w, /images/hero-desktop.jpg 1200w"
     alt="Hero"
   />
   ```

## Current Images

- `openart-image_6lnGx5V4_1748601542121_raw.jpg` - Hero background for homepage
- (Add other images as they are added to the directory)