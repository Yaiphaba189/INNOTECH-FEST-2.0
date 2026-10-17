from fastapi import HTTPException, status
from fastapi.responses import JSONResponse
from fastapi.requests import Request


class AppError(HTTPException):
    def __init__(self, status_code: int, code: str, msg: str):
        super().__init__(status_code=status_code, detail={"code": code, "msg": msg})
        self.code = code
        self.msg = msg


class ImageCorruptedError(AppError):
    def __init__(self, msg: str = "Supplied image cannot be decoded. Prompt user to re-capture photo."):
        super().__init__(status.HTTP_400_BAD_REQUEST, "IMAGE_CORRUPTED", msg)


class TokenExpiredError(AppError):
    def __init__(self, msg: str = "JWT expired or invalid. Please re-authenticate."):
        super().__init__(status.HTTP_401_UNAUTHORIZED, "TOKEN_EXPIRED", msg)


class InvalidCredentialsError(AppError):
    def __init__(self, msg: str = "Invalid phone number or password."):
        super().__init__(status.HTTP_401_UNAUTHORIZED, "INVALID_CREDENTIALS", msg)


class RoleNotAuthorizedError(AppError):
    def __init__(self, msg: str = "User role is not authorized to access this resource."):
        super().__init__(status.HTTP_403_FORBIDDEN, "ROLE_NOT_AUTHORIZED", msg)


class EntityNotFoundError(AppError):
    def __init__(self, entity_name: str = "Resource", msg: str = None):
        super().__init__(
            status.HTTP_404_NOT_FOUND,
            "ENTITY_NOT_FOUND",
            msg or f"{entity_name} could not be found."
        )


class PhoneAlreadyRegisteredError(AppError):
    def __init__(self, msg: str = "This phone number is already registered."):
        super().__init__(status.HTTP_409_CONFLICT, "PHONE_ALREADY_REGISTERED", msg)


class LotAlreadyCommittedError(AppError):
    def __init__(self, msg: str = "Lot has already been committed to another order."):
        super().__init__(status.HTTP_409_CONFLICT, "LOT_ALREADY_COMMITTED", msg)


class CapacityThresholdFailError(AppError):
    def __init__(self, msg: str = "Aggregate load is under the 75% vehicle payload fill threshold."):
        super().__init__(422, "CAPACITY_THRESHOLD_FAIL", msg)


class SolverTimeoutError(AppError):
    def __init__(self, msg: str = "OR-Tools solver exceeded time limit. Falling back to heuristic."):
        super().__init__(status.HTTP_503_SERVICE_UNAVAILABLE, "SOLVER_TIMEOUT", msg)


async def app_error_handler(request: Request, exc: AppError):
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": {"code": exc.code, "msg": exc.msg}}
    )


async def http_exception_handler(request: Request, exc: HTTPException):
    if isinstance(exc.detail, dict) and "code" in exc.detail:
        detail = exc.detail
    else:
        detail = {"code": "HTTP_ERROR", "msg": str(exc.detail)}
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": detail}
    )
