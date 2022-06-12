import os, json, time, weakref
from typing import List, Optional, Dict, Any, Tuple, TYPE_CHECKING

if TYPE_CHECKING:
    from mephisto.data_model.agent import Agent
    from mephisto.data_model.packet import Packet

from mephisto.data_model.packet import (
    PACKET_TYPE_AGENT_ACTION,
    PACKET_TYPE_UPDATE_AGENT_STATUS,
)

from mephisto.abstractions.blueprints.parlai_chat.parlai_chat_agent_state import ParlAIChatAgentState

ANNOTATIONS = 'annotations'
FINAL_CHAT_DATA = 'final_chat_data'

from mephisto.abstractions.blueprint import AgentState
DISALLOWED_RECONNECT = 'disallowed_reconnect'
DISALLOWED_CONCURRENT = 'disallowed_concurrent'
MAX_UNITS = "max_units"
COMPLETED = "completed"
GOPEN = "gopen"
XSCREEN = "xscreen"
CUSTOM_ERRORS = [DISALLOWED_RECONNECT, DISALLOWED_CONCURRENT, MAX_UNITS, COMPLETED, GOPEN, XSCREEN]

class ChatAndAnnotateAgentState(ParlAIChatAgentState):

    @property
    def messages(self):
        return self.data['messages']

    @messages.setter
    def messages(self, value):
        self.data['messages'] = value

    def __init__(self, agent: "Agent"):
        self.agent = weakref.proxy(agent)
        if not os.path.exists(self._get_expected_data_file()):
            # initialize .data to override superclass .messages
            self.data: Dict[str, Any] = {'messages': []}
        super().__init__(agent)
        self.do_interactive_offline_annotations_randomized = None

    def get_init_state(self) -> Optional[Dict[str, Any]]:
        """
        Removed the addition of raw_messages from super because it was causing
        duplicate initial turns to happen
        """
        if self.init_data is None:
            return None
        return {"task_data": self.init_data}

    def load_data(self) -> None:
        agent_file = self._get_expected_data_file()
        with open(agent_file, "r") as state_json:
            state = json.load(state_json)
            self.data = state["outputs"]
            self.init_data = state["inputs"]

    def get_data(self) -> Dict[str, Any]:
        return {"outputs": self.data, "inputs": self.init_data}

    def get_parsed_data(self) -> Dict[str, Any]:
        parsed_data = super().get_parsed_data()
        # parsed_data["messages"] = [m for m in parsed_data["messages"] if
        parsed_data["other_data"] = {k: v for k, v in self.data.items() if k != 'messages'}
        return parsed_data

    def update_data(self, packet: "Packet") -> None:
        message_data = packet.to_sendable_dict()
        message_data["timestamp"] = time.time()
        if message_data["packet_type"] in {PACKET_TYPE_AGENT_ACTION, PACKET_TYPE_UPDATE_AGENT_STATUS}:
            if message_data["data"].get("packet_type", "") == ANNOTATIONS:
                self.data.setdefault("annotations", {}).update(message_data["data"]["data"])
            else:
                # if "beam_texts" in message_data.get("data", {}):
                #     del message_data["data"]["beam_texts"]
                self.messages.append(message_data)
        else:
            print(' ### OTHER PACKET ### ')
            print(message_data)
            self.messages.append(message_data)
        self.save_data()
