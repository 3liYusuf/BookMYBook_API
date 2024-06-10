import jwt from 'jsonwebtoken';

export const verifyToken = (req, res, next) => {
    const authHeader = req.headers;
    console.log('authHeader:',authHeader);

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({
            success: false,
            message: "Unauthorized: No token provided",
        });
    }

    const token = authHeader.split(' ')[1]; // Split the header and extract the token
    console.log("Token:", token); // Log the extracted token

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        return res.status(403).json({
            success: false,
            message: "Forbidden: Invalid token",
        });
    }
};
