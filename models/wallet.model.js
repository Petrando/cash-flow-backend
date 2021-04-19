const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const { ObjectId } = mongoose.Schema;
 
const WalletSchema = new mongoose.Schema(
  {    
    name: String,
    icon: {
      data: Buffer,
      contentType: String
    },
    balance: Number
  },
  { timestamps: true }
);
 
//product: { type: ObjectId, ref: "Product" },
module.exports = mongoose.model("Wallet", WalletSchema);