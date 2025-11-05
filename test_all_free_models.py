#!/usr/bin/env python3
"""
Comprehensive Test Script for All Free AI Video Models
Tests each model to see which ones actually work (no payment required)
"""

import os
import json
import time
import requests
import sys
from typing import Dict, List, Tuple

# Color codes for output
GREEN = '\033[92m'
RED = '\033[91m'
YELLOW = '\033[93m'
BLUE = '\033[94m'
RESET = '\033[0m'

class ModelTester:
    def __init__(self):
        self.replicate_token = os.getenv('REPLICATE_API_TOKEN')
        self.fal_key = os.getenv('FAL_KEY')
        self.base_url = os.getenv('API_URL', 'http://localhost:3001')
        
        if not self.replicate_token and not self.fal_key:
            print(f"{RED}❌ No API keys found!{RESET}")
            print(f"{YELLOW}Set REPLICATE_API_TOKEN or FAL_KEY environment variable{RESET}")
            sys.exit(1)
        
        self.results = {
            'working': [],
            'payment_required': [],
            'not_found': [],
            'rate_limited': [],
            'errors': []
        }
    
    def test_replicate_model(self, model: str, prompt: str = "a cat walking") -> Tuple[bool, str, str]:
        """Test a Replicate model directly"""
        if not self.replicate_token:
            return False, "NO_TOKEN", "Replicate API token not set"
        
        url = f"https://api.replicate.com/v1/models/{model}/predictions"
        headers = {
            "Authorization": f"Token {self.replicate_token}",
            "Content-Type": "application/json"
        }
        
        payload = {
            "input": {
                "prompt": prompt
            }
        }
        
        try:
            print(f"{BLUE}Testing: {model}{RESET}")
            response = requests.post(url, headers=headers, json=payload, timeout=10)
            
            if response.status_code == 201:
                return True, "SUCCESS", "Model is accessible and working"
            elif response.status_code == 402:
                return False, "PAYMENT_REQUIRED", response.json().get('detail', 'Payment required')
            elif response.status_code == 404:
                return False, "NOT_FOUND", "Model not found"
            elif response.status_code == 429:
                return False, "RATE_LIMIT", "Rate limit exceeded"
            else:
                return False, "ERROR", f"Status {response.status_code}: {response.text[:200]}"
        except requests.exceptions.Timeout:
            return False, "TIMEOUT", "Request timed out"
        except Exception as e:
            return False, "ERROR", str(e)[:200]
    
    def test_via_api(self, model: str, prompt: str = "a cat walking") -> Tuple[bool, str, str]:
        """Test model via our API endpoint"""
        url = f"{self.base_url}/api/generate-video"
        payload = {
            "mode": "text",
            "prompt": prompt
        }
        
        try:
            print(f"{BLUE}Testing via API: {model}{RESET}")
            
            # Set custom model if testing specific one
            if model:
                # We'll need to modify the API to accept model parameter
                # For now, test via direct Replicate call
                return self.test_replicate_model(model, prompt)
            
            response = requests.post(url, json=payload, timeout=30)
            
            if response.status_code == 200:
                data = response.json()
                if data.get('success'):
                    return True, "SUCCESS", "Video generated successfully"
                else:
                    error = data.get('error', 'Unknown error')
                    if '402' in error or 'Payment' in error:
                        return False, "PAYMENT_REQUIRED", error[:200]
                    elif '404' in error or 'Not Found' in error:
                        return False, "NOT_FOUND", error[:200]
                    else:
                        return False, "ERROR", error[:200]
            else:
                return False, "ERROR", f"Status {response.status_code}"
        except Exception as e:
            return False, "ERROR", str(e)[:200]
    
    def test_all_models(self):
        """Test all free models"""
        
        # List of models to test (free and potentially free)
        models_to_test = [
            # Free models (hopefully)
            ('lucataco/animate-lcm', 'Fast animation model'),
            ('stability-ai/stable-video-diffusion', 'Stable Diffusion video'),
            ('meta/animate-anyone', 'Meta animation model'),
            
            # Models that might work with free tier
            ('wan-video/wan-2.5-t2v-fast', 'Wan fast text-to-video'),
            ('wan-video/wan-2.5-t2v', 'Wan text-to-video'),
            ('wan-video/wan-2.5-i2v-fast', 'Wan fast image-to-video'),
            ('wan-video/wan-2.5-i2v', 'Wan image-to-video'),
            ('wavespeedai/wan-2.1-i2v-480p', 'Wan 2.1 480p'),
            ('wavespeedai/wan-2.1-t2v-480p', 'Wan 2.1 text 480p'),
            
            # Alternative free models to try
            ('cjwbw/videocrafter2', 'VideoCrafter 2'),
            ('ali-vilab/i2vgen-xl', 'I2VGen XL'),
            ('anotherjesse/zeroscope-v2-xl', 'Zeroscope V2 XL'),
            ('anotherjesse/zeroscope-v2-576w', 'Zeroscope V2 576w'),
            
            # Open source alternatives
            ('fofr/tooncrafter', 'ToonCrafter'),
            ('fofr/video-morpher', 'Video Morpher'),
            ('cjwbw/text2video-zero', 'Text2Video Zero'),
        ]
        
        print(f"\n{YELLOW}{'='*60}{RESET}")
        print(f"{YELLOW}Testing {len(models_to_test)} Free Models{RESET}")
        print(f"{YELLOW}{'='*60}{RESET}\n")
        
        for i, (model, description) in enumerate(models_to_test, 1):
            print(f"\n[{i}/{len(models_to_test)}] {YELLOW}{model}{RESET}")
            print(f"    Description: {description}")
            
            success, status, message = self.test_replicate_model(model)
            
            if success:
                print(f"    {GREEN}✅ WORKING - Model is accessible{RESET}")
                self.results['working'].append({
                    'model': model,
                    'description': description,
                    'status': status,
                    'message': message
                })
            elif status == "PAYMENT_REQUIRED":
                print(f"    {RED}💳 Payment Required{RESET}")
                self.results['payment_required'].append({
                    'model': model,
                    'description': description,
                    'message': message
                })
            elif status == "NOT_FOUND":
                print(f"    {RED}❌ Not Found (404){RESET}")
                self.results['not_found'].append({
                    'model': model,
                    'description': description,
                    'message': message
                })
            elif status == "RATE_LIMIT":
                print(f"    {YELLOW}⏳ Rate Limited (429){RESET}")
                self.results['rate_limited'].append({
                    'model': model,
                    'description': description,
                    'message': message
                })
            else:
                print(f"    {RED}❌ Error: {message}{RESET}")
                self.results['errors'].append({
                    'model': model,
                    'description': description,
                    'status': status,
                    'message': message
                })
            
            # Wait between requests to avoid rate limits
            if i < len(models_to_test):
                print(f"    {BLUE}Waiting 2 seconds before next test...{RESET}")
                time.sleep(2)
        
        self.print_summary()
    
    def print_summary(self):
        """Print test summary"""
        print(f"\n{YELLOW}{'='*60}{RESET}")
        print(f"{YELLOW}TEST SUMMARY{RESET}")
        print(f"{YELLOW}{'='*60}{RESET}\n")
        
        print(f"{GREEN}✅ Working Models ({len(self.results['working'])}):{RESET}")
        for item in self.results['working']:
            print(f"   - {item['model']}: {item['description']}")
        
        print(f"\n{RED}💳 Payment Required ({len(self.results['payment_required'])}):{RESET}")
        for item in self.results['payment_required']:
            print(f"   - {item['model']}: {item['description']}")
        
        print(f"\n{RED}❌ Not Found ({len(self.results['not_found'])}):{RESET}")
        for item in self.results['not_found']:
            print(f"   - {item['model']}: {item['description']}")
        
        print(f"\n{YELLOW}⏳ Rate Limited ({len(self.results['rate_limited'])}):{RESET}")
        for item in self.results['rate_limited']:
            print(f"   - {item['model']}: {item['description']}")
        
        print(f"\n{RED}❌ Errors ({len(self.results['errors'])}):{RESET}")
        for item in self.results['errors']:
            print(f"   - {item['model']}: {item['status']} - {item['message'][:100]}")
        
        # Save results to file
        with open('model_test_results.json', 'w') as f:
            json.dump(self.results, f, indent=2)
        
        print(f"\n{GREEN}Results saved to: model_test_results.json{RESET}")
        
        # Generate updated code suggestion
        if self.results['working']:
            print(f"\n{YELLOW}📝 Suggested Model List Update:{RESET}")
            print(f"{BLUE}const textModels = [")
            for item in self.results['working']:
                print(f"  '{item['model']}',  // ✅ WORKING - {item['description']}")
            print(f"]{RESET}")

def main():
    print(f"{GREEN}AI Video Model Tester{RESET}")
    print(f"{YELLOW}Testing all free models to find which ones work{RESET}\n")
    
    tester = ModelTester()
    tester.test_all_models()

if __name__ == "__main__":
    main()

