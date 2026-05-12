export class AppError extends Error {
    public readonly statusCode: number
    public readonly isOpersational: boolean
    public readonly details?: any

    constructor(message:string,statusCode:number, isOperational = true, details?:any){
        super(message)
        this.statusCode = statusCode
        this.isOpersational = isOperational
        this.details = details
        Error.captureStackTrace(this)
    }
}

//Not found error
export class NotFoundError extends AppError {
    constructor(message = "Resources not found"){
      super(message, 404)
    }
}

//validation Error (use for joi/zod/react-hook-form validation errors)
export class validationError extends AppError {
    constructor(message = "Invalid request data", details?:any){
      super(message, 400, true, details)
    }
}

//Authentication error
export class AuthError extends AppError {
    constructor(message = "Unauthorizes"){
      super(message, 401)
    }
}

//Forbidden Error(For Insufficient Permissions)
export class ForbiddenError extends AppError {
    constructor(message = "Forbidden access"){
      super(message, 403)
    }
}
//Database Error(For MongoDB/Postgres Errors)
export class DatabaseError extends AppError {
    constructor(message = "Database error", details?: any){
      super(message, 500, true, details)
    }
}
//Rate limit Error (if user exceeds API limits)
export class RateLimitError extends AppError {
    constructor(message = "Too many requests, please try again later"){
      super(message, 429)
    }
}


