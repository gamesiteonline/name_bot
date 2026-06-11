import os
import re
import json
import random
import difflib
from flask import Flask, request, jsonify

app = Flask(__name__)

# --- CONFIGURATION ---
MALE_NAMES_FILE = "male_names_200k.json"
FEMALE_NAMES_FILE = "female_names_200k.json"
WATERMARK = "©FAHAD TECH ® - NAME BOT™"
CHANNEL_URL = "https://whatsapp.com/channel/0029Vb7jjtZLo4hnTZRnqW1n"

names_db = {
    "male": [],
    "female": []
}

def load_names():
    """Loads male and female names from local JSON files."""
    global names_db
    try:
        if os.path.exists(MALE_NAMES_FILE):
            with open(MALE_NAMES_FILE, "r") as f:
                data = json.load(f)
                names_db["male"] = data.get("male_names", [])
            print(f"✅ Loaded {len(names_db['male'])} male names.")
        if os.path.exists(FEMALE_NAMES_FILE):
            with open(FEMALE_NAMES_FILE, "r") as f:
                data = json.load(f)
                names_db["female"] = data.get("female_names", [])
            print(f"✅ Loaded {len(names_db['female'])} female names.")
    except Exception as e:
        print(f"❌ Error loading names: {e}")

# --- FANCY UI ELEMENTS ---
def get_fancy_header(title):
    return f"☆¤°•.¸¸.•°°•.¸¸.•°¤☆\n✨ {title} ✨\n☆¤°•.¸¸.•°°•.¸¸.•°¤☆"

def get_fancy_divider():
    return "┈┉┅━❀🍃🌸🍃❀━┅┉┈"

def get_watermark():
    return f"\n\n{get_fancy_divider()}\n{WATERMARK}"

# Keeps track of each user's progress
user_sessions = {}

@app.route('/webhook', methods=['POST'])
def webhook():
    global user_sessions
    data = request.json or {}
    query_data = data.get('query', {})
    
    if isinstance(query_data, dict):
        message = query_data.get('message', '').strip()
        sender = query_data.get('sender', '').strip()
    else:
        message = data.get('message', '').strip() or data.get('query', '').strip()
        sender = data.get('sender', '').strip()

    if not message or not sender:
        return jsonify({"replies": []})

    msg_upper = message.upper()
    
    # Triggers
    is_trigger = any(x in msg_upper for x in [
        "WANT TO CHAKE MY NAME", "WANT TO CHECK MY NAME", 
        "NIANGALIE JINA", "TAFUTA JINA", "NATAKA JINA",
        "MENU", "CANCEL", "RESET", "START"
    ])

    if is_trigger:
        user_sessions[sender] = {
            "state": "AWAITING_GENDER",
            "gender": None,
            "search_query": None,
            "temp_names": []
        }
        
        reply_text = (
            f"{get_fancy_header('NAME DESTINY BOT')}\n\n"
            "Welcome to the most advanced Name Oracle! 🔮\n"
            "Karibu kwenye mtabiri mkuu wa majina! 🌌\n\n"
            "◈ Step 1: Reveal Your Path ◈\n"
            "◈ Hatua ya 1: Chagua Jinsia ◈\n\n"
            "1️⃣ ♤ *MALE* (Kiume)\n"
            "2️⃣ ♡ *FEMALE* (Kike)\n"
            f"{get_watermark()}"
        )
        return send_reply(reply_text)

    if sender not in user_sessions:
        return send_reply("")

    session = user_sessions[sender]
    state = session.get("state")

    # STEP 1: Gender
    if state == "AWAITING_GENDER":
        if message == "1":
            session["gender"] = "male"
            session["state"] = "AWAITING_SEARCH"
            reply_text = (
                "♤ *DESTINY CHOSEN: MALE* ♤\n\n"
                "◈ Step 2: Search Your Name ◈\n"
                "◈ Hatua ya 2: Tafuta Jina Lako ◈\n\n"
                "👉 Enter at least *3 letters* or a *Full Name*.\n"
                "👉 Weka herufi *3 za kwanza* au *Jina Kamili*.\n\n"
                "✨ *Example: FAH or FAHAD*"
                f"{get_watermark()}"
            )
        elif message == "2":
            session["gender"] = "female"
            session["state"] = "AWAITING_SEARCH"
            reply_text = (
                "♡ *DESTINY CHOSEN: FEMALE* ♡\n\n"
                "◈ Step 2: Search Your Name ◈\n"
                "◈ Hatua ya 2: Tafuta Jina Lako ◈\n\n"
                "👉 Enter at least *3 letters* or a *Full Name*.\n"
                "👉 Weka herufi *3 za kwanza* au *Jina Kamili*.\n\n"
                "✨ *Example: GIA or GIANNA*"
                f"{get_watermark()}"
            )
        else:
            reply_text = f"❌ *Invalid Choice!* Reply with *1* or *2*.{get_watermark()}"
        return send_reply(reply_text)

    # STEP 2: Advanced Search
    elif state == "AWAITING_SEARCH" or (state == "AWAITING_SELECTION" and msg_upper == "MORE"):
        if state == "AWAITING_SEARCH":
            search_input = message.strip()
            if len(search_input) < 3:
                return send_reply(f"⚠️ *Search too short!* Please enter at least 3 letters.{get_watermark()}")
            session["search_query"] = search_input
        
        search_query = session["search_query"]
        gender = session["gender"]
        all_names = names_db[gender]
        
        # 1. Exact or Prefix Match
        matches = [n for n in all_names if n.upper().startswith(search_query.upper())]
        
        # 2. Fuzzy Match if no direct matches
        if not matches:
            matches = difflib.get_close_matches(search_query.capitalize(), all_names, n=30, cutoff=0.6)
            is_fuzzy = True
        else:
            is_fuzzy = False
        
        if not matches:
            reply_text = f"∆ *No match found for '{search_query}'.* Try different letters! ∆{get_watermark()}"
            session["state"] = "AWAITING_SEARCH"
        else:
            # Pick 30
            sample_size = min(30, len(matches))
            if is_fuzzy:
                selected_names = matches[:sample_size]
            else:
                selected_names = random.sample(matches, sample_size)
                
            session["temp_names"] = selected_names
            session["state"] = "AWAITING_SELECTION"
            
            list_str = ""
            for idx, name in enumerate(selected_names, start=1):
                list_str += f"{idx}. *{name}*\n"
                
            header_text = "Close matches found:" if is_fuzzy else f"Top 30 Names for '{search_query}':"
            reply_text = (
                f"{get_fancy_header('THE REVELATION')}\n\n"
                f"💎 *{header_text}* 💎\n\n"
                f"{list_str}\n\n"
                "👉 *HOW TO CHOOSE:*\n"
                "1️⃣ Reply with the *Number* of your favorite name.\n"
                "2️⃣ Reply with *MORE* to see different names!\n"
                f"{get_watermark()}"
            )
        return send_reply(reply_text)

    # STEP 3: Selection
    elif state == "AWAITING_SELECTION":
        digit_match = re.search(r'\d+', message)
        if digit_match:
            idx = int(digit_match.group()) - 1
            names = session["temp_names"]
            
            if 0 <= idx < len(names):
                chosen_name = names[idx]
                reply_text = (
                    f"{get_fancy_header('DESTINY COMPLETE')}\n\n"
                    "🏆 *YOUR UNIQUE NAME IS:* 🏆\n\n"
                    f"¶∆π `{chosen_name}` π∆¶\n\n"
                    "○ *Tap and hold the name above to copy it!*\n"
                    "● Type *MENU* to start again! ✨\n\n"
                    "🔗 *VIEW CHANNEL:*\n"
                    f"{CHANNEL_URL}"
                    f"{get_watermark()}"
                )
                session["state"] = "IDLE"
            else:
                reply_text = f"❌ *Invalid Selection!* Pick a number between 1 and {len(names)}.{get_watermark()}"
        else:
            reply_text = f"⚠️ *Invalid Format!* Reply with a *Number* or type *MORE*.{get_watermark()}"
        return send_reply(reply_text)

    return send_reply("")

def send_reply(text):
    if not text:
        return jsonify({"replies": []})
    return jsonify({"replies": [{"message": text}]})

if __name__ == '__main__':
    load_names()
    app.run(host='0.0.0.0', port=5000)
