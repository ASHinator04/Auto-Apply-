class ResumeError(Exception):
    def __init__(self, message: str) -> None:
        super().__init__(message)
        self.message = message


class ResumeValidationError(ResumeError):
    pass


class ResumeNotFoundError(ResumeError):
    pass


class PrimaryResumeRequiredError(ResumeError):
    pass
