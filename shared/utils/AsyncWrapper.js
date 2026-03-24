const asyncHandler = (fn) => {
    return (req , resp , next) => {
        Promise.resolve(fn(req , resp , next)).catch(next);
    }
}

module.exports = asyncHandler;