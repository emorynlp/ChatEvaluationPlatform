
from typing import List, Optional, Mapping, Dict, Any, TYPE_CHECKING, IO

import json
from dataclasses import dataclass


@dataclass
class InitializationData:
    shared: Dict[str, Any]
    unit_data: List[Dict[str, Any]]
    id: str

    def dumpJSON(self, fp: IO[str]):
        return json.dump({"id": self.id, "shared": self.shared, "unit_data": self.unit_data}, fp)

    @staticmethod
    def loadFromJSON(fp: IO[str]):
        as_dict = json.load(fp)
        return InitializationData(
            id=as_dict["id"], shared=as_dict["shared"], unit_data=as_dict["unit_data"]
        )