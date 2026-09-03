from __future__ import annotations

from pydantic import BaseModel, ConfigDict, Field


class StudentProfileBase(BaseModel):
    full_name: str = Field(min_length=2, max_length=200)
    college: str = Field(min_length=2, max_length=240)
    department: str = Field(min_length=2, max_length=160)
    academic_year: int = Field(ge=1, le=4)
    semester: int = Field(ge=1, le=8)
    section: str | None = Field(default=None, max_length=80)


class StudentProfileCreate(StudentProfileBase):
    pass


class StudentProfileUpdate(StudentProfileBase):
    pass


class StudentProfileRead(StudentProfileBase):
    model_config = ConfigDict(from_attributes=True)

    id: str
    user_id: str


class FeatureAccessRead(BaseModel):
    academic_intelligence: bool
    placement_intelligence: bool
    message: str

