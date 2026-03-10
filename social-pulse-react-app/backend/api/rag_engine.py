import os
import pandas as pd
from django.conf import settings
from langchain_community.vectorstores import FAISS
from langchain_community.embeddings import SentenceTransformerEmbeddings
from langchain_groq import ChatGroq
from langchain_nvidia_ai_endpoints import ChatNVIDIA
from langchain.prompts import ChatPromptTemplate
from langchain.schema import HumanMessage, SystemMessage
from .models import ChatMessage

# Initialize Embeddings
embeddings = SentenceTransformerEmbeddings(model_name="all-MiniLM-L6-v2")

def get_llm():
    """
    Returns an LLM instance with Groq as primary and NVIDIA as fallback.
    Note: API keys should be in environment variables: GROQ_API_KEY, NVIDIA_API_KEY.
    """
    groq_key = os.getenv("GROQ_API_KEY")
    nvidia_key = os.getenv("NVIDIA_API_KEY")
    
    # Primary: Groq
    try:
        if groq_key:
            return ChatGroq(
                temperature=0.7,
                model_name="llama-3.3-70b-versatile",
                groq_api_key=groq_key
            )
    except Exception as e:
        print(f"Groq Initialization failed: {e}")

    # Fallback: NVIDIA
    if nvidia_key:
        return ChatNVIDIA(
            model="meta/llama-3-70b-instruct",
            nvidia_api_key=nvidia_key
        )
    
    raise ValueError("No valid LLM API keys found (GROQ_API_KEY or NVIDIA_API_KEY)")

def create_vector_store(text_chunks):
    """Create and save a FAISS vector store from text chunks."""
    vector_store = FAISS.from_texts(text_chunks, embeddings)
    store_path = os.path.join(settings.MEDIA_ROOT, 'vector_store')
    os.makedirs(store_path, exist_ok=True)
    vector_store.save_local(store_path)
    return vector_store

def load_vector_store():
    """Load the existing FAISS vector store."""
    store_path = os.path.join(settings.MEDIA_ROOT, 'vector_store')
    if os.path.exists(os.path.join(store_path, 'index.faiss')):
        return FAISS.load_local(store_path, embeddings, allow_dangerous_deserialization=True)
    return None

def get_assistant_response(user_query, user_obj):
    """
    Orchestrate RAG: Retrieve context -> Query LLM with Fallback -> Save & Return.
    """
    # 1. Retrieve Context
    vector_store = load_vector_store()
    context = ""
    if vector_store:
        docs = vector_store.similarity_search(user_query, k=3)
        context = "\n".join([d.page_content for d in docs])

    # 2. Build Prompt
    system_prompt = f"""
    You are Social Pulse AI, a business data assistant. 
    Use the following context from the user's social media dataset to answer their question.
    If the context doesn't contain the answer, use your general knowledge but mention it's not in the data.
    
    CONTEXT:
    {context}
    """
    
    # 3. Query LLM with Fallback logic
    llm = get_llm()
    
    try:
        # Attempt Groq/Primary
        response = llm.invoke([
            SystemMessage(content=system_prompt),
            HumanMessage(content=user_query)
        ])
        answer = response.content
    except Exception as e:
        print(f"Primary LLM failed ({e}), attempting fallback...")
        # Force fallback to NVIDIA if it wasn't already picked or if Groq failed at runtime
        try:
            nvidia_key = os.getenv("NVIDIA_API_KEY")
            fallback_llm = ChatNVIDIA(model="meta/llama-3-70b-instruct", nvidia_api_key=nvidia_key)
            response = fallback_llm.invoke([
                SystemMessage(content=system_prompt),
                HumanMessage(content=user_query)
            ])
            answer = response.content
        except Exception as fe:
            answer = f"I encountered an error while processing your request: {str(fe)}"

    # 4. Persist to Database
    ChatMessage.objects.create(user=user_obj, role='user', content=user_query)
    ChatMessage.objects.create(user=user_obj, role='assistant', content=answer)

    return answer

def index_dataset_for_rag(df):
    """Conver dataset rows/KPIs into text chunks for the vector store."""
    chunks = []
    # Index summary statistics
    for col in df.columns:
        if pd.api.types.is_numeric_dtype(df[col]):
            chunks.append(f"The average {col} is {df[col].mean():.2f}.")
            chunks.append(f"The maximum {col} recorded is {df[col].max():.2f}.")
    
    # Index some sample rows
    sample = df.head(50)
    for _, row in sample.iterrows():
        chunks.append(f"On {row.get('Date', 'N/A')}, platform {row.get('Platform', 'N/A')} had {row.get('Engagement_Rate', 0)} engagement.")

    create_vector_store(chunks)
