import pdfplumber
import json

def camel_case(text):
    """Convert text to camelCase"""
    words = text.split()
    if not words:
        return ""
    # First word lowercase, rest capitalized
    return words[0].lower() + ''.join(word.capitalize() for word in words[1:])

def extract_tables_from_pdf(pdf_path, table_desc_map):
    extracted_tables = []

    with pdfplumber.open(pdf_path) as pdf:
        for page_num, page in enumerate(pdf.pages):
            tables = page.extract_tables()

            if not tables:
                continue

            for table_num, table in enumerate(tables, start=1):
                if len(table) <= 3:
                    continue

                station_names = []
                for row_idx in range(3, len(table)):
                    station_name = str(table[row_idx][0]).strip() if table[row_idx][0] else ""
                    if station_name:
                        station_names.append(station_name)

                trips = []
                for col_idx in range(2, len(table[0])):
                    trip_data = {"trip": col_idx - 1}

                    for row_idx in range(3, len(table)):
                        station_key = camel_case(station_names[row_idx - 3])
                        time_value = str(table[row_idx][col_idx]).strip() if table[row_idx][col_idx] else ""
                        trip_data[station_key] = time_value

                    trips.append(trip_data)

                if trips:
                    extracted_tables.append({
                        "page": page_num + 1,
                        "table_number": table_num,
                        "table_desc": table_desc_map.get(table_num, ""),
                        "data": trips
                    })

    return extracted_tables


weekday_desc_map = {
    1: "batucaves-pulausebang-weekday",
    2: "pulausebang-batucaves-weekday"
}

weekend_desc_map = {
    1: "batucaves-pulausebang-weekend",
    2: "pulausebang-batucaves-wekend"
}

all_tables = []
all_tables.extend(extract_tables_from_pdf('data-weekday.pdf', weekday_desc_map))
all_tables.extend(extract_tables_from_pdf('data-weekend.pdf', weekend_desc_map))

json_output = json.dumps(all_tables, indent=2, ensure_ascii=False)

with open('extracted_data.json', 'w', encoding='utf-8') as f:
    f.write(json_output)

print("✓ Table extracted successfully!")
print(f"✓ {len(all_tables)} table(s) found and saved to 'extracted_data.json'")
print(f"✓ Total rows extracted: {sum(len(t['data']) for t in all_tables)}")
print("\nFirst table preview:")
if all_tables:
    preview = all_tables[0]['data'][:3]
    print(json.dumps(preview, indent=2, ensure_ascii=False))
