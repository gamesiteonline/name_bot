import os
import re
import json
import random
from flask import Flask, request, jsonify

app = Flask(__name__)

# --- CONFIGURATION ---
# Now using local JSON files generated previously
MALE_NAMES_FILE = "male_names_200k.json"
FEMALE_NAMES_FILE = "female_names_200k.json"

names_db = {
    "male": [],
    "female": []
}

def load_names():
    """Loads male and female names from local JSON files."""
    global names_db
    
    # Load Male Names
    try:
        if os.path.exists(MALE_NAMES_FILE):
            with open(MALE_NAMES_FILE, "r") as f:
                data = json.load(f)
                names_db["male"] = data.get("male_names", [])
            print(f"✅ Loaded {len(names_db['male'])} male names.")
        else:
            print(f"❌ {MALE_NAMES_FILE} not found!")
    except Exception as e:
        print(f"❌ Error loading male names: {e}")

    # Load Female Names
    try:
        if os.path.exists(FEMALE_NAMES_FILE):
            with open(FEMALE_NAMES_FILE, "r") as f:
                data = json.load(f)
                names_db["female"] = data.get("female_names", [])
            print(f"✅ Loaded {len(names_db['female'])} female names.")
        else:
            print(f"❌ {FEMALE_NAMES_FILE} not found!")
    except Exception as e:
        print(f"❌ Error loading female names: {e}")

# --- FANCY UI ELEMENTS ---
SYMBOLS = "©®™¶∆π■♤♡◇♧$○●☆¤°•"

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
            "temp_first_names": [],
            "temp_second_names": []
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
            session["state"] = "AWAITING_LETTERS"
            reply_text = (
                "♤ *DESTINY CHOSEN: MALE* ♤\n\n"
                f"{get_fancy_divider()}\n\n"
                "◈ Step 2: The Magic Letters ◈\n"
                "◈ Hatua ya 2: Herufi za Bahati ◈\n\n"
                "Please enter the *first letter* of your first name and *second name* separated by a space.\n"
                "Weka herufi ya kwanza ya jina la kwanza na la pili kwa nafasi kati yao.\n\n"
                "✨ *Example: A M*"
            )
        elif message == "2":
            session["gender"] = "female"
            session["state"] = "AWAITING_LETTERS"
            reply_text = (
                "♡ *DESTINY CHOSEN: FEMALE* ♡\n\n"
                f"{get_fancy_divider()}\n\n"
                "◈ Step 2: The Magic Letters ◈\n"
                "◈ Hatua ya 2: Herufi za Bahati ◈\n\n"
                "Please enter the *first letter* of your first name and *second name* separated by a space.\n"
                "Weka herufi ya kwanza ya jina la kwanza na la pili kwa nafasi kati yao.\n\n"
                "✨ *Example: V G*"
            )
        else:
            reply_text = "❌ *Invalid Choice!* Please reply with *1* or *2*."
        return send_reply(reply_text)

    # STEP 2: Letters
    elif state == "AWAITING_LETTERS":
        letters = re.findall(r'[a-zA-Z]', message)
        if len(letters) >= 2:
            l1 = letters[0].upper()
            l2 = letters[1].upper()
            gender = session["gender"]
            
            # Filter from 210,000 unique names
            first_names_match = [n for n in names_db[gender] if n.startswith(l1)]
            second_names_match = [n for n in names_db[gender] if n.startswith(l2)]
            
            # Randomize and limit to 5
            if len(first_names_match) > 5:
                first_names_match = random.sample(first_names_match, 5)
            if len(second_names_match) > 5:
                second_names_match = random.sample(second_names_match, 5)
                
            if not first_names_match or not second_names_match:
                reply_text = f"∆ *No match found for {l1} & {l2}.* Try different letters! ∆"
            else:
                session["temp_first_names"] = first_names_match
                session["temp_second_names"] = second_names_match
                session["state"] = "AWAITING_SELECTION"
                
                first_list_str = ""
                for idx, name in enumerate(first_names_match, start=1):
                    first_list_str += f"{idx}️⃣ ⊛ *{name}*\n"
                    
                emoji_letters = ["🇦", "🇧", "🇨", "🇩", "🇪"]
                second_list_str = ""
                for idx, name in enumerate(second_names_match):
                    second_list_str += f"{emoji_letters[idx]} ⊛ *{name}*\n"
                    
                reply_text = (
                    f"{get_fancy_header('THE REVELATION')}\n\n"
                    "💎 *Your Sacred Options:* 💎\n\n"
                    "■ *First Names:*\n"
                    f"{first_list_str}\n"
                    "■ *Second Names:*\n"
                    f"{second_list_str}\n"
                    f"{get_fancy_divider()}\n"
                    "👉 *COMBINE YOUR DESTINY:*\n"
                    "Reply with a *Number* and *Letter*.\n"
                    "✨ *Example: 1 A*"
                )
        else:
            reply_text = "⚠️ *Format Error!* Please type two letters (e.g., `A B`)."
        return send_reply(reply_text)

    # STEP 3: Selection
    elif state == "AWAITING_SELECTION":
        clean_msg = re.sub(r'[^a-zA-Z0-9]', '', message).upper()
        match = re.match(r'^([1-5])([A-E])$', clean_msg)
        if not match:
            match = re.match(r'^([A-E])([1-5])$', clean_msg)
            if match:
                letter_part, digit_part = match.groups()
            else:
                digit_part, letter_part = None, None
        else:
            digit_part, letter_part = match.groups()
            
        if digit_part and letter_part:
            first_idx = int(digit_part) - 1
            second_idx = ord(letter_part) - ord('A')
            
            first_names = session["temp_first_names"]
            second_names = session["temp_second_names"]
            
            if first_idx < len(first_names) and second_idx < len(second_names):
                chosen_first = first_names[first_idx]
                chosen_second = second_names[second_idx]
                full_name = f"{chosen_first} {chosen_second}"
                
                reply_text = (
                    f"{get_fancy_header('DESTINY COMPLETE')}\n\n"
                    "🏆 *YOUR UNIQUE NAME IS:* 🏆\n\n"
                    f"¶∆π `{full_name}` π∆¶\n\n"
                    f"{get_fancy_divider()}\n"
                    "○ *Tap and hold the name above to copy it!*\n"
                    "● Type *MENU* to start again! ✨"
                )
                session["state"] = "IDLE"
            else:
                reply_text = "❌ *Selection out of range!*"
        else:
            reply_text = "⚠️ *Invalid Format!* Example: `1 A`."
        return send_reply(reply_text)

    return send_reply("")

def send_reply(text):
    if not text:
        return jsonify({"replies": []})
    return jsonify({"replies": [{"message": text}]})

if __name__ == '__main__':
    load_names()
    app.run(host='0.0.0.0', port=5000)
