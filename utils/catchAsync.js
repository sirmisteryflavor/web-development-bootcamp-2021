// Wrapper function that returns the results if all goes well
// and catches an error and passes it to next if there is an error.
// Designed for catching async error.
module.exports = func => {
    return (req, res, next) => {
        func(req, res, next).catch(next);
    }
}