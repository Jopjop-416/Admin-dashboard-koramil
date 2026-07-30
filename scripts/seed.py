import csv
import json
import re
import urllib.request
import urllib.error

SUPABASE_URL = "https://xvswuznozennnlpgbjkb.supabase.co"
SUPABASE_KEY = "sb_publishable_2m_NsWBLuICk-goyPqTkSg_XFyEyRPf"

HEADERS = {
    "apikey": SUPABASE_KEY,
    "Authorization": f"Bearer {SUPABASE_KEY}",
    "Content-Type": "application/json",
    "Prefer": "return=minimal"
}

def insert_to_supabase(table, data):
    url = f"{SUPABASE_URL}/rest/v1/{table}"
    req = urllib.request.Request(url, data=json.dumps(data).encode('utf-8'), headers=HEADERS, method='POST')
    try:
        response = urllib.request.urlopen(req)
        print(f"Inserted {len(data)} rows into {table}")
    except urllib.error.HTTPError as e:
        print(f"Error inserting to {table}: {e.read().decode('utf-8')}")

# 1. Parse Kecamatan from App.tsx
def camel_to_snake(name):
    s1 = re.sub('(.)([A-Z][a-z]+)', r'\1_\2', name)
    return re.sub('([a-z0-9])([A-Z])', r'\1_\2', s1).lower()

def extract_kecamatan():
    with open('c:/file/web-koramil/app/App.tsx', 'r', encoding='utf-8') as f:
        content = f.read()
        
    match = re.search(r'const DEFAULT_KECAMATAN.*?=\s*(\[.*?\]);', content, re.DOTALL)
    if not match:
        print("Could not find DEFAULT_KECAMATAN in App.tsx")
        return []
        
    js_arr = match.group(1)
    # Convert JS object to JSON
    js_arr = re.sub(r'//.*', '', js_arr)
    js_arr = re.sub(r'([a-zA-Z0-9_]+):', r'"\1":', js_arr)
    js_arr = js_arr.replace("'", '"')
    js_arr = re.sub(r',\s*}', '}', js_arr)
    js_arr = re.sub(r',\s*\]', ']', js_arr)
    
    try:
        data = json.loads(js_arr)
        for row in data:
            if "id" in row:
                del row["id"]
            keys = list(row.keys())
            for k in keys:
                if k in ["grid_col", "gridCol", "grid_row", "gridRow", "color"]:
                    del row[k]
                    continue
                if k != camel_to_snake(k):
                    row[camel_to_snake(k)] = row.pop(k)
        return data
    except json.JSONDecodeError as e:
        print("JSON parse error for kecamatan:", e)
        return []

kecamatan_data = extract_kecamatan()
if kecamatan_data:
    insert_to_supabase("kecamatan", kecamatan_data)

# 2. Parse Desa from CSVs
import os
DOWNLOADS = "C:/Users/zaky/Downloads"

desa_dict = {}

def get_desa(name):
    name = re.sub(r'^\d+\.\s*', '', name).strip().upper()
    if name not in desa_dict:
        desa_dict[name] = {"name": name}
    return desa_dict[name]

try:
    with open(f"{DOWNLOADS}/Geografi_dan_Iklim.csv", 'r') as f:
        reader = csv.reader(f)
        for row in reader:
            if len(row) >= 3 and row[0] and row[0][0].isdigit():
                d = get_desa(row[0])
                d["area"] = float(row[1]) if row[1] != '-' else 0
                d["area_percentage"] = float(row[2]) if row[2] != '-' else 0
except Exception as e:
    print("Geo error:", e)

try:
    with open(f"{DOWNLOADS}/Penduduk.csv", 'r') as f:
        reader = csv.reader(f)
        for row in reader:
            if len(row) >= 7 and row[0] and row[0][0].isdigit():
                d = get_desa(row[0])
                d["male"] = int(row[1]) if row[1] != '-' else 0
                d["female"] = int(row[2]) if row[2] != '-' else 0
                d["population"] = int(row[3]) if row[3] != '-' else 0
                d["population_percentage"] = float(row[4]) if row[4] != '-' else 0
                d["density"] = float(row[5]) if row[5] != '-' else 0
                d["sex_ratio"] = float(row[6]) if row[6] != '-' else 0
except Exception as e:
    print("Penduduk error:", e)

try:
    with open(f"{DOWNLOADS}/Pemerintahan.csv", 'r') as f:
        reader = csv.reader(f)
        for row in reader:
            if len(row) >= 3 and row[0] and row[0][0].isdigit():
                d = get_desa(row[0])
                d["hamlets"] = int(row[1]) if row[1] != '-' else 0
                d["rt"] = int(row[2]) if row[2] != '-' else 0
except Exception as e:
    print("Pemerintahan error:", e)

try:
    with open(f"{DOWNLOADS}/Perbankan_Koperasi_Perdagangan.csv", 'r') as f:
        reader = csv.reader(f)
        for row in reader:
            if len(row) >= 3 and row[0] and row[0][0].isdigit():
                d = get_desa(row[0])
                if "Bank Umum" in row[1] or "BPR" in row[2]:
                    continue
                try:
                    d["bank_umum"] = int(row[1]) if row[1] != '-' else 0
                    d["bpr"] = int(row[2]) if row[2] != '-' else 0
                except:
                    pass
except Exception as e:
    print("Perbankan error:", e)

desa_coords = {
    "PENEDAGANDOR": (-8.6650, 116.5700),
    "LABUHAN HAJI": (-8.6605, 116.5806),
    "TEROS": (-8.6700, 116.5600),
    "KERTA SARI": (-8.6500, 116.5850)
}

desa_list = []
for name, data in desa_dict.items():
    if "KECAMATAN" in name: continue
    
    # assign defaults
    coords = desa_coords.get(name, [-8.6605, 116.5806])
    data["lat"] = coords[0]
    data["lng"] = coords[1]
    
    for k in ["area", "area_percentage", "male", "female", "population", "population_percentage", "density", "sex_ratio", "hamlets", "rt", "bank_umum", "bpr"]:
        if k not in data: data[k] = 0
        
    desa_list.append(data)

if desa_list:
    insert_to_supabase("desa", desa_list)

print("Seeding complete.")
