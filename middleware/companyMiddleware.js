import User from "../models/userModel.js";

const Companymid = async (req, res, next) => {
    try {
        // Ensure that the user is authenticated
        if (!req.user || !req.userId) {
            return res.status(401).json({ message: 'Unauthorized: Please log in to access this resource.' });
        }
        // Fetch the user by userId
        const user = await User.findById(req.userId);
        // Check if the user exists
        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }
        // Log the role_id to verify its value
        console.log('Name:', user.name);
        console.log('Id:', user._id);
        console.log('User role_id:', user.role);
        // Check if the user's role_id is 3 (buyer role)
        if (user.role !== 2) {
            return res.status(403).json({ message: 'You are not authorized to access this resource.' });
        }


    //         const isCompany =
    //   user.role === 2 || (user.role === 3 && user.switchedRole === 2);
 
    // if (!isCompany) {
    //   return res.status(403).json({ message: 'You are not authorized to access this resource.' });
    // }
        next();
    } catch (error) {
        // Handle any unexpected errors
        return res.status(500).json({ message: 'An error occurred while verifying your role.', error: error.message });
    }
};

export default Companymid;