

import pandas as pd
from attrs import define, field
from cattrs import structure, unstructure
import typing as T

list_field = field(factory=list)
dict_field = field(factory=dict)

@define
class SubtaskDurations:
    first_bot: float = -1.0
    second_bot: float = -1.0
    first_likert: float = -1.0
    second_likert: float = -1.0
    comparative: float = -1.0

@define
class WorkUnit:
    id: str = None
    worker_id: str = None
    time_to_complete_sec: T.Union[float, None] = None
    task: str = None
    labels: T.List[str] = list_field
    dialogue_ids: T.List[str] = list_field
    subtask_durations: T.Union[SubtaskDurations, None] = None
    completion_date: str = ''


@define
class LikertAnnotation:
    work_unit_id: str = None
    label: str = None
    score: int = None


@define
class BehaviorAnnotation:
    work_unit_id: str = None
    label: str = None
    score: int = None


@define
class ComparativeAnnotation:
    work_unit_id: str = None
    label: str = None
    dialogue_compared_to_id: str = None
    score: int = None
    bot: str = None
    bot_compared_to: str = None


@define
class TrainingResult:
    work_unit_id: str = None
    mistakes: T.Union[T.List[int], None] = list_field
    performance: T.Union[float, None] = None
    passed: T.Union[bool, None] = None


@define
class TurnPair:
    user_turn: str = None
    bot_turn: str = None
    likert_annotations: T.Dict[str, T.List[LikertAnnotation]] = dict_field
    behavior_annotations: T.Dict[str, T.List[BehaviorAnnotation]] = dict_field


@define
class Dialogue:
    dialogue_id: str = None
    bot: str = None
    comparative_annotations: T.Dict[str, T.List[ComparativeAnnotation]] = dict_field
    likert_annotations: T.Dict[str, T.List[LikertAnnotation]] = dict_field
    turns: T.List[TurnPair] = list_field

    def all_likert_dialogue_annotations(self):
        for label, annotations in self.likert_annotations.items():
            for annotation in annotations:
                yield self.dialogue_id, annotation

    def all_comparative_annotations(self):
        for label, annotations in self.comparative_annotations.items():
            for annotation in annotations:
                yield self.dialogue_id, annotation

    def all_likert_turn_annotations(self):
        for i, turn in enumerate(self.turns):
            turn_id = (self.dialogue_id, i)
            for label, annotations in turn.likert_annotations.items():
                for annotation in annotations:
                    yield turn_id, annotation

    def all_behavior_annotations(self):
        for i, turn in enumerate(self.turns):
            turn_id = (self.dialogue_id, i)
            for label, annotations in turn.behavior_annotations.items():
                for annotation in annotations:
                    yield turn_id, annotation

    def annotations(self):
        return {
            'likert dialogue': list(self.all_likert_dialogue_annotations()),
            'comparative': list(self.all_comparative_annotations()),
            'likert turn': list(self.all_likert_turn_annotations()),
            'behavior': list(self.all_behavior_annotations())
        }


@define
class OnboardingDialogue(Dialogue):
    attempts: T.List[TrainingResult] = list_field


@define
class Evaluation:
    dialogues: T.Dict[str, Dialogue] = dict_field
    work_units: T.Dict[str, WorkUnit] = dict_field

    def likert_dialogue_annotations(self):
        for _, dialogue in self.dialogues.items():
            yield from dialogue.all_likert_dialogue_annotations()

    def comparative_annotations(self):
        for _, dialogue in self.dialogues.items():
            yield from dialogue.all_comparative_annotations()

    def likert_turn_annotations(self):
        for _, dialogue in self.dialogues.items():
            yield from dialogue.all_likert_turn_annotations()

    def behavior_annotations(self):
        for _, dialogue in self.dialogues.items():
            yield from dialogue.all_behavior_annotations()

    def annotations(self):
        return {
            'likert dialogue': list(self.likert_dialogue_annotations()),
            'comparative': list(self.comparative_annotations()),
            'likert turn': list(self.likert_turn_annotations()),
            'behavior': list(self.behavior_annotations())
        }

    def annotation_dataframe(self):
        marks = {}
        for label_category, annotations in self.annotations().items():
            for item, annotation in annotations:
                did, tid = item if isinstance(item, tuple) else (item, None)
                bot = self.dialogues[did].bot
                marks.setdefault(
                    (bot, label_category, annotation.label, item), []
                ).append(annotation.score)
        df = pd.DataFrame(marks.values(), marks)
        df.index.set_names(['bot', 'category', 'label', 'item'], inplace=True)
        return df

    def comparative_annotation_dataframe(self):
        marks = {}
        for item, annotation in self.comparative_annotations():
            bot1 = annotation.bot
            bot2 = annotation.bot_compared_to
            item = (item, annotation.dialogue_compared_to_id)
            marks.setdefault(
                (bot1, bot2, annotation.label, item), []
            ).append(annotation.score)
        df = pd.DataFrame(marks.values(), marks)
        df.index.set_names(['bot', 'bot comp', 'label', 'dialogues'], inplace=True)
        return df

    def timing_dataframe(self):
        timings = {}
        for label_category, annotations in self.annotations().items():
            for item, annotation in annotations:
                work_unit = self.work_units[annotation.work_unit_id]
                if label_category == 'comparative':
                    assert len(work_unit.dialogue_ids) == 2
                    mid = '|'.join(work_unit.dialogue_ids)
                else:
                    assert len(work_unit.dialogue_ids) == 1
                    mid = work_unit.dialogue_ids[0]
                timings.setdefault(
                    (label_category, ', '.join(work_unit.labels), mid), set()
                ).add(work_unit.time_to_complete_sec)
        flattened = {}
        for key, values in timings.items():
            if len(values) > 1: # utilize doubly annotated timing results
                extracted = values.pop()
                if len(values) > 1:
                    timings[key] = {values.pop()}
                new_key = (key[0], key[1], key[2]+'_2')
                flattened[new_key] = {extracted}
        timings.update(flattened)
        df = pd.DataFrame(timings.values(), timings)
        df.index.set_names(['category', 'labels', 'id'], inplace=True)
        df.columns = ['completion time (sec)']
        return df

    def onboarding_timing_dataframe(self):
        timings = {}
        for label_category, annotations in self.annotations().items():
            for item, annotation in annotations:
                work_unit = self.work_units[annotation.work_unit_id]
                if label_category == 'comparative':
                    assert len(work_unit.dialogue_ids) == 2
                    mid = '|'.join(work_unit.dialogue_ids)
                else:
                    assert len(work_unit.dialogue_ids) == 1
                    mid = work_unit.dialogue_ids[0]
                timings.setdefault(
                    (label_category, ', '.join(work_unit.labels), work_unit.worker_id), set()
                ).add(work_unit.time_to_complete_sec)
        for key, values in timings.items():
            assert len(values) == 3
            timings[key] = sum(values)
        # flattened = {}
        # for key, values in timings.items():
        #     extracted = values.pop()
        #     timings[key] = {extracted}
        #     suffix = 2
        #     while (len(values)) > 1: # separate out all onboarding attempts
        #         extracted = values.pop()
        #         new_key = (key[0], key[1], key[2]+f'_{suffix}')
        #         suffix += 1
        #         flattened[new_key] = {extracted}
        # timings.update(flattened)
        df = pd.DataFrame(timings.values(), timings)
        df.index.set_names(['category', 'labels', 'id'], inplace=True)
        df.columns = ['completion time (sec)']
        return df

    def interactive_timing_dataframe(self):
        timings = {}
        for id, unit in self.work_units.items():
            assert len(unit.dialogue_ids) == 2
            timings[('dialogue', 'collect', unit.dialogue_ids[0])] = unit.subtask_durations.first_bot
            timings[('dialogue', 'collect', unit.dialogue_ids[1])] = unit.subtask_durations.second_bot
            timings[('interactive likert', ', '.join(unit.labels), unit.dialogue_ids[0])] = unit.subtask_durations.first_likert
            timings[('interactive likert', ', '.join(unit.labels), unit.dialogue_ids[1])] = unit.subtask_durations.second_likert
            timings[('interactive comparative', ', '.join(unit.labels), '|'.join(unit.dialogue_ids))] = unit.subtask_durations.comparative
        df = pd.DataFrame(timings.values(), timings)
        df.index.set_names(['category', 'labels', 'id'], inplace=True)
        df.columns = ['completion time (sec)']
        return df

    def annotation_counts(self):
        """
        :return: Dataframe of number of dialogues annotated per category label
        """
        # {(category, label): list of annotated dialogues}
        annotated = {}
        # {(category, label): {'dialogues annotated': int, 'double annotated': int}}
        annotated_counts = {}
        for category, annotations in self.annotations().items():
            for item, annotation in annotations:
                did, tid = item if isinstance(item, tuple) else (item, 0)
                if not tid:
                    annotated.setdefault(
                        (category, annotation.label), []
                    ).append(did)
        for (category, label), annotations in annotated.items():
            unique_annotated = set(annotations)
            num_annotated = len(unique_annotated)
            for ua in unique_annotated:
                annotations.remove(ua)
            num_double_annotated = len(set(annotations))
            annotated_counts[(category, label)] = {
                'dialogues annotated': num_annotated if 'comparative' not in category else num_annotated / 2,
                'double annotated': num_double_annotated if 'comparative' not in category else num_double_annotated / 2
            }
        return pd.DataFrame(annotated_counts.values(), annotated_counts)

@define
class OnboardingEvaluation(Evaluation):
    dialogues: T.Dict[str, OnboardingDialogue] = dict_field
    work_units: T.Dict[str, WorkUnit] = dict_field


@define
class Project:
    annotation_pilots: T.List[Evaluation] = list_field
    annotation_pilots_onboarding: T.List[OnboardingEvaluation] = list_field
    bot_pilots: T.List[Evaluation] = list_field
    extra_unused: T.Union[Evaluation, None] = None
    dialogue_collection: T.Union[Evaluation, None] = None
    student_evaluation: T.Union[Evaluation, None] = None
    student_onboarding: T.Union[OnboardingEvaluation, None] = None
    student_gold_units: T.Union[Evaluation, None] = None
    mturk_evaluation: T.Union[Evaluation, None] = None
    mturk_onboarding: T.Union[OnboardingEvaluation, None] = None
    mturk_gold_units: T.Union[Evaluation, None] = None
    surge_evaluation: T.Union[Evaluation, None] = None
    surge_onboarding: T.Union[OnboardingEvaluation, None] = None
    surge_gold_units: T.Union[Evaluation, None] = None
    expert_evaluation: T.Union[Evaluation, None] = None



__all__ = [
    "WorkUnit",
    "LikertAnnotation",
    "BehaviorAnnotation",
    "ComparativeAnnotation",
    "TrainingResult",
    "TurnPair",
    "Dialogue",
    "OnboardingDialogue",
    "Evaluation",
    "OnboardingEvaluation",
    "Project"
]

if __name__ == '__main__':

    t = Evaluation()
    print(unstructure(t))
