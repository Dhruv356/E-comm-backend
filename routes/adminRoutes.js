const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const authMiddleware = require('../middleware/authMiddleware'); // ✅ Fixed import

const router = express.Router();

// ✅ Admin Login
router.post('/admin-login', (req, res) => {
  const { email, password } = req.body;

  if (
    email === process.env.ADMIN_EMAIL &&
    password === process.env.ADMIN_PASSWORD
  ) {
    const token = jwt.sign(
      { role: 'admin' }, // No userId needed if it's just a static admin
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.json({
      token,
      role: 'admin',
    });
  }

  res.status(401).json({ message: 'Invalid admin credentials' });
});
router.get('/users', authMiddleware, async (req, res) => {
    if (req.role !== 'admin') return res.status(403).json({ message: 'Access denied.' });
  
    try {
      const users = await User.find({});
      res.json(users);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch users.', error: error.message });
    }
  });
  router.delete('/users/:id', authMiddleware, async (req, res) => {
    if (req.role !== 'admin') return res.status(403).json({ message: 'Access denied.' });
  
    try {
      await User.findByIdAndDelete(req.params.id);
      res.json({ message: 'User deleted successfully.' });
    } catch (error) {
      res.status(500).json({ message: 'Failed to delete user.', error: error.message });
    }
  });
  
  router.patch('/users/:id', authMiddleware, async (req, res) => {
    if (req.role !== 'admin') return res.status(403).json({ message: 'Access denied.' });
  
    const { role } = req.body;
    if (!['user', 'seller', 'admin'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role.' });
    }
  
    try {
      const user = await User.findByIdAndUpdate(
        req.params.id,
        { role },
        { new: true }
      );
      res.json({ message: 'User role updated successfully.', user });
    } catch (error) {
      res.status(500).json({ message: 'Failed to update user role.', error: error.message });
    }
  });
  

// // ✅ Get Pending Seller Requests
// router.get('/seller-requests', authMiddleware, async (req, res) => {
//   try {
//     if (req.role !== 'admin') {
//       return res.status(403).json({ message: 'Access denied.' });
//     }

//     const requests = await User.find({ sellerRequest: 'pending' });
//     res.json(requests);
//   } catch (error) {
//     res.status(500).json({ message: 'Server error', error: error.message });
//   }
// });

// // ✅ Approve or Reject Seller Requests
// router.patch('/seller-requests/:id', authMiddleware, async (req, res) => {
//   try {
//     if (req.role !== 'admin') {
//       return res.status(403).json({ message: 'Access denied.' });
//     }

//     const { status } = req.body; // 'approved' or 'rejected'
//     const user = await User.findById(req.params.id);

//     if (!user) {
//       return res.status(404).json({ message: 'User not found.' });
//     }

//     if (status === 'approved') {
//       user.role = 'seller';
//       user.sellerRequest = 'approved';
//     } else if (status === 'rejected') {
//       user.sellerRequest = 'rejected';
//     } else {
//       return res.status(400).json({ message: 'Invalid status. Use "approved" or "rejected".' });
//     }

//     await user.save();
//     res.json({ message: `Seller request ${status}.` });

//   } catch (error) {
//     res.status(500).json({ message: 'Server error', error: error.message });
//   }
// });

module.exports = router;
