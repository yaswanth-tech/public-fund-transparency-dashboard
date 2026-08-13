REQUIRED_COLUMNS = [
    "project_id",
    "ward",
    "region",
    "representative",
    "department",
    "fiscal_year",
    "project",
    "allocated_amount",
    "spent_amount",
    "status",
    "start_date",
    "expected_end_date",
    "description"
]

VALID_STATUSES = {
    "Planned",
    "In Progress",
    "Completed",
    "Delayed"
}


def validate_columns(df):

    missing = [
        column
        for column in REQUIRED_COLUMNS
        if column not in df.columns
    ]

    return missing


def validate_statuses(df):

    return df[
        ~df["status"].isin(VALID_STATUSES)
    ]


def validate_amounts(df):

    return df[
        (df["allocated_amount"].isna()) |
        (df["spent_amount"].isna()) |
        (df["allocated_amount"] < 0) |
        (df["spent_amount"] < 0)
    ]