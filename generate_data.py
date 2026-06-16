import os
import pypdf
import csv
import json

def parse_screenplay(pdf_path):
    print("Parsing screenplay PDF...")
    reader = pypdf.PdfReader(pdf_path)
    pages_data = []
    for idx, page in enumerate(reader.pages):
        text = page.extract_text()
        pages_data.append({
            "page_num": idx + 1,
            "text": text
        })
    return pages_data

def get_shot_mapping(shot_num):
    # Map shot number to sequence info and script page ranges
    if shot_num == 1:
        return "PART I: Title Sequence", 2, 2
    elif 2 <= shot_num <= 11:
        return "PART I: Views of African Drylands", 2, 2
    elif 12 <= shot_num <= 25:
        return "PART I: Hominid Caves (Night & Day)", 2, 4
    elif 26 <= shot_num <= 48:
        return "PART I: The Watering Hole & Confrontation", 4, 5
    elif 49 <= shot_num <= 61:
        # Monolith Arrival
        return "PART I: Arrival of the Monolith (New Rock)", 5, 6
    elif 62 <= shot_num <= 82:
        # Tool Discovery (including 82 Awakening & Crush)
        return "PART I: The First Lesson & Tool Discovery", 6, 8
    elif shot_num == 83:
        # Views of African Drylands (Reprise)
        return "PART I: Views of African Drylands (Reprise)", 8, 8
    elif 84 <= shot_num <= 103:
        return "PART I: Mastery over Predators", 8, 8
    elif 104 <= shot_num <= 105:
        # Bone Throw (Match Cut preparation)
        return "PART I: Watering Hole Victory & Bone Throw", 9, 9
    elif 106 <= shot_num <= 130:
        # Space flight to SS5 (starts with Match Cut spaceship 106)
        return "PART II: The Blue Danube & Orion Spaceplane", 9, 10
    elif 131 <= shot_num <= 152:
        # Space Station 5 Lobby & Phone
        return "PART II: Space Station 5 Hilton Lobby", 10, 15
    elif 153 <= shot_num <= 174:
        # Floyd's Briefing
        return "PART II: Clavius Base Briefing Room", 15, 18
    elif 175 <= shot_num <= 195:
        # Aries 1B to Moon
        return "PART II: Aries 1B Moon Landing", 18, 20
    elif 196 <= shot_num <= 226:
        # TMA-1 Monolith (starts with Moonbus scene 196)
        return "PART II: TMA-1 excavation site & monolith", 20, 32
    elif 227 <= shot_num <= 266:
        # Discovery Centrifuge
        return "PART III: Discovery Centrifuge & Sleepers", 33, 35
    elif 267 <= shot_num <= 285:
        # HAL Interview
        return "PART III: Interview with HAL 9000 & Chess Game", 35, 37
    elif 286 <= shot_num <= 340:
        # AE-35 Unit Repair
        return "PART III: AE-35 Unit Replacement (EVA)", 37, 43
    elif 341 <= shot_num <= 380:
        # Poole's Death
        return "PART III: Poole's Death & Bowman's Rescue Attempt", 43, 46
    elif 381 <= shot_num <= 450:
        # Deactivating HAL
        return "PART III: HAL's Memory Core Deactivation", 46, 58
    elif 451 <= shot_num <= 643:
        # Stargate & Star Child
        return "PART III: Stargate Sequence & Star Child", 58, 65
    else:
        return "Unknown Sequence", 1, 65


def main():
    pdf_path = r"c:\Users\andyh\OneDrive\桌面\2001_project\2001-a-space-odyssey-1968.pdf"
    csv_path = r"c:\Users\andyh\OneDrive\桌面\2001_project\2001-Scenes.csv"
    output_path = r"c:\Users\andyh\OneDrive\桌面\2001_project\metadata.json"

    # 1. Parse screenplay
    pages = parse_screenplay(pdf_path)

    # 2. Parse scenes CSV
    shots = []
    print("Parsing scenes CSV...")
    with open(csv_path, mode='r', encoding='utf-8') as f:
        # Skip the first line which is Timecode List
        first_line = f.readline()
        reader = csv.DictReader(f)
        for row in reader:
            # Row has columns: Scene Number, Start Frame, Start Timecode, Start Time (seconds), End Frame, End Timecode, End Time (seconds), Length (frames), Length (timecode), Length (seconds)
            scene_num = int(row['Scene Number'])
            start_tc = row['Start Timecode']
            end_tc = row['End Timecode']
            start_sec = float(row['Start Time (seconds)'])
            end_sec = float(row['End Time (seconds)'])
            duration_sec = float(row['Length (seconds)'])
            
            sequence_name, page_start, page_end = get_shot_mapping(scene_num)
            
            # Map images
            images = [
                f"2001-Scene-{scene_num:03d}-01.jpg",
                f"2001-Scene-{scene_num:03d}-02.jpg",
                f"2001-Scene-{scene_num:03d}-03.jpg"
            ]

            shot_data = {
                "shot_num": scene_num,
                "start_timecode": start_tc,
                "end_timecode": end_tc,
                "start_seconds": start_sec,
                "end_seconds": end_sec,
                "duration_seconds": duration_sec,
                "sequence_name": sequence_name,
                "page_start": page_start,
                "page_end": page_end,
                "images": images
            }
            shots.append(shot_data)

    metadata = {
        "screenplay": pages,
        "shots": shots
    }

    # 3. Write metadata.json
    print(f"Writing metadata to {output_path}...")
    with open(output_path, mode='w', encoding='utf-8') as f:
        json.dump(metadata, f, ensure_ascii=False, indent=2)
    print("Data extraction complete!")

if __name__ == "__main__":
    main()
