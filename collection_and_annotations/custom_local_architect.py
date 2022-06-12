from mephisto.abstractions.architects.local_architect import LocalArchitect
from mephisto.abstractions.architects.router.build_router import CROWD_SOURCE_PATH
import os, signal, shutil

class CustomLocalArchitect(LocalArchitect):
    """
    Same as LocalArchitect, except:
        Does not delete local server files in Mephisto/tmp/
    """

    def prepare(self) -> str:
        """ Overwrite of wrap_crowd_source.js copy to remove alert on submit for mock runs """
        local_server_directory_path = super().prepare()

        # path to original crowd source file
        local_crowd_source_path = os.path.join(
            local_server_directory_path, CROWD_SOURCE_PATH
        )

        # Delete line: alert("The task has been submitted! Data: " + JSON.stringify(task_data));
        with open(local_crowd_source_path, 'r') as f:
            text = f.read()
            updated_text = text.replace('alert("The task has been submitted! Data: " + JSON.stringify(task_data));', '')
        with open(local_crowd_source_path, 'w') as f:
            f.write(updated_text)

        return local_server_directory_path

    # def shutdown(self) -> None:
    #     """Find the server process, shut it down, then remove the build directory"""
    #     assert self.running_dir is not None, "shutdown called before deploy"
    #     if self.server_process is None:
    #         assert self.server_process_pid is not None, "No server id to kill"
    #         os.kill(self.server_process_pid, signal.SIGTERM)
    #     else:
    #         self.server_process.terminate()
    #         self.server_process.wait()