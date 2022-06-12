
from mephisto.abstractions.blueprints.parlai_chat.parlai_chat_task_builder import *

class ChatAndAnnotateTaskBuilder(ParlAIChatTaskBuilder):

    def build_and_return_custom_bundle(self, custom_src_dir):
        """Locate all of the custom files used for a custom build, create
        a prebuild directory containing all of them, then build the
        custom source.

        Check dates to only go through this build process when files have changes
        """
        TARGET_BUILD_FILES = {
            "main.js": "src/main.js",
            "package.json": "package.json",
            "style.css": "src/css/style.css",
            "index.html": "src/static/index.html",
            "notif.mp3": "src/static/notif.mp3"
        }
        TARGET_BUILD_FOLDERS = {"components": "src/components"}

        prebuild_path = os.path.join(custom_src_dir, CUSTOM_BUILD_DIRNAME)
        build_path = os.path.join(prebuild_path, "build", "bundle.js")

        # see if we need to rebuild
        if os.path.exists(build_path):
            created_date = os.path.getmtime(build_path)
            up_to_date = True
            for fn in TARGET_BUILD_FILES.keys():
                possible_conflict = os.path.join(custom_src_dir, fn)
                if os.path.exists(possible_conflict):
                    if os.path.getmtime(possible_conflict) > created_date:
                        up_to_date = False
                        break
            for fn in TARGET_BUILD_FOLDERS.keys():
                if not up_to_date:
                    break
                possible_conflict_dir = os.path.join(custom_src_dir, fn)
                for root, dirs, files in os.walk(possible_conflict_dir):
                    if not up_to_date:
                        break
                    for fname in files:
                        path = os.path.join(root, fname)
                        if os.path.getmtime(path) > created_date:
                            up_to_date = False
                            break
                if os.path.exists(possible_conflict):
                    if os.path.getmtime(possible_conflict) > created_date:
                        up_to_date = False
                        break
            if up_to_date:
                return build_path

        # build anew
        REQUIRED_SOURCE_FILES = [
            ".babelrc",
            ".eslintrc",
            "package.json",
            "webpack.config.js",
        ]
        REQUIRED_SOURCE_DIRS = ["src"]
        if not os.path.exists(os.path.join(prebuild_path, "build")):
            os.makedirs(os.path.join(prebuild_path, "build"), exist_ok=True)

        # Copy default files
        for src_dir in REQUIRED_SOURCE_DIRS:
            src_path = os.path.join(FRONTEND_SOURCE_DIR, src_dir)
            dst_path = os.path.join(prebuild_path, src_dir)
            if os.path.exists(dst_path):
                shutil.rmtree(dst_path)
            shutil.copytree(src_path, dst_path)
        for src_file in REQUIRED_SOURCE_FILES:
            src_path = os.path.join(FRONTEND_SOURCE_DIR, src_file)
            dst_path = os.path.join(prebuild_path, src_file)
            shutil.copy2(src_path, dst_path)

        if not os.path.exists(os.path.join(prebuild_path, "src", "css")):
            os.makedirs(os.path.join(prebuild_path, "src", "css"), exist_ok=True)

        # copy custom files
        for src_file in TARGET_BUILD_FILES.keys():
            src_path = os.path.join(custom_src_dir, src_file)
            if os.path.exists(src_path):
                dst_path = os.path.join(prebuild_path, TARGET_BUILD_FILES[src_file])
                shutil.copy2(src_path, dst_path)
        for src_dir in TARGET_BUILD_FOLDERS.keys():
            src_path = os.path.join(custom_src_dir, src_dir)
            dst_path = os.path.join(prebuild_path, TARGET_BUILD_FOLDERS[src_dir])
            if os.path.exists(src_path):
                if os.path.exists(dst_path):
                    shutil.rmtree(dst_path)
                shutil.copytree(src_path, dst_path)

        # navigate and build
        return_dir = os.getcwd()
        os.chdir(prebuild_path)
        packages_installed = subprocess.call(["npm", "install"])
        if packages_installed != 0:
            raise Exception(
                "please make sure npm is installed, otherwise view "
                "the above error for more info."
            )

        webpack_complete = subprocess.call(["npm", "run", "dev"])
        if webpack_complete != 0:
            raise Exception(
                "Webpack appears to have failed to build your "
                "frontend. See the above error for more information."
            )

        # cleanup and return
        os.chdir(return_dir)
        return build_path

    def build_in_dir(self, build_dir: str):
        super().build_in_dir(build_dir)

        target_resource_dir = os.path.join(build_dir, "static")
        custom_source_dir = self.args.blueprint.get("custom_source_dir", None)
        if custom_source_dir is not None:
            custom_source_dir = os.path.expanduser(custom_source_dir)

        # Copy over the static files for this task:
        for fin_file in ["index.html", "notif.mp3"]:
            copied_static_file = os.path.join(custom_source_dir, "_generated", "src", "static", fin_file)
            target_path = os.path.join(target_resource_dir, fin_file)
            shutil.copy2(copied_static_file, target_path)