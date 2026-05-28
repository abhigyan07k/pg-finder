const express = require("express");
const router = express.Router();

const {
  createUser,
  getAllUsers,
  getSingleUser,
  updateUser,
  deleteUser,
  changeUserRole,
} = require("../controllers/userController");

const { verifyToken: auth } = require("../middleware/authMiddleware");
const { allowRoles } = require("../middleware/roleMiddleware");

// ADMIN + SUB_ADMIN can create users from panel
router.post("/create-user", auth, allowRoles("ADMIN", "SUB_ADMIN"), createUser);

// ADMIN + SUB_ADMIN can view all users
// USER can hit this route, but controller will return only own data
router.get(
  "/all-users",
  auth,
  allowRoles("ADMIN", "SUB_ADMIN", "USER"),
  getAllUsers,
);

// ADMIN + SUB_ADMIN can access any user
// USER can access only own profile
router.get(
  "/:id",
  auth,
  allowRoles("ADMIN", "SUB_ADMIN", "USER"),
  getSingleUser,
);

// ADMIN + SUB_ADMIN can update any user
// USER can update only own profile
router.put(
  "/update-user/:id",
  auth,
  allowRoles("ADMIN", "SUB_ADMIN", "USER"),
  updateUser,
);

// ADMIN can delete any user
// USER can delete only own profile
// SUB_ADMIN cannot delete
router.delete(
  "/delete-user/:id",
  auth,
  allowRoles("ADMIN", "SUB_ADMIN", "USER"),
  deleteUser,
);

// Only ADMIN can change user role
router.put("/change-role", auth, allowRoles("ADMIN"), changeUserRole);

module.exports = router;
