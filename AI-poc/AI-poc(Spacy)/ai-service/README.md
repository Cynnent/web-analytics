# AI Service

This is a simple AI service using FastAPI and spaCy.

## Setup

1. Create a virtual environment:
   ```bash
   python -m venv venv
   venv\Scripts\activate
   uvicorn app.main:app --host 0.0.0.0 --port 5001 --reload


   User Query :  "How much is the iPhone 12 Pro Max?"

  1. Tokenization :
   - Splits the text into individual units called tokens (words, punctuation).
   - Identifies individual words and punctuation for further analysis.

   - Example Tokens: 

       ['How', 'much', 'is', 'the', 'iPhone', '12', 'Pro', 'Max', '?']


  2. POS Tagging:
   - Identifies parts of speech (e.g., noun, verb) for each token or word.
   - Helps understand the grammatical structure of the sentence.

   - Example POS Tags: 

   [(‘How’, ‘ADV’), (‘much’, ‘ADJ’), (‘is’, ‘AUX’), (‘the’, ‘DET’), (‘iPhone’, ‘NOUN’), (‘12’, ‘NUM’), (‘Pro’, ‘PROPN’), (‘Max’, ‘PROPN’), (‘?’, ‘PUNCT’)]


  3. NER (Named Entity Recognition)
   - Recognizes and categorizes entities such as names, dates, and monetary values.
   - SpaCy extracts entities from the user message.
   - Helps understand specific details like product names, making responses contextually relevant.

   - Example Entities: 

   [(‘iPhone 12 Pro Max’, ‘PRODUCT’)]


  4. Dependency Parsing:
   - Analyzes grammatical structure to understand relationships between words.
   - SpaCy performs dependency parsing to determine how words are connected.
   - Enhances understanding of complex sentences, aiding accurate intent classification.

   - Example Dependencies: 
   
   [(‘How’, ‘advmod’, ‘is’), (‘much’, ‘advmod’, ‘is’), (‘is’, ‘ROOT’, ‘is’), (‘the’, ‘det’, ‘Max’), (‘iPhone’, ‘compound’, ‘Max’), (‘12’, ‘compound’, ‘Max’), (‘Pro’, ‘compound’, ‘Max’), (‘Max’, ‘attr’, ‘is’)]

  5. Intent Classification:
   - Determines the users intention based on the processed information.
   - The chatbot uses tokenized, POS-tagged, NER-processed, and dependency-parsed data to classify intent.
   - Accurately identifies what the user wants.

   - Identified Intent: 
      "Price Inquiry"

  6. Response Generation:
   - Generates an appropriate response based on the identified intent.
   - The chatbot uses pre-defined responses for each intent.
   - Provides relevant and context-aware responses to the user's queries.

   - Generated Response: 
   
     "The price for iPhone 12 Pro Max is not available right now."