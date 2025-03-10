const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  // sellerRequest: {
  //   type: String,
  //   enum: ['none', 'pending', 'approved', 'rejected'],
  //   default: 'none',
  // },
  role: {
    type: String,
    enum: ['user', 'seller', 'admin'],
    default: 'user',
  },
  
  profileImage: { type: String, default: "" },
  address: { type: String, default: "" },
  phoneNumber: { type: String, default: "" },
  shippingAddress: { type: String, default: "" },
});

module.exports = mongoose.model("User", userSchema);
