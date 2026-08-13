import pandas as pd
from io import BytesIO

from services.validation import (
    validate_columns,
    validate_statuses,
    validate_amounts
)


def process_csv(file_bytes):

    # Read CSV directly from uploaded bytes
    df = pd.read_csv(BytesIO(file_bytes))

    # Check required columns
    missing_columns = validate_columns(df)

    if missing_columns:
        raise ValueError(
            f"Missing columns: {missing_columns}"
        )

    original_count = len(df)

    # Remove duplicate records
    duplicate_count = int(df.duplicated().sum())

    df = df.drop_duplicates().copy()

    # Make sure financial columns are numeric
    df["allocated_amount"] = pd.to_numeric(
        df["allocated_amount"],
        errors="coerce"
    )

    df["spent_amount"] = pd.to_numeric(
        df["spent_amount"],
        errors="coerce"
    )

    # Find invalid numeric values
    invalid_amount_rows = validate_amounts(df)

    # Find invalid statuses
    invalid_status_rows = validate_statuses(df)

    invalid_indexes = set(
        invalid_amount_rows.index
    ) | set(
        invalid_status_rows.index
    )

    invalid_count = len(invalid_indexes)

    # Remove invalid rows
    if invalid_indexes:
        df = df.drop(index=list(invalid_indexes))

    return {
        "data": df,
        "original_count": int(original_count),
        "valid_count": int(len(df)),
        "duplicate_count": duplicate_count,
        "invalid_count": int(invalid_count)
    }
def save_to_database(df, db):
    from models import Project

    records = df.to_dict(orient="records")

    for record in records:

        project = Project(
            project_id=int(record["project_id"]),
            ward=record["ward"],
            region=record["region"],
            representative=record["representative"],
            department=record["department"],
            fiscal_year=record["fiscal_year"],
            project=record["project"],
            allocated_amount=float(
                record["allocated_amount"]
            ),
            spent_amount=float(
                record["spent_amount"]
            ),
            status=record["status"],
            start_date=record["start_date"],
            expected_end_date=record["expected_end_date"],
            description=record["description"]
        )

        db.add(project)

    db.commit()

    return len(records)