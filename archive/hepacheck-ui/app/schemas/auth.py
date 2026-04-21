from pydantic import BaseModel, EmailStr, Field


class LoginSchema(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=8)


class PatientRegisterSchema(BaseModel):
    full_name: str = Field(..., min_length=2, max_length=150)
    email: EmailStr
    password: str = Field(..., min_length=8)
    confirm_password: str = Field(..., min_length=8)
    phone: str | None = None
    dob: str | None = None


class DoctorRegisterSchema(BaseModel):
    full_name: str = Field(..., min_length=2, max_length=150)
    email: EmailStr
    phone: str | None = None
    hospital: str | None = None
    license_number: str = Field(..., min_length=3, max_length=100)
    specialization: str | None = None
    password: str = Field(..., min_length=8)
    confirm_password: str = Field(..., min_length=8)