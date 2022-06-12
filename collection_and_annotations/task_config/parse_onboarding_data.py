import os, json
import openpyxl
import pandas as pd
from pathlib import Path
import numpy as np

alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
selection_mapping = {'grammar': {'x': {"grammar_q": "This response is uninterpretable."}},
             'commonsense':  {'x': {"commonsense_q": "This response contradicts common knowledge."}},
             'sociality':  {'x': {"sociality_q": "This response exhibits antisocial behavior."}},
             'empathy': {
                 'empathy': {"Is this response empathetic?": "Yes, the speaker demonstrates an understanding of their partner's emotions."},
                 'lack': {"Is this response empathetic?": "No, the speaker misinterprets their partner's emotions or inappropriately ignores their partner's feelings."},
                 'na': {"Is this response empathetic?": "Not applicable, the speaker neither shows an understanding or misunderstanding of their partner's emotions."},
             },
             "personal_information": {
                'value': {"value_q": "This response shares information about the speaker's preferences/values."},
                 'life': {"experience_q": "This response shares information about the speaker's life."}
             }}
list_mapping = {'consistency_label': 'consistency_label_labels'}
record_bot_persona = ['consistency_label']

FILES = ['grammar', 'sociality', 'commonsense', 'knowledge', 'consistency_label', 'transitions', 'empathy', 'personal_information']
# FILES = FILES[:-1]
# FILES = [FILES[3]]


PASS_DEFAULT = 0
PASS_BY_TASK = {
    'grammar': 1,
    'sociality': 1,
    'knowledge': 2,
    'personal_information': 2,
    'empathy': 2,
    'commonsense': 2,
    'consistency_label': 2,
    'transitions': 2
}

FINAL_NAME_MAPPING = {
    'grammar': 'interpretability',
    'consistency_label': 'consistency'
}

if __name__ == '__main__':
    dir = Path('onboarding_data')
    for file in FILES:
        onboarding_tasks = {}
        task = file
        file_path = dir / (file + '.xlsx')
        content = openpyxl.load_workbook(file_path)
        num_sheets = len(content.sheetnames)
        for idx, sheet in enumerate(content):
            data = pd.read_excel(file_path, sheet_name=sheet.title).replace({np.nan: None})

            dialogue_id = f'{task}_onboarding_{sheet.title}'
            onboarding_task = {"dialogue_id": dialogue_id,
                               "annotation_tasks": [task],
                               "bot_persona": [] if task not in record_bot_persona else [x.strip() for x in data["persona"][0].split('\n')],
                               "turns": [],
                               "pass_criteria": PASS_BY_TASK.get(file, PASS_DEFAULT),
                               "remaining": num_sheets - idx - 1}

            selections = data['selection']
            explanations = data['explanation']
            turns = data['turn']

            header = data.head()
            if 'LegendQ' in header and 'LegendA' in header:
                legendq = data['LegendQ']
                legenda = data['LegendA']

            for i, (s, e, t) in enumerate(zip(selections, explanations, turns)):
                agent = 'system' if i % 2 else 'user'
                if task in selection_mapping:
                    if s is not None:
                        selections = [x.strip() for x in s.split(',')]
                        converted_selections = {}
                        for sel in selections:
                            if sel in selection_mapping[task]:
                                converted_selections.update(selection_mapping[task][sel])
                            else:
                                raise Exception(f'Failed to parse {task} onboarding selection: {sel}')
                        if task == 'personal_information':
                            for opt, conversion in selection_mapping[task].items():
                                q_key = list(conversion.keys())[0]
                                if q_key not in converted_selections:
                                    converted_selections[q_key] = ''
                        s = converted_selections
                elif task in list_mapping:
                    if s is not None:
                        s = {list_mapping[task]: [x.strip() for x in s.split(',')]}
                else:
                    if s is not None:
                        selection_options = s.split('\n')
                        converted_selections = []
                        for opt in selection_options:
                            converted_opt = {}
                            items = opt.strip().split(',')
                            for item in items:
                                q, a = item.strip().split(':')
                                q = q.strip()
                                a = a.strip()
                                question_str = legendq[int(q[1:])-2]
                                answer_str = legenda[int(a[1:])-2]
                                converted_opt[question_str] = answer_str
                            converted_selections.append(converted_opt)
                        if len(converted_selections) > 1:
                            s = {'_disjunction' : True, 'options': converted_selections}
                        else:
                            s = converted_selections[0]
                s = s if s is not None else {}
                t = t.replace(" ' ", "'").replace(" ,", ",").replace(" .", ".").replace(" ?", "?").replace(" !", "!")
                turn_data = [agent, t, s, e] if e is not None else [agent, t]
                onboarding_task["turns"].append(turn_data)
            onboarding_tasks[dialogue_id] = onboarding_task
        json.dump(onboarding_tasks, open(f'onboarding_data/{FINAL_NAME_MAPPING.get(task, task)}.json', 'w'), indent=2)
