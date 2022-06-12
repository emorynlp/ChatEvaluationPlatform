import os, json

def convert(directory, outfile, annotation_tasks, files=None, num=-1):
    dialogues = []
    user_start = "Enter Your Message: "
    system_start = "[TransformerGenerator]: "
    system_persona = "partner's persona: "

    if files is None:
        files = sorted(os.listdir(directory))

    for file in files:
        if '.txt' in file:
            with open(os.path.join(directory, file), 'r') as f:
                d = {'dialogue_id': f'{outfile}_{file.replace(".txt", "")}',
                     'annotation_tasks': [annotation_tasks[len(dialogues) % len(annotation_tasks)]],
                     'turns': [],
                     'bot_persona': []}
                for line in f:
                    if line.startswith(user_start):
                        speaker = "user"
                        turn = line[len(user_start):].strip()
                        d['turns'].append([speaker, turn])
                    elif line.startswith(system_start):
                        speaker = "system"
                        turn = line[len(system_start):].strip()
                        d['turns'].append([speaker, turn])
                    elif line.startswith(system_persona):
                        turn = line[len(system_persona):].strip()
                        d['bot_persona'].append(turn.strip())
                dialogues.append(d)
    to_file = dialogues[:num] if num > -1 else dialogues
    with open(outfile + '.jsonl', 'w+') as f:
        for d in to_file:
            sjson = json.dumps(d)
            f.write(sjson + '\n')


if __name__ == '__main__':
    annot_tasks = ["grammar", "sociality", "commonsense", "knowledge", "consistency_label", "transitions"]
    files = ["dialogue16.txt", "dialogue10.txt", "dialogue8.txt", "dialogue15.txt", "dialogue7.txt", "dialogue9.txt"]
    convert('blenderbot_90M', 'pilot3', num=6, annotation_tasks=annot_tasks, files=files)