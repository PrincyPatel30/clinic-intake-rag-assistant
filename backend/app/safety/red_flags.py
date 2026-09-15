"""
Clinic Intake Bot - Deterministic Safety Red-Flag Guard
Author: Senior Full-Stack AI Engineer
Hard Rule 4: Red-flag detection is strictly hardcoded Python, NEVER LLM-decided.
"""

import re
from typing import Optional, NamedTuple

class RedFlagResult(NamedTuple):
    has_red_flag: bool
    matched_rule: Optional[str] = None
    category: Optional[str] = None
    emergency_action_text: Optional[str] = None
    detected_phrase: Optional[str] = None

# Red-flag specifications with positive triggers and negation patterns
PATTERNS = [
    {
        "id": "RF_CHEST_RADIATION",
        "category": "Acute Coronary Syndrome",
        "positive": [
            r"(?:chest\s+(?:pain|pressure|tightness|heaviness|crushing|squeezing).*?(?:radiat|spread|shoot|go(?:es|ing)?\s+to|down\s+to).*?(?:arm|left\s+arm|jaw|neck|shoulder|back))",
            r"(?:(?:radiat|spread|shoot).*?(?:left\s+arm|jaw|neck|back).*?(?:chest\s+pain|chest\s+pressure))",
            r"(?:crushing|elephant\s+sitting\s+on)\s+(?:chest|breastbone)",
        ],
        "negation": [
            r"(?:no|not|neither|never|without|denies?|doesn't|does\s+not)\s+.*?(?:chest\s+pain|radiat|spread)",
            r"(?:chest\s+pain\s+(?:does\s+not|never|doesn't)\s+radiate)",
        ],
        "message": "Potential acute cardiac emergency detected (chest pain with radiation or severe crushing sensation). Please call 911/emergency services immediately.",
    },
    {
        "id": "RF_THUNDERCLAP_HEADACHE",
        "category": "Intracranial Emergency",
        "positive": [
            r"(?:worst\s+(?:headache|migraine)\s+(?:of\s+my\s+life|ever)|thunderclap\s+headache|exploded\s+in\s+my\s+head)",
            r"(?:sudden\s+peak\s+headache\s+within\s+seconds)",
        ],
        "negation": [
            r"(?:not\s+the\s+worst|mild\s+headache|normal\s+migraine|no\s+headache)",
        ],
        "message": "Sudden peak headache (thunderclap headache) can indicate subarachnoid hemorrhage. Seek immediate emergency evaluation.",
    },
    {
        "id": "RF_STROKE_FAST",
        "category": "Acute Stroke Symptoms",
        "positive": [
            r"(?:sudden(?:ly)?|woke\s+up\s+with)\s+.*?(?:one\s+side(?:d)?|face\s+droop|arm\s+weak|cannot\s+lift\s+arm|slurr(?:ed|ing)\s+speech)",
            r"(?:facial\s+droop|drooping\s+on\s+one\s+side)",
        ],
        "negation": [
            r"(?:no|not|neither)\s+.*?(?:weakness|numbness|droop|slur)",
        ],
        "message": "Sudden one-sided weakness, facial droop, or slurred speech indicates possible stroke. Call 911 immediately.",
    },
    {
        "id": "RF_RESPIRATORY_DISTRESS",
        "category": "Severe Dyspnea",
        "positive": [
            r"(?:cannot\s+breathe|gasping\s+for\s+(?:air|breath)|lips\s+(?:turning\s+)?blue|choking|suffocating)",
        ],
        "negation": [
            r"(?:no|not|without)\s+.*?(?:difficulty\s+breathing|shortness\s+of\s+breath)",
        ],
        "message": "Severe acute respiratory compromise detected. Call emergency services right away.",
    },
    {
        "id": "RF_SUICIDAL_IDEATION",
        "category": "Mental Health Emergency",
        "positive": [
            r"(?:want\s+to\s+kill\s+myself|end\s+my\s+life|suicid(?:e|al)|want\s+to\s+die|harming\s+myself)",
        ],
        "negation": [
            r"(?:no|not|never)\s+.*?(?:suicidal|want\s+to\s+die)",
        ],
        "message": "Immediate crisis support available: Please dial 988 or reach out to local crisis services immediately.",
    },
]

def check_red_flags(utterance: str) -> RedFlagResult:
    """
    Deterministic rule engine scanning for clinical red flags.
    Handles direct matches, variations, and explicit negation guards.
    """
    text = utterance.strip().lower()
    if not text:
        return RedFlagResult(has_red_flag=False)

    for item in PATTERNS:
        positive_match = False
        matched_str = ""

        for pos in item["positive"]:
            match = re.search(pos, text, re.IGNORECASE)
            if match:
                positive_match = True
                matched_str = match.group(0)
                break

        if positive_match:
            # Check for negation
            is_negated = False
            for neg in item["negation"]:
                if re.search(neg, text, re.IGNORECASE):
                    is_negated = True
                    break

            if not is_negated:
                return RedFlagResult(
                    has_red_flag=True,
                    matched_rule=item["id"],
                    category=item["category"],
                    emergency_action_text=item["message"],
                    detected_phrase=matched_str,
                )

    return RedFlagResult(has_red_flag=False)

# Unit test sanity check
if __name__ == "__main__":
    # True positive
    res1 = check_red_flags("I have bad chest pain radiating down to my left arm")
    assert res1.has_red_flag is True, "Failed on true positive"

    # True negative (negation)
    res2 = check_red_flags("I do not have chest pain radiating to my arm")
    assert res2.has_red_flag is False, "Failed on negation test"

    print("All Python red flag unit tests passed successfully.")
