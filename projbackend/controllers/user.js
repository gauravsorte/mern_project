
const User = require("../models/user");
const Order = require("../models/order");

exports.getUserById = (req, res, next, id) => {
    User.findById(id).exec((err, foundUser) => {
        if (err || !foundUser) {
            return res.status(400).json({
                error: "No user Was Found In DB"
            });
        };

        req.profile = foundUser;
        next();
    })
}

exports.getUser = (req, res) => {
   
    req.profile.salt = undefined;
    req.profile.createdAt = undefined;
    req.profile.updatedAt = undefined;
    req.profile.encry_password = undefined;
    return res.json(req.profile);
}

// exports.getAllusers = (req, res) => {
//     User.find().exec((err, foundUser) => {
//         if(err || !foundUser) {
//             return res.status(400).json({
//                 error: "No Users Found!!"
//             })
//         }

//         res.json(foundUser);
//     }   )
// }

exports.updateUser = (req, res) => {
    User.findByIdAndUpdate(
        {_id: req.profile._id},
        {$set: req.body},
        {new: true, useFindAndModify: false},
        (err, foundUser) => {
            if(err) {                
                return res.status(400).json({
                    error: "You Are Not Authorised!!"
                })
            }
             
            foundUser.salt = undefined;
            foundUser.encry_password = undefined;
             res.json(foundUser);
        }
    )
}

exports.userPurchaseList = (req, res) => {
    Order.find({user: req.profile._id})
    .populate("user", "_id name")
    .exec((error, order) => {
        if(error){
            return res.status(400).json({
                error: "No Order In This Acount"
            })    
        }

        return res.json(order);
    })
}

exports.pushOrderInPurchaseList = (req, res, next) => {
    let purchases = [];
    req.body.order.products.forEach(product => {
      purchases.push({
        _id: product._id,
        name: product.name,
        description: product.description,
        category: product.category,
        quantity: product.quantity,
        amount: req.body.order.amount,
        transaction_id: req.body.order.transaction_id
      });
    });
  
    //store thi in DB
    User.findOneAndUpdate(
      { _id: req.profile._id },
      { $push: { purchases: purchases } },
      { new: true },
      (err, purchases) => {
        if (err) {
          return res.status(400).json({
            error: "Unable to save purchase list"
          });
        }
        next();
      }
    );
  };
