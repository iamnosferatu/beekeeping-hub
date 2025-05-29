// Debug middleware to log auth details
module.exports = (req, res, next) => {
  console.log('\n=== AUTH DEBUG ===');
  console.log('URL:', req.method, req.originalUrl);
  console.log('Headers:', {
    authorization: req.headers.authorization ? req.headers.authorization.substring(0, 50) + '...' : 'none',
    'content-type': req.headers['content-type']
  });
  
  if (req.user) {
    console.log('User:', {
      id: req.user.id,
      username: req.user.username,
      role: req.user.role,
      roleType: typeof req.user.role
    });
  } else {
    console.log('User: not authenticated');
  }
  
  console.log('=================\n');
  next();
};