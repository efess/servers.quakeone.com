exports.userNotFound = function () {
    return {
        code: 3,
        message: "User not found"
    };
}
exports.userNotSpecified = function () {
    return {
        code: 4,
        message: "User not specified"
    };
}
exports.invalidName = function () {
    return {
        code: 5,
        message: "Invalid name specified"
    };
}
exports.invalidNameLength = function () {
    return {
        code: 5,
        message: "Name must be between 1 and 20 characters"
    };
}
exports.dataOperationError = function () {
    return {
        code: 45,
        message: "An error occurrd processing data"
    };
}
exports.insufficientUserLevelError = function () {
    return {
        code: 89,
        message: "User doesn't have the required access for this action"
    };
}