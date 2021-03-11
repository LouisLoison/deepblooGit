import sys
import os

# Setting library paths.
efs_path = "/mnt/efs"
python_pkg_path = os.path.join(efs_path, "lib/python")
sys.path.append(python_pkg_path)
