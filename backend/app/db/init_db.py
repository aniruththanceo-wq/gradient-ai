from __future__ import annotations

from sqlalchemy.orm import Session

from app.db.base import Base
from app.db.session import engine
from app.models import AssessmentQuestion, CodingProblem, CompanyPreparation


def create_database_schema() -> None:
    Base.metadata.create_all(bind=engine)


APTITUDE_QUESTIONS = [
    # Quantitative (6)
    {
        "assessment_type": "aptitude",
        "category": "quantitative",
        "prompt": "A product price increases from $80 to $100. What is the percentage increase?",
        "options": ["20%", "25%", "30%", "40%"],
        "correct_option": "25%",
        "difficulty": "easy",
    },
    {
        "assessment_type": "aptitude",
        "category": "quantitative",
        "prompt": "A train running at 72 km/h crosses a 200m pole in how many seconds?",
        "options": ["8 seconds", "10 seconds", "12 seconds", "15 seconds"],
        "correct_option": "10 seconds",
        "difficulty": "medium",
    },
    {
        "assessment_type": "aptitude",
        "category": "quantitative",
        "prompt": "A can complete a work in 12 days and B in 18 days. If they work together, how many days will they take?",
        "options": ["6.2 days", "7.2 days", "8.0 days", "9.5 days"],
        "correct_option": "7.2 days",
        "difficulty": "medium",
    },
    {
        "assessment_type": "aptitude",
        "category": "quantitative",
        "prompt": "If an item is sold for $540 at a 20% loss, what was its original cost price?",
        "options": ["$650", "$675", "$700", "$720"],
        "correct_option": "$675",
        "difficulty": "medium",
    },
    {
        "assessment_type": "aptitude",
        "category": "quantitative",
        "prompt": "What is the compound interest on $10,000 at 10% per annum for 2 years compounded annually?",
        "options": ["$2,000", "$2,100", "$2,200", "$2,500"],
        "correct_option": "$2,100",
        "difficulty": "easy",
    },
    {
        "assessment_type": "aptitude",
        "category": "quantitative",
        "prompt": "The ratio of two numbers is 3:4 and their LCM is 180. What is the smaller number?",
        "options": ["36", "45", "60", "75"],
        "correct_option": "45",
        "difficulty": "hard",
    },
    # Logical Reasoning (6)
    {
        "assessment_type": "aptitude",
        "category": "logical",
        "prompt": "Find the missing number in the sequence: 2, 6, 12, 20, 30, ?",
        "options": ["38", "40", "42", "44"],
        "correct_option": "42",
        "difficulty": "medium",
    },
    {
        "assessment_type": "aptitude",
        "category": "logical",
        "prompt": "If 'ORANGE' is coded as 'PSBOHF', what is the code for 'APPLE'?",
        "options": ["BQQMF", "BQQMD", "BPQME", "BRQNF"],
        "correct_option": "BQQMF",
        "difficulty": "easy",
    },
    {
        "assessment_type": "aptitude",
        "category": "logical",
        "prompt": "Statements: All cats are mammals. All mammals are animals. Conclusion: All cats are animals.",
        "options": ["Definitely True", "Definitely False", "Cannot be determined", "Partially True"],
        "correct_option": "Definitely True",
        "difficulty": "easy",
    },
    {
        "assessment_type": "aptitude",
        "category": "logical",
        "prompt": "Pointing to a man, a woman said, 'His mother is the only daughter of my mother.' How is the woman related to the man?",
        "options": ["Sister", "Mother", "Aunt", "Grandmother"],
        "correct_option": "Mother",
        "difficulty": "medium",
    },
    {
        "assessment_type": "aptitude",
        "category": "logical",
        "prompt": "A person walks 5 km North, turns right and walks 4 km, then turns right and walks 5 km. How far is he from the start point?",
        "options": ["3 km", "4 km", "5 km", "9 km"],
        "correct_option": "4 km",
        "difficulty": "easy",
    },
    {
        "assessment_type": "aptitude",
        "category": "logical",
        "prompt": "Six friends P, Q, R, S, T, U sit in a circle facing center. P is opposite S. Q is to the immediate right of P. Who sits to the immediate left of S?",
        "options": ["T", "U", "R", "Cannot be determined without additional relative constraint"],
        "correct_option": "Cannot be determined without additional relative constraint",
        "difficulty": "hard",
    },
    # Verbal Ability (4)
    {
        "assessment_type": "aptitude",
        "category": "verbal",
        "prompt": "Choose the closest synonym for 'PRAGMATIC':",
        "options": ["Theoretical", "Practical", "Careless", "Hesitant"],
        "correct_option": "Practical",
        "difficulty": "easy",
    },
    {
        "assessment_type": "aptitude",
        "category": "verbal",
        "prompt": "Complete the analogy: Doctor : Hospital :: Architect : ?",
        "options": ["Blueprint", "Construction site", "Firm / Studio", "Building"],
        "correct_option": "Firm / Studio",
        "difficulty": "medium",
    },
    {
        "assessment_type": "aptitude",
        "category": "verbal",
        "prompt": "Select the correct antonym for 'EPHEMERAL':",
        "options": ["Transitory", "Eternal", "Brief", "Fragile"],
        "correct_option": "Eternal",
        "difficulty": "medium",
    },
    {
        "assessment_type": "aptitude",
        "category": "verbal",
        "prompt": "What is the meaning of the idiom 'To cut corners'?",
        "options": ["To do something efficiently without compromise", "To do something quickly and poorly to save time or money", "To make sharp turns", "To design angular structures"],
        "correct_option": "To do something quickly and poorly to save time or money",
        "difficulty": "easy",
    },
    # Data Interpretation (4)
    {
        "assessment_type": "aptitude",
        "category": "data_interpretation",
        "prompt": "A department has 120 employees: 45 in Dev, 30 in QA, 25 in Ops, 20 in HR. What angle does Dev represent on a pie chart?",
        "options": ["120°", "135°", "150°", "165°"],
        "correct_option": "135°",
        "difficulty": "medium",
    },
    {
        "assessment_type": "aptitude",
        "category": "data_interpretation",
        "prompt": "Revenue in 2024 was $40M and in 2025 was $52M. What is the compound yearly revenue growth rate?",
        "options": ["24%", "30%", "32%", "35%"],
        "correct_option": "30%",
        "difficulty": "easy",
    },
    {
        "assessment_type": "aptitude",
        "category": "data_interpretation",
        "prompt": "In a 5-subject test series, student marks were 72, 85, 78, 90, 80. If passing average is 80, what is the student's performance surplus/deficit?",
        "options": ["-1 mark", "+1 mark", "+2 marks", "+5 marks"],
        "correct_option": "+1 mark",
        "difficulty": "easy",
    },
    {
        "assessment_type": "aptitude",
        "category": "data_interpretation",
        "prompt": "If total factory production is 5,000 units with 4% defect rate in Shift 1 (60% output) and 2% in Shift 2 (40% output), what is total defective units?",
        "options": ["140", "160", "180", "200"],
        "correct_option": "160",
        "difficulty": "hard",
    },
]

COMMUNICATION_QUESTIONS = [
    # Grammar (3)
    {
        "assessment_type": "communication",
        "category": "grammar",
        "prompt": "Choose the grammatically correct sentence:",
        "options": [
            "Neither of the team members were available.",
            "Neither of the team members was available.",
            "Neither of the team members are available.",
            "Neither of the team members have been available.",
        ],
        "correct_option": "Neither of the team members was available.",
        "difficulty": "medium",
    },
    {
        "assessment_type": "communication",
        "category": "grammar",
        "prompt": "Identify the correct preposition: 'The architecture team complies ______ security guidelines.'",
        "options": ["with", "to", "by", "for"],
        "correct_option": "with",
        "difficulty": "easy",
    },
    {
        "assessment_type": "communication",
        "category": "grammar",
        "prompt": "Choose the sentence with correct tense consistency:",
        "options": [
            "When the service deployed, the latency drops significantly.",
            "When the service deployed, the latency dropped significantly.",
            "When the service deploys, the latency had dropped.",
            "When the service was deploying, the latency drops.",
        ],
        "correct_option": "When the service deployed, the latency dropped significantly.",
        "difficulty": "easy",
    },
    # Vocabulary (3)
    {
        "assessment_type": "communication",
        "category": "vocabulary",
        "prompt": "Select the most appropriate technical/professional word: 'We need to ______ the bottleneck before scaling.'",
        "options": ["mitigate", "dilute", "repress", "demote"],
        "correct_option": "mitigate",
        "difficulty": "easy",
    },
    {
        "assessment_type": "communication",
        "category": "vocabulary",
        "prompt": "What does 'AMBIGUOUS' mean in requirement specifications?",
        "options": ["Extremely clear and actionable", "Open to more than one interpretation; unclear", "Highly optimized", "Technically impossible"],
        "correct_option": "Open to more than one interpretation; unclear",
        "difficulty": "easy",
    },
    {
        "assessment_type": "communication",
        "category": "vocabulary",
        "prompt": "Which term best describes the ability to recover quickly from software and operational disruptions?",
        "options": ["Resilience", "Redundancy", "Refactor", "Recursion"],
        "correct_option": "Resilience",
        "difficulty": "medium",
    },
    # Sentence Correction (3)
    {
        "assessment_type": "communication",
        "category": "sentence_correction",
        "prompt": "Identify the best correction for: 'Running late for the interview, the taxi broke down.'",
        "options": [
            "Running late for the interview, his taxi broke down.",
            "Because he was running late for the interview, his taxi broke down.",
            "While he was running late for the interview, his taxi broke down.",
            "The taxi broke down while he was running late for the interview.",
        ],
        "correct_option": "The taxi broke down while he was running late for the interview.",
        "difficulty": "medium",
    },
    {
        "assessment_type": "communication",
        "category": "sentence_correction",
        "prompt": "Choose the sentence demonstrating parallel structure:",
        "options": [
            "She likes designing interfaces, writing clean code, and to review pull requests.",
            "She likes designing interfaces, writing clean code, and reviewing pull requests.",
            "She likes to design interfaces, writing clean code, and pull requests review.",
            "She likes design of interfaces, writing clean code, and to review PRs.",
        ],
        "correct_option": "She likes designing interfaces, writing clean code, and reviewing pull requests.",
        "difficulty": "medium",
    },
    {
        "assessment_type": "communication",
        "category": "sentence_correction",
        "prompt": "Select the sentence without a comma splice or run-on:",
        "options": [
            "The test passed, we deployed to staging.",
            "The test passed; therefore, we deployed to staging.",
            "The test passed we deployed to staging immediately.",
            "The test passed, however we deployed to staging.",
        ],
        "correct_option": "The test passed; therefore, we deployed to staging.",
        "difficulty": "medium",
    },
    # Reading Comprehension (3)
    {
        "assessment_type": "communication",
        "category": "reading_comprehension",
        "prompt": "Passage: 'Premature optimization often introduces architectural complexity without measurable latency reduction. Engineers should prioritize clean abstraction and profile actual bottlenecks.' What is the primary takeaway?",
        "options": [
            "Optimization should always happen before system design.",
            "Measure bottlenecks before complicating code with premature optimization.",
            "Clean abstraction prevents all latency problems.",
            "Profiling tools are unnecessary for small codebases.",
        ],
        "correct_option": "Measure bottlenecks before complicating code with premature optimization.",
        "difficulty": "medium",
    },
    {
        "assessment_type": "communication",
        "category": "reading_comprehension",
        "prompt": "What tone is conveyed in the statement: 'While the prototype proves the core thesis, production readiness requires comprehensive testing, error telemetry, and hardened authentication.'?",
        "options": ["Dismissive and cynical", "Objective and pragmatic", "Overly optimistic", "Hostile"],
        "correct_option": "Objective and pragmatic",
        "difficulty": "easy",
    },
    {
        "assessment_type": "communication",
        "category": "reading_comprehension",
        "prompt": "Passage: 'Asynchronous messaging decouples microservices, ensuring that peak upstream traffic does not instantly overwhelm downstream relational databases.' What mechanism provides the protection?",
        "options": ["Synchronous HTTP retry loops", "Decoupling through message queues buffering upstream spikes", "Replacing databases with in-memory arrays", "Hard limits on total user logins"],
        "correct_option": "Decoupling through message queues buffering upstream spikes",
        "difficulty": "medium",
    },
    # Business Communication (3)
    {
        "assessment_type": "communication",
        "category": "business_communication",
        "prompt": "When communicating an unexpected sprint delay to stakeholders, what is the best approach?",
        "options": [
            "Wait until the sprint ends to mention any missed deliverables.",
            "Proactively explain the cause, impact, updated timeline, and mitigation plan.",
            "Blame external dependencies without offering next steps.",
            "Reduce testing scope silently to meet the original date.",
        ],
        "correct_option": "Proactively explain the cause, impact, updated timeline, and mitigation plan.",
        "difficulty": "easy",
    },
    {
        "assessment_type": "communication",
        "category": "business_communication",
        "prompt": "Which subject line is most effective for a critical engineering incident update?",
        "options": [
            "Help needed!!",
            "Update regarding something important",
            "[Resolved] Auth API Latency Spike — Incident Post-Mortem",
            "Check this out ASAP",
        ],
        "correct_option": "[Resolved] Auth API Latency Spike — Incident Post-Mortem",
        "difficulty": "easy",
    },
    {
        "assessment_type": "communication",
        "category": "business_communication",
        "prompt": "Which response demonstrates constructive code review feedback?",
        "options": [
            "This logic is completely wrong, rewrite it.",
            "Consider extracting this validation into a helper function to avoid duplication and simplify unit testing.",
            "I wouldn't have written it this way.",
            "LGTM, didn't check details.",
        ],
        "correct_option": "Consider extracting this validation into a helper function to avoid duplication and simplify unit testing.",
        "difficulty": "easy",
    },
]

CODING_PROBLEMS = [
    {
        "title": "Array Sum & Target Pair",
        "difficulty": "easy",
        "prompt": "Write a function `two_sum(nums, target)` that returns the indices of two numbers such that they add up to the given target. Each input will have exactly one solution, and you may not use the same element twice.",
        "safe_evaluation_notes": "Static review in v1 evaluates algorithm structure, lookup approach (hash map / loop), return value handling, and boundary considerations safely.",
        "max_score": 20,
    },
    {
        "title": "First Unique Character & Frequency Map",
        "difficulty": "medium",
        "prompt": "Write a function `first_unique_char(s)` that finds the first non-repeating character in a string and returns its index. If it does not exist, return -1. Time complexity should be O(n).",
        "safe_evaluation_notes": "Static review evaluates frequency table / dictionary pattern, traversal loops, and return boundary checks.",
        "max_score": 35,
    },
    {
        "title": "Course Schedule & Dependency Feasibility",
        "difficulty": "hard",
        "prompt": "There are `numCourses` labeled 0 to `numCourses - 1`. You are given prerequisite pairs `[a, b]` meaning you must take course `b` before `a`. Write `can_finish(numCourses, prerequisites)` to determine if you can complete all courses (i.e., verify the dependency graph has no cycles).",
        "safe_evaluation_notes": "Static review inspects graph representation (adjacency list / in-degree array), cycle detection / topological sort structures (BFS/Kahn's or DFS visited states).",
        "max_score": 45,
    },
]

COMPANY_PREPARATIONS = [
    {
        "company_name": "Google",
        "focus_areas": ["DSA & Advanced Algorithms", "CS Fundamentals (OS, Networks, DBMS)", "System Design & Scalability", "Clean Code & Modularity", "Googleyness & Structured Problem Solving"],
        "source_label": "Gradient AI Tier-1 Preparation Benchmark",
        "source_date": "2026-08-12",
    },
    {
        "company_name": "Amazon",
        "focus_areas": ["DSA & Problem Solving", "Leadership Principles & Behavioral STAR stories", "Object-Oriented Design & Scalability", "Data Structures & Tree/Graph Traversal", "System Reliability & Operational Excellence"],
        "source_label": "Gradient AI Tier-1 Preparation Benchmark",
        "source_date": "2026-08-12",
    },
    {
        "company_name": "Microsoft",
        "focus_areas": ["DSA & Coding Speed", "Core Computer Science Concepts", "Software Architecture & Production Design", "Practical Project Portfolio Deep-Dive", "Collaborative Communication"],
        "source_label": "Gradient AI Tier-1 Preparation Benchmark",
        "source_date": "2026-08-12",
    },
    {
        "company_name": "Meta",
        "focus_areas": ["High-Speed Algorithmic Problem Solving", "System Design & High-Throughput Architectures", "Product Thinking & Practical Tradeoffs", "Complex Tree/Graph Data Structures", "Ownership & Impact"],
        "source_label": "Gradient AI Tier-1 Preparation Benchmark",
        "source_date": "2026-08-12",
    },
    {
        "company_name": "OpenAI",
        "focus_areas": ["Systems Engineering & Distributed Infrastructure", "Python / C++ Deep Fundamentals", "Machine Learning & Mathematical Intuition", "Research Communication & Problem Decomposition", "Independent Execution & Project Evidence"],
        "source_label": "Gradient AI Tier-1 Preparation Benchmark",
        "source_date": "2026-08-12",
    },
]


def seed_reference_data(db: Session) -> None:
    # Seed Aptitude & Communication questions if count is low
    existing_questions = {q.prompt: q for q in db.query(AssessmentQuestion).all()}
    questions_to_add = []
    for q_data in APTITUDE_QUESTIONS + COMMUNICATION_QUESTIONS:
        if q_data["prompt"] not in existing_questions:
            questions_to_add.append(AssessmentQuestion(**q_data))
    if questions_to_add:
        db.add_all(questions_to_add)

    # Seed Coding Problems
    existing_problems = {p.title: p for p in db.query(CodingProblem).all()}
    problems_to_add = []
    for p_data in CODING_PROBLEMS:
        if p_data["title"] not in existing_problems:
            problems_to_add.append(CodingProblem(**p_data))
    if problems_to_add:
        db.add_all(problems_to_add)

    # Seed Company Preparations
    existing_companies = {c.company_name: c for c in db.query(CompanyPreparation).all()}
    companies_to_add = []
    for c_data in COMPANY_PREPARATIONS:
        if c_data["company_name"] not in existing_companies:
            companies_to_add.append(CompanyPreparation(**c_data))
    if companies_to_add:
        db.add_all(companies_to_add)

    db.commit()


