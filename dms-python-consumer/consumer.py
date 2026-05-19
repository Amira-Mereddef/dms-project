import json
import os
import urllib.request
import urllib.error
import psycopg2
from kafka import KafkaConsumer
from datetime import datetime
from dotenv import load_dotenv
load_dotenv()


# ── Config ──────────────────────────────────────────────
KAFKA_BROKER      = os.getenv('KAFKA_BROKER', 'localhost:9092')
GROQ_API_KEY = os.getenv('GROQ_API_KEY', '')
PG_HOST           = os.getenv('PG_HOST', 'localhost')
PG_PORT           = int(os.getenv('PG_PORT', '5433'))
PG_USER           = os.getenv('PG_USER', 'dms')
PG_PASSWORD       = os.getenv('PG_PASSWORD', 'dms123')
PG_DATABASE       = os.getenv('PG_DATABASE', 'dmsdb')
# ────────────────────────────────────────────────────────

def get_db():
    return psycopg2.connect(
        host=PG_HOST, port=PG_PORT,
        user=PG_USER, password=PG_PASSWORD,
        database=PG_DATABASE
    )

def translate_to_arabic(text):
    if not GROQ_API_KEY:
        print("  [!] No GROQ_API_KEY set — skipping translation")
        return None
    
    # Groq API endpoint
    url = "https://api.groq.com/openai/v1/chat/completions"
    
    payload = {
        "model": "llama-3.3-70b-versatile",
        "messages": [
            {
                "role": "system",
                "content": "You are a professional translator. You translate document titles from any language to Arabic accurately. You return ONLY the Arabic translation, no explanations, no additional text."
            },
            {
                "role": "user",
                "content": f"Translate this document title to Arabic: {text}"
            }
        ],
        "temperature": 0.3,  
        "max_tokens": 200
    }
    
    data = json.dumps(payload).encode('utf-8')
    
    req = urllib.request.Request(
    url,
    data=data,
    headers={
        'Content-Type': 'application/json',
        'Authorization': f'Bearer {GROQ_API_KEY}',
        'User-Agent': 'Mozilla/5.0',
    },
    method='POST'
)
    
    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            result = json.loads(resp.read().decode('utf-8'))
            translation = result['choices'][0]['message']['content'].strip()
            return translation
    except urllib.error.HTTPError as e:
        body = e.read().decode('utf-8')
        print(f"  [!] Groq HTTP error {e.code}: {body}")
        return None
    except urllib.error.URLError as e:
        print(f"  [!] Groq connection error: {e.reason}")
        return None
    except Exception as e:
        print(f"  [!] Groq error: {e}")
        return None

def save_translation(document_id, translated_title):
    """Write translated_title back to PostgreSQL."""
    try:
        conn = get_db()
        cur  = conn.cursor()
        cur.execute(
            "UPDATE documents SET translated_title = %s WHERE id = %s",
            (translated_title, document_id)
        )
        conn.commit()
        cur.close()
        conn.close()
        print(f"  [✓] Saved translation to DB for document {document_id}")
    except Exception as e:
        print(f"  [!] DB error: {e}")

# ── Main ─────────────────────────────────────────────────
print("DMS Python AI Consumer starting...")
print(f"  Kafka  : {KAFKA_BROKER}")
print(f"  DB     : {PG_HOST}:{PG_PORT}/{PG_DATABASE}")
print(f"  Groq   : {'configured' if GROQ_API_KEY and GROQ_API_KEY != '' else 'NOT SET'}")
print("-" * 50)

consumer = KafkaConsumer(
    'document-uploaded',
    bootstrap_servers=[KAFKA_BROKER],
    auto_offset_reset='latest',     
    enable_auto_commit=True,
    group_id='dms-ai-consumer',
    value_deserializer=lambda x: json.loads(x.decode('utf-8'))
)

print("Listening for document-uploaded events...")
print("-" * 50)

for message in consumer:
    event = message.value
    now   = datetime.now().strftime('%Y-%m-%d %H:%M:%S')

    doc_id = event.get('documentId')
    title  = event.get('title', '')

    print(f"\n[{now}] New document uploaded")
    print(f"  ID    : {doc_id}")
    print(f"  Title : {title}")
    print(f"  Owner : {event.get('owner')}")

    print(f"  Translating to Arabic via Groq (Llama 3)...")
    translated = translate_to_arabic(title)

    if translated:
        print(f"  Arabic: {translated}")
        save_translation(doc_id, translated)
    else:
        print(f"  Translation failed — skipping DB update")

    print("-" * 50)