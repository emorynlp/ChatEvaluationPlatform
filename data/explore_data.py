
from analysis import project_data

if __name__ == '__main__':
    # The human labels are in project_data.surge_evaluation
    # which is an `Evaluation` object (defined in `evaluation_data_definitions.py`)
    human_label_project = project_data.surge_evaluation

    # dialogues are stored in dictionary `.dialogues`
    for dialogue_id, dialogue in list(human_label_project.dialogues.items())[:2]:
        print(f"Dialogue: {dialogue_id}")
        # turns are stored in list `.turns`
        # each turn is a `TurnPair` object (defined in `evaluation_data_definitions.py`)
        for i, turn in enumerate(dialogue.turns):
            print('-' * 40 + f"\n\tTurn {i+1}\n" + '-'*40)
            # each turn contains a user utterance and the subsequent bot utterance
            print(f"\tUser: {turn.user_turn}")  # what the user said
            print(f"\tSystem: {turn.bot_turn}")  # what the bot said
            for behavior, annotations in turn.behavior_annotations.items():
                # some dialogues were annotated by more than one human, so we look at the list of annotations
                # a score of 1 means the behavior is present in the bot_turn
                # otherwise, it is a score of 0
                scores = [str(annot.score) for annot in annotations]
                print(f"\t\t{behavior:25} [{','.join(scores)}]")
            print()
        print()
        print('#'*100)
        print()


