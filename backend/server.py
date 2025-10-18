from fastapi import FastAPI, APIRouter, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict, EmailStr
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime, timezone, timedelta
import bcrypt
import jwt
from emergentintegrations.llm.chat import LlmChat, UserMessage
import json

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# JWT Configuration
SECRET_KEY = os.environ.get('JWT_SECRET_KEY', 'your-secret-key-change-in-production')
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 1440

# AI Configuration
EMERGENT_LLM_KEY = os.environ.get('EMERGENT_LLM_KEY')

app = FastAPI()
api_router = APIRouter(prefix="/api")
security = HTTPBearer()

# ============ MODELS ============

# Auth Models
class UserRegister(BaseModel):
    email: EmailStr
    password: str
    name: str
    role: str = "user"

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class User(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    email: EmailStr
    name: str
    role: str
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class TokenResponse(BaseModel):
    access_token: str
    token_type: str
    user: User

# CRM Models
class Customer(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    email: EmailStr
    phone: Optional[str] = None
    company: Optional[str] = None
    industry: Optional[str] = None
    status: str = "active"
    lifetime_value: float = 0.0
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    updated_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class Lead(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    email: EmailStr
    phone: Optional[str] = None
    company: Optional[str] = None
    source: str
    status: str = "new"
    score: Optional[float] = None
    notes: Optional[str] = None
    assigned_to: Optional[str] = None
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    updated_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class Opportunity(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    customer_id: str
    value: float
    stage: str
    probability: float
    expected_close_date: Optional[str] = None
    assigned_to: Optional[str] = None
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    updated_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

# CPQ Models
class Product(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    description: Optional[str] = None
    sku: str
    base_price: float
    category: str
    is_active: bool = True
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class QuoteItem(BaseModel):
    product_id: str
    product_name: str
    quantity: int
    unit_price: float
    discount: float = 0.0
    total: float

class Quote(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    customer_id: str
    customer_name: str
    items: List[QuoteItem]
    subtotal: float
    tax: float
    discount: float
    total: float
    status: str = "draft"
    valid_until: str
    notes: Optional[str] = None
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

# Inventory Models
class InventoryItem(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    product_id: str
    product_name: str
    quantity: int
    location: str
    reorder_point: int
    reorder_quantity: int
    last_restocked: Optional[str] = None
    updated_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

# Financial Models
class Invoice(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    customer_id: str
    customer_name: str
    quote_id: Optional[str] = None
    amount: float
    tax: float
    total: float
    status: str = "pending"
    due_date: str
    paid_date: Optional[str] = None
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class Transaction(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    invoice_id: str
    amount: float
    type: str
    status: str
    payment_method: str
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

# AI Models
class AIQuery(BaseModel):
    query: str
    context: Optional[str] = None

class AIResponse(BaseModel):
    response: str
    insights: Optional[Dict[str, Any]] = None

# Workflow Models
class WorkflowNode(BaseModel):
    id: str
    type: str  # trigger, condition, action
    config: Dict[str, Any]
    position: Dict[str, int]

class Workflow(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    description: Optional[str] = None
    nodes: List[WorkflowNode]
    connections: List[Dict[str, str]]
    is_active: bool = True
    created_by: str
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

# Email Assistant Models
class EmailDraft(BaseModel):
    to: str
    subject: str
    context: str
    tone: str = "professional"

class EmailResponse(BaseModel):
    subject: str
    body: str
    suggestions: List[str]

# Document Intelligence Models
class DocumentUpload(BaseModel):
    file_name: str
    file_type: str
    content: str  # base64 encoded

class ExtractedData(BaseModel):
    document_type: str
    fields: Dict[str, Any]
    confidence: float

# ============ HELPER FUNCTIONS ============

def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def verify_password(password: str, hashed: str) -> bool:
    return bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        token = credentials.credentials
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = payload.get("sub")
        if user_id is None:
            raise HTTPException(status_code=401, detail="Invalid authentication credentials")
        user = await db.users.find_one({"id": user_id}, {"_id": 0})
        if user is None:
            raise HTTPException(status_code=401, detail="User not found")
        return User(**user)
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token has expired")
    except jwt.JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

async def get_ai_chat():
    return LlmChat(
        api_key=EMERGENT_LLM_KEY,
        session_id="agentix-ai-assistant",
        system_message="You are Agentix AI, an advanced intelligent assistant specialized in CRM, CPQ, inventory management, and financial analysis. Provide insights, recommendations, and data analysis to help users make better business decisions."
    ).with_model("openai", "gpt-4o")

# ============ AUTH ROUTES ============

@api_router.post("/auth/register", response_model=TokenResponse)
async def register(user_data: UserRegister):
    existing_user = await db.users.find_one({"email": user_data.email})
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    user_dict = user_data.model_dump()
    user_dict['password'] = hash_password(user_data.password)
    user = User(email=user_data.email, name=user_data.name, role=user_data.role)
    user_dict['id'] = user.id
    user_dict['created_at'] = user.created_at
    
    await db.users.insert_one(user_dict)
    
    access_token = create_access_token(data={"sub": user.id})
    return TokenResponse(access_token=access_token, token_type="bearer", user=user)

@api_router.post("/auth/login", response_model=TokenResponse)
async def login(credentials: UserLogin):
    user_doc = await db.users.find_one({"email": credentials.email})
    if not user_doc or not verify_password(credentials.password, user_doc['password']):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    user = User(**{k: v for k, v in user_doc.items() if k != 'password'})
    access_token = create_access_token(data={"sub": user.id})
    return TokenResponse(access_token=access_token, token_type="bearer", user=user)

@api_router.get("/auth/me", response_model=User)
async def get_me(current_user: User = Depends(get_current_user)):
    return current_user

# ============ CRM ROUTES ============

@api_router.get("/crm/customers", response_model=List[Customer])
async def get_customers(current_user: User = Depends(get_current_user)):
    customers = await db.customers.find({}, {"_id": 0}).to_list(1000)
    return customers

@api_router.post("/crm/customers", response_model=Customer)
async def create_customer(customer: Customer, current_user: User = Depends(get_current_user)):
    doc = customer.model_dump()
    await db.customers.insert_one(doc)
    return customer

@api_router.put("/crm/customers/{customer_id}", response_model=Customer)
async def update_customer(customer_id: str, customer: Customer, current_user: User = Depends(get_current_user)):
    customer.updated_at = datetime.now(timezone.utc).isoformat()
    await db.customers.update_one({"id": customer_id}, {"$set": customer.model_dump()})
    return customer

@api_router.delete("/crm/customers/{customer_id}")
async def delete_customer(customer_id: str, current_user: User = Depends(get_current_user)):
    await db.customers.delete_one({"id": customer_id})
    return {"message": "Customer deleted"}

@api_router.get("/crm/leads", response_model=List[Lead])
async def get_leads(current_user: User = Depends(get_current_user)):
    leads = await db.leads.find({}, {"_id": 0}).to_list(1000)
    return leads

@api_router.post("/crm/leads", response_model=Lead)
async def create_lead(lead: Lead, current_user: User = Depends(get_current_user)):
    doc = lead.model_dump()
    await db.leads.insert_one(doc)
    return lead

@api_router.post("/crm/leads/{lead_id}/score")
async def score_lead(lead_id: str, current_user: User = Depends(get_current_user)):
    lead = await db.leads.find_one({"id": lead_id}, {"_id": 0})
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")
    
    try:
        chat = await get_ai_chat()
        prompt = f"""Analyze this lead and provide detailed scoring with explanation:
        Name: {lead.get('name')}
        Company: {lead.get('company')}
        Source: {lead.get('source')}
        Status: {lead.get('status')}
        Notes: {lead.get('notes')}
        
        Provide JSON with:
        {{
            "score": <0-100>,
            "confidence": <0-1>,
            "reasoning": "detailed explanation",
            "strengths": ["strength1", "strength2"],
            "concerns": ["concern1", "concern2"],
            "recommended_actions": ["action1", "action2"]
        }}"""
        
        message = UserMessage(text=prompt)
        response = await chat.send_message(message)
        
        result = json.loads(response)
        score = result.get('score', 50)
        
        await db.leads.update_one({
            "id": lead_id
        }, {
            "$set": {
                "score": score,
                "score_details": result,
                "updated_at": datetime.now(timezone.utc).isoformat()
            }
        })
        
        return result
    except Exception as e:
        logging.error(f"AI scoring error: {str(e)}")
        return {
            "score": 50,
            "confidence": 0.5,
            "reasoning": "Unable to calculate AI score",
            "strengths": [],
            "concerns": [],
            "recommended_actions": []
        }

@api_router.get("/crm/opportunities", response_model=List[Opportunity])
async def get_opportunities(current_user: User = Depends(get_current_user)):
    opportunities = await db.opportunities.find({}, {"_id": 0}).to_list(1000)
    return opportunities

@api_router.post("/crm/opportunities", response_model=Opportunity)
async def create_opportunity(opportunity: Opportunity, current_user: User = Depends(get_current_user)):
    doc = opportunity.model_dump()
    await db.opportunities.insert_one(doc)
    return opportunity

@api_router.get("/crm/dashboard")
async def get_crm_dashboard(current_user: User = Depends(get_current_user)):
    total_customers = await db.customers.count_documents({})
    total_leads = await db.leads.count_documents({})
    total_opportunities = await db.opportunities.count_documents({})
    
    pipeline = [
        {"$group": {"_id": None, "total_value": {"$sum": "$value"}}}
    ]
    opp_value = await db.opportunities.aggregate(pipeline).to_list(1)
    pipeline_value = opp_value[0]['total_value'] if opp_value else 0
    
    return {
        "total_customers": total_customers,
        "total_leads": total_leads,
        "total_opportunities": total_opportunities,
        "pipeline_value": pipeline_value
    }

# ============ CPQ ROUTES ============

@api_router.get("/cpq/products", response_model=List[Product])
async def get_products(current_user: User = Depends(get_current_user)):
    products = await db.products.find({"is_active": True}, {"_id": 0}).to_list(1000)
    return products

@api_router.post("/cpq/products", response_model=Product)
async def create_product(product: Product, current_user: User = Depends(get_current_user)):
    doc = product.model_dump()
    await db.products.insert_one(doc)
    return product

@api_router.get("/cpq/quotes", response_model=List[Quote])
async def get_quotes(current_user: User = Depends(get_current_user)):
    quotes = await db.quotes.find({}, {"_id": 0}).to_list(1000)
    return quotes

@api_router.post("/cpq/quotes", response_model=Quote)
async def create_quote(quote: Quote, current_user: User = Depends(get_current_user)):
    doc = quote.model_dump()
    await db.quotes.insert_one(doc)
    return quote

@api_router.post("/cpq/quotes/generate")
async def generate_quote_ai(data: Dict[str, Any], current_user: User = Depends(get_current_user)):
    customer_id = data.get('customer_id')
    requirements = data.get('requirements', '')
    
    customer = await db.customers.find_one({"id": customer_id}, {"_id": 0})
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    
    products = await db.products.find({"is_active": True}, {"_id": 0}).to_list(1000)
    
    try:
        chat = await get_ai_chat()
        prompt = f"""Generate an optimized product quote based on:
        Customer: {customer.get('name')} ({customer.get('industry')})
        Requirements: {requirements}
        Available Products: {json.dumps([{'id': p['id'], 'name': p['name'], 'price': p['base_price'], 'category': p['category']} for p in products])}
        
        Respond with JSON: {{"recommended_products": [{{"product_id": "id", "quantity": <num>, "reasoning": "why"}}], "discount_recommendation": <percentage>}}"""
        
        message = UserMessage(text=prompt)
        response = await chat.send_message(message)
        result = json.loads(response)
        
        return {"recommendations": result, "customer": customer, "products": products}
    except Exception as e:
        logging.error(f"AI quote generation error: {str(e)}")
        return {"recommendations": {"recommended_products": [], "discount_recommendation": 0}, "customer": customer, "products": products}

# ============ INVENTORY ROUTES ============

@api_router.get("/inventory/items", response_model=List[InventoryItem])
async def get_inventory(current_user: User = Depends(get_current_user)):
    items = await db.inventory.find({}, {"_id": 0}).to_list(1000)
    return items

@api_router.post("/inventory/items", response_model=InventoryItem)
async def create_inventory_item(item: InventoryItem, current_user: User = Depends(get_current_user)):
    doc = item.model_dump()
    await db.inventory.insert_one(doc)
    return item

@api_router.put("/inventory/items/{item_id}", response_model=InventoryItem)
async def update_inventory_item(item_id: str, item: InventoryItem, current_user: User = Depends(get_current_user)):
    item.updated_at = datetime.now(timezone.utc).isoformat()
    await db.inventory.update_one({"id": item_id}, {"$set": item.model_dump()})
    return item

@api_router.post("/inventory/forecast")
async def forecast_demand(data: Dict[str, Any], current_user: User = Depends(get_current_user)):
    product_id = data.get('product_id')
    
    item = await db.inventory.find_one({"product_id": product_id}, {"_id": 0})
    if not item:
        return {"forecast": "No data available"}
    
    try:
        chat = await get_ai_chat()
        prompt = f"""Analyze inventory for demand forecasting:
        Product: {item.get('product_name')}
        Current Quantity: {item.get('quantity')}
        Reorder Point: {item.get('reorder_point')}
        
        Provide JSON: {{"forecast_next_30_days": <number>, "recommendation": "<action>"}}"""
        
        message = UserMessage(text=prompt)
        response = await chat.send_message(message)
        result = json.loads(response)
        
        return result
    except Exception as e:
        logging.error(f"AI forecast error: {str(e)}")
        return {"forecast_next_30_days": 0, "recommendation": "Unable to generate forecast"}

# ============ FINANCIAL ROUTES ============

@api_router.get("/financial/invoices", response_model=List[Invoice])
async def get_invoices(current_user: User = Depends(get_current_user)):
    invoices = await db.invoices.find({}, {"_id": 0}).to_list(1000)
    return invoices

@api_router.post("/financial/invoices", response_model=Invoice)
async def create_invoice(invoice: Invoice, current_user: User = Depends(get_current_user)):
    doc = invoice.model_dump()
    await db.invoices.insert_one(doc)
    return invoice

@api_router.get("/financial/transactions", response_model=List[Transaction])
async def get_transactions(current_user: User = Depends(get_current_user)):
    transactions = await db.transactions.find({}, {"_id": 0}).to_list(1000)
    return transactions

@api_router.get("/financial/reports")
async def get_financial_reports(current_user: User = Depends(get_current_user)):
    pipeline = [
        {"$group": {"_id": "$status", "total": {"$sum": "$total"}, "count": {"$sum": 1}}}
    ]
    invoice_stats = await db.invoices.aggregate(pipeline).to_list(10)
    
    total_revenue = sum(stat['total'] for stat in invoice_stats if stat['_id'] == 'paid')
    pending_revenue = sum(stat['total'] for stat in invoice_stats if stat['_id'] == 'pending')
    
    return {
        "total_revenue": total_revenue,
        "pending_revenue": pending_revenue,
        "invoice_stats": invoice_stats
    }

@api_router.post("/financial/predict")
async def predict_financial(data: Dict[str, Any], current_user: User = Depends(get_current_user)):
    invoices = await db.invoices.find({}, {"_id": 0}).to_list(1000)
    
    try:
        chat = await get_ai_chat()
        prompt = f"""Analyze financial data and predict trends:
        Total Invoices: {len(invoices)}
        Recent Data: {json.dumps(invoices[:10] if len(invoices) > 10 else invoices)}
        
        Provide JSON: {{"predicted_revenue_next_quarter": <number>, "trends": "<analysis>", "recommendations": ["<rec1>", "<rec2>"]}}"""
        
        message = UserMessage(text=prompt)
        response = await chat.send_message(message)
        result = json.loads(response)
        
        return result
    except Exception as e:
        logging.error(f"AI prediction error: {str(e)}")
        return {"predicted_revenue_next_quarter": 0, "trends": "Unable to analyze", "recommendations": []}

# ============ AI ROUTES ============

@api_router.post("/ai/query", response_model=AIResponse)
async def ai_query(query: AIQuery, current_user: User = Depends(get_current_user)):
    try:
        chat = await get_ai_chat()
        
        context_data = {
            "customers_count": await db.customers.count_documents({}),
            "leads_count": await db.leads.count_documents({}),
            "products_count": await db.products.count_documents({}),
            "invoices_count": await db.invoices.count_documents({})
        }
        
        prompt = f"""Answer this ERP query with context:
        Query: {query.query}
        Context: {json.dumps(context_data)}
        Additional Context: {query.context or 'None'}
        
        Provide helpful, actionable insights."""
        
        message = UserMessage(text=prompt)
        response = await chat.send_message(message)
        
        return AIResponse(response=response, insights=context_data)
    except Exception as e:
        logging.error(f"AI query error: {str(e)}")
        return AIResponse(response="I'm currently unable to process your query. Please try again.", insights={})

@api_router.get("/ai/insights")
async def get_ai_insights(current_user: User = Depends(get_current_user)):
    try:
        chat = await get_ai_chat()
        
        customers = await db.customers.find({}, {"_id": 0}).to_list(100)
        leads = await db.leads.find({}, {"_id": 0}).to_list(100)
        opportunities = await db.opportunities.find({}, {"_id": 0}).to_list(100)
        
        prompt = f"""Generate key business insights from this ERP data:
        Customers: {len(customers)}
        Leads: {len(leads)}
        Opportunities: {len(opportunities)}
        Sample Data: {json.dumps({'customers': customers[:3], 'leads': leads[:3], 'opportunities': opportunities[:3]})}
        
        Provide JSON: {{"insights": [{{"title": "<title>", "description": "<desc>", "priority": "high|medium|low"}}], "key_metrics": {{...}}}}"""
        
        message = UserMessage(text=prompt)
        response = await chat.send_message(message)
        result = json.loads(response)
        
        return result
    except Exception as e:
        logging.error(f"AI insights error: {str(e)}")
        return {"insights": [], "key_metrics": {}}

# ============ WORKFLOW AUTOMATION ROUTES ============

@api_router.get("/workflows", response_model=List[Workflow])
async def get_workflows(current_user: User = Depends(get_current_user)):
    workflows = await db.workflows.find({}, {"_id": 0}).to_list(1000)
    return workflows

@api_router.post("/workflows", response_model=Workflow)
async def create_workflow(workflow: Workflow, current_user: User = Depends(get_current_user)):
    workflow.created_by = current_user.id
    doc = workflow.model_dump()
    await db.workflows.insert_one(doc)
    return workflow

@api_router.put("/workflows/{workflow_id}", response_model=Workflow)
async def update_workflow(workflow_id: str, workflow: Workflow, current_user: User = Depends(get_current_user)):
    await db.workflows.update_one({"id": workflow_id}, {"$set": workflow.model_dump()})
    return workflow

@api_router.delete("/workflows/{workflow_id}")
async def delete_workflow(workflow_id: str, current_user: User = Depends(get_current_user)):
    await db.workflows.delete_one({"id": workflow_id})
    return {"message": "Workflow deleted"}

@api_router.post("/workflows/{workflow_id}/execute")
async def execute_workflow(workflow_id: str, data: Dict[str, Any], current_user: User = Depends(get_current_user)):
    workflow = await db.workflows.find_one({"id": workflow_id}, {"_id": 0})
    if not workflow:
        raise HTTPException(status_code=404, detail="Workflow not found")
    
    # Simulate workflow execution
    return {"status": "executed", "workflow_id": workflow_id, "result": data}

# ============ EMAIL ASSISTANT ROUTES ============

@api_router.post("/email/draft", response_model=EmailResponse)
async def draft_email(email_data: EmailDraft, current_user: User = Depends(get_current_user)):
    try:
        chat = await get_ai_chat()
        prompt = f"""Draft a {email_data.tone} email with the following details:
        To: {email_data.to}
        Subject: {email_data.subject}
        Context: {email_data.context}
        
        Provide JSON with:
        {{
            "subject": "refined subject line",
            "body": "complete email body with greeting and signature",
            "suggestions": ["suggestion1", "suggestion2", "suggestion3"]
        }}"""
        
        message = UserMessage(text=prompt)
        response = await chat.send_message(message)
        result = json.loads(response)
        
        return EmailResponse(**result)
    except Exception as e:
        logging.error(f"Email draft error: {str(e)}")
        return EmailResponse(
            subject=email_data.subject,
            body="Unable to generate email draft. Please try again.",
            suggestions=[]
        )

@api_router.post("/email/summarize-meeting")
async def summarize_meeting(data: Dict[str, Any], current_user: User = Depends(get_current_user)):
    transcript = data.get('transcript', '')
    
    try:
        chat = await get_ai_chat()
        prompt = f"""Summarize this meeting transcript:
        {transcript}
        
        Provide JSON with:
        {{
            "summary": "brief summary",
            "key_points": ["point1", "point2"],
            "action_items": ["action1", "action2"],
            "next_steps": ["step1", "step2"]
        }}"""
        
        message = UserMessage(text=prompt)
        response = await chat.send_message(message)
        result = json.loads(response)
        
        return result
    except Exception as e:
        logging.error(f"Meeting summary error: {str(e)}")
        return {
            "summary": "Unable to generate summary",
            "key_points": [],
            "action_items": [],
            "next_steps": []
        }

# ============ DOCUMENT INTELLIGENCE ROUTES ============

@api_router.post("/documents/extract")
async def extract_document_data(doc: Dict[str, Any], current_user: User = Depends(get_current_user)):
    file_name = doc.get('file_name', '')
    file_type = doc.get('file_type', '')
    content = doc.get('content', '')
    
    try:
        chat = await get_ai_chat()
        prompt = f"""Extract structured data from this {file_type} document:
        File: {file_name}
        Content: {content}
        
        Identify if this is an invoice, contract, receipt, or other document type.
        Extract all relevant fields like:
        - Invoice: invoice_number, date, vendor, amount, line_items
        - Contract: parties, start_date, end_date, terms, value
        - Receipt: merchant, date, items, total
        
        Provide JSON with:
        {{
            "document_type": "invoice|contract|receipt|other",
            "fields": {{extracted fields}},
            "confidence": <0-1>
        }}"""
        
        message = UserMessage(text=prompt)
        response = await chat.send_message(message)
        result = json.loads(response)
        
        # Store extracted data
        doc_record = {
            "id": str(uuid.uuid4()),
            "file_name": file_name,
            "file_type": file_type,
            "extracted_data": result,
            "uploaded_by": current_user.id,
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        await db.documents.insert_one(doc_record)
        
        return result
    except Exception as e:
        logging.error(f"Document extraction error: {str(e)}")
        return {
            "document_type": "unknown",
            "fields": {},
            "confidence": 0.0
        }

@api_router.get("/documents")
async def get_documents(current_user: User = Depends(get_current_user)):
    documents = await db.documents.find({}, {"_id": 0}).to_list(1000)
    return documents

# ============ VOICE COMMANDS ROUTE ============

@api_router.post("/voice/command")
async def process_voice_command(data: Dict[str, Any], current_user: User = Depends(get_current_user)):
    command = data.get('command', '')
    
    try:
        chat = await get_ai_chat()
        prompt = f"""Process this voice command for an ERP system:
        Command: "{command}"
        
        Determine the intent and extract parameters. Possible actions:
        - show_dashboard, show_customers, show_leads, show_inventory, show_financial
        - create_customer, create_lead, create_quote
        - search_data, filter_data, export_data
        
        Provide JSON with:
        {{
            "intent": "action_name",
            "parameters": {{extracted params}},
            "response": "natural language response to user",
            "confidence": <0-1>
        }}"""
        
        message = UserMessage(text=prompt)
        response = await chat.send_message(message)
        result = json.loads(response)
        
        return result
    except Exception as e:
        logging.error(f"Voice command error: {str(e)}")
        return {
            "intent": "unknown",
            "parameters": {},
            "response": "I didn't understand that command. Please try again.",
            "confidence": 0.0
        }

# ============ MAIN APP ============

app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()