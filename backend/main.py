from fastapi import FastAPI, UploadFile, File, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from database import engine, Base, get_db
import models

from sqlalchemy import func
from models import Project

from services.csv_processor import process_csv

from services.csv_processor import (
    process_csv,
    save_to_database
)


app = FastAPI(
    title="Public Fund Transparency API",
    description="Backend API for Civic Fund Utilization Dashboard",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Create database tables
Base.metadata.create_all(bind=engine)



@app.get("/")
@app.get("/api")
@app.get("/api/")
def home():

    return {
        "message": "Public Fund Transparency API is running",
        "status": "success"
    }


@app.get("/health")
@app.get("/api/health")
def health():

    return {
        "status": "healthy"
    }


@app.post("/upload")
@app.post("/api/upload")
async def upload_csv(
    file: UploadFile = File(...),
    db=Depends(get_db)
):

    try:

        if not file.filename.lower().endswith(".csv"):

            raise HTTPException(
                status_code=400,
                detail="Please upload a CSV file."
            )

        file_bytes = await file.read()

        if not file_bytes:

            raise HTTPException(
                status_code=400,
                detail="Uploaded file is empty."
            )

        # Process CSV
        result = process_csv(file_bytes)

        df = result["data"]

        # Save valid records
        saved_count = save_to_database(
            df,
            db
        )

        return {
            "message": "CSV uploaded and saved successfully",

            "filename": file.filename,

            "original_records":
                result["original_count"],

            "valid_records":
                result["valid_count"],

            "duplicates_removed":
                result["duplicate_count"],

            "invalid_records":
                result["invalid_count"],

            "database_records":
                saved_count
        }

    except HTTPException:
        raise

    except Exception as e:

        print("UPLOAD ERROR:")
        print(repr(e))

        raise HTTPException(
            status_code=500,
            detail=str(e)
        )
@app.get("/database/count")
@app.get("/api/database/count")
def database_count(db=Depends(get_db)):

    count = db.query(Project).count()

    return {
        "total_projects": count
    }

@app.get("/dashboard")
@app.get("/api/dashboard")
def dashboard(db=Depends(get_db)):

    projects = db.query(Project).all()

    if not projects:

        return {
            "total_allocation": 0,
            "total_expenditure": 0,
            "utilization": 0,
            "total_projects": 0,
            "low_utilization_wards": 0
        }

    total_allocation = sum(
        project.allocated_amount or 0
        for project in projects
    )

    total_expenditure = sum(
        project.spent_amount or 0
        for project in projects
    )

    if total_allocation > 0:

        utilization = (
            total_expenditure
            / total_allocation
        ) * 100

    else:

        utilization = 0

    # Calculate ward utilization
    ward_data = {}

    for project in projects:

        ward = project.ward

        if ward not in ward_data:

            ward_data[ward] = {
                "allocated": 0,
                "spent": 0
            }

        ward_data[ward]["allocated"] += (
            project.allocated_amount or 0
        )

        ward_data[ward]["spent"] += (
            project.spent_amount or 0
        )

    low_utilization_wards = 0

    for ward in ward_data:

        allocated = ward_data[ward]["allocated"]

        spent = ward_data[ward]["spent"]

        if allocated > 0:

            ward_utilization = (
                spent / allocated
            ) * 100

            if ward_utilization < 70:

                low_utilization_wards += 1

    return {

        "total_allocation":
            round(total_allocation, 2),

        "total_expenditure":
            round(total_expenditure, 2),

        "utilization":
            round(utilization, 2),

        "total_projects":
            len(projects),

        "low_utilization_wards":
            low_utilization_wards
    }

@app.get("/wards")
@app.get("/api/wards")
def get_wards(db: Session = Depends(get_db)):

    projects = db.query(Project).all()

    ward_data = {}

    for project in projects:

        ward = project.ward

        if ward not in ward_data:

            ward_data[ward] = {
                "ward": ward,
                "region": project.region,
                "representative": project.representative,
                "allocated": 0,
                "spent": 0
            }

        ward_data[ward]["allocated"] += (
            project.allocated_amount or 0
        )

        ward_data[ward]["spent"] += (
            project.spent_amount or 0
        )

    result = []

    for ward, data in ward_data.items():

        allocated = data["allocated"]
        spent = data["spent"]

        if allocated > 0:

            utilization = (
                spent / allocated
            ) * 100

        else:

            utilization = 0

        if utilization < 50:
            flag = "Critical"

        elif utilization < 70:
            flag = "Low"

        else:
            flag = "Normal"

        result.append({

            "ward": ward,

            "region":
                data["region"],

            "representative":
                data["representative"],

            "allocated":
                round(allocated, 2),

            "spent":
                round(spent, 2),

            "utilization":
                round(utilization, 2),

            "flag":
                flag
        })

    return result

@app.get("/wards/{ward_name}")
@app.get("/api/wards/{ward_name}")
def get_ward_details(
    ward_name: str,
    db: Session = Depends(get_db)
):

    projects = (
        db.query(Project)
        .filter(Project.ward == ward_name)
        .all()
    )

    if not projects:

        raise HTTPException(
            status_code=404,
            detail="Ward not found"
        )

    allocated = sum(
        p.allocated_amount or 0
        for p in projects
    )

    spent = sum(
        p.spent_amount or 0
        for p in projects
    )

    if allocated > 0:

        utilization = (
            spent / allocated
        ) * 100

    else:

        utilization = 0

    if utilization < 50:
        flag = "Critical"

    elif utilization < 70:
        flag = "Low"

    else:
        flag = "Normal"

    project_list = []

    for p in projects:

        project_list.append({

            "project_id":
                p.project_id,

            "project":
                p.project,

            "department":
                p.department,

            "fiscal_year":
                p.fiscal_year,

            "allocated":
                p.allocated_amount,

            "spent":
                p.spent_amount,

            "status":
                p.status,

            "start_date":
                p.start_date,

            "expected_end_date":
                p.expected_end_date
        })

    return {

        "ward":
            projects[0].ward,

        "region":
            projects[0].region,

        "representative":
            projects[0].representative,

        "total_allocation":
            round(allocated, 2),

        "total_expenditure":
            round(spent, 2),

        "utilization":
            round(utilization, 2),

        "flag":
            flag,

        "total_projects":
            len(projects),

        "projects":
            project_list
    }

@app.get("/projects")
@app.get("/api/projects")
def get_projects(
    db: Session = Depends(get_db)
):
    projects = (
        db.query(Project)
        .order_by(Project.project_id)
        .all()
    )

    result = []

    for p in projects:
        result.append({
            "project_id": p.project_id,
            "project": p.project,
            "ward": p.ward,
            "region": p.region,
            "department": p.department,
            "fiscal_year": p.fiscal_year,
            "allocated_amount": p.allocated_amount,
            "spent_amount": p.spent_amount,
            "status": p.status,
            "start_date": p.start_date,
            "expected_end_date": p.expected_end_date
        })

    return {
        "total_projects": len(result),
        "projects": result
    }

@app.get("/flags")
@app.get("/api/flags")
def get_flags(
    db: Session = Depends(get_db)
):
    projects = db.query(Project).all()

    ward_data = {}

    for project in projects:

        ward = project.ward

        if ward not in ward_data:
            ward_data[ward] = {
                "ward": ward,
                "region": project.region,
                "representative": project.representative,
                "allocated": 0,
                "spent": 0
            }

        ward_data[ward]["allocated"] += (
            project.allocated_amount or 0
        )

        ward_data[ward]["spent"] += (
            project.spent_amount or 0
        )

    flags = []

    for ward, data in ward_data.items():

        allocated = data["allocated"]
        spent = data["spent"]

        if allocated == 0:
            utilization = 0
        else:
            utilization = (
                spent / allocated
            ) * 100

        if utilization < 50:
            flag = "Critical"
        elif utilization < 70:
            flag = "Low"
        else:
            flag = "Normal"

        # Only return wards requiring oversight
        if flag != "Normal":

            flags.append({
                "ward": ward,
                "region": data["region"],
                "representative": data["representative"],
                "allocated": round(allocated, 2),
                "spent": round(spent, 2),
                "utilization": round(utilization, 2),
                "flag": flag
            })

    # Critical first, then Low
    flags.sort(
        key=lambda x: x["utilization"]
    )

    return {
        "total_flags": len(flags),
        "flags": flags
    }

@app.get("/export")
@app.get("/api/export")
def export_projects(
    db: Session = Depends(get_db)
):

    projects = (
        db.query(Project)
        .order_by(Project.project_id)
        .all()
    )

    output = io.StringIO()

    writer = csv.writer(output)

    # CSV header
    writer.writerow([
        "project_id",
        "project",
        "ward",
        "region",
        "representative",
        "department",
        "fiscal_year",
        "allocated_amount",
        "spent_amount",
        "status",
        "start_date",
        "expected_end_date"
    ])

    # CSV data
    for p in projects:

        writer.writerow([
            p.project_id,
            p.project,
            p.ward,
            p.region,
            p.representative,
            p.department,
            p.fiscal_year,
            p.allocated_amount,
            p.spent_amount,
            p.status,
            p.start_date,
            p.expected_end_date
        ])

    output.seek(0)

    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={
            "Content-Disposition":
                "attachment; filename=civic_fund_report.csv"
        }
    )