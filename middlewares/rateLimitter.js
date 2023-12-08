import rateLimit from 'express-rate-limit';

export const rateLimiterUsingThirdParty = rateLimit({
    windowMs: 60 * 1000, // 1 min
    max: 5,
    message: 'You have exceeded the 100 requests in 24 hrs limit!',
    handler: function (req, res /*, next*/) {

        res.json({ status: "error", message: "You have exceeded the request rate limit of 5 requests per min " })
    },
    standardHeaders: true,
    legacyHeaders: false,
});