import requests
import sys
import json
from datetime import datetime, timedelta

class ERPAPITester:
    def __init__(self, base_url="https://powerstack-crm.preview.emergentagent.com"):
        self.base_url = base_url
        self.api_url = f"{base_url}/api"
        self.token = None
        self.user_id = None
        self.tests_run = 0
        self.tests_passed = 0
        self.test_results = []

    def log_test(self, name, success, details=""):
        """Log test result"""
        self.tests_run += 1
        if success:
            self.tests_passed += 1
            print(f"✅ {name} - PASSED")
        else:
            print(f"❌ {name} - FAILED: {details}")
        
        self.test_results.append({
            "test": name,
            "status": "PASSED" if success else "FAILED",
            "details": details
        })

    def run_test(self, name, method, endpoint, expected_status, data=None, headers=None):
        """Run a single API test"""
        url = f"{self.api_url}/{endpoint}"
        test_headers = {'Content-Type': 'application/json'}
        
        if self.token:
            test_headers['Authorization'] = f'Bearer {self.token}'
        
        if headers:
            test_headers.update(headers)

        try:
            if method == 'GET':
                response = requests.get(url, headers=test_headers, timeout=30)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=test_headers, timeout=30)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=test_headers, timeout=30)
            elif method == 'DELETE':
                response = requests.delete(url, headers=test_headers, timeout=30)

            success = response.status_code == expected_status
            details = f"Status: {response.status_code}"
            
            if not success:
                try:
                    error_data = response.json()
                    details += f", Error: {error_data.get('detail', 'Unknown error')}"
                except:
                    details += f", Response: {response.text[:200]}"
            
            self.log_test(name, success, details)
            
            if success:
                try:
                    return True, response.json()
                except:
                    return True, {}
            else:
                return False, {}

        except Exception as e:
            self.log_test(name, False, f"Exception: {str(e)}")
            return False, {}

    def test_auth_flow(self):
        """Test complete authentication flow"""
        print("\n🔐 Testing Authentication...")
        
        # Test user registration
        test_email = f"test_user_{datetime.now().strftime('%H%M%S')}@test.com"
        test_password = "TestPass123!"
        
        success, response = self.run_test(
            "User Registration",
            "POST",
            "auth/register",
            200,
            data={
                "email": test_email,
                "password": test_password,
                "name": "Test User",
                "role": "user"
            }
        )
        
        if success and 'access_token' in response:
            self.token = response['access_token']
            self.user_id = response['user']['id']
            
            # Test login with same credentials
            success, login_response = self.run_test(
                "User Login",
                "POST",
                "auth/login",
                200,
                data={
                    "email": test_email,
                    "password": test_password
                }
            )
            
            # Test get current user
            self.run_test(
                "Get Current User",
                "GET",
                "auth/me",
                200
            )
            
            return True
        else:
            print("❌ Authentication failed - cannot proceed with other tests")
            return False

    def test_crm_module(self):
        """Test CRM functionality"""
        print("\n👥 Testing CRM Module...")
        
        # Test get customers (empty initially)
        self.run_test("Get Customers", "GET", "crm/customers", 200)
        
        # Create a customer
        customer_data = {
            "name": "Test Customer",
            "email": "customer@test.com",
            "phone": "+1234567890",
            "company": "Test Company",
            "industry": "Technology"
        }
        
        success, customer_response = self.run_test(
            "Create Customer",
            "POST",
            "crm/customers",
            200,
            data=customer_data
        )
        
        customer_id = customer_response.get('id') if success else None
        
        # Test get leads
        self.run_test("Get Leads", "GET", "crm/leads", 200)
        
        # Create a lead
        lead_data = {
            "name": "Test Lead",
            "email": "lead@test.com",
            "phone": "+1234567890",
            "company": "Lead Company",
            "source": "Website",
            "status": "new"
        }
        
        success, lead_response = self.run_test(
            "Create Lead",
            "POST",
            "crm/leads",
            200,
            data=lead_data
        )
        
        lead_id = lead_response.get('id') if success else None
        
        # Test AI lead scoring (may take time)
        if lead_id:
            print("🤖 Testing AI Lead Scoring (this may take a few seconds)...")
            self.run_test(
                "AI Lead Scoring",
                "POST",
                f"crm/leads/{lead_id}/score",
                200
            )
        
        # Test opportunities
        self.run_test("Get Opportunities", "GET", "crm/opportunities", 200)
        
        # Test CRM dashboard
        self.run_test("CRM Dashboard", "GET", "crm/dashboard", 200)

    def test_cpq_module(self):
        """Test CPQ functionality"""
        print("\n📦 Testing CPQ Module...")
        
        # Test get products
        self.run_test("Get Products", "GET", "cpq/products", 200)
        
        # Create a product
        product_data = {
            "name": "Test Product",
            "description": "A test product",
            "sku": "TEST-001",
            "base_price": 99.99,
            "category": "Software",
            "is_active": True
        }
        
        success, product_response = self.run_test(
            "Create Product",
            "POST",
            "cpq/products",
            200,
            data=product_data
        )
        
        # Test get quotes
        self.run_test("Get Quotes", "GET", "cpq/quotes", 200)
        
        # Test AI quote generation (requires customer)
        print("🤖 Testing AI Quote Generation (this may take a few seconds)...")
        # First create a customer for quote generation
        customer_data = {
            "name": "Quote Customer",
            "email": "quotecustomer@test.com",
            "company": "Quote Company",
            "industry": "Manufacturing"
        }
        
        success, customer_response = self.run_test(
            "Create Customer for Quote",
            "POST",
            "crm/customers",
            200,
            data=customer_data
        )
        
        if success:
            customer_id = customer_response.get('id')
            self.run_test(
                "AI Quote Generation",
                "POST",
                "cpq/quotes/generate",
                200,
                data={
                    "customer_id": customer_id,
                    "requirements": "Need software solution for inventory management"
                }
            )

    def test_inventory_module(self):
        """Test Inventory functionality"""
        print("\n📋 Testing Inventory Module...")
        
        # Test get inventory items
        self.run_test("Get Inventory Items", "GET", "inventory/items", 200)
        
        # Create inventory item
        inventory_data = {
            "product_id": "test-product-001",
            "product_name": "Test Inventory Item",
            "quantity": 100,
            "location": "Warehouse A",
            "reorder_point": 20,
            "reorder_quantity": 50
        }
        
        success, inventory_response = self.run_test(
            "Create Inventory Item",
            "POST",
            "inventory/items",
            200,
            data=inventory_data
        )
        
        # Test AI demand forecasting
        if success:
            print("🤖 Testing AI Demand Forecasting (this may take a few seconds)...")
            self.run_test(
                "AI Demand Forecasting",
                "POST",
                "inventory/forecast",
                200,
                data={"product_id": "test-product-001"}
            )

    def test_financial_module(self):
        """Test Financial functionality"""
        print("\n💰 Testing Financial Module...")
        
        # Test get invoices
        self.run_test("Get Invoices", "GET", "financial/invoices", 200)
        
        # Create invoice
        invoice_data = {
            "customer_id": "test-customer-001",
            "customer_name": "Test Customer",
            "amount": 1000.00,
            "tax": 100.00,
            "total": 1100.00,
            "status": "pending",
            "due_date": (datetime.now() + timedelta(days=30)).isoformat()
        }
        
        self.run_test(
            "Create Invoice",
            "POST",
            "financial/invoices",
            200,
            data=invoice_data
        )
        
        # Test get transactions
        self.run_test("Get Transactions", "GET", "financial/transactions", 200)
        
        # Test financial reports
        self.run_test("Financial Reports", "GET", "financial/reports", 200)
        
        # Test AI financial predictions
        print("🤖 Testing AI Financial Predictions (this may take a few seconds)...")
        self.run_test(
            "AI Financial Predictions",
            "POST",
            "financial/predict",
            200,
            data={}
        )

    def test_ai_assistant(self):
        """Test AI Assistant functionality"""
        print("\n🧠 Testing AI Assistant...")
        
        # Test AI query
        print("🤖 Testing AI Query (this may take a few seconds)...")
        self.run_test(
            "AI Query",
            "POST",
            "ai/query",
            200,
            data={
                "query": "What is the current status of my business?",
                "context": "Dashboard overview"
            }
        )
        
        # Test AI insights
        print("🤖 Testing AI Insights (this may take a few seconds)...")
        self.run_test(
            "AI Insights",
            "GET",
            "ai/insights",
            200
        )

    def run_all_tests(self):
        """Run complete test suite"""
        print("🚀 Starting ERP API Test Suite...")
        print(f"Testing against: {self.base_url}")
        
        # Test authentication first
        if not self.test_auth_flow():
            print("\n❌ Authentication failed - stopping tests")
            return False
        
        # Test all modules
        self.test_crm_module()
        self.test_cpq_module()
        self.test_inventory_module()
        self.test_financial_module()
        self.test_ai_assistant()
        
        # Print summary
        print(f"\n📊 Test Summary:")
        print(f"Tests Run: {self.tests_run}")
        print(f"Tests Passed: {self.tests_passed}")
        print(f"Success Rate: {(self.tests_passed/self.tests_run)*100:.1f}%")
        
        # Determine if backend is mostly working
        success_rate = (self.tests_passed/self.tests_run)*100
        if success_rate < 50:
            print("\n❌ CRITICAL: Less than 50% of tests passed - backend needs major fixes")
            return False
        else:
            print(f"\n✅ Backend is mostly functional ({success_rate:.1f}% success rate)")
            return True

def main():
    tester = ERPAPITester()
    success = tester.run_all_tests()
    
    # Save detailed results
    with open('/app/backend_test_results.json', 'w') as f:
        json.dump({
            "timestamp": datetime.now().isoformat(),
            "total_tests": tester.tests_run,
            "passed_tests": tester.tests_passed,
            "success_rate": (tester.tests_passed/tester.tests_run)*100 if tester.tests_run > 0 else 0,
            "results": tester.test_results
        }, f, indent=2)
    
    return 0 if success else 1

if __name__ == "__main__":
    sys.exit(main())