# backend/agentic_enhancements.py
"""
Enhanced Agentic Behaviors for Credit Card Optimization
"""

from datetime import datetime, timedelta
from typing import List, Dict, Optional
import json
from agents import agentic_system

class UserBehaviorAgent:
    """
    Learns from user's transaction history and preferences
    TRUE AGENTIC BEHAVIOR: Adapts recommendations based on patterns
    """
    
    def __init__(self):
        self.user_profiles = {}  # In production, use database
    
    def learn_user_preferences(self, user_id: str, transactions: List[Dict]) -> Dict:
        """Analyze user behavior to understand preferences"""
        
        if not transactions:
            return {
                "preferred_goal": "balanced",
                "common_categories": [],
                "spending_patterns": {}
            }
        
        # Analyze transaction patterns
        category_counts = {}
        goal_counts = {}
        total_spent = 0
        
        for txn in transactions:
            category = txn.get("category", "other")
            goal = txn.get("optimization_goal", "balanced")
            amount = txn.get("amount", 0)
            
            category_counts[category] = category_counts.get(category, 0) + 1
            goal_counts[goal] = goal_counts.get(goal, 0) + 1
            total_spent += amount
        
        # Find most common preferences
        preferred_category = max(category_counts, key=category_counts.get) if category_counts else "other"
        preferred_goal = max(goal_counts, key=goal_counts.get) if goal_counts else "balanced"
        
        profile = {
            "preferred_goal": preferred_goal,
            "common_categories": sorted(category_counts.keys(), key=lambda x: category_counts[x], reverse=True)[:3],
            "spending_patterns": {
                "avg_transaction": total_spent / len(transactions) if transactions else 0,
                "total_spent": total_spent,
                "transaction_count": len(transactions)
            },
            "last_updated": datetime.now().isoformat()
        }
        
        self.user_profiles[user_id] = profile
        return profile

class ProactiveRecommendationAgent:
    """
    Proactively suggests optimizations without user asking
    TRUE AGENTIC BEHAVIOR: Takes initiative
    """
    
    def detect_optimization_opportunities(self, user_id: str, recent_transactions: List[Dict]) -> List[Dict]:
        """Find missed opportunities and suggest improvements"""
        
        opportunities = []
        
        for txn in recent_transactions[-10:]:  # Last 10 transactions
            # Check if user used suboptimal card
            actual_card = txn.get("card_used")
            optimal_card = txn.get("recommended_card")
            
            if actual_card != optimal_card:
                missed_value = txn.get("optimal_value", 0) - txn.get("actual_value", 0)
                
                opportunities.append({
                    "type": "missed_optimization",
                    "merchant": txn.get("merchant"),
                    "amount": txn.get("amount"),
                    "missed_value": missed_value,
                    "suggestion": f"You could have earned ${missed_value:.2f} more by using {optimal_card}",
                    "timestamp": txn.get("timestamp")
                })
        
        return opportunities

class ContextAwareAgent:
    """
    Uses context (time, location, spending patterns) for better recommendations
    TRUE AGENTIC BEHAVIOR: Environmental awareness
    """
    
    def enhance_recommendation_with_context(self, 
                                          base_recommendation: Dict, 
                                          context: Dict) -> Dict:
        """Add contextual insights to recommendation"""
        
        enhanced = base_recommendation.copy()
        insights = []
        
        # Time-based context
        current_hour = datetime.now().hour
        if 7 <= current_hour <= 10:
            insights.append("☕ Morning purchase detected - common for coffee/breakfast")
        elif 11 <= current_hour <= 14:
            insights.append("🍽️ Lunch time - dining rewards may apply")
        elif 18 <= current_hour <= 21:
            insights.append("🌙 Evening purchase - dinner or entertainment")
        
        # Spending pattern context
        if context.get("is_recurring_merchant"):
            insights.append("🔁 You shop here regularly - optimizing this saves more over time")
        
        # Budget context
        monthly_spent = context.get("monthly_spent", 0)
        if monthly_spent > context.get("usual_monthly_spend", 1000):
            insights.append("⚠️ You're above your usual monthly spending - consider if this purchase is necessary")
        
        # Category-specific insights
        category = context.get("category")
        if category == "dining" and context.get("weekend"):
            insights.append("🎉 Weekend dining - some cards offer bonus rewards on weekends")
        
        enhanced["contextual_insights"] = insights
        return enhanced

class MultiStepPlanningAgent:
    """
    Plans sequences of actions to maximize long-term value
    TRUE AGENTIC BEHAVIOR: Strategic planning
    """
    
    def create_optimization_plan(self, user_profile: Dict, upcoming_expenses: List[Dict]) -> Dict:
        """Generate a strategic plan for upcoming purchases"""
        
        plan = {
            "total_expected_value": 0,
            "card_usage_plan": [],
            "tips": []
        }
        
        # Analyze upcoming expenses
        for expense in upcoming_expenses:
            merchant = expense.get("merchant")
            amount = expense.get("amount")
            category = expense.get("category")
            
            # Recommend optimal card
            optimal_card = self._determine_optimal_card(category, amount)
            expected_value = self._calculate_value(optimal_card, category, amount)
            
            plan["card_usage_plan"].append({
                "expense": merchant,
                "amount": amount,
                "recommended_card": optimal_card,
                "expected_value": expected_value
            })
            
            plan["total_expected_value"] += expected_value
        
        # Add strategic tips
        if len(upcoming_expenses) > 5:
            plan["tips"].append("💡 Consider consolidating purchases at similar merchants to maximize category bonuses")
        
        return plan
    
    def _determine_optimal_card(self, category: str, amount: float) -> str:
        # Simplified - in production, use full recommendation engine
        category_cards = {
            "dining": "Amex Gold",
            "travel": "Chase Sapphire",
            "groceries": "Amex Gold",
            "gas": "Citi Custom Cash"
        }
        return category_cards.get(category, "Citi Double Cash")
    
    def _calculate_value(self, card: str, category: str, amount: float) -> float:
        # Simplified calculation
        multipliers = {
            "Amex Gold": 4.0 if category in ["dining", "groceries"] else 1.0,
            "Chase Sapphire": 3.0 if category == "travel" else 1.0,
            "Citi Custom Cash": 5.0 if category == "gas" else 1.0,
            "Citi Double Cash": 2.0
        }
        return amount * multipliers.get(card, 1.0) * 0.01

class LearningAgent:
    """
    Learns from user feedback and improves recommendations
    TRUE AGENTIC BEHAVIOR: Continuous learning
    """
    
    def __init__(self):
        self.feedback_data = []
    
    def record_feedback(self, transaction_id: str, feedback: Dict):
        """Store user feedback on recommendations"""
        self.feedback_data.append({
            "transaction_id": transaction_id,
            "accepted_recommendation": feedback.get("accepted"),
            "card_used": feedback.get("card_used"),
            "satisfaction_score": feedback.get("rating"),
            "timestamp": datetime.now().isoformat()
        })
    
    def adjust_recommendation_weights(self) -> Dict:
        """Analyze feedback to improve future recommendations"""
        
        if len(self.feedback_data) < 5:
            return {"status": "insufficient_data"}
        
        # Calculate acceptance rate
        accepted = sum(1 for f in self.feedback_data if f["accepted_recommendation"])
        acceptance_rate = accepted / len(self.feedback_data)
        
        # Adjust strategy based on feedback
        adjustments = {}
        if acceptance_rate < 0.5:
            adjustments["increase_explanation_detail"] = True
            adjustments["consider_user_preferences_more"] = True
        
        return {
            "acceptance_rate": acceptance_rate,
            "total_feedback": len(self.feedback_data),
            "adjustments": adjustments
        }

class AutomationAgent:
    """
    Automates routine decisions for the user
    TRUE AGENTIC BEHAVIOR: Autonomous action
    """
    
    def __init__(self):
        self.automation_rules = {}
    
    def create_automation_rule(self, user_id: str, rule: Dict):
        """Allow user to set up automatic card selection rules"""
        if user_id not in self.automation_rules:
            self.automation_rules[user_id] = []
        
        self.automation_rules[user_id].append({
            "condition": rule.get("condition"),  # e.g., "merchant == 'Starbucks'"
            "action": rule.get("action"),        # e.g., "use Amex Gold"
            "created_at": datetime.now().isoformat()
        })
    
    def check_automation_rules(self, user_id: str, transaction: Dict) -> Optional[str]:
        """Check if any automation rules apply to this transaction"""
        rules = self.automation_rules.get(user_id, [])
        
        for rule in rules:
            condition = rule["condition"]
            # Simple rule matching
            if self._evaluate_condition(condition, transaction):
                return rule["action"]
        
        return None
    
    def _evaluate_condition(self, condition: str, transaction: Dict) -> bool:
        # Simplified rule evaluation
        # In production, use a proper rule engine
        if "merchant" in condition:
            merchant_name = condition.split("'")[1]
            return transaction.get("merchant") == merchant_name
        return False

# Initialize all agents
behavior_agent = UserBehaviorAgent()
proactive_agent = ProactiveRecommendationAgent()
context_agent = ContextAwareAgent()
planning_agent = MultiStepPlanningAgent()
learning_agent = LearningAgent()
automation_agent = AutomationAgent()

# Enhanced recommendation function
def get_agentic_recommendation(transaction_data: Dict, user_history: List[Dict]) -> Dict:
    """
    Multi-agent system that provides truly agentic recommendations
    """
    
    # 1. Learn from user behavior
    user_profile = behavior_agent.learn_user_preferences(
        transaction_data["user_id"], 
        user_history
    )
    
    # 2. Check automation rules first
    auto_card = automation_agent.check_automation_rules(
        transaction_data["user_id"],
        transaction_data
    )
    
    if auto_card:
        return {
            "source": "automation",
            "recommended_card": auto_card,
            "reason": "Based on your automation rules"
        }
    
    # 3. Get base recommendation from AI
    base_rec = agentic_system.get_recommendation(
        transaction_data,
        []  # User cards - would come from database
    )
    
    # 4. Enhance with context
    context = {
        "current_hour": datetime.now().hour,
        "category": transaction_data["category"],
        "is_recurring_merchant": transaction_data["merchant"] in ["Starbucks", "Whole Foods"],
        "monthly_spent": sum(t.get("amount", 0) for t in user_history if t.get("timestamp", "").startswith(datetime.now().strftime("%Y-%m"))),
        "usual_monthly_spend": 1500  # Would calculate from history
    }
    
    enhanced_rec = context_agent.enhance_recommendation_with_context(
        base_rec,
        context
    )
    
    # 5. Identify missed opportunities
    opportunities = proactive_agent.detect_optimization_opportunities(
        transaction_data["user_id"],
        user_history
    )
    
    enhanced_rec["missed_opportunities"] = opportunities[:3]  # Top 3
    
    # 6. Add learning insights
    learning_insights = learning_agent.adjust_recommendation_weights()
    enhanced_rec["learning_status"] = learning_insights
    
    return enhanced_rec