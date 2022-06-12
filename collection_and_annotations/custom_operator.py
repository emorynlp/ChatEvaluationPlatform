from mephisto.operations.operator import Operator, threading
from custom_supervisor import CustomSupervisor

class CustomOperator(Operator):

    def __init__(self, db):
        """
        Uses CustomSupervisor instead of original to support getting init data
        for OnboardingAgents
        """
        super().__init__(db)
        self.supervisor = CustomSupervisor(db)

