import random
from fastapi import FastAPI
from pydantic import BaseModel
import spacy
import re
import json
import os


# Load spaCy model
nlp = spacy.load("en_core_web_sm")

app = FastAPI()

class Message(BaseModel):
    message: str

script_dir = os.path.dirname(__file__)
file_path = os.path.join(script_dir, '..', 'data', 'training_data.json')
with open(file_path, 'r') as file:
    intent_data = json.load(file)

def extract_entities(pattern, message): 
    entities = {}
    if any(param in pattern for param in ["{min}", "{max}", "{category}", "{product_name}"]):
        pattern = pattern.replace("{min}", r"(?P<min>\d+)")
        pattern = pattern.replace("{max}", r"(?P<max>\d+)")
        pattern = pattern.replace("{category}", r"(?P<category>\w+)")
        pattern = pattern.replace("{product_name}", r"(?P<product_name>[\w\s]+)")
        
        match = re.match(pattern, message, re.IGNORECASE)
        if match:
            entities = match.groupdict()
     
    return entities 

# Define intent classification rules using spaCy
def classify_intent(message): 
    doc = nlp(message)
    tokens = [token.text.lower() for token in doc]
    for intent_info in intent_data:
        for pattern in intent_info["patterns"]:
            if any(param in pattern for param in ["{min}", "{max}", "{category}", "{product_name}"]):
                entities = extract_entities(pattern, message)
                if entities:
                    return intent_info["intent"], entities
            else:
                pattern_doc = nlp(pattern)
                if all(token.text.lower() in tokens for token in pattern_doc):
                    return intent_info["intent"], {}
    return "General Inquiry", {}

def generate_response(intent):
    for intent_info in intent_data:
        if intent_info["intent"] == intent:
            responses = intent_info["responses"]
            return random.choice(responses)
    return "I'm sorry, I'm not sure how to help with that. Can you please provide more details?"

@app.post("/chat")
async def chat(message: Message):

    # Process the message with spaCy
    doc = nlp(message.message)
   
    tokens = [token.text for token in doc]
    print("Tokens:", tokens)

    pos_tags = [(token.text, token.pos_) for token in doc]
    print("POS Tags:", pos_tags)

    entities = [(ent.text, ent.label_) for ent in doc.ents]
    print("Entities:", entities)

    dependencies = [(token.text, token.dep_, token.head.text) for token in doc]
    print("Dependencies:", dependencies)
    intent, entities = classify_intent(message.message)
    response = generate_response(intent)

    print({"intent": intent, "entities": entities, "response": response})
    return {"intent": intent, "entities": entities, "response": response}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=5001)
