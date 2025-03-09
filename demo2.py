import streamlit as st
from transformers import pipeline, AutoModelForCausalLM, AutoTokenizer

# Hugging Face authentication (Replace 'your_token' with actual token)
HUGGINGFACE_TOKEN = "your_huggingface_token"
MODEL_NAME = "meta-llama/Llama-2-7b-chat-hf"

# Load LLaMA 2 model
@st.cache_resource()
def load_model():
    tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME, use_auth_token=HUGGINGFACE_TOKEN)
    model = AutoModelForCausalLM.from_pretrained(MODEL_NAME, use_auth_token=HUGGINGFACE_TOKEN)
    return pipeline("text-generation", model=model, tokenizer=tokenizer)

generator = load_model()

# Streamlit UI
st.title("📝 AI Blog Generator")
st.subheader("Generate blog content with LLaMA 2")

# User input
topic = st.text_input("Enter blog topic:")
words = st.slider("Word count:", min_value=50, max_value=500, value=300)

if st.button("Generate Blog") and topic:
    with st.spinner("Generating..."):
        prompt = f"Write a blog on {topic}:"
        response = generator(prompt, max_length=words, do_sample=True, temperature=0.7)
        st.write(response[0]['generated_text'])
