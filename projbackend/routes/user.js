const express =  require("express");
const router = express.Router();

const {getUserById, getUser, updateUser, userPurchaseList} = require("../controllers/user")
const {isSignedIn, isAuthenticated, isAdmin} = require("../controllers/auth")

router.param("userId", getUserById);

router.get("/user/:userId", isSignedIn, isAuthenticated, getUser);

// router.get("/users", getAllusers);

router.put("/user/:Id", isSignedIn, isAuthenticated, updateUser);
router.get("/orders/user/:Id", isSignedIn, isAuthenticated, userPurchaseList);


module.exports = router;