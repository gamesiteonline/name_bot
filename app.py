import os
import re
import json
import random
from flask import Flask, request, jsonify

app = Flask(__name__)

# --- CONFIGURATION ---
MALE_NAMES_FILE = "male_names_200k.json"
FEMALE_NAMES_FILE = "female_names_200k.json"

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
            "temp_names": []
        }
        
        reply_text = (
            f"{get_fancy_header('NAME DESTINY BOT')}\n\n"
            "Welcome to the most advanced Name Oracle! 🔮\n"
            "Karibu kwenye mtabiri mkuu wa majina! 🌌\n\n"
            f"{get_fancy_divider()}\n\n"
            "◈ Step 1: Reveal Your Path ◈\n"
            "◈ Hatua ya 1: Chagua Jinsia ◈\n\n"
            "1️⃣ ♤ *MALE* (Kiume)\n"
            "2️⃣ ♡ *FEMALE* (Kike)\n\n"
            "👉 *Reply with 1 or 2 to begin...*"
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
            session["state"] = "AWAITING_LETTER"
            reply_text = (
                "♤ *DESTINY CHOSEN: MALE* ♤\n\n"
                f"{get_fancy_divider()}\n\n"
                "◈ Step 2: The Magic Letter ◈\n"
                "◈ Hatua ya 2: Herufi ya Bahati ◈\n\n"
                "Please enter the *first letter* of the name you seek.\n"
                "Weka herufi ya kwanza ya jina unalotafuta.\n\n"
                "✨ *Example: F*"
            )
        elif message == "2":
            session["gender"] = "female"
            session["state"] = "AWAITING_LETTER"
            reply_text = (
                "♡ *DESTINY CHOSEN: FEMALE* ♡\n\n"
                f"{get_fancy_divider()}\n\n"
                "◈ Step 2: The Magic Letter ◈\n"
                "◈ Hatua ya 2: Herufi ya Bahati ◈\n\n"
                "Please enter the *first letter* of the name you seek.\n"
                "Weka herufi ya kwanza ya jina unalotafuta.\n\n"
                "✨ *Example: G*"
            )
        else:
            reply_text = "❌ *Invalid Choice!* Please reply with *1* or *2*."
        return send_reply(reply_text)

    # STEP 2: Single Letter
    elif state == "AWAITING_LETTER":
        letters = re.findall(r'[a-zA-Z]', message)
        if len(letters) >= 1:
            l1 = letters[0].upper()
            gender = session["gender"]
            
            # Filter from 210,000 unique names
            matches = [n for n in names_db[gender] if n.startswith(l1)]
            
            # Randomize and limit to 10 for more options
            if len(matches) > 10:
                matches = random.sample(matches, 10)
                
            if not matches:
                reply_text = f"∆ *No match found for '{l1}'.* Try a different letter! ∆"
            else:
                session["temp_names"] = matches
                session["state"] = "AWAITING_SELECTION"
                
                list_str = ""
                for idx, name in enumerate(matches, start=1):
                    # Use fancy numbers
                    list_str += f"{idx}️⃣ ⊛ *{name}*\n"
                    
                reply_text = (
                    f"{get_fancy_header('THE REVELATION')}\n\n"
                    "💎 *Your Sacred Options:* 💎\n\n"
                    f"{list_str}\n"
                    f"{get_fancy_divider()}\n"
                    "👉 *CLAIM YOUR DESTINY:*\n"
                    "Reply with the *Number* of your favorite name.\n"
                    "✨ *Example: 1*"
                )
        else:
            reply_text = "⚠️ *Format Error!* Please type one letter (e.g., `F`)."
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
                    f"{get_fancy_divider()}\n"
                    "○ *Tap and hold the name above to copy it!*\n"
                    "● Type *MENU* to start again! ✨"
                )
                session["state"] = "IDLE"
            else:
                reply_text = f"❌ *Invalid Selection!* Please pick a number between 1 and {len(names)}."
        else:
            reply_text = "⚠️ *Invalid Format!* Please reply with a number (e.g., `1`)."
        return send_reply(reply_text)

    return send_reply("")

def send_reply(text):
    if not text:
        return jsonify({"replies": []})
    return jsonify({"replies": [{"message": text}]})

if __name__ == '__main__':
    load_names()
    app.run(host='0.0.0.0', port=5000)
