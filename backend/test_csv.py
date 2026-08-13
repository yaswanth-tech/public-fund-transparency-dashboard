from services.csv_processor import process_csv

result = process_csv(
    "data/civic_fund_mvp_dataset.csv"
)

print("Original records:", result["original_count"])
print("Valid records:", result["valid_count"])
print("Duplicates:", result["duplicate_count"])
print("Invalid:", result["invalid_count"])