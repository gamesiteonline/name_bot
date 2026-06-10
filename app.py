import os
import re
import requests
from flask import Flask, request, jsonify

app = Flask(__name__)

# --- CONFIGURATION ---
# The server will automatically transform these standard GitHub links to their "raw" counterparts
MALE_NAMES_URL = "https://github.com/gamesiteonline/Telebot.games/blob/main/male_names"
FEMALE_NAMES_URL = "https://github.com/gamesiteonline/Telebot.games/blob/main/female_names"

# Default fallback names in case of internet outage or GitHub access issues
FALLBACK_MALE = [
    "Aaron", "Ally", "Abdul", "Amos", "Brian", "Bakari", "Benjamin", "Charles", 
    "David", "Daniel", "Emmanuel", "Eric", "Frank", "George", "Hussein", "Isaac", 
    "John", "Joseph", "James", "Kevin", "Lucas", "Michael", "Moses", "Nelson", 
    "Oscar", "Peter", "Richard", "Samuel", "Thomas", "Victor", "William", "Yusuf", "Zacharia"
]

FALLBACK_FEMALE = [
    "Amina", "Asha", "Alice", "Beatrice", "Brenda", "Catherine", "Diana", "Dorice", 
    "Elizabeth", "Esther", "Fiona", "Grace", "Gloria", "Halima", "Irene", "Jackline", 
    "Joyce", "Karen", "Lucy", "Mary", "Maryam", "Nancy", "Neema", "Olive", "Patricia", 
    "Rachel", "Rose", "Sarah", "Sophia", "Theresa", "Valerie", "Winfrida", "Yvonne", "Zainab"
]

names_db = {
    "male": [],
    "female": []
}

def get_raw_url(url):
    """Converts a standard browser GitHub URL to a raw URL if needed."""
    if "github.com" in url and "/blob/" in url:
        return url.replace("github.com", "raw.githubusercontent.com").replace("/blob/", "/")
    return url

def load_names():
    """Fetches male and female names lists from your GitHub repository."""
    global names_db
    
    # Fetch Male Names
    try:
        raw_male_url = get_raw_url(MALE_NAMES_URL)
        r_male = requests.get(raw_male_url, timeout=10)
        if r_male.status_code == 200:
            names = [line.strip().capitalize() for line in r_male.text.split('\n') if line.strip()]
            names_db["male"] = sorted(list(set(names)))
            print(f"Loaded {len(names_db['male'])} male names from GitHub.")
        else:
            names_db["male"] = FALLBACK_MALE
            print("Could not fetch male names from GitHub. Loaded fallback lists.")
    except Exception as e:
        names_db["male"] = FALLBACK_MALE
        print(f"Error fetching male names: {e}. Loaded fallback lists.")

    # Fetch Female Names
    try:
        raw_female_url = get_raw_url(FEMALE_NAMES_URL)
        r_female = requests.get(raw_female_url, timeout=10)
        if r_female.status_code == 200:
            names = [line.strip().capitalize() for line in r_female.text.split('\n') if line.strip()]
            names_db["female"] = sorted(list(set(names)))
            print(f"Loaded {len(names_db['female'])} female names from GitHub.")
        else:
            names_db["female"] = FALLBACK_FEMALE
            print("Could not fetch female names from GitHub. Loaded fallback lists.")
    except Exception as e:
        names_db["female"] = FALLBACK_FEMALE
        print(f"Error fetching female names: {e}. Loaded fallback lists.")

# Keeps track of each user's progress through the name selection game
user_sessions = {}

@app.route('/webhook', methods=['POST'])
def webhook():
    global user_sessions
    
    # Process incoming data from AutoResponder for WhatsApp
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
    
    # Triggers that initialize or restart the game
    is_trigger = ("WANT TO CHAKE MY NAME" in msg_upper or 
                  "WANT TO CHECK MY NAME" in msg_upper or
                  "NIANGALIE JINA" in msg_upper or 
                  "TAFUTA JINA" in msg_upper or 
                  "NATAKA JINA" in msg_upper)

    # Force reset if user types MENU or CANCEL
    if msg_upper in ["MENU", "CANCEL", "RESET"]:
        is_trigger = True

    if is_trigger:
        user_sessions[sender] = {
            "state": "AWAITING_GENDER",
            "gender": None,
            "temp_first_names": [],
            "temp_second_names": []
        }
        reply_text = (
            "🎮 *GAME: NAME SEARCH / CHEZO LA MAJINA* 🎮\n"
            "Welcome! Let's find your lucky name combo.\n"
            "Karibu! Wacha tutafute jina lako la bahati.\n\n"
            "Step 1: Choose Gender / Chagua Jinsia:\n"
            "👉 Type *1* for *MALE* (Kiume)\n"
            "👉 Type *2* for *FEMALE* (Kike)"
        )
        return send_reply(reply_text)

    # If the user doesn't have an ongoing game session, we ignore other text
    if sender not in user_sessions:
        return send_reply("")

    session = user_sessions[sender]
    state = session.get("state")

    # STEP 1: Process gender selection
    if state == "AWAITING_GENDER":
        if message == "1":
            session["gender"] = "male"
            session["state"] = "AWAITING_LETTERS"
            reply_text = (
                "🧑 Chosen: *MALE* (Kiume)\n\n"
                "Step 2: Enter starting letters / Weka herufi za mwanzo.\n"
                "👉 Please reply with the *first letter of your first name* and the *first letter of your second name* separated by a space.\n\n"
                "*(Mfano: Kama majina yako yanapaswa kuanza na A na M, andika: `A M`)*"
            )
        elif message == "2":
            session["gender"] = "female"
            session["state"] = "AWAITING_LETTERS"
            reply_text = (
                "👩 Chosen: *FEMALE* (Kike)\n\n"
                "Step 2: Enter starting letters / Weka herufi za mwanzo.\n"
                "👉 Please reply with the *first letter of your first name* and the *first letter of your second name* separated by a space.\n\n"
                "*(Mfano: Kama majina yako yanapaswa kuanza na A na M, andika: `A M`)*"
            )
        else:
            reply_text = (
                "⚠️ Invalid Choice! / Chaguo Sio Sahihi!\n\n"
                "Please reply with:\n"
                "👉 *1* for MALE (Kiume)\n"
                "👉 *2* for FEMALE (Kike)"
            )
        return send_reply(reply_text)

    # STEP 2: Process starting letters
    elif state == "AWAITING_LETTERS":
        letters = re.findall(r'[a-zA-Z]', message)
        if len(letters) >= 2:
            l1 = letters[0].upper()
            l2 = letters[1].upper()
            gender = session["gender"]
            
            # Filter from lists
            first_names_match = [n for n in names_db[gender] if n.startswith(l1)]
            second_names_match = [n for n in names_db[gender] if n.startswith(l2)]
            
            # Keep unique and limit to a maximum of 5 to avoid long messages
            first_names_match = sorted(list(set(first_names_match)))[:5]
            second_names_match = sorted(list(set(second_names_match)))[:5]
            
            if not first_names_match or not second_names_match:
                reply_text = (
                    f"❌ Sorry, we couldn't find matching names starting with *'{l1}'* and *'{l2}'*.\n"
                    f"Samahani, hatujapata majina yanayoanza na *'{l1}'* na *'{l2}'* kwenye kanzidata yetu.\n\n"
                    "👉 Try another pair of letters (e.g., `S M`):"
                )
            else:
                session["temp_first_names"] = first_names_match
                session["temp_second_names"] = second_names_match
                session["state"] = "AWAITING_SELECTION"
                
                # Build list presentation
                first_list_str = ""
                for idx, name in enumerate(first_names_match, start=1):
                    first_list_str += f"{idx}️⃣ {name}\n"
                    
                emoji_letters = ["🇦", "🇧", "🇨", "🇩", "🇪"]
                second_list_str = ""
                for idx, name in enumerate(second_names_match):
                    second_list_str += f"{emoji_letters[idx]} {name}\n"
                    
                reply_text = (
                    "🎉 *MATCHING NAMES FOUND! / MAJINA YAMEPATIKANA!* 🎉\n\n"
                    "👇 Select your combinations / Chagua mchanganyiko wako:\n\n"
                    "*First Names (Majina ya Kwanza):*\n"
                    f"{first_list_str}\n"
                    "*Second Names (Majina ya Pili):*\n"
                    f"{second_list_str}\n"
                    "👉 *HOW TO SELECT / JINSI YA KUCHAGUA:*\n"
                    "Reply with your favorite combination using its *Number* and *Letter*.\n"
                    "Jibu kwa kuandika *Namba* na *Herufi* za chaguo lako.\n\n"
                    "*(Mfano: Type `1 A` to select option 1 and A)*"
                )
        else:
            reply_text = (
                "⚠️ Format Error! / Hitilafu ya Muundo!\n\n"
                "Please type exactly two letters separated by a space.\n"
                "Tafadhali andika herufi mbili zilizotengwa kwa nafasi.\n"
                "👉 Mfano: `A M` au `K S`"
            )
        return send_reply(reply_text)

    # STEP 3: Process combination choice
    elif state == "AWAITING_SELECTION":
        clean_msg = re.sub(r'[^a-zA-Z0-9]', '', message).upper()
        
        # Match combos like '1A', '2B', or 'A2'
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
                
                # We enclose the name in backticks.
                # In WhatsApp, backticks format the text into a monospaced block,
                # which allows users on mobile to easily select and copy just the name with one tap.
                reply_text = (
                    "🏆 *YOUR GENERATED NAME / JINA LAKO:* 🏆\n\n"
                    f"`{full_name}`\n\n"
                    "👆 *Tap and hold the boxed name above to copy it instantly!* (Gusa na ushikilie jina lililopo kwenye box hapo juu kulicopy!)\n\n"
                    "🔄 Type *MENU* to search again! / Andika *MENU* kuanza upya!"
                )
                session["state"] = "IDLE"
            else:
                reply_text = (
                    "⚠️ Selection out of list limits! / Chaguo lako halimo kwenye orodha!\n"
                    "Please pick a valid number and letter from the lists above.\n"
                    "👉 Mfano: `1 A`"
                )
        else:
            reply_text = (
                "⚠️ Invalid Format! / Muundo Sio Sahihi!\n"
                "Please select a valid combination of number and letter from the lists above.\n"
                "👉 Mfano: `1 A` au `2 B`"
            )
        return send_reply(reply_text)

    return send_reply("")

def send_reply(text):
    if not text:
        return jsonify({"replies": []})
    return jsonify({
        "replies": [{"message": text}],
        "reply": text # Dual compatibility for older AutoResponder JSON structures
    })

if __name__ == '__main__':
    load_names()
    # Runs server on port 5000
    app.run(host='0.0.0.0', port=5000)
