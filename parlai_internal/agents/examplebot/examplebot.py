
from parlai.core.agents import Agent
import random
from pathlib import Path

class ExamplebotAgent(Agent):

    def __init__(self, opt, shared=None):
        super().__init__(opt, shared)
        self.context = []
        self.used_quote_idx = set()
        if shared is None:
            parent = Path(__file__).resolve().parent
            self.quotes = open(parent / 'quotes.txt').readlines() # quotes from https://gist.github.com/robatron/a66acc0eed3835119817
        else:
            self.quotes = shared['quotes']

    def share(self):
        shared = super().share()
        shared['quotes'] = self.quotes
        return shared

    def observe(self, observation):
        obs = super().observe(observation["text"])
        self.context.append(obs)

    def act(self):
        quote_idx_unused = list(set(range(len(self.quotes))) - self.used_quote_idx)
        if len(quote_idx_unused):
            chosen_idx = random.choice(quote_idx_unused)
            chosen_quote = self.quotes[chosen_idx]
        else:
            chosen_quote = "Goodbye!"
        return {'text': chosen_quote}
