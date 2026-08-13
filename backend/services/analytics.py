import pandas as pd


def calculate_dashboard_kpis(df):

    total_allocation = df["allocated_amount"].sum()

    total_spent = df["spent_amount"].sum()

    if total_allocation > 0:
        utilization = (
            total_spent / total_allocation
        ) * 100
    else:
        utilization = 0

    total_projects = df["project_id"].nunique()

    return {
        "total_allocation": float(total_allocation),
        "total_expenditure": float(total_spent),
        "utilization": round(utilization, 2),
        "total_projects": int(total_projects)
    }
def calculate_ward_utilization(df):

    grouped = (
        df.groupby(
            [
                "ward",
                "region",
                "representative"
            ]
        )
        .agg(
            allocated_amount=(
                "allocated_amount",
                "sum"
            ),
            spent_amount=(
                "spent_amount",
                "sum"
            )
        )
        .reset_index()
    )

    grouped["utilization"] = (
        grouped["spent_amount"]
        / grouped["allocated_amount"]
    ) * 100

    grouped["utilization"] = (
        grouped["utilization"]
        .round(2)
    )

    def flag(value):

        if value < 50:
            return "Critical"

        elif value < 70:
            return "Low"

        return "Normal"

    grouped["flag"] = (
        grouped["utilization"]
        .apply(flag)
    )

    return grouped