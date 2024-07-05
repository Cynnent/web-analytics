from transformers import AutoModelForCausalLM, AutoTokenizer
import torch
from datasets import load_dataset

model_name = "microsoft/DialoGPT-medium"
tokenizer = AutoTokenizer.from_pretrained(model_name)
model = AutoModelForCausalLM.from_pretrained(model_name)

dataset = load_dataset("conv_ai", trust_remote_code=True)

inappropriate_responses = {
    "bb": "there",
    "babe": "friend",
    "honey": "there",
    "sweetie": "friend",
    "baby": "there",
    "darling": "friend",
    "sexy": "attractive",
}

def filter_response(response):
    for inappropriate, replacement in inappropriate_responses.items():
        response = response.replace(inappropriate, replacement)
    return response

keyword_responses = {
    "name": "My name is Alex.",
    "help": "I can assist you with various tasks and answer your questions.",
    "what can you do for me": "I can provide information, answer questions, and assist with various tasks."
}

def custom_responses(user_input):
    for keyword, response in keyword_responses.items():
        if keyword in user_input.lower():
            return response
    return None

def chat():
    print("Chatbot: Hello! How can I assist you today?")
    chat_history_ids = None

    while True:
        user_input = input("You: ")

        custom_response = custom_responses(user_input)
        if custom_response:
            print(f"Chatbot: {custom_response}")
            continue

        new_input_ids = tokenizer.encode(user_input + tokenizer.eos_token, return_tensors='pt')

        if chat_history_ids is not None:
            bot_input_ids = torch.cat([chat_history_ids, new_input_ids], dim=-1)
        else:
            bot_input_ids = new_input_ids

        attention_mask = torch.ones(bot_input_ids.shape, device=bot_input_ids.device)

        chat_history_ids = model.generate(bot_input_ids, max_length=1000, attention_mask=attention_mask, pad_token_id=tokenizer.eos_token_id)

        bot_response = tokenizer.decode(chat_history_ids[:, bot_input_ids.shape[-1]:][0], skip_special_tokens=True)
        filtered_response = filter_response(bot_response)
        print(f"Chatbot: {filtered_response}")

if __name__ == "__main__":
    chat()
