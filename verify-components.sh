
echo "Verifying SlotSearch and SlotResults components..."

# Check if files exist
if [ -f "/workspace/frontend/src/components/slots/SlotSearch.jsx" ]; then
  echo "[CHECK] SlotSearch.jsx exists"
else
  echo "[ERROR] SlotSearch.jsx is missing"
fi

if [ -f "/workspace/frontend/src/components/slots/SlotResults.jsx" ]; then
  echo "[CHECK] SlotResults.jsx exists"
else
  echo "[ERROR] SlotResults.jsx is missing"
fi

# Check for key security features in SlotSearch
echo "Checking SlotSearch.jsx for security features..."
grep -q "yup.object().shape" "/workspace/frontend/src/components/slots/SlotSearch.jsx" && echo "[CHECK] Input validation schema found" || echo "[ERROR] Missing input validation"
grep -q "debounce" "/workspace/frontend/src/components/slots/SlotSearch.jsx" && echo "[CHECK] Debounce protection found" || echo "[ERROR] Missing debounce protection"
grep -q "setError" "/workspace/frontend/src/components/slots/SlotSearch.jsx" && echo "[CHECK] Error handling found" || echo "[ERROR] Missing error handling"
grep -q "MAX_SEARCHES_PER_MINUTE" "/workspace/frontend/src/components/slots/SlotSearch.jsx" && echo "[CHECK] Rate limiting found" || echo "[ERROR] Missing rate limiting"

# Check for key security features in SlotResults
echo "Checking SlotResults.jsx for security features..."
grep -q "DOMPurify.sanitize" "/workspace/frontend/src/components/slots/SlotResults.jsx" && echo "[CHECK] XSS protection found" || echo "[ERROR] Missing XSS protection"
grep -q "PropTypes" "/workspace/frontend/src/components/slots/SlotResults.jsx" && echo "[CHECK] Type validation found" || echo "[ERROR] Missing type validation"
grep -q "try {" "/workspace/frontend/src/components/slots/SlotResults.jsx" && echo "[CHECK] Error handling found" || echo "[ERROR] Missing error handling"

echo "Verification complete."
