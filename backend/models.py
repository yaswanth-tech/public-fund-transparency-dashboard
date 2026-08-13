from sqlalchemy import Column, Integer, String, Float
from database import Base


class Ward(Base):
    __tablename__ = "wards"

    id = Column(Integer, primary_key=True, index=True)
    ward_name = Column(String, nullable=False)
    region = Column(String)
    representative = Column(String)


class Department(Base):
    __tablename__ = "departments"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)


class Project(Base):
    __tablename__ = "projects"

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, unique=True, index=True)
    ward = Column(String)
    region = Column(String)
    representative = Column(String)
    department = Column(String)
    fiscal_year = Column(String)
    project = Column(String)
    allocated_amount = Column(Float)
    spent_amount = Column(Float)
    status = Column(String)
    start_date = Column(String)
    expected_end_date = Column(String)
    description = Column(String)