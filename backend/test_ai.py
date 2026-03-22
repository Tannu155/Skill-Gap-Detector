from ai_explainer import generate_ai_explanation

result = generate_ai_explanation(
    'Rahul',
    'Data Analyst',
    [{'skill':'Python','your_level':'Beginner','required_level':'Intermediate','impact_label':'Critical'}],
    []
)
print(result)
