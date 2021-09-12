@ECHO OFF
ECHO "Cleaning build directory"
RMDIR /s build
ECHO "Creating declaration files"
CALL tsc --declaration --emitDeclarationOnly
ECHO "Creating browser files"
CALL tsc --module ES2015 --target ES2015 --outdir build/browser
ECHO "Creating Node files"
CALL tsc --outdir build/node
