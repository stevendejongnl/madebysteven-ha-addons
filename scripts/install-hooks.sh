#!/usr/bin/env bash
# Install git hooks — creates delegator wrappers in .git/hooks/ that call
# the tracked scripts in scripts/.
set -euo pipefail

ROOT="$(git rev-parse --show-toplevel)"

printf '#!/usr/bin/env bash\nexec "%s/scripts/pre-commit"\n' "$ROOT" > "$ROOT/.git/hooks/pre-commit"
printf '#!/usr/bin/env bash\nexec "%s/scripts/pre-push"\n'   "$ROOT" > "$ROOT/.git/hooks/pre-push"
chmod +x "$ROOT/.git/hooks/pre-commit" "$ROOT/.git/hooks/pre-push"

echo "✅ Git hooks installed"
