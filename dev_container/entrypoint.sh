#!/bin/sh
# * The #!/bin/sh shebang specifies that the script should be run with the /bin/sh shell,
#   which is a standard shell in many Unix-like operating systems.

# * The file is executed from the WORKDIR directory as defined in the Dockerfile so the path to files are relative
#   to WORKDIR and not to the file's position

# * Notice that the EOL character of this file must be UNIX style (LF) otherwise you will get an error when the
#   script runs in the container

# set -e sets a shell option to immediately exit if any command being run exits with a non-zero exit code.
# The script will return with the exit code of the failing command.
set -e

# the main command to run when the container starts.
npm start

# It basically takes all the extra command line arguments and execs them as a command. The intention is basically
# "Do everything in this .sh script, then in the same shell run the command the user passes in on the command line".
exec "$@"
