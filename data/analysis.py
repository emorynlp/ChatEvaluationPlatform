
import json
from cattrs import structure
from data.evaluation_data_definitions import Project
from pathlib import Path

with open(Path(__file__).parent / 'data.json') as f:
    json_data = json.load(f)
    project_data = structure(json_data, Project)


class sym:

    category = 'category'
    label = 'label'
    bot = 'bot'
    bot_cmp = 'bot comp'
    item = 'item'
    stat = 'stat'


    def __call__(self):
        return [
            v for k, v in self.__class__.__dict__.items()
            if not k.startswith('__')
        ]

    def __iter__(self):
        return iter(self())

    def __contains__(self, item):
        return item in self()


class behavior(sym):
    antisocial = 'antisocial'
    common_contra = 'commonsense contradiction'
    partner_contra = 'partner contradiction'
    self_contra = 'self contradiction'
    ignore = 'ignore'
    incorrect_fact = 'incorrect fact'
    correct_fact = 'correct fact'
    irrelevant = 'irrelevant'
    redundant = 'redundant'
    lack_empathy = 'lack of empathy'
    uninterpretable = 'uninterpretable'
    empathetic = 'empathetic'
    follow_up = 'follow up'
    topic_switch = 'topic switch'
    life_info = 'life info'
    preference_info = 'preference info'
behavior = behavior()

class scale(sym):
    consistent = 'consistent'
    engaging = 'engaging'
    emotional = 'emotional'
    grammatical = 'grammatical'
    informative = 'informative'
    proactive = 'proactive'
    quality = 'quality'
    relevant = 'relevant'
scale = scale()

class category(sym):
    likert_dialogue = 'likert dialogue'
    likert_turn = 'likert turn'
    comparative = 'comparative'
    behavior = 'behavior'

class bot(sym):
    blender2 = 'blender2_3B'
    emora = 'emora'
    bart_fid_rag = 'bart_fid_rag_bcb'
    raranked_blender = 'rerank_blender'
    reranked_blender2 = 'rerank_blender2'
    cem = 'cem'
    dukenet = 'dukenet'
bot = bot()

class stat(sym):
    fleiss_kappa = "Fleiss' kappa"
    kripp_alpha = "Krippendorff's alpha"
    kend_tau = "Kendall's tau"
    mcfad_r2 = "McFadden's pseudo-R-squared"
    r2 = "R-Squared"
    ci_low = "CI low"
    ci_high = "CI high"
    proportion = 'proportion'
    mean = 'mean'
    n = 'n'
    likert_dialogue_quality = 'likert dialogue quality'
    likert_turn_quality = 'likert turn quality'
    p_of_f_test = 'P value of F-test'
    p_of_llr_test = 'P value of LLR-test'

class stage:
    annotation_pilots = 'annotation_pilots'
    annotation_pilots_onboarding = 'annotation_pilots_onboarding'
    bot_pilots = 'bot_pilots'
    extra_unused = 'extra_unused'
    dialogue_collection = 'dialogue_collection'
    student_evaluation = 'student_evaluation'
    student_onboarding = 'student_onboarding'
    student_gold_units = 'student_gold_units'
    mturk_evaluation = 'mturk_evaluation'
    mturk_onboarding = 'mturk_onboarding'
    mturk_gold_units = 'mturk_gold_units'
    surge_evaluation = 'surge_evaluation'
    surge_onboarding = 'surge_onboarding'
    surge_gold_units = 'surge_gold_units'
    expert_evaluation = 'expert_evaluation'

annot_abbrev = {
    'grammatical': 'Gra',
    'quality': 'Qua',
    'engaging': 'Eng',
    'proactive': 'Pro',
    'informative': 'Inf',
    'relevant': 'Rel',
    'consistent': 'Con',
    'emotional': 'Emo',
    'topic switch': 'Top',
    'incorrect fact': '!Fac',
    'life info': 'Lif',
    'correct fact': 'Fac',
    'ignore': 'Ign',
    'antisocial': '!Soc',
    'redundant': 'Red',
    'empathetic': 'Emp',
    'follow up': 'Fol',
    'preference info': 'Pre',
    'irrelevant': '!Rel',
    'commonsense contradiction': '!Com',
    'partner contradiction': '!Par',
    'lack of empathy': '!Emp',
    'self contradiction': '!Sel',
    'uninterpretable': '!Int'
}


__all__ = [

    # the data
    'project_data',

    # symbols
    'sym',
    'scale',
    'behavior',
    'category',
    'stage',
    'bot',
    'stat',
    'annot_abbrev',

]


